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
  assert.equal(sample.anticipation,0);assert.equal(sample.followThrough,0);
}
assert.equal(sampleStarSelection(SELECTION_DURATION*.49).press,1);
assert.ok(sampleStarSelection(SELECTION_DURATION*.25).charge>.8);
assert.equal(sampleStarSelection(SELECTION_DURATION*.25).burst,0,'reúne luz antes do contato');
assert.equal(sampleStarSelection(SELECTION_DURATION*.50).burst,1);
assert.equal(sampleStarSelection(SELECTION_DURATION*.4).reach,1);
const prepare=sampleStarSelection(SELECTION_DURATION*.08),settle=sampleStarSelection(SELECTION_DURATION*.78);
assert.equal(prepare.anticipation,1);assert.equal(prepare.reach,0);assert.equal(prepare.press,0);
assert.equal(settle.followThrough,1);assert.ok(settle.press<.5,'punho termina depois da pressão do indicador');

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
    hands.setStarSelection(prepare);hands.update(0,0);
    if(reducedMotion){
      assert.deepEqual(hands.meshes[1].position,baseline);
      assert.equal(hands.state.selectionAnticipation,0);assert.equal(hands.state.selectionFollowThrough,0);
    }else{
      assert.ok(hands.meshes[1].position.z<baseline.z-.009,'antecipação recua antes do avanço');
      const rig=hands.rigs[1];let idleEnergy=0,focusedEnergy=0;
      for(let i=0;i<240;i++){
        rig.update(i/20,false,0);idleEnergy+=rig.bones.slice(2).reduce((sum,b)=>sum+b.rotation.z**2,0);
        rig.update(i/20,false,1);focusedEnergy+=rig.bones.slice(2).reduce((sum,b)=>sum+b.rotation.z**2,0);
      }
      assert.ok(focusedEnergy<idleEnergy*.85,'dedos se acomodam ao manter o apontamento');
      hands.update(0,0);
    }
    const selection=createStarSelection(star,{camera,hands,reducedMotion,onConfirm:()=>{confirmed++;hands.beginTravel();}});
    assert.equal(selection.rings.length,0,'repouso não aloca geometria/material do efeito');
    assert.equal(selection.begin(),true);assert.equal(selection.begin(),false);
    assert.equal(selection.rings.length,2);
    assert.equal(selection.effects.length,reducedMotion?2:6);
    assert.ok(selection.effects.every(m=>m.material.forceSinglePass));
    assert.ok(selection.rings.every(r=>r.material.forceSinglePass),'anéis planos dispensam passagem duplicada');
    let geometriesDisposed=0,materialsDisposed=0;
    const resources=new Set(selection.effects.map(m=>m.geometry));
    assert.equal(resources.size,reducedMotion?1:4);
    assert.ok(selection.state.triangles<=3000,'efeito localizado com geometria limitada');
    for(const geometry of resources)geometry.addEventListener('dispose',()=>geometriesDisposed++);
    for(const effect of selection.effects)effect.material.addEventListener('dispose',()=>materialsDisposed++);
    const sampleAt=reducedMotion?.08:SELECTION_DURATION*.49;
    advance(selection,sampleAt);hands.setStarHovered(false);hands.update(0,0);
    assert.equal(confirmed,0,'confirmar só depois do gesto');
    assert.equal(hands.state.selecting,true);assert.equal(hands.meshes[1].material.map,map);
    assert.equal(hands.meshes[1].material.opacity,.38);assert.equal(hands.state.drawSurfaces,2);
    assert.deepEqual(hands.meshes[0].position,left,'clique não movimenta a esquerda');
    if(reducedMotion){
      assert.deepEqual(hands.meshes[1].position,baseline);assert.equal(hands.state.selectionPress,0);
      assert.ok(hands.rigs.every(r=>r.bones.every(b=>b.rotation.z===0)));
    }else{
      assert.ok(hands.meshes[1].position.z>baseline.z+.05&&hands.meshes[1].position.z<=baseline.z+.053,
        'avanço discreto em profundidade');
      assert.ok(hands.state.rightBlend<.51&&hands.state.rightBlend>.49,'indicador articula sem extensão exagerada');
      assert.ok(selection.effects.every(m=>m.material.opacity>0),'coroa, fitas e fragmentos acompanham o contato');
      assert.ok(hands.meshes[1].rotation.x>0&&hands.meshes[1].rotation.y<0,'punho inclina em profundidade');
      assert.ok(hands.state.selectionLift>.9,'elevação conduz o arco do gesto');
      for(const m of selection.effects)assert.ok(!m.material.map,'sem texturas novas');
      const motes=selection.effects.find(m=>m.userData.selectionType==='motes');
      const positions=motes.geometry.attributes.position;
      assert.ok([...positions.array].every(Number.isFinite),'fragmentos sem coordenadas inválidas');
    }
    advance(selection,SELECTION_DURATION+.1);hands.update(0,0);
    assert.equal(confirmed,1);assert.equal(selection.state.completed,true);
    assert.equal(selection.root.visible,false);assert.equal(hands.state.selecting,false);
    assert.ok(selection.effects.every(m=>m.material.opacity===0),'efeitos terminam sem luz residual');
    assert.equal(hands.meshes[1].rotation.x,0);assert.equal(hands.meshes[1].rotation.y,0);
    assert.equal(hands.state.selectionReach,0);assert.equal(hands.state.selectionPress,0);
    assert.equal(hands.state.selectionAnticipation,0);assert.equal(hands.state.selectionFollowThrough,0);
    assert.equal(selection.begin(),false);selection.update(1);assert.equal(confirmed,1);
    selection.dispose();selection.dispose();assert.equal(geometriesDisposed,reducedMotion?1:4);assert.equal(materialsDisposed,reducedMotion?2:6);
    hands.dispose();
  }
  // Verifica a malha real com morph e acomodação dos dedos durante o clique.
  const anatomical=createEtherealHandsMesh(new THREE.PerspectiveCamera(52,1920/1080,.2,900),{animation:'perspective'});
  await anatomical.ready;anatomical.setStarHovered(true);
  for(let i=0;i<160;i++)anatomical.update(0,1/60);
  const g=anatomical.meshes[1].geometry,uv=g.attributes.uv,index=g.index;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();let minArea=Infinity,maxArea=0;
  for(let phase=0;phase<=20;phase++)for(const time of [0,3.7,8.1]){
    anatomical.setStarSelection(sampleStarSelection(SELECTION_DURATION*phase/20));anatomical.update(time,0);
    for(let j=0;j<index.count;j+=3){
      const i=index.getX(j),k=index.getX(j+1),m=index.getX(j+2);
      anatomical.meshes[1].getVertexPosition(i,a);anatomical.meshes[1].getVertexPosition(k,b);anatomical.meshes[1].getVertexPosition(m,c);
      const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
      const rest=(uv.getX(k)-uv.getX(i))*(uv.getY(m)-uv.getY(i))-(uv.getY(k)-uv.getY(i))*(uv.getX(m)-uv.getX(i));
      minArea=Math.min(minArea,area/rest);maxArea=Math.max(maxArea,area/rest);
    }
  }
  assert.ok(minArea>.10&&maxArea<4,'contato sem inversão, colapso ou expansão excessiva');
  console.log('SELECTION_ANATOMY',JSON.stringify({minArea,maxArea}));anatomical.dispose();
  for(const fps of [30,60,120]){
    let confirmed=0;const poses=[];
    const selection=createStarSelection(new THREE.Group(),{camera:new THREE.PerspectiveCamera(),
      hands:{setStarSelection:pose=>poses.push(pose)},onConfirm:()=>confirmed++});
    selection.begin();
    for(let i=0;i<Math.ceil((SELECTION_DURATION+.1)*fps);i++)selection.update(1/fps);
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
  advance(hitch,SELECTION_DURATION+.1);assert.equal(hitchConfirmed,1);hitch.dispose();
  const off=createEtherealHandsMesh(new THREE.PerspectiveCamera(),{enabled:false});
  const selection=createStarSelection(new THREE.Group(),{camera:new THREE.PerspectiveCamera(),hands:off,onConfirm(){}});
  selection.begin();selection.update(.4);assert.equal(off.state.loaded,false);selection.dispose();off.dispose();
  console.log('OK: seleção única, pressão/depth sem fades, mão esquerda preservada, reduced/off, 30/60/120 Hz e descarte.');
}finally{THREE.TextureLoader.prototype.load=original;}
