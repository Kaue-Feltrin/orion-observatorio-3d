// Recorte de renderização, sem modificar os WebPs. Só o indicador troca de arte;
// palma, polegar e dedos recolhidos usam uma única imagem animada pelo rig.
const COLUMNS=[150,180,220,270,320,370,420,480,530].map(x=>x/1122);
const LOW_EDGES=[
  [503,522,518,489,478,475,496,550,588],
  [434,434,454,451,459,476,497,543,586],
  [398,398,429,448,483,508,529,579,617],
  [388,388,428,458,484,513,529,577,612],
  [393,393,437,472,501,523,546,603,641]
].map(row=>row.map(y=>1-y/1402));
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function indexLayerMask(frame,u,v){
  let i=0;while(i<7&&u>COLUMNS[i+1])i++;
  const t=Math.max(0,Math.min(1,(u-COLUMNS[i])/(COLUMNS[i+1]-COLUMNS[i])));
  const cut=LOW_EDGES[frame][i]*(1-t)+LOW_EDGES[frame][i+1]*t;
  return smooth(cut-.003,cut+.003,v)*(1-smooth(.39,.48,u));
}
export function isolateHandIndex(material,frame,{body=false}={}){
  material.userData.handLayer=body?'body':'index';
  material.onBeforeCompile=shader=>{
    shader.uniforms.orionIndexCut={value:LOW_EDGES[frame]};
    shader.uniforms.orionBodyLayer={value:body?1:0};
    shader.fragmentShader=`uniform float orionIndexCut[9];
uniform float orionBodyLayer;
float orionHandIndexMask(vec2 uv){
  float columns[9];
  ${COLUMNS.map((v,i)=>`columns[${i}]=${v.toFixed(9)};`).join('\n  ')}
  float cut=orionIndexCut[0];
  for(int i=0;i<8;i++){
    float t=clamp((uv.x-columns[i])/(columns[i+1]-columns[i]),0.0,1.0);
    if(uv.x>=columns[i])cut=mix(orionIndexCut[i],orionIndexCut[i+1],t);
  }
  return smoothstep(cut-0.003,cut+0.003,uv.y)*(1.0-smoothstep(0.39,0.48,uv.x));
}
`+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>',
      `#include <alphamap_fragment>
       float indexMask=orionHandIndexMask(vMapUv);
       diffuseColor.a*=mix(indexMask,1.0-indexMask,orionBodyLayer);`);
  };
  material.customProgramCacheKey=()=> 'orion-hand-index-cutout-v1';
  material.needsUpdate=true;
}
