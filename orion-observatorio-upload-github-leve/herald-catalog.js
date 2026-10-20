// A criação de personagens preencherá esta coleção na próxima etapa.
// As duas entradas extras existem somente na prévia ?stars=2 ou ?stars=3.
export const MAX_HERALDS=3;
const nox=Object.freeze({id:'nox',name:'Nox',subtitle:'Vampiro puro',demo:false,
  stats:{level:'9',origin:'Garçom',trail:'—',rank:'Oficial de operações',em:'—',ec:'—'}});
const previewHeralds=[nox,...[2,3].map(number=>Object.freeze({
  id:`preview-${number}`,name:`Estrela ${number===2?'II':'III'}`,subtitle:'Estrela de demonstração',demo:true,
  stats:{level:'—',origin:'—',trail:'—',rank:'—',em:'—',ec:'—'}
}))];
export function heraldCount(value){
  const number=Number(value);
  return Number.isFinite(number)?Math.max(1,Math.min(MAX_HERALDS,Math.trunc(number))):1;
}
export function getHeralds(params=new URLSearchParams()){
  return previewHeralds.slice(0,heraldCount(params.get('stars')??1));
}
export function getHeraldLayout(count,aspect){
  if(count===1)return [{x:0,y:43,z:-470,scale:1}];
  const points=count===2?[[.32,.39],[.68,.46]]:[[.5,.30],[.25,.48],[.75,.48]];
  const height=2*Math.tan(52*Math.PI/360)*496,width=height*aspect;
  const scale=Math.min(1,Math.max(.45,aspect/.95));
  return points.map(([x,y])=>({x:(x-.5)*width,y:(.5-y)*height,z:-470,scale}));
}
const presentationKeys=['stars','quality','effects','hands','handsMotion','depth','depthMotion','foreground'];
export function observatoryURL(current){
  const source=new URL(current),url=new URL('index.html',source);
  for(const key of presentationKeys)if(source.searchParams.has(key))url.searchParams.set(key,source.searchParams.get(key));
  return url;
}
export function arrivalURL(current,herald){
  const url=new URL('ficha.html',current),source=observatoryURL(current);
  for(const [key,value] of source.searchParams)url.searchParams.set(key,value);
  url.searchParams.set('herald',herald.id);url.searchParams.set('via','observatory');return url;
}
