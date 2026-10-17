import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createEtherealHandsMesh} from '../first-person-hands-mesh.js';

// Somente o carregamento de imagem é substituído: geometria, materiais,
// posicionamento, blend e descarte são os mesmos usados no navegador.
const original=THREE.TextureLoader.prototype.load;
let requests=0;
THREE.TextureLoader.prototype.load=function(file,onLoad){
  requests++;
  queueMicrotask(()=>onLoad(new THREE.Texture({width:1122,height:1402})));
};
const make=options=>createEtherealHandsMesh(new THREE.PerspectiveCamera(52,1920/951,.2,900),options);
try {
  const h=make();
  await h.ready;
  const neutral=h.root.getObjectByName('OrionFeminineRightNeutral');
  assert.equal(h.state.rightBlend,0,'neutra já na resolução de ready, sem flash apontando');
  assert.equal(h.meshes[1].visible,false);
  assert.equal(neutral.visible,true);
  assert.equal(neutral.geometry,h.meshes[1].geometry,'poses alinhadas e sem geometria duplicada');
  h.setStarHovered(true);
  h.update(1,1/60);
  assert.ok(h.state.rightBlend>0&&h.state.rightBlend<.5,'entrada começa suavemente');
  assert.equal(h.state.drawSurfaces,3,'duas poses apenas durante a transição');
  for(let i=0;i<90;i++)h.update(1+i/60,1/60);
  assert.ok(h.state.rightBlend>.997);
  assert.equal(h.state.drawSurfaces,2);
  h.setStarHovered(false);
  h.update(3,1/60);
  assert.ok(h.state.rightBlend>.5&&h.state.rightBlend<1,'retorno começa suavemente');
  for(let i=0;i<90;i++)h.update(3+i/60,1/60);
  assert.ok(h.state.rightBlend<.003);
  assert.equal(h.meshes[1].visible,false);
  h.setStarHovered(true);
  h.beginTravel();
  h.setStarHovered(true);
  assert.equal(h.state.rightHover,false,'viagem impede reativação do hover');
  for(let i=0;i<30;i++)h.update(5+i/60,1/60);
  assert.equal(h.root.visible,false);
  assert.equal(h.state.drawSurfaces,0);
  let disposed=0;
  for(const mesh of h.meshes)mesh.geometry.addEventListener('dispose',()=>disposed++);
  h.dispose();h.dispose();
  assert.equal(disposed,2,'geometria compartilhada descartada uma única vez');

  const outcomes=[];
  for(const fps of [30,60]){
    const instance=make();await instance.ready;instance.setStarHovered(true);
    for(let i=0;i<fps;i++)instance.update(i/fps,1/fps);
    outcomes.push(instance.state.rightBlend);instance.dispose();
  }
  assert.ok(Math.abs(outcomes[0]-outcomes[1])<1e-9,'blend independente da frequência dos frames');
  const reduced=make({reducedMotion:true});await reduced.ready;
  reduced.setStarHovered(true);reduced.update(1,1/60);
  assert.equal(reduced.state.rightBlend,1);
  reduced.setStarHovered(false);reduced.update(2,1/60);
  assert.equal(reduced.state.rightBlend,0);reduced.dispose();
  const before=requests,off=make({enabled:false});
  assert.equal(await off.ready,false);assert.equal(requests,before);off.dispose();
  console.log('OK: neutralidade inicial, blend suave 30/60 Hz, viagem, reduced-motion, descarte e hands=off.');
} finally {
  THREE.TextureLoader.prototype.load=original;
}
