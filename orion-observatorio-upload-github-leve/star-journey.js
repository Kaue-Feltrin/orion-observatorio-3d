// v0.9 - Viagem estelar: atravessar camadas REAIS em Z ate entrar no brilho.
// Nao movimenta nem desfoca a fotografia da ESO durante o repouso.
import * as THREE from 'three';

const clamp01 = x => Math.min(1, Math.max(0, x));
const smoother=(x,a,b)=>{const t=clamp01((x-a)/(b-a));return t*t*t*(t*(t*6-15)+10);};
export const JOURNEY_DURATION=2550;
const smooth = (x,a,b) => { const t=clamp01((x-a)/(b-a)); return t*t*(3-2*t); };

export function createStarJourney({scene,camera,star,glows,layers,gasLayers,selectiveBloom,flash,reducedMotion,onArrive,sky=null}) {
  const specs = [
    {object:glows.halo,scale:156,opacity:.22},
    {object:glows.soft,scale:118,opacity:.30},
    {object:glows.main,scale:66,opacity:.80},
    {object:glows.core,scale:18,opacity:1},
  ];
  let startFov=52;
  let starZ = star.position.z; // Nao permitir colidir com o astro.
  const endpoint = new THREE.Vector3(star.position.x,star.position.y,starZ+53);
  const travelDuration = reducedMotion ? 850 : JOURNEY_DURATION;
  const lockDuration = reducedMotion ? 80 : 700;
  const turnDelay=reducedMotion?0:160;
  const lastLight = reducedMotion ? .70 : .77;
  const startPos = new THREE.Vector3();
  const initialQ = new THREE.Quaternion();
  const aimedQ = new THREE.Quaternion();
  const aimM = new THREE.Matrix4();
  const up = new THREE.Vector3(0,1,0);
  const bloomOriginal = selectiveBloom.state.intensity;
  let active=false, completed=false, started=0, progress=0,companionOpacity=1;
  const shaderLayerStrength = gasLayers.map(o => [o, o.material.uniforms.uStrength.value,1]);
  const staticLayerOpacity = layers.filter(o=>o.material?.opacity!==undefined).map(o=>[o,o.material.opacity,1]);
  // Nuvens mascaradas continuam em profundidade, inclusive as distantes.
  // Apenas sua orientação acompanha o olhar: nenhuma fotografia opaca inclinada.
  const cloudPoses=[...new Set([...gasLayers,...layers.filter(o=>o!==sky?.photo&&o.material?.opacity!==undefined)])]
    .map(layer=>({layer,quaternion:new THREE.Quaternion()}));
  const forward=new THREE.Vector3(),offset=new THREE.Vector3();
  const depth=layer=>offset.copy(layer.position).sub(camera.position).dot(forward);
  const visibility=layer=>smooth(depth(layer),6,55);

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

  function setDestination(destination,destinationGlows){
    if(active||completed)return false;
    star=destination;glows=destinationGlows;starZ=star.position.z;
    endpoint.set(star.position.x,star.position.y,starZ+53);
    for(const [i,key] of ['halo','soft','main','core'].entries())specs[i].object=glows[key];
    return true;
  }
  function begin(now=performance.now()) {
    if(active||completed)return false;
    camera.updateWorldMatrix(true,false);
    scene.attach(camera); // Mantem orientacao e posicao antes da viagem.
    camera.updateWorldMatrix(true,false);
    startPos.copy(camera.position);
    initialQ.copy(camera.quaternion);
    startFov=camera.fov;
    sky?.begin();companionOpacity=1;
    // Capturar a pose e a transparência reais: o primeiro quadro não salta.
    forward.set(0,0,-1).applyQuaternion(camera.quaternion);
    for(const pose of cloudPoses)pose.quaternion.copy(pose.layer.quaternion);
    for(const entry of shaderLayerStrength){entry[1]=entry[0].material.uniforms.uStrength.value;entry[2]=visibility(entry[0]);}
    for(const entry of staticLayerOpacity){entry[1]=entry[0].material.opacity;entry[2]=visibility(entry[0]);}
    // Avançar pela linha de mira inicial, sem passar ao lado da estrela e
    // precisar desfazer a rotação perto da chegada. Preserva a folga em Z.
    endpoint.copy(startPos).lerp(star.position,(startPos.z-(starZ+53))/(startPos.z-starZ));
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
    // Primeiro dissipar os destinos restantes, depois orientar, depois avançar.
    // Uma única direção até a chegada, sem oscilação lateral ou contra-curva.
    companionOpacity=reducedMotion?0:1-smoother(elapsed,0,turnDelay);
    const distancePhase=smoother(flight,0,1);
    const x=THREE.MathUtils.lerp(startPos.x,endpoint.x,distancePhase);
    const y=THREE.MathUtils.lerp(startPos.y,endpoint.y,distancePhase);
    camera.position.set(x,y,THREE.MathUtils.lerp(startPos.z,endpoint.z,distancePhase));
    camera.quaternion.slerpQuaternions(initialQ,aimedQ,smoother(elapsed,turnDelay,lockDuration));
    const handoff=smoother(elapsed,0,lockDuration);
    camera.fov=THREE.MathUtils.lerp(startFov,52,handoff)+(reducedMotion?0:4*Math.sin(Math.PI*flight)**2);
    camera.updateProjectionMatrix();
    sky?.update();

    // O céu conserva sua projeção. A profundidade vem das nuvens existentes:
    // elas crescem ao serem aproximadas e cedem a poucos metros da câmera.
    // Não dissipar os recortes distantes na partida: isso esvaziava a viagem.
    forward.set(0,0,-1).applyQuaternion(camera.quaternion);
    const cloudGain=reducedMotion?1:1+1.4*smoother(flight,0,.35);
    for(const {layer,quaternion} of cloudPoses)
      layer.quaternion.slerpQuaternions(quaternion,camera.quaternion,handoff);
    for(const [layer,strength,initialVisibility] of shaderLayerStrength)
      layer.material.uniforms.uStrength.value=strength*cloudGain*clamp01(visibility(layer)/Math.max(1e-6,initialVisibility));
    for(const [layer,alpha,initialVisibility] of staticLayerOpacity){
      if(layer===sky?.photo||layer.position.z<starZ-25)continue;
      layer.material.opacity=Math.min(1,alpha*cloudGain*clamp01(visibility(layer)/Math.max(1e-6,initialVisibility)));
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
    material.opacity=reducedMotion?0:smooth(flight,0,.18)*(.04+.50*smooth(flight,0,.55))*(1-light*.88);
    flash.style.opacity=String(light);
    flash.style.setProperty('--veil-opacity',String(smooth(t,.90,1)));
    if(t>=1 && !completed){
      completed=true;active=false;onArrive();
    }
    return t;
  }
  return {begin,update,setDestination,get active(){return active},get progress(){return progress},get companionOpacity(){return companionOpacity},get streakCount(){return count},get passedLayers(){return gasLayers.filter(x=>camera.position.z<x.position.z).length}};
}
