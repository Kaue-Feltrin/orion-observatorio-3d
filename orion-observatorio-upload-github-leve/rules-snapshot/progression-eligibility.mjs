/** Pré-requisitos mecânicos reutilizados do criador antigo.
 * Este módulo NUNCA autoriza novas aquisições sozinho; apenas audita.
 * Somente concessões oficiais do Worker contam como poderes adquiridos.
 */
import {POWER_BY_CODE,TRACK_BY_CODE,POWER_PREREQUISITES,TRACK_PREREQUISITES} from './progression-prerequisites.mjs';
import {CREATION_SKILLS} from './creation-catalog.mjs';
import {readSkillTraining,deriveSheet} from './index.mjs';
const skillByName=new Map(CREATION_SKILLS.map(x=>[norm(x.label),x.code]));
const skillByCode=new Map(CREATION_SKILLS.map(x=>[norm(x.code),x.code]));
const powerAliases=new Map([
 ['ORION-ESP-ESPECIALIZACAO-ACROBATICA','PO-ESP-003'],
 ['ORION-ESP-MIRA-INFALIVEL','PO-ESP-007'],
 ['ORION-GER-BOM-SAMARITANO','PO-GER-005']
]);
function norm(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase()}
function array(v){if(typeof v==='string'){try{v=JSON.parse(v)}catch{return []}}return Array.isArray(v)?v:[]}
function obj(v){if(typeof v==='string'){try{v=JSON.parse(v)}catch{return {}}}return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
/** Confere somente a cronologia declarada de uma origem já armazenada.
 * Não autentica a origem por si só; a rota canônica do Worker continua
 * responsável pelo histórico e pelo bloqueio de PATCH/importações.
 */
export function isChronologicalGrantSource(value,currentLevel){
 const level=Number(currentLevel);
 if(!Number.isInteger(level)||level<1||level>20)return false;
 if(value==='creation-approved')return true;
 const match=/^canonical-level-([1-9][0-9]*)$/.exec(String(value??''));
 return !!match&&Number(match[1])<=level;
}
/** Fonte futura/inválida declarada "canônica" exige reconciliação.
 * Nunca ignorar silenciosamente a entrada para autorizar nova progressão.
 */
export function hasInconsistentCanonicalGrantHistory(ch){
 return array(ch?.abilities_json).some(x=>
  x&&typeof x==='object'&&!Array.isArray(x)&&
  typeof x.source==='string'&&x.source.startsWith('canonical-level-')&&
  !isChronologicalGrantSource(x.source,ch?.level));
}
function acquiredPowers(ch){return array(ch?.abilities_json).filter(x=>
 x&&typeof x==='object'&&!Array.isArray(x)&&
 isChronologicalGrantSource(x.source,ch?.level));}
function trainedSkills(ch){
 // As perícias da origem já são projetadas em deriveSheet; não obrigar
 // o jogador a gravar um segundo treinamento em skills_json.
 const raw=ch?.skills_json??ch?.skills??[];
 let rows;
 try{rows=typeof raw==='string'?JSON.parse(raw):raw;}catch{return new Map();}
 if(!Array.isArray(rows)||rows.some(row=>!row||typeof row!=='object'||Array.isArray(row)))
  return new Map(); // entradas inválidas não satisfazem pré-requisitos.
 // Fallback mantém a revisão de treinamento manual de fichas incompletas
 // quando a projeção integral de atributos/nível não estiver disponível.
 const fallback=new Map(),duplicates=new Set();
 for(const row of rows){
  const code=skillByName.get(norm(row.name??row.label??row.code))||
   skillByCode.get(norm(row.name??row.label??row.code));
  if(!code)continue;
  if(fallback.has(code)){duplicates.add(code);continue;}
  const parsed=readSkillTraining(row);
  if(parsed.status==='ok')fallback.set(code,parsed.rank);
 }
 for(const code of duplicates)fallback.delete(code);
 let projected;
 try{projected=deriveSheet(ch).effects.skillTraining;}
 catch{return fallback;}
 const validated=new Map();
 for(const [label,detail] of Object.entries(projected??{})){
  const code=skillByName.get(norm(label))||skillByCode.get(norm(label));
  if(code&&Number.isSafeInteger(detail?.rank)&&detail.rank>=0&&
     !duplicates.has(code))validated.set(code,detail.rank);
 }
 return validated;
}
/** Mesmo grau de treinamento efetivo da ficha; referência de elegibilidade,
 * jamais fonte de concessão automática de poderes/trilhas/perícias.
 */
export function prerequisiteSkillRank(ch,skill){
 const code=skillByName.get(norm(skill))||skillByCode.get(norm(skill));
 return code?(trainedSkills(ch).get(code)??0):0;
}

function originalPowerCode(value){return powerAliases.get(String(value||''))||String(value||'')}
function canonicalPowerCodes(ch){
 const out=new Set();
 for(const a of acquiredPowers(ch)){out.add(originalPowerCode(a.code));}
 return out;
}
export function reviewPowerPrerequisites(character,code,{level=Number(character?.level||1)+1,slot='CLASS_OR_GENERAL'}={}){
 const src=POWER_BY_CODE.get(originalPowerCode(code)),reasons=[];
 if(!src)return {code,sourceCode:null,known:false,eligible:false,reasons:['Poder sem correspondência verificada no catálogo antigo.']};
 if(hasInconsistentCanonicalGrantHistory(character))reasons.push('Registro canônico de habilidade em nível futuro ou inválido requer reconciliação.');
 const klass=String(character?.class_code??character?.classCode??'');
 if(slot==='GENERAL_ONLY'&&src.category!=='GENERAL')reasons.push('Este marco aceita apenas Poder Geral.');
 if(slot!=='GENERAL_ONLY'&&!(src.category===klass||src.category==='GENERAL'||src.category==='DUAL'&&['ESPECIALISTA','OCULTISTA'].includes(klass)))reasons.push('Poder pertence a outra classe.');
 if(src.supported===false)reasons.push(src.configurationNote||'Poder exige configuração não implementada.');
 // Configurações com escolhas não estruturadas devem continuar pendentes.
 if(src.configurationNote&&!src.supported)reasons.push('Configuração pendente.');
 if(src.minLevel&&level<src.minLevel)reasons.push('Exige Nível '+src.minLevel+'.');
 const attributes=obj(character?.attributes_json??character?.attributes);
 for(const [attribute,min] of Object.entries(src.attributeReq||{})){
  if(!Number.isInteger(attributes[attribute])||attributes[attribute]<min)reasons.push('Exige '+attribute+' '+min+'.');
 }
 const ranks=trainedSkills(character);
 for(const k of src.requiredSkills||[])if((ranks.get(k)||0)<1)reasons.push('Exige treinamento em '+k+'.');
 if(src.anyTrainedSkills?.length&&!src.anyTrainedSkills.some(k=>(ranks.get(k)||0)>=1))reasons.push('Exige uma perícia treinada: '+src.anyTrainedSkills.join(' ou ')+'.');
 for(const k of src.veteranSkills||[])if((ranks.get(k)||0)<2)reasons.push('Exige Veterano em '+k+'.');
 const powers=canonicalPowerCodes(character);
 for(const key of src.requiresPowerCodes||[])if(!powers.has(key))reasons.push('Exige o poder adquirido '+key+'.');
 if(src.requiresTrackAbility){
  const abil=acquiredPowers(character).some(a=>norm(a.name)===norm(src.requiresTrackAbility));
  if(!abil)reasons.push('Exige a habilidade de Trilha adquirida '+src.requiresTrackAbility+'.');
 }
 if(!src.repeatable&&powers.has(src.code))reasons.push('Poder já adquirido pela progressão.');
 return {code,sourceCode:src.code,known:true,eligible:reasons.length===0,reasons,sourceRef:src.sourceRef,repeatable:src.repeatable};
}
export function reviewTrackPrerequisites(character,code,{level=2}={}){
 const src=TRACK_BY_CODE.get(code==='COM_CHA'?'COM_CMD':code);
 if(!src)return {code,known:false,eligible:false,reasons:['Trilha sem correspondência verificada no catálogo antigo.']};
 const reasons=[],klass=String(character?.class_code??character?.classCode??'');
 if(src.classCode!==klass)reasons.push('Trilha pertence a outra classe.');
 if(level<2)reasons.push('A Trilha só pode ser escolhida no Nível 2.');
 const ranks=trainedSkills(character);
 for(const key of src.requiredSkills||[])if((ranks.get(key)||0)<1)reasons.push('Requer treinamento em '+key+'.');
 if(src.professionSpecialty){
  // Uma coleção legada/externa pode conter registros nulos, heterogêneos
  // ou perícias duplicadas. Pré-requisitos nunca lançam exceção nem
  // tratam uma única linha válida como autorização de uma coleção inválida.
  const input=character?.skills_json??[];
  let saved;
  try{saved=typeof input==='string'?JSON.parse(input):input;}catch{saved=null;}
  const structurallyValid=Array.isArray(saved)&&saved.every(x=>
   x!==null&&typeof x==='object'&&!Array.isArray(x)&&
   typeof (x.name??x.label??x.code)==='string'&&
   (x.name??x.label??x.code).trim().length>0);
  const rows=structurallyValid?saved.filter(x=>
   (skillByName.get(norm(x.name??x.label??x.code))||
    skillByCode.get(norm(x.name??x.label??x.code)))==='PROFISSAO'):[];
  const valid=structurallyValid&&rows.length===1&&
   (ranks.get('PROFISSAO')??0)>=1&&
   readSkillTraining(rows[0]).status==='ok'&&
   readSkillTraining(rows[0]).rank>0&&
   [rows[0].specialty,rows[0].specialization,rows[0].profession].some(v=>
    typeof v==='string'&&norm(v).includes(norm(src.professionSpecialty)));
  if(!valid)reasons.push('Exige Profissão ('+src.professionSpecialty+') configurada.');
 }
 return {code,known:true,eligible:reasons.length===0,reasons,sourceRef:src.sourceRef};
}
export function originalPrerequisiteCatalog(character,{level=Number(character?.level||1)+1}={}){
 const cls=String(character?.class_code??character?.classCode??'');
 return {
  level,
  powers:POWER_PREREQUISITES.filter(p=>p.category===cls||p.category==='GENERAL'||p.category==='DUAL'&&['ESPECIALISTA','OCULTISTA'].includes(cls)).map(p=>({...reviewPowerPrerequisites(character,p.code,{level}),label:p.label,category:p.category,approval:'reference_only'})),
  tracks:TRACK_PREREQUISITES.filter(t=>t.classCode===cls).map(t=>({...reviewTrackPrerequisites(character,t.code,{level}),label:t.label,approval:'reference_only'}))
 };
}
