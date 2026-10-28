import * as THREE from 'three';

// Image rigs: joint coordinates refer to the current silhouette's own UV space.
// They deform a plane, not a complete three-dimensional body.
export const BODY_RIG_PROFILES={
 fetal:{root:[.48,.46],spine:[.38,.49],neck:[.47,.69],head:[.48,.78],
  armL:[.48,.59],elbowL:[.60,.52],handL:[.61,.61],armR:[.48,.57],elbowR:[.58,.51],handR:[.58,.60],
  hipL:[.43,.37],kneeL:[.66,.44],footL:[.60,.28],hipR:[.42,.36],kneeR:[.60,.41],footR:[.54,.27]},
 menina:{root:[.51,.49],spine:[.53,.66],neck:[.57,.81],head:[.62,.91],
  armL:[.35,.78],elbowL:[.27,.67],handL:[.08,.62],armR:[.61,.77],elbowR:[.70,.66],handR:[.88,.57],
  hipL:[.40,.49],kneeL:[.31,.33],footL:[.41,.17],hipR:[.56,.49],kneeR:[.57,.29],footR:[.57,.06]},
 menino:{root:[.52,.51],spine:[.52,.69],neck:[.46,.82],head:[.37,.91],
  armL:[.40,.77],elbowL:[.28,.68],handL:[.10,.78],armR:[.65,.78],elbowR:[.75,.68],handR:[.89,.58],
  hipL:[.43,.51],kneeL:[.35,.39],footL:[.48,.26],hipR:[.58,.51],kneeR:[.55,.30],footR:[.48,.07]}


};
const parents={root:null,spine:'root',neck:'spine',head:'neck',armL:'spine',elbowL:'armL',handL:'elbowL',armR:'spine',elbowR:'armR',handR:'elbowR',hipL:'root',kneeL:'hipL',footL:'kneeL',hipR:'root',kneeR:'hipR',footR:'kneeR'};
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1];const t=THREE.MathUtils.clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
export function createBodyRig(material,profileName){
 const profile=BODY_RIG_PROFILES[profileName];if(!profile)throw new Error('Unknown silhouette rig');
 const names=Object.keys(parents),bones=[],byName={},geometry=new THREE.PlaneGeometry(1,1,48,64);
 for(const name of names){const bone=new THREE.Bone(),parent=parents[name],at=profile[name],from=parent?profile[parent]:[.5,.5];bone.name='Soul_'+profileName+'_'+name;bone.position.set(at[0]-from[0],at[1]-from[1],0);if(parent)byName[parent].add(bone);byName[name]=bone;bones.push(bone);}
 const uv=geometry.getAttribute('uv'),indices=[],weights=[];
 for(let i=0;i<uv.count;i++){
  const x=uv.getX(i),y=uv.getY(i);
  const candidates=names.map((name,index)=>{const parent=parents[name],a=profile[name],b=parent?profile[parent]:a;
   const distance=segmentDistance(x,y,a,b);return {index,weight:Math.exp(-Math.pow(distance/.075,2)*2)+1e-15};}).sort((a,b)=>b.weight-a.weight).slice(0,4);
  const total=candidates.reduce((s,c)=>s+c.weight,0);for(const c of candidates){indices.push(c.index);weights.push(c.weight/total);}
 }
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
 const mesh=new THREE.SkinnedMesh(geometry,material);mesh.add(bones[0]);mesh.bind(new THREE.Skeleton(bones));mesh.frustumCulled=false;
 const phase=profileName==='menina'?.6:profileName==='menino'?2.7:1.3;
 function update(time,reduced=false,selected=0){
  for(const bone of bones)bone.rotation.set(0,0,0);
  if(reduced)return;
  const breath=Math.sin(time*.7+phase),sway=Math.sin(time*.42+phase);
  byName.spine.rotation.z=breath*.007;byName.neck.rotation.z=sway*.012;byName.head.rotation.z=-sway*.006-selected*.018;
  byName.armL.rotation.z=Math.sin(time*.53+phase)*.012;byName.armR.rotation.z=Math.sin(time*.49+phase+1)*.012;
  byName.elbowL.rotation.z=breath*.008;byName.elbowR.rotation.z=-breath*.009;
  byName.hipL.rotation.z=sway*.006;byName.hipR.rotation.z=-sway*.005;
  byName.kneeL.rotation.z=breath*.008;byName.kneeR.rotation.z=-breath*.007;
 }
 return {mesh,bones,geometry,update,dispose(){mesh.skeleton.dispose();geometry.dispose();}};
}
export const bodyVertex=`
#include <common>
#include <skinning_pars_vertex>
varying vec2 vUv;varying float vEdge,vSeed,vLife;
void main(){vUv=uv;vEdge=1.;vSeed=0.;vLife=1.;
#include <skinbase_vertex>
#include <begin_vertex>
#include <skinning_vertex>
gl_Position=projectionMatrix*modelViewMatrix*vec4(transformed,1.);
}`;
