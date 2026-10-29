/**
 * PR137: read-only identity checks for historical / imported collections.
 * Never turns user-provided source, code or name into a mechanical grant.
 * Collisions only DISABLE uncertain projections; no rows are mutated.
 */
import {CREATION_SKILLS} from './creation-catalog.mjs';

const legacyRecord137=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const legacyNorm137=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .trim().replace(/\s+/g,' ').toUpperCase();
const legacyUnpack137=value=>{
 try{
  const rows=typeof value==='string'?JSON.parse(value):value;
  return Array.isArray(rows)&&rows.length<=150?rows:null;
 }catch{return null;}
};
const legacySkillAliases137=new Map(CREATION_SKILLS.flatMap(s=>[[legacyNorm137(s.code),s.code],[legacyNorm137(s.label),s.code]]));

/** Return canonical skill codes whose saved identities contradict each other.
 * Unknown historical names remain informational, without claiming training.
 */
export function conflictingSkillIdentities(value){
 const rows=legacyUnpack137(value);
 if(!rows)return {valid:false,codes:[],reason:'unreadable-skill-collection'};
 const counts=new Map(),conflicts=new Set();
 for(const row of rows){
  if(!legacyRecord137(row))continue;
  const name=legacySkillAliases137.get(legacyNorm137(row.name??row.label));
  const code=typeof row.code==='string'?legacySkillAliases137.get(legacyNorm137(row.code)):null;
  if(name&&code&&name!==code){conflicts.add(name);conflicts.add(code);}
  // A recognized code under an unknown/different name is not a valid
  // second identity for an official skill and must not be ignored.
  if(code&&legacyNorm137(row.name??row.label)!==legacyNorm137(
   CREATION_SKILLS.find(x=>x.code===code)?.label))
   conflicts.add(code);
  for(const key of new Set([name,code].filter(Boolean)))
   counts.set(key,(counts.get(key)||0)+1);
 }
 for(const [key,count] of counts)if(count>1)conflicts.add(key);
 return {valid:true,codes:[...conflicts].sort(),reason:conflicts.size?
  'ambiguous-skill-identities':'unique-skill-identities'};
}

/** Exactly one slot-eligible record may identify the catalog item by either
 * stableKey OR name. A legacy alias must not impersonate an acquired item.
 */
export function uniqueEquipmentIdentity(value,{stableKey,name}={}){
 const rows=legacyUnpack137(value);
 if(!rows||typeof stableKey!=='string'||typeof name!=='string')
  return false;
 return rows.filter(row=>legacyRecord137(row)&&(
  legacyNorm137(row.stableKey)===legacyNorm137(stableKey)||legacyNorm137(row.name)===legacyNorm137(name)
 )).length===1;
}

/** An imported ability sharing the canonical name but another code blocks
 * an otherwise certifiable grant, without removing any historical record.
 */
export function uniquePowerIdentity(value,{code,name}={}){
 const rows=legacyUnpack137(value);
 if(!rows||typeof code!=='string'||typeof name!=='string')
  return false;
 return rows.filter(row=>legacyRecord137(row)&&(
  legacyNorm137(row.code)===legacyNorm137(code)||legacyNorm137(row.name)===legacyNorm137(name)
 )).length===1;
}
