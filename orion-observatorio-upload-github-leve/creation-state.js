// Identidade visual de demonstração. Não concede regras nem cria ficha no D1.
export const CREATION_DRAFT_KEY='orion-herald-creation-v1';
export const GENDERS=Object.freeze(['menino','menina','nao-definir']);
export function newCreation(){return {phase:'sealed',name:'',gender:null,continued:false};}
export function transitionCreation(state,event){
  if(event.type==='reveal'&&state.phase==='sealed')return {...state,phase:'revealed'};
  if(event.type==='mark'&&state.phase==='revealed')return {...state,phase:'breaking'};
  if(event.type==='released'&&state.phase==='breaking')return {...state,phase:'identity'};
  if(state.phase!=='identity')return state;
  if(event.type==='name')return {...state,name:String(event.value).slice(0,60),continued:false};
  if(event.type==='gender'&&(GENDERS.includes(event.value)||event.value===null))return {...state,gender:event.value,continued:false};
  if(event.type==='continue'&&canContinue(state)&&!state.continued)return {...state,name:state.name.trim(),continued:true};
  return state;
}
export function canContinue(state){return state.phase==='identity'&&GENDERS.includes(state.gender)&&state.name.trim().length>0&&state.name.trim().length<=60;}
