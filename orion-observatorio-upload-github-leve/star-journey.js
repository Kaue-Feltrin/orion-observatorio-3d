// v0.9 - Viagem estelar: atravessar camadas REAIS em Z ate entrar no brilho.
// Nao movimenta nem desfoca a fotografia da ESO durante o repouso.
import * as THREE from 'three';

const clamp01 = x => Math.min(1, Math.max(0, x));
const smooth = (x,a,b) => { const t=clamp01((x-a)/(b-a)); return t*t*(3-2*t); };

export function createStarJourney({scene,camera,star,glows,layers,gasLayers,selectiveBloom,flash,reducedMotion,onArrive}) {
  const specs = [
    {object:glows.halo,scale:156,opacity:.22},
    {object:glows.soft,scale:118,opacity:.30},
    {object:glows.main,scale:66,opacity:.80},
    {object:glows.core,scale:18,opacity:1},
  ];
  let startFov=52;
  const starZ = star.position.z; // Nao permitir colidir com o astro.
  const endpoint = new THREE.Vector3(star.position.x,star.position.y,starZ+53);
  const travelDuration = reducedMotion ? 850 : 2150;
  const lockDuration = reducedMotion ? 80 : 290;
  const lastLight = reducedMotion ? .70 : .77;
  const startPos = new THREE.Vector3();
  const initialQ = new THREE.Quaternion();
  const aimedQ = new THREE.Quaternion();
  const aimM = new THREE.Matrix4();
  const up = new THREE.Vector3(0,1,0);
  const focusPoint = new THREE.Vector3();
  const bloomOriginal = selectiveBloom.state.intensity;
  let active=false, completed=false, started=0, progress=0;
  const shaderLayerStrength = gasLayers.map(o => [o, o.material.uniforms.uStrength.value]);
  const staticLayerOpacity = layers.filter(o=>o.material?.opacity!==undefined).map(o=>[o,o.material.opacity]);

  // Streaks along the viewing direction, with genuine forward motion in camera space.
  const count = reducedMotion ? 0 : 540;
  const positions=new Float32Array(count*6);
  const colors=new Float32Array(count*6);
  const particles=[];
  const shades=[new THREE.Color('#c8d5ff'),new THREE.Color('#9f8dd8'),new THREE.Color('#fce1b4')];
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2;
    const radius=6+Math.sqrt(Math.random())*100;
    const x=Math.cos(angle)*radius, y=Math.sin(angle)*radius*.65;
    const z=-14-Math.random()*200;
    const len=3+Math.random()*18;
    const speed=.65+Math.random()*.8;
    particles.push({x,y,z,len,speed});
    const c=shades[i%shades.length];const at=i*6;
    for(let j=0;j<2;j++){colors[at+j*3]=c.r;colors[at+j*3+1]=c.g;colors[at+j*3+2]=c.b;}
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const material=new THREE.LineBasicMaterial({
    vertexColors:true, transparent:true,opacity:0,
    depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending
  });
  const streaks=new THREE.LineSegments(geometry,material);
  streaks.frustumCulled=false;streaks.renderOrder=18;streaks.visible=false;
  camera.add(streaks);

  function begin(now=performance.now()) {
    if(active||completed)return false;
    camera.updateWorldMatrix(true,false);
    scene.attach(camera); // Mantem orientacao e posicao antes da viagem.
    camera.updateWorldMatrix(true,false);
    startPos.copy(camera.position);
    initialQ.copy(camera.quaternion);
    startFov=camera.fov;
    for(const spec of specs){
      spec.startScale=spec.object.scale.x;
      spec.startOpacity=spec.object.material.opacity;
    }
    aimM.lookAt(startPos,star.position,up);
    aimedQ.setFromRotationMatrix(aimM);
    started=now;active=true;progress=0;
    streaks.visible=!reducedMotion;
    return true;
  }

  function update(now,delta) {
    if(!active) return 0;
    const elapsed=now-started;
    const t=clamp01(elapsed/travelDuration);
    progress=t;
    const flight=clamp01((elapsed-lockDuration)/(travelDuration-lockDuration));
    // Primeira fase: mira na estrela sem teleportar a camera.
    const distancePhase=Math.pow(smooth(flight,0,1),1.18);
    const x=THREE.MathUtils.lerp(startPos.x,endpoint.x,distancePhase);
    const y=THREE.MathUtils.lerp(startPos.y,endpoint.y,distancePhase);
    const lateral=reducedMotion?0:Math.sin(flight*Math.PI*2.6)*4.3*Math.sin(flight*Math.PI);
    const vertical=reducedMotion?0:Math.sin(flight*Math.PI*3.8)*2.3*Math.sin(flight*Math.PI);
    camera.position.set(x+lateral,y+vertical,THREE.MathUtils.lerp(startPos.z,endpoint.z,distancePhase));
    focusPoint.copy(star.position);
    aimM.lookAt(camera.position,focusPoint,up);
    aimedQ.setFromRotationMatrix(aimM);
    camera.quaternion.slerpQuaternions(initialQ,aimedQ,smooth(t,0,.25));
    const handoff=smooth(elapsed,0,lockDuration);
    camera.fov=THREE.MathUtils.lerp(startFov,52,handoff) + (reducedMotion?0:11*Math.sin(Math.PI*flight));
    camera.updateProjectionMatrix();

    // Nuvens atravessam o plano da camera e desaparecem suavemente depois.
    for(const [layer,strength] of shaderLayerStrength) {
      const d=camera.position.z-layer.position.z;
      const visibility=smooth(d,-14,95);
      layer.material.uniforms.uStrength.value=strength*visibility;
    }
    for(const [layer,alpha] of staticLayerOpacity) {
      if(layer.position.z < starZ-25) continue; // base fotografica de fundo, sem blur
      const d=camera.position.z-layer.position.z;
      layer.material.opacity=alpha*smooth(d,-14,95);
    }

    const light=smooth(t,lastLight,.995);
    // Tamanho angular da estrela permanece quase constante durante a aceleracao.
    const remaining=Math.max(35,camera.position.distanceTo(star.position));
    const startDistance=Math.max(1,startPos.distanceTo(star.position));
    const constAngle=remaining/startDistance;
    const expand=1+light*light*22;
    for(const spec of specs) {
      spec.object.scale.setScalar(THREE.MathUtils.lerp(spec.startScale,spec.scale*constAngle*expand,handoff));
    }
    for(const [i,opacity] of [.2+.47*light,.30+.47*light,.85+.22*light,1].entries())
      specs[i].object.material.opacity=THREE.MathUtils.lerp(specs[i].startOpacity,opacity,handoff);
    selectiveBloom.setIntensity(Math.min(1.5,bloomOriginal + .75*light));

    const speed=(140+1700*Math.pow(flight,1.7));
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      p.z+=delta*speed*p.speed;
      if(p.z>2)p.z=-220-Math.random()*45;
      const a=i*6;
      positions[a]=p.x;positions[a+1]=p.y;positions[a+2]=p.z;
      positions[a+3]=p.x;positions[a+4]=p.y;positions[a+5]=p.z-Math.min(28,p.len*(1+2.2*flight));
    }
    geometry.attributes.position.needsUpdate=true;
    material.opacity=reducedMotion?0:(.04+.50*smooth(flight,0,.55))*(1-light*.88);
    flash.style.opacity=String(light);
    flash.style.setProperty('--veil-opacity',String(smooth(t,.90,1)));
    if(t>=1 && !completed){
      completed=true;active=false;onArrive();
    }
    return t;
  }
  return {begin,update,get active(){return active},get progress(){return progress},get streakCount(){return count},get passedLayers(){return gasLayers.filter(x=>camera.position.z<x.position.z).length}};
}
