// Rig 2,5D: controles locais à imagem aprovada; não cria volume oculto.
import * as THREE from 'three';

const PROFILES={
  left:{
    wrist:[.23,.17],palm:[.47,.44],
    index:[.49,.62],indexDistal:[.63,.74],indexTip:[.75,.80],
    thumb:[.54,.36],thumbDistal:[.73,.37],thumbTip:[.90,.38],
    middle:[.52,.60],middleTip:[.76,.61],
    ring:[.50,.54],ringTip:[.70,.49],little:[.47,.49],littleTip:[.64,.44],phase:.4
  },
  pointing:{
    wrist:[.80,.20],palm:[.59,.44],
    index:[.45,.63],indexDistal:[.32,.74],indexTip:[.17,.80],
    thumb:[.49,.39],thumbDistal:[.35,.43],thumbTip:[.23,.45],
    middle:[.48,.59],middleTip:[.24,.50],
    ring:[.52,.55],ringTip:[.34,.47],little:[.57,.52],littleTip:[.43,.47],phase:1.2
  },
  neutral:{
    wrist:[.80,.20],palm:[.59,.44],
    index:[.45,.63],indexDistal:[.29,.71],indexTip:[.15,.65],
    thumb:[.49,.39],thumbDistal:[.35,.43],thumbTip:[.23,.45],
    middle:[.48,.59],middleTip:[.20,.50],
    ring:[.52,.55],ringTip:[.29,.46],little:[.57,.52],littleTip:[.38,.46],phase:1.2
  }
};
const CONTROLS=[
  ['wrist',null,.0035,.47],['palm','wrist',.003,.61],
  ['index','palm',.010,.83],['indexDistal','index',.013,.92],
  ['thumb','palm',.008,.65],['thumbDistal','thumb',.010,.73],
  ['middle','palm',.007,.76],['ring','palm',.006,.69],['little','palm',.005,.63]
];
const LANDMARKS=['wrist','palm','indexTip','thumbTip','middleTip','ringTip','littleTip'];

function influence(u,v,a,b,radius){
  const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
  const t=THREE.MathUtils.clamp(((u-a[0])*dx+(v-a[1])*dy)/length,0,1);
  const distance=((u-a[0]-t*dx)**2+(v-a[1]-t*dy)**2)/(radius*radius);
  return Math.exp(-2.5*distance);
}

export function createHandImageRig(geometry,material,pose){
  const profile=PROFILES[pose];
  if(!profile)throw new Error('Pose de rig de mãos desconhecida');
  const bones=[],byName={};
  for(const [name,parent] of CONTROLS){
    const bone=new THREE.Bone(),pivot=profile[name];
    bone.name='MMV_'+pose+'_'+name;
    const origin=parent?profile[parent]:[.5,.5];
    bone.position.set(pivot[0]-origin[0],pivot[1]-origin[1],0);
    if(parent)byName[parent].add(bone);
    bones.push(bone);byName[name]=bone;
  }

  const uv=geometry.getAttribute('uv');
  const indices=new Uint16Array(uv.count*4),weights=new Float32Array(uv.count*4);
  const landmarkIndices=Object.fromEntries(LANDMARKS.map(name=>[name,{index:0,distance:Infinity}]));
  for(let i=0;i<uv.count;i++){
    const u=uv.getX(i),v=uv.getY(i);
    const wristWeight=1-THREE.MathUtils.smoothstep(v,.18,.46);
    const candidates=[{index:0,weight:.04+wristWeight*4},
      {index:1,weight:.15+influence(u,v,profile.wrist,profile.palm,.24)}];
    for(let j=2;j<CONTROLS.length;j++){
      const [name]=CONTROLS[j];
      const endpoint=profile[name+'Tip']||profile.indexTip;
      const a=profile[name];
      const b=name.endsWith('Distal')?profile[name.replace('Distal','')+'Tip']:endpoint;
      const radius=name.startsWith('index')?.09:name.startsWith('thumb')?.08:.065;
      candidates.push({index:j,weight:influence(u,v,a,b,radius)*(1-wristWeight)*3});
    }
    candidates.sort((a,b)=>b.weight-a.weight);
    const total=candidates.slice(0,4).reduce((sum,c)=>sum+c.weight,0);
    for(let j=0;j<4;j++){
      indices[i*4+j]=candidates[j].index;
      weights[i*4+j]=candidates[j].weight/total;
    }
    for(const name of LANDMARKS){
      const p=profile[name],distance=(u-p[0])**2+(v-p[1])**2;
      if(distance<landmarkIndices[name].distance)landmarkIndices[name]={index:i,distance};
    }
  }
  geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
  geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
  const mesh=new THREE.SkinnedMesh(geometry,material);
  mesh.add(bones[0]);
  mesh.bind(new THREE.Skeleton(bones));
  mesh.frustumCulled=false;
  let disposed=false;

  function update(seconds,reducedMotion=false){
    if(disposed)return;
    for(let i=0;i<CONTROLS.length;i++){
      const [, ,amplitude,frequency]=CONTROLS[i];
      // Frequências lentas, sem seguir a mira ou criar apontamento fora do hover.
      bones[i].rotation.z=reducedMotion?0:Math.sin(seconds*frequency+profile.phase+i*.43)*amplitude;
    }
  }
  function measure(){
    mesh.parent?.updateWorldMatrix(true,false);
    mesh.updateMatrixWorld(true);
    const positions=geometry.getAttribute('position');
    const rest=new THREE.Vector3(),deformed=new THREE.Vector3();
    let maxVertexDelta=0;
    for(let i=0;i<positions.count;i++){
      rest.fromBufferAttribute(positions,i);
      mesh.getVertexPosition(i,deformed);
      maxVertexDelta=Math.max(maxVertexDelta,deformed.distanceTo(rest));
    }
    const landmarks={};
    for(const name of LANDMARKS){
      const index=landmarkIndices[name].index;
      landmarks[name]=mesh.getVertexPosition(index,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
    }
    return {pose,maxVertexDelta,landmarks,
      boneCount:bones.length,
      boneTextureBytes:mesh.skeleton.boneTexture?.image?.data?.byteLength||0};
  }
  function dispose(){
    if(disposed)return;
    disposed=true;mesh.skeleton.dispose();
  }
  return {pose,mesh,bones,update,measure,dispose};
}
