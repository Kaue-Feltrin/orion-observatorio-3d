/** Órion Fichas v0.6.0 · PR101 — Teto etário canônico de Prodígio.
 * Precedência: Manual Consolidado v0.21 (não tem regra específica Prodígio),
 * depois Suplemento Órion 1.9.3.1 p.15.
 * Limites escolhidos persistem durante evolução N4/N10/N16/N19.
 * Leitura puramente local da ficha do Worker; nenhuma concessão ou D1 write.
 */
import {lifeStageForAge} from './index.mjs';
const PRODIGY_LIMITABLE_ATTRIBUTES=Object.freeze(['FOR','INT','PRE','VIG']);
const naturalCodes=Object.freeze(['AGI','FOR','INT','PRE','VIG']);
function lifeStagePayload(narrative){
 let value=narrative;
 if(typeof value==='string'){try{value=JSON.parse(value)}catch{return null}}
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const intent=value.creatorLifeV1;
 return intent?.version===1&&intent.byStage&&typeof intent.byStage==='object'&&
  !Array.isArray(intent.byStage)?intent:null;
}
function attributesOf(ch){
 let value=ch?.attributes_json;
 if(typeof value==='string'){try{value=JSON.parse(value)}catch{return null}}
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 return value;
}
export function prodigyAttributeCaps(character){
 if(lifeStageForAge(Number(character?.age))!=='PRODIGIO')
  return {applies:false,ready:true,limitedAttributes:[],caps:{},sourceRef:null};
 const stage=lifeStagePayload(character?.narrative_json)?.byStage?.PRODIGIO;
 const chosen=stage?.limitedAttributes;
 const attrs=attributesOf(character);
 const valid=Array.isArray(chosen)&&chosen.length===2&&
  chosen.every(x=>typeof x==='string'&&PRODIGY_LIMITABLE_ATTRIBUTES.includes(x))&&
  new Set(chosen).size===2&&attrs&&naturalCodes.every(k=>
   Number.isSafeInteger(attrs[k])&&attrs[k]>=0&&attrs[k]<=5)&&
  chosen.every(x=>attrs[x]<=2);
 if(!valid)return {applies:true,ready:false,limitedAttributes:[],
  caps:{},reason:'prodigy_attribute_contract_required',
  sourceRef:'Suplemento Órion 1.9.3.1 p.15'};
 return {applies:true,ready:true,limitedAttributes:[...chosen],
  caps:Object.fromEntries(naturalCodes.map(x=>[x,chosen.includes(x)?2:5])),
  reason:null,sourceRef:'Suplemento Órion 1.9.3.1 p.15'};
}
export function reviewProdigyAttributeIncrease(character,code){
 const plan=prodigyAttributeCaps(character);
 if(!plan.applies)return {allowed:true,applies:false,maximum:5,reason:null};
 if(!plan.ready)return {allowed:false,applies:true,maximum:null,reason:plan.reason};
 if(!naturalCodes.includes(code))return {allowed:false,applies:true,maximum:null,reason:'invalid_attribute_choice'};
 const values=attributesOf(character);
 const allowed=values[code]<plan.caps[code];
 return {allowed,applies:true,maximum:plan.caps[code],
  reason:allowed?null:'prodigy_attribute_limit',sourceRef:plan.sourceRef};
}
