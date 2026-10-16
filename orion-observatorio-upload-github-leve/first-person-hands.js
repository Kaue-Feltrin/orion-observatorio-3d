// v0.9.10 · Prova de conceito de presença corporal no Observatório.
// Silhuetas etéreas em primeira pessoa. NÃO é a arte final das mãos.
// O viewmodel pertence à câmera, não recebe sombras e não participa do bloom.
// Uma textura CanvasTexture e duas superfícies planas: custo fixo e reversível.
import * as THREE from 'three';

function createHandTexture(){
  const canvas=document.createElement('canvas');
  canvas.width=320;
  canvas.height=512;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas 2D indisponível para o protótipo das mãos');
  // Desenho vetorial de uma mão aberta de cinco dedos com antebraço.
  // Traçado único: nenhuma geometria animada ou bones no render loop.
  const outline=new Path2D();
  outline.moveTo(36,517);
  outline.bezierCurveTo(27,475,49,427,80,396);
  outline.bezierCurveTo(94,378,100,356,113,335);
  outline.bezierCurveTo(108,314,103,291,105,254);
  outline.bezierCurveTo(105,237,115,232,125,238);
  outline.bezierCurveTo(136,244,135,262,140,282);
  outline.lineTo(145,207);
  outline.bezierCurveTo(145,188,154,181,165,184);
  outline.bezierCurveTo(175,188,172,206,174,237);
  outline.lineTo(179,172);
  outline.bezierCurveTo(179,151,190,145,201,151);
  outline.bezierCurveTo(211,157,205,173,205,210);
  outline.lineTo(216,200);
  outline.bezierCurveTo(219,180,229,175,240,185);
  outline.bezierCurveTo(248,193,241,209,235,245);
  outline.lineTo(222,297);
  // Polegar voltado para dentro do quadro, afastado da palma.
  outline.bezierCurveTo(245,287,264,264,279,274);
  outline.bezierCurveTo(291,282,291,293,281,305);
  outline.bezierCurveTo(260,329,246,340,235,365);
  outline.bezierCurveTo(222,396,218,428,225,466);
  outline.lineTo(235,517);
  outline.closePath();

  ctx.save();
  ctx.shadowColor='rgba(90,114,159,.19)';
  ctx.shadowBlur=15;
  const fill=ctx.createLinearGradient(62,155,236,515);
  fill.addColorStop(0,'rgba(63,77,111,.87)');
  fill.addColorStop(.40,'rgba(31,40,64,.91)');
  fill.addColorStop(.78,'rgba(13,19,37,.95)');
  fill.addColorStop(1,'rgba(6,11,25,.83)');
  ctx.fillStyle=fill;
  ctx.fill(outline);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle='rgba(164,180,211,.32)';
  ctx.lineWidth=1.6;
  ctx.lineJoin='round';
  ctx.stroke(outline);
  // Dois reflexos localizados ajudam a entender a pose sem mais luz na tela.
  ctx.strokeStyle='rgba(169,191,225,.19)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(119,347);
  ctx.bezierCurveTo(152,326,188,326,215,349);
  ctx.moveTo(96,406);
  ctx.bezierCurveTo(126,382,149,380,164,390);
  ctx.stroke();
  ctx.restore();

  // A saída pela borda inferior fica esmaecida; sem corte rígido do braço.
  const fade=ctx.createLinearGradient(0,390,0,512);
  fade.addColorStop(0,'rgba(0,0,0,1)');
  fade.addColorStop(.78,'rgba(0,0,0,.86)');
  fade.addColorStop(1,'rgba(0,0,0,.10)');
  ctx.globalCompositeOperation='destination-in';
  ctx.fillStyle=fade;
  ctx.fillRect(0,0,320,512);
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
    map:texture,transparent:true,opacity:.67,
    depthTest:false,depthWrite:false,
    toneMapped:false,side:THREE.DoubleSide
  });
  const left=new THREE.Mesh(geometry,material);
  const right=new THREE.Mesh(geometry,material);
  left.name='Mão etérea esquerda · protótipo';
  right.name='Mão etérea direita · protótipo';
  // Mãos ficam fora do pós-processamento da estrela (layer 1) e não
  // interceptam o Raycaster que seleciona Nox.
  left.layers.set(0);right.layers.set(0);
  left.renderOrder=30;right.renderOrder=30;
  left.frustumCulled=false;right.frustumCulled=false;
  camera.add(left,right);
  const meshes=[left,right];
  const z=-1.20;
  const anchors={left:{x:-.82,y:-.83},right:{x:.82,y:-.83}};
  let targetX=0,targetY=0;
  function layout(){
    const hh=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*Math.abs(z);
    const hw=hh*camera.aspect;
    const height=hh*.88;
    const width=height*(320/512);
    left.position.set(-hw*.82,-hh*.83,z);
    right.position.set(hw*.82,-hh*.83,z);
    left.scale.set(width,height,1);
    right.scale.set(-width,height,1);
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
    const hh=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*Math.abs(z);
    const hw=hh*camera.aspect;
    const breath=state.motionEnabled?Math.sin(time*.83)*.010:0;
    // Menos de 3% da largura visível de deslocamento.
    const swayX=state.swayX*hw*.023;
    const swayY=state.swayY*hh*.028;
    left.position.set(-hw*.82-swayX,-hh*.83-swayY+breath*hh,z);
    right.position.set(hw*.82-swayX,-hh*.83-swayY+breath*hh*.94,z);
    left.rotation.z=state.motionEnabled?-.075+state.swayX*.025:-.075;
    right.rotation.z=state.motionEnabled?.075+state.swayX*.025:.075;
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
