import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createDistantSky} from '../distant-sky.js';
for(const aspect of [390/844,1280/720,3440/1440,1920/458]){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(51,aspect,.2,900),photo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.Texture()}));
 camera.position.set(5,-2,25.1);camera.rotation.set(.02,-.03,.004);scene.add(camera,photo);
 const height=2*Math.tan(52*Math.PI/360)*566*1.31;photo.position.set(0,-3,-540);photo.scale.set(height*5000/1850,height,1);
 scene.updateMatrixWorld();
 const geometry=photo.geometry,material=photo.material,map=material.map,position=photo.position.clone(),scale=photo.scale.clone();
 const originalQ=camera.quaternion.clone(),originalEye=camera.position.clone();
 const points=[[-.8,-.7],[0,0],[.7,.6]].map(([x,y])=>{
  const ray=new THREE.Vector3(x,y,.5).unproject(camera).sub(camera.position);
  const point=camera.position.clone().addScaledVector(ray,(photo.position.z-camera.position.z)/ray.z);
  return {x,y,uv:new THREE.Vector2((point.x-position.x)/scale.x+.5,(point.y-position.y)/scale.y+.5)};
 });
 const sky=createDistantSky(photo,camera);
 assert.equal(sky.state.active,false);assert.equal(photo.parent,scene);assert.ok(photo.position.equals(position)&&photo.scale.equals(scale),'repouso intacto');
 assert.equal(sky.begin(),true);assert.equal(sky.begin(),false);assert.equal(photo.parent,camera);
 const u=sky.uniforms,basis=u.uSkyBasis.value.clone(),tan=u.uSkyTanHalf.value;
 for(const point of points){
  const ray=new THREE.Vector3(point.x*aspect*tan,point.y*tan,-1).applyMatrix3(basis);
  const hit=u.uSkyDistance.value/-ray.z;
  const uv=new THREE.Vector2((u.uSkyEye.value.x+ray.x*hit-u.uSkyCenter.value.x)/u.uSkySize.value.x+.5,
    (u.uSkyEye.value.y+ray.y*hit-u.uSkyCenter.value.y)/u.uSkySize.value.y+.5).add(u.uSkyPan.value);
  assert.ok(uv.distanceTo(point.uv)<1e-12,'projeção inicial coincide com a foto anterior, sem salto');
 }
 for(const [yaw,pitch] of [[-.8,.2],[.8,-.3],[0,.5]]){
  camera.position.set(160,-50,-250);camera.rotation.set(pitch,yaw,0);camera.fov=56;camera.updateProjectionMatrix();sky.update();scene.updateMatrixWorld();
  assert.deepEqual(u.uSkyBasis.value.toArray(),basis.toArray(),'giro não modifica a perspectiva fotográfica');
  assert.equal(u.uSkyTanHalf.value,tan,'FOV da viagem não aplica zoom à galáxia');
  assert.deepEqual(u.uSkyEye.value.toArray(),[originalEye.x,originalEye.y],'translação não aproxima o céu');
  for(const [x,y] of [[-.5,-.5],[.5,.5]]){
   const corner=new THREE.Vector3(x,y,0).applyMatrix4(photo.matrixWorld).project(camera);
   assert.ok(Math.abs(corner.x-x*2*1.0001)<1e-10&&Math.abs(corner.y-y*2*1.0001)<1e-10,'céu cobre viewport sem quinas ou trapezoide');
   assert.ok(corner.z>-1&&corner.z<1,'superfície dentro do recorte da câmera');
  }
  assert.ok(Number.isFinite(sky.state.panX)&&Number.isFinite(sky.state.panY));
 }
 camera.quaternion.copy(originalQ);sky.update();assert.ok(u.uSkyPan.value.length()<1e-12,'voltar à orientação inicial devolve o mesmo céu, mesmo após transladar');
 assert.equal(photo.geometry,geometry);assert.equal(photo.material,material);assert.equal(photo.material.map,map);assert.equal(camera.far,900);
}
console.log('OK: projeção inicial idêntica, céu sem aproximação/perspectiva de parede, pan reversível, cobertura em quatro aspectos e mesmos recursos.');
