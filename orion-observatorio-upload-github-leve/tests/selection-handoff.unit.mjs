import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createStarSelection,SELECTION_DURATION,SELECTION_DEPARTURE} from '../star-selection.js';
import {createStarJourney} from '../star-journey.js';
import {createEtherealHandsMesh} from '../first-person-hands-mesh.js';

const original=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(file,onLoad){queueMicrotask(()=>onLoad(new THREE.Texture({width:1122,height:1402})));};
try{
  for(const reducedMotion of [false,true])for(const touchLayout of [false,true]){
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(51,390/844,.2,900),star=new THREE.Group();
    scene.add(camera,star);camera.position.z=25.1;star.position.set(0,43,-470);
    const hands=createEtherealHandsMesh(camera,{animation:'perspective',touchLayout,reducedMotion});
    await hands.ready;hands.setStarHovered(true);
    for(let i=0;i<180;i++)hands.update(0,1/60);
    const baselineRotation=hands.meshes[1].rotation.clone(),baselinePosition=hands.meshes[1].position.clone();
    hands.setStarDirection(.8,.6);hands.update(0,0);
    if(!reducedMotion&&!touchLayout){
      assert.ok(Math.abs(hands.meshes[1].rotation.z-baselineRotation.z)>.001,'punho acompanha a direção projetada da estrela');
      assert.ok(Math.abs(hands.meshes[1].rotation.z-baselineRotation.z)<.04,'direção não exagera a torção');
    }else if(reducedMotion)assert.equal(hands.meshes[1].rotation.z,baselineRotation.z);
    if(touchLayout){assert.equal(hands.state.visible,false,'mãos ocultas em todo o fluxo mobile');assert.equal(hands.state.drawSurfaces,0);}
    assert.ok(hands.meshes[1].position.distanceTo(baselinePosition)<1e-10,'mira não estica nem desloca o corpo da mão');
    hands.setStarDirection(0,.18);hands.update(0,0);
    const glows={};
    for(const [i,name] of ['halo','soft','main','core'].entries()){
      glows[name]=new THREE.Sprite(new THREE.SpriteMaterial({opacity:.25+i*.1}));
      glows[name].scale.setScalar(160-i*20);star.add(glows[name]);
    }
    const starting=Object.values(glows).map(g=>[g.scale.x,g.material.opacity]);
    const cameraPosition=camera.position.clone(),cameraOrientation=camera.quaternion.clone();
    let arrived=0,departures=0,completed=0;
    const journey=createStarJourney({scene,camera,star,glows,layers:[],gasLayers:[],
      selectiveBloom:{state:{intensity:.1},setIntensity(){}},flash:{style:{setProperty(){}}},reducedMotion,onArrive:()=>arrived++});
    const depart=()=>{if(journey.active)return;departures++;journey.begin(1000);hands.beginTravel();};
    const selection=createStarSelection(star,{camera,hands,reducedMotion,onDepart:depart,onConfirm:()=>{completed++;depart();}});
    selection.begin();
    if(!reducedMotion){
      for(let t=0;t<SELECTION_DURATION*(SELECTION_DEPARTURE-.01);t+=1/120){selection.update(1/120);hands.update(0,1/120);}
      assert.equal(journey.active,false,'a viagem espera contato e início do assentamento');
      while(!journey.active){selection.update(1/120);hands.update(0,1/120);}
      assert.ok(selection.state.active&&hands.state.selecting,'seleção e gesto continuam no início da viagem');
      assert.ok(hands.state.rightBlend>.5,'não derruba o apontamento durante a retirada');
      if(touchLayout){assert.equal(hands.state.visible,false);assert.equal(hands.state.drawSurfaces,0);}
      else assert.ok(hands.meshes[1].material.opacity>.379,'fade começa com velocidade nula');
      assert.ok(selection.effects.some(m=>m.material.opacity>.1),'cauda luminosa não desaparece na partida');
    }else{
      selection.update(.1);assert.equal(journey.active,false);
      selection.update(.2);assert.equal(selection.state.completed,true);
      assert.equal(hands.state.selecting,false);assert.equal(journey.streakCount,0);
      hands.update(0,.04);
      assert.ok(hands.meshes[1].position.distanceTo(baselinePosition)<1e-10,'reduced-motion não eleva nem retira o corpo da mão');
    }
    journey.update(1000,0);
    assert.equal(camera.fov,51,'primeiro quadro conserva o FOV de foco');
    assert.ok(camera.position.distanceTo(cameraPosition)<1e-10);
    assert.ok(camera.quaternion.angleTo(cameraOrientation)<1e-7);
    assert.deepEqual(Object.values(glows).map(g=>[g.scale.x,g.material.opacity]),starting,'nenhum salto de tamanho/brilho na partida');
    for(let i=0;i<80;i++){selection.update(1/120);hands.update(0,1/120);}
    assert.equal(selection.state.completed,true);assert.equal(completed,1);assert.equal(departures,1);
    assert.equal(hands.state.selecting,false);assert.equal(hands.state.visible,false);
    assert.equal(selection.root.visible,false);
    journey.update(4000,.05);journey.update(4100,.05);assert.equal(arrived,1);
    assert.equal(journey.begin(5000),false);
    hands.dispose();selection.dispose();
  }
  console.log('OK: continuidade câmera/luz, partida sobreposta ao assentamento, retirada suave, toque e reduced-motion.');
}finally{THREE.TextureLoader.prototype.load=original;}
