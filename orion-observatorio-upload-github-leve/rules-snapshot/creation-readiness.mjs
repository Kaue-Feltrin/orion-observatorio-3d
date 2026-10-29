/** Órion Fichas v0.6.0 · PR #57
 * Diagnóstico de prontidão por seção da CRIAÇÃO N1, exclusivamente leitura.
 * Não implementa regras nem substitui o gate reviewCreationMechanics.
 * Não concede poderes, altera recursos, grava DB ou expõe narrative_json.
 */
import {reviewCreationMechanics} from './creation-mechanics.mjs';

export const READINESS_SCHEMA_VERSION=1;
const DEFINITIONS=Object.freeze([
 {id:'identidade',label:'Identidade',group:'IDENTIDADE',step:0,fields:['name'],source:'Worker / cadastro de personagem'},
 {id:'idade',label:'Idade e estágio da vida',group:'IDENTIDADE',step:1,fields:['age','narrative_json'],source:'Suplemento Órion 1.9.3.1, pp. 15–17; contrato etário v1'},
 {id:'classe',label:'Classe',group:'FORMAÇÃO',step:2,fields:['class_code'],source:'Manual Consolidado Órion v0.15 · classes'},
 {id:'atributos',label:'Atributos',group:'FORMAÇÃO',step:3,fields:['attributes_json'],source:'rules-core / checkCreationAttributes'},
 {id:'origem',label:'Origem',group:'HISTÓRICO',step:4,fields:['origin'],source:'Manual Consolidado Órion v0.15 · VERIFIED_ORIGINS'},
 {id:'pericias',label:'Perícias',group:'HISTÓRICO',step:5,fields:['skills_json'],source:'Manual Consolidado Órion v0.15 · CREATION_SKILLS'},
 {id:'rituais',label:'Rituais iniciais',group:'PREPARAÇÃO',step:7,fields:['rituals_json'],source:'Manual Órion v0.15 · catálogo de rituais'},
 {id:'inventario',label:'Inventário',group:'PREPARAÇÃO',step:7,fields:['inventory_json','patent'],source:'Manual Órion v0.15 · catálogo e limites de equipamento'}
]);
const CREATION_FIELD=Object.freeze({
 class_required:['classe','class_code'],
 invalid_attributes:['atributos','attributes_json'],attribute_distribution:['atributos','attributes_json'],
 origin_required:['origem','origin'],origin_pending_review:['origem','origin'],
 origin_fixed_skill_missing:['pericias','skills_json'],
 invalid_skills:['pericias','skills_json'],invalid_skill_entry:['pericias','skills_json'],
 unknown_trained_skill:['pericias','skills_json'],duplicate_skill:['pericias','skills_json'],
 invalid_training:['pericias','skills_json'],training_before_milestone:['pericias','skills_json'],
 mandatory_skill_choice:['pericias','skills_json'],invalid_mandatory_skill:['pericias','skills_json'],
 mandatory_not_trained:['pericias','skills_json'],occultist_fixed_skill:['pericias','skills_json'],
 invalid_class_skill_choice:['pericias','skills_json'],skill_budget_exceeded:['pericias','skills_json'],
 skill_choices_remaining:['pericias','skills_json'],
 not_creation_level:['progressao','level']
});
const LIFE_FIELD=Object.freeze({
 invalid_life_stage_age:'age',life_stage_attribute_cap:'attributes_json',
 life_stage_master_skill_required:'skills_json',
 life_stage_vivencia_ineligible:'narrative_json',
 life_stage_invalid_contract:'narrative_json'
});
const HARD_BLOCKED=new Set([
 'origin_pending_review','not_creation_level',
 'life_stage_effects_not_implemented','cursed_equipment_pending','augmentation_pending',
 'unknown_equipment','unknown_ritual'
]);
function reasonsOf(result){return Array.isArray(result?.issues)?result.issues:[]}
function issue(code,message,source,section,field){
 return {code,message,source,section,field,kind:HARD_BLOCKED.has(code)||code.startsWith('origin_choice_')?'blocked':'pending'};
}
function section(def){
 return {...def,status:'complete',issues:[],complete:true,optional:def.id==='inventario'};
}
function overallStatus(sections){
 return sections.some(s=>s.status==='blocked')?'blocked':
   sections.some(s=>s.status==='pending')?'pending':'complete';
}
/** Only call with a saved/private character or a trusted N1 draft snapshot.
 * The sole activation authority remains reviewCreationMechanics in Worker PATCH.
 */
export function reviewCreationReadiness(character,mechanics=reviewCreationMechanics(character)){
 const ch=character&&typeof character==='object'&&!Array.isArray(character)?character:{};
 const sections=DEFINITIONS.map(section);
 const byId=new Map(sections.map(s=>[s.id,s]));
 function append(id,entry){
  let target=byId.get(id);
  if(!target){
   target=section({id,label:id==='progressao'?'Progressão fora da criação':'Validação técnica',group:'VALIDAÇÃO',step:8,fields:[],source:'rules-core / revisão integrada'});
   sections.push(target);byId.set(id,target);
  }
  target.issues.push(entry);
 }
 if(typeof ch.name!=='string'||!ch.name.trim()){
  append('identidade',issue('name_required','Informe o nome do personagem.','worker','identidade','name'));
 }
 for(const item of reasonsOf(mechanics.creation)){
  const [id,field]=CREATION_FIELD[item.code]||['revisao',null];
  append(id,issue(item.code,item.message,'creation',id,field));
 }
 for(const item of reasonsOf(mechanics.originChoices)){
  append('origem',issue(item.code,item.message,'originChoices','origem','narrative_json'));
 }
 for(const item of reasonsOf(mechanics.lifeStage)){
  append('idade',issue(item.code,item.message,'lifeStage','idade',LIFE_FIELD[item.code]||'narrative_json'));
 }
 for(const item of reasonsOf(mechanics.rituals)){
  append('rituais',issue(item.code,item.message,'rituals','rituais','rituals_json'));
 }
 for(const item of reasonsOf(mechanics.equipment)){
  append('inventario',issue(item.code,item.message,'equipment','inventario',
    item.code==='invalid_patent'||item.code==='equipment_category_limit'?'patent':'inventory_json'));
 }
 for(const s of sections){
  s.status=s.issues.some(x=>x.kind==='blocked')?'blocked':s.issues.length?'pending':'complete';
  s.complete=s.status==='complete';
 }
 const issues=sections.flatMap(s=>s.issues);
 const counts={complete:sections.filter(s=>s.status==='complete').length,
  pending:sections.filter(s=>s.status==='pending').length,
  blocked:sections.filter(s=>s.status==='blocked').length};
 const status=overallStatus(sections);
 const ready=mechanics.ready===true&&status==='complete';
 return {schemaVersion:READINESS_SCHEMA_VERSION,scope:'creation-level-1',
  source:'reviewCreationMechanics',readOnly:true,grantsApplied:false,
  revision:Number.isSafeInteger(Number(ch.revision))?Number(ch.revision):null,
  applicable:Number(ch.level||1)===1,ready,status,counts,sections,issues,
  note:'A validação é automática e não exige revisão humana geral. A ativação só ocorre pelo PATCH autenticado, caso todas as regras do Worker estejam atendidas.'};
}
