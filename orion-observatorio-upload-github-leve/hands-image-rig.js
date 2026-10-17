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
  ['wrist',null,.014,.70],['palm','wrist',.009,.81],
  ['index','palm',.030,1.03],['indexDistal','index',.039,1.12],
  ['thumb','palm',.024,.85],['thumbDistal','thumb',.030,.93],
  ['middle','palm',.021,.96],['ring','palm',.018,.89],['little','palm',.015,.83]
];
const LANDMARKS=['wrist','palm','indexTip','thumbTip','middleTip','ringTip','littleTip'];

// Correspondências das bordas do indicador nas duas imagens existentes.
// Cada coluna mapeia piso/borda inferior/borda superior monotonamente: o dedo
// muda de contorno sem dobrar a malha nem deixar duas silhuetas no crossfade.
const INDEX_BANDS=[
  [150,503,490,314,291],[180,522,461,359,279],
  [220,518,427,391,300],[270,489,402,420,330],
  [320,478,389,446,358],[370,495,380,486,381],
  [420,525,401,525,404],[480,550,455,550,458],
  [530,565,493,565,496]
].map(([x,low,high,toLow,toHigh])=>[x/1122,1-low/1402,1-high/1402,1-toLow/1402,1-toHigh/1402]);
function mappedIndexV(u,v,inverse){
  if(u>INDEX_BANDS.at(-1)[0])return v;
  let a=INDEX_BANDS[0],b=a;
  for(let i=1;i<INDEX_BANDS.length;i++){
    b=INDEX_BANDS[i];if(u<=b[0])break;a=b;
  }
  const t=a===b?0:THREE.MathUtils.clamp((u-a[0])/(b[0]-a[0]),0,1);
  const band=a.map((value,i)=>THREE.MathUtils.lerp(value,b[i],t));
  const fromLow=band[inverse?3:1],fromHigh=band[inverse?4:2];
  const toLow=band[inverse?1:3],toHigh=band[inverse?2:4],floor=.54;
  if(v<=floor)return v;
  if(v<fromLow)return THREE.MathUtils.lerp(floor,toLow,(v-floor)/(fromLow-floor));
  if(v<fromHigh)return THREE.MathUtils.lerp(toLow,toHigh,(v-fromLow)/(fromHigh-fromLow));
  return v+toHigh-fromHigh;
}

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
      const b=name.endsWith('Distal')?profile[name.replace('Distal','')+'Tip']:
        (profile[name+'Distal']||endpoint);
      const radius=name.startsWith('index')?.14:name.startsWith('thumb')?.08:.065;
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
  if(pose!=='left'){
    const positions=geometry.getAttribute('position');
    const target=new Float32Array(positions.array);
    for(let i=0;i<uv.count;i++)target[i*3+1]=mappedIndexV(uv.getX(i),uv.getY(i),pose==='pointing')-.5;
    geometry.morphAttributes.position=[new THREE.Float32BufferAttribute(target,3)];
  }
  geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
  geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
  const mesh=new THREE.SkinnedMesh(geometry,material);
  mesh.add(bones[0]);
  mesh.bind(new THREE.Skeleton(bones));
  mesh.frustumCulled=false;
  let disposed=false;

  function update(seconds,reducedMotion=false,pointing=pose==='pointing'?1:0){
    if(disposed)return;
    for(let i=0;i<CONTROLS.length;i++){
      const [, ,amplitude,frequency]=CONTROLS[i];
      // Respiração e flexões legíveis; não seguem a mira.
      bones[i].rotation.z=reducedMotion?0:Math.sin(seconds*frequency+profile.phase+i*.43)*amplitude;
    }
    if(pose!=='left'){
      const progress=THREE.MathUtils.clamp(pointing,0,1);
      // Morph de contorno na GPU + ossos de repouso: as duas texturas mostram
      // o mesmo estágio do dedo antes de misturar sua iluminação/detalhes.
      mesh.morphTargetInfluences[0]=reducedMotion?0:pose==='neutral'?progress:1-progress;
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
