// Projeto Órion · Observatório em pipeline Vite / Cloudflare Pages.
// Three.js é importado como dependência local e empacotado pelo Vite.
import * as THREE from "three";
import { createCosmicAtmosphere } from './cosmic-atmosphere.js';
import { createSelectiveBloom } from './selective-bloom.js';
import { createStarJourney } from './star-journey.js';
import { createCinematicStarSpikes } from './cinematic-star.js';

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
const params = new URLSearchParams(location.search);
const debugEnabled = params.has('debug');
debug.hidden = !debugEnabled;

// Orçamento de GPU: DPR alto quadruplica os pixels por quadro, e as camadas
// GLSL cobrem a tela toda. A intensidade da arte permanece; varia o custo.
const constrainedDevice = mobile || (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4)
  || (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);
const qualityOverride=params.get('quality');
const initialProfile=qualityOverride==='lite'||qualityOverride==='low'?'lite':
  qualityOverride==='high'?'high':
  qualityOverride==='balanced'?'balanced':constrainedDevice?'lite':'balanced';
const qualityOrder=['lite','balanced','high'];
let qualityMode=initialProfile;
let performanceAdaptations=0;
const qualityPresets={
  lite:{dpr:0.86,maxPixels:1150000,bloomScale:.26,gas:[2],fpsCap:30},
  balanced:{dpr:1,maxPixels:2200000,bloomScale:.34,gas:[0,2],fpsCap:60},
  high:{dpr:1.25,maxPixels:3200000,bloomScale:.42,gas:[0,1,2,3,4],fpsCap:60}
};
function gpuBudget(){return qualityPresets[qualityMode];}
function pixelRatioForViewport(){
  const q=gpuBudget(),native=Math.max(.5,window.devicePixelRatio||1);
  return Math.min(native,q.dpr,Math.sqrt(q.maxPixels/Math.max(1,innerWidth*innerHeight)));
}
const performanceReadout={get mode(){return qualityMode;},
  get pixelRatio(){return renderer.getPixelRatio();},
  get maxPixels(){return gpuBudget().maxPixels;},
  get visibleGas(){return atmosphere.layers.filter(l=>l.visible).length;},
  get adaptations(){return performanceAdaptations;},
  get drawCalls(){return renderer.info.render.calls;},
  get textures(){return renderer.info.memory.textures;}};
if(debugEnabled)window.__orionPerformance=performanceReadout;

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
  renderer = new THREE.WebGLRenderer({ antialias:qualityMode==='high', alpha:true, powerPreference:'high-performance' });
} catch (e) {
  loading.textContent = 'WebGL indisponível neste navegador. Tente no Chrome com aceleração de hardware ativada.';
  throw e;
}
renderer.setPixelRatio(pixelRatioForViewport());
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
  // Alta anisotropia não ajuda planos frontais e adiciona trabalho desnecessário.
  value.anisotropy = 1;
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
const starBackdrop = nebulaPlane('/assets/00-starfield-base.jpg',-700,1,0,0,1.58,-1,2,{name:'00 · Fundo espacial'});
const farCloud = nebulaPlane('/assets/01-nebula-far.webp',-360,.11,0,-5,1.53,1,3072/1152,{name:'01 · Nebulosa distante'});
// A camada distante está atrás da fotografia opaca ESO. Oculte seu draw call.
farCloud.visible=false;
const mainCloud = nebulaPlane('/assets/nebula-eso-photographic.jpg',-540,1,0,-3,1.31,2,5000/1850,{name:'02 · Via Láctea fotográfica · ESO'});
// Apenas iluminação/cor do material; fotografia ESO original segue intacta e nítida.
// Escurecer o fundo gera espaço negativo ao redor do único arauto interativo.
mainCloud.material.color.setRGB(.58,.60,.68);
const midCloud = nebulaPlane('/assets/03-mid-clouds.webp',-155,.031,-2,-4,1.42,3,3072/1152,{name:'03 · Detalhe da nebulosa',additive:true});
const nearCloud = nebulaPlane('/assets/04-front-fog.png',-92,.027,9,-10,1.56,4,2560/960,{name:'04 · Névoa frontal',additive:true});
const dustCloud = nebulaPlane('/assets/05-star-dust.png',-58,.062,0,0,1.62,5,3072/1152,{name:'05 · Poeira estelar',additive:true});
// Estas imagens são véus transparentes: a fotografia ESO, a 100% de
// opacidade, NÃO participa da respiração e nunca tem UV alterado.
const breathingVeils = [
  {mesh:farCloud,base:.11,amp:.045,rate:.43,phase:.5},
  {mesh:midCloud,base:.031,amp:.052,rate:.59,phase:1.8},
  {mesh:nearCloud,base:.027,amp:.048,rate:.49,phase:3.1},
  {mesh:dustCloud,base:.062,amp:.03,rate:.69,phase:2.6}
];
const respirationState={gas:1,star:1,beacon:0};
// Five independent GLSL gas planes in front of the ESO image; no photo blur.
const atmosphere = createCosmicAtmosphere(scene,{reducedMotion:reduceMotion || mobile});
layers.push(...atmosphere.layers);
function applyGasBudget(){
  const enabled=new Set(gpuBudget().gas);
  atmosphere.layers.forEach((mesh,index)=>{
    mesh.visible=enabled.has(index);
  });
}
applyGasBudget();

// Scene inspector: isolate layers without editing code or reloading.
if(debugEnabled){
  const group=document.createElement('fieldset');
  group.className='layer-inspector';
  const title=document.createElement('legend');title.textContent='Camadas da nebulosa';group.appendChild(title);
  for(const layer of layers){
    const row=document.createElement('label');
    row.className='layer-switch';
    const toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=layer.visible;
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
  const twinkleRates = new Float32Array(count);
  const twinkleAmps = new Float32Array(count);
  const twinkleSecondary = new Float32Array(count);
  const colors = new Float32Array(count*3);
  const palette = tint.map(s=>new THREE.Color(s));
  for(let i=0;i<count;i++) {
    const j=i*3;
    positions[j]=(Math.random()-.5)*spanX;
    positions[j+1]=(Math.random()-.5)*spanY;
    positions[j+2]=minZ+Math.random()*(maxZ-minZ);
    sizes[i]=sizeRange[0]+Math.random()*(sizeRange[1]-sizeRange[0]);
    phases[i]=Math.random()*6.283;
    const range=opts.group?{low:.46,high:1.05,min:.04,max:.11}:maxZ<-255
      ?{low:.2,high:.66,min:.035,max:.095}
      :maxZ<-95?{low:.32,high:.91,min:.05,max:.14}
      :{low:.55,high:1.23,min:.07,max:.17};
    twinkleRates[i]=range.low+Math.random()*(range.high-range.low);
    twinkleAmps[i]=range.min+Math.random()*(range.max-range.min);
    twinkleSecondary[i]=Math.random()*6.283;
    const color=palette[Math.floor(Math.random()*palette.length)];
    colors[j]=color.r; colors[j+1]=color.g; colors[j+2]=color.b;
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
  geometry.setAttribute('aPhase',new THREE.BufferAttribute(phases,1));
  geometry.setAttribute('aTwinkleRate',new THREE.BufferAttribute(twinkleRates,1));
  geometry.setAttribute('aTwinkleAmp',new THREE.BufferAttribute(twinkleAmps,1));
  geometry.setAttribute('aTwinkleSecondary',new THREE.BufferAttribute(twinkleSecondary,1));
  geometry.setAttribute('aColor',new THREE.BufferAttribute(colors,3));
  const material=new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    uniforms:{uTime:{value:0},uDpr:{value:Math.min(devicePixelRatio||1,2)},uOpacity:{value:1}},
    vertexShader:`
      attribute float aSize;attribute float aPhase;attribute float aTwinkleRate;attribute float aTwinkleAmp;attribute float aTwinkleSecondary;attribute vec3 aColor;
      uniform float uTime;uniform float uDpr;uniform float uOpacity;
      varying vec3 vColor;varying float vOpacity;
      void main(){
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(aSize*120.0/max(5.0,-mv.z)*uDpr,0.8,8.8);
        vColor=aColor;
        // Estrelas não cintilam em sincronismo. Cada ponto tem frequência,
        // amplitude e segunda fase independente (sem gasto extra de draw calls).
        float low=sin(uTime*aTwinkleRate+aPhase);
        float irregular=sin(uTime*(aTwinkleRate*1.753+.12)+aTwinkleSecondary);
        vOpacity=clamp(.73+low*aTwinkleAmp+irregular*aTwinkleAmp*.46,.43,1.18)*uOpacity;
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
// Aproximadamente 75% menos pontos que a v0.9.1; evitar o aspecto de ruído.
createStars(720,-540,-270,1100,570,[1.9,4.6],['#e5ebff','#90a9f4','#ffe8d3'],{opacity:.56});
createStars(205,-255,-105,510,290,[.95,3.0],['#e5e7ff','#bfb2ff','#ffe5b0'],{opacity:.49});
createStars(65,-95,-15,250,140,[.65,1.7],['#f5f4ff','#b5bdfb','#f9e8ca'],{opacity:.43});
// Poeira discreta perto dos olhos: a perspectiva, nao o CSS, gera parallax.
const foregroundParticles = new THREE.Group();
scene.add(foregroundParticles);
createStars(20,-56,-6,128,72,[.65,1.35],['#d6dfff','#d3baff','#f7eacf'],{group:foregroundParticles,opacity:.12});
if (debugEnabled) {
  window.__orionDepthDebug = { rigRoot, rigYaw, rigPitch, rigRoll, camera, foregroundParticles, layers };
}

// Native Three.js sprites anchored at the same point in space.
const heraldPos = new THREE.Vector3(0, 43, -470);
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
const orbitRing=new THREE.Mesh(new THREE.RingGeometry(7.25,7.28,144),new THREE.MeshBasicMaterial({color:0xe8cf92,transparent:true,opacity:.015,side:THREE.DoubleSide,depthWrite:false,depthTest:false}));
orbitRing.renderOrder=14; heraldGroup.add(orbitRing);
// Halo fotônico raro e suave: não é um círculo de interface ou marcador.
const beaconGlow=addGlow(178,0);
beaconGlow.renderOrder=11;
beaconGlow.layers.enable(1);
// Pontas de difração procedurais, com duas velocidades e sem bloom extra.
const cinematicSpikes=createCinematicStarSpikes(heraldGroup,{reducedMotion:reduceMotion});
// Sprite 3D invisivel na camada 2: area acessivel de mira e click real (Raycaster).
// O HTML continua apenas como alternativa de teclado e touch.
const heraldPickSprite=new THREE.Sprite(new THREE.SpriteMaterial({
 color:0xffffff,transparent:true,opacity:0,depthTest:false,depthWrite:false
}));
heraldPickSprite.scale.setScalar(56);
heraldPickSprite.layers.set(2);
heraldPickSprite.renderOrder=0;
heraldGroup.add(heraldPickSprite);
const starRaycaster=new THREE.Raycaster();
starRaycaster.layers.set(2);
const pointerNdc=new THREE.Vector2();
nebulaStarHalo.layers.enable(1);
softHalo.layers.enable(1);
mainGlow.layers.enable(1);
coreGlow.layers.enable(1);
const selectiveBloom=createSelectiveBloom(renderer,scene,camera,{initial:mobile?.10:.18,reducedMotion:reduceMotion});
if(debugEnabled) {
  window.__orionBloomSliderFactory('Bloom seletivo',selectiveBloom.state.intensity,0,1.5,.05,selectiveBloom.setIntensity);
  window.__orionAtmosphereDebug={atmosphere,selectiveBloom};
  window.__orionRespirationDebug={state:respirationState,veils:breathingVeils,nebula:mainCloud,beaconGlow,heraldGroup};
  window.__orionCinematicDebug={spikes:cinematicSpikes,starsGroup,foregroundParticles};
  delete window.__orionBloomSliderFactory;
}

// The link target is a REAL HTML button anchored to the projection of the
// Three.js object, so mouse, keyboard and touch share the same hit target.
let mouse={x:0,y:0}; let smooth={x:0,y:0}; let selected=false;let jumpStart=0;
let cardVisible=false;
let travelling=false;
// O alvo e a camera usam coordenadas reais de mundo.
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
  flash.style.setProperty('--arrival-x', (x/innerWidth*100).toFixed(2)+'%');
  flash.style.setProperty('--arrival-y', (y/innerHeight*100).toFixed(2)+'%');
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
function isAimedAtStar(clientX,clientY){
  if(travelling)return false;
  pointerNdc.set(clientX/innerWidth*2-1,1-clientY/innerHeight*2);
  camera.updateWorldMatrix(true,false);
  heraldGroup.updateWorldMatrix(true,true);
  starRaycaster.setFromCamera(pointerNdc,camera);
  return starRaycaster.intersectObject(heraldPickSprite,false).length>0;
}
window.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||travelling)return;
  mouse.x=(e.clientX/innerWidth-.5)*2;
  mouse.y=(.5-e.clientY/innerHeight)*2;
  const aimed=isAimedAtStar(e.clientX,e.clientY);
  document.body.classList.toggle('star-aimed',aimed);
  if(cardVisible!==aimed && document.activeElement!==target)setHover(aimed);
},{passive:true});
window.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||travelling||e.button!==0)return;
  if(e.target.closest('a,button,input,.debug'))return;
  if(isAimedAtStar(e.clientX,e.clientY)){e.preventDefault();beginTravel();}
});

// A viagem fica isolada do rig de repouso e so termina no clarão.
const starJourney=createStarJourney({
 scene,camera,star:heraldGroup,
 glows:{halo:nebulaStarHalo,soft:softHalo,main:mainGlow,core:coreGlow},
 layers,gasLayers:atmosphere.layers,selectiveBloom,flash,
 reducedMotion:reduceMotion,
 onArrive:()=>{
   // Relato do trajeto persistido apenas nesta aba para depuração pós-navegação.
   sessionStorage.setItem('orion-last-trip-v09',JSON.stringify({
     passedGasLayers:atmosphere.layers.filter(layer=>camera.position.z<layer.position.z).length,
     endZ:camera.position.z,starZ:heraldGroup.position.z
   }));
   window.location.href='ficha.html';
 }
});
if(debugEnabled)window.__orionStarDebug={journey:starJourney,heraldGroup,heraldPickSprite,raycaster:starRaycaster};
function beginTravel(){
 if(travelling)return;
 if(!starJourney.begin())return;
 travelling=true;
 cardVisible=false;card.classList.remove('visible');card.setAttribute('aria-hidden','true');
 root.classList.add('jumping');
 document.body.classList.remove('star-aimed');
 hint.textContent='Atravessando o véu…';
}
function resize(){
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setPixelRatio(pixelRatioForViewport());
 renderer.setSize(innerWidth,innerHeight);
 selectiveBloom.resize(innerWidth,innerHeight,gpuBudget().bloomScale);
 for(const mesh of layers){
  const dist=26-mesh.position.z; // escala baseada no ponto de observacao inicial
  const h=2*Math.tan(THREE.MathUtils.degToRad(52/2))*dist*mesh.userData.factor;
  mesh.scale.set(h*mesh.userData.aspect,h,1);
 }
 for(const mat of starMaterials)mat.uniforms.uDpr.value=renderer.getPixelRatio();
}
window.addEventListener('resize',resize);resize();

// Quando a GPU ou o renderizador via software não acompanha a tela,
// reduzir a carga automaticamente em vez de insistir em resolução 4x maior.
let renderedAt=0;
let monitorSince=performance.now(),monitorSum=0,monitorFrames=0,slowIntervals=0;
function adaptPerformance(now,frameMs){
  if(travelling||document.hidden||reduceMotion)return;
  monitorSum+=frameMs;monitorFrames++;
  if(now-monitorSince<3000)return;
  const average=monitorSum/Math.max(1,monitorFrames);
  monitorSince=now;monitorSum=0;monitorFrames=0;
  slowIntervals=average>32?slowIntervals+1:Math.max(0,slowIntervals-1);
  if(slowIntervals>=2 && qualityMode!=='lite'){
    qualityMode=qualityOrder[Math.max(0,qualityOrder.indexOf(qualityMode)-1)];
    performanceAdaptations++;
    slowIntervals=0;
    applyGasBudget();resize();
  }
}
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){lastFrame=performance.now();monitorSince=lastFrame;monitorSum=0;monitorFrames=0;}
});
function tick(now){
 requestAnimationFrame(tick);
 if(document.hidden)return;
 const q=gpuBudget();
 // Não desenhar quadros extras em máquinas limitadas.
 if(!travelling && q.fpsCap<60 && renderedAt && now-renderedAt<1000/q.fpsCap-1)return;
 const rawMs=renderedAt?Math.min(100,now-renderedAt):16.67;
 renderedAt=now;
 adaptPerformance(now,rawMs);
 const delta=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 const time=now*.001;
 if(!travelling){
  heraldGroup.position.copy(heraldBasePos);
  starsGroup.position.z=0;
  const inertia=reduceMotion?1:1-Math.pow(.0008,delta);
  smooth.x=THREE.MathUtils.lerp(smooth.x,mouse.x,inertia);
  smooth.y=THREE.MathUtils.lerp(smooth.y,mouse.y,inertia);
  const idle=reduceMotion?0:Math.sin(time*.29)*.23;
  rigRoot.position.set(smooth.x*6.8*perspective,
    smooth.y*4.35*perspective+idle,26+(reduceMotion?0:Math.sin(time*.21)*.25));
  rigYaw.rotation.y=-smooth.x*.068*perspective;
  rigPitch.rotation.x=smooth.y*.052*perspective;
  rigRoll.rotation.z=reduceMotion?0:-smooth.x*.011*perspective+Math.sin(time*.27)*.0015;
  camera.position.z=cardVisible&&!reduceMotion?-.9:0;
  camera.fov=cardVisible&&!reduceMotion?51:52;
  camera.updateProjectionMatrix();
  // Nebulosa: cada véu transparente respira em ritmo próprio, sem mexer na ESO.
  const breathA=reduceMotion?0:Math.sin(time*.42+.6);
  const breathB=reduceMotion?0:Math.sin(time*.24+1.5);
  respirationState.gas=1+.019*breathA+.011*breathB;
  for(const v of breathingVeils){
    const wave=reduceMotion?0:.68*Math.sin(time*v.rate+v.phase)
      +.32*Math.sin(time*v.rate*.57+v.phase*1.73);
    v.mesh.material.opacity=v.base*(1+v.amp*wave+(respirationState.gas-1)*.5);
  }
  // Astro principal: pulsação lenta (8s), microcintilação e farol suave
  // aproximadamente a cada 8,5s. Hover continua respondendo imediatamente.
  const pulse=reduceMotion?0:Math.sin(time*.77+.4);
  const shimmer=reduceMotion?0:.65*Math.sin(time*2.16+1.1)+.35*Math.sin(time*3.24+2.4);
  const beacon=reduceMotion?0:Math.pow(Math.max(0,Math.cos(time*.7392-1.35)),10);
  respirationState.beacon=beacon;
  respirationState.star=1+.028*pulse+.013*shimmer;
  const emphasized=cardVisible?1.22:1;
  nebulaStarHalo.scale.setScalar(156*(respirationState.star+.055*beacon)*emphasized);
  softHalo.scale.setScalar(118*(1+.034*pulse+.045*beacon)*emphasized);
  mainGlow.scale.setScalar(66*(1+.048*pulse+.022*shimmer+.075*beacon)*emphasized);
  coreGlow.scale.setScalar(18*(1+.026*shimmer)*(cardVisible?1.18:1));
  // O astro deve comandar o olhar sem espalhar luz por toda a composição.
  nebulaStarHalo.material.opacity=.075+(cardVisible?.045:0)+.012*pulse+.028*beacon;
  softHalo.material.opacity=.13+(cardVisible?.085:0)+.012*pulse+.024*beacon;
  mainGlow.material.opacity=.48+(cardVisible?.19:0)+.015*shimmer+.040*beacon;
  coreGlow.material.opacity=.94;
  beaconGlow.scale.setScalar(154+42*beacon);
  beaconGlow.material.opacity=.046*beacon*(cardVisible?1.55:1);
  orbitRing.material.opacity=0;
  flash.style.opacity='0';
  flash.style.setProperty('--veil-opacity','0');
 } else {
  beaconGlow.visible=false;
  starJourney.update(now,delta);
 }
 for(const mat of starMaterials){
   mat.uniforms.uTime.value=reduceMotion?0:time;
   mat.uniforms.uOpacity.value=mat.userData.baseOpacity*(travelling?1.24:1);
 }
 cinematicSpikes.update(time,cardVisible,travelling);
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
