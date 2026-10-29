export function createPaperMotion(stage,{reducedMotion=false}={}){
 let busy=false,disposed=false,animations=[];
 const content=stage.querySelector('.paper-content'),leaf=stage.querySelector('.paper-landing'),sheet=stage.querySelector('.physical-sheet');
 const fold=document.createElement('div');fold.className='paper-fold-light';fold.setAttribute('aria-hidden','true');leaf.append(fold);
 async function run(node,frames,options){const a=node.animate(frames,options);animations.push(a);await a.finished.catch(()=>{});a.cancel();}
 return{get busy(){return busy;},async turn(commit,{backward=false,focus=null}={}){
  if(busy||disposed)return false;busy=true;stage.inert=true;stage.dataset.turn='out';sheet.setAttribute('aria-busy','true');
  const sign=backward?-1:1;
  try{
   if(!reducedMotion)await run(content,[{opacity:1,transform:'none'},{opacity:0,transform:`perspective(1400px) translateX(${-sign*24}px) rotateY(${-sign*7}deg)`}],{duration:220,easing:'cubic-bezier(.4,0,.7,1)',fill:'forwards'});
   content.style.opacity='0';if(disposed)return false;await commit();if(disposed)return false;stage.dataset.turn='in';content.style.opacity='1';
   await Promise.all([run(content,reducedMotion?[{opacity:0},{opacity:1}]:[{opacity:0,transform:`perspective(1400px) translateX(${sign*28}px) rotateY(${sign*9}deg)`},{opacity:1,transform:'none'}],{duration:reducedMotion?100:390,easing:'cubic-bezier(.16,.8,.22,1)',fill:'both'}),...(reducedMotion?[]:[run(fold,[{opacity:0,transform:`translateX(${sign*80}%)`},{opacity:.8,offset:.35},{opacity:0,transform:`translateX(${-sign*80}%)`}],{duration:500,easing:'ease-out'})])]);
   return true;
  }finally{if(!disposed){stage.inert=false;content.style.opacity='';delete stage.dataset.turn;sheet.setAttribute('aria-busy','false');focus?.()?.focus({preventScroll:true});}animations=[];busy=false;}
 },dispose(){disposed=true;animations.forEach(a=>a.cancel());fold.remove();}};
}
export async function landWorkshop(stage,{reducedMotion=false}={}){
 const planks=[...stage.querySelectorAll('.workshop-plank')];stage.dataset.phase='landing';
 if(!reducedMotion)await Promise.all(planks.map(async(plank,i)=>{
  const tilt=i%2?1:-1;const a=plank.animate([{transform:`translate3d(${tilt*4}%, -120vh, 340px) rotateX(58deg) rotateZ(${tilt*2.5}deg)`,opacity:0,easing:'cubic-bezier(.48,0,.8,.65)'},{transform:`translate3d(0, 7px, 0) rotateX(-1deg) rotateZ(${tilt*.12}deg)`,opacity:1,offset:.69,easing:'ease-out'},{transform:'translate3d(0,-3px,0) rotateX(.5deg)',offset:.83},{transform:'none',opacity:1}],{duration:880+i*22,delay:i*65,fill:'both'});await a.finished.catch(()=>{});plank.style.transform='none';a.cancel();
 }));
 else planks.forEach(p=>p.style.transform='none');
 document.documentElement.dataset.paperActive='1';stage.dataset.phase='paper';
 const leaf=stage.querySelector('.paper-landing'),a=leaf.animate(reducedMotion?[{opacity:0},{opacity:1}]:[{transform:'translate3d(0,-90vh,180px) rotateX(25deg) rotateZ(-3deg)',opacity:0,easing:'cubic-bezier(.32,0,.64,.78)'},{transform:'translate3d(0,4px,0) rotateX(-1deg) rotateZ(.3deg)',opacity:1,offset:.78},{transform:'translate3d(0,-1px,0) rotateZ(-.1deg)',offset:.9},{transform:'none',opacity:1}],{duration:reducedMotion?120:820,fill:'both'});await a.finished.catch(()=>{});leaf.style.opacity='1';a.cancel();
}
