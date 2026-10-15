// Projeto Órion · Observatório em pipeline Vite / Cloudflare Pages.
// Three.js é importado como dependência local e empacotado pelo Vite.
import * as THREE from "three";
import { createCosmicAtmosphere } from './cosmic-atmosphere.js';
import { createSelectiveBloom } from './selective-bloom.js';

const root = document.getElementById('observatory');
const container = document.getElementById('world');
const target = document.getElementById('heraldTarget');
const card = document.getElementById('heraldCard');
const hint = document.getElementById('hint');
const notice = document.getElementById('notice');
const loading = document.getElementById('loading');
const flash = document.getElementById('arrivalFlash');
const debug = document.getElementById('debug');
const depthInput = document.getElementById('depth');
const depthValue = document.getElementById('depthValue');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(pointer: coarse)').matches;
let perspective = Number(new URLSearchParams(location.search).get('depth') || 1);
if (!Number.isFinite(perspective)) perspective = 1;
perspective = THREE.MathUtils.clamp(perspective, .5, 2.5);
depthInput.value = String(perspective);
depthValue.textContent = perspective.toFixed(1).replace('.', ',') + '×';
const debugEnabled = new URLSearchParams(location.search).has('debug');
debug.hidden = !debugEnabled;

let noticeTimer = 0;
function announce(message) {
  notice.textContent = message;
  notice.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.hidden = true; }, 5500);
}
document.getElementById('leave').addEventListener('click', () => announce('Protótipo visual: não há conta conectada para sair.'));
depthInput.addEventListener('input', () => {
  perspective = Number(depthInput.value);
  depthValue.textContent = perspective.toFixed(1).replace('.', ',') + '×';
});
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'd' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) debug.hidden = !debug.hidden;
});

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
} catch (e) {
  loading.textContent = 'WebGL indisponível neste navegador. Tente no Chrome com aceleração de hardware ativada.';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.24;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.2, 900);
// Camera em um rig 3D: translacao, yaw, pitch e roll independentes.
const rigRoot = new THREE.Group();
const rigYaw = new THREE.Group();
const rigPitch = new THREE.Group();
const rigRoll = new THREE.Group();
scene.add(rigRoot);
rigRoot.add(rigYaw);
rigYaw.add(rigPitch);
rigPitch.add(rigRoll);
rigRoll.add(camera);
rigRoot.position.set(0, 0, 26);
camera.position.set(0, 0, 0);

// Panorama and foreground cloud fragments occupy actual z positions, rather
// than being DOM images shifted at different speeds. This makes camera motion
// cause the parallax naturally, including perspective and vanishing point.
const textures = [];
const layers = [];
const loader = new THREE.TextureLoader();
function tex(url) {
  const value = loader.load(url, undefined, undefined, err => console.warn('[nebula]', url, err));
  value.colorSpace = THREE.SRGBColorSpace;
  value.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
  value.minFilter = THREE.LinearMipmapLinearFilter;
  value.magFilter = THREE.LinearFilter;
  value.generateMipmaps = true;
  textures.push(value);
  return value;
}
// Five independent nebula planes and a deep-space star image.
// Source layer specs are documented in manifest-camadas.json.
function nebulaPlane(file, z, opacity, x, y, factor, order, aspect=2048/768, options={}) {
  const material=new THREE.MeshBasicMaterial({
    map:tex(file), transparent:true, opacity,
    depthTest:false, depthWrite:false, toneMapped:false, side:THREE.DoubleSide,
    blending:options.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1,1), material);
  mesh.position.set(x,y,z);
  mesh.renderOrder=order;
  mesh.userData.factor=factor;
  mesh.userData.aspect=aspect;
  mesh.userData.layerName=options.name||file.split('/').pop();
  scene.add(mesh);layers.push(mesh);return mesh;
}
const starBackdrop = nebulaPlane('/assets/00-starfield-base.jpg',-520,1,0,0,1.58,-1,2,{name:'00 · Fundo espacial'});
const farCloud = nebulaPlane('/assets/01-nebula-far.webp',-360,.11,0,-5,1.53,1,3072/1152,{name:'01 · Nebulosa distante'});
const mainCloud = nebulaPlane('/assets/nebula-eso-photographic.jpg',-250,1,0,-3,1.31,2,5000/1850,{name:'02 · Via Láctea fotográfica · ESO'});
const midCloud = nebulaPlane('/assets/03-mid-clouds.webp',-155,.065,-2,-4,1.42,3,3072/1152,{name:'03 · Detalhe da nebulosa',additive:true});
const nearCloud = nebulaPlane('/assets/04-front-fog.png',-92,.06,9,-10,1.56,4,2560/960,{name:'04 · Névoa frontal',additive:true});
const dustCloud = nebulaPlane('/assets/05-star-dust.png',-58,.18,0,0,1.62,5,3072/1152,{name:'05 · Poeira estelar',additive:true});

// Five independent GLSL gas planes in front of the ESO image; no photo blur.
const atmosphere = createCosmicAtmosphere(scene,{reducedMotion:reduceMotion || mobile});
layers.push(...atmosphere.layers);

// Scene inspector: isolate layers without editing code or reloading.
if(debugEnabled){
  const group=document.createElement('fieldset');
  group.className='layer-inspector';
  const title=document.createElement('legend');title.textContent='Camadas da nebulosa';group.appendChild(title);
  for(const layer of layers){
    const row=document.createElement('label');
    row.className='layer-switch';
    const toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=true;
    toggle.addEventListener('change',()=>{layer.visible=toggle.checked;});
    const span=document.createElement('span');span.textContent=layer.userData.layerName;
    row.append(toggle,span);group.appendChild(row);
  }
  debug.appendChild(group);
  const controls=document.createElement('fieldset');
  controls.className='layer-inspector';
  controls.innerHTML='<legend>Nebulosa Viva</legend>';
  const addSlider=(name,initial,min,max,step,callback)=>{
    const line=document.createElement('label');line.className='atmosphere-slider';
    const caption=document.createElement('span');caption.textContent=name;
    const output=document.createElement('output');output.textContent=Number(initial).toFixed(2);
    const input=document.createElement('input');input.type='range';
    input.min=String(min);input.max=String(max);input.step=String(step);input.value=String(initial);
    input.setAttribute('aria-label',name);
    input.addEventListener('input',()=>{
      const value=Number(input.value);output.textContent=value.toFixed(2);callback(value);
    });
    line.append(caption,output,input);controls.appendChild(line);
  };
  addSlider('Densidade do gás',atmosphere.state.density,0,1.5,.05,atmosphere.setDensity);
  addSlider('Fluxo orgânico',atmosphere.state.flow,0,1,.05,atmosphere.setFlow);
  window.__orionBloomSliderFactory=addSlider;
  debug.appendChild(controls);
}

// Spatial starfield in three actual depth ranges, one GPU draw call per range.
const starMaterials=[];
const starsGroup=new THREE.Group();
scene.add(starsGroup);
function createStars(count,minZ,maxZ,spanX,spanY,sizeRange,tint,opts={}) {
  const positions = new Float32Array(count*3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const colors = new Float32Array(count*3);
  const palette = tint.map(s=>new THREE.Color(s));
  for(let i=0;i<count;i++) {
    const j=i*3;
    positions[j]=(Math.random()-.5)*spanX;
    positions[j+1]=(Math.random()-.5)*spanY;
    positions[j+2]=minZ+Math.random()*(maxZ-minZ);
    sizes[i]=sizeRange[0]+Math.random()*(sizeRange[1]-sizeRange[0]);
    phases[i]=Math.random()*6.283;
    const color=palette[Math.floor(Math.random()*palette.length)];
    colors[j]=color.r; colors[j+1]=color.g; colors[j+2]=color.b;
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
  geometry.setAttribute('aPhase',new THREE.BufferAttribute(phases,1));
  geometry.setAttribute('aColor',new THREE.BufferAttribute(colors,3));
  const material=new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    uniforms:{uTime:{value:0},uDpr:{value:Math.min(devicePixelRatio||1,2)},uOpacity:{value:1}},
    vertexShader:`
      attribute float aSize;attribute float aPhase;attribute vec3 aColor;
      uniform float uTime;uniform float uDpr;uniform float uOpacity;
      varying vec3 vColor;varying float vOpacity;
      void main(){
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(aSize*120.0/max(5.0,-mv.z)*uDpr,0.8,8.8);
        vColor=aColor;
        vOpacity=(0.67+0.27*sin(uTime*0.75+aPhase))*uOpacity;
      }`,
    fragmentShader:`
      varying vec3 vColor;varying float vOpacity;
      void main(){
        float r=length(gl_PointCoord-vec2(.5));
        float alpha=(1.0-smoothstep(.1,.48,r))*vOpacity;
        gl_FragColor=vec4(vColor,alpha);
      }`,
  });
  material.userData.baseOpacity = opts.opacity ?? 1;
  starMaterials.push(material);
  (opts.group || starsGroup).add(new THREE.Points(geometry,material));
}
createStars(2700,-540,-270,1100,570,[2.6,6.5],['#e5ebff','#90a9f4','#ffe8d3']);
createStars(860,-255,-105,510,290,[1.2,4.1],['#e5e7ff','#bfb2ff','#ffe5b0']);
createStars(360,-95,-15,250,140,[.75,2.6],['#f5f4ff','#b5bdfb','#f9e8ca']);
// Poeira discreta perto dos olhos: a perspectiva, nao o CSS, gera parallax.
const foregroundParticles = new THREE.Group();
scene.add(foregroundParticles);
createStars(200,-56,-6,128,72,[.65,1.75],['#d6dfff','#d3baff','#f7eacf'],{group:foregroundParticles,opacity:.27});
if (debugEnabled) {
  window.__orionDepthDebug = { rigRoot, rigYaw, rigPitch, rigRoll, camera, foregroundParticles, layers };
}

// Native Three.js sprites anchored at the same point in space.
const heraldPos = new THREE.Vector3(0, 14, -138);
const heraldBasePos = heraldPos.clone();
const heraldGroup = new THREE.Group();
heraldGroup.position.copy(heraldPos);
scene.add(heraldGroup);
function glowTexture() {
  const c=document.createElement('canvas');c.width=c.height=512;
  const g=c.getContext('2d');
  const r=g.createRadialGradient(256,256,5,256,256,245);
  r.addColorStop(0,'rgba(255,255,255,1)');
  r.addColorStop(.03,'rgba(255,252,233,1)');
  r.addColorStop(.08,'rgba(255,222,158,.87)');
  r.addColorStop(.18,'rgba(249,209,133,.34)');
  r.addColorStop(.42,'rgba(225,190,122,.105)');
  r.addColorStop(1,'rgba(215,185,140,0)');
  g.fillStyle=r;g.fillRect(0,0,512,512);
  const flares=[
    [0,1.4,190],[1.4,0,192],[-.7,.7,96],[.7,.7,96]
  ];
  g.save();g.translate(256,256);
  for(const [dx,dy,len] of flares){
    const length=Math.hypot(dx,dy);const vx=dx/length,vy=dy/length;
    for(const s of [-1,1]){
      const grad=g.createLinearGradient(0,0,vx*len*s,vy*len*s);
      grad.addColorStop(0,'rgba(255,250,237,.7)');grad.addColorStop(1,'rgba(255,250,237,0)');
      g.strokeStyle=grad;g.lineWidth=dx===0||dy===0?1.6:.7;
      g.beginPath();g.moveTo(0,0);g.lineTo(vx*len*s,vy*len*s);g.stroke();
    }
  }
  g.restore();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const heraldTex=glowTexture();
function addGlow(scale,alpha) {
  const material=new THREE.SpriteMaterial({map:heraldTex,transparent:true,opacity:alpha,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,toneMapped:false});
  const sprite=new THREE.Sprite(material);sprite.scale.set(scale,scale,1);sprite.renderOrder=12;heraldGroup.add(sprite);return sprite;
}
const nebulaStarHalo=new THREE.Sprite(new THREE.SpriteMaterial({
  map:tex('/assets/06-star-glow.png'),transparent:true,opacity:.16,
  blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false
}));
nebulaStarHalo.scale.set(60,60,1);
nebulaStarHalo.renderOrder=10;
heraldGroup.add(nebulaStarHalo);
const softHalo=addGlow(47,.25);
const mainGlow=addGlow(22,.8);
const coreGlow=addGlow(7,1);
const orbitRing=new THREE.Mesh(new THREE.RingGeometry(7.25,7.28,144),new THREE.MeshBasicMaterial({color:0xe8cf92,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false,depthTest:false}));
orbitRing.renderOrder=14; heraldGroup.add(orbitRing);
nebulaStarHalo.layers.enable(1);
softHalo.layers.enable(1);
mainGlow.layers.enable(1);
coreGlow.layers.enable(1);
const selectiveBloom=createSelectiveBloom(renderer,scene,camera,{initial:mobile?.28:.48,reducedMotion:reduceMotion});
if(debugEnabled) {
  window.__orionBloomSliderFactory('Bloom seletivo',selectiveBloom.state.intensity,0,1.5,.05,selectiveBloom.setIntensity);
  window.__orionAtmosphereDebug={atmosphere,selectiveBloom};
  delete window.__orionBloomSliderFactory;
}

// The link target is a REAL HTML button anchored to the projection of the
// Three.js object, so mouse, keyboard and touch share the same hit target.
let mouse={x:0,y:0}; let smooth={x:0,y:0}; let selected=false;let jumpStart=0;
let cardVisible=false;let travelStart,travelVector;
let travelling=false;
let cachedLookTarget = new THREE.Vector3();
let lastFrame=performance.now();
let blink=0;
const projected=new THREE.Vector3();
const targetXY={x:innerWidth*.5,y:innerHeight*.30};
function updateTargetScreen() {
  projected.copy(heraldPos).project(camera);
  const x=(projected.x*.5+.5)*innerWidth;
  const y=(-projected.y*.5+.5)*innerHeight;
  if(!Number.isFinite(x)||!Number.isFinite(y))return;
  targetXY.x=x;targetXY.y=y;
  target.style.left=x+'px';target.style.top=y+'px';
  const width=265;
  const cardX=(x+170+width < innerWidth-15)?x+119:x-150-width;
  const cardY=THREE.MathUtils.clamp(y-93,110,Math.max(112,innerHeight-card.offsetHeight-18));
  card.style.left=THREE.MathUtils.clamp(cardX,12,innerWidth-width-12)+'px';
  card.style.top=cardY+'px';
}
function setHover(state) {
  if(travelling)return;
  cardVisible=state;
  card.classList.toggle('visible',state);
  card.setAttribute('aria-hidden',String(!state));
  hint.textContent=state?'Nox · Clique para atravessar o véu':'Concentre seu olhar sobre uma estrela';
}
target.addEventListener('mouseenter',()=>{if(!mobile)setHover(true)});
target.addEventListener('mouseleave',()=>{if(!mobile)setHover(false)});
target.addEventListener('focus',()=>setHover(true));
target.addEventListener('blur',()=>{if(!mobile)setHover(false)});
const armClick=(e)=>{
  if(travelling)return;
  if((mobile||e.detail===0)&&!cardVisible){setHover(true);return;}
  beginTravel();
};
target.addEventListener('click',armClick);
window.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  mouse.x=(e.clientX/innerWidth-.5)*2;
  mouse.y=(.5-e.clientY/innerHeight)*2;
},{passive:true});

// Hiperespaço: linhas de warp presas à câmera para uma sensação mais forte de aceleração.
const warpCount=1200;
const warpGeometry=new THREE.BufferGeometry();
const warpCoords=new Float32Array(warpCount*2*3);
const warpColors=new Float32Array(warpCount*2*3);
const warpRadius=new Float32Array(warpCount);
const warpAngle=new Float32Array(warpCount);
const warpDepth=new Float32Array(warpCount);
const palette=[new THREE.Color('#d1dcff'),new THREE.Color('#fce5bd'),new THREE.Color('#b69bff')];
for(let i=0;i<warpCount;i++){
 const angle=Math.random()*Math.PI*2;
 const radius=4+Math.random()*118;
 const depth=80+Math.random()*260;
 warpRadius[i]=radius;warpAngle[i]=angle;warpDepth[i]=depth;
 const x0=Math.cos(angle)*radius*0.035,y0=Math.sin(angle)*radius*0.024,z0=-10-Math.random()*18;
 const x1=Math.cos(angle)*radius,y1=Math.sin(angle)*radius*0.72,z1=-depth;
 const a=i*6;warpCoords[a]=x0;warpCoords[a+1]=y0;warpCoords[a+2]=z0;
 warpCoords[a+3]=x1;warpCoords[a+4]=y1;warpCoords[a+5]=z1;
 const c=palette[i%3];
 for(let k=0;k<2;k++) {warpColors[a+k*3]=c.r;warpColors[a+k*3+1]=c.g;warpColors[a+k*3+2]=c.b;}
}
warpGeometry.setAttribute('position',new THREE.BufferAttribute(warpCoords,3));
warpGeometry.setAttribute('color',new THREE.BufferAttribute(warpColors,3));
const warpMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false});
const warpLines=new THREE.LineSegments(warpGeometry,warpMat);
warpLines.visible=false;warpLines.renderOrder=18;warpLines.position.set(0,0,-4);camera.add(warpLines);
function beginTravel(){
 // Camera deixa o rig preservando seu estado em coordenadas mundiais.
 camera.updateWorldMatrix(true,false);
 scene.attach(camera);
 travelling=true;setHover(true);root.classList.add('jumping');
 hint.textContent='Atravessando o véu…';
 jumpStart=performance.now();travelStart=camera.position.clone();
 travelVector=heraldPos.clone().sub(travelStart).normalize();
 warpLines.visible=true;warpLines.scale.set(1,1,1);warpLines.position.set(0,0,-4);
}
function resize(){
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 selectiveBloom.resize(innerWidth,innerHeight);
 for(const mesh of layers){
  const dist=26-mesh.position.z; // escala baseada no ponto de observacao inicial
  const h=2*Math.tan(THREE.MathUtils.degToRad(52/2))*dist*mesh.userData.factor;
  mesh.scale.set(h*mesh.userData.aspect,h,1);
 }
 for(const mat of starMaterials)mat.uniforms.uDpr.value=Math.min(devicePixelRatio||1,2);
}
window.addEventListener('resize',resize);resize();

function tick(now){
 requestAnimationFrame(tick);
 const delta=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 const time=now*.001;
 if(!travelling){
  heraldGroup.position.copy(heraldBasePos);
  nebulaStarHalo.scale.set(52,52,1);
  orbitRing.material.opacity=.12;
  warpLines.visible=false;
  starsGroup.position.z = 0;
  const inertia=reduceMotion?1:1-Math.pow(.0008,delta);
  smooth.x=THREE.MathUtils.lerp(smooth.x,mouse.x,inertia);
  smooth.y=THREE.MathUtils.lerp(smooth.y,mouse.y,inertia);
  const idle=reduceMotion?0:Math.sin(time*.29)*.23;
  // Translada e rotaciona o olhar com suavizacao; ha profundidade real.
  rigRoot.position.set(smooth.x*6.8*perspective,
    smooth.y*4.35*perspective+idle,26+(reduceMotion?0:Math.sin(time*.21)*.25));
  rigYaw.rotation.y = -smooth.x*.068*perspective;
  rigPitch.rotation.x = smooth.y*.052*perspective;
  rigRoll.rotation.z = reduceMotion?0:-smooth.x*.011*perspective+Math.sin(time*.27)*.0015;
  camera.position.z = cardVisible && !reduceMotion ? -.9 : 0;
  camera.fov=cardVisible && !reduceMotion?51:52;
  camera.updateProjectionMatrix();
  mainGlow.material.opacity=.76+(cardVisible?.09:0)+(reduceMotion?0:Math.sin(time*1.6)*.045);
  softHalo.material.opacity=.22+(cardVisible?.09:0);
  coreGlow.material.opacity=.97+(cardVisible?.05:0);
  nebulaStarHalo.material.opacity=.16+(cardVisible?.06:0);
  mainGlow.scale.setScalar(18.5+(cardVisible?2.5:0));
  softHalo.scale.setScalar(39+(cardVisible?4.5:0));
  coreGlow.scale.setScalar(6.1+(cardVisible?.8:0));
  flash.style.opacity='0';
 }else{
  const t=Math.min(1,(now-jumpStart)/(reduceMotion?320:1620));
  const phaseA=Math.min(1,t/.7);
  const phaseB=Math.max(0,(t-.62)/.38);
  const easeA=1-Math.pow(1-phaseA,3);
  const easeB=phaseB*phaseB*(3-2*phaseB);
  const driftX=(reduceMotion?0:Math.sin(t*18)*1.2*(1-phaseB));
  const driftY=(reduceMotion?0:Math.cos(t*21)*.55*(1-phaseB));
  const targetX=THREE.MathUtils.lerp(travelStart.x, 0, easeA*.38)+driftX;
  const targetY=THREE.MathUtils.lerp(travelStart.y, 1.6, easeA*.3)+driftY;
  const targetZ=THREE.MathUtils.lerp(travelStart.z, -132, easeA);
  camera.position.set(targetX,targetY,targetZ);
  cachedLookTarget.set(0, 12, -340);
  camera.lookAt(cachedLookTarget);
  if(!reduceMotion) camera.rotateZ(Math.sin(t*30)*0.006*(1-easeB));
  camera.fov=52+22*phaseA+16*easeB;camera.updateProjectionMatrix();
  // Estrela continua distante: o glow cresce mais do que o objeto se aproxima.
  heraldGroup.position.set(0, 14 + easeB*1.0, THREE.MathUtils.lerp(heraldBasePos.z, -220, easeA*.84));
  nebulaStarHalo.scale.setScalar(52 + 8*phaseA + 128*easeB);
  nebulaStarHalo.material.opacity=.18 + .08*phaseA + .5*easeB;
  softHalo.scale.setScalar(39 + 10*phaseA + 250*easeB);
  mainGlow.scale.setScalar(18.5 + 4*phaseA + 135*easeB);
  coreGlow.scale.setScalar(6.1 + 1.8*phaseA + 34*easeB);
  softHalo.material.opacity=.24 + .18*phaseA + .34*easeB;
  mainGlow.material.opacity=.8 + .11*phaseA + .24*easeB;
  coreGlow.material.opacity=.98 + .28*easeB;
  orbitRing.material.opacity=.12*(1-easeB);
  // Warp locked to the camera for stronger hyperspace.
  warpLines.visible=true;
  warpLines.position.z = -4 - phaseA*6;
  warpLines.scale.set(1 + .45*phaseA, 1 + .45*phaseA, 1 + 7.5*phaseA + 3.5*Math.sin(t*18)*(1-phaseB));
  warpLines.rotation.z = time*0.11;
  warpMat.opacity=reduceMotion?0:(.18 + .82*phaseA)*(1-easeB*.86);
  // Give some extra dynamism to stars during travel.
  starsGroup.position.z = -20*phaseA;
  flash.style.opacity=String(THREE.MathUtils.clamp((t-.70)/.20,0,1)*0.95);
  if(t>=1){window.location.href='ficha.html';return;}
 }
 orbitRing.rotation.z=time*.04;
 for(const mat of starMaterials){mat.uniforms.uTime.value=time;mat.uniforms.uOpacity.value=mat.userData.baseOpacity*(travelling?1.25:1);}
 camera.updateWorldMatrix(true,false);
 updateTargetScreen();
 atmosphere.update(time);
 selectiveBloom.render();
}
requestAnimationFrame(tick);
document.documentElement.dataset.sceneReady='1';
loading.classList.add('done');

// Catch texture loading errors without hiding the fact that WebGL is active.
// Press D or use ?debug=1 to compare stronger camera perspective values.
