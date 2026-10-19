import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createNebulaVolume} from '../nebula-volume.js';
const load=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
const photo=new THREE.Mesh();photo.position.set(0,-3,-540);photo.scale.set(1400,518,1);
try{
 for(const [quality,count] of [['eco',2],['lite',2],['eco-plus',5],['balanced',5],['high',6]]){
  const scene=new THREE.Scene(),v=createNebulaVolume(scene,photo);v.applyQuality(quality);v.resize();
  assert.equal(v.state.active,count);assert.equal(v.state.loaded,count);
  const visible=v.layers.filter(l=>l.visible);v.update(0,.8,.4,1/60);for(let i=0;i<80;i++)v.update(0,.8,.4,1/60);
  assert.ok(visible.every(l=>l.userData.parallaxOffsetX<0&&l.userData.parallaxOffsetY<0));
  for(const a of visible)for(const b of visible)
   if(a.position.z>b.position.z)assert.ok(a.renderOrder>b.renderOrder,'transparências ordenadas pela profundidade efetiva');
  if(count>=5){
   const extra=visible.filter(l=>['05','06'].includes(l.userData.spec.id));assert.equal(extra.length,2);
   assert.ok(extra.every(l=>l.material.forceSinglePass&&l.material.opacity<.12));
   const projected=extra.map(l=>Math.abs(l.userData.parallaxOffsetX)/(26-l.position.z));
   assert.ok(projected[1]>projected[0]*1.4,'filamento próximo tem deslocamento projetado maior');
  }
  const textures=v.state.loaded;v.applyQuality(quality);assert.equal(v.state.loaded,textures,'sem alocação repetida');
  let disposed=0;for(const l of visible)l.material.map.addEventListener('dispose',()=>disposed++);
  v.dispose();assert.equal(disposed,textures);assert.equal(scene.children.length,0);
 }
 for(const reducedMotion of [true,false]){
  const scene=new THREE.Scene(),v=createNebulaVolume(scene,photo,{reducedMotion,parallaxEnabled:false,foregroundEnabled:false});
  v.applyQuality('eco-plus');v.resize();assert.equal(v.state.active,2);assert.equal(v.state.loaded,2);
  v.update(0,1,1);const before=v.layers.map(l=>({position:l.position.clone(),scale:l.scale.clone(),opacity:l.material.opacity}));v.update(20,-1,-1);
  for(const [i,l] of v.layers.entries()){
   assert.equal(l.userData.parallaxOffsetX,0);assert.equal(l.userData.parallaxOffsetY,0);
   if(reducedMotion){assert.deepEqual(l.position,before[i].position);assert.deepEqual(l.scale,before[i].scale);assert.equal(l.material.opacity,before[i].opacity);}
  }v.dispose();
 }
 console.log('OK: seis profundidades, orçamento por qualidade, paralaxe diferencial, reduced/off, carga única e descarte.');
}finally{THREE.TextureLoader.prototype.load=load;}
