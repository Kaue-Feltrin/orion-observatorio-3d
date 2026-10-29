export const LOCAL_CREATION_KEY='orion-complete-draft-v1';
export function readSavedCreation(storage,key=LOCAL_CREATION_KEY){
 try{const raw=storage.getItem(key);if(!raw||raw.length>500000)return null;const d=JSON.parse(raw);
  if((key===LOCAL_CREATION_KEY&&d?.format!=='orion-observatorio-draft')||d?.version!==1||typeof d.name!=='string'||!d.name.trim()||!['menina','menino','nao-definir'].includes(d.gender)||!['COMBATENTE','ESPECIALISTA','OCULTISTA'].includes(d.classCode)||typeof d.origin?.code!=='string'||!d.character||typeof d.character!=='object')return null;
  return {...d,step:'class',creationStep:key===LOCAL_CREATION_KEY?'review':d.creationStep||'attributes'};
 }catch{return null;}
}
