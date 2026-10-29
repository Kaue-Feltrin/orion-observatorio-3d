/**
 * Órion Fichas v0.6.0 · PR103 — revisão canônica SOMENTE LEITURA de Júnior.
 * Manual Consolidado v0.21 > Suplemento Órion 1.9.3.1 p.15 > Arquivos
 * Secretos > Sobrevivendo ao Horror > Livro Base. A regra específica
 * de Júnior está no Suplemento. Não concede item, categoria ou modificação.
 */
import {reviewLifeStage} from './life-stage-review.mjs';
import {reviewEquipment,limitsForPatent} from './loadout-review.mjs';
import {juniorAdjustedCategoryLimits} from './life-stage-effects.mjs';

const CATS=Object.freeze([1,2,3,4]);
const BASE={version:1,trait:'JUNIOR',applied:false,grant:false,
 canCommit:false,activationApproved:false,freeModificationGranted:false,
 categoryChangeApplied:false,currentResourcesChanged:false};

function safeCounts(input){
 if(!input||typeof input!=='object')return null;
 if(!CATS.every(c=>Number.isSafeInteger(input[c])&&input[c]>=0))return null;
 return Object.fromEntries(CATS.map(cat=>[cat,input[cat]]));
}
function fail(code,source){
 return {...BASE,status:code,sourceRef:source,quota:null,
  freeModification:null,issues:[code]};
}

/** Só consome dados já revisados no Worker, nunca números/categorias do cliente. */
export function preflightJuniorEquipment(character){
 const age=reviewLifeStage(character);
 if(age.stage!=='PRODIGIO')return {...BASE,status:'not-applicable',sourceRef:null,
  quota:null,freeModification:null,issues:[]};
 if(!age.intentValid||age.effectsPreview?.trait!=='JUNIOR'){
  const status=age.intentValid&&age.effectsPreview?.trait!=='JUNIOR'?
   'not-junior':'invalid-life-intent';
  return {...BASE,status,sourceRef:null,quota:null,freeModification:null,
   issues:status==='invalid-life-intent'?age.issues.map(i=>i.code):[]};
 }
 const preview=age.effectsPreview;
 const equipment=reviewEquipment(character);
 const sourceRef=preview.source;
 const {code:patent,limits:base}=limitsForPatent(character.patent);
 const expected=juniorAdjustedCategoryLimits(preview,base);
 const baseLimits=safeCounts(base),limits=safeCounts(equipment.limits),
  counts=safeCounts(equipment.counts);
 if(!expected||!baseLimits||!limits||!counts||
   !equipment.lifeStageCategory||
   equipment.lifeStageCategory.reducedCategory!==expected.reducedCategory||
   !CATS.every(c=>limits[c]===expected.limits[c]&&
      equipment.baseLimits[c]===baseLimits[c]))
  return fail('quota_projection_mismatch',sourceRef);
 const categories=CATS.map(c=>({
  category:c,baseLimit:baseLimits[c],effectiveLimit:limits[c],
  used:counts[c],remaining:limits[c]-counts[c],
  reduced:c===expected.reducedCategory
 }));
 const quota={
  patent,categoryReduced:expected.reducedCategory,
  previousLimit:expected.previousLimit,newLimit:expected.newLimit,
  categories,withinLimits:categories.every(c=>c.remaining>=0),
  sourceRef,applied:false
 };
 // A seleção é opcional. Sem escolha não significa concessão implícita.
 const modified=equipment.items?.filter(i=>i.juniorModification)||[];
 if(modified.length>1)return {...BASE,status:'multiple-free-modifications',
  sourceRef,quota,freeModification:null,issues:['junior_modification_multiple']};
 const entry=modified[0]||null;
 if(entry&&(entry.quantity!==1||
   entry.juniorModification.stableKey!==entry.stableKey||
   entry.juniorModification.category!==entry.category||
   entry.juniorModification.categoryIncrease!==0||
   entry.juniorModification.appliedToCharacter!==false))
  return {...BASE,status:'invalid-free-modification',sourceRef,quota,
   freeModification:null,issues:['junior_modification_invalid']};
 const freeModification=entry?{
  stableKey:entry.stableKey,itemName:entry.name,quantity:1,
  category:entry.category,modificationCode:entry.juniorModification.code,
  baseSpaces:entry.juniorModification.baseSpaces,
  projectedSpaces:entry.spaces,
  freeCategoryIncrease:0,subsetValidated:true,
  sourceRef:entry.juniorModification.source,applied:false
 }:null;
 const issues=equipment.issues.map(i=>i.code);
 if(!equipment.ready||!quota.withinLimits)return {...BASE,status:'equipment-blocked',
  sourceRef,quota,freeModification,issues};
 return {...BASE,status:'validated-read-only-preflight',sourceRef,
  quota,freeModification,issues:[]};
}
