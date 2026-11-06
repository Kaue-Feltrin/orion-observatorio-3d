export const PORTRAIT_LIMIT=6*1024*1024;
const types=new Set(['image/png','image/jpeg','image/webp']);
const validId=id=>typeof id==='string'&&/^local-[a-z0-9-]{8,100}$/i.test(id);
function database(){return new Promise((resolve,reject)=>{const request=indexedDB.open('orion-character-art-v1',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('portraits'))request.result.createObjectStore('portraits');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('storage-blocked'));});}
async function transaction(id,mode,action){if(!validId(id))throw Error('invalid-id');const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('portraits',mode),request=action(tx.objectStore('portraits'));let result;request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=tx.onabort=()=>{db.close();reject(tx.error||Error('art-storage-failed'))};});}
export async function readPortrait(id){const data=await transaction(id,'readonly',s=>s.get(id));return data?.blob instanceof Blob&&types.has(data.blob.type)&&data.blob.size<=PORTRAIT_LIMIT?data:null;}
export async function savePortrait(id,file){
 if(!types.has(file?.type)||file.size>PORTRAIT_LIMIT||file.size===0)throw Error('Use PNG, JPEG ou WebP de até 6 MB.');
 const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>16000000)throw Error('A imagem deve ter até 16 megapixels.');}catch(error){throw Error(error.message.includes('megapixels')?error.message:'Não foi possível ler essa imagem. Escolha outro arquivo.');}finally{URL.revokeObjectURL(url);}
 await transaction(id,'readwrite',s=>s.put({blob:file,updatedAt:new Date().toISOString()},id));
}
export const removePortrait=id=>transaction(id,'readwrite',s=>s.delete(id));
