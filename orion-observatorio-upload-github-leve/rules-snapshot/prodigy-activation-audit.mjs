/**
 * PR104 · Matriz de certificação integrada de Prodígio, somente leitura.
 * Fonte: Manual Consolidado Órion v0.21 > Suplemento 1.9.3.1 p.15
 * > Arquivos Secretos > Sobrevivendo ao Horror > Livro Base.
 * Este relatório NÃO pode conceder/ativar efeitos. O Worker continua
 * recusando ativação até transação atômica, proveniência e pós-validação.
 */
import {reviewLifeStage} from './life-stage-review.mjs';
import {prodigyAttributeCaps} from './prodigy-progression-rule.mjs';
import {projectProdigyTraitSheet} from './prodigy-trait-projection.mjs';
import {preflightJuniorEquipment} from './junior-equipment-preflight.mjs';
import {deriveSheet} from './index.mjs';

const EXPECTED=Object.freeze(['JUNIOR','PIVETE','REBELDE']);
const AGE_SOURCE='Suplemento Órion 1.9.3.1 p.15';
const STEP_LABELS=Object.freeze({
 life_contract:'Faixa etária e traço de Prodígio válidos',
 attribute_caps:'Os dois atributos limitados permanecem com teto 2',
 juvenile_pe_max:'Jovem Imparável contado uma vez no PE máximo',
 juvenile_pe_turn:'Jovem Imparável contado uma vez no limite por turno',
 trait_contract:'Efeitos do traço reproduzidos pelo motor de consulta',
 item_quota:'Categoria por patente conferida pelo catálogo',
 free_item_mod:'Modificação gratuita de um único exemplar validada',
 canonical_effect_binding:'Efeitos condicionais vinculados à ficha ativa canônica',
 transaction_grant:'Concessão atômica do Worker com prova de aquisição',
 no_double_grant:'Repetição, reabertura e evolução sem concessão duplicada',
 stage_transition:'Transições de idade com reconciliação de efeitos e CAS',
 active_provenance:'Integridade da aquisição em fichas ativas e legadas'
});
function entry(id,verified,reason=null){
 return {code:id,label:STEP_LABELS[id],status:verified?'checked-read-only':'pending',
  checkedReadOnly:verified,grantCertified:false,...(verified?{}:{reason:reason||id})};
}
function matchesPart(parts,label,value){
 const all=Array.isArray(parts)?parts.filter(x=>x.label===label):[];
 return all.length===1&&all[0].value===value;
}
export function auditProdigyActivation(character){
 const life=reviewLifeStage(character),base={
  version:1,scope:'creation-activation-certification',
  sourceRef:AGE_SOURCE,sourceHierarchy:'Manual Consolidado Órion v0.21 > Suplemento Órion > Arquivos Secretos > Sobrevivendo ao Horror > Livro Base',
  applies:life.stage==='PRODIGIO',stage:life.stage,trait:null,checks:[],
  canActivate:false,mayCommit:false,grant:false,applied:false,
  currentResourcesChanged:false,readOnlyComplete:false,
  remaining:[],status:'not-applicable'
 };
 if(life.stage!=='PRODIGIO')return base;
 const preview=life.effectsPreview;
 const trait=preview?.trait??null;
 const valid=life.intentValid&&preview?.status==='preview-not-granted'&&
  preview.applied===false&&EXPECTED.includes(trait);
 const caps=prodigyAttributeCaps(character);
 const attrValid=valid&&caps.ready&&caps.limitedAttributes.length===2&&
  caps.limitedAttributes.every(x=>caps.caps[x]===2);
 let sheet=null;
 try{sheet=deriveSheet(character)}catch{}
 const pe=Boolean(sheet&&valid&&matchesPart(sheet.values?.pe?.parts,'Jovem Imparável',Number(character.level)));
 const turn=Boolean(sheet&&valid&&matchesPart(sheet.values?.pePerTurn?.parts,'Jovem Imparável',1));
 const traitReadOnly=trait==='JUNIOR'?preflightJuniorEquipment(character):projectProdigyTraitSheet(character);
 const traitValid=valid&&(
  trait==='JUNIOR'?
   traitReadOnly?.status==='validated-read-only-preflight'&&traitReadOnly?.quota?.withinLimits===true:
   traitReadOnly?.status==='validated-read-only-projection'&&
    traitReadOnly?.trait===trait&&traitReadOnly?.rows?.length===(trait==='PIVETE'?6:5));
 const check=[
  entry('life_contract',valid,'life_stage_contract_unverified'),
  entry('attribute_caps',attrValid,'prodigy_attribute_caps_unverified'),
  entry('juvenile_pe_max',pe,'juvenile_pe_max_projection_unverified'),
  entry('juvenile_pe_turn',turn,'juvenile_pe_turn_projection_unverified'),
  entry('trait_contract',traitValid,'trait_projection_unverified'),
  entry('item_quota',trait!=='JUNIOR'||Boolean(traitValid),'junior_category_quota_unverified'),
  entry('free_item_mod',trait!=='JUNIOR'||Boolean(traitValid&&(
   traitReadOnly.freeModification===null||
   (traitReadOnly.freeModification.subsetValidated===true&&
    traitReadOnly.freeModification.freeCategoryIncrease===0))),
   'junior_free_modification_unverified'),
  // Os quatro passos seguintes dependem de aquisição efetiva. A existência de
  // prévia/efeito de consulta jamais pode certificar automaticamente um grant.
  entry('canonical_effect_binding',false,'canonical_active_effect_binding_missing'),
  entry('transaction_grant',false,'atomic_worker_grant_not_implemented'),
  entry('no_double_grant',false,'idempotent_grant_and_level_recheck_not_implemented'),
  entry('stage_transition',false,'active_life_transition_not_certified'),
  entry('active_provenance',false,'active_legacy_grant_provenance_not_certified')
 ];
 const remaining=check.filter(x=>x.status!=='checked-read-only').map(x=>x.code);
 const readOnlyComplete=check.slice(0,7).every(x=>x.checkedReadOnly);
 return {...base,trait,checks:check,remaining,readOnlyComplete,
  status:!valid?'invalid-life-intent':
   character?.status==='active'?'active-legacy-not-certified':
   readOnlyComplete?'read-only-complete-activation-blocked':'preflight-incomplete',
  // Extremos de segurança: um relatório só é informativo, NUNCA uma licença.
  canActivate:false,mayCommit:false,grant:false,applied:false};
}
