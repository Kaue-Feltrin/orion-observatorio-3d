/** Revisão de criação v0.4.9; função pura, compartilhável pelo Worker.
 * Fontes: criador antigo originSkills.ts; Manual Consolidado v0.15 (origens explicitamente
 * verificadas no rules-core) e regras de criação existentes.
 *
 * Não promove progresso, não corrige dados silenciosamente e NÃO interpreta
 * as origens ainda não verificadas como proibidas: marca revisão pendente.
 */
import {checkCreationAttributes,readSkillTraining,VERIFIED_ORIGINS} from './index.mjs';
import {CREATION_SKILLS} from './creation-catalog.mjs';

const CLASS_CODES=new Set(['COMBATENTE','ESPECIALISTA','OCULTISTA']);
const SKILL_CODES=new Map(CREATION_SKILLS.map(s=>[normalize(s.code),s]));
const SKILL_NAMES=new Map(CREATION_SKILLS.map(s=>[normalize(s.label),s]));
const REQUIRED={primary:new Set(['LUTA','PONTARIA']),resistance:new Set(['FORTITUDE','REFLEXOS'])};
const ATTRIBUTE_CODES=['AGI','FOR','INT','PRE','VIG'];

function normalize(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();}
function parsed(v){if(typeof v==='string'){try{return JSON.parse(v)}catch{return null}}return v}
function skillDef(v){return SKILL_CODES.get(normalize(v))||SKILL_NAMES.get(normalize(v))||null}
function issue(code,message){return {code,message}}
function rank(item){return readSkillTraining(item)}
function fixedClassSkills(classCode,roleCodes){
 if(classCode==='OCULTISTA')return ['OCULTISMO','VONTADE'];
 if(classCode==='COMBATENTE')return roleCodes;
 return [];
}
function baseSlots(classCode,int){
 return ({COMBATENTE:1,ESPECIALISTA:7,OCULTISTA:3}[classCode]??0)+int;
}

/** Critério de conclusão ANTES da ativação. Não invalida rascunhos incompletos,
 * não altera fichas existentes nem interpreta valores legados como permissão.
 */
export function reviewCharacterCreation(character){
 const issues=[];
 const ch=character&&typeof character==='object'?character:{};
 const level=Number(ch.level||1),classCode=String(ch.class_code||'');
 const originName=String(ch.origin||'').trim();
 if(!CLASS_CODES.has(classCode))issues.push(issue('class_required','Escolha uma classe válida.'));
 const origin=VERIFIED_ORIGINS.find(x=>normalize(x.name)===normalize(originName))??null;
 if(!originName)issues.push(issue('origin_required','Escolha a origem do personagem.'));
 else if(!origin)issues.push(issue('origin_pending_review','Esta origem está no catálogo, mas suas concessões ainda precisam ser verificadas no Manual do Órion. É possível manter o rascunho.'));
 const attributes=parsed(ch.attributes_json);
 if(!attributes||typeof attributes!=='object'||Array.isArray(attributes))issues.push(issue('invalid_attributes','Os cinco atributos precisam estar preenchidos.'));
 else for(const message of checkCreationAttributes(attributes))issues.push(issue('attribute_distribution',message));
 const INT=Number.isInteger(attributes?.INT)&&attributes.INT>=0?attributes.INT:0;
 const rawSkills=parsed(ch.skills_json);
 const rows=Array.isArray(rawSkills)?rawSkills:[];
 if(!Array.isArray(rawSkills))issues.push(issue('invalid_skills','A lista de perícias está inválida.'));
 const names=new Map(),taken=[];
 for(const entry of rows){
  if(!entry||typeof entry!=='object'||Array.isArray(entry)){
   issues.push(issue('invalid_skill_entry','Há um registro de perícia inválido.'));continue;
  }
  const skill=skillDef(entry.name);
  if(!skill){
   // Texto legado pode existir, mas não habilita novos treinamentos.
   const state=rank(entry);
   if(state.status!=='ok'||state.rank>0)issues.push(issue('unknown_trained_skill','Uma perícia treinada não foi reconhecida no catálogo oficial.'));
   continue;
  }
  if(names.has(skill.code)){issues.push(issue('duplicate_skill','Perícia duplicada: '+skill.label+'.'));continue;}
  names.set(skill.code,entry);
  const training=rank(entry);
  if(training.status!=='ok'){issues.push(issue('invalid_training','Grau de treinamento conflitante ou desconhecido em '+skill.label+'.'));continue;}
  if(level===1&&training.rank>1)issues.push(issue('training_before_milestone','Veterano e Expert não são escolhidos na criação: '+skill.label+'.'));
  if(training.rank>=1)taken.push(skill.code);
 }
 const effectiveOriginCodes=new Set((origin?.skills||[]).map(x=>skillDef(x)?.code).filter(Boolean));
 // Manual Consolidado Órion v0.15 · OR-001; Livro Base 1.3, PDF pp. 26–29.
 // A origem concede treinamento, mas a ativação não pode depender da prévia
 // do navegador: a ficha persistida precisa registrar cada perícia fixa
 // como treinada. Nenhuma correção/sincronização silenciosa ocorre aqui.
 if(origin)for(const code of effectiveOriginCodes){
  const fixed=names.get(code);
  if(!fixed||rank(fixed).status!=='ok'||rank(fixed).rank<1){
   issues.push(issue('origin_fixed_skill_missing',
    'A origem '+origin.name+' exige '+(skillDef(code)?.label||code)+' treinada na ficha. Revise as perícias antes de ativar.'));
  }
 }
 const roleCodes=[],roles={};
 if(classCode==='COMBATENTE'){
  for(const role of ['primary','resistance']){
   const matched=rows.filter(x=>x?.classRole===role);
   if(matched.length!==1){issues.push(issue('mandatory_skill_choice','Escolha exatamente uma perícia para '+(role==='primary'?'combate (Luta/Pontaria)':'resistência (Fortitude/Reflexos)')+'.'));continue;}
   const def=skillDef(matched[0].name);
   if(!def||!REQUIRED[role].has(def.code)){issues.push(issue('invalid_mandatory_skill','A perícia obrigatória de '+role+' não é válida.'));continue;}
   const training=rank(matched[0]);
   if(training.status!=='ok'||(training.rank<1&&!effectiveOriginCodes.has(def.code)))issues.push(issue('mandatory_not_trained','A perícia '+def.label+' precisa estar treinada.'));
   roles[role]=def.code;roleCodes.push(def.code);
  }
 }else if(classCode==='OCULTISTA'){
  for(const code of ['OCULTISMO','VONTADE']){
   const row=names.get(code);
   if(!row||rank(row).status!=='ok'||rank(row).rank<1)issues.push(issue('occultist_fixed_skill', 'Ocultista começa com '+(skillDef(code)?.label||code)+' treinada.'));
  }
 }else if(classCode==='ESPECIALISTA'){
  if(rows.some(x=>x?.classRole))issues.push(issue('invalid_class_skill_choice','Escolhas obrigatórias de Combatente não se aplicam a Especialista.'));
 }
 const classFixed=new Set(fixedClassSkills(classCode,roleCodes));
 const duplicateFixed=roleCodes.filter(code=>effectiveOriginCodes.has(code)).length;
 const capacity=baseSlots(classCode,INT)+duplicateFixed;
 const selected=taken.filter(code=>!effectiveOriginCodes.has(code)&&!classFixed.has(code));
 if(selected.length>capacity)issues.push(issue('skill_budget_exceeded','Você escolheu '+selected.length+' perícias livres, mas a classe permite '+capacity+'.'));
 else if(selected.length<capacity)issues.push(issue('skill_choices_remaining','Ainda faltam '+(capacity-selected.length)+' perícias livres para concluir a criação.'));
 // A progressão acima do nível 1 exige um motor próprio para cada marco.
 if(level!==1)issues.push(issue('not_creation_level','Este verificador só certifica a criação de Nível 1. Evoluções precisam ser analisadas pela Progressão.'));
 return {
  ready:issues.length===0,
  canonical:false,
  purpose:'activation-gate',
  manual:'v0.15 · origens verificadas',
  level,classCode,origin:origin?.name||originName||null,
  fixed:{origin:[...effectiveOriginCodes],class:[...classFixed],combatant:roles},
  choices:{used:selected.length,limit:capacity,remaining:Math.max(0,capacity-selected.length),replacements:duplicateFixed},
  issues
 };
}
