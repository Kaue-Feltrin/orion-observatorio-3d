// v0.9.19: campo de deformação 2,5D contínuo. Coordenadas UV locais 0..1.
// Nenhum vertex é separado e os UVs da arte original permanecem intocados.
export const MESH_COLS=32;
export const MESH_ROWS=24;

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const weight=(u,v,x,y,rx,ry)=>{
  const dx=(u-x)/rx,dy=(v-y)/ry;
  return Math.exp(-2.25*(dx*dx+dy*dy));
};
export function deformHandVertices(rest,positions,uvLocal,side,seconds,mouseX=0,mouseY=0,reduceMotion=false){
  if(rest.length!==positions.length||rest.length/3*2!==uvLocal.length)
    throw new Error('Geometria de mãos incompatível');
  const left=side==='left',sym=left?1:-1;
  const look=reduceMotion?0:clamp(mouseX,-1,1);
  const glance=reduceMotion?0:clamp(mouseY,-1,1);
  const indexAngle=reduceMotion?0:(.018*Math.sin(seconds*.77+(left?.3:1.1))+.008*look)*sym;
  const thumbAngle=reduceMotion?0:(.020*Math.sin(seconds*.56+(left?1.2:.6))-.009*glance)*sym;
  const pivotIx=left?.27:.73,pivotIy=.26;
  const pivotTx=left?.28:.72,pivotTy=.16;
  // Pré-calcular seno/cosseno evita custo por vértice.
  const si=Math.sin(indexAngle),ci=Math.cos(indexAngle);
  const st=Math.sin(thumbAngle),ct=Math.cos(thumbAngle);
  let maxDelta=0;
  for(let i=0,n=rest.length/3;i<n;i++){
    const j=i*3,k=i*2,u=uvLocal[k],v=uvLocal[k+1];
    const wi=weight(u,v,left?.39:.61,.47,.25,.30);
    const wt=weight(u,v,left?.48:.52,.105,.24,.15);
    const diX=u-pivotIx,diY=v-pivotIy;
    const dtX=u-pivotTx,dtY=v-pivotTy;
    const du=(diX*ci-diY*si-diX)*wi+(dtX*ct-dtY*st-dtX)*wt;
    const dv=(diX*si+diY*ci-diY)*wi+(dtX*st+dtY*ct-dtY)*wt;
    // Limite técnico: nunca permitir deslocar um ponto > 1.2% da mão.
    const dx=clamp(du,-.012,.012),dy=clamp(dv,-.012,.012);
    positions[j]=rest[j]+dx;
    positions[j+1]=rest[j+1]+dy;
    positions[j+2]=rest[j+2];
    maxDelta=Math.max(maxDelta,Math.abs(dx),Math.abs(dy));
  }
  return maxDelta;
}
