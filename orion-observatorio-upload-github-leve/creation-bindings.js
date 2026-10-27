import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Two disjoint instance batches: a link belongs to the rear OR front, never both.
// Both use the same continuous pair of binding paths, with alternating link planes.
export function createCreationBindings(){
 const link=new THREE.TorusGeometry(.018,.0038,6,16);link.scale(1,1.5,1);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide,forceSinglePass:true,toneMapped:false,
  uniforms:{uOpacity:{value:1},uCharge:{value:0}},
  vertexShader:`varying vec3 vNormal;void main(){vec4 p=vec4(position,1.);vNormal=normal;
#ifdef USE_INSTANCING
p=instanceMatrix*p;vNormal=mat3(instanceMatrix)*normal;
#endif
gl_Position=projectionMatrix*modelViewMatrix*p;}`,
  fragmentShader:`uniform float uOpacity,uCharge;varying vec3 vNormal;void main(){float light=.45+.55*abs(dot(normalize(vNormal),normalize(vec3(-.3,.6,1.))));vec3 amber=mix(vec3(.15,.072,.018),vec3(.66,.39,.11),light);gl_FragColor=vec4(amber*(1.+uCharge*.55),uOpacity);
#include <colorspace_fragment>
}`});
 const all=[];const vector=new THREE.Vector3(),basis=new THREE.Matrix4();
 for(let path=0;path<2;path++)for(let i=0;i<72;i++){
  const angle=i/72*Math.PI*2,tilt=path===0?.72:-.88;
  const p=new THREE.Vector3(Math.cos(angle)*.42,Math.sin(angle)*.42,0).applyAxisAngle(new THREE.Vector3(0,1,0),1.08).applyAxisAngle(new THREE.Vector3(0,0,1),tilt);
  const tangent=new THREE.Vector3(-Math.sin(angle),Math.cos(angle),0).applyAxisAngle(new THREE.Vector3(0,1,0),1.08).applyAxisAngle(new THREE.Vector3(0,0,1),tilt).normalize();
  const normal=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),1.08).applyAxisAngle(new THREE.Vector3(0,0,1),tilt);
  const cross=new THREE.Vector3().crossVectors(tangent,normal).normalize();basis.makeBasis(cross,tangent,normal);
  const q=new THREE.Quaternion().setFromRotationMatrix(basis);q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),i%2?Math.PI/2:0));
  all.push({p,q,seed:(i*.618+path*.37)%1,front:p.z>=0});
 }
 const entries=[],root=new THREE.Group();root.name='ContinuousAmberBindings';
 for(const front of [false,true]){
  const list=all.filter(l=>l.front===front),mesh=new THREE.InstancedMesh(link,material,list.length);mesh.renderOrder=front?14:8;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(mesh);entries.push({mesh,list});
 }
 const dummy=new THREE.Object3D(),spin=new THREE.Quaternion();
 function update(fracture,charge,opacity){
  material.uniforms.uCharge.value=charge;material.uniforms.uOpacity.value=opacity*(1-THREE.MathUtils.smoothstep(fracture,.5,1));
  root.visible=opacity>.001&&fracture<1;
  for(const {mesh,list} of entries){list.forEach((l,i)=>{const t=THREE.MathUtils.smoothstep(fracture,.04+l.seed*.12,.86),distance=t*t*(.4+l.seed*.65);vector.copy(l.p).normalize();dummy.position.copy(l.p).addScaledVector(vector,distance);dummy.position.y-=t*t*.18;dummy.quaternion.copy(l.q).multiply(spin.setFromAxisAngle(vector,t*(l.seed-.5)*4));dummy.scale.setScalar(1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;}
 }
 // One small seal on the near crossing; restraint is brighter locally, not all around.
 const plate=new THREE.Shape();plate.moveTo(-.025,-.024);plate.lineTo(.025,-.024);plate.quadraticCurveTo(.031,-.024,.031,-.018);plate.lineTo(.031,.018);plate.quadraticCurveTo(.031,.024,.025,.024);plate.lineTo(-.025,.024);plate.quadraticCurveTo(-.031,.024,-.031,.018);plate.lineTo(-.031,-.018);plate.quadraticCurveTo(-.031,-.024,-.025,-.024);
 const key=new THREE.Path();key.absellipse(0,0,.005,.007,0,Math.PI*2,true);plate.holes.push(key);
 const face=new THREE.ShapeGeometry(plate).toNonIndexed(),arc=new THREE.TorusGeometry(.022,.0045,6,16,Math.PI).toNonIndexed();arc.translate(0,.022,0);
 const claspGeometry=mergeGeometries([face,arc]);face.dispose();arc.dispose();
 const clasp=new THREE.Mesh(claspGeometry,material);clasp.position.set(0,-.18,.43);clasp.renderOrder=15;root.add(clasp);
 update(0,0,1);
 return {root,front:entries[1].mesh,back:entries[0].mesh,count:all.length,update,dispose(){link.dispose();clasp.geometry.dispose();material.dispose();}};
}
