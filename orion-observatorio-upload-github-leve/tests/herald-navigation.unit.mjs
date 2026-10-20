import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MAX_HERALDS,heraldCount,getHeralds,getHeraldLayout,arrivalURL,observatoryURL} from '../herald-catalog.js';
import {createStarJourney} from '../star-journey.js';
assert.equal(MAX_HERALDS,3);
for(const [input,expected] of [[undefined,1],[null,1],['',1],['abc',1],['Infinity',1],[-2,1],[1,1],[2,2],[2.9,2],[3,3],[99,3]])assert.equal(heraldCount(input),expected);
assert.deepEqual(getHeralds().map(h=>h.id),['nox']);
const all=getHeralds(new URLSearchParams('stars=3'));
assert.deepEqual(all.map(h=>[h.id,h.name,h.demo]),[['nox','Nox',false],['preview-2','Estrela II',true],['preview-3','Estrela III',true]]);
for(const count of [1,2,3])for(const aspect of [390/844,1280/720,1920/1080]){
 const layout=getHeraldLayout(count,aspect);assert.equal(layout.length,count);
 const camera=new THREE.PerspectiveCamera(52,aspect,.2,900);camera.position.z=26;camera.updateMatrixWorld();
 const projected=layout.map(p=>new THREE.Vector3(p.x,p.y,p.z).project(camera));
 assert.ok(projected.every(p=>Math.abs(p.x)<.85&&Math.abs(p.y)<.85),'todos os destinos dentro do viewport');
 for(let i=0;i<count;i++)for(let j=i+1;j<count;j++)assert.ok(projected[i].distanceTo(projected[j])>.4,'destinos separados');
 for(const [index,point] of layout.entries())for(const reducedMotion of [false,true]){
   const scene=new THREE.Scene(),star=new THREE.Group(),other=new THREE.Group();scene.add(camera,star,other);
   camera.position.set(4,-3,26);star.position.set(0,43,-470);other.position.set(point.x,point.y,point.z);
   const lights=()=>Object.fromEntries(['halo','soft','main','core'].map(key=>[key,new THREE.Sprite(new THREE.SpriteMaterial({opacity:.42}))]));
   const original=lights(),chosen=lights();let arrivals=0;
   const journey=createStarJourney({scene,camera,star,glows:original,layers:[],gasLayers:[],
    selectiveBloom:{state:{intensity:.1},setIntensity(){}},flash:{style:{setProperty(){}}},reducedMotion,onArrive:()=>arrivals++});
   assert.equal(journey.setDestination(other,chosen),true);assert.equal(journey.begin(1000),true);
   journey.update(1000,0);assert.deepEqual(camera.position.toArray(),[4,-3,26],'partida contínua para todo destino');
   assert.equal(journey.setDestination(star,original),false,'destino travado durante viagem');
   journey.update(4000,.05);assert.ok(camera.position.distanceTo(new THREE.Vector3(point.x,point.y,point.z+53))<1e-10);
   assert.ok(Object.values(original).every(g=>g.material.opacity===.42),'não anima o brilho do destino anterior');
   assert.equal(chosen.core.material.opacity,1);journey.update(5000,.05);assert.equal(arrivals,1);
   assert.equal(journey.setDestination(star,original),false);assert.equal(journey.begin(),false);
 }
}
const source='https://example.com/?stars=3&quality=eco-plus&handsMotion=perspective&debug=1&herald=wrong&via=wrong';
const url=arrivalURL(source,all[2]);assert.equal(url.pathname,'/ficha.html');assert.equal(url.searchParams.get('herald'),'preview-3');
assert.equal(url.searchParams.get('via'),'observatory');assert.equal(url.searchParams.has('debug'),false);
const back=observatoryURL(url);assert.equal(back.pathname,'/index.html');assert.equal(back.searchParams.get('stars'),'3');
assert.equal(back.searchParams.get('handsMotion'),'perspective');assert.equal(back.searchParams.has('herald'),false);assert.equal(back.searchParams.has('via'),false);
console.log('OK: catálogo 1–3, posições, identidade no destino/retorno e viagem única com destino travado.');
// A viagem fora do eixo não pode expor as bordas da fotografia de fundo.
for(const aspect of [390/844,1280/720,1920/1080,3440/1440])for(const point of getHeraldLayout(3,aspect)){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(52,aspect,.2,900),star=new THREE.Group();
 scene.add(camera,star);camera.position.z=26;star.position.set(point.x,point.y,point.z);
 const background=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());background.position.set(0,-3,-540);
 const height=2*Math.tan(52*Math.PI/360)*566*1.31;background.scale.set(height*5000/1850,height,1);
 const originalScale=background.scale.clone();
 const glows=Object.fromEntries(['halo','soft','main','core'].map(key=>[key,new THREE.Sprite(new THREE.SpriteMaterial())]));
 const journey=createStarJourney({scene,camera,star,glows,layers:[background],background,gasLayers:[],reducedMotion:false,
  selectiveBloom:{state:{intensity:.1},setIntensity(){}},flash:{style:{setProperty(){}}},onArrive(){}});
 journey.begin(0);journey.update(0,0);assert.ok(background.scale.distanceTo(originalScale)<1e-10,'sem salto na foto na partida');
 for(let time=0;time<=2150;time+=1000/60){
  journey.update(time,1/60);const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  for(const x of [-1,1])for(const y of [-1,1]){
   const ray=new THREE.Vector3(x*tangent*aspect,y*tangent,-1).applyQuaternion(camera.quaternion);
   assert.ok(ray.z<0,'frustum continua olhando para o plano de fundo');
   const distance=(background.position.z-camera.position.z)/ray.z;
   assert.ok(distance<camera.far,'fotografia dentro da distância de recorte da câmera');
   const corner=camera.position.clone().addScaledVector(ray,distance);
   assert.ok(Math.abs(corner.x-background.position.x)<=background.scale.x/2+1e-6,'cobertura horizontal');
   assert.ok(Math.abs(corner.y-background.position.y)<=background.scale.y/2+1e-6,'cobertura vertical');
  }
  assert.ok(Math.abs(background.scale.x/background.scale.y-5000/1850)<1e-10,'proporção da fotografia preservada');
 }
}
console.log('OK: bordas do fundo cobertas em todo trajeto lateral, quatro proporções de tela e sem salto na partida.');
