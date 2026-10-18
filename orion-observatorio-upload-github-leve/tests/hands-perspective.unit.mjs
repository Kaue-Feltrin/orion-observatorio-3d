import assert from 'node:assert/strict';
import * as THREE from 'three';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {perspectiveFrameWeights,PERSPECTIVE_FRAMES,HAND_REACH_DEPTH,mapPerspectiveIndexV} from '../hands-perspective-motion.js';
import {createEtherealHandsMesh} from '../first-person-hands-mesh.js';

// A nova arte deve manter canvas e transparência reais, além do mock do loader.
const asset=sharp(fileURLToPath(new URL('../public/overlay/right-hand-pointing-smooth.webp',import.meta.url)));
const metadata=await asset.metadata(),statistics=await asset.stats();
assert.equal(metadata.width,1122);assert.equal(metadata.height,1402);assert.equal(metadata.hasAlpha,true);
assert.equal(statistics.channels[3].min,0);assert.ok(statistics.channels[3].max>200);
assert.equal(statistics.isOpaque,false,'nenhum retângulo opaco na cena');

for(let i=0;i<=4;i++){
  assert.deepEqual(perspectiveFrameWeights(i/4),[0,0,0,0,0].map((_,j)=>Number(i===j)));
}
for(let i=0;i<=1000;i++){
  const weights=perspectiveFrameWeights(i/1000),active=weights.flatMap((w,j)=>w>0?[j]:[]);
  assert.ok(Math.abs(weights.reduce((a,b)=>a+b,0)-1)<1e-12);
  assert.ok(active.length<=2&&active.every((j,k)=>k===0||j===active[k-1]+1),'somente vizinhos');
}
for(let from=0;from<5;from++)for(const to of [Math.max(0,from-1),Math.min(4,from+1)]){
  for(let u=0;u<=1;u+=.025){
    let previous=-Infinity;
    for(let v=0;v<=1;v+=.025){
      const mapped=mapPerspectiveIndexV(from,to,u,v);
      assert.ok(mapped>previous,'contorno monotônico, sem inversão');previous=mapped;
      assert.ok(Math.abs(mapPerspectiveIndexV(to,from,u,mapped)-v)<1e-10,'correspondência reversível');
    }
  }
}

// Sem quina de tangente nos encontros das colunas, incluindo a raiz presa.
for(const x of [100,150,180,220,270,320,370,420,480,530]){
  const u=x/1122,h=1e-6;
  const value=x=>mapPerspectiveIndexV(0,4,x,.9);
  const left=(value(u)-value(u-h))/h,right=(value(u+h)-value(u))/h;
  assert.ok(Math.abs(left-right)<.005,'contorno C1 no encontro '+x);
}
for(let u=.33;u<=1;u+=.01)for(let v=0;v<=1;v+=.01)
  assert.ok(Math.abs(mapPerspectiveIndexV(0,4,u,v)-v)<1e-6,'base/palma fora da extensão distal');

for(let stage=0;stage<4;stage++)for(const [u,v] of [[350/1122,1-520/1402],[.20,.50],[.29,.46],[.38,.46]])
  assert.equal(mapPerspectiveIndexV(4,stage,u,v),v,'articulação do médio e pontas dos três dedos fora do morph');

// Regressão da ponta achatada: medir o trecho real da imagem, não só o
// landmark central. A ponta e a falange distal não podem virar uma lâmina.
const {data:rgba,info}=await asset.clone().ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(const x of [100,150,180,220]){
  let top,bottom;
  for(let y=220;y<600;y++){
    const alpha=rgba[(y*info.width+x)*4+3];
    if(top===undefined&&alpha>64)top=y;
    if(top!==undefined&&alpha<=64){bottom=y-1;break;}
  }
  assert.ok(bottom>top,'ponta/falange presente na arte');
  const u=x/info.width,high=1-top/info.height,low=1-bottom/info.height;
  for(let stage=0;stage<=4;stage++){
    const ratio=(mapPerspectiveIndexV(4,stage,u,high)-mapPerspectiveIndexV(4,stage,u,low))/(high-low);
    assert.ok(ratio>.90&&ratio<1.10,'espessura preservada na ponta x='+x+', estágio='+stage+': '+ratio);
  }
}

const originalLoad=THREE.TextureLoader.prototype.load,requests=[];
THREE.TextureLoader.prototype.load=function(file,onLoad){
  requests.push(file);queueMicrotask(()=>onLoad(new THREE.Texture({width:1122,height:1402})));
};
try{
  const camera=new THREE.PerspectiveCamera(52,1920/1080,.2,900);
  const hands=createEtherealHandsMesh(camera,{animation:'perspective'});
  assert.equal(await hands.ready,true);
  assert.equal(hands.state.textureCount,2);assert.equal(hands.state.joints,18);
  assert.equal(hands.rightFrames.length,1);assert.equal(hands.rigs.length,2);
  assert.ok(!requests.some(file=>file.endsWith('right-hand-pointing.webp')),'não carrega a arte antiga de apontar');
  assert.deepEqual(requests,['/overlay/left-hand-ethereal.webp','/overlay/right-hand-pointing-smooth.webp']);
  const saved=hands.rigs.map(r=>new Float32Array(r.mesh.geometry.attributes.position.array));
  hands.update(2,0);
  assert.deepEqual(hands.state.rightFrameWeights,[1,0,0,0,0]);
  assert.equal(hands.state.drawSurfaces,2);assert.equal(hands.state.rightDepth,0);
  const whole=hands.rightFrames[0],map=whole.material.map;
  assert.equal(whole.geometry.index.count/3,10368);
  assert.equal(hands.state.triangles,11904,'contagem usa a geometria real');
  const levels=[...new Set(whole.geometry.attributes.uv.array.filter((_,i)=>i%2===1))].sort((a,b)=>a-b);
  for(let i=1;i<levels.length;i++)if(levels[i]>.39&&levels[i]<.84)assert.ok(levels[i]-levels[i-1]<.009,'amostras densas na região dos dedos');
  assert.equal(whole.material.onBeforeCompile,THREE.Material.prototype.onBeforeCompile,'sem recorte no shader');
  const visited=new Set([0]);hands.setStarHovered(true);
  for(let i=0;i<150;i++){
    hands.update(2,1/60);
    hands.state.rightFrameWeights.forEach((w,j)=>{if(w>.6)visited.add(j);});
    assert.equal(whole.material.map,map,'mesma imagem íntegra durante o gesto');
    assert.equal(whole.material.opacity,.46,'sem fade de dedos ou palma');
    assert.equal(hands.state.drawSurfaces,2,'uma superfície contínua para cada mão');
  }
  assert.deepEqual([...visited].sort(),[0,1,2,3,4],'todas as poses participam do hover');
  assert.ok(hands.state.rightDepth>HAND_REACH_DEPTH*.99);
  for(const rig of hands.rigs.filter(r=>r.pose!=='left')){
    const {landmarks}=rig.measure();
    assert.ok(landmarks.indexTip.z<landmarks.wrist.z-.08,'ponta avança para dentro da cena, punho ancorado');
    const target=rig.mesh.geometry.morphAttributes.position[4],uv=rig.mesh.geometry.attributes.uv;
    for(let i=0;i<target.count;i++){
      assert.ok(target.getZ(i)>=-HAND_REACH_DEPTH-1e-7&&target.getZ(i)<=0);
      if(uv.getY(i)<=.2)assert.ok(target.getZ(i)===0,'profundidade não desloca a saída do antebraço');
    }
  }
  // A mesma superfície deve manter orientação durante o gesto inteiro,
  // inclusive nos meios das passagens; não basta validar os extremos.
  const rig=hands.rigs.find(r=>r.pose==='perspective'),g=rig.mesh.geometry;
  const pos=g.attributes.position,uv=g.attributes.uv,tri=g.index;
  let minArea=Infinity,maxArea=0;
  for(let sample=0;sample<=40;sample++)for(const time of [0,2,5,9]){
    rig.update(time,false,sample/40);rig.measure();
    const points=Array.from({length:pos.count},(_,j)=>rig.mesh.getVertexPosition(j,new THREE.Vector3()));
    for(let j=0;j<tri.count;j+=3){
      const ids=[tri.getX(j),tri.getX(j+1),tri.getX(j+2)];
      const [a,b,c]=ids.map(k=>points[k]);
      const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
      const [x,y,z]=ids.map(k=>new THREE.Vector3().fromBufferAttribute(pos,k));
      const rest=(y.x-x.x)*(z.y-x.y)-(y.y-x.y)*(z.x-x.x);
      minArea=Math.min(minArea,area/rest);maxArea=Math.max(maxArea,area/rest);
      assert.ok(area/rest>.10&&area/rest<4,'sem inversão/compressão extrema: '+area/rest+' progresso='+sample/40+' tempo='+time+' UV='+ids.map(k=>[uv.getX(k),uv.getY(k)]).join(';'));
    }
  }
  for(const target of g.morphAttributes.position.slice(0,4))for(let j=0;j<uv.count;j++)if(uv.getY(j)<=.54){
    assert.equal(target.getX(j),pos.getX(j));assert.ok(target.getY(j)===pos.getY(j),'dedos recolhidos não recebem o morph de estender indicador');
  }
  console.log('Área relativa dos triângulos na sequência:',minArea,maxArea);
  // Interromper/reverter o gesto usa os mesmos quadros; nenhuma troca instantânea.
  hands.setStarHovered(false);hands.update(2,1/60);
  assert.ok(hands.state.rightBlend>.9);
  for(let i=0;i<150;i++)hands.update(2,1/60);
  assert.ok(hands.state.rightFrameWeights[0]>.999);
  assert.ok(hands.state.rightDepth<1e-5);
  hands.rigs.forEach((r,i)=>assert.deepEqual(r.mesh.geometry.attributes.position.array,saved[i]));
  const materials=hands.rightFrames.map(mesh=>mesh.material);
  let geometries=0,disposedMaterials=0,disposedTextures=0;
  for(const rig of hands.rigs)rig.mesh.geometry.addEventListener('dispose',()=>geometries++);
  for(const material of materials)material.addEventListener('dispose',()=>disposedMaterials++);
  for(const rig of hands.rigs)rig.mesh.material.map.addEventListener('dispose',()=>disposedTextures++);
  hands.beginTravel();for(let i=0;i<30;i++)hands.update(2,1/60);
  assert.equal(hands.state.visible,false);
  hands.dispose();hands.dispose();
  assert.equal(geometries,2);assert.equal(disposedMaterials,1);assert.equal(disposedTextures,2);
  const reduced=createEtherealHandsMesh(camera,{animation:'perspective',reducedMotion:true});
  await reduced.ready;reduced.setStarHovered(true);reduced.update(5,1/60);
  assert.deepEqual(reduced.state.rightFrameWeights,[0,0,0,0,1]);
  assert.equal(reduced.state.rightDepth,0);
  for(const rig of reduced.rigs){
    assert.ok(rig.bones.every(b=>b.rotation.z===0));
    if(rig.pose!=='left'){
      assert.deepEqual(rig.mesh.morphTargetInfluences,[0,0,0,0,0],'apontamento estático, sem profundidade');
      const staticPose=[...rig.mesh.morphTargetInfluences];rig.update(20,true,1);
      assert.deepEqual(rig.mesh.morphTargetInfluences,staticPose);
    }
  }
  reduced.dispose();
  const before=requests.length,off=createEtherealHandsMesh(camera,{animation:'perspective',enabled:false});
  assert.equal(await off.ready,false);assert.equal(requests.length,before);assert.equal(off.rigs.length,0);off.dispose();
}finally{THREE.TextureLoader.prototype.load=originalLoad;}
console.log('OK: mão íntegra, cinco contornos, sem fades/recortes, triângulos, profundidade, reversão, off/reduced e descarte.');
