export const CHARACTER_PREFIX='orion-character-v1:';
const classCodes=['COMBATENTE','ESPECIALISTA','OCULTISTA'];
export function newLocalId(){return globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;}
const safeId=id=>typeof id==='string'&&/^local-[a-z0-9-]{8,100}$/i.test(id);
function storageOrDefault(storage){return storage??globalThis.localStorage;}
function parseRecord(raw){try{if(!raw||raw.length>500000)return null;const r=JSON.parse(raw);return r?.format==='orion-local-character'&&r.version===1&&r.status==='created'&&r.scope==='browser-local'&&safeId(r.id)&&typeof r.name==='string'&&r.name.trim()&&classCodes.includes(r.classCode)&&r.character&&Array.isArray(r.character.skills_json)&&Array.isArray(r.character.inventory_json)&&Array.isArray(r.character.rituals_json)&&r.character.attributes_json&&r.character.narrative_json&&typeof r.recruitment?.code==='string'&&typeof r.origin?.label==='string'?r:null;}catch{return null;}}
export function readLocalCharacter(id,storage){try{if(!safeId(id))return null;const r=parseRecord(storageOrDefault(storage).getItem(CHARACTER_PREFIX+id));return r?.id===id?r:null;}catch{return null;}}
export function readLocalCharacters(storage){try{const s=storageOrDefault(storage),records=[];for(let i=0;i<s.length;i++){const key=s.key(i);if(!key?.startsWith(CHARACTER_PREFIX))continue;const record=parseRecord(s.getItem(key));if(record&&key===CHARACTER_PREFIX+record.id)records.push(record);}return records.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))||a.id.localeCompare(b.id));}catch{return[];}}
const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
function inputOf(record){return{gender:record.gender,origin:record.origin,classCode:record.classCode,character:{...record.character,status:'draft'}};}
export function makeLocalCharacter(pack,{draftId,now=new Date()}={}){
 const ch=pack?.character,a=ch?.attributes_json,attrs=['AGI','FOR','INT','PRE','VIG'].map(k=>a?.[k]);
 if(pack?.format!=='orion-observatorio-draft'||typeof ch?.name!=='string'||!ch.name.trim()||ch.name.length>60||(!classCodes.includes(pack.classCode)||ch.class_code!==pack.classCode||!['menina','menino','nao-definir'].includes(pack.gender))||!Array.isArray(ch.skills_json)||!Array.isArray(ch.inventory_json)||!Array.isArray(ch.rituals_json)||!ch.narrative_json||typeof pack.origin?.label!=='string'||!Number.isSafeInteger(ch.age)||ch.age<16||attrs.some(v=>!Number.isInteger(v)||v<0||v>3)||attrs.reduce((n,v)=>n+v,0)!==9||attrs.filter(v=>v===0).length>2)throw Error('incomplete-character');
 const id='local-'+(draftId||newLocalId());if(!safeId(id))throw Error('invalid-id');
 return{format:'orion-local-character',version:1,id,scope:'browser-local',status:'created',createdAt:new Date(now).toISOString(),sourceCommit:pack.sourceCommit,name:ch.name.trim(),gender:pack.gender,origin:structuredClone(pack.origin),classCode:pack.classCode,character:structuredClone({...ch,status:'created-local'}),presentation:structuredClone(pack.presentation||{}),validation:{...structuredClone(pack.validation),scope:'browser-local',officiallyActivated:false},recruitment:{code:'OR-'+id.slice(6).replace(/-/g,'').slice(0,10).toUpperCase(),stamp:'RECRUTADO'}};
}
export async function registerLocalCharacter(pack,{draftId,storage,locks=globalThis.navigator?.locks,now}={}){
 const record=makeLocalCharacter(pack,{draftId,now}),key=CHARACTER_PREFIX+record.id;
 const commit=()=>{const s=storageOrDefault(storage),raw=s.getItem(key);if(raw!==null){const old=parseRecord(raw);if(old&&stable(inputOf(old))===stable(inputOf(record)))return{record:old,createdNew:false};throw Error('already-created');}
  const value=JSON.stringify(record);s.setItem(key,value);if(s.getItem(key)!==value)throw Error('storage-not-verified');return{record,createdNew:true};};
 return locks?.request?locks.request(key,commit):commit();
}
export function localCharacterURL(id,{recruitment=false}={}){if(!safeId(id))throw Error('invalid-id');return 'ficha.html?character='+encodeURIComponent(id)+(recruitment?'&recruitment=1':'');}
