// Observatório v0.9.19 — viewmodel 2,5D animado com malha real Three.js.
// Mantém os pixels da composição escolhida, sem CSS warp e sem novo WebGL/RAF.
import * as THREE from 'three';
import {MESH_COLS,MESH_ROWS,deformHandVertices} from './hands-mesh-motion.js';
const SPRITE='/overlay/orion-hands-frame.webp';
const REF_ASPECT=1672/941;
export function createEtherealHandsMesh(camera,{enabled=true,reducedMotion=false}={}){
  const state={mode:'mesh',enabled:!!enabled,visible:false,loaded:false,loadError:null,
    motionEnabled:!reducedMotion,drawSurfaces:0,triangles:0,textureCount:0,
    joints:0,fingerJoints:0,swayX:0,swayY:0,maxVertexDelta:0,pose:'reference'};
  const root=new THREE.Group();
  root.name='OrionHands2p5D';
  root.visible=false;
  camera.add(root);
  if(!enabled)return {state,meshes:[],root,ready:Promise.resolve(false),
    update(){},resize(){},beginTravel(){},dispose(){camera.remove(root)}};
  const meshes=[],restData=[];
  let disposed=false,travelling=false,alpha=1,mxSmooth=0,mySmooth=0;
  let loadedTexture=null;
  let resolveReady;
  const ready=new Promise(resolve=>resolveReady=resolve);
  const textureLoader=new THREE.TextureLoader();
  textureLoader.load(SPRITE,texture=>{
    if(disposed){texture.dispose();resolveReady(false);return;}
    loadedTexture=texture;
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.magFilter=THREE.LinearFilter;
    texture.minFilter=THREE.LinearMipmapLinearFilter;
    const material=new THREE.MeshBasicMaterial({
      map:texture,color:0xffffff,transparent:true,
      opacity:1,depthWrite:false,depthTest:false,
      toneMapped:false,side:THREE.DoubleSide
    });
    for(const side of ['left','right']){
      const geometry=new THREE.PlaneGeometry(1,1,MESH_COLS,MESH_ROWS);
      const pos=geometry.getAttribute('position');
      const uv=geometry.getAttribute('uv');
      const localUV=new Float32Array(uv.array);
      const rest=new Float32Array(pos.array);
      for(let i=0;i<uv.count;i++)uv.setX(i,(side==='left'?0:.5)+.5*localUV[i*2]);
      const hand=new THREE.Mesh(geometry,material);
      hand.name='OrionEtherealMesh-'+side;
      hand.renderOrder=300;
      hand.frustumCulled=false;
      root.add(hand);
      meshes.push(hand);
      restData.push({side,rest,localUV,geometry});
    }
    resize();
    state.loaded=true;state.visible=true;state.drawSurfaces=2;
    state.triangles=MESH_COLS*MESH_ROWS*2*2;
    state.textureCount=1;
    root.visible=true;
    resolveReady(true);
  },undefined,error=>{
    state.loadError='Imagem local das mãos não carregou';
    state.visible=false;root.visible=false;resolveReady(false);
    console.warn('[Observatório] Mãos 2,5D não disponíveis',error);
  });
  function resize(){
    if(!state.loaded&&meshes.length===0)return;
    // Meshes em espaço da câmera: enquadramento estável em qualquer FOV/DPR.
    const distance=2.5;
    const height=2*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*distance;
    const width=height*camera.aspect;
    const halfW=Math.min(height*REF_ASPECT*.5,width*.58);
    for(let i=0;i<meshes.length;i++){
      const side=i===0?-1:1;
      const mesh=meshes[i];
      mesh.scale.set(halfW,height,1);
      mesh.position.set(side*(width-halfW)*.5,0,-distance);
    }
  }
  function update(seconds,dt,mouseX=0,mouseY=0){
    if(disposed||!state.loaded)return;
    const amount=1-Math.exp(-Math.min(Math.max(dt,0),.06)*6.8);
    mxSmooth+=(Math.max(-1,Math.min(1,mouseX))-mxSmooth)*amount;
    mySmooth+=(Math.max(-1,Math.min(1,mouseY))-mySmooth)*amount;
    state.swayX=reducedMotion?0:mxSmooth;
    state.swayY=reducedMotion?0:mySmooth;
    // Opacidade e movimento atualizados no próprio tick do universo.
    if(travelling)alpha=Math.max(0,alpha-dt*4.6);
    if(meshes[0])meshes[0].material.opacity=alpha;
    if(alpha<=0){root.visible=false;state.visible=false;return;}
    let maxD=0;
    const depth=2.5,planeHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*depth;
    const viewportWidth=planeHeight*camera.aspect;
    const halfW=Math.min(planeHeight*REF_ASPECT*.5,viewportWidth*.58);
    for(let i=0;i<meshes.length;i++){
      const mesh=meshes[i],d=restData[i];
      const pos=mesh.geometry.getAttribute('position');
      maxD=Math.max(maxD,deformHandVertices(d.rest,pos.array,d.localUV,d.side,
        seconds,state.swayX,state.swayY,reducedMotion));
      pos.needsUpdate=true;
      if(!reducedMotion){
        mesh.position.y=(i===0?1:-1)*.002*Math.sin(seconds*.83)+
          state.swayY*-.006;
        mesh.position.x=(i===0?-1:1)*(viewportWidth-halfW)*.5+
          state.swayX*(i===0?-.007:-.006);
      }else{
        mesh.position.set((i===0?-1:1)*(viewportWidth-halfW)*.5,0,-depth);
      }
    }
    state.maxVertexDelta=maxD;
  }
  function beginTravel(){travelling=true;}
  function dispose(){
    disposed=true;travelling=true;root.visible=false;
    for(const m of meshes){m.geometry.dispose();root.remove(m);}
    if(meshes[0])meshes[0].material.dispose();
    if(loadedTexture)loadedTexture.dispose();
    camera.remove(root);meshes.length=0;
    state.visible=false;state.loaded=false;
  }
  return{state,meshes,root,ready,update,resize,beginTravel,dispose};
}
