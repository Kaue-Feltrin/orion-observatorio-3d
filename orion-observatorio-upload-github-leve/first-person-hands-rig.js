// Projeto Órion v0.9.13 · viewmodel com rig de dedos real.
// Asset WRAD ARMS por wriks, CC0 1.0: https://github.com/wwwriks/wrad-arms
// Vendorizado em /public/models/wrad-arms.glb, sem fetch externo ao abrir.
// Rig: 50 juntas, dedos esquerdo/direito com 3 falanges e controles IK.
// A animação repouso é ORIGINAL do Órion, não extraída de outros jogos.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ASSET_URL='/models/wrad-arms.glb';
const FINGER_NAMES=['finger_index','finger_middle','finger_ring','finger_pinky','finger_thumb'];
const FLEX_AXIS=new THREE.Vector3(1,0,0);
const _rotation=new THREE.Quaternion();
const _axis=new THREE.Vector3();

export function createRiggedFirstPersonHands(camera,{enabled=true,reducedMotion=false}={}){
  const state={
    mode:'rig',enabled:Boolean(enabled),visible:Boolean(enabled),
    motionEnabled:!reducedMotion,loaded:false,loadError:null,
    joints:0,fingerJoints:0,drawSurfaces:0,textureCount:0,
    triangles:0,leftX:0,rightX:0,swayX:0,swayY:0
  };
  if(!enabled){
    return{state,meshes:[],ready:Promise.resolve(false),
      update(){},resize(){},beginTravel(){},dispose(){}};
  }
  const rigRoot=new THREE.Group();
  rigRoot.name='Órion · viewmodel rigado de primeira pessoa';
  camera.add(rigRoot);
  const meshes=[];
  const driven=[];
  const ownedMaterials=[];
  const ownedTextures=[];
  const owner={disposed:false};
  let currentX=0,currentY=0,baseY=-.4;
  let restScale=1;
  function align(){
    if(!state.loaded)return;
    const depth=1.35;
    const hh=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*depth;
    const hw=hh*camera.aspect;
    // Enquadre conservador: manter espaço vazio no centro superior.
    const allowedWidth=Math.min(hw*1.75,hh*3.70);
    restScale=allowedWidth/(state.modelBounds?.width||11);
    rigRoot.scale.setScalar(restScale);
    const b=state.modelBounds;
    rigRoot.position.set(-(b.centerX||0)*restScale,
      -hh*.30-b.top*restScale,-depth);
    baseY=rigRoot.position.y;
    state.leftX=-hw*.67;state.rightX=hw*.67;
  }
  function install(gltf){
    if(owner.disposed){
      gltf.scene.traverse(o=>{if(o.isMesh){o.geometry?.dispose?.();o.material?.dispose?.();}});
      return;
    }
    const model=gltf.scene;
    model.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(model);
    const size=new THREE.Vector3(),center=new THREE.Vector3();
    bounds.getSize(size);bounds.getCenter(center);
    if(!Number.isFinite(size.x)||size.x<.001)throw new Error('Bounding box inválida no WRAD ARMS');
    state.modelBounds={width:size.x,centerX:center.x,top:bounds.max.y};
    const joints=new Map();
    model.traverse(obj=>{
      if(obj.isBone)joints.set(obj.name,obj);
      if(!obj.isMesh)return;
      // Material barato com a textura autoral original do artista, tingido
      // de violeta sem adicionar luzes, partículas ou bloom.
      const source=Array.isArray(obj.material)?obj.material[0]:obj.material;
      const map=source?.map||null;
      if(map&&!ownedTextures.includes(map))ownedTextures.push(map);
      const mat=new THREE.MeshBasicMaterial({
        map,color:0xb5a1d1,transparent:true,opacity:.90,
        depthTest:false,depthWrite:false,toneMapped:false,
        side:THREE.DoubleSide
      });
      ownedMaterials.push(mat);
      obj.material=mat;
      obj.layers.set(0);
      obj.renderOrder=30;
      obj.frustumCulled=false;
      meshes.push(obj);
      const geo=obj.geometry;
      state.triangles+=(geo.index?.count||geo.attributes.position?.count||0)/3;
    });
    if(!meshes.some(x=>x.isSkinnedMesh))throw new Error('WRAD ARMS veio sem malha SkinnedMesh');
    for(const [name,bone] of joints){
      // Cada falange tem seu próprio transform, permitindo animação de dedo
      // e futura abertura, fechamento, apontar e interação com Nox.
      if(!/^finger_(index|middle|ring|pinky|thumb)[123]\.[lr]$/.test(name))continue;
      const match=/^finger_([a-z]+)([123])\.([lr])$/.exec(name);
      const ordinal=Number(match[2]),side=match[3];
      driven.push({
        name,bone,base:bone.quaternion.clone(),
        side:side==='l'?1:-1,
        segment:ordinal,
        offset: FINGER_NAMES.indexOf('finger_'+match[1])*.73,
      });
    }
    if(driven.length<20)throw new Error('Rig incompleto: menos de 20 falanges controláveis');
    state.joints=joints.size;
    state.fingerJoints=driven.length;
    state.textureCount=ownedTextures.length;
    state.drawSurfaces=meshes.length;
    model.name='WRAD ARMS CC0 · 50 ossos';
    rigRoot.add(model);
    state.loaded=true;
    align();
    rigRoot.visible=state.visible;
  }

  // Promise exposta apenas para testes e diagnóstico; falha é registrada,
  // nunca produz telemetria remota.
  const ready=new Promise(resolve=>{
    new GLTFLoader().load(ASSET_URL,gltf=>{
      try{install(gltf);resolve(true);}
      catch(err){state.loadError=String(err.message||err);resolve(false);}
    },undefined,err=>{
      state.loadError=String(err?.message||err);
      resolve(false);
    });
  });

  function update(time,delta,mouseX=0,mouseY=0){
    if(!state.loaded||!state.visible)return;
    const x=THREE.MathUtils.clamp(mouseX,-1,1);
    const y=THREE.MathUtils.clamp(mouseY,-1,1);
    const k=state.motionEnabled
      ?1-Math.exp(-Math.min(Math.max(delta,0),.06)*7.5):1;
    currentX+=(x-currentX)*k;
    currentY+=(y-currentY)*k;
    state.swayX=state.motionEnabled?currentX:0;
    state.swayY=state.motionEnabled?currentY:0;
    const hh=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*1.35;
    const hw=hh*camera.aspect;
    const idle=state.motionEnabled?Math.sin(time*.72)*.007:0;
    rigRoot.position.x=-(state.modelBounds?.centerX||0)*restScale
      -state.swayX*hw*.023;
    rigRoot.position.y=baseY-state.swayY*hh*.02+idle*hh;
    rigRoot.rotation.set(-.06+(state.motionEnabled?state.swayY*.012:0),0,
      state.motionEnabled?state.swayX*.015:0);

    // Movimento de dedos usa os ossos VERDADEIROS, sem mexer em vertices a CPU.
    // Alternância muito pequena e lenta para repouso, com reação leve ao cursor.
    const phase=time*.91;
    for(const d of driven){
      const oscillation=state.motionEnabled
        ?.027*Math.sin(phase+d.offset+(d.side>0?.4:1.1))
          +.012*state.swayY:0;
      const bend=oscillation*(d.segment===1?1:d.segment===2?.72:.48)*d.side;
      _axis.copy(FLEX_AXIS);
      _rotation.setFromAxisAngle(_axis,bend);
      d.bone.quaternion.copy(d.base).multiply(_rotation);
    }
  }
  function resize(){align();}
  function beginTravel(){
    state.visible=false;
    rigRoot.visible=false;
  }
  function dispose(){
    owner.disposed=true;
    camera.remove(rigRoot);
    for(const m of meshes)m.geometry?.dispose?.();
    for(const mat of ownedMaterials)mat.dispose();
    for(const tex of ownedTextures)tex.dispose();
    rigRoot.clear();
  }
  return{state,meshes,rigRoot,driven,ready,update,resize,beginTravel,dispose};
}
