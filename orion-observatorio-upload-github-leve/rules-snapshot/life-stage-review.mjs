/** Órion Fichas v0.6.0 · Validação de intenções etárias no Worker.
 * Fonte: Suplemento Órion 1.9.3.1, pp.15–17; Livro Base v1.3, p.173
 * (somente nas desvantagens remetidas). Não concede efeitos.
 */
import {CREATION_SKILLS} from './creation-catalog.mjs';
import {POWER_BY_CODE} from './progression-prerequisites.mjs';
import {reviewPowerPrerequisites} from './progression-eligibility.mjs';
import {readSkillTraining} from './index.mjs';
import {previewProdigyEffects,evaluateProdigyContext} from './life-stage-effects.mjs';
export const LIFE_STAGE_VERSION=1;
export const LIFE_STAGE_FIELD='creatorLifeV1';
export const LIFE_STAGES=Object.freeze(['PRODIGIO','JOVEM','ADULTO','MADURO','IDOSO']);
export const LIFE_ATTRIBUTE_CODES=Object.freeze(['FOR','INT','PRE','VIG']);
export const LIFE_TRAITS=Object.freeze(['JUNIOR','PIVETE','REBELDE']);
export const LIFE_DISADVANTAGES=Object.freeze([
 'DEFINHAMENTO_MUSCULAR','DEVAGAR_JOVEM','DISTRAIDO','TOSSE','FRAGIL','GOTA',
 'MELANCOLICO','NA_MINHA_EPOCA','OSSOS_DE_VETERANO','PESSIMO_PARCEIRO',
 'PULMAO_RUIM','RECURVADO','SISTEMA_IMUNOLOGICO','TEIMOSO',
 'TODOS_ME_ODIAVAM','VISAO_PREJUDICADA'
]);
const SKILL_NAMES=new Set(CREATION_SKILLS.map(s=>s.label));
const FIELDS={
 PRODIGIO:['limitedAttributes','prematureTrait'],JOVEM:[],
 ADULTO:['disadvantages','vivenciaPower'],
 MADURO:['disadvantages','vivenciaPower','experienceMode','experienceSkills','masterSkill'],
 IDOSO:['disadvantages','vivenciaPower','experienceMode','experienceSkills']
};
const MODES={MADURO:['TRAINED','GRADE'],IDOSO:['TWO_TRAINED','TWO_GRADES','MIXED']};
function object(value){return value!==null&&typeof value==='object'&&!Array.isArray(value)}
function own(value,key){return Object.prototype.hasOwnProperty.call(value,key)}
function decode(value){if(typeof value==='string'){try{return JSON.parse(value)}catch{return null}}return value}
function issue(code,message){return {code,message}}
function exactCodes(value,allowed,maximum){
 return Array.isArray(value)&&value.length<=maximum&&value.every(x=>typeof x==='string'&&allowed.includes(x))&&new Set(value).size===value.length;
}
export function lifeStageForAge(value){
 // Keep the Worker life-stage review aligned with index.mjs and DB bounds:
 // only actual safe integer ages can define a mechanical life stage.
 if(typeof value!=='number'||!Number.isSafeInteger(value)||
    value<16||value>2147483647)return null;
 return value<18?'PRODIGIO':value<25?'JOVEM':value<45?'ADULTO':value<65?'MADURO':'IDOSO';
}
export function lifeStagePayload(narrative){
 const data=decode(narrative);
 if(!object(data)||!own(data,LIFE_STAGE_FIELD))return null;
 return data[LIFE_STAGE_FIELD];
}
export function validateLifeStageStructure(narrative){
 const source=decode(narrative),payload=lifeStagePayload(narrative),issues=[];
 if(!object(source)||!own(source,LIFE_STAGE_FIELD))return {present:false,valid:true,issues};
 if(!object(payload)||payload.version!==LIFE_STAGE_VERSION||!object(payload.byStage)||Object.keys(payload).some(k=>!['version','byStage'].includes(k))){
  issues.push(issue('life_stage_invalid_contract','Contrato etário desconhecido ou malformado.'));
  return {present:true,valid:false,issues};
 }
 for(const [stage,choices] of Object.entries(payload.byStage)){
  if(!LIFE_STAGES.includes(stage)||!object(choices)||Object.keys(choices).some(k=>!FIELDS[stage]?.includes(k))){
   issues.push(issue('life_stage_unexpected_field','Campo ou faixa não reconhecidos no contrato etário.'));continue;
  }
  const allowed=(key,value,max)=>{
   if(!exactCodes(value,key==='limitedAttributes'?LIFE_ATTRIBUTE_CODES:key==='disadvantages'?LIFE_DISADVANTAGES:[...SKILL_NAMES],max))
    issues.push(issue('life_stage_invalid_choice','Escolha inválida em '+stage+'.'+key+'.'));
  };
  for(const [key,value] of Object.entries(choices)){
   if(key==='limitedAttributes')allowed(key,value,2);
   else if(key==='disadvantages')allowed(key,value,stage==='ADULTO'?1:stage==='MADURO'?2:3);
   else if(key==='experienceSkills')allowed(key,value,stage==='MADURO'?1:2);
   else if(key==='prematureTrait'&&value!==null&&!LIFE_TRAITS.includes(value))issues.push(issue('life_stage_invalid_choice','Traço juvenil inválido.'));
   else if(key==='experienceMode'&&value!==null&&!MODES[stage]?.includes(value))issues.push(issue('life_stage_invalid_choice','Modalidade de experiência inválida.'));
   else if(key==='vivenciaPower'&&value!==null&&(!POWER_BY_CODE.has(value)||typeof value!=='string'))issues.push(issue('life_stage_invalid_choice','Poder de Vivência desconhecido.'));
   else if(key==='masterSkill'&&value!==null&&(!SKILL_NAMES.has(value)||['Luta','Pontaria'].includes(value)))issues.push(issue('life_stage_invalid_choice','Perícia Mestre na Área inválida.'));
  }
 }
 return {present:true,valid:!issues.length,issues};
}
function trainedNames(character){
 const rows=decode(character?.skills_json),out=new Set();
 if(!Array.isArray(rows))return out;
 for(const row of rows){
  if(!object(row)||!SKILL_NAMES.has(row.name))continue;
  const state=readSkillTraining(row);
  if(state.status==='ok'&&state.rank>=1)out.add(row.name);
 }
 return out;
}
function eligibleVivencia(character,code){
 const power=POWER_BY_CODE.get(code),klass=String(character?.class_code||'');
 if(!power)return false;
 if(![klass,'GENERAL'].includes(power.category)&&!(power.category==='DUAL'&&['ESPECIALISTA','OCULTISTA'].includes(klass)))return false;
 return reviewPowerPrerequisites(character,code,{level:1,slot:'CLASS_OR_GENERAL'}).eligible;
}
/** O contrato pode estar completo e mesmo assim não homologar efeitos.
 * Apenas Jovem, que não possui efeitos, pode ativar nesta etapa.
 */
export function reviewLifeStage(character){
 const ch=object(character)?character:{},stage=lifeStageForAge(ch.age),structure=validateLifeStageStructure(ch.narrative_json);
 const issues=[...structure.issues],payload=lifeStagePayload(ch.narrative_json);
 if(!stage)issues.push(issue('invalid_life_stage_age','A idade deve ser um inteiro a partir de 16 anos.'));
 const choices=object(payload?.byStage)?payload.byStage[stage]:null;
 let effectsPreview=null;
 if(structure.valid&&stage&&stage!=='JOVEM'){
  if(!structure.present||!object(choices))issues.push(issue('life_stage_choices_required','Registre as subescolhas da faixa etária antes da ativação.'));
  else if(stage==='PRODIGIO'){
   if(!exactCodes(choices.limitedAttributes,LIFE_ATTRIBUTE_CODES,2)||choices.limitedAttributes.length!==2)
    issues.push(issue('life_stage_attributes_required','Prodígio deve limitar exatamente dois atributos.'));
   else {
    const attributes=decode(ch.attributes_json)||{};
    for(const a of choices.limitedAttributes)if(!Number.isSafeInteger(attributes[a])||attributes[a]<0||attributes[a]>2)
     issues.push(issue('life_stage_attribute_cap','Prodígio: '+a+' deve ser no máximo 2.'));
   }
   if(!LIFE_TRAITS.includes(choices.prematureTrait))issues.push(issue('life_stage_trait_required','Prodígio precisa escolher um traço juvenil.'));
   if(!issues.length){
    const attrs=decode(ch.attributes_json)||{};
    effectsPreview=previewProdigyEffects({stage,level:Number(ch.level),limitedAttributes:choices.limitedAttributes,trait:choices.prematureTrait,attributes:attrs});
    if(!effectsPreview&&Number.isSafeInteger(Number(ch.level))&&Number(ch.level)>=1&&Number(ch.level)<=20)
     issues.push(issue('life_stage_preview_unavailable','A prévia de Prodígio não pôde ser conferida contra os atributos canônicos.'));
   }
  }else{
   const num=stage==='ADULTO'?1:stage==='MADURO'?2:3;
   if(!exactCodes(choices.disadvantages,LIFE_DISADVANTAGES,num)||choices.disadvantages.length!==num)
    issues.push(issue('life_stage_disadvantages_required','Escolha '+num+' desvantagem(ns) distintas.'));
   if(!eligibleVivencia(ch,choices.vivenciaPower))issues.push(issue('life_stage_vivencia_ineligible','Poder de Vivência ausente ou sem pré-requisitos para a classe atual.'));
   if(stage==='MADURO'||stage==='IDOSO'){
    if(!MODES[stage].includes(choices.experienceMode))issues.push(issue('life_stage_experience_mode_required','Escolha a modalidade de experiência.'));
    const count=stage==='MADURO'?1:2;
    if(!exactCodes(choices.experienceSkills,[...SKILL_NAMES],count)||choices.experienceSkills.length!==count)
     issues.push(issue('life_stage_experience_skills_required','Escolha '+count+' perícia(s)-alvo da experiência.'));
    if(stage==='MADURO'&&(!trainedNames(ch).has(choices.masterSkill)||['Luta','Pontaria'].includes(choices.masterSkill)))
     issues.push(issue('life_stage_master_skill_required','Mestre na Área requer perícia treinada diferente de Luta e Pontaria.'));
   }
  }
  issues.push(issue('life_stage_effects_not_implemented','Esta faixa etária tem efeitos mecânicos ainda não homologados pelo Worker. Não pode ser ativada por enquanto.'));
 }
 return {stage,present:structure.present,contractVersion:structure.present?LIFE_STAGE_VERSION:null,
  intentValid:!issues.some(x=>x.code!=='life_stage_effects_not_implemented'),
  effectsPreview,
  ready:issues.length===0,mechanicsCertified:stage==='JOVEM',issues};
}

/** Server-facing pure resolver. Context is evaluated from validated character
 * state, not from a fabricated client preview. Never persists or grants.
 */
export function reviewProdigyContext(character,context){
 const review=reviewLifeStage(character);
 if(!review.effectsPreview)return {status:'not-applicable',flatBonus:0,extraDice:0,allowed:true,effects:[],applied:false};
 return evaluateProdigyContext(review.effectsPreview,context);
}
