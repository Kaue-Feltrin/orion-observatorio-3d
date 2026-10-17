// Observatório v0.9.21: mãos nas bordas; direita neutra fora do hover do Nox.
// Mesma câmera e mesmo loop; as duas poses direitas compartilham geometria.
import * as THREE from 'three';
import {MESH_COLS,MESH_ROWS,deformHandVertices,HAND_PROFILES} from './hands-mesh-motion.js';

const HANDS=Object.freeze({
 left:{file:'/overlay/left-hand-ethereal.webp',baseOpacity:.38,height:.565,
   edgeInset:-.030,bottom:-.020,swayX:-.006,swayY:-.005,breath:.003,phase:.45,
   pointer:false,columns:MESH_COLS,rows:MESH_ROWS},
 right:{file:'/overlay/right-hand-pointing.webp',neutralFile:'/overlay/right-hand-neutral.webp',baseOpacity:.46,height:.66,
   edgeInset:-.018,bottom:-.005,swayX:-.006,swayY:-.005,breath:.003,phase:1.15,
   pointer:true,columns:36,rows:28}
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createEtherealHandsMesh(camera,{enabled=true,reducedMotion=false}={}){
 const state={mode:'mesh',enabled:!!enabled,visible:false,loaded:false,loadError:null,
   motionEnabled:!reducedMotion,drawSurfaces:0,triangles:0,textureCount:0,
   joints:0,fingerJoints:0,swayX:0,swayY:0,maxVertexDelta:0,
   pose:'feminine-star-hover',handProfiles:Object.keys(HAND_PROFILES),
   rightHover:false,rightBlend:0};
 const root=new THREE.Group();
 root.name='OrionFeminineHands2p5D';
 root.visible=false;
 camera.add(root);
 const meshes=[],hands=[];
 let neutralMesh=null,starHovered=false,pointBlend=0;
 if(!enabled)return {state,root,meshes,ready:Promise.resolve(false),
   update(){},resize(){},setStarHovered(){},beginTravel(){},dispose(){camera.remove(root)}};
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
 const ready=Promise.all([load(HANDS.left.file),load(HANDS.right.file),load(HANDS.right.neutralFile)]).then(loaded=>{
   if(disposed){loaded.forEach(tex=>tex.dispose());return false;}
   for(const texture of loaded){
     texture.colorSpace=THREE.SRGBColorSpace;
     texture.magFilter=THREE.LinearFilter;
     texture.minFilter=THREE.LinearMipmapLinearFilter;
     textures.push(texture);
   }
   for(let i=0;i<2;i++){
     const side=i===0?'left':'right',config=HANDS[side],texture=loaded[i];
     const geom=new THREE.PlaneGeometry(1,1,config.columns,config.rows);
     const pos=geom.getAttribute('position'),uv=geom.getAttribute('uv');
     const rest=new Float32Array(pos.array),uvLocal=new Float32Array(uv.array);
     if(side==='right'){
       // A arte termina antes da borda do sprite: zerar o alpha antes desse
       // corte evita um punho flutuante no canto, sem mover ou escalar a mão.
       const colors=new Float32Array(uv.count*4);
       const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
       for(let j=0;j<uv.count;j++){
         const u=uvLocal[j*2],v=uvLocal[j*2+1];
         const rightEdge=smooth((u-.68)/.26);
         const nearBottom=1-smooth((v-.16)/.22);
         const k=j*4;
         colors[k]=1;colors[k+1]=1;colors[k+2]=1;
         colors[k+3]=1-rightEdge*nearBottom;
       }
       geom.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
     }
     const material=new THREE.MeshBasicMaterial({
       map:texture,transparent:true,opacity:config.baseOpacity,
       side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,
       vertexColors:side==='right'
     });
     const mesh=new THREE.Mesh(geom,material);
     mesh.name=side==='left'?'OrionFeminineLeftFraming':'OrionFeminineRightPointing';
     mesh.renderOrder=300+i;mesh.frustumCulled=false;
     meshes.push(mesh);root.add(mesh);
     const width=texture.image?.naturalWidth||texture.image?.width||1122;
     const height=texture.image?.naturalHeight||texture.image?.height||1402;
     const hand={side,config,mesh,rest,uvLocal,aspect:width/height};
     hands.push(hand);place(hand);
   }
   // Asset neutro próprio, com palma/punho alinhados ao apontamento.
   // Compartilhar a malha mantém a mesma deformação durante o blend.
   const neutralGeometry=meshes[1].geometry;
   const neutralMaterial=new THREE.MeshBasicMaterial({
     map:textures[2],transparent:true,opacity:HANDS.right.baseOpacity,
     side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,vertexColors:true
   });
   neutralMesh=new THREE.Mesh(neutralGeometry,neutralMaterial);
   neutralMesh.name='OrionFeminineRightNeutral';
   neutralMesh.renderOrder=301;neutralMesh.frustumCulled=false;
   root.add(neutralMesh);
   // O visual neutro acompanha exatamente o enquadramento da mão direita.
   neutralMesh.scale.copy(meshes[1].scale);
   neutralMesh.position.copy(meshes[1].position);
   state.loaded=true;state.visible=true;
   state.textureCount=3;
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
   const desired=starHovered&&!travel?1:0;
   pointBlend=reducedMotion?desired:pointBlend+(desired-pointBlend)*(1-Math.exp(-step*9.5));
   pointBlend=clamp(pointBlend,0,1);
   state.rightBlend=pointBlend;
   if(alpha===0){root.visible=false;state.visible=false;state.drawSurfaces=0;state.triangles=0;return;}
   let max=0;
   for(const hand of hands){
     const c=hand.config,{mesh,rest,uvLocal}=hand;
     const pos=mesh.geometry.getAttribute('position');
     max=Math.max(max,deformHandVertices(rest,pos.array,uvLocal,hand.side,
       seconds,state.swayX,state.swayY,reducedMotion));
     pos.needsUpdate=!reducedMotion;
     const fx=reducedMotion?0:state.swayX*c.swayX;
     const fy=reducedMotion?0:state.swayY*c.swayY+
       Math.sin(seconds*.94+c.phase)*c.breath;
     place(hand,fx,fy);
     // Mãos distintas: direita aponta, esquerda emoldura; sem giro brusco.
     mesh.rotation.z=reducedMotion?0:Math.sin(seconds*.72+c.phase)*(c.pointer?.010:.006);
     mesh.material.opacity=c.baseOpacity*alpha*(hand.side==='right'?pointBlend:1);
   }
   if(neutralMesh&&meshes[1]){
     neutralMesh.position.copy(meshes[1].position);
     neutralMesh.scale.copy(meshes[1].scale);
     neutralMesh.rotation.z=meshes[1].rotation.z;
     neutralMesh.material.opacity=HANDS.right.baseOpacity*alpha*(1-pointBlend);
   }
   meshes[1].visible=pointBlend>.003;
   neutralMesh.visible=pointBlend<.997;
   state.drawSurfaces=1+Number(meshes[1].visible)+Number(neutralMesh.visible);
   state.triangles=HANDS.left.columns*HANDS.left.rows*2+
     (state.drawSurfaces-1)*HANDS.right.columns*HANDS.right.rows*2;
   state.maxVertexDelta=max;
 }
 function setStarHovered(v){starHovered=!!v&&!travel;state.rightHover=starHovered;}
 function beginTravel(){travel=true;setStarHovered(false);}
 function dispose(){
   if(disposed)return;disposed=true;root.visible=false;
   for(const m of meshes){m.geometry.dispose();m.material.dispose();root.remove(m);}
   if(neutralMesh){neutralMesh.material.dispose();root.remove(neutralMesh);}
   for(const t of textures)t.dispose();
   camera.remove(root);
   meshes.length=0;hands.length=0;
   state.visible=false;state.loaded=false;
 }
 return {state,root,meshes,ready,update,resize,setStarHovered,beginTravel,dispose};
}
