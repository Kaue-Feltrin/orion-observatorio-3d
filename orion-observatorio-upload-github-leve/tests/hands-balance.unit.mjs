import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createEtherealHandsMesh} from '../first-person-hands-mesh.js';

const load=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(file,onLoad){
  queueMicrotask(()=>onLoad(new THREE.Texture({width:1122,height:1402})));
};
try{
  for(const [width,height] of [[1920,1080],[1920,951],[390,844]])for(const animation of ['mesh','rig','perspective']){
    const camera=new THREE.PerspectiveCamera(52,width/height,.2,900);
    const hands=createEtherealHandsMesh(camera,{animation,reducedMotion:true});await hands.ready;
    const [left,right]=hands.meshes;
    const visibleRight=animation==='perspective'?right:hands.root.getObjectByName('OrionFeminineRightNeutral');
    assert.equal(left.material.opacity,.38);assert.equal(visibleRight.material.opacity,.38);
    assert.deepEqual(left.scale,right.scale,'mesma escala horizontal e vertical nos três enquadramentos');
    assert.ok(Math.abs(left.position.x+right.position.x)<1e-10,'margens espelhadas');
    assert.equal(left.position.y,right.position.y,'mesma altura de ancoragem');
    assert.equal(left.position.z,right.position.z);
    const start=left.position.clone();hands.setStarHovered(true);hands.update(0,1/60);
    assert.equal(hands.state.leftFollow,0,'reduced-motion não movimenta a esquerda');
    assert.deepEqual(left.position,start);assert.equal(hands.state.rightDepth,0);
    if(animation==='perspective')assert.equal(hands.state.rightBlend,.60);
    hands.dispose();
  }
  const camera=new THREE.PerspectiveCamera(52,1920/1080,.2,900);
  const hands=createEtherealHandsMesh(camera,{animation:'perspective'});await hands.ready;
  const left=hands.meshes[0],start=left.position.clone(),scale=left.scale.clone();
  const wrist=hands.rigs[0].bones[0],angle=wrist.rotation.z;
  hands.setStarHovered(true);hands.update(0,1/60);
  assert.ok(hands.state.leftFollow>0&&hands.state.leftFollow<.1,'acompanhamento começa suavemente');
  for(let i=0;i<160;i++)hands.update(0,1/60);
  assert.ok(hands.state.leftFollow>.997);
  assert.ok(left.position.x>start.x&&left.position.y>start.y,'esquerda acompanha com aproximação e elevação pequenas');
  assert.ok(left.position.distanceTo(start)<.03,'acompanhamento discreto');
  assert.ok(wrist.rotation.z>angle+.011,'movimento real do punho no rig');
  assert.deepEqual(left.scale,scale,'acompanhar não estica a mão');
  assert.ok(hands.state.rightBlend>.599&&hands.state.rightBlend<=.60);
  assert.ok(hands.state.rightDepth>.041&&hands.state.rightDepth<=.042);
  assert.equal(hands.meshes[0].material.opacity,hands.meshes[1].material.opacity);
  hands.setStarHovered(false);hands.update(0,1/60);
  assert.ok(hands.state.leftFollow>.9,'retorno começa sem salto');
  for(let i=0;i<160;i++)hands.update(0,1/60);
  assert.ok(left.position.distanceTo(start)<1e-6);assert.ok(Math.abs(wrist.rotation.z-angle)<1e-6);
  assert.ok(hands.state.rightBlend<.001);hands.dispose();
  console.log('OK: transparência/escala/margens/altura equilibradas, esquerda acompanha/retorna, apontar/profundidade contidos e reduced-motion.');
}finally{THREE.TextureLoader.prototype.load=load;}
