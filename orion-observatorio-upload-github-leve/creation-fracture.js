import * as THREE from 'three';

export const RELEASE_SECONDS=2.8;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x)};
export function sampleCreationRelease(seconds,reduced=false){
 const t=Math.max(0,seconds);
 if(reduced){const p=smooth(0,.18,t);return {charge:0,fracture:p,baby:1-p,children:p,separation:1,particles:0,complete:t>=.18};}
 return {charge:smooth(0,.25,t)*(1-smooth(.5,.9,t)),fracture:smooth(.22,1.95,t),
  baby:1-smooth(.85,1.9,t),children:smooth(1.15,2.65,t),
  separation:smooth(1.15,2.8,t),particles:smooth(.6,.9,t),complete:t>=RELEASE_SECONDS};
}
const hash=n=>{const v=Math.sin(n*127.1+39.7)*43758.5453;return v-Math.floor(v)};
function clip(poly,nx,ny,c){
 const out=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*nx+a[1]*ny-c,db=b[0]*nx+b[1]*ny-c;
  if(da<=1e-9)out.push(a);
  if((da<0)!==(db<0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
 }
 return out;
}
// Non-overlapping Voronoi fragments. Each cell keeps its original UV region;
// there is no separate texture/draw call for every fragment.
export function fractureCells(columns=6,rows=6){
 const seeds=Array.from({length:columns*rows},(_,i)=>[(i%columns+.2+.6*hash(i+1))/columns,(Math.floor(i/columns)+.2+.6*hash(i+130))/rows]);
 return seeds.map((seed,id)=>{
  let polygon=[[0,0],[1,0],[1,1],[0,1]];
  for(const other of seeds){if(other===seed)continue;polygon=clip(polygon,other[0]-seed[0],other[1]-seed[1],(other[0]**2+other[1]**2-seed[0]**2-seed[1]**2)/2);if(!polygon.length)break;}
  return {seed,id,polygon};
 });
}
export function createFractureGeometry(columns=6,rows=6){
 const positions=[],uv=[],centers=[],seeds=[],edge=[];
 for(const cell of fractureCells(columns,rows)){
  const [cx,cy]=cell.seed;
  for(let i=0;i<cell.polygon.length;i++){
   const a=cell.polygon[i],b=cell.polygon[(i+1)%cell.polygon.length];
   const altitude=Math.abs((b[0]-a[0])*(cy-a[1])-(b[1]-a[1])*(cx-a[0]))/Math.max(1e-8,Math.hypot(b[0]-a[0],b[1]-a[1]));
   for(const [j,p]of [[0,cell.seed],[1,a],[2,b]]){positions.push(p[0]-.5,p[1]-.5,0);uv.push(...p);centers.push(cx-.5,cy-.5);seeds.push(hash(cell.id+17));edge.push(j===0?altitude:0);}
  }
 }
 const g=new THREE.BufferGeometry();
 for(const [name,data,size]of [['position',positions,3],['uv',uv,2],['aCenter',centers,2],['aSeed',seeds,1],['aEdge',edge,1]])g.setAttribute(name,new THREE.Float32BufferAttribute(data,size));
 g.computeBoundingSphere();return g;
}
