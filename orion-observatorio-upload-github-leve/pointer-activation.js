// A deliberate pointer tap activates game controls even when Chrome suppresses
// the compatibility click after a drag. Scrolling/dragging never activates them.
// Native mouse clicks and keyboard activation retain the button's semantics.
export function bindPointerActivation(button,activate){
 let press=null,lastTouch=-Infinity;
 const down=e=>{if(e.isPrimary&&(e.pointerType==='touch'||e.pointerType==='pen')&&!button.disabled)press={id:e.pointerId,x:e.clientX,y:e.clientY};};
 const move=e=>{if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10)press=null;};
 const cancel=()=>{press=null;};
 const up=e=>{const start=press;press=null;if(!start||e.pointerId!==start.id||button.disabled||Math.hypot(e.clientX-start.x,e.clientY-start.y)>10)return;if(!button.contains(document.elementFromPoint(e.clientX,e.clientY)))return;lastTouch=performance.now();activate(e);};
 const click=e=>{if(e.detail>0&&e.pointerType!=='mouse'&&performance.now()-lastTouch<700){e.preventDefault();return;}activate(e);};
 button.addEventListener('pointerdown',down);button.addEventListener('pointermove',move);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',cancel);button.addEventListener('click',click);
 return()=>{button.removeEventListener('pointerdown',down);button.removeEventListener('pointermove',move);button.removeEventListener('pointerup',up);button.removeEventListener('pointercancel',cancel);button.removeEventListener('click',click);};
}
