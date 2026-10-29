import './scene-entrance.css';
export function prepareSceneEntrance({creationPage=false}={}){
 const overlay=document.getElementById('sceneLoading');if(!overlay||creationPage)return{play:async()=>{}};
 const map=document.createElement('div');map.className='entrance-map';map.setAttribute('aria-hidden','true');map.innerHTML='<svg viewBox="0 0 280 180"><path class="entrance-orbit" d="M140 24C222 24 257 135 140 157C23 135 58 24 140 24Z"/><path class="entrance-route" d="m58 115 43-62 42 51 58-70 26 84-84-14-34 49-51-38"/><g><circle cx="58" cy="115" r="2"/><circle cx="101" cy="53" r="3"/><circle cx="143" cy="104" r="4"/><circle cx="201" cy="34" r="2"/><circle cx="227" cy="118" r="3"/><circle cx="109" cy="153" r="2"/></g></svg>';overlay.prepend(map);
 const skip=document.createElement('button');skip.type='button';skip.className='entrance-skip';skip.textContent='Pular introdução';skip.hidden=true;overlay.append(skip);
 return{async play({reducedMotion=false}={}){
  let seen=false;try{seen=sessionStorage.getItem('orion-entrance-v24')==='seen';}catch{}
  if(reducedMotion||seen)return;
  overlay.dataset.entrance='reveal';overlay.querySelector('p').textContent='Uma luz. Uma história.';skip.hidden=false;
  const motion=overlay.animate([{opacity:1},{opacity:1,offset:.25},{opacity:0}],{duration:1450,easing:'cubic-bezier(.22,.65,.3,1)',fill:'forwards'});
  const sky=document.querySelector('#world');const reveal=sky.animate([{opacity:.3,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:1450,easing:'cubic-bezier(.2,.7,.2,1)'});
  const finish=()=>{motion.finish();reveal.finish();};skip.addEventListener('click',finish,{once:true});
  await motion.finished.catch(()=>{});skip.removeEventListener('click',finish);motion.cancel();reveal.cancel();skip.hidden=true;overlay.dataset.entrance='done';
  try{sessionStorage.setItem('orion-entrance-v24','seen');}catch{}
 }};
}
