import{HANDWRITING}from './handwriting-atlas.js';
const ns='http://www.w3.org/2000/svg';
let sequence=0;
const svg=(tag,attrs)=>{const node=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,v);return node;};
const distance=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
export const pencilSize=paperWidth=>({height:paperWidth*.35,width:paperWidth*.35/12});
export function prepareHandwriting(root){
 for(const letter of root.querySelectorAll('.ink-letter')){
  const text=letter.textContent,glyph=HANDWRITING[text];letter.setAttribute('aria-hidden','true');
  if(!glyph?.outline||!glyph.strokes.length)continue;
  const id='orionInk'+(++sequence),drawing=svg('svg',{viewBox:`0 -1000 ${glyph.advance} 1400`,'aria-hidden':'true',class:'handwriting-glyph'}),mask=svg('mask',{id,maskUnits:'userSpaceOnUse',x:-250,y:-1300,width:glyph.advance+500,height:2000});
  const strokes=glyph.strokes.map(points=>{const path=svg('path',{d:points.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join(' '),fill:'none',stroke:'white','stroke-width':110,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1});mask.append(path);return{path,points};});
  drawing.append(mask,svg('path',{d:glyph.outline,fill:'currentColor',mask:`url(#${id})`,class:'handwriting-outline'}));letter.replaceChildren(drawing);letter.classList.add('handwritten');letter.style.width=glyph.advance/1000+'em';letter._ink={glyph,strokes};
 }
}
export function revealHandwriting(root){for(const letter of root.querySelectorAll('.ink-letter')){letter.style.opacity='1';letter.style.clipPath='none';letter.querySelector('.handwriting-outline')?.removeAttribute('mask');}}
// One finite rAF clock, measured once per field. Ink and nib consume the same
// stroke progress; scrolling only subtracts scrollTop, with no per-frame layout.
export function writeField(row,{pencil,viewport}){
 let frame=null,settled=false,resolve;const finished=new Promise(r=>resolve=r),scrollStart=viewport.scrollTop,size=pencilSize(row.closest('.recruitment-paper').getBoundingClientRect().width),segments=[];
 pencil.style.width=size.width+'px';pencil.style.height=size.height+'px';
 let cursor=null;
 for(const letter of row.querySelectorAll('.ink-letter')){
  const rect=letter.getBoundingClientRect(),ink=letter._ink;
  if(ink){const scale=rect.height/1400;for(const stroke of ink.strokes){const points=stroke.points.map(([x,y])=>[rect.left+x*scale,rect.top+(y+1000)*scale]),lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+distance(points[i-1],points[i]));const start=points[0];if(cursor)segments.push({points:[cursor,start],lengths:[0,distance(cursor,start)],lift:true,weight:22+Math.min(45,distance(cursor,start))});segments.push({points,lengths,letter,path:stroke.path,weight:Math.max(12,lengths.at(-1)*3)});cursor=points.at(-1);}}
  else{const points=[[rect.left,rect.bottom-rect.height*.3],[rect.right,rect.bottom-rect.height*.3]];if(cursor)segments.push({points:[cursor,points[0]],lengths:[0,distance(cursor,points[0])],lift:true,weight:30});segments.push({points,lengths:[0,rect.width],letter,fallback:true,weight:Math.max(25,rect.width*3)});cursor=points.at(-1);}
 }
 const weight=segments.reduce((n,s)=>n+s.weight,0),duration=Math.max(650,Math.min(2200,weight)),factor=duration/(weight||1);let end=0;for(const s of segments){s.start=end;s.end=end+=s.weight*factor;}
 let last=null,elapsed=0,index=0;
 function settle(){if(settled)return;settled=true;if(frame!==null)cancelAnimationFrame(frame);revealHandwriting(row);pencil.dataset.contact='false';resolve();}
 function position(s,t){const target=s.lengths.at(-1)*t;let i=1;while(i<s.lengths.length-1&&s.lengths[i]<target)i++;const a=s.points[i-1]||s.points[0],b=s.points[i]||a,part=(target-(s.lengths[i-1]||0))/((s.lengths[i]||0)-(s.lengths[i-1]||0)||1),x=a[0]+(b[0]-a[0])*part,y=a[1]+(b[1]-a[1])*part-(viewport.scrollTop-scrollStart)-(s.lift?Math.sin(t*Math.PI)*10:0);pencil.style.transform=`translate3d(${x-size.width/2}px,${y-size.height}px,0) rotate(${-24+(s.lift?4:Math.sin(elapsed*.018)*1.4)}deg)`;pencil.dataset.contact=String(!s.lift);}
 function tick(now){if(settled)return;elapsed+=last===null||document.hidden?0:Math.max(0,now-last);last=document.hidden?null:now;
  while(index<segments.length&&elapsed>=segments[index].end){const s=segments[index++];if(s.letter)s.letter.style.opacity='1';if(s.path)s.path.style.strokeDashoffset='0';if(s.fallback)s.letter.style.clipPath='none';}
  if(index>=segments.length){settle();return;}const s=segments[index],t=Math.max(0,Math.min(1,(elapsed-s.start)/(s.end-s.start)));if(s.letter)s.letter.style.opacity='1';if(s.path)s.path.style.strokeDashoffset=String(1-t);if(s.fallback)s.letter.style.clipPath=`inset(0 ${(1-t)*100}% 0 0)`;position(s,t);frame=requestAnimationFrame(tick);
 }
 frame=requestAnimationFrame(tick);return{finished,cancel:settle};
}
