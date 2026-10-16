// Projeto Órion · Observatório v0.9.15
// Viewmodel com o modelo original de David Fischer — First Person hands rigged.
// CC BY 4.0: https://sketchfab.com/3d-models/first-person-hands-rigged-547a45535f0c4fe787948f7a7a6a88db
// Cópia GLB redistribuída com atribuição: Pruek-Sang/kinetwin (API Sketchfab).
// Não reproduz a arte ou animações da Clove/VALORANT.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const ASSET='/models/david-fischer-fps-hands.glb';
const FINGER=/^(?:f_)?(index|middle|ring|pinky)(?:\.|_)?0?([123])(?:\.|_)?([lr])/i;
const THUMB=/^thumb(?:\.|_)?0?([123])(?:\.|_)?([lr])/i;
const V=new THREE.Vector3();
const tempQ=new THREE.Quaternion();
const bendAxis=new THREE.Vector3(1,0,0);
const PARAMS=new URLSearchParams(window.location.search);
const CANDIDATE=PARAMS.get('fpsPose')==='open'?'open':'relaxed';
const LIGHT_MODE=PARAMS.get('fpsLight')==='basic'?'basic':'lit';
// Variações visuais sobre o mesmo modelo e a mesma cena, para QA por screenshot.
const STYLE=['original','calm','cinematic'].includes(PARAMS.get('fpsStyle'))
  ?PARAMS.get('fpsStyle'):'cinematic';
const ART={
  // O Y do GLB (0.615..0.912) avança da mão para o antebraço.
  // O protótipo anterior INVERTIA esta prioridade: braço opaco, dedos apagados.
  // Original fica como comparação; variantes corrigidas fazem fade no antebraço.
  original:{wristY:-.84,fadeFrom:.615,fadeTo:.725,wristBend:0,wristRoll:0,opacity:.94,fadeInvert:false},
  calm:{wristY:-.88,fadeFrom:.735,fadeTo:.865,wristBend:-.43,wristRoll:-.16,opacity:.96,fadeInvert:true},
  cinematic:{wristY:-.84,fadeFrom:.73,fadeTo:.87,wristBend:-.55,wristRoll:-.35,opacity:.98,fadeInvert:true}
}[STYLE];
const wristBendAxis=new THREE.Vector3(1,0,0);
const wristRollAxis=new THREE.Vector3(0,0,1);
const wristBendQ=new THREE.Quaternion(),wristRollQ=new THREE.Quaternion();

function boneKey(name){return String(name||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function findBone(bones,base){
  const key=boneKey(base);
  return bones.find(b=>boneKey(b.name)===key)||null;
}
function testFrame(camera,z){
  const halfHeight=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*z;
  return{h:halfHeight,w:halfHeight*camera.aspect};
}

export function createFpsFirstPersonHands(camera,{enabled=true,reducedMotion=false}={}){
  const state={
    mode:'fps',enabled:!!enabled,visible:!!enabled,loaded:false,
    motionEnabled:!reducedMotion,loadError:null,pose:CANDIDATE,
    joints:0,fingerJoints:0,triangles:0,textureCount:0,drawSurfaces:0,
    swayX:0,swayY:0,leftX:0,rightX:0,framing:null,artStyle:STYLE,lightMode:LIGHT_MODE,
  };
  if(!enabled)return{state,meshes:[],driven:[],ready:Promise.resolve(false),
    update(){},resize(){},beginTravel(){},dispose(){}};

  const root=new THREE.Group();
  root.name='Órion · mãos FPS de David Fischer, viewmodel local';
  camera.add(root);
  // Viewmodel FPS com iluminação de preenchimento própria. Os elementos
  // do universo ESO/Nox usam materiais básicos ou shaders independentes,
  // então não ficam artificialmente mais claros.
  const handsLights=[];
  if(LIGHT_MODE==='lit'){
    const fill=new THREE.HemisphereLight(0xece2ff,0x675884,1.85);
    const key=new THREE.DirectionalLight(0xfff4ff,1.22);
    key.position.set(-.70,1.6,2.3);
    key.target.position.set(0,0,-2);
    camera.add(fill,key,key.target);
    handsLights.push(fill,key,key.target);
  }
  const meshes=[],materials=[],geometries=[],driven=[],bones=[];
  const anchors={wristL:null,wristR:null,tipL:null,tipR:null};
  const poseWrists=[];
  let disposed=false,rootBase=new THREE.Vector3(),scale=1,tilt=0;
  let moveX=0,moveY=0;
  const targetDepth=2.05;
  const poseCurl={open:.07,relaxed:.17};

  function calibrate(){
    if(!state.loaded||!anchors.wristL||!anchors.wristR)return;
    // Calibração em coordenadas locais do modelo a partir dos ossos
    // dos punhos e pontas dos dedos, não do bounding-box dos braços.
    root.position.set(0,0,0);root.scale.setScalar(1);root.rotation.set(0,0,0);
    root.updateMatrixWorld(true);
    const get=b=>root.worldToLocal(b.getWorldPosition(new THREE.Vector3()));
    const l=get(anchors.wristL),r=get(anchors.wristR);
    const tl=anchors.tipL?get(anchors.tipL):l.clone().add(new THREE.Vector3(0,.10,0));
    const tr=anchors.tipR?get(anchors.tipR):r.clone().add(new THREE.Vector3(0,.10,0));
    const wristCenter=l.clone().add(r).multiplyScalar(.5);
    // Importadores FBX usam eixos distintos. Escolher orientação que
    // eleva os dedos acima dos punhos no quadro, sem "braços invertidos".
    const candidates=[-.35,.18,.45,Math.PI-.35,Math.PI+.18,Math.PI+.45];
    let best=null;
    const {h,w}=testFrame(camera,targetDepth);
    for(const pitch of candidates){
      const e=new THREE.Euler(pitch,0,0);
      const L=l.clone().applyEuler(e),R=r.clone().applyEuler(e);
      const TL=tl.clone().applyEuler(e),TR=tr.clone().applyEuler(e);
      const span=Math.abs(R.x-L.x);
      if(span<.005)continue;
      const s=THREE.MathUtils.clamp((w*.54)/(span*.5),.003,6.5);
      const rise=((TL.y-L.y)+(TR.y-R.y))*.5*s/h;
      // A ponta dos dedos deve estar acima dos punhos (ND C y maior).
      const score=Math.abs(rise-.32)+(rise<=.05?3:0)+(rise>.72?2:0)
        +Math.abs((TL.y-L.y)-(TR.y-R.y))*s/h*.25;
      if(!best||score<best.score)best={pitch,score,s,l:L,r:R,tl:TL,tr:TR,rise};
    }
    if(!best)throw new Error('Não foi possível calibrar o rig FPS por punhos');
    tilt=best.pitch;scale=best.s;
    const center=best.l.clone().add(best.r).multiplyScalar(.5);
    const wristZ=center.z;
    // Manter a média dos punhos num plano de profundidade conhecido.
    root.rotation.set(tilt,0,0);
    // O rig original tem L/R invertidos em X em relação à câmera FPS.
    // Espelhamento de um único eixo corrige isso sem inverter a direção dos dedos.
    root.scale.set(-scale,scale,scale);
    rootBase.set(center.x*scale,h*ART.wristY-center.y*scale,-targetDepth-center.z*scale);
    root.position.copy(rootBase);
    root.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    const projected=(bone)=>{
      if(!bone)return null;
      const ndc=bone.getWorldPosition(V.clone()).project(camera);
      return {x:ndc.x,y:ndc.y,z:ndc.z};
    };
    state.framing={pitch:tilt,scale,rawRise:best.rise,
      wristLeft:projected(anchors.wristL),wristRight:projected(anchors.wristR),
      tipLeft:projected(anchors.tipL),tipRight:projected(anchors.tipR)};
    state.leftX=state.framing.wristLeft?.x||0;
    state.rightX=state.framing.wristRight?.x||0;
  }

  const ready=new Promise(resolve=>{
    new GLTFLoader().load(ASSET,gltf=>{
      try{
        if(disposed){resolve(false);return;}
        const model=gltf.scene;
        model.updateMatrixWorld(true);
        model.traverse(obj=>{
          if(obj.isBone)bones.push(obj);
          if(!obj.isSkinnedMesh)return;
          const g=obj.geometry;
          // O FBX incluía uma geometria secundária decorativa de ~170
          // vértices. Não renderizar isso sobre a cena astronômica.
          if(g.getAttribute('position')?.count<1000){obj.visible=false;return;}
          const cloned=g.clone();
          const normals=cloned.getAttribute('normal');
          const positions=cloned.getAttribute('position');
          const colors=new Float32Array(positions.count*4);
          for(let i=0;i<positions.count;i++){
            const ly=positions.getY(i);
            const nz=normals?.getZ(i)??0,ny=normals?.getY(i)??0;
            const shade=THREE.MathUtils.clamp(.66+.20*nz+.12*ny,.45,.95);
            const f=THREE.MathUtils.smoothstep(ly,ART.fadeFrom,ART.fadeTo);
            const fade=ART.fadeInvert?1-f:f;
            colors[i*4]=shade*.94;colors[i*4+1]=shade*.84;
            colors[i*4+2]=shade*1.05;colors[i*4+3]=fade;
          }
          cloned.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
          geometries.push(cloned);
          const Material=LIGHT_MODE==='lit'?THREE.MeshLambertMaterial:THREE.MeshBasicMaterial;
          const mat=new Material({
            color:LIGHT_MODE==='lit'?0xd0c4e1:0xbab2cc,vertexColors:true,
            transparent:true,opacity:ART.opacity,side:THREE.DoubleSide,
            depthTest:false,depthWrite:false,toneMapped:false
          });
          // Desaparecimento suave no rodapé baseado na posição projetada
          // NA TELA. O fade apenas por Y do arquivo GLB não segue a pele
          // deformada pelo skeleton e produzia punhos cortados/retilíneos.
          // Sem textura nova nem pass de pós-processamento.
          mat.onBeforeCompile=(shader)=>{
            shader.vertexShader='varying float vOrionFpsClipY;\\n'+shader.vertexShader;
            shader.vertexShader=shader.vertexShader.replace(
              '#include <project_vertex>',
              '#include <project_vertex>\\nvOrionFpsClipY = gl_Position.y / gl_Position.w;'
            );
            shader.fragmentShader='varying float vOrionFpsClipY;\\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace(
              '#include <opaque_fragment>',
              '#include <opaque_fragment>\\n' +
              'gl_FragColor.a *= smoothstep(-1.08, -0.74, vOrionFpsClipY);'
            );
          };
          mat.customProgramCacheKey=()=> 'orion-fps-screen-feather-v1';
          materials.push(mat);
          obj.geometry=cloned;obj.material=mat;
          obj.frustumCulled=false;obj.renderOrder=35;obj.layers.set(0);
          meshes.push(obj);
          state.triangles+=(cloned.index?.count||positions.count)/3;
        });
        if(meshes.length===0)throw new Error('Modelo de David sem SkinnedMesh principal');
        for(const bone of bones){
          const n=boneKey(bone.name);
          if(/^handl/.test(n))anchors.wristL=bone;
          if(/^handr/.test(n))anchors.wristR=bone;
          if(/^fmiddle03l/.test(n))anchors.tipL=bone;
          if(/^fmiddle03r/.test(n))anchors.tipR=bone;
          const name=String(bone.name||'');
          const finger=name.match(FINGER),thumb=name.match(THUMB);
          if(!finger&&!thumb)continue;
          // O polegar tem dois grupos de captura (falange, lado), enquanto
          // os outros dedos têm três (dedo, falange, lado).
          driven.push({bone,base:bone.quaternion.clone(),
            digit:thumb?'thumb':finger[1].toLowerCase(),
            segment:thumb?Number(thumb[1]):Number(finger[2]),
            side:(thumb?thumb[2]:finger[3]).toLowerCase()==='l'?1:-1});
        }
        if(!anchors.wristL||!anchors.wristR)throw new Error('Mãos importadas sem ossos dos punhos');
        poseWrists.push({bone:anchors.wristL,side:-1,base:anchors.wristL.quaternion.clone()});
        poseWrists.push({bone:anchors.wristR,side:1,base:anchors.wristR.quaternion.clone()});
        if(driven.length<25)throw new Error('Rig importado não fornece falanges suficientes: '+driven.length);
        root.add(model);
        state.joints=bones.length;state.fingerJoints=driven.length;
        state.drawSurfaces=meshes.length;state.textureCount=0;
        state.loaded=true;
        calibrate();
        root.visible=state.visible;
        resolve(true);
      }catch(err){state.loaded=false;state.loadError=String(err.message||err);resolve(false);}
    },undefined,err=>{state.loadError=String(err?.message||err);resolve(false);});
  });

  function update(time,dt,mx=0,my=0){
    if(!state.loaded||!state.visible)return;
    const a=state.motionEnabled
      ?1-Math.exp(-Math.min(Math.max(dt,0),.06)*7.5):1;
    moveX+=(THREE.MathUtils.clamp(mx,-1,1)-moveX)*a;
    moveY+=(THREE.MathUtils.clamp(my,-1,1)-moveY)*a;
    state.swayX=state.motionEnabled?moveX:0;
    state.swayY=state.motionEnabled?moveY:0;
    const {h,w}=testFrame(camera,targetDepth);
    const breath=state.motionEnabled?Math.sin(time*.67)*h*.005:0;
    root.position.set(rootBase.x-state.swayX*w*.018,
      rootBase.y-state.swayY*h*.016+breath,rootBase.z);
    root.rotation.set(tilt+(state.motionEnabled?state.swayY*.008:0),
      0,state.motionEnabled?state.swayX*.012:0);
    // Poses autorais pequenas; nunca substituir as rotações de bind.
    for(let i=0;i<driven.length;i++){
      const d=driven[i];
      const flicker=state.motionEnabled?Math.sin(time*.7+i*.79)*.012:0;
      const curl=(poseCurl[state.pose]+flicker)*(d.segment===1?.52:d.segment===2?.71:.36);
      tempQ.setFromAxisAngle(bendAxis,curl*(d.digit==='thumb'?.45:1));
      d.bone.quaternion.copy(d.base).multiply(tempQ);
    }
    // Dedos apontam para dentro da cena. Rotação dos ossos reais dos
    // punhos, em vez de inclinar um plano bidimensional de cartão.
    wristBendQ.setFromAxisAngle(wristBendAxis,ART.wristBend);
    for(const wrist of poseWrists){
      wristRollQ.setFromAxisAngle(wristRollAxis,ART.wristRoll*wrist.side);
      wrist.bone.quaternion.copy(wrist.base).multiply(wristBendQ).multiply(wristRollQ);
    }
  }
  function resize(){calibrate();}
  function beginTravel(){state.visible=false;root.visible=false;}
  function dispose(){
    disposed=true;
    camera.remove(root);
    handsLights.forEach(light=>camera.remove(light));
    geometries.forEach(g=>g.dispose());
    materials.forEach(m=>m.dispose());
    root.clear();
  }
  return{state,root,meshes,driven,ready,update,resize,beginTravel,dispose};
}
