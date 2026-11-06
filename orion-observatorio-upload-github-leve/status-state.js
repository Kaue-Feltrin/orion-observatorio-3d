export const SESSION_PREFIX='orion-session-v1:';
export const RESOURCE_KEYS=['pv','san','pe'];
const validId=id=>typeof id==='string'&&/^local-[a-z0-9-]{8,100}$/i.test(id);
export function resourceMaxima(record){return Object.fromEntries(RESOURCE_KEYS.map(k=>{const n=record?.presentation?.resources?.[k];return[k,Number.isSafeInteger(n)&&n>=0&&n<=99999?n:null];}));}
export function readSession(record,storage=globalThis.localStorage){
 const maxima=resourceMaxima(record),fallback={version:1,characterId:record.id,revision:0,resources:{...maxima}};
 try{const raw=storage.getItem(SESSION_PREFIX+record.id);if(raw===null)return{state:fallback,valid:true};const s=JSON.parse(raw);if(s.version!==1||s.characterId!==record.id||!Number.isSafeInteger(s.revision)||s.revision<0||!RESOURCE_KEYS.every(k=>maxima[k]===null?s.resources?.[k]===null:Number.isSafeInteger(s.resources?.[k])&&s.resources[k]>=0&&s.resources[k]<=maxima[k]))return{state:fallback,valid:false};return{state:s,valid:true};}catch{return{state:fallback,valid:false};}
}
export async function changeResource(record,key,delta,{storage=globalThis.localStorage,locks=globalThis.navigator?.locks}={}){
 if(!validId(record?.id)||!RESOURCE_KEYS.includes(key)||![1,-1].includes(delta))throw Error('invalid-resource-change');
 const commit=()=>{const{state,valid}=readSession(record,storage),max=resourceMaxima(record)[key];if(!valid||max===null)throw Error('unavailable-resource');const next=Math.max(0,Math.min(max,state.resources[key]+delta));if(next===state.resources[key])return state;const updated={...state,revision:state.revision+1,resources:{...state.resources,[key]:next}},raw=JSON.stringify(updated);storage.setItem(SESSION_PREFIX+record.id,raw);if(storage.getItem(SESSION_PREFIX+record.id)!==raw)throw Error('storage-not-verified');return updated;};
 return locks?.request?locks.request(SESSION_PREFIX+record.id,commit):commit();
}
