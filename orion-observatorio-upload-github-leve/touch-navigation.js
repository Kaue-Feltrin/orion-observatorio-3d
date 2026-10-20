// Navegação por arrasto, sem hover sintético, giroscópio ou loop próprio.
export function createTouchNavigation({root,mouse,reducedMotion,isLocked,onDismiss}){
  const state={dragging:false,gestures:0};
  let gesture=null,suppressClick=false;
  const interactive=node=>{
    const control=node.closest('button,a,input,summary,#heraldCard,.debug');
    return control&&control.id!=='heraldTarget';
  };
  const clamp=value=>Math.max(-.65,Math.min(.65,value));
  function down(event){
    if(event.pointerType!=='touch'){suppressClick=false;return;}
    if(isLocked())return;
    // Um segundo dedo cancela o arrasto; o navegador pode tratar pinch-zoom.
    if(gesture){cancel();return;}
    suppressClick=false;
    if(!event.isPrimary||interactive(event.target))return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,viewX:mouse.x,viewY:mouse.y,
      star:!!event.target.closest('#heraldTarget')};
  }
  function move(event){
    if(!gesture||event.pointerId!==gesture.id||isLocked())return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(!state.dragging&&Math.hypot(dx,dy)<10)return;
    if(!state.dragging){
      state.dragging=true;state.gestures++;onDismiss();
      root.setPointerCapture(event.pointerId);
    }
    if(!reducedMotion){
      mouse.x=clamp(gesture.viewX-dx/root.clientWidth*1.3);
      mouse.y=clamp(gesture.viewY+dy/root.clientHeight*1.3);
    }
  }
  function end(event){
    if(!gesture||event.pointerId!==gesture.id)return;
    // O navegador pode agrupar movimentos entre quadros; preservar o ponto
    // final também em um arrasto rápido, sem depender de mais pointermove.
    move(event);
    suppressClick=state.dragging;
    if(!state.dragging&&!gesture.star)onDismiss();
    const id=gesture.id;gesture=null;state.dragging=false;
    if(root.hasPointerCapture(id))root.releasePointerCapture(id);
  }
  function cancel(){
    if(!gesture)return;
    const id=gesture.id;gesture=null;state.dragging=false;suppressClick=true;
    if(root.hasPointerCapture(id))root.releasePointerCapture(id);
  }
  function lostCapture(event){
    // A captura implícita começa no elemento tocado. Sua transferência para
    // o observatório emite lostpointercapture no filho, sem encerrar o gesto.
    if(event.target===root&&!root.hasPointerCapture(event.pointerId))cancel();
  }
  function click(event){
    if(!suppressClick||event.detail===0)return;
    suppressClick=false;event.preventDefault();event.stopImmediatePropagation();
  }
  root.addEventListener('pointerdown',down);
  root.addEventListener('pointermove',move);
  root.addEventListener('pointerup',end);
  root.addEventListener('pointercancel',cancel);
  root.addEventListener('lostpointercapture',lostCapture);
  root.addEventListener('click',click,true);
  window.addEventListener('blur',cancel);
  return {state,cancel,dispose(){
    cancel();
    root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);
    root.removeEventListener('pointerup',end);root.removeEventListener('pointercancel',cancel);
    root.removeEventListener('lostpointercapture',lostCapture);root.removeEventListener('click',click,true);
    window.removeEventListener('blur',cancel);
  }};
}
