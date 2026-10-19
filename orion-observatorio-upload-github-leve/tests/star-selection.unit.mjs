import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createStarSelection,sampleStarSelection,SELECTION_DURATION} from '../star-selection.js';
import {createEtherealHandsMesh} from '../first-person-hands-mesh.js';
const advance=(selection,duration)=>{
  for(let elapsed=0;elapsed<duration;){
    const step=Math.min(1/60,duration-elapsed);selection.update(step);elapsed+=step;
  }
};

for(let i=0;i<=200;i++){
  const sample=sampleStarSelection(SELECTION_DURATION*i/200);
  for(const value of Object.values(sample))assert.ok(value>=0&&value<=1);
}
for(const p of [0,1]){
  const sample=sampleStarSelection(SELECTION_DURATION*p);
  assert.equal(sample.reach,0);assert.equal(sample.press,0);assert.equal(sample.light,0);
}
assert.equal(sampleStarSelection(.84*.48).press,1);
assert.equal(sampleStarSelection(.84*.4).reach,1);

const original=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(file,onLoad){
  queueMicrotask(()=>onLoad(new THREE.Texture({width:1122,height:1402})));
};
try{
  for(const reducedMotion of [false,true]){
    const camera=new THREE.PerspectiveCamera(52,1920/1080,.2,900);
    const star=new THREE.Group(),hands=createEtherealHandsMesh(camera,{animation:'perspective',reducedMotion});
    await hands.ready;hands.setStarHovered(true);
    for(let i=0;i<160;i++)hands.update(0,1/60);
    const baseline=hands.meshes[1].position.clone(),left=hands.meshes[0].position.clone();
    const map=hands.meshes[1].material.map;let confirmed=0;
    const selection=createStarSelection(star,{camera,hands,reducedMotion,onConfirm:()=>{confirmed++;hands.beginTravel();}});
    assert.equal(selection.rings.length,0,'repouso não aloca geometria/material do efeito');
    assert.equal(selection.begin(),true);assert.equal(selection.begin(),false);
    assert.equal(selection.rings.length,2);
    const geometry=selection.rings[0].geometry;let geometriesDisposed=0,materialsDisposed=0;
    geometry.addEventListener('dispose',()=>geometriesDisposed++);
    for(const ring of selection.rings)ring.material.addEventListener('dispose',()=>materialsDisposed++);
    const sampleAt=reducedMotion?.08:.84*.48;
    advance(selection,sampleAt);hands.setStarHovered(false);hands.update(0,0);
    assert.equal(confirmed,0,'confirmar só depois do gesto');
    assert.equal(hands.state.selecting,true);assert.equal(hands.meshes[1].material.map,map);
    assert.equal(hands.meshes[1].material.opacity,.46);assert.equal(hands.state.drawSurfaces,2);
    assert.deepEqual(hands.meshes[0].position,left,'clique não movimenta a esquerda');
    if(reducedMotion){
      assert.deepEqual(hands.meshes[1].position,baseline);assert.equal(hands.state.selectionPress,0);
      assert.ok(hands.rigs.every(r=>r.bones.every(b=>b.rotation.z===0)));
    }else{
      assert.ok(hands.meshes[1].position.z>baseline.z+.08,'avanço real em profundidade');
      assert.ok(hands.state.rightBlend<.85&&hands.state.rightBlend>.83,'indicador articula no clique');
      assert.ok(selection.rings[0].material.opacity>0);
    }
    advance(selection,1);hands.update(0,0);
    assert.equal(confirmed,1);assert.equal(selection.state.completed,true);
    assert.equal(selection.root.visible,false);assert.equal(hands.state.selecting,false);
    assert.equal(hands.state.selectionReach,0);assert.equal(hands.state.selectionPress,0);
    assert.equal(selection.begin(),false);selection.update(1);assert.equal(confirmed,1);
    selection.dispose();selection.dispose();assert.equal(geometriesDisposed,1);assert.equal(materialsDisposed,2);
    hands.dispose();
  }
  for(const fps of [30,60,120]){
    let confirmed=0;const poses=[];
    const selection=createStarSelection(new THREE.Group(),{camera:new THREE.PerspectiveCamera(),
      hands:{setStarSelection:pose=>poses.push(pose)},onConfirm:()=>confirmed++});
    selection.begin();
    for(let i=0;i<fps;i++)selection.update(1/fps);
    assert.equal(confirmed,1);assert.equal(selection.state.progress,1);assert.equal(poses.at(-1),null);
    selection.dispose();
  }
  let slowConfirmed=0;
  const slow=createStarSelection(new THREE.Group(),{camera:new THREE.PerspectiveCamera(),hands:{},
    reducedMotion:true,onConfirm:()=>slowConfirmed++});
  slow.begin();slow.update(.3);
  assert.equal(slowConfirmed,0,'quadro lento não deve pular a confirmação estática');
  assert.equal(slow.state.light,.30);assert.equal(slow.root.visible,true);
  slow.update(.17);assert.equal(slowConfirmed,1);slow.dispose();
  let hitchConfirmed=0;
  const hitch=createStarSelection(new THREE.Group(),{camera:new THREE.PerspectiveCamera(),hands:{},
    onConfirm:()=>hitchConfirmed++});
  hitch.begin();hitch.update(1);
  assert.equal(hitchConfirmed,0,'pausa longa não deve pular o gesto inteiro');
  assert.ok(hitch.state.progress>0&&hitch.state.progress<.2);
  advance(hitch,1);assert.equal(hitchConfirmed,1);hitch.dispose();
  const off=createEtherealHandsMesh(new THREE.PerspectiveCamera(),{enabled:false});
  const selection=createStarSelection(new THREE.Group(),{camera:new THREE.PerspectiveCamera(),hands:off,onConfirm(){}});
  selection.begin();selection.update(.4);assert.equal(off.state.loaded,false);selection.dispose();off.dispose();
  console.log('OK: seleção única, pressão/depth sem fades, mão esquerda preservada, reduced/off, 30/60/120 Hz e descarte.');
}finally{THREE.TextureLoader.prototype.load=original;}
