// Observatório v0.9.21: mãos nas bordas; direita neutra fora do hover do Nox.
// Mesma câmera e loop. No modo base as poses direitas compartilham geometria;
// o rig MMV opcional usa pesos próprios para cada pose da imagem.
import * as THREE from 'three';
import {MESH_COLS,MESH_ROWS,deformHandVertices,HAND_PROFILES} from './hands-mesh-motion.js';
import {createHandImageRig} from './hands-image-rig.js';
import {perspectiveFrameWeights,HAND_REACH_DEPTH,PERSPECTIVE_POINT_LIMIT,PERSPECTIVE_DEPTH_SCALE} from './hands-perspective-motion.js';

const FRAME=Object.freeze({baseOpacity:.38,height:.565,edgeInset:-.030,bottom:-.020});
// As artes têm antebraços diferentes: a esquerda precisa de compensação
// óptica para entrar pela lateral na mesma altura da direita, fora da quina.
const HANDS=Object.freeze({
 left:{...FRAME,edgeInset:-.042,rotation:-.20,file:'/overlay/left-hand-ethereal.webp',
   swayX:-.006,swayY:-.005,breath:.003,phase:.45,
   pointer:false,columns:MESH_COLS,rows:MESH_ROWS},
 right:{...FRAME,rotation:0,file:'/overlay/right-hand-pointing.webp',neutralFile:'/overlay/right-hand-neutral.webp',
   swayX:-.006,swayY:-.005,breath:.003,phase:1.15,
   pointer:true,columns:36,rows:28}
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createEtherealHandsMesh(camera,{enabled=true,reducedMotion=false,animation='mesh'}={}){
 const usePerspective=animation==='perspective',useRig=animation==='rig'||usePerspective;
 const state={mode:'mesh',enabled:!!enabled,visible:false,loaded:false,loadError:null,
   motionEnabled:!reducedMotion,drawSurfaces:0,triangles:0,textureCount:0,
   joints:0,fingerJoints:0,swayX:0,swayY:0,maxVertexDelta:0,
   pose:'feminine-star-hover',handProfiles:Object.keys(HAND_PROFILES),
   rightHover:false,rightBlend:0,hoverBlend:0,leftFollow:0,animation:usePerspective?'perspective':useRig?'rig':'mesh',
   rightFrameWeights:[],rightDepth:0,selecting:false,selectionReach:0,selectionPress:0,
   selectionAnticipation:0,selectionFollowThrough:0,selectionLift:0};
 const root=new THREE.Group();
 root.name='OrionFeminineHands2p5D';
 root.visible=false;
 camera.add(root);
 const meshes=[],hands=[],rigs=[],rightFrames=[];
 if(useRig)Object.defineProperty(state,'maxVertexDelta',{enumerable:true,
   get:()=>Math.max(0,...rigs.map(r=>r.measure().maxVertexDelta))});
 let neutralMesh=null,starHovered=false,pointBlend=0,pointVelocity=0;
 if(!enabled)return {state,root,meshes,rigs,rightFrames,ready:Promise.resolve(false),
   update(){},resize(){},setStarHovered(){},setStarSelection(){},beginTravel(){},dispose(){camera.remove(root)}};
 let disposed=false,travel=false,alpha=1,smX=0,smY=0;
 const textures=[];
 const loader=new THREE.TextureLoader();
 const load=(file)=>new Promise((resolve,reject)=>loader.load(file,resolve,undefined,reject));
 let complete=false;
 function viewport(){
   const depth=2.5,height=2*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*depth;
   return {depth,height,width:height*camera.aspect};
 }
 function place(hand,fx=0,fy=0){
   const v=viewport(),c=hand.config;
   // Cap horizontal protege o centro também em janelas estreitas/portrait.
   const h=Math.min(v.height*c.height,v.width*.30/hand.aspect),w=h*hand.aspect;
   hand.mesh.scale.set(w,h,1);
   const x=(hand.side==='left'?-v.width/2+c.edgeInset*v.width+w/2:
     v.width/2-c.edgeInset*v.width-w/2)+fx*v.width;
   const y=-v.height/2+(c.bottom+fy)*v.height+h/2;
   hand.mesh.position.set(x,y,-v.depth);
 }
 function resize(){
   if(disposed)return;
   for(const hand of hands)place(hand);
   if(neutralMesh&&meshes[1]){
     neutralMesh.scale.copy(meshes[1].scale);
     neutralMesh.position.copy(meshes[1].position);
   }
 }
 // Uma imagem íntegra por mão: nenhum recorte nem troca de alpha no gesto.
 const files=usePerspective?[HANDS.left.file,'/overlay/right-hand-pointing-smooth.webp']:
   [HANDS.left.file,HANDS.right.file,HANDS.right.neutralFile];
 const ready=Promise.all(files.map(load)).then(loaded=>{
   if(disposed){loaded.forEach(tex=>tex.dispose());return false;}
   for(const texture of loaded){
     texture.colorSpace=THREE.SRGBColorSpace;
     texture.magFilter=THREE.LinearFilter;
     texture.minFilter=THREE.LinearMipmapLinearFilter;
     textures.push(texture);
   }
   for(let i=0;i<2;i++){
     const side=i===0?'left':'right',texture=loaded[i];
     // Mais amostras só no modo em perspectiva: dedos sem facetas visíveis.
     const config=usePerspective&&side==='right'?{...HANDS[side],columns:72,rows:72}:HANDS[side];
     const geom=new THREE.PlaneGeometry(1,1,config.columns,config.rows);
     const pos=geom.getAttribute('position'),uv=geom.getAttribute('uv');
     if(usePerspective&&side==='right'){
       // Concentra 56 das 72 faixas em todos os dedos (UV .38–.85).
       // O contorno ganha amostras sem subdividir todo o antebraço igualmente.
       for(let j=0;j<uv.count;j++){
         const v=uv.getY(j),lower=10/72,upper=66/72;
         const refined=v<=lower?v/lower*.38:v<=upper?
           .38+(v-lower)/(upper-lower)*.47:.85+(v-upper)/(1-upper)*.15;
         uv.setY(j,refined);pos.setY(j,refined-.5);
       }
     }
     const rest=new Float32Array(pos.array),uvLocal=new Float32Array(uv.array);
     {
       // Acabamento suave dos dois antebraços, calibrado para cada arte:
       // desaparecem antes da borda inferior, sem punho flutuante.
       const colors=new Float32Array(uv.count*4);
       const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
       for(let j=0;j<uv.count;j++){
         const u=uvLocal[j*2],v=uvLocal[j*2+1];
         const rightEdge=smooth((u-.68)/.26);
         const nearBottom=1-smooth((v-.16)/.22);
         const k=j*4;
         colors[k]=1;colors[k+1]=1;colors[k+2]=1;
         colors[k+3]=side==='left'?smooth((v-.09)/.21):1-rightEdge*nearBottom;
       }
       geom.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
     }
     const material=new THREE.MeshBasicMaterial({
       map:texture,transparent:true,opacity:config.baseOpacity,
       side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,
       vertexColors:true
     });
     const rig=useRig?createHandImageRig(geom,material,side==='left'?'left':usePerspective?'perspective':'pointing',
       {perspective:usePerspective&&side==='right'}):null;
     if(rig)rigs.push(rig);
     const mesh=rig?rig.mesh:new THREE.Mesh(geom,material);
     mesh.name=side==='left'?'OrionFeminineLeftFraming':'OrionFeminineRightPointing';
     mesh.renderOrder=300+i;mesh.frustumCulled=false;
     meshes.push(mesh);root.add(mesh);
     const width=texture.image?.naturalWidth||texture.image?.width||1122;
     const height=texture.image?.naturalHeight||texture.image?.height||1402;
     const hand={side,config,mesh,rest,uvLocal,aspect:usePerspective&&side==='right'?1122/1402:width/height};
     hands.push(hand);place(hand);
   }
   // Asset neutro próprio, com palma/punho alinhados ao apontamento.
   // O modo base compartilha a malha; o rig precisa de pesos próprios para
   // o indicador relaxado, mantendo os pivôs da palma e do punho alinhados.
   if(!usePerspective){
     const neutralGeometry=useRig?meshes[1].geometry.clone():meshes[1].geometry;
     const neutralMaterial=new THREE.MeshBasicMaterial({
       map:textures[2],transparent:true,opacity:HANDS.right.baseOpacity,
       side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,vertexColors:true
     });
     const neutralRig=useRig?createHandImageRig(neutralGeometry,neutralMaterial,'neutral',{perspective:usePerspective}):null;
     if(neutralRig)rigs.push(neutralRig);
     neutralMesh=neutralRig?neutralRig.mesh:new THREE.Mesh(neutralGeometry,neutralMaterial);
     neutralMesh.name='OrionFeminineRightNeutral';
     neutralMesh.renderOrder=301;neutralMesh.frustumCulled=false;
     root.add(neutralMesh);
     // O visual neutro acompanha exatamente o enquadramento da mão direita.
     neutralMesh.scale.copy(meshes[1].scale);
     neutralMesh.position.copy(meshes[1].position);
   }else rightFrames.push(meshes[1]);
   state.loaded=true;state.visible=true;
   state.textureCount=textures.length;
   state.joints=rigs.reduce((sum,r)=>sum+r.bones.length,0);
   state.fingerJoints=rigs.reduce((sum,r)=>sum+r.bones.length-2,0);
   root.visible=true;complete=true;
   update(0,0);
   return true;
 }).catch(err=>{
   state.loadError='Falha ao carregar os assets das mãos';
   state.loaded=false;state.visible=false;root.visible=false;
   textures.forEach(t=>t.dispose());
   console.warn('[Observatório] Assets das mãos indisponíveis',err);
   return false;
 });
 function update(seconds,dt,mouseX=0,mouseY=0){
   if(!complete||disposed)return;
   const step=clamp(dt,0,.06),gain=1-Math.exp(-step*5.7);
   smX+=(clamp(mouseX,-1,1)-smX)*gain;
   smY+=(clamp(mouseY,-1,1)-smY)*gain;
   state.swayX=reducedMotion?0:smX;
   state.swayY=reducedMotion?0:smY;
   if(travel)alpha=Math.max(0,alpha-step*3.8);
   const desired=(starHovered||state.selecting)&&!travel?1:0;
   if(reducedMotion){pointBlend=desired;pointVelocity=0;}
   else if(useRig){
     // Mola criticamente amortecida: gesto legível, sem salto ao reverter hover.
     const omega=6.5,offset=pointBlend-desired,decay=Math.exp(-omega*step);
     const advance=(pointVelocity+omega*offset)*step;
     pointBlend=desired+(offset+advance)*decay;
     pointVelocity=(pointVelocity-omega*advance)*decay;
   }else pointBlend+=(desired-pointBlend)*(1-Math.exp(-step*9.5));
   pointBlend=clamp(pointBlend,0,1);
   state.hoverBlend=pointBlend;state.leftFollow=reducedMotion?0:pointBlend;
   const limit=usePerspective?PERSPECTIVE_POINT_LIMIT:1,press=usePerspective?.10:.16;
   const gestureBlend=clamp(pointBlend*limit-(reducedMotion?0:press*state.selectionPress+.015*state.selectionAnticipation),0,limit);
   state.rightBlend=gestureBlend;
   if(alpha===0){root.visible=false;state.visible=false;state.drawSurfaces=0;state.triangles=0;return;}
   let max=0;
   for(const rig of rigs)rig.update(seconds,reducedMotion,gestureBlend,rig.pose==='left'?state.leftFollow:0,
     state.selecting&&rig.pose!=='left'?state:null);
   // O rig articula durante todo o gesto; a troca de textura fica concentrada
   // no trecho central, em vez de substituir a animação do indicador.
   const textureBlend=useRig&&!reducedMotion?THREE.MathUtils.smoothstep(gestureBlend,.25,.75):gestureBlend;
   for(const hand of hands){
     const c=hand.config,{mesh,rest,uvLocal}=hand;
     const pos=mesh.geometry.getAttribute('position');
     if(!useRig){
       max=Math.max(max,deformHandVertices(rest,pos.array,uvLocal,hand.side,
         seconds,state.swayX,state.swayY,reducedMotion));
       pos.needsUpdate=!reducedMotion;
     }
     const fx=reducedMotion?0:state.swayX*c.swayX;
     const fy=reducedMotion?0:state.swayY*c.swayY+
       Math.sin(seconds*.94+c.phase)*c.breath;
     place(hand,fx,fy);
     // Mãos distintas: direita aponta, esquerda emoldura; sem giro brusco.
     mesh.rotation.set(0,0,c.rotation+(reducedMotion?0:Math.sin(seconds*.72+c.phase)*(c.pointer?.010:.006)));
     if(hand.side==='left'&&state.leftFollow>0){
       const v=viewport();
       mesh.position.x+=v.width*.0025*state.leftFollow;
       mesh.position.y+=v.height*.0035*state.leftFollow;
       if(!useRig)mesh.rotation.z+=.008*state.leftFollow;
     }
     if(hand.side==='right'&&state.selecting&&!reducedMotion){
       const v=viewport(),reach=state.selectionReach;
       const anticipation=state.selectionAnticipation,follow=state.selectionFollowThrough;
       mesh.position.x+=v.width*(-.0055*reach+.001*anticipation);
       mesh.position.y+=v.height*(.007*reach+.005*state.selectionLift-.002*anticipation+.001*follow);
       mesh.position.z+=.052*reach-.010*anticipation;
       mesh.rotation.x+=.035*reach-.018*state.selectionPress;
       mesh.rotation.y+=-.045*reach+.012*follow;
       mesh.rotation.z+=.020*reach-.028*state.selectionPress+.010*anticipation+.007*follow;
     }
     mesh.material.opacity=c.baseOpacity*alpha*(hand.side==='right'&&!usePerspective?textureBlend:1);
   }
   if(neutralMesh&&meshes[1]){
     neutralMesh.position.copy(meshes[1].position);
     neutralMesh.scale.copy(meshes[1].scale);
     neutralMesh.rotation.copy(meshes[1].rotation);
     neutralMesh.material.opacity=HANDS.right.baseOpacity*alpha*(1-textureBlend);
   }
   meshes[1].visible=usePerspective||textureBlend>.003;
   if(neutralMesh)neutralMesh.visible=textureBlend<.997;
   if(usePerspective){
     const weights=perspectiveFrameWeights(gestureBlend);
     state.rightFrameWeights=weights;
     state.rightDepth=reducedMotion?0:gestureBlend*HAND_REACH_DEPTH*PERSPECTIVE_DEPTH_SCALE;
   }
   state.drawSurfaces=usePerspective?2:1+Number(meshes[1].visible)+Number(neutralMesh.visible);
   state.triangles=meshes[0].geometry.index.count/3+
     (state.drawSurfaces-1)*meshes[1].geometry.index.count/3;
   if(!useRig)state.maxVertexDelta=max;
 }
 function setStarHovered(v){starHovered=!!v&&!travel;state.rightHover=starHovered;}
 function setStarSelection(pose){
   state.selecting=!!pose&&!travel&&!disposed;
   state.selectionReach=state.selecting&&!reducedMotion?clamp(pose.reach,0,1):0;
   state.selectionPress=state.selecting&&!reducedMotion?clamp(pose.press,0,1):0;
   state.selectionAnticipation=state.selecting&&!reducedMotion?clamp(pose.anticipation??0,0,1):0;
   state.selectionLift=state.selecting&&!reducedMotion?clamp(pose.lift??0,0,1):0;
   state.selectionFollowThrough=state.selecting&&!reducedMotion?clamp(pose.followThrough??0,0,1):0;
 }
 function beginTravel(){travel=true;setStarSelection(null);setStarHovered(false);}
 function dispose(){
   if(disposed)return;disposed=true;root.visible=false;
   for(const m of meshes){m.geometry.dispose();m.material.dispose();root.remove(m);}
   if(neutralMesh){
     if(useRig)neutralMesh.geometry.dispose();
     neutralMesh.material.dispose();root.remove(neutralMesh);
   }
   for(const rig of rigs)rig.dispose();
   for(const t of textures)t.dispose();
   camera.remove(root);
   meshes.length=0;hands.length=0;rigs.length=0;rightFrames.length=0;
   state.visible=false;state.loaded=false;
 }
 return {state,root,meshes,rigs,rightFrames,ready,update,resize,setStarHovered,setStarSelection,beginTravel,dispose};
}
