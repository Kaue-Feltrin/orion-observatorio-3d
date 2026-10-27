import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Two disjoint instance batches: a link belongs to the rear OR front, never both.
// Both use the same continuous pair of binding paths, with alternating link planes.
export function createCreationBindings(){
 const link=new THREE.TorusGeometry(.0155,.0032,10,24);link.scale(1,1.55,1);
 const material=new THREE.MeshStandardMaterial({color:0x977747,roughness:.32,metalness:.35,emissive:0x50331b,emissiveIntensity:.12,transparent:true,opacity:1,depthWrite:false,depthTest:false,side:THREE.DoubleSide,forceSinglePass:true});
 const all=[];const vector=new THREE.Vector3(),basis=new THREE.Matrix4();
 for(let path=0;path<2;path++)for(let i=0;i<72;i++){
  const angle=i/72*Math.PI*2,tilt=path===0?.46:-.37;
  const p=new THREE.Vector3(Math.cos(angle)*.415,Math.sin(angle)*.415,0).applyAxisAngle(new THREE.Vector3(1,0,0),1.06).applyAxisAngle(new THREE.Vector3(0,0,1),tilt);
  const tangent=new THREE.Vector3(-Math.sin(angle),Math.cos(angle),0).applyAxisAngle(new THREE.Vector3(1,0,0),1.06).applyAxisAngle(new THREE.Vector3(0,0,1),tilt).normalize();
  const normal=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(1,0,0),1.06).applyAxisAngle(new THREE.Vector3(0,0,1),tilt);
  const cross=new THREE.Vector3().crossVectors(tangent,normal).normalize();basis.makeBasis(cross,tangent,normal);
  const q=new THREE.Quaternion().setFromRotationMatrix(basis);q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),i%2?Math.PI/2:0));
  all.push({p,q,seed:(i*.618+path*.37)%1,front:p.z>=0});
 }
 const entries=[],root=new THREE.Group();root.name='ContinuousAmberBindings';
 const ambient=new THREE.AmbientLight(0xb9a4ba,.48);root.add(ambient);
 const keyLight=new THREE.DirectionalLight(0xffdbac,2.3);keyLight.position.set(-.7,.9,1.5);root.add(keyLight,keyLight.target);
 const rimLight=new THREE.DirectionalLight(0x999bbc,1.2);rimLight.position.set(.8,-.3,-1);root.add(rimLight,rimLight.target);
 for(const front of [false,true]){
  const list=all.filter(l=>l.front===front),mesh=new THREE.InstancedMesh(link,material,list.length);mesh.renderOrder=front?14:8;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(mesh);entries.push({mesh,list});
 }
 const dummy=new THREE.Object3D(),spin=new THREE.Quaternion();
 function update(fracture,charge,opacity){
  material.emissiveIntensity=.12+charge*.75;material.opacity=opacity*(1-THREE.MathUtils.smoothstep(fracture,.5,1));
  root.visible=opacity>.001&&fracture<1;
  for(const {mesh,list} of entries){list.forEach((l,i)=>{const t=THREE.MathUtils.smoothstep(fracture,.04+l.seed*.12,.86),distance=t*t*(.4+l.seed*.65);vector.copy(l.p).normalize();dummy.position.copy(l.p).addScaledVector(vector,distance);dummy.position.y-=t*t*.18;dummy.quaternion.copy(l.q).multiply(spin.setFromAxisAngle(vector,t*(l.seed-.5)*4));dummy.scale.setScalar(1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;}
 }
 // One small seal on the near crossing; restraint is brighter locally, not all around.
 const plate=new THREE.Shape();plate.moveTo(-.025,-.024);plate.lineTo(.025,-.024);plate.quadraticCurveTo(.031,-.024,.031,-.018);plate.lineTo(.031,.018);plate.quadraticCurveTo(.031,.024,.025,.024);plate.lineTo(-.025,.024);plate.quadraticCurveTo(-.031,.024,-.031,.018);plate.lineTo(-.031,-.018);plate.quadraticCurveTo(-.031,-.024,-.025,-.024);
 const key=new THREE.Path();key.absellipse(0,0,.005,.007,0,Math.PI*2,true);plate.holes.push(key);
 const face=new THREE.ExtrudeGeometry(plate,{depth:.009,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:2,steps:1}),arc=new THREE.TorusGeometry(.022,.0045,6,16,Math.PI).toNonIndexed();arc.translate(0,.022,0);
 const claspGeometry=mergeGeometries([face,arc]);face.dispose();arc.dispose();
 const clasp=new THREE.Mesh(claspGeometry,material);clasp.scale.setScalar(.65);clasp.position.set(0,-.18,.43);clasp.rotation.set(-.1,.15,-.07);clasp.renderOrder=15;root.add(clasp);
 update(0,0,1);
 return {root,front:entries[1].mesh,back:entries[0].mesh,count:all.length,update,dispose(){link.dispose();clasp.geometry.dispose();material.dispose();}};
}
