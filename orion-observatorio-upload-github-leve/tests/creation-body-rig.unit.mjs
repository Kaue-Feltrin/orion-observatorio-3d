import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createBodyRig,BODY_RIG_PROFILES} from '../creation-body-rig.js';
import {createCreationBindings} from '../creation-bindings.js';
for(const profile of Object.keys(BODY_RIG_PROFILES)){
 const material=new THREE.MeshBasicMaterial(),rig=createBodyRig(material,profile),g=rig.geometry;
 assert.equal(rig.bones.length,16);assert.ok(rig.mesh.isSkinnedMesh);
 const weights=g.getAttribute('skinWeight'),indices=g.getAttribute('skinIndex');
 for(let i=0;i<weights.count;i++){let sum=0;for(let j=0;j<4;j++){const w=weights.array[i*4+j];assert.ok(w>=0&&Number.isFinite(w));sum+=w;assert.ok(indices.array[i*4+j]<rig.bones.length);}assert.ok(Math.abs(sum-1)<1e-6);}
 const rest=g.getAttribute('position'),point=new THREE.Vector3(),v=[];let max=0;
 for(const seconds of [0,2,5,9,15,27]){
  rig.update(seconds,false,1);rig.mesh.updateMatrixWorld(true);rig.mesh.skeleton.update();v.length=0;
  for(let i=0;i<rest.count;i++){rig.mesh.getVertexPosition(i,point);assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));max=Math.max(max,point.distanceTo(new THREE.Vector3().fromBufferAttribute(rest,i)));v.push(point.clone());}
  const ix=g.index.array;
  for(let i=0;i<ix.length;i+=3){const [a,b,c]=[v[ix[i]],v[ix[i+1]],v[ix[i+2]]];const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);assert.ok(area>0,'rig must not invert triangles');}
 }
 assert.ok(max>.001&&max<.05,'subtle genuine vertex deformation');
 rig.update(5,true,1);rig.mesh.updateMatrixWorld(true);rig.mesh.skeleton.update();
 for(let i=0;i<rest.count;i++){rig.mesh.getVertexPosition(i,point);assert.ok(point.distanceTo(new THREE.Vector3().fromBufferAttribute(rest,i))<1e-6,'reduced motion restores rest pose');}
 rig.dispose();material.dispose();
}
const bindings=createCreationBindings();assert.equal(bindings.front.count+bindings.back.count,144);assert.notEqual(bindings.front,bindings.back);
const before=bindings.front.instanceMatrix.array.slice();bindings.update(.6,0,1);assert.notDeepEqual(bindings.front.instanceMatrix.array,before);bindings.update(1,0,1);assert.equal(bindings.root.visible,false);bindings.dispose();
console.log('OK: 3 weighted skeletons, normalized influences, finite deformation without inverted triangles, rest in reduced mode; continuous front/rear bindings and release.');
