// Navegação guiada no toque. Usa o loop da cena, sem RAF adicional.
export function mobileHeraldLayout(count,aspect,position=0,summary=0){
 const height=2*Math.tan(52*Math.PI/360)*496,width=height*aspect;
 const landscape=aspect>1;
 const centerX=landscape?.5-.22*summary:.5;
 const centerY=landscape?.34+.12*summary:.36-.13*summary;
 return Array.from({length:count},(_,index)=>({
  x:(index-position)*width*1.12+(centerX-.5)*width+position*8,
  y:(.5-centerY)*height,z:-470,scale:Math.min(1,Math.max(.65,aspect/.95))
 }));
}
export function createMobileConstellation({root,heralds,reducedMotion,isLocked,onChange}){
 const nav=document.getElementById('starBrowser'),name=document.getElementById('browseName');
 const count=document.getElementById('browseCount'),pages=document.getElementById('starPages');
 const prev=document.getElementById('previousStar'),next=document.getElementById('nextStar');
 const instruction=document.getElementById('swipeHint');
 const state={index:0,position:0,summary:0,settled:true,changes:0};
 const dots=heralds.map((entry,index)=>{
  const button=document.createElement('button');button.type='button';button.className='star-page';
  button.setAttribute('aria-label',`Mostrar ${entry.data.name}, ${index+1} de ${heralds.length}`);
  button.addEventListener('click',()=>choose(index));pages.appendChild(button);return button;
 });
 nav.hidden=false;nav.dataset.single=String(heralds.length===1);
 function render(){
  name.textContent=heralds[state.index].data.name;count.textContent=`${state.index+1} / ${heralds.length}`;
  prev.disabled=state.index===0;next.disabled=state.index===heralds.length-1;
  dots.forEach((dot,index)=>dot.setAttribute('aria-current',String(index===state.index)));
  instruction.textContent='Deslize para mudar de estrela';
 }
 function choose(index){
  if(isLocked())return false;
  const value=Math.max(0,Math.min(heralds.length-1,index));
  if(value===state.index)return false;
  state.index=value;state.changes++;state.settled=reducedMotion;
  if(reducedMotion)state.position=value;
  root.dataset.browseMoving=String(!state.settled);onChange(heralds[value]);render();return true;
 }
 function update(delta,summary){
  const gain=reducedMotion?1:1-Math.exp(-Math.max(0,delta)*12);
  state.position+=(state.index-state.position)*gain;
  state.summary+=(Number(summary)-state.summary)*gain;
  state.settled=Math.abs(state.index-state.position)<.002;
  if(state.settled)state.position=state.index;
  const moving=String(!state.settled);
  if(root.dataset.browseMoving!==moving)root.dataset.browseMoving=moving;
  const inert=!!summary||isLocked();if(nav.inert!==inert)nav.inert=inert;
  for(const [index,entry] of heralds.entries()){
   const hidden=index!==state.index,disabled=hidden||!state.settled||isLocked();
   if(entry.target.hidden!==hidden)entry.target.hidden=hidden;
   if(entry.target.tabIndex!==(hidden?-1:0))entry.target.tabIndex=hidden?-1:0;
   if(entry.target.disabled!==disabled)entry.target.disabled=disabled;
  }
 }
 prev.addEventListener('click',()=>choose(state.index-1));next.addEventListener('click',()=>choose(state.index+1));
 root.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.target.closest('#heraldCard,input,.debug'))return;
  event.preventDefault();choose(state.index+(event.key==='ArrowRight'?1:-1));
 });
 render();update(0,false);
 return {state,choose,step:direction=>choose(state.index+direction),update};
}
