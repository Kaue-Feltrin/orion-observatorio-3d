/** Órion Fichas 0.6.0 — inventário de escolhas de origem (PR #64).
 * SOMENTE revisão de intenção em rascunho, sem aquisição e sem validação
 * de elegibilidade para ativação. Fontes: OPRPG v1.3 PDF pp.27–30;
 * Guia do Órion PDF p.4; Suplemento Órion 1.9.3.1 PDF p.13.
 * A seleção fica em narrative_json.creatorOriginChoiceV1; esse campo
 * jamais concede equipamento, poderes, categoria, PV/PE/SAN ou aprovação.
 */
import {MANUAL_EQUIPMENT,MANUAL_CATALOG_VERSION} from './manual-items.mjs';
import {VERIFIED_ENGINEER_NONWEAPON_TYPES} from './index.mjs';
import {previewChefDish} from './chef-dish-rule.mjs';
export const ORIGIN_CHOICE_VERSION=1;
export const ORIGIN_CHOICE_FIELD='creatorOriginChoiceV1';
const byKey=new Map(MANUAL_EQUIPMENT.map(x=>[x.stableKey,x]));
const DEFINITIONS=Object.freeze({
 ENGENHEIRO:{name:'Engenheiro',source:'Livro Base 1.3 · PDF p.28; Guia Órion · PDF p.4',
  power:'Ferramenta Favorita',requires:['profession','itemTypeStableKey']},
 OPERARIO:{name:'Operário',source:'Livro Base 1.3 · PDF p.30; Suplemento Órion 1.9.3.1 · PDF p.13',
  power:'Ferramenta de Trabalho',requires:['profession','workWeaponStableKey','workJustification','staffReview']},
 CULTISTA_ARREPENDIDO:{name:'Cultista Arrependido',source:'Livro Base 1.3 · PDF p.28',
  power:'Traços do Outro Lado',requires:['powerCode','startingSanityHalved']},
 CHEF:{name:'Chef',source:'Livro Base 1.3 · PDF p.27; Suplemento Órion 1.9.3.1 · PDF p.13',
  power:'Prato do Dia',requires:['profession','craftingLifecycle']}
});
const normalize=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'');
function object(value){return value!==null&&typeof value==='object'&&!Array.isArray(value)}
function decode(value){if(typeof value==='string'){try{return JSON.parse(value)}catch{return null}}return value}
function safeText(x,max=80){return typeof x==='string'&&x.trim().length>0&&x.trim().length<=max&&!/[<>\x00-\x1f]/.test(x)}
function error(code,message){return {code,message}}
const KEY_FIELDS=Object.freeze({
 ENGENHEIRO:['version','originCode','profession','itemTypeStableKey'],
 OPERARIO:['version','originCode','profession','workWeaponStableKey','workJustification'],
 CULTISTA_ARREPENDIDO:['version','originCode','powerCode'],
 CHEF:['version','originCode','profession']
});
const result=(def,code)=>({schemaVersion:ORIGIN_CHOICE_VERSION,
 origin:code??null,name:def?.name??null,sourceRef:def?.source??null,
 readOnly:true,draftOnly:true,canonical:false,granted:false,
 applied:false,staffApproved:false,activationApproved:false,
 requires:def?.requires??[],issues:[],selected:null,
 status:def?'choice-not-reviewed':'not-applicable',ready:false});
export function originChoiceDefinitions(){
 return Object.entries(DEFINITIONS).map(([code,def])=>({code,...def}));
}
/** The category reduction for Engineer belongs to one CATALOG ITEM TYPE,
 * not one item instance. This does not calculate or modify equipment limits.
 * Weapons and unidentified/uncurated items never become eligible via labels.
 */
export function engineeringItemTypeCandidates(){
 // Only types reviewed against the actual equipment text, not GERAL alone.
 return VERIFIED_ENGINEER_NONWEAPON_TYPES.map(ref=>{
  const x=byKey.get(ref.stableKey);
  if(!x||x.group==='ARMA'||x.group==='AMALDICOADO'||
     !Number.isInteger(x.category)||x.category<1||x.category>4)
   return null; // Fail closed without preventing the Worker from starting.
  return {stableKey:x.stableKey,name:x.name,group:x.group,category:x.category,
   proposedCategory:x.category-1,source:ref.source,catalogVersion:MANUAL_CATALOG_VERSION,
   typeWide:true,canonical:false,grant:false};
 }).filter(Boolean);
}
const candidates=new Set(engineeringItemTypeCandidates().map(x=>x.stableKey));
const present=(x,key)=>Object.prototype.hasOwnProperty.call(x,key);
/** Review an owner-owned character or trusted draft snapshot only. Never
 * echo arbitrary narrative text (private notes or justification) in a report.
 */
export function reviewOriginChoice(character){
 const ch=object(character)?character:{};
 const code=normalize(ch.origin);
 const def=DEFINITIONS[code]??null;
 const view=result(def,code||null);
 if(!def)return view;
 const age=Number(ch.age),level=Number(ch.level);
 const raw=decode(ch.narrative_json);
 const pending=raw&&object(raw)?raw[ORIGIN_CHOICE_FIELD]:undefined;
 const issues=[];
 const put=(code,message)=>issues.push(error(code,message));
 const certifiedEngineer=code==='ENGENHEIRO';
 if(!((ch.status==='draft'&&level===1)||(certifiedEngineer&&level>=1&&
    ['active','engineer-rechoice-preview'].includes(ch.status))))
  put('origin_choice_draft_n1_only','Escolha de origem especial só pode ser analisada em rascunho de Nível 1.');
 if(!Number.isSafeInteger(age)||age<16)put('origin_choice_invalid_age','Idade inválida no registro de escolhas.');
 const fields=KEY_FIELDS[code];
 let choice=null;
 if(pending===undefined||pending===null)
  put('origin_choice_required','Registre a escolha estruturada obrigatória desta origem no rascunho.');
 else if(!object(pending)||pending.version!==ORIGIN_CHOICE_VERSION||pending.originCode!==code||
    Object.keys(pending).some(k=>!fields.includes(k)))
  put('origin_choice_invalid_contract','O contrato de origem está desatualizado, com campos inesperados ou pertence a outra origem.');
 else choice=pending;
 if(choice){
  if(['ENGENHEIRO','OPERARIO','CHEF'].includes(code)&&!safeText(choice.profession))
   put('origin_choice_profession_required','Especifique a área de Profissão (até 80 caracteres).');
  if(code==='ENGENHEIRO'){
   const key=choice.itemTypeStableKey;
   if(typeof key!=='string'||!candidates.has(key))
    put('origin_choice_equipment_type_ineligible','Ferramenta Favorita exige um tipo de item de catálogo homologável, não arma; escolha pelo stableKey, nunca por nome livre.');
   else {
    const item=byKey.get(key);
    view.selected={itemTypeStableKey:key,itemName:item.name,
     catalogCategory:item.category,proposedCategory:item.category-1,
     appliesToAllUnitsOfType:true,notInstance:true};
   }
  }else if(code==='OPERARIO'){
   if(!safeText(choice.workJustification,400)||choice.workJustification.trim().length<12)
    put('origin_choice_work_justification_required','Descreva por que a arma é ferramenta do trabalho manual (12–400 caracteres).');
   const key=choice.workWeaponStableKey,item=typeof key==='string'?byKey.get(key):null;
   if(!item||item.group!=='ARMA')
    put('origin_choice_weapon_unknown','Escolha uma arma reconhecida pelo stableKey; nomes ou chaves não catalogadas não são aceitos.');
   else view.selected={workWeaponStableKey:key,itemName:item.name,
    category:item.category,meleeClassification:'pending',
    workJustificationRecorded:safeText(choice.workJustification,400)};
  }else if(code==='CULTISTA_ARREPENDIDO'){
   if(typeof choice.powerCode!=='string'||!/^([A-Z0-9]+[-_]){1,8}[A-Z0-9]+$/.test(choice.powerCode)||choice.powerCode.length>100)
    put('origin_choice_power_code_required','Escolha um código de poder paranormal verificável; rótulos livres não comprovam concessão.');
   else view.selected={powerCode:choice.powerCode,
    eligibility:'awaiting-paranormal-power-catalog'};
  }else if(code==='CHEF'){
   if(choice.profession!==undefined&&normalize(choice.profession)!=='COZINHEIRO')
    put('origin_choice_chef_profession_required','Chef exige Profissão (cozinheiro), conforme o Livro Base.');
   // Source-indexed mechanical formula, preview only. No item or PV grant.
   const dish=previewChefDish({originCode:code,profession:choice.profession,level});
   if(!dish.valid)put('origin_choice_dish_projection_invalid',
    'Prévia do Prato do Dia indisponível para origem, profissão ou nível informados.');
   else view.selected={dishDice:dish.dishDice,dishFormula:dish.dishFormula,
    spaces:dish.spaces,category:dish.category,temporaryPvOnly:dish.temporaryPvOnly,
    dishProjection:dish};
  }
 }
 // Engineer N1 may now pass the acquisition gate only with a valid catalog
 // stableKey; the actual category grant is computed separately by the Worker.
 // Other special origins remain intentionally blocked.
 const blockers={
  OPERARIO:['origin_choice_staff_approval_pending','A Equipe de Suporte precisa aprovar a arma e a justificativa; classificação corpo a corpo não está homologada pelo catálogo.'],
  CULTISTA_ARREPENDIDO:['origin_choice_paranormal_grant_pending','Poder paranormal inicial e metade da SAN de partida ainda não são concedidos de forma auditável.'],
  CHEF:['origin_choice_dish_lifecycle_pending','A fabricação e o consumo do Prato do Dia ainda não têm concessão auditável.']
 }[code];
 if(blockers)put(...blockers);
 view.issues=issues;
 view.ready=code==='ENGENHEIRO'&&choice!==null&&issues.length===0;
 view.status=view.ready?'choice-ready-for-acquisition':
   !choice?'choice-missing':(issues.length>(blockers?1:0)?'choice-invalid':'choice-reviewed-but-blocked');
 // Only the final server activation and its D1 audit may claim acquisition.
 view.activationApproved=false;
 view.granted=false;
 view.applied=false;
 return view;
}
