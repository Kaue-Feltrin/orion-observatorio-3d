/** N7: promoção de Treinado para Veterano.
 * Derivado de projeto-orion/worker/rules/progression.ts:
 * trainingChoiceCount: Combatente 2+INT; Especialista 5+INT; Ocultista 3+INT.
 * trainingTargetRank(7)=2, isTrainingEligible: rank anterior = 1.
 * Fail-closed para estágios MADURO/IDOSO até revisão das regras de idade.
 */
import {CREATION_SKILLS} from './creation-catalog.mjs';
import {readSkillTraining,lifeStageForAge} from './index.mjs';
export const N7_TRAINING_SOURCE='projeto-orion/worker/rules/progression.ts';
const LABEL_BY_CODE=new Map(CREATION_SKILLS.map(s=>[s.code,s.label]));
const CODE_BY_LABEL=new Map(CREATION_SKILLS.map(s=>[norm(s.label),s.code]));
function norm(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase()}
function rowsOf(ch){try{const a=typeof ch.skills_json==='string'?JSON.parse(ch.skills_json):ch.skills_json;if(!Array.isArray(a))throw Error();return a}catch{throw Error('invalid_known_skills')}}
export function trainingChoiceCount7(ch){
 const base={COMBATENTE:2,ESPECIALISTA:5,OCULTISTA:3}[ch.class_code];
 const raw=ch.attributes_json;
 let attrs;try{attrs=typeof raw==='string'?JSON.parse(raw):raw}catch{throw Error('invalid_current_attributes')}
 const intel=attrs?.INT;
 if(base===undefined||!Number.isInteger(intel)||intel<0||intel>5)throw Error('invalid_training_budget');
 return base+intel;
}
export function trainingOptions7(ch){
 const required=trainingChoiceCount7(ch);
 const stage=lifeStageForAge(Number(ch.age??18));
 const agePending=stage==='MADURO'||stage==='IDOSO';
 const rows=rowsOf(ch),byCode=new Map(),invalid=[];
 for(const row of rows){
  if(!row||typeof row!=='object'||Array.isArray(row))throw Error('invalid_known_skills');
  const code=CODE_BY_LABEL.get(norm(row.name))||((LABEL_BY_CODE.has(norm(row.name)))?norm(row.name):null);
  const rank=readSkillTraining(row);
  if(rank.status!=='ok')throw Error('ambiguous_skill_training');
  if(!code)continue; // Legacy free text is not eligible for canonical advancement.
  if(byCode.has(code)){invalid.push(code);continue;}
  byCode.set(code,{code,label:LABEL_BY_CODE.get(code),rank:rank.rank});
 }
 if(invalid.length)throw Error('duplicate_known_skills');
 const choices=[...byCode.values()].filter(x=>x.rank===1).sort((a,b)=>a.label.localeCompare(b.label,'pt-BR'));
 return {required,available:choices.length,choices,eligible:!agePending&&choices.length>=required,
  agePending,reason:agePending?'Maduro e Idoso exigem a regra especial de Treinamento antes da promoção canônica.':choices.length<required?'Há menos perícias treinadas do que o total exigido para promoção.':'',
  targetRank:2,source:N7_TRAINING_SOURCE};
}
export function validateTraining7(ch,payload){
 const info=trainingOptions7(ch);
 if(info.agePending)throw Error('age_training_progression_pending');
 if(!info.eligible)throw Error('insufficient_trained_skills');
 const selected=payload?.trainingSkills;
 if(!Array.isArray(selected)||selected.length!==info.required||
    selected.some(x=>typeof x!=='string'||!LABEL_BY_CODE.has(x))||
    new Set(selected).size!==selected.length)throw Error('invalid_training_choices');
 const allowed=new Set(info.choices.map(x=>x.code));
 if(selected.some(x=>!allowed.has(x)))throw Error('training_choice_not_eligible');
 const rows=rowsOf(ch);
 const target=new Set(selected),updated=rows.map(row=>{
  const code=CODE_BY_LABEL.get(norm(row.name))||LABEL_BY_CODE.has(norm(row.name))&&norm(row.name);
  if(!target.has(code))return {...row};
  const clone={...row};
  // Never allow a stale rank/degree/level field to conflict with Veterano.
  delete clone.rank;delete clone.degree;delete clone.level;
  clone.training='veterano';clone.trained=true;clone.trainingGrant='canonical-level-7';
  return clone;
 });
 if(updated.length!==rows.length)throw Error('invalid_known_skills');
 return {trainingSkills:[...selected],trainingChanges:selected.map(code=>({code,name:LABEL_BY_CODE.get(code),from:1,to:2})),
  skills:updated,trainingCount:info.required,trainingTarget:2};
}


/** N14: Veterano -> Expert, usando a mesma quantidade de escolhas de
 * trainingChoiceCount(classCode, INT) e rank anterior exatamente 2.
 * Nenhum bônus numérico é inventado; a prévia existente calcula +15.
 */
export const N14_TRAINING_SOURCE=N7_TRAINING_SOURCE;
export function trainingOptions14(ch){
 const required=trainingChoiceCount7(ch);
 const stage=lifeStageForAge(Number(ch.age??18));
 const agePending=stage==='MADURO'||stage==='IDOSO';
 const rows=rowsOf(ch),byCode=new Map();
 for(const row of rows){
  if(!row||typeof row!=='object'||Array.isArray(row))throw Error('invalid_known_skills');
  const code=CODE_BY_LABEL.get(norm(row.name))||(LABEL_BY_CODE.has(norm(row.name))?norm(row.name):null);
  const rank=readSkillTraining(row);
  if(rank.status!=='ok')throw Error('ambiguous_skill_training');
  if(!code)continue;
  if(byCode.has(code))throw Error('duplicate_known_skills');
  byCode.set(code,{code,label:LABEL_BY_CODE.get(code),rank:rank.rank});
 }
 const choices=[...byCode.values()].filter(x=>x.rank===2).sort((a,b)=>a.label.localeCompare(b.label,'pt-BR'));
 return {required,available:choices.length,choices,
  eligible:!agePending&&choices.length>=required,agePending,
  reason:agePending?'Maduro e Idoso exigem a regra especial de Treinamento antes da promoção canônica.':
   choices.length<required?'Há menos perícias Veteranas do que o total exigido para promoção.':'',
  source:N14_TRAINING_SOURCE,targetRank:3};
}
export function validateTraining14(ch,payload){
 const info=trainingOptions14(ch);
 if(info.agePending)throw Error('age_training_progression_pending');
 if(!info.eligible)throw Error('insufficient_veteran_skills');
 const selected=payload?.trainingSkills;
 if(!Array.isArray(selected)||selected.length!==info.required||
    selected.some(x=>typeof x!=='string'||!LABEL_BY_CODE.has(x))||
    new Set(selected).size!==selected.length)throw Error('invalid_training_choices');
 const allowed=new Set(info.choices.map(x=>x.code));
 if(selected.some(x=>!allowed.has(x)))throw Error('training_choice_not_eligible');
 const rows=rowsOf(ch),target=new Set(selected);
 const updated=rows.map(row=>{
  const code=CODE_BY_LABEL.get(norm(row.name))||(LABEL_BY_CODE.has(norm(row.name))?norm(row.name):null);
  if(!target.has(code))return {...row};
  const clone={...row};
  delete clone.rank;delete clone.degree;delete clone.level;
  if(clone.trainingGrant)clone.previousTrainingGrant=clone.trainingGrant;
  clone.training='expert';clone.trained=true;clone.trainingGrant='canonical-level-14';
  return clone;
 });
 return {trainingSkills:[...selected],
  trainingChanges:selected.map(code=>({code,name:LABEL_BY_CODE.get(code),from:2,to:3})),
  skills:updated,trainingCount:info.required,trainingTarget:3};
}
