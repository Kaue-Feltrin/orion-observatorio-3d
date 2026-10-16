// v0.9.12 · Mãos tridimensionais originais em primeira pessoa.
// Geometria REAL com volumes (palma, cinco dedos dobrados, punho e manga),
// mesclada em um único mesh por mão: sem texturas, luzes nem shaders custom.
// O protótipo 2.5D permanece em first-person-hands.js via ?hands=2d.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const PALM=new THREE.Color('#5b3e83');
const SHADOW=new THREE.Color('#171831');
const LIGHT=new THREE.Color('#ba79ca');
const CUFF=new THREE.Color('#101329');
const LIGHT_DIR=new THREE.Vector3(-.48,.64,.64).normalize();

function bakeColor(geometry,{kind='skin',strength=1}={}){
  const positions=geometry.getAttribute('position');
  const normals=geometry.getAttribute('normal');
  const colors=new Float32Array(positions.count*4);
  const c=new THREE.Color();
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i), y=positions.getY(i);
    const nx=normals.getX(i),ny=normals.getY(i),nz=normals.getZ(i);
    const light=Math.max(0,nx*LIGHT_DIR.x+ny*LIGHT_DIR.y+nz*LIGHT_DIR.z);
    const front=Math.max(0,nz);
    if(kind==='cuff'){
      c.copy(CUFF).lerp(PALM,Math.min(.22,light*.14));
    }else if(kind==='glimmer'){
      c.copy(LIGHT).lerp(PALM,.25);
    }else{
      c.copy(SHADOW).lerp(PALM,.44+.36*light+.13*front);
      const tip=Math.min(.20,Math.max(0,y-.20)*.42);
      c.lerp(LIGHT,Math.min(.44,tip+light*.10*strength));
    }
    // A manga some no limite inferior: alpha por vértice, sem alphaMap.
    const fade=THREE.MathUtils.smoothstep(y,-1.15,-.79);
    colors[i*4]=c.r;
    colors[i*4+1]=c.g;
    colors[i*4+2]=c.b;
    colors[i*4+3]=(kind==='glimmer'?.50:1)*fade;
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
  return geometry;
}

function ellipsoid(parts,center,scale,kind='skin',segments=12,rings=8){
  const g=new THREE.SphereGeometry(1,segments,rings);
  g.scale(scale[0],scale[1],scale[2]);
  g.translate(center[0],center[1],center[2]);
  parts.push(bakeColor(g,{kind}));
}

function bone(parts,start,end,radiusA,radiusB,kind='skin'){
  const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end);
  const delta=b.clone().sub(a),len=delta.length();
  if(len<.001)return;
  const g=new THREE.CylinderGeometry(radiusB,radiusA,len,9,1,false);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(a.add(b).multiplyScalar(.5),q,new THREE.Vector3(1,1,1)));
  parts.push(bakeColor(g,{kind}));
}

// Uma mão canônica; a outra usa espelhamento de X, sem duplicar vértices na GPU.
// Y: dedos em direção à estrela, antebraço recuando até abaixo da tela.
// Z: palma e dedos avançam em níveis distintos no mundo 3D da câmera.
export function createHand3DGeometry(){
  const parts=[];
  // Antebraço e transição de punho com manga escura.
  bone(parts,[0,-1.12,-.16],[.025,-.40,-.04],.185,.135,'cuff');
  ellipsoid(parts,[.023,-.49,-.035],[.153,.13,.124],'cuff');
  bone(parts,[.025,-.43,-.04],[.02,-.25,.025],.125,.118);
  // Palma e dorso volumétricos, afastados do plano das falanges.
  ellipsoid(parts,[0,-.07,.035],[.270,.326,.126]);
  ellipsoid(parts,[.002,.13,.063],[.225,.144,.115]);
  // Relevo da musculatura do polegar, integrado à palma.
  ellipsoid(parts,[.178,-.16,.114],[.120,.170,.108]);
  // Quatro dedos distintos, com duas falanges e juntas arredondadas;
  // a ponta dos dedos se curva em direção ao cenário (-Z).
  const fingers=[
    {x:-.205,len:.265,lean:-.057,r:.047},  // mindinho
    {x:-.104,len:.344,lean:-.024,r:.053},  // anelar
    {x:.011,len:.393,lean:.011,r:.057},   // médio
    {x:.125,len:.334,lean:.064,r:.051},  // indicador
  ];
  for(const finger of fingers){
    const start=[finger.x,.187,.067];
    const mid=[finger.x+finger.lean*.43,.187+finger.len*.57,.018];
    const tip=[finger.x+finger.lean,.187+finger.len,-.100];
    bone(parts,start,mid,finger.r*1.18,finger.r*.93);
    ellipsoid(parts,mid,[finger.r*.99,finger.r*.99,finger.r*.94]);
    bone(parts,mid,tip,finger.r*.94,finger.r*.72);
    ellipsoid(parts,tip,[finger.r*.80,finger.r*.90,finger.r*.78]);
    // Reflexo espectral mínimo embutido nos vértices, sem luz real.
    ellipsoid(parts,[tip[0],tip[1]+finger.r*.18,tip[2]+finger.r*.48],
      [finger.r*.43,finger.r*.25,finger.r*.12],'glimmer',8,5);
  }
  // Polegar articulado radialmente. Sua separação da palma é crucial
  // para a silhueta ser reconhecida como mão, não uma luva.
  const t0=[.196,-.168,.117], t1=[.357,-.043,.157], t2=[.385,.102,.073];
  bone(parts,t0,t1,.083,.062);
  ellipsoid(parts,t1,[.066,.066,.068]);
  bone(parts,t1,t2,.062,.043);
  ellipsoid(parts,t2,[.051,.062,.048]);
  // Faixa violeta discreta no punho, integrada ao mesmo material.
  bone(parts,[.025,-.53,-.034],[.025,-.49,-.034],.159,.159,'glimmer');

  const merged=mergeGeometries(parts,false);
  for(const g of parts)g.dispose();
  if(!merged)throw new Error('Não foi possível mesclar a malha das mãos 3D');
  merged.computeBoundingSphere();
  merged.userData.fingerCount=5;
  merged.userData.sections=parts.length;
  merged.userData.triangles=merged.index?.count/3??merged.getAttribute('position').count/3;
  return merged;
}

export function createFirstPersonHands3D(camera,{enabled=true,reducedMotion=false}={}){
  const state={
    mode:'3d',enabled:Boolean(enabled),visible:Boolean(enabled),
    motionEnabled:!reducedMotion,textureCount:0,drawSurfaces:enabled?2:0,
    fingerCount:enabled?10:0,leftX:0,rightX:0,swayX:0,swayY:0,triangles:0
  };
  if(!enabled)return{state,meshes:[],update(){},resize(){},beginTravel(){},dispose(){}};
  const geometry=createHand3DGeometry();
  state.triangles=geometry.userData.triangles;
  const material=new THREE.MeshBasicMaterial({
    color:0xffffff,vertexColors:true,transparent:true,opacity:.92,
    side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false
  });
  const left=new THREE.Mesh(geometry,material),right=new THREE.Mesh(geometry,material);
  left.name='Mão 3D esquerda · primeira pessoa';
  right.name='Mão 3D direita · primeira pessoa';
  for(const hand of [left,right]){
    hand.layers.set(0);
    hand.renderOrder=30;
    hand.frustumCulled=false;
  }
  camera.add(left,right);
  const meshes=[left,right];
  const poses={
    // Um pouco mais abaixo/lateral que a prova inicial: centro do Nox livre.
    left:{z:-1.10,x:-.78,y:-.82,size:.65,roll:-.20,pitch:-.13,yaw:-.13,sway:.86},
    right:{z:-1.00,x:.76,y:-.80,size:.68,roll:.18,pitch:-.11,yaw:.12,sway:1}
  };
  function extent(z){
    const hh=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*Math.abs(z);
    return{hh,hw:hh*camera.aspect};
  }
  function resize(){
    for(const [hand,pose,flip] of [[left,poses.left,1],[right,poses.right,-1]]){
      const {hh,hw}=extent(pose.z);
      const height=hh*pose.size;
      hand.scale.set(flip*height,height,height);
      hand.position.set(hw*pose.x,hh*pose.y,pose.z);
      hand.rotation.set(pose.pitch,pose.yaw,pose.roll);
    }
    state.leftX=left.position.x;state.rightX=right.position.x;
  }
  let currentX=0,currentY=0;
  resize();
  function update(time,dt,pointerX=0,pointerY=0){
    if(!state.visible)return;
    const factor=state.motionEnabled
      ?1-Math.exp(-Math.max(0,Math.min(dt,.06))*7.5):1;
    currentX+=(THREE.MathUtils.clamp(pointerX,-1,1)-currentX)*factor;
    currentY+=(THREE.MathUtils.clamp(pointerY,-1,1)-currentY)*factor;
    state.swayX=state.motionEnabled?currentX:0;
    state.swayY=state.motionEnabled?currentY:0;
    const breath=state.motionEnabled?Math.sin(time*.81)*.006:0;
    for(const [hand,pose,mult] of [[left,poses.left,.9],[right,poses.right,1]]){
      const {hh,hw}=extent(pose.z);
      hand.position.set(
        hw*(pose.x-state.swayX*.029*pose.sway),
        hh*(pose.y-state.swayY*.024*pose.sway+breath*mult),
        pose.z
      );
      hand.rotation.set(
        pose.pitch+(state.motionEnabled?state.swayY*.012:0),
        pose.yaw+(state.motionEnabled?state.swayX*.010:0),
        pose.roll+(state.motionEnabled?state.swayX*.020*pose.sway:0)
      );
    }
    state.leftX=left.position.x;state.rightX=right.position.x;
  }
  function beginTravel(){
    state.visible=false;
    for(const hand of meshes)hand.visible=false;
  }
  function dispose(){
    camera.remove(left,right);
    geometry.dispose();material.dispose();
  }
  return{state,meshes,update,resize,beginTravel,dispose};
}
