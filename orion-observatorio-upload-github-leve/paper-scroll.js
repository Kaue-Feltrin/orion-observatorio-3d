// One cancellable clock for automatic paper scrolling. User input wins.
export const scrollEase=t=>(1-Math.cos(Math.PI*Math.max(0,Math.min(1,t))))/2;
export function createPaperScroll(container,{reducedMotion=false}={}){
 let frame=null,resolve=null,disposed=false;
 function cancel(){if(frame!==null)cancelAnimationFrame(frame);frame=null;delete container.dataset.autoScrolling;resolve?.(false);resolve=null;}
 function top(value){cancel();if(disposed)return Promise.resolve(false);const start=container.scrollTop,end=Math.max(0,Math.min(Number(value)||0,container.scrollHeight-container.clientHeight)),distance=end-start;
  if(reducedMotion||Math.abs(distance)<2){container.scrollTop=end;return Promise.resolve(true);}
  container.dataset.autoScrolling='1';
  const duration=Math.min(850,480+Math.abs(distance)*.14);let elapsed=0,last=null;return new Promise(done=>{resolve=done;function tick(now){elapsed+=last===null?16:Math.min(64,Math.max(0,now-last));last=now;const t=Math.min(1,elapsed/duration);container.scrollTop=start+distance*scrollEase(t);if(t<1)frame=requestAnimationFrame(tick);else{frame=null;delete container.dataset.autoScrolling;resolve=null;done(true);}}frame=requestAnimationFrame(tick);});
 }
 function to(element,{offset=24}={}){return element?top(container.scrollTop+element.getBoundingClientRect().top-container.getBoundingClientRect().top-offset):Promise.resolve(false);}
 const key=e=>{if(['Tab','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key)||e.target.matches?.('input,textarea,select')&&!['Shift','Control','Alt','Meta'].includes(e.key))cancel();};
 for(const event of ['wheel','touchstart','pointerdown'])container.addEventListener(event,cancel,{passive:true});container.addEventListener('keydown',key);
 return{top,to,cancel,get running(){return frame!==null;},dispose(){disposed=true;cancel();for(const event of ['wheel','touchstart','pointerdown'])container.removeEventListener(event,cancel);container.removeEventListener('keydown',key);}};
}
