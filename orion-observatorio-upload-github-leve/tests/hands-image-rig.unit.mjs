import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createHandImageRig} from '../hands-image-rig.js';
import {createEtherealHandsMesh} from '../first-person-hands-mesh.js';

for(const pose of ['left','neutral','pointing']){
  const geometry=new THREE.PlaneGeometry(1,1,36,28);
  const material=new THREE.MeshBasicMaterial();
  const rig=createHandImageRig(geometry,material,pose);
  const positions=geometry.getAttribute('position'),original=new Float32Array(positions.array);
  const weights=geometry.getAttribute('skinWeight'),indices=geometry.getAttribute('skinIndex');
  assert.equal(rig.mesh.isSkinnedMesh,true);
  assert.equal(rig.bones.length,9);
  for(let i=0;i<weights.count;i++){
    let total=0;
    for(let j=0;j<4;j++){
      const weight=weights.array[i*4+j],index=indices.array[i*4+j];
      assert.ok(Number.isFinite(weight)&&weight>=0&&weight<=1);
      assert.ok(index>=0&&index<9);total+=weight;
    }
    assert.ok(Math.abs(total-1)<1e-6,'pesos normalizados');
  }
  const point=new THREE.Vector3(),vertices=[];
  for(let sample=0;sample<24;sample++){
    rig.update(sample*.7);
    const measured=rig.measure();
    assert.ok(measured.maxVertexDelta>0&&measured.maxVertexDelta<.012,
      pose+' mantém o deslocamento abaixo de 1,2% da imagem: '+measured.maxVertexDelta);
    for(let i=0;i<positions.count;i++)vertices[i]=rig.mesh.getVertexPosition(i,point).clone();
    const tri=geometry.index;
    for(let i=0;i<tri.count;i+=3){
      const a=vertices[tri.getX(i)],b=vertices[tri.getX(i+1)],c=vertices[tri.getX(i+2)];
      const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
      const ia=tri.getX(i)*3,ib=tri.getX(i+1)*3,ic=tri.getX(i+2)*3;
      const restArea=(original[ib]-original[ia])*(original[ic+1]-original[ia+1])-
        (original[ib+1]-original[ia+1])*(original[ic]-original[ia]);
      assert.ok(area/restArea>.70&&area/restArea<1.30,'sem inversão ou estiramento excessivo de triângulos');
    }
  }
  rig.update(1);const before=rig.measure();
  rig.update(4);const after=rig.measure();
  for(const name of ['palm','indexTip','thumbTip','middleTip','ringTip','littleTip']){
    assert.ok(before.landmarks[name].distanceTo(after.landmarks[name])>1e-6,name+' articula de fato');
  }
  assert.deepEqual(positions.array,original,'animação usa ossos, sem reescrever os vértices em CPU');
  rig.update(5,true);
  assert.ok(rig.measure().maxVertexDelta<1e-6,'reduced-motion recupera a imagem sem deformação');
  for(const bone of rig.bones)assert.equal(bone.rotation.z,0);
  rig.mesh.skeleton.computeBoneTexture();
  let disposed=0;
  rig.mesh.skeleton.boneTexture.addEventListener('dispose',()=>disposed++);
  rig.dispose();rig.dispose();assert.equal(disposed,1,'textura de ossos descartada uma vez');
  geometry.dispose();material.dispose();
}

const originalLoad=THREE.TextureLoader.prototype.load;
let requests=0;
THREE.TextureLoader.prototype.load=function(file,onLoad){
  requests++;queueMicrotask(()=>onLoad(new THREE.Texture({width:1122,height:1402})));
};
try {
  const camera=new THREE.PerspectiveCamera(52,1920/1080,.2,900);
  const hands=createEtherealHandsMesh(camera,{animation:'rig'});
  assert.equal(await hands.ready,true);
  assert.equal(hands.rigs.length,3);
  assert.equal(hands.state.joints,27);
  assert.equal(hands.state.fingerJoints,21);
  assert.equal(hands.state.drawSurfaces,2);
  hands.update(3,1/60);
  assert.ok(hands.state.maxVertexDelta<.012,'skinning também correto com escala/ancoragem da câmera');
  const neutral=hands.root.getObjectByName('OrionFeminineRightNeutral');
  assert.equal(neutral.isSkinnedMesh,true);
  assert.notEqual(neutral.geometry,hands.meshes[1].geometry,'pesos próprios para o indicador neutro');
  hands.setStarHovered(true);
  for(let i=0;i<90;i++)hands.update(3+i/60,1/60);
  assert.equal(neutral.visible,false);
  hands.beginTravel();
  for(let i=0;i<30;i++)hands.update(5+i/60,1/60);
  assert.equal(hands.state.visible,false);
  let geometries=0;
  for(const rig of hands.rigs)rig.mesh.geometry.addEventListener('dispose',()=>geometries++);
  hands.dispose();hands.dispose();assert.equal(geometries,3);
  const before=requests,off=createEtherealHandsMesh(camera,{animation:'rig',enabled:false});
  assert.equal(await off.ready,false);assert.equal(off.rigs.length,0);assert.equal(requests,before);off.dispose();
} finally {THREE.TextureLoader.prototype.load=originalLoad;}
console.log('OK: rig MMV, pesos, dedos, limites, triângulos, reduced-motion, hover/viagem e descarte.');
