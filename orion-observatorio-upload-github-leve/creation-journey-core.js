import * as Rules from './rules-snapshot/index.mjs';
import {reviewCharacterCreation} from './rules-snapshot/creation-review.mjs';
import {reviewCreationMechanics} from './rules-snapshot/creation-mechanics.mjs';
import {reviewCreationReadiness} from './rules-snapshot/creation-readiness.mjs';
import {reviewEquipment,reviewInitialRituals} from './rules-snapshot/loadout-review.mjs';
import {MANUAL_EQUIPMENT,MANUAL_RITUALS} from './rules-snapshot/manual-items.mjs';
import {engineeringItemTypeCandidates,originChoiceDefinitions} from './rules-snapshot/origin-choice-review.mjs';
import {ORIGINS,SKILLS} from './origin-catalog.js';
import './rules-snapshot/creator-guidance.js';
import './rules-snapshot/creator-life-v060.js';
import './rules-snapshot/catalog-powers-tracks.js';

const host=typeof window==='undefined'?globalThis:window;
host.OrionRules=Rules;host.OrionCatalog={origins:ORIGINS,skills:SKILLS};
export const Guidance=host.OrionCreatorGuidance,Life=host.OrionCreatorLife;
export const POWERS=host.OrionAdvancedCatalog?.powers??[];
export {Rules,SKILLS,MANUAL_EQUIPMENT,MANUAL_RITUALS,reviewCharacterCreation,reviewCreationMechanics,reviewCreationReadiness,reviewEquipment,reviewInitialRituals,engineeringItemTypeCandidates,originChoiceDefinitions};
export const JOURNEY_STEPS=[['attributes','Atributos'],['life','Idade e vivência'],['skills','Perícias'],['preparation','Habilidades e rituais'],['equipment','Equipamento'],['background','História'],['review','Conferência']].map(([key,label])=>({key,label}));
export{LOCAL_CREATION_KEY}from './creation-save.js';
const clone=x=>JSON.parse(JSON.stringify(x));
export function createCharacterDraft(draft){
 const old=draft.character&&typeof draft.character==='object'?clone(draft.character):{};
 const ch={...old,name:draft.name,class_code:draft.classCode,origin:draft.origin.label,status:'draft',level:1,em:0,nex:draft.classCode==='OCULTISTA'?8:5,
  age:Number.isSafeInteger(old.age)?old.age:null,patent:old.patent||'RECRUTA',
  attributes_json:old.attributes_json||{AGI:1,FOR:1,INT:1,PRE:1,VIG:1},
  skills_json:Array.isArray(old.skills_json)?old.skills_json:[],inventory_json:Array.isArray(old.inventory_json)?old.inventory_json:[],rituals_json:Array.isArray(old.rituals_json)?old.rituals_json:[],abilities_json:[],
  narrative_json:old.narrative_json&&typeof old.narrative_json==='object'?old.narrative_json:{}};
 ch.skills_json=Guidance.syncGrants(ch,host.OrionCatalog);return ch;
}
export function setCombatSkill(ch,role,code){const rows=Guidance.combatChoice(ch,role,code,host.OrionCatalog);if(!rows)return false;ch.skills_json=Guidance.syncGrants({...ch,skills_json:rows},host.OrionCatalog);return true;}
export function setFreeSkill(ch,code){
 const skill=SKILLS.find(s=>s.code===code);if(!skill)return false;
 const plan=Guidance.plan(ch,host.OrionCatalog),fixed=new Set([...plan.classLabels,...(plan.originVerified?plan.originLabels:[])]);if(fixed.has(skill.label))return false;
 const present=ch.skills_json.find(r=>r.name===skill.label);
 if(present)ch.skills_json=ch.skills_json.filter(r=>r.name!==skill.label);
 else ch.skills_json.push({name:skill.label,attribute:skill.attribute,training:'treinado',bonus:'',source:'creation-planned'});
 return true;
}
export function setLifeChoice(ch,key,value){ch.narrative_json={...ch.narrative_json,creatorLifeV1:Life.update(ch,key,value)};}
export function setInventory(ch,key,quantity){
 const item=MANUAL_EQUIPMENT.find(i=>i.stableKey===key);if(!item||!Number.isInteger(quantity)||quantity<0||quantity>20)return false;
 const row=ch.inventory_json.find(r=>r.stableKey===key);
 if(!quantity)ch.inventory_json=ch.inventory_json.filter(r=>r.stableKey!==key);
 else if(row)row.quantity=quantity;
 else ch.inventory_json.push({stableKey:key,name:item.name,quantity,source:'creation-planned',kind:'reference',...(item.configurableSkill?{config:{skillCode:''}}:{})});return true;
}
export function setInitialRitual(ch,key){
 const ritual=MANUAL_RITUALS.find(r=>r.stableKey===key&&r.circle===1);if(!ritual||ch.class_code!=='OCULTISTA')return false;
 if(ch.rituals_json.some(r=>r.stableKey===key))ch.rituals_json=ch.rituals_json.filter(r=>r.stableKey!==key);
 else{if(ch.rituals_json.length>=3)return false;ch.rituals_json.push({...ritual,kind:'reference',source:'creation-planned'});}return true;
}
export function reviewDraft(ch){const mechanics=reviewCreationMechanics(ch),readiness=reviewCreationReadiness(ch,mechanics);let sheet=null;
 if(Number.isSafeInteger(ch.age)&&ch.age>=16)try{sheet=Rules.deriveSheet(ch);}catch{}
 return{mechanics,readiness,sheet};
}
export function stepIssues(ch,key){
 if(key==='attributes')return [...Rules.checkCreationAttributes(ch.attributes_json),...(Life.stage(ch.age)==='PRODIGIO'&&Life.selected(ch).choices.limitedAttributes?.length===2?Life.attributesCompatible(ch,ch.attributes_json).issues:[])];
 if(key==='life')return !Number.isSafeInteger(ch.age)||ch.age<16?['Informe uma idade inteira a partir de 16 anos.']:[];
 if(key==='skills')return [...(ch.skills_json.some(r=>r.name==='Profissão')&&!String(ch.narrative_json.profession||'').trim()?['Defina a área da perícia Profissão.']:[]),...reviewCharacterCreation(ch).issues.filter(i=>!['origin_pending_review','origin_required'].includes(i.code)&&!i.code.startsWith('attribute')).map(i=>i.message)];
 if(key==='preparation'){
  const issues=reviewInitialRituals(ch).issues.map(i=>i.message);
  if(ch.class_code==='ESPECIALISTA'){
   const chosen=ch.narrative_json.classChoicesV1?.expertiseSkills||[],eligible=Life.trainedOptions(ch).filter(n=>!['Luta','Pontaria'].includes(n));
   if(chosen.length!==2||new Set(chosen).size!==2||chosen.some(n=>!eligible.includes(n)))issues.push('Para Perito, escolha duas perícias treinadas diferentes, exceto Luta e Pontaria.');
  }return issues;
 }
 return [];
}
export function exportCreationDraft(draft,ch){
 const review=reviewDraft(ch),localIssues=JOURNEY_STEPS.flatMap(s=>stepIssues(ch,s.key).map(message=>({code:'local-choice-required',message,section:s.key})));return{format:'orion-observatorio-draft',version:1,sourceCommit:'f80bbaacc8acb4ad0158d43fb923e2f421e58528',name:draft.name,gender:draft.gender,origin:clone(draft.origin),classCode:draft.classCode,character:clone({...ch,status:'draft'}),validation:{scope:'local-preview',ready:review.readiness.ready&&!localIssues.length,status:localIssues.length?'pending':review.readiness.status,issues:[...localIssues,...review.readiness.issues.map(i=>({code:i.code,message:i.message,section:i.section}))],officiallyActivated:false}};
}
