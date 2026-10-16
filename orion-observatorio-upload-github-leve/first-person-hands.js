// v0.9.10 · Prova de conceito de presença corporal no Observatório.
// Silhuetas etéreas em primeira pessoa. NÃO é a arte final das mãos.
// O viewmodel pertence à câmera, não recebe sombras e não participa do bloom.
// Uma textura CanvasTexture e duas superfícies planas: custo fixo e reversível.
import * as THREE from 'three';

// Arte procedural original inspirada na leitura etérea e rosa/violeta
// de mãos em primeira pessoa. Não reproduz nenhum asset de VALORANT/Clove.
// Renderização executada uma única vez; nenhuma atualização por quadro.
function createHandTexture(){
  const canvas=document.createElement('canvas');
  canvas.width=320;canvas.height=512;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas 2D indisponível para as mãos etéreas');

  // Contorno de mão semi-relaxada com 4 dedos curvados, polegar aberto,
  // palma e antebraço. Todos os dedos são parte de UM único path.
  const hand=new Path2D();
  hand.moveTo(30,520);
  hand.bezierCurveTo(38,460,60,418,89,385);
  hand.bezierCurveTo(108,363,119,352,114,328);
  // Mínimo: polegar não termina em ponta triangular.
  hand.bezierCurveTo(102,309,99,289,106,279);
  hand.bezierCurveTo(112,269,123,271,132,287);
  hand.bezierCurveTo(137,295,140,315,143,323);
  // Anelar curvado, ponta arredondada.
  hand.lineTo(140,264);
  hand.bezierCurveTo(140,247,145,237,155,236);
  hand.bezierCurveTo(167,237,167,249,167,264);
  hand.lineTo(169,304);
  // Médio, mais alto.
  hand.lineTo(169,236);
  hand.bezierCurveTo(169,222,174,213,184,212);
  hand.bezierCurveTo(197,213,199,227,198,243);
  hand.lineTo(199,306);
  // Indicador levemente retraído.
  hand.lineTo(205,269);
  hand.bezierCurveTo(206,252,214,246,226,250);
  hand.bezierCurveTo(238,256,235,270,232,286);
  hand.lineTo(222,333);
  // Polegar para dentro, separado da massa dos dedos.
  hand.bezierCurveTo(239,323,251,313,266,316);
  hand.bezierCurveTo(280,319,282,330,273,341);
  hand.bezierCurveTo(261,355,246,365,238,386);
  hand.bezierCurveTo(223,426,226,475,245,520);
  hand.closePath();

  ctx.save();
  ctx.shadowBlur=23;
  ctx.shadowColor='rgba(173,96,212,.25)';
  const silhouette=ctx.createLinearGradient(74,210,247,502);
  silhouette.addColorStop(0,'rgba(101,76,149,.96)');
  silhouette.addColorStop(.31,'rgba(74,51,115,.98)');
  silhouette.addColorStop(.65,'rgba(34,28,69,.99)');
  silhouette.addColorStop(1,'rgba(9,15,39,.98)');
  ctx.fillStyle=silhouette;
  ctx.fill(hand);
  ctx.restore();

  // Tudo a seguir é CLIPADO na silhueta, para não criar fumaça no universo.
  ctx.save();ctx.clip(hand);
  const energy=ctx.createRadialGradient(194,305,5,178,327,156);
  energy.addColorStop(0,'rgba(209,135,218,.35)');
  energy.addColorStop(.45,'rgba(136,92,189,.20)');
  energy.addColorStop(1,'rgba(54,30,99,0)');
  ctx.fillStyle=energy;ctx.fillRect(0,160,320,360);

  // Volumes e pregas orgânicas. Marcas assimétricas reforçam articulações.
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.lineWidth=5;
  ctx.strokeStyle='rgba(245,203,255,.10)';
  ctx.beginPath();
  ctx.moveTo(112,338);ctx.bezierCurveTo(143,319,170,322,193,339);
  ctx.moveTo(123,369);ctx.bezierCurveTo(162,355,189,358,219,380);
  ctx.moveTo(150,266);ctx.lineTo(151,304);
  ctx.moveTo(181,242);ctx.lineTo(182,298);
  ctx.moveTo(217,275);ctx.lineTo(210,310);
  ctx.stroke();

  // Luz interna etérea na lateral e nos dedos, sem emissive pass.
  ctx.strokeStyle='rgba(208,146,244,.28)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(117,308);ctx.bezierCurveTo(126,349,133,353,144,361);
  ctx.moveTo(148,252);ctx.lineTo(150,289);
  ctx.moveTo(177,226);ctx.lineTo(179,286);
  ctx.moveTo(218,263);ctx.lineTo(211,309);
  ctx.moveTo(110,392);ctx.bezierCurveTo(120,410,121,437,115,452);
  ctx.stroke();

  // Início de manga em faixas escuras: dá escala de antebraço sem
  // reproduzir o figurino de Clove. Não é uma luva tática.
  ctx.save();
  ctx.translate(163,409);ctx.rotate(-.08);
  const cuff=ctx.createLinearGradient(0,-20,0,45);
  cuff.addColorStop(0,'rgba(15,16,38,.35)');
  cuff.addColorStop(.22,'rgba(12,16,42,.90)');
  cuff.addColorStop(.70,'rgba(8,12,30,.96)');
  cuff.addColorStop(1,'rgba(26,19,56,.90)');
  ctx.fillStyle=cuff;
  ctx.fillRect(-110,-5,210,63);
  ctx.strokeStyle='rgba(186,113,210,.32)';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-107,0);ctx.lineTo(98,0);ctx.stroke();
  ctx.restore();

  // Fumaça/fragmentos de luz PINTADOS, não partículas renderizadas.
  ctx.strokeStyle='rgba(230,146,233,.13)';
  ctx.lineWidth=7;ctx.shadowBlur=10;ctx.shadowColor='rgba(177,78,238,.28)';
  ctx.beginPath();
  ctx.moveTo(61,418);ctx.bezierCurveTo(84,392,98,373,103,345);
  ctx.moveTo(239,382);ctx.bezierCurveTo(231,409,224,446,229,470);
  ctx.stroke();ctx.shadowBlur=0;
  ctx.restore();

  // Contorno fino define dedos sem deixar a arte excessivamente luminosa.
  ctx.save();
  ctx.strokeStyle='rgba(185,126,212,.38)';
  ctx.lineWidth=2.2;ctx.lineJoin='round';
  ctx.stroke(hand);
  ctx.restore();

  // Antebraço desaparece progressivamente no limite inferior.
  const fade=ctx.createLinearGradient(0,388,0,512);
  fade.addColorStop(0,'rgba(0,0,0,1)');
  fade.addColorStop(.77,'rgba(0,0,0,.92)');
  fade.addColorStop(1,'rgba(0,0,0,.06)');
  ctx.globalCompositeOperation='destination-in';
  ctx.fillStyle=fade;ctx.fillRect(0,0,320,512);
  ctx.globalCompositeOperation='source-over';

  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=1;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.magFilter=THREE.LinearFilter;
  return texture;
}

/**
 * Duas superfícies transparentes de baixa opacidade, presas à câmera.
 * 0 meshes, shaders e texturas quando enabled=false; 2 draws + 1 textura
 * se estiver visível. Os dados de movimento não exigem layout DOM.
 */
export function createFirstPersonHands(camera,{enabled=true,reducedMotion=false}={}){
  const state={
    enabled:Boolean(enabled),
    visible:Boolean(enabled),
    motionEnabled:!reducedMotion,
    leftX:0,rightX:0,swayX:0,swayY:0,
    textureCount:enabled?1:0,drawSurfaces:enabled?2:0
  };
  if(!enabled){
    return{state,meshes:[],update(){},resize(){},beginTravel(){},dispose(){}};
  }
  const texture=createHandTexture();
  const geometry=new THREE.PlaneGeometry(1,1);
  const material=new THREE.MeshBasicMaterial({
    map:texture,transparent:true,opacity:.78,
    depthTest:false,depthWrite:false,
    toneMapped:false,side:THREE.DoubleSide
  });
  const left=new THREE.Mesh(geometry,material);
  const right=new THREE.Mesh(geometry,material);
  left.name='Mão etérea esquerda · pose de primeira pessoa v0.9.11';
  right.name='Mão etérea direita · pose de primeira pessoa v0.9.11';
  // Mãos ficam fora do pós-processamento da estrela (layer 1) e não
  // interceptam o Raycaster que seleciona Nox.
  left.layers.set(0);right.layers.set(0);
  left.renderOrder=30;right.renderOrder=30;
  left.frustumCulled=false;right.frustumCulled=false;
  camera.add(left,right);
  const meshes=[left,right];
  // Percentuais relativos ao frustum da câmera: não escalam com pixels CSS.
  // Assimetria de pose e profundidade vende a sensação de um corpo presente.
  const poses={
    left:{z:-1.10,x:-.70,y:-.72,size:1.10,roll:-.20,pitch:.055,yaw:.025,sway:.86},
    right:{z:-1.00,x:.68,y:-.66,size:1.17,roll:.18,pitch:.035,yaw:-.025,sway:1.0}
  };
  let targetX=0,targetY=0;
  function extent(z){
    const hh=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*Math.abs(z);
    return{hh,hw:hh*camera.aspect};
  }
  function layout(){
    for(const [mesh,pose,mirror] of [[left,poses.left,1],[right,poses.right,-1]]){
      const {hh,hw}=extent(pose.z);
      const height=hh*pose.size;
      mesh.scale.set(mirror*height*(320/512),height,1);
      mesh.position.set(hw*pose.x,hh*pose.y,pose.z);
      mesh.rotation.set(pose.pitch,pose.yaw,pose.roll);
    }
    state.leftX=left.position.x;
    state.rightX=right.position.x;
  }
  layout();
  function update(time,delta,pointerX=0,pointerY=0){
    if(!state.visible)return;
    const x=THREE.MathUtils.clamp(pointerX,-1,1);
    const y=THREE.MathUtils.clamp(pointerY,-1,1);
    const factor=state.motionEnabled
      ?1-Math.exp(-Math.max(0,Math.min(delta,.06))*7.5):1;
    targetX+=(x-targetX)*factor;
    targetY+=(y-targetY)*factor;
    state.swayX=state.motionEnabled?targetX:0;
    state.swayY=state.motionEnabled?targetY:0;
    const breath=state.motionEnabled?Math.sin(time*.81)*.006:0;
    for(const [mesh,pose,mult] of [[left,poses.left,.90],[right,poses.right,1]]){
      const {hh,hw}=extent(pose.z);
      const swayX=state.swayX*hw*.029*pose.sway;
      const swayY=state.swayY*hh*.024*pose.sway;
      mesh.position.set(hw*pose.x-swayX,hh*pose.y-swayY+breath*hh*mult,pose.z);
      mesh.rotation.set(
        pose.pitch+(state.motionEnabled?state.swayY*.012:0),
        pose.yaw,
        pose.roll+(state.motionEnabled?state.swayX*.020*pose.sway:0)
      );
    }
    state.leftX=left.position.x;
    state.rightX=right.position.x;
  }
  function beginTravel(){
    state.visible=false;
    meshes.forEach(mesh=>mesh.visible=false);
  }
  function dispose(){
    camera.remove(left,right);
    geometry.dispose();material.dispose();texture.dispose();
  }
  return{state,meshes,update,resize:layout,beginTravel,dispose};
}
