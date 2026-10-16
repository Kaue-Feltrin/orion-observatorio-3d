// Órion · Viewmodel FPS v0.9.14: mãos anatômicas de um exemplo 3D/VR real.
// Fonte dos dois GLBs: WonderlandEngine/hand-poser (repositório MIT).
// Separadas em duas SkinnedMeshes com 25 ossos cada; 0 texturas externas.
// Inspiração de enquadramento: IRONLINE/3d-fps docs/FP_FRAMING.md.
// É UMA PRÉVIA DE COMPOSIÇÃO, não arte definitiva de Clove/VALORANT.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const URLS=['/models/wonderland-left.glb','/models/wonderland-right.glb'];
const SIDES=['left','right'];
const FINGER_RE=/(index|middle|ring|pinky|thumb)[_-]finger[_-]phalanx[_-](proximal|intermediate|distal)/i;
// A pose aberta pertence ao teste original; a nova pose de repouso
// usa flexão por falange, como no hand-poser/WebXR, com dedos relaxados.
// ?handPose=open permite comparação A/B sem mudar os modelos 3D.
const FINGER_CURL={
  relaxed:{index:.44,middle:.53,ring:.61,pinky:.69,thumb:.26},
  open:{index:.37,middle:.47,ring:.56,pinky:.63,thumb:.22},
};
const poseRequested=new URLSearchParams(location.search).get('handPose');
const poseName=poseRequested==='open'?'open':'relaxed';
const REST_CURL=FINGER_CURL[poseName];
// A mão não pode ficar vertical olhando para a câmera ("pare").
// Inclinação do punho faz os dedos apontarem para dentro da cena.
// Usar pose aberta antiga apenas como referência de comparação.
const HAND_PITCH=poseName==='relaxed'?2.11:Math.PI-.36;
const HAND_YAW=poseName==='relaxed'?.30:.42;
const HAND_ROLL=poseName==='relaxed'?.22:.29;
const FLEX_AXIS=new THREE.Vector3(1,0,0);
const TEMP_QUATERNION=new THREE.Quaternion();

export function createVrFirstPersonHands(camera,{enabled=true,reducedMotion=false}={}){
  const state={
    mode:'vr',enabled:!!enabled,visible:!!enabled,
    loaded:false,loadError:null,motionEnabled:!reducedMotion,
    drawSurfaces:0,textureCount:0,joints:0,fingerJoints:0,triangles:0,
    swayX:0,swayY:0,leftX:0,rightX:0,pose:poseName
  };
  if(!enabled){
    return{state,meshes:[],ready:Promise.resolve(false),update(){},resize(){},beginTravel(){},dispose(){}};
  }
  const root=new THREE.Group();
  root.name='Órion · mãos anatômicas (viewmodel independente)';
  camera.add(root);
  const groups=SIDES.map(name=>{
    const g=new THREE.Group();g.name='Órion · '+name;
    root.add(g);return g;
  });
  const meshes=[],bones=[],driven=[],materials=[],geometries=[];
  let disposed=false,timeLast=0;
  let motionX=0,motionY=0;

  function loadGLB(url){
    return new Promise((resolve,reject)=>{
      new GLTFLoader().load(url,resolve,undefined,reject);
    });
  }
  function install(gltf,i){
    const model=gltf.scene;
    const g=groups[i];
    model.traverse(obj=>{
      if(obj.isBone){
        bones.push(obj);
        const m=obj.name.match(FINGER_RE);
        if(m&&m[2]!=='metacarpal'){
          driven.push({bone:obj,base:obj.quaternion.clone(),
            side:i===0?-1:1,finger:m[1],
            segment:m[2]==='proximal'?1:m[2]==='intermediate'?2:3,
            phase:['index','middle','ring','pinky','thumb'].indexOf(m[1])*.64});
        }
      }
      if(!obj.isMesh)return;
      const geo=obj.geometry.clone();
      const pos=geo.getAttribute('position');
      const normals=geo.getAttribute('normal');
      const rgba=new Float32Array(pos.count*4);
      for(let j=0;j<pos.count;j++){
        const light=THREE.MathUtils.clamp(.38+.37*normals.getZ(j)+.23*normals.getY(j),.24,.95);
        // Ponta do pulso se dissolve; a mão permanece sólida e nítida.
        const y=pos.getY(j);
        const alpha=1-THREE.MathUtils.smoothstep(y,-.045,.018)*.75;
        const tip=1-THREE.MathUtils.smoothstep(y,-.17,-.04);
        rgba[j*4]=light*(.74+.13*tip);
        rgba[j*4+1]=light*(.65+.07*tip);
        rgba[j*4+2]=light*(.95+.04*tip);
        rgba[j*4+3]=alpha;
      }
      geo.setAttribute('color',new THREE.Float32BufferAttribute(rgba,4));
      geometries.push(geo);
      const mat=new THREE.MeshBasicMaterial({
        color:0xb2a6cb,vertexColors:true,
        transparent:true,opacity:.97,
        depthTest:false,depthWrite:false,toneMapped:false,
        side:THREE.DoubleSide
      });
      materials.push(mat);
      obj.geometry=geo;
      obj.material=mat;
      obj.layers.set(0);
      obj.renderOrder=30;obj.frustumCulled=false;
      meshes.push(obj);
      state.triangles+=(geo.index?.count||geo.attributes.position.count)/3;
    });
    g.add(model);
  }
  function viewHalf(z){
    const h=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*Math.abs(z);
    return{h,w:h*camera.aspect};
  }
  function resize(){
    if(!state.loaded)return;
    const depth=1.38;
    const {h,w}=viewHalf(depth);
    // Em primeira pessoa o punho fica quase abaixo da moldura
    // (y ≈ 96% na tela), e os dedos ficam mais altos (y ≈ 73%).
    const s=h*.45/.1774;
    for(let i=0;i<2;i++){
      const g=groups[i],side=i===0?-1:1;
      g.scale.setScalar(s);
      // Vista 3/4, com os punhos entrando pelos cantos inferiores.
      // As palmas deixam de parecer duas placas verticais de "pare".
      g.rotation.set(HAND_PITCH,side*-HAND_YAW,side*HAND_ROLL);
      g.position.set(side*w*.54,-h*.94,-depth);
    }
    state.leftX=groups[0].position.x;
    state.rightX=groups[1].position.x;
  }
  const ready=Promise.all(URLS.map(loadGLB)).then(glbs=>{
    if(disposed)return false;
    glbs.forEach(install);
    if(meshes.length!==2||bones.length<50||driven.length<24)
      throw new Error('GLB anatômico não contém malhas/juntas suficientes');
    state.drawSurfaces=meshes.length;
    state.joints=bones.length;
    state.fingerJoints=driven.length;
    state.loaded=true;
    resize();
    root.visible=state.visible;
    return true;
  }).catch(error=>{
    state.loadError=String(error?.message||error);
    state.loaded=false;
    return false;
  });
  function update(time,delta,mouseX=0,mouseY=0){
    if(!state.loaded||!state.visible)return;
    const alpha=state.motionEnabled?1-Math.exp(-Math.min(.06,Math.max(0,delta))*7.5):1;
    motionX+=(THREE.MathUtils.clamp(mouseX,-1,1)-motionX)*alpha;
    motionY+=(THREE.MathUtils.clamp(mouseY,-1,1)-motionY)*alpha;
    state.swayX=state.motionEnabled?motionX:0;
    state.swayY=state.motionEnabled?motionY:0;
    const {h,w}=viewHalf(1.38);
    const breath=state.motionEnabled?Math.sin(time*.72)*h*.005:0;
    for(let i=0;i<2;i++){
      const g=groups[i],sign=i===0?-1:1;
      g.position.x=sign*w*.54-state.swayX*w*.016;
      g.position.y=-h*.94-state.swayY*h*.018+breath*(i===0?.9:1);
      g.rotation.set(HAND_PITCH+(state.motionEnabled?state.swayY*.009:0),
        sign*-HAND_YAW,sign*HAND_ROLL+(state.motionEnabled?state.swayX*.014:0));
    }
    // Pouquíssimo movimento no idle, com ossos reais e sem clipes externos.
    if(time-timeLast>=0){
      for(const d of driven){
        // As mãos NÃO ficam em pose de "pare": falanges dobradas em repouso.
        // O movimento de idle apenas oscila levemente ao redor dessa pose.
        const small=state.motionEnabled?.018*Math.sin(time*.7+d.phase+d.side*.3):0;
        const amount=(REST_CURL[d.finger]+small)*
          (d.segment===1?1:d.segment===2?.78:.48);
        TEMP_QUATERNION.setFromAxisAngle(FLEX_AXIS,amount);
        d.bone.quaternion.copy(d.base).multiply(TEMP_QUATERNION);
      }
    }
    timeLast=time;
  }
  function beginTravel(){state.visible=false;root.visible=false;}
  function dispose(){
    disposed=true;
    camera.remove(root);
    geometries.forEach(g=>g.dispose());
    materials.forEach(m=>m.dispose());
    root.clear();
  }
  return{state,meshes,bones,driven,groups,root,ready,update,resize,beginTravel,dispose};
}
