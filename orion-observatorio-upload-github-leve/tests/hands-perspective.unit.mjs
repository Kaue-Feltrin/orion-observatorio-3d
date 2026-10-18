import assert from 'node:assert/strict';
import * as THREE from 'three';
import {indexLayerMask} from '../hands-index-layer.js';
import {perspectiveFrameWeights,PERSPECTIVE_FRAMES,HAND_REACH_DEPTH,mapPerspectiveIndexV} from '../hands-perspective-motion.js';
import {createEtherealHandsMesh} from '../first-person-hands-mesh.js';

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

// Regiões dos três dedos recolhidos, polegar e palma nunca participam
// do fade das artes do indicador.
for(let frame=0;frame<5;frame++)for(const [u,v] of [[.20,.50],[.29,.46],[.38,.46],[.23,.45],[.59,.44]])
  assert.equal(indexLayerMask(frame,u,v),0,'dedos/palma fora dos quadros misturados');
const originalLoad=THREE.TextureLoader.prototype.load,requests=[];
THREE.TextureLoader.prototype.load=function(file,onLoad){
  requests.push(file);queueMicrotask(()=>onLoad(new THREE.Texture({width:1122,height:1402})));
};
try{
  const camera=new THREE.PerspectiveCamera(52,1920/1080,.2,900);
  const hands=createEtherealHandsMesh(camera,{animation:'perspective'});
  assert.equal(await hands.ready,true);
  assert.equal(hands.state.textureCount,6);assert.equal(hands.state.joints,63);
  assert.equal(hands.rightFrames.length,5);assert.equal(hands.rigs.length,7);
  assert.ok(!requests.some(file=>file.endsWith('right-hand-pointing.webp')),'não carrega a arte antiga de apontar');
  for(const frame of PERSPECTIVE_FRAMES)assert.ok(requests.includes(frame.file));
  const saved=hands.rigs.map(r=>new Float32Array(r.mesh.geometry.attributes.position.array));
  hands.update(2,0);
  assert.deepEqual(hands.state.rightFrameWeights,[1,0,0,0,0]);
  assert.equal(hands.state.drawSurfaces,3);assert.equal(hands.state.rightDepth,0);
  const body=hands.rightBody,bodyMap=body.material.map;
  assert.equal(body.material.userData.handLayer,'body');
  assert.ok(hands.rightFrames.every(mesh=>mesh.material.userData.handLayer==='index'));
  const visited=new Set([0]);hands.setStarHovered(true);
  for(let i=0;i<150;i++){
    hands.update(2,1/60);
    assert.equal(body.material.opacity,.46,'dedos recolhidos não sofrem fade');
    assert.equal(body.material.map,bodyMap,'mesma arte dos dedos durante todo o gesto');
    assert.ok(hands.rigs.find(r=>r.role==='body').mesh.morphTargetInfluences.slice(0,2).every(v=>v===0));
    hands.state.rightFrameWeights.forEach((w,j)=>{if(w>.6)visited.add(j);});
    assert.ok(hands.state.drawSurfaces<=4,'orçamento de superfícies mantido');
  }
  assert.deepEqual([...visited].sort(),[0,1,2,3,4],'todas as poses participam do hover');
  assert.ok(hands.state.rightDepth>HAND_REACH_DEPTH*.99);
  for(const rig of hands.rigs.filter(r=>r.pose!=='left')){
    const {landmarks}=rig.measure();
    assert.ok(landmarks.indexTip.z<landmarks.wrist.z-.08,'ponta avança para dentro da cena, punho ancorado');
    const target=rig.mesh.geometry.morphAttributes.position[2],uv=rig.mesh.geometry.attributes.uv;
    for(let i=0;i<target.count;i++){
      assert.ok(target.getZ(i)>=-HAND_REACH_DEPTH-1e-7&&target.getZ(i)<=0);
      if(uv.getY(i)<=.2)assert.ok(target.getZ(i)===0,'profundidade não desloca a saída do antebraço');
    }
  }
  // Interromper/reverter o gesto usa os mesmos quadros; nenhuma troca instantânea.
  hands.setStarHovered(false);hands.update(2,1/60);
  assert.ok(hands.state.rightBlend>.9);
  for(let i=0;i<150;i++)hands.update(2,1/60);
  assert.ok(hands.state.rightFrameWeights[0]>.999);
  assert.ok(hands.state.rightDepth<1e-5);
  hands.rigs.forEach((r,i)=>assert.deepEqual(r.mesh.geometry.attributes.position.array,saved[i]));
  const materials=[...hands.rightFrames.map(mesh=>mesh.material),body.material];
  let geometries=0,disposedMaterials=0,disposedTextures=0;
  for(const rig of hands.rigs)rig.mesh.geometry.addEventListener('dispose',()=>geometries++);
  for(const material of materials)material.addEventListener('dispose',()=>disposedMaterials++);
  for(const texture of new Set(hands.rigs.map(rig=>rig.mesh.material.map)))texture.addEventListener('dispose',()=>disposedTextures++);
  hands.beginTravel();for(let i=0;i<30;i++)hands.update(2,1/60);
  assert.equal(hands.state.visible,false);
  hands.dispose();hands.dispose();
  assert.equal(geometries,7);assert.equal(disposedMaterials,6);assert.equal(disposedTextures,6);
  const reduced=createEtherealHandsMesh(camera,{animation:'perspective',reducedMotion:true});
  await reduced.ready;reduced.setStarHovered(true);reduced.update(5,1/60);
  assert.deepEqual(reduced.state.rightFrameWeights,[0,0,0,0,1]);
  assert.equal(reduced.state.rightDepth,0);
  for(const rig of reduced.rigs){
    assert.ok(rig.bones.every(b=>b.rotation.z===0));
    assert.ok((rig.mesh.morphTargetInfluences||[]).every(v=>v===0));
  }
  reduced.dispose();
  const before=requests.length,off=createEtherealHandsMesh(camera,{animation:'perspective',enabled:false});
  assert.equal(await off.ready,false);assert.equal(requests.length,before);assert.equal(off.rigs.length,0);off.dispose();
}finally{THREE.TextureLoader.prototype.load=originalLoad;}
console.log('OK: cinco poses, blend de vizinhos, profundidade, reversão, buffers estáticos, off/reduced e descarte.');
