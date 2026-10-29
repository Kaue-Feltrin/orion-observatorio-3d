/** Matriz de auditoria v0.6.0: informação, não autorização de aquisição.
 * Fontes são catálogos já presentes neste repositório. O Worker continua
 * decidindo ativação e evolução pelos validadores existentes.
 */
import {VERIFIED_ORIGINS,CLASSES,classLevelMilestone} from './index.mjs';
import {CREATION_SKILLS} from './creation-catalog.mjs';
import {LEVEL2_TRACKS,LEVEL2_TRACK_CONFIGS,LEVEL3_POWERS,POWER_REVIEW_CANDIDATES} from './progression.mjs';
import {MANUAL_RITUALS} from './manual-items.mjs';

const skillsByName=new Map(CREATION_SKILLS.map(s=>[normalize(s.label),s.code]));
function normalize(value){
 return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
}
function parseRows(value){
 if(typeof value==='string'){try{value=JSON.parse(value)}catch{return []}}
 return Array.isArray(value)?value:[];
}
function recordedByServer(rows){
 return rows.filter(row=>row&&typeof row==='object'&&!Array.isArray(row)&&
  (row.source==='creation-approved'||/^canonical-level-[1-9]\d*$/.test(String(row.source??''))))
  .map(row=>({code:typeof row.code==='string'?row.code:null,
   stableKey:typeof row.stableKey==='string'?row.stableKey:null,
   name:typeof row.name==='string'?row.name:null,source:row.source}));
}
function sorted(values){return [...values].sort().join('|');}
function originSkillsMatch(exposed,verified){
 if(!Array.isArray(exposed.fixedSkills)||!Array.isArray(verified.skills))return false;
 const verifiedCodes=verified.skills.map(name=>skillsByName.get(normalize(name)));
 return verifiedCodes.every(Boolean)&&sorted(exposed.fixedSkills)===sorted(verifiedCodes);
}
/** O catálogo visual deve ser passado explicitamente: não há acesso a DOM no Worker.
 * Nenhuma origem recebe homologação só porque está numa lista ou tem o mesmo nome.
 */
export function buildCatalogHomologationMatrix(exposedOrigins){
 if(!Array.isArray(exposedOrigins)||exposedOrigins.some(o=>!o||typeof o.code!=='string'||typeof o.label!=='string'))
  throw new TypeError('invalid_origin_catalog');
 const verifiedNames=new Map(VERIFIED_ORIGINS.map(o=>[normalize(o.name),o]));
 const origins=exposedOrigins.map(exposed=>{
  const source=verifiedNames.get(normalize(exposed.label))??null;
  const sameSkills=source?originSkillsMatch(exposed,source):false;
  return {code:exposed.code,label:exposed.label,exposed:true,
   serverCatalogRecognizes:Boolean(source),
   fixedSkillMappingMatches:source?sameSkills:null,
   auditStatus:!source?'pending-source-review':sameSkills?'source-mapped':'source-divergence',
   sourceRef:source?.source??null,
   validatedForCharacter:false,acquired:false,projectionOnly:true};
 });
 const tracks=LEVEL2_TRACKS.map(t=>({
  code:t.code,label:t.label,classCode:t.classCode,exposedInProgressionCatalog:true,
  sourceRef:t.sourceRef,approval:t.approval,configuredForInitialChoice:
   t.approval==='curated'||Boolean(LEVEL2_TRACK_CONFIGS[t.code]),
  characterPrerequisitesNotYetEvaluated:true,acquired:false,projectionOnly:true
 }));
 const powers=[...LEVEL3_POWERS,...POWER_REVIEW_CANDIDATES].map(p=>({
  code:p.code,label:p.label,classCode:p.classCode,sourceRef:p.sourceRef,
  exposedInProgressionCatalog:true,approval:p.approval??'curated',
  characterPrerequisitesNotYetEvaluated:true,acquired:false,projectionOnly:true
 }));
 const rituals=MANUAL_RITUALS.map(r=>({
  stableKey:r.stableKey,name:r.name,circle:r.circle,
  exposedInManualCatalog:true,eligibleCircleForInitialSelection:r.circle===1,
  characterPrerequisitesNotYetEvaluated:true,acquired:false,projectionOnly:true
 }));
 const levels=CLASSES.flatMap(classCode=>Array.from({length:20},(_,i)=>{
  const level=i+1, milestone=classLevelMilestone(classCode,level);
  return {classCode,level,emRequired:milestone.emRequired,
   choices:milestone.choices,automaticLabels:milestone.automatic,
   ruleDeclarationPresent:true,characterAdvanceValidated:false,
   acquisitionNotEstablished:true};
 }));
 return {schemaVersion:1,readOnly:true,canonical:false,
  interpretation:'catalog-and-milestone-audit-only',
  counts:{exposedOrigins:origins.length,serverRecognizedOrigins:origins.filter(o=>o.serverCatalogRecognizes).length,
   originSourceDivergences:origins.filter(o=>o.auditStatus==='source-divergence').length,
   tracks:tracks.length,powers:powers.length,rituals:rituals.length,levelRows:levels.length},
  origins,tracks,powers,rituals,levels};
}
function section(id,review,sourceRef){
 return {id,validation:review?.ready===true?'passed':'blocked',
  issues:Array.isArray(review?.issues)?review.issues.map(i=>({code:String(i.code??'unknown'),message:String(i.message??'')})):[],
  sourceRef,acquisitionVerifiedByAudit:false};
}
/** Exposto no GET autenticado de revisão. Nunca decide ativação nem concede bônus.
 * Evidência "registered" significa campo persistido com marcador canônico;
 * não equivale a homologação externa das regras nem a transação conferida aqui.
 */
export function reviewCharacterHomologation(character,reviews){
 const ch=character&&typeof character==='object'&&!Array.isArray(character)?character:{};
 const origin=VERIFIED_ORIGINS.find(o=>normalize(o.name)===normalize(ch.origin))??null;
 const equipped=recordedByServer(parseRows(ch.inventory_json));
 const rituals=recordedByServer(parseRows(ch.rituals_json));
 const abilities=recordedByServer(parseRows(ch.abilities_json));
 const stage=reviews.lifeStage?.stage??null;
 return {schemaVersion:1,readOnly:true,canonical:false,
  status:'review-not-grant',
  sections:[
   section('creation',reviews.creation,origin?.source??'Manual consolidado Órion v0.15 · criação N1'),
   section('equipment',reviews.equipment,reviews.equipment?.manual??'Manual Órion v0.15'),
   section('rituals',reviews.rituals,reviews.rituals?.manual??'Manual Órion v0.15'),
   section('lifeStage',reviews.lifeStage,'Projeto Órion · Estágios da Vida')
  ],
  declarations:{origin:typeof ch.origin==='string'?ch.origin:null,
   originFoundInVerifiedServerCatalog:Boolean(origin),classCode:String(ch.class_code??''),
   level:Number.isInteger(ch.level)?ch.level:null,stage},
  recordedSources:{equipment:equipped,rituals,abilities},
  caveat:'Marcadores de origem na ficha não substituem histórico transacional; catálogo, prévia e registro não são concessões equivalentes.'};
}
