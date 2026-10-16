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
const STYLE=['original','calm','cinematic','natural'].includes(PARAMS.get('fpsStyle'))
  ?PARAMS.get('fpsStyle'):'natural';
const ART={
  // O Y do GLB (0.615..0.912) avança da mão para o antebraço.
  // O protótipo anterior INVERTIA esta prioridade: braço opaco, dedos apagados.
  // Original fica como comparação; variantes corrigidas fazem fade no antebraço.
  original:{wristY:-.84,fadeFrom:.615,fadeTo:.725,wristBend:0,wristRoll:0,opacity:.94,fadeInvert:false},
  calm:{wristY:-.88,fadeFrom:.735,fadeTo:.865,wristBend:-.43,wristRoll:-.16,opacity:.96,fadeInvert:true},
  cinematic:{wristY:-.84,fadeFrom:.73,fadeTo:.87,wristBend:-.55,wristRoll:-.35,opacity:.98,fadeInvert:true},
  // Pose anatômica em repouso: orientar a mão inteira em espaço de câmera,
  // nunca dobrar punhos ~30° em eixos FBX arbitrários para simular o gesto.
  natural:{wristY:-.85,fadeFrom:.72,fadeTo:.88,wristBend:0,wristRoll:0,opacity:.96,fadeInvert:true}
}[STYLE];

const TUNE=PARAMS.get('fpsTune')||'base';
const TUNING={
  // A captura A/B de ‘back’ foi a primeira em que a palma ficou 3/4,
  // dedos diagonais e braços discretos. Promover essa pose verificada para
  // natural, mantendo todos os outros modos antigos para comparação.
  base:STYLE==='natural'?{bend:.70,yaw:.30,roll:-.30}:
    {bend:ART.wristBend,yaw:0,roll:ART.wristRoll},
  forward:{bend:-1.12,yaw:.26,roll:-.25},
  reach:{bend:-1.47,yaw:.40,roll:-.18},
  inward:{bend:-1.04,yaw:.62,roll:-.48},
  back:{bend:.70,yaw:.30,roll:-.30},
  rest1:{bend:1.0,yaw:.36,roll:-.38},
  rest2:{bend:1.24,yaw:.38,roll:-.40},
  rest3:{bend:.86,yaw:.48,roll:-.48}
};
const WRIST=TUNING[TUNE]||TUNING.base;
const wristBendAxis=new THREE.Vector3(1,0,0);
const wristYawAxis=new THREE.Vector3(0,1,0);
const wristRollAxis=new THREE.Vector3(0,0,1);
const wristBendQ=new THREE.Quaternion(),wristYawQ=new THREE.Quaternion(),wristRollQ=new THREE.Quaternion();

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
    swayX:0,swayY:0,leftX:0,rightX:0,framing:null,artStyle:STYLE,lightMode:LIGHT_MODE,tune:TUNE,
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
  const naturalAimAngles={left:0,right:0};
  const naturalDepthAngles={left:0,right:0};
  let moveX=0,moveY=0;
  const targetDepth=2.05;
  const poseCurl={open:.07,relaxed:.17};

  // Aplicar pose ANTES de medir landmarks. A implementação anterior media os
  // ossos em bind pose e só então os girava no update(), invalidando o NDC.
  function setBonePose(time=0){
    wristBendQ.setFromAxisAngle(wristBendAxis,WRIST.bend);
    for(const w of poseWrists){
      wristYawQ.setFromAxisAngle(wristYawAxis,WRIST.yaw*w.side);
      wristRollQ.setFromAxisAngle(wristRollAxis,WRIST.roll*w.side);
      w.bone.quaternion.copy(w.aimed||w.base);
      if(!w.aimed)w.bone.quaternion.multiply(wristBendQ).multiply(wristYawQ).multiply(wristRollQ);
    }
    for(let i=0;i<driven.length;i++){
      const d=driven[i];
      const flicker=state.motionEnabled?Math.sin(time*.7+i*.79)*.012:0;
      const curl=(poseCurl[state.pose]+flicker)*(d.segment===1?.52:d.segment===2?.71:.36);
      tempQ.setFromAxisAngle(bendAxis,curl*(d.digit==='thumb'?.45:1));
      d.bone.quaternion.copy(d.base).multiply(tempQ);
    }
  }

  // A mão de FPS deve projetar os dedos para a frente, em profundidade,
  // não mostrar a palma vertical como gesto de "pare". Ajustar DOIS eixos
  // no próprio punho, com quaternions transportados ao espaço da câmera.
  // Avaliar a ponta de cada dedo já deformada pelo skinning real.
  // Busca pequena somente na carga/resize, nunca no render loop.
  function aimNaturalPose(){
    if(STYLE!=='natural'||TUNE!=='base')return;
    camera.updateMatrixWorld(true);
    // Não corrigir automaticamente uma pose que já cai na faixa natural.
    // Isso evita transformar mãos diagonalmente relaxadas em "garras".
    root.updateMatrixWorld(true);
    const screen=b=>b.getWorldPosition(new THREE.Vector3()).project(camera);
    const wl=screen(anchors.wristL),wr=screen(anchors.wristR);
    const tl=screen(anchors.tipL),tr=screen(anchors.tipR);
    if(tl.x-wl.x>.09&&tl.x-wl.x<.23&&
       wr.x-tr.x>.09&&wr.x-tr.x<.23&&
       tl.y-wl.y>.25&&tl.y-wl.y<.42&&
       tr.y-wr.y>.25&&tr.y-wr.y<.42)return;
    const cameraQuat=camera.getWorldQuaternion(new THREE.Quaternion());
    const viewAxis=new THREE.Vector3(0,0,1).applyQuaternion(cameraQuat);
    const rightAxis=new THREE.Vector3(1,0,0).applyQuaternion(cameraQuat);
    const pitches=[0,-.34,.34,-.5,.5,-.65,.65,-.8,.8];
    const rolls=[0,-.14,.14,-.26,.26,-.38,.38,-.46,.46];
    for(const wrist of poseWrists){
      const tip=wrist.side===-1?anchors.tipL:anchors.tipR;
      if(!tip)continue;
      const parentInverse=wrist.bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
      const rollAxisLocal=viewAxis.clone().applyQuaternion(parentInverse).normalize();
      const pitchAxisLocal=rightAxis.clone().applyQuaternion(parentInverse).normalize();
      const initial=wrist.bone.quaternion.clone();
      const desiredDx=wrist.side===-1?.115:-.115;
      const desiredDy=wrist.side===-1?.26:.245;
      let best={score:Infinity,pitch:0,roll:0,quaternion:initial.clone()};
      for(const pitch of pitches){
        const qp=new THREE.Quaternion().setFromAxisAngle(pitchAxisLocal,pitch);
        for(const roll of rolls){
          const qr=new THREE.Quaternion().setFromAxisAngle(rollAxisLocal,roll);
          wrist.bone.quaternion.copy(initial).premultiply(qp).premultiply(qr);
          root.updateMatrixWorld(true);
          const wWorld=wrist.bone.getWorldPosition(new THREE.Vector3());
          const tWorld=tip.getWorldPosition(new THREE.Vector3());
          const wNdc=wWorld.clone().project(camera),tNdc=tWorld.clone().project(camera);
          const depthDelta=camera.worldToLocal(tWorld).z-camera.worldToLocal(wWorld).z;
          const dx=tNdc.x-wNdc.x,dy=tNdc.y-wNdc.y;
          // Inward + elevado moderadamente + dedos avançando na cena.
          // Valores são objetivos de enquadramento, não ângulos copiados de jogo.
          const score=Math.abs(dx-desiredDx)*1.4+
            Math.abs(dy-desiredDy)*.8+
            Math.abs(depthDelta+.38)*.32+
            Math.abs(pitch)*.022+Math.abs(roll)*.027+
            (dy<.13?.8:0)+(dy>.39?.15:0)+
            ((tNdc.x*wrist.side)<0?.35:0);
          if(score<best.score)best={score,pitch,roll,quaternion:wrist.bone.quaternion.clone()};
        }
      }
      wrist.aimed=best.quaternion;
      wrist.bone.quaternion.copy(best.quaternion);
      const side=wrist.side===-1?'left':'right';
      naturalAimAngles[side]=best.roll;
      naturalDepthAngles[side]=best.pitch;
      root.updateMatrixWorld(true);
    }
  }

  function calibrate(){
    if(!state.loaded||!anchors.wristL||!anchors.wristR)return;
    for(const w of poseWrists)w.aimed=null;
    setBonePose(0);
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
    // Manter a média dos punhos num plano de profundidade conhecido.
    root.rotation.set(tilt,0,0);
    // O rig original tem L/R invertidos em X em relação à câmera FPS.
    // Espelhamento de um único eixo corrige isso sem inverter a direção dos dedos.
    root.scale.set(-scale,scale,scale);
    rootBase.set(center.x*scale,h*ART.wristY-center.y*scale,-targetDepth-center.z*scale);
    root.position.copy(rootBase);
    root.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    aimNaturalPose();
    root.updateMatrixWorld(true);
    const projected=(bone)=>{
      if(!bone)return null;
      const ndc=bone.getWorldPosition(V.clone()).project(camera);
      return {x:ndc.x,y:ndc.y,z:ndc.z};
    };
    state.framing={pitch:tilt,scale,rawRise:best.rise,
      aimAngles:{...naturalAimAngles},depthAngles:{...naturalDepthAngles},posedLandmarks:true,
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
            shader.vertexShader='varying float vOrionFpsClipY;\n'+shader.vertexShader;
            shader.vertexShader=shader.vertexShader.replace(
              '#include <project_vertex>',
              '#include <project_vertex>\nvOrionFpsClipY = gl_Position.y / gl_Position.w;'
            );
            shader.fragmentShader='varying float vOrionFpsClipY;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace(
              '#include <opaque_fragment>',
              '#include <opaque_fragment>\n' +
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
    // Rest pose + flexão leve, com orientação individual já calibrada.
    setBonePose(time);
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
