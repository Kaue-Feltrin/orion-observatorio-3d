import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createStarJourney,JOURNEY_DURATION} from '../star-journey.js';
import {createDistantSky} from '../distant-sky.js';
import {getHeraldLayout} from '../herald-catalog.js';
for(const hz of [30,60,120])for(const aspect of [1280/720,3440/1440])for(const target of getHeraldLayout(3,aspect)){
 const scene=new THREE.Scene(),rig=new THREE.Group(),camera=new THREE.PerspectiveCamera(51,aspect,.2,900),star=new THREE.Group();
 scene.add(rig,star);rig.add(camera);rig.position.set(3,-2,26);rig.rotation.set(.015,-.02,.003);star.position.set(target.x,target.y,target.z);
 const photo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({opacity:1}));photo.position.set(0,-3,-540);
 const height=2*Math.tan(52*Math.PI/360)*566*1.31;photo.scale.set(height*5000/1850,height,1);
 const fragment=new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial({opacity:.1}));
 fragment.position.set(40,12,-130);fragment.scale.set(110,60,1);fragment.userData.volumeFragment=true;
 const fragmentStart=fragment.position.clone(),fragmentScale=fragment.scale.clone();
 const mist=new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial({opacity:.06}));mist.position.z=-42;
 const gas=new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.ShaderMaterial({uniforms:{uStrength:{value:.4}}}));gas.position.z=-35;
 scene.add(photo,mist,gas,fragment);
 const glows=Object.fromEntries(['halo','soft','main','core'].map(key=>[key,new THREE.Sprite(new THREE.SpriteMaterial({opacity:.4}))]));
 let arrivals=0;
 const journey=createStarJourney({scene,camera,star,glows,layers:[photo,mist,fragment],gasLayers:[gas],sky:createDistantSky(photo,camera),reducedMotion:false,
  selectiveBloom:{state:{intensity:.1},setIntensity(){}},flash:{style:{setProperty(){}}},onArrive:()=>arrivals++});
 // Respiração/controles podem mudar entre inicialização do módulo e clique.
 mist.material.opacity=.073;gas.material.uniforms.uStrength.value=.53;
 camera.updateWorldMatrix(true,false);const start=camera.getWorldPosition(new THREE.Vector3()),orientation=camera.getWorldQuaternion(new THREE.Quaternion());
 const direction=star.position.clone().sub(start).normalize();journey.begin(1000);journey.update(1000,0);
 assert.equal(mist.material.opacity,.073);assert.equal(gas.material.uniforms.uStrength.value,.53,'primeiro quadro conserva o estado real do gás');
 assert.ok(fragment.position.distanceTo(fragmentStart)<1e-10,'recorte não salta na partida');
 let angle=0,opacity=1,lastZ=camera.position.z,heading=null;
 for(let elapsed=0;elapsed<JOURNEY_DURATION;elapsed+=1000/hz){
  journey.update(1000+elapsed,1/hz);
  const nowAngle=orientation.angleTo(camera.quaternion);
  assert.ok(nowAngle+1e-7>=angle,'orientação não desfaz a curva');angle=nowAngle;
  assert.ok(journey.companionOpacity<=opacity+1e-12);opacity=journey.companionOpacity;
  if(elapsed<=160){assert.ok(nowAngle<1e-7,'outras estrelas desaparecem antes da rotação');assert.ok(camera.position.distanceTo(start)<1e-10);}
  if(elapsed>=160)assert.equal(journey.companionOpacity,0,'nenhum destino restante desliza durante a curva');
  if(elapsed<=700)assert.ok(camera.position.distanceTo(start)<1e-10,'primeiro orientar, depois avançar');
  if(elapsed>=700){
   if(!heading)heading=camera.quaternion.clone();
   assert.ok(camera.quaternion.angleTo(heading)<1e-7,'direção estável no avanço');
   assert.ok(camera.position.clone().sub(start).cross(direction).length()<1e-8,'sem deriva lateral, órbita ou serpentina');
  }
  assert.ok(camera.position.z<=lastZ+1e-9);lastZ=camera.position.z;
  assert.ok(camera.fov<=56+1e-8,'expansão do campo de visão contida');
  assert.ok(fragment.position.distanceTo(fragmentStart)<1e-10,'recortes continuam em suas posições de mundo');
  assert.ok(fragment.scale.distanceTo(fragmentScale)<1e-10,'recortes não recebem ampliação artificial');
  if(elapsed>=160)assert.equal(fragment.material.opacity,0,'recortes distantes cedem ao céu antes do giro');

 }
 journey.update(1000+JOURNEY_DURATION,1/hz);journey.update(6000,1/hz);
 assert.equal(arrivals,1);assert.ok(Math.abs(camera.position.z-(-470+53))<1e-10);
 assert.ok(star.position.clone().sub(camera.position).normalize().distanceTo(direction)<1e-10,'aproximação mantém direção e distância segura');
}
console.log('OK: curva sem reversão, avanço alinhado, saída das outras estrelas antes do giro, gás sem salto e recortes sem ampliação artificial a 30/60/120 Hz.');
