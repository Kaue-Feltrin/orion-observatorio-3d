// Observatório v0.9.20 · dois campos de animação independentes.
// UV local da imagem inteira (0..1), sem atlas compartilhado.
export const MESH_COLS=32;
export const MESH_ROWS=24;
export const HAND_PROFILES=Object.freeze({
  left: Object.freeze({
    id:'left-framing',limit:.009,
    index:{x:.58,y:.73,px:.48,py:.48,rx:.25,ry:.31},
    thumb:{x:.72,y:.44,px:.55,py:.37,rx:.24,ry:.20},
    indexAmplitude:.027,thumbAmplitude:.018,phase:.38
  }),
  right:Object.freeze({
    id:'right-pointing',limit:.012,
    index:{x:.27,y:.79,px:.43,py:.63,rx:.25,ry:.24},
    thumb:{x:.28,y:.52,px:.45,py:.43,rx:.22,ry:.18},
    indexAmplitude:.046,thumbAmplitude:.026,phase:1.16
  })
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function influence(u,v,b){
  const x=(u-b.x)/b.rx,y=(v-b.y)/b.ry;
  return Math.exp(-2.3*(x*x+y*y));
}
function rotated(u,v,p,a){
  const dx=u-p.px,dy=v-p.py,s=Math.sin(a),c=Math.cos(a);
  return [dx*c-dy*s-dx,dx*s+dy*c-dy];
}
export function deformHandVertices(rest,positions,uv,side,seconds,mouseX=0,mouseY=0,reduceMotion=false){
  if(!HAND_PROFILES[side])throw new Error('Lado da mão não reconhecido');
  if(rest.length!==positions.length||rest.length/3*2!==uv.length)
    throw new Error('Geometria de mãos incompatível');
  if(reduceMotion){positions.set(rest);return 0;}
  const p=HAND_PROFILES[side];
  const look=clamp(mouseX,-1,1),glance=clamp(mouseY,-1,1);
  const indexAngle=p.indexAmplitude*Math.sin(seconds*.83+p.phase)+look*.012;
  const thumbAngle=p.thumbAmplitude*Math.sin(seconds*.65+p.phase+1.4)-glance*.008;
  let max=0;
  for(let i=0,n=rest.length/3;i<n;i++){
    const j=i*3,k=i*2,u=uv[k],v=uv[k+1];
    const wi=influence(u,v,p.index),wt=influence(u,v,p.thumb);
    const [ix,iy]=rotated(u,v,p.index,indexAngle);
    const [tx,ty]=rotated(u,v,p.thumb,thumbAngle);
    const dx=clamp(ix*wi+tx*wt,-p.limit,p.limit);
    const dy=clamp(iy*wi+ty*wt,-p.limit,p.limit);
    positions[j]=rest[j]+dx;
    positions[j+1]=rest[j+1]+dy;
    positions[j+2]=rest[j+2];
    max=Math.max(max,Math.abs(dx),Math.abs(dy));
  }
  return max;
}
