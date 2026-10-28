// Projeto Órion · Observatório em pipeline Vite / Cloudflare Pages.
// Three.js é importado como dependência local e empacotado pelo Vite.
import * as THREE from "three";
import { createCosmicAtmosphere } from './cosmic-atmosphere.js';
import { createSelectiveBloom } from './selective-bloom.js';
import { createDistantSky } from './distant-sky.js';
import { createStarJourney } from './star-journey.js';
import { createStarSelection } from './star-selection.js';
import { createCinematicStarSpikes } from './cinematic-star.js';
import { createNebulaVolume } from './nebula-volume.js';
import { createPerformancePanel } from './performance-panel.js';
import { createFirstPersonHands } from './first-person-hands.js';
import { createFirstPersonHands3D } from './first-person-hands-3d.js';
import { createRiggedFirstPersonHands } from './first-person-hands-rig.js';
import { createVrFirstPersonHands } from './first-person-hands-vr.js';
import { createFpsFirstPersonHands } from './first-person-hands-fps.js';
import { createEtherealHandsOverlay } from './first-person-hands-overlay.js';
import { createEtherealHandsMesh } from './first-person-hands-mesh.js';
import { getHeralds, getHeraldLayout, arrivalURL } from './herald-catalog.js';
import { createPageTransition, revealPage } from './page-transition.js';
import { createHeraldCreation } from './herald-creation.js';
import { createCreationNebula, creationNebulaURL, CREATION_ART } from './creation-cinematic.js';
import { createTouchNavigation } from './touch-navigation.js';
import { createMobileConstellation, mobileHeraldLayout } from './mobile-constellation.js';

const root = document.getElementById('observatory');
const creationPage=document.body.dataset.page==='creation';
let creation=null;
const container = document.getElementById('world');
let target = document.getElementById('heraldTarget');
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
root.dataset.input=mobile?'touch':'pointer';
const idleHint=mobile?'Toque na estrela para conhecer':'Concentre seu olhar sobre uma estrela';
hint.textContent=idleHint;
let perspective = Number(new URLSearchParams(location.search).get('depth') || 1);
if (!Number.isFinite(perspective)) perspective = 1;
perspective = THREE.MathUtils.clamp(perspective, .5, 2.5);
depthInput.value = String(perspective);
depthValue.textContent = perspective.toFixed(1).replace('.', ',') + '×';
const params = new URLSearchParams(location.search);
const debugEnabled = params.has('debug');
const depthMotionEnabled=params.get('depthMotion')!=='off';
const foregroundEnabled=params.get('foreground')!=='off';
// Mãos compactas no toque; ?hands=off preserva a alternativa sem viewmodel.
// Rig artístico CC0 padrão; ?hands=3d conserva modelo anterior e ?hands=2d o plano.
const handsSetting=params.get('hands');
const handsEnabled=['on','fps','vr','rig','3d','2d'].includes(handsSetting)||['overlay','mesh'].includes(handsSetting)||handsSetting!=='off';
// Nova prévia de arte anatômica: WRAD retrô continua disponível apenas via ?hands=rig.
const handsMode=handsSetting==='2d'?'2d':handsSetting==='3d'?'3d':handsSetting==='rig'?'rig':handsSetting==='vr'?'vr':handsSetting==='fps'?'fps':handsSetting==='overlay'?'overlay':'mesh';
const fpsHandsCredit=document.getElementById('fpsHandsCredit');
if(fpsHandsCredit)fpsHandsCredit.hidden=!handsEnabled||handsMode!=='fps';
debug.hidden = !debugEnabled;

// Orçamento de GPU: DPR alto quadruplica os pixels por quadro, e as camadas
// GLSL cobrem a tela toda. A intensidade da arte permanece; varia o custo.
const constrainedDevice = mobile || (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4)
  || (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);
const qualityOverride=params.get('quality');
const manualQuality=['eco','eco-plus','lite','low','balanced','high'].includes(qualityOverride);
const effectsMode=['no-bloom','no-gas'].includes(params.get('effects'))?params.get('effects'):'normal';
const initialProfile=qualityOverride==='eco'?'eco':
  qualityOverride==='eco-plus'?'eco-plus':
  qualityOverride==='lite'||qualityOverride==='low'?'lite':
  qualityOverride==='high'?'high':
  qualityOverride==='balanced'?'balanced':constrainedDevice?'lite':'balanced';
const qualityOrder=['eco','eco-plus','lite','balanced','high'];
let qualityMode=initialProfile;
let performanceAdaptations=0;
const qualityPresets={
  // Eco mantém a ESO e dois recortes em profundidade, mas reduz pixels e
  // elimina o fBm de tela cheia/bloom durante o repouso.
  eco:{dpr:.53,maxPixels:500000,bloomScale:.20,gas:[],fpsCap:60},
  // Intermediário: 32% mais pixels que o Eco, gás procedural desativado,
  // bloom preservado. Isola custo de resolução no comparativo A/B.
  'eco-plus':{dpr:.60,maxPixels:670000,bloomScale:.22,gas:[],fpsCap:60},
  lite:{dpr:.75,maxPixels:950000,bloomScale:.24,gas:[2],fpsCap:60},
  balanced:{dpr:1,maxPixels:2200000,bloomScale:.34,gas:[0,2],fpsCap:60},
  high:{dpr:1.25,maxPixels:3200000,bloomScale:.42,gas:[0,1,2,3,4],fpsCap:60}
};
function gpuBudget(){return qualityPresets[qualityMode];}
function pixelRatioForViewport(){
  const q=gpuBudget(),native=Math.max(.5,window.devicePixelRatio||1);
  // Keep the creation's fine inscriptions/contours at CSS-pixel resolution.
  // Explicit quality profiles retain their original budget; the observatory is unchanged.
  if(creationPage&&!manualQuality)return Math.min(native,1.25,Math.sqrt(2200000/Math.max(1,innerWidth*innerHeight)));
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
  renderer = new THREE.WebGLRenderer({ antialias:creationPage||qualityMode==='high', alpha:true, powerPreference:'high-performance' });
} catch (e) {
  loading.textContent = 'WebGL indisponível neste navegador. Tente no Chrome com aceleração de hardware ativada.';
  throw e;
}
renderer.setPixelRatio(pixelRatioForViewport());
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.24;
// A cena usa bloom + render principal + overlay no mesmo quadro.
// Impedir reset entre passes; reiniciar contadores uma vez por tick.
renderer.info.autoReset=false;
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
// Viewmodel em espaço de câmera: presença de primeira pessoa sem alterar
// o mundo 3D, a paralaxe ESO ou o pós-processamento do Nox.
const firstPersonHands=handsMode==='mesh'
  ?createEtherealHandsMesh(camera,{enabled:handsEnabled,reducedMotion:reduceMotion,
    animation:['mesh','rig','perspective'].includes(params.get('handsMotion'))?params.get('handsMotion'):'perspective',
    touchLayout:mobile})
  :handsMode==='overlay'
  ?createEtherealHandsOverlay(root,{enabled:handsEnabled,reducedMotion:reduceMotion})
  :handsMode==='2d'
  ?createFirstPersonHands(camera,{enabled:handsEnabled,reducedMotion:reduceMotion})
  :handsMode==='3d'
    ?createFirstPersonHands3D(camera,{enabled:handsEnabled,reducedMotion:reduceMotion})
    :handsMode==='rig'
      ?createRiggedFirstPersonHands(camera,{enabled:handsEnabled,reducedMotion:reduceMotion})
      :handsMode==='vr'
        ?createVrFirstPersonHands(camera,{enabled:handsEnabled,reducedMotion:reduceMotion})
        :createFpsFirstPersonHands(camera,{enabled:handsEnabled,reducedMotion:reduceMotion});
firstPersonHands.state.mode=handsMode;
if(debugEnabled)window.__orionHandsDebug=firstPersonHands;

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
// Esta imagem adiciona milhares de pontinhos fora da nebulosa ESO.
// A nova composição prefere o vazio escuro, preservando o arquivo original.
starBackdrop.visible=false;
const farCloud = nebulaPlane('/assets/01-nebula-far.webp',-360,.11,0,-5,1.53,1,3072/1152,{name:'01 · Nebulosa distante'});
// A camada distante está atrás da fotografia opaca ESO. Oculte seu draw call.
farCloud.visible=false;
const mainCloud = nebulaPlane(creationPage?creationNebulaURL():'/assets/nebula-eso-photographic.jpg',-540,1,0,-3,1.31,2,creationPage?16/9:5000/1850,{name:creationPage?'Interior da nebulosa':'02 · Via Láctea fotográfica · ESO'});
// Apenas iluminação/cor do material; fotografia ESO original segue intacta e nítida.
// Escurecer o fundo gera espaço negativo ao redor do único arauto interativo.
mainCloud.material.color.setRGB(.43,.46,.53);
if(creationPage)mainCloud.material.color.setRGB(.55,.56,.68);
const distantSky=createDistantSky(mainCloud,camera);
const midCloud = nebulaPlane('/assets/03-mid-clouds.webp',-155,.031,-2,-4,1.42,3,3072/1152,{name:'03 · Detalhe da nebulosa',additive:true});
const nearCloud = nebulaPlane('/assets/04-front-fog.png',-92,.027,9,-10,1.56,4,2560/960,{name:'04 · Névoa frontal',additive:true});
const dustCloud = nebulaPlane('/assets/05-star-dust.png',-58,.062,0,0,1.62,5,3072/1152,{name:'05 · Poeira estelar',additive:true});
// Transparências de poeira têm centenas de pontos pré-rasterizados;
// escondê-las é essencial para o vazio, além de reduzir draw calls.
dustCloud.visible=false;
// Estas imagens são véus transparentes: a fotografia ESO, a 100% de
// opacidade, NÃO participa da respiração. Seus UVs ficam intactos no repouso;
// somente a viagem ativa a projeção panorâmica.
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
// 6 regiões recortadas da própria fotografia ESO, sobrepostas em Z.
// Sem mais estrelas ou efeitos de tela inteira.
if(creationPage){for(const v of breathingVeils)v.mesh.visible=false;}
const volumeOptions={reducedMotion:reduceMotion||mobile,parallaxEnabled:depthMotionEnabled,foregroundEnabled};
const nebulaVolume=creationPage?createCreationNebula(scene,mainCloud,volumeOptions):createNebulaVolume(scene,mainCloud,volumeOptions);
layers.push(...nebulaVolume.layers);
function applyGasBudget(){
  const enabled=new Set(creationPage||effectsMode==='no-gas'?[]:gpuBudget().gas);
  atmosphere.layers.forEach((mesh,index)=>{
    mesh.visible=enabled.has(index);
  });
  nebulaVolume.applyQuality(qualityMode);
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
  addSlider('Paralaxe da nebulosa',nebulaVolume.state.parallaxStrength,.45,1.6,.05,nebulaVolume.setParallaxStrength);
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
  // A estrela do Nox ocupa um corredor protegido na projeção inicial.
  // Usar perspectiva (x/z e y/z), não distância XY, impede partículas
  // de outras profundidades de atravessarem o foco da composição.
  const halfTan=Math.tan(THREE.MathUtils.degToRad(52/2));
  const aspect=innerWidth/innerHeight;
  const targetSlopeY=43/(26+470);
  for(let i=0;i<count;i++) {
    const j=i*3;
    let x,y,z,ndcX,ndcY,tries=0;
    do {
      x=(Math.random()-.5)*spanX;
      y=(Math.random()-.5)*spanY;
      z=minZ+Math.random()*(maxZ-minZ);
      const depth=26-z;
      ndcX=(x/depth)/(halfTan*aspect);
      ndcY=((y/depth)-targetSlopeY)/halfTan;
      tries++;
    } while((ndcX/.51)**2+(ndcY/.42)**2<1 && tries<150);
    positions[j]=x;
    positions[j+1]=y;
    positions[j+2]=z;
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
        gl_PointSize=clamp(aSize*96.0/max(5.0,-mv.z)*uDpr,0.6,3.7);
        vColor=aColor;
        // Estrelas não cintilam em sincronismo. Cada ponto tem frequência,
        // amplitude e segunda fase independente (sem gasto extra de draw calls).
        float low=sin(uTime*aTwinkleRate+aPhase);
        float irregular=sin(uTime*(aTwinkleRate*1.753+.12)+aTwinkleSecondary);
        vOpacity=clamp(.61+low*aTwinkleAmp*.40+irregular*aTwinkleAmp*.18,.32,.78)*uOpacity;
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
// Sparse Void: só 146 estrelas 3D (110 fundo, 28 meio, 8 perto).
// Zero partículas no foreground durante repouso. A viagem conserva
// seus rastros próprios, criados SOMENTE quando o jogador clica.
createStars(110,-540,-270,1100,570,[1.3,3.2],['#c1cce1','#8791c8','#d5c9c4'],{opacity:.38});
createStars(28,-255,-105,510,290,[.8,2.0],['#c9d0ed','#a99cc9','#d5c8a9'],{opacity:.34});
createStars(8,-95,-15,250,140,[.6,1.15],['#bfc6dd','#a5a8ce','#d2c8bc'],{opacity:.28});
const foregroundParticles = new THREE.Group();
scene.add(foregroundParticles);
// Manter o buffer de zero pontos apenas para compatibilidade com
// instrumentação e testes; GPU não desenha nenhum fragmento dele.
createStars(0,-56,-6,128,72,[.65,1.0],['#d6dfff','#d3baff','#f7eacf'],{group:foregroundParticles,opacity:0});
if (debugEnabled) {
  window.__orionDepthDebug = { rigRoot, rigYaw, rigPitch, rigRoll, camera, foregroundParticles, layers, nebulaMotion:nebulaVolume.state };
}

// Native Three.js sprites anchored at the same point in space.
const heraldPos = new THREE.Vector3(0, 43, -470);
const heraldBasePos = heraldPos.clone();
let heraldGroup = new THREE.Group();
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
let nebulaStarHalo=new THREE.Sprite(new THREE.SpriteMaterial({
  map:tex('/assets/06-star-glow.png'),transparent:true,opacity:.16,
  blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false
}));
nebulaStarHalo.scale.set(60,60,1);
nebulaStarHalo.renderOrder=10;
heraldGroup.add(nebulaStarHalo);
let softHalo=addGlow(47,.25);
let mainGlow=addGlow(22,.8);
let coreGlow=addGlow(7,1);
let orbitRing=new THREE.Mesh(new THREE.RingGeometry(7.25,7.28,144),new THREE.MeshBasicMaterial({color:0xe8cf92,transparent:true,opacity:.015,side:THREE.DoubleSide,depthWrite:false,depthTest:false}));
orbitRing.renderOrder=14; heraldGroup.add(orbitRing);
// Halo fotônico raro e suave: não é um círculo de interface ou marcador.
let beaconGlow=addGlow(178,0);
beaconGlow.renderOrder=11;
beaconGlow.layers.enable(1);
// Pontas de difração procedurais, com duas velocidades e sem bloom extra.
let cinematicSpikes=createCinematicStarSpikes(heraldGroup,{reducedMotion:reduceMotion});
// Sprite 3D invisivel na camada 2: area acessivel de mira e click real (Raycaster).
// O HTML continua apenas como alternativa de teclado e touch.
let heraldPickSprite=new THREE.Sprite(new THREE.SpriteMaterial({
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
// Uma coleção de destinos; mapas e geometrias são compartilhados, materiais não.
const accountHeralds=getHeralds(params);
const emptyAccount=accountHeralds.length===0;
const creationStar={id:'new-herald',name:'Sua primeira estrela',subtitle:'Um novo começo',creation:true,
 stats:{level:'—',origin:'—',trail:'—',rank:'—',em:'—',ec:'—'}};
const heraldData=(emptyAccount||creationPage)?[creationStar]:accountHeralds;
root.dataset.empty=String(emptyAccount);
if(emptyAccount)hint.textContent='Uma nova história espera por você';
const firstVisuals={group:heraldGroup,glows:{halo:nebulaStarHalo,soft:softHalo,main:mainGlow,core:coreGlow},
  orbit:orbitRing,beacon:beaconGlow,spikes:cinematicSpikes,pick:heraldPickSprite,target};
const heralds=heraldData.map((data,index)=>{
  let visuals=firstVisuals;
  if(index){
    const group=new THREE.Group();scene.add(group);
    const clone=object=>{const copy=object.clone();copy.material=object.material.clone();group.add(copy);return copy;};
    const glows=Object.fromEntries(Object.entries(firstVisuals.glows).map(([key,object])=>[key,clone(object)]));
    const button=target.cloneNode(false);button.id=`heraldTarget-${data.id}`;
    target.parentNode.insertBefore(button,card);
    visuals={group,glows,orbit:clone(orbitRing),beacon:clone(beaconGlow),pick:clone(heraldPickSprite),target:button,
      spikes:createCinematicStarSpikes(group,{reducedMotion:reduceMotion,sharedTexture:cinematicSpikes.primary.material.map})};
  }
  visuals.pick.userData.heraldIndex=index;
  visuals.target.setAttribute('aria-label',data.creation?'Criar meu primeiro arauto':`Selecionar ${data.name}${data.demo?', estrela de demonstração':', arauto ativo, nível 9'}`);
  return {data,...visuals,basePosition:new THREE.Vector3(),screen:{x:NaN,y:NaN},focus:0};
});
let activeHerald=heralds[0],selectedHerald=null;
document.getElementById('heraldCount').textContent=emptyAccount?'Sua primeira história':heralds.length===1?'1 arauto ativo':`${heralds.length} estrelas · prévia`;
const pageTransition=createPageTransition(flash);
function renderHerald(){
  const data=activeHerald.data;
  document.getElementById('heraldName').textContent=data.name;
  document.getElementById('heraldSubtitle').textContent=data.subtitle;
  document.getElementById('heraldStatus').textContent=data.demo?'Demonstração':'Arauto ativo';
  card.setAttribute('aria-label',`Resumo de ${data.name}`);
  document.getElementById('dismissHerald').setAttribute('aria-label',`Fechar resumo de ${data.name}`);
  for(const field of card.querySelectorAll('[data-herald-stat]'))field.textContent=data.stats[field.dataset.heraldStat];
  cachedCardHeight=card.offsetHeight;
}
function activateHerald(entry){
  if(entry===activeHerald)return true;
  if(travelling||starSelection.state.active||selectedHerald)return false;
  activeHerald=entry;target=entry.target;heraldGroup=entry.group;
  ({halo:nebulaStarHalo,soft:softHalo,main:mainGlow,core:coreGlow}=entry.glows);
  orbitRing=entry.orbit;beaconGlow=entry.beacon;cinematicSpikes=entry.spikes;heraldPickSprite=entry.pick;
  heraldPos.copy(entry.group.position);heraldBasePos.copy(entry.basePosition);starSelection=entry.selection;
  renderHerald();
  for(const other of heralds)other.target.setAttribute('aria-expanded',String(cardVisible&&other===entry));
  if(cardVisible)hint.textContent=`${entry.data.name} · ${mobile?'Escolha':'Clique para'} atravessar o véu`;
  return true;
}
const selectiveBloom=createSelectiveBloom(renderer,scene,camera,{initial:mobile?.10:.18,reducedMotion:reduceMotion});
if(debugEnabled) {
  window.__orionBloomSliderFactory('Bloom seletivo',selectiveBloom.state.intensity,0,1.5,.05,selectiveBloom.setIntensity);
  window.__orionAtmosphereDebug={atmosphere,selectiveBloom};
  window.__orionRespirationDebug={state:respirationState,veils:breathingVeils,nebula:mainCloud,get beaconGlow(){return beaconGlow},get heraldGroup(){return heraldGroup}};
  window.__orionCinematicDebug={get spikes(){return cinematicSpikes},starsGroup,foregroundParticles};
  delete window.__orionBloomSliderFactory;
}

// The link target is a REAL HTML button anchored to the projection of the
// Three.js object, so mouse, keyboard and touch share the same hit target.
let mouse={x:0,y:0}; let smooth={x:0,y:0}; let selected=false;let jumpStart=0;
let cardVisible=false;
let travelling=false;
let selectionStartedAt=0;
let focusBlend=0,restoringFocus=false;
// Evitar forced reflow: altura do card é estável durante animação.
let cachedCardHeight=card.offsetHeight;
const domPosition={x:NaN,y:NaN,cx:NaN,cy:NaN,focusAt:0,focusX:NaN,focusY:NaN};
const interactionMetrics={pointerEvents:0,raycasts:0,focusWrites:0};
if(debugEnabled)window.__orionInteractionMetrics={
  get pointerEvents(){return interactionMetrics.pointerEvents;},
  get raycasts(){return interactionMetrics.raycasts;},
  get focusWrites(){return interactionMetrics.focusWrites;}
};
const mouseMotionDebug={get x(){return smooth.x;},
  get y(){return smooth.y;},get targetX(){return mouse.x;},
  get targetY(){return mouse.y;},get volumeLayers(){return nebulaVolume.layers.length;}};
if(debugEnabled)window.__orionMotionDebug=mouseMotionDebug;
// O alvo e a camera usam coordenadas reais de mundo.
let lastFrame=performance.now();
let blink=0;
const projected=new THREE.Vector3();
const targetXY={x:innerWidth*.5,y:innerHeight*.30};
function updateTargetScreen() {
  for(const entry of heralds){
    projected.copy(entry.group.position).project(camera);
    const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;
    if(!Number.isFinite(x)||!Number.isFinite(y))continue;
    if(!Number.isFinite(entry.screen.x)||Math.abs(x-entry.screen.x)>.45||Math.abs(y-entry.screen.y)>.45){
      entry.target.style.left=x.toFixed(1)+'px';entry.target.style.top=y.toFixed(1)+'px';
      entry.screen.x=x;entry.screen.y=y;
    }
  }
  const {x,y}=activeHerald.screen;
  targetXY.x=x;targetXY.y=y;
  firstPersonHands.setStarDirection?.((x/innerWidth-.5)*2,(.5-y/innerHeight)*2);
  if(travelling){
    flash.style.setProperty('--arrival-x',(x/innerWidth*100).toFixed(2)+'%');
    flash.style.setProperty('--arrival-y',(y/innerHeight*100).toFixed(2)+'%');
  }
  // Variações da vinheta não precisam forçar repintura CSS em 60 FPS.
  const now=performance.now();
  if(now-domPosition.focusAt>90 &&
    (!Number.isFinite(domPosition.focusX) || Math.abs(x-domPosition.focusX)>2 ||
      Math.abs(y-domPosition.focusY)>2)){
    root.style.setProperty('--nox-focus-x',(x/innerWidth*100).toFixed(1)+'%');
    root.style.setProperty('--nox-focus-y',(y/innerHeight*100).toFixed(1)+'%');
    domPosition.focusAt=now;
    domPosition.focusX=x;domPosition.focusY=y;
    interactionMetrics.focusWrites++;
  }
  // O painel de toque é ancorado por CSS à área segura, sem perseguir o astro.
  if(mobile)return;
  const width=265;
  const cardX=THREE.MathUtils.clamp((x+170+width<innerWidth-15)?x+119:x-150-width,12,innerWidth-width-12);
  const cardY=THREE.MathUtils.clamp(y-93,110,
    Math.max(112,innerHeight-cachedCardHeight-18));
  if(!Number.isFinite(domPosition.cx)||Math.abs(cardX-domPosition.cx)>.5||
    Math.abs(cardY-domPosition.cy)>.5){
    card.style.left=cardX.toFixed(1)+'px';
    card.style.top=cardY.toFixed(1)+'px';
    domPosition.cx=cardX;domPosition.cy=cardY;
  }
}
function setHover(state) {
  if(creationPage)return;
  if(emptyAccount){
    if(travelling||starSelection.state.active)return;
    firstPersonHands.setStarHovered?.(state);
    hint.textContent='Clique na estrela para começar sua história';
    return;
  }
  if(travelling||starSelection.state.active)return;
  cardVisible=state;
  root.dataset.summary=String(state);
  card.classList.toggle('visible',state);
  card.setAttribute('aria-hidden',String(!state));
  card.inert=!state;
  for(const entry of heralds)entry.target.setAttribute('aria-expanded',String(state&&entry===activeHerald));
  firstPersonHands.setStarHovered?.(state);
  hint.textContent=state?`${activeHerald.data.name} · ${mobile?'Escolha':'Clique para'} atravessar o véu`:idleHint;
}
function dismissPreview(restoreFocus=false){
  if(travelling||starSelection.state.active)return;
  if(restoreFocus){restoringFocus=true;target.focus({preventScroll:true});restoringFocus=false;}
  setHover(false);
}
document.getElementById('dismissHerald').addEventListener('click',()=>dismissPreview(true));
document.getElementById('confirmHerald').addEventListener('click',()=>{if(cardVisible)selectStar();});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&cardVisible){e.preventDefault();dismissPreview(true);}
});
const mobileConstellation=mobile?createMobileConstellation({root,heralds,reducedMotion:reduceMotion,
 isLocked:()=>travelling||!!selectedHerald,onChange:entry=>{dismissPreview();activateHerald(entry);hint.textContent=`${entry.data.name} · Toque na estrela para conhecer`;}}):null;
const touchNavigation=mobile?createTouchNavigation({root,
 isLocked:()=>travelling||!!selectedHerald,onDismiss:()=>dismissPreview(),onSwipe:direction=>mobileConstellation.step(direction)}):null;
if(debugEnabled)window.__orionMobileDebug=mobileConstellation;
if(debugEnabled)window.__orionTouchDebug=touchNavigation;
for(const entry of heralds){
  const button=entry.target;
  button.addEventListener('mouseenter',()=>{if(!mobile&&activateHerald(entry))setHover(true);});
  button.addEventListener('mouseleave',()=>{if(!mobile)setHover(false);});
  button.addEventListener('focus',()=>{
    if(!restoringFocus&&(!mobile||button.matches(':focus-visible'))&&activateHerald(entry))setHover(true);
  });
  button.addEventListener('blur',()=>{if(!mobile)setHover(false);});
  button.addEventListener('click',e=>{
    if(travelling||starSelection.state.active||!activateHerald(entry))return;
    if(emptyAccount){selectStar(entry);return;}
    if(mobile){if(!mobileConstellation.state.settled)return;setHover(true);return;}
    if(e.detail===0&&!cardVisible){setHover(true);return;}
    selectStar(entry);
  });
}
function isAimedAtStar(clientX,clientY){
  if(travelling||creationPage)return null;
  // Rejeitar alvos distantes antes de atualizar matrizes e lançar o raio.
  const radius=Math.max(120,innerHeight*.15);
  const candidates=heralds.filter(entry=>Math.abs(clientX-entry.screen.x)<=radius&&Math.abs(clientY-entry.screen.y)<=radius);
  if(!candidates.length)return null;
  interactionMetrics.raycasts++;
  pointerNdc.set(clientX/innerWidth*2-1,1-clientY/innerHeight*2);
  camera.updateWorldMatrix(true,false);
  for(const entry of candidates)entry.group.updateWorldMatrix(true,true);
  starRaycaster.setFromCamera(pointerNdc,camera);
  const hit=starRaycaster.intersectObjects(candidates.map(entry=>entry.pick),false)[0];
  return hit?heralds[hit.object.userData.heraldIndex]:null;
}
window.addEventListener('pointermove',e=>{
  if(creation){
    if(!mobile&&e.pointerType!=='touch'){mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(.5-e.clientY/innerHeight)*2;}
    creation.point(e);return;
  }
  if(mobile||e.pointerType==='touch'||travelling||starSelection.state.active)return;
  interactionMetrics.pointerEvents++;
  mouse.x=(e.clientX/innerWidth-.5)*2;
  mouse.y=(.5-e.clientY/innerHeight)*2;
  const aimed=isAimedAtStar(e.clientX,e.clientY);
  const keyboardFocus=heralds.find(entry=>document.activeElement===entry.target&&entry.target.matches(':focus-visible'));
  if(aimed||keyboardFocus)activateHerald(aimed||keyboardFocus);
  const focused=!!(aimed||keyboardFocus);
  document.body.classList.toggle('star-aimed',!!aimed);
  firstPersonHands.setStarHovered?.(focused);
  if(cardVisible!==focused)setHover(focused);
},{passive:true});
// Sair da janela ou trocar de aba não produz necessariamente pointermove.
// No toque, a pose acompanha a seleção explícita até confirmar ou dispensar.
const resetHandHover=()=>{dismissPreview();document.body.classList.remove('star-aimed');firstPersonHands.setStarHovered?.(false);};
document.documentElement.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')resetHandHover();});
window.addEventListener('blur',resetHandHover);
window.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||travelling||starSelection.state.active||e.button!==0)return;
  if(e.target.closest('a,button,input,.debug'))return;
  const aimed=isAimedAtStar(e.clientX,e.clientY);
  if(aimed){e.preventDefault();selectStar(aimed);}
});

// A viagem fica isolada do rig de repouso e so termina no clarão.
const starJourney=createStarJourney({
 scene,camera,star:heraldGroup,
 glows:{halo:nebulaStarHalo,soft:softHalo,main:mainGlow,core:coreGlow},
 layers,gasLayers:atmosphere.layers,selectiveBloom,flash,sky:distantSky,
 reducedMotion:reduceMotion,
 onArrive:()=>{
   // Relato do trajeto persistido apenas nesta aba para depuração pós-navegação.
   try{sessionStorage.setItem('orion-last-trip-v09',JSON.stringify({
     heraldId:selectedHerald.data.id,
     passedGasLayers:atmosphere.layers.filter(layer=>camera.position.z<layer.position.z).length,
     endZ:camera.position.z,starZ:heraldGroup.position.z
   }));}catch{}
   pageTransition.navigate(arrivalURL(location.href,selectedHerald.data));
 }
});
for(const entry of heralds)entry.selection=createStarSelection(entry.group,{
 camera,hands:firstPersonHands,reducedMotion:reduceMotion,onDepart:beginTravel,onConfirm:beginTravel
});
let starSelection=activeHerald.selection;
if(debugEnabled)window.__orionStarDebug={journey:starJourney,get selection(){return starSelection},
 get heraldGroup(){return heraldGroup},get heraldPickSprite(){return heraldPickSprite},raycaster:starRaycaster,heralds,
 get selectedHeraldId(){return selectedHerald?.data.id},transition:pageTransition.state,sky:distantSky};
function selectStar(entry=activeHerald){
 if(travelling||!activateHerald(entry)||!starSelection.begin())return;
 selectedHerald=entry;
 if(mobile){root.dataset.confirming='true';document.getElementById('starBrowser').inert=true;}
 if(entry.data.creation){
   for(const url of Object.values(CREATION_ART)){
     if(document.querySelector(`link[data-creation-preload="${url}"]`))continue;
     const link=document.createElement('link');link.rel='prefetch';link.as='image';link.href=url;link.dataset.creationPreload=url;document.head.append(link);
   }
 }
 pageTransition.prepare(arrivalURL(location.href,entry.data));
 selectionStartedAt=performance.now();
 touchNavigation?.cancel();
 cardVisible=false;card.classList.remove('visible');card.setAttribute('aria-hidden','true');
 card.inert=true;target.setAttribute('aria-expanded','false');
 document.body.classList.remove('star-aimed');
 hint.textContent=`${entry.data.name} selecionada · Atravessando o véu…`;
}
function beginTravel(){
 if(travelling)return;
 starJourney.setDestination(selectedHerald.group,selectedHerald.glows);
 if(!starJourney.begin())return;
 for(const entry of heralds){
   entry.beacon.visible=false;
   if(entry===selectedHerald)continue;
   entry.group.traverse(object=>{if(object.material)object.userData.departureOpacity=object.material.opacity;});
 }
 travelling=true;
 firstPersonHands.setStarHovered?.(false);
  firstPersonHands.beginTravel();
 cardVisible=false;card.classList.remove('visible');card.setAttribute('aria-hidden','true');
 card.inert=true;target.setAttribute('aria-expanded','false');
 root.classList.add('jumping');
 document.body.classList.remove('star-aimed');
 hint.textContent='Atravessando o véu…';
}
function resize(){
 cachedCardHeight=card.offsetHeight;
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 if(!travelling&&!selectedHerald){
   const layout=mobile?mobileHeraldLayout(heralds.length,camera.aspect,mobileConstellation.state.position,mobileConstellation.state.summary):getHeraldLayout(heralds.length,camera.aspect);
   heralds.forEach((entry,index)=>{
     const point=emptyAccount?{x:0,y:0,z:-470,scale:1}:layout[index];entry.group.position.set(point.x,point.y,point.z);
     entry.group.scale.setScalar(point.scale);entry.basePosition.copy(entry.group.position);
   });
   heraldPos.copy(activeHerald.group.position);heraldBasePos.copy(activeHerald.basePosition);
 }
 firstPersonHands.resize();
 renderer.setPixelRatio(pixelRatioForViewport());
 renderer.setSize(innerWidth,innerHeight);
 selectiveBloom.resize(innerWidth,innerHeight,gpuBudget().bloomScale);
 for(const mesh of layers){
  if(mesh.userData.volumeFragment||(mesh===mainCloud&&distantSky.state.active))continue;
  const dist=26-mesh.position.z; // escala baseada no ponto de observacao inicial
  const h=2*Math.tan(THREE.MathUtils.degToRad(52/2))*dist*mesh.userData.factor;
  mesh.scale.set(h*mesh.userData.aspect,h,1);
 }
 if(!distantSky.state.active)nebulaVolume.resize();
 for(const mat of starMaterials)mat.uniforms.uDpr.value=renderer.getPixelRatio();
}
window.addEventListener('resize',resize);resize();
window.addEventListener('pageshow',event=>{if(event.persisted&&travelling)location.reload();});

// Diagnóstico local opcional: nenhum HUD ou coleta adicional no site normal.
const performancePanel=debugEnabled?createPerformancePanel(debug,()=>({
  quality:qualityMode,
  effects:effectsMode,
  bloomRest:qualityMode!=='eco'&&effectsMode!=='no-bloom',
  canvasPixels:renderer.domElement.width*renderer.domElement.height,
  dpr:Number(renderer.getPixelRatio().toFixed(2)),
  gasLayers:atmosphere.layers.filter(layer=>layer.visible).length,
  volumeLayers:nebulaVolume.layers.filter(layer=>layer.visible).length,
  foregroundNear:nebulaVolume.layers.some(layer=>layer.visible&&layer.userData.volumeFragment&&layer.position.z>-100),
  handsVisible:firstPersonHands.state.visible,
  handsSurfaces:firstPersonHands.state.drawSurfaces,
  handsMode:firstPersonHands.state.mode,
  handsTriangles:firstPersonHands.state.triangles||0,
  handsTextures:firstPersonHands.state.textureCount,
  handsReady:firstPersonHands.state.loaded??firstPersonHands.state.enabled,
  handsJoints:firstPersonHands.state.joints||0,
  handsFingerJoints:firstPersonHands.state.fingerJoints||0,
  handsLoadError:firstPersonHands.state.loadError||null,
  depthMotion:nebulaVolume.state.parallaxEnabled,
  parallaxStrength:nebulaVolume.state.parallaxStrength,
  drawCalls:renderer.info.render.calls,
  textures:renderer.info.memory.textures,
  mouseDeltaPx:Number(Math.hypot(
    (smooth.x-mouse.x)*innerWidth*.5,
    (smooth.y-mouse.y)*innerHeight*.5).toFixed(1)),
  adaptations:performanceAdaptations,
  viewport:innerWidth+'×'+innerHeight
})):null;
if(debugEnabled)window.__orionDiagnostic=performancePanel;

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
  // Qualidade explicitamente escolhida permanece estável para comparar modos.
  // No automático, degradar em etapas: lite -> eco-plus -> eco,
  // sem remover de uma vez o bloom da estrela. Perfis manuais ficam estáveis.
  if(slowIntervals>=2 && !manualQuality && qualityMode!=='eco'){
    qualityMode=qualityOrder[Math.max(0,qualityOrder.indexOf(qualityMode)-1)];
    performanceAdaptations++;
    slowIntervals=0;
    applyGasBudget();resize();
  }
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){touchNavigation?.cancel();resetHandHover();}
  if(!document.hidden){lastFrame=performance.now();monitorSince=lastFrame;monitorSum=0;monitorFrames=0;performancePanel?.reset();}
});
let bloomTick=0;
function tick(now){
 requestAnimationFrame(tick);
 if(document.hidden)return;
 const q=gpuBudget();
 // Não desenhar quadros extras em máquinas limitadas.
 if(!travelling && q.fpsCap<60 && renderedAt && now-renderedAt<1000/q.fpsCap-1)return;
 const actualFrameMs=renderedAt?now-renderedAt:16.67;
 const rawMs=Math.min(100,actualFrameMs);
 renderedAt=now;
 performancePanel?.record(now,actualFrameMs);
 adaptPerformance(now,rawMs);
 const elapsed=Math.max(0,(now-lastFrame)/1000);
 const delta=Math.min(elapsed,.05);lastFrame=now;
 const time=now*.001;
 // Relógio da confirmação independente do limite usado pela física.
 // O primeiro delta não inclui o tempo do quadro anterior ao clique.
 starSelection.update(Math.min(elapsed,Math.max(0,(now-selectionStartedAt)/1000)));
 if(!travelling){
  if(mobile&&!selectedHerald){
   mobileConstellation.update(elapsed,cardVisible);
   const layout=mobileHeraldLayout(heralds.length,camera.aspect,mobileConstellation.state.position,mobileConstellation.state.summary);
   heralds.forEach((entry,index)=>{const p=emptyAccount?{x:0,y:0,z:-470,scale:1}:layout[index];entry.group.position.set(p.x,p.y,p.z);entry.group.scale.setScalar(p.scale);entry.basePosition.copy(entry.group.position);});
   heraldBasePos.copy(activeHerald.basePosition);
  }else if(!mobile)heraldGroup.position.copy(heraldBasePos);
  starsGroup.position.z=0;
  // Tempo de resposta de ~55 ms: segue a mira sem lerdo,
  // mas mantém interpolação independente da frequência da tela.
  const inertia=reduceMotion?1:1-Math.exp(-Math.max(.001,delta)*(creationPage?4:18));
  const creationMotion=creationPage?.35:1;
  smooth.x=THREE.MathUtils.lerp(smooth.x,mouse.x,inertia);
  smooth.y=THREE.MathUtils.lerp(smooth.y,mouse.y,inertia);
  const idle=reduceMotion?0:Math.sin(time*.29)*.23;
  rigRoot.position.set(mobile?mobileConstellation.state.position*8:smooth.x*6.8*perspective*creationMotion,
    smooth.y*4.35*perspective*creationMotion+idle,26+(reduceMotion?0:Math.sin(time*.21)*.25));
  rigYaw.rotation.y=-smooth.x*.068*perspective*creationMotion;
  rigPitch.rotation.x=smooth.y*.052*perspective*creationMotion;
  rigRoll.rotation.z=reduceMotion||mobile?0:-smooth.x*.011*perspective*creationMotion+Math.sin(time*.27)*.0015;
  const starFocused=cardVisible||starSelection.state.active;
  const focusTarget=starFocused?1:0;
  focusBlend=reduceMotion?0:THREE.MathUtils.lerp(focusBlend,focusTarget,1-Math.exp(-delta*12));
  if(Math.abs(focusBlend-focusTarget)<.0005)focusBlend=focusTarget;
  camera.position.z=-.9*focusBlend;
  const newFov=52-focusBlend;
  if(Math.abs(camera.fov-newFov)>.001){
    camera.fov=newFov;
    camera.updateProjectionMatrix();
  }
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
  for(const entry of heralds){
    const {halo:nebulaStarHalo,soft:softHalo,main:mainGlow,core:coreGlow}=entry.glows;
    const {beacon:beaconGlow,orbit:orbitRing}=entry;
    entry.focus=reduceMotion?0:THREE.MathUtils.lerp(entry.focus,entry===activeHerald&&starFocused?1:0,1-Math.exp(-delta*12));
  const emphasized=1+.22*entry.focus;
  nebulaStarHalo.scale.setScalar(156*(respirationState.star+.055*beacon)*emphasized);
  softHalo.scale.setScalar(118*(1+.034*pulse+.045*beacon)*emphasized);
  mainGlow.scale.setScalar(66*(1+.048*pulse+.022*shimmer+.075*beacon)*emphasized);
  coreGlow.scale.setScalar(18*(1+.026*shimmer)*(1+.18*entry.focus));
  // O astro deve comandar o olhar sem espalhar luz por toda a composição.
  nebulaStarHalo.material.opacity=.075+.045*entry.focus+.012*pulse+.028*beacon;
  softHalo.material.opacity=.13+.085*entry.focus+.012*pulse+.024*beacon;
  mainGlow.material.opacity=.48+.19*entry.focus+.015*shimmer+.040*beacon;
  coreGlow.material.opacity=.94;
  beaconGlow.scale.setScalar(154+42*beacon);
  beaconGlow.material.opacity=.046*beacon*(1+.55*entry.focus);
  orbitRing.material.opacity=0;
  if(entry===activeHerald&&starSelection.state.active){
    const light=starSelection.state.light;
    const charge=starSelection.state.charge,burst=starSelection.state.burst;
    mainGlow.material.opacity+=.30*light;
    softHalo.material.opacity+=.22*charge+.18*burst;
    nebulaStarHalo.material.opacity+=.12*burst;
    mainGlow.scale.multiplyScalar(1+.12*charge+.22*burst);
    coreGlow.scale.multiplyScalar(1+.12*charge+.45*burst);
    nebulaStarHalo.scale.multiplyScalar(1+.10*charge+.12*burst);
  }
  }
  // Nebulosa recebe o alvo direto do mouse; câmera mantém smoothing próprio.
  nebulaVolume.update(time,mouse.x,mouse.y,delta);
  flash.style.opacity='0';
  flash.style.setProperty('--veil-opacity','0');
 } else {
  beaconGlow.visible=false;
  starJourney.update(now,delta);
 }
 // A retirada das mãos precisa continuar durante a viagem, no mesmo loop.
 creation?.update(now);
 firstPersonHands.update(time,delta,mouse.x,mouse.y);
 creation?.finishFrame();
 for(const mat of starMaterials){
   mat.uniforms.uTime.value=reduceMotion?0:time;
   mat.uniforms.uOpacity.value=mat.userData.baseOpacity*(travelling?1.24:1);
 }
 cinematicSpikes.update(time,cardVisible||starSelection.state.active,travelling);
 for(const entry of heralds){
   if(entry===activeHerald)continue;
   entry.spikes.update(time,false,travelling);
   if(travelling){
     const fade=starJourney.companionOpacity;
     entry.group.traverse(object=>{if(object.material)object.material.opacity=object.userData.departureOpacity*fade;});
   }
 }
 camera.updateWorldMatrix(true,false);
 updateTargetScreen();
 atmosphere.update(time);
 // Atualizar o bloom a 30 Hz (cena/câmera continuam a 60 FPS).
 // Durante a viagem, atualizar em todo quadro para preservar o clarão.
 bloomTick++;
 renderer.info.reset();
 // Sem bloom no repouso Eco. Durante a viagem o clarão permanece intacto.
 selectiveBloom.render(travelling||bloomTick%2===1,
   travelling||(qualityMode!=='eco'&&effectsMode!=='no-bloom'));
 performancePanel?.refresh(now);
}
if(creationPage){
 root.classList.add('creation-scene');
 for(const entry of heralds){entry.group.visible=false;entry.target.hidden=true;entry.target.inert=true;}
 creation=createHeraldCreation(root,{hands:firstPersonHands,reducedMotion:reduceMotion,scene,camera,environment:nebulaVolume});
 if(debugEnabled)window.__orionCreationEnvironment={state:nebulaVolume.state,layers:nebulaVolume.layers,photo:mainCloud};

}
requestAnimationFrame(tick);
document.documentElement.dataset.sceneReady='1';
const imageReady=new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>reject(new Error('Não foi possível carregar o fundo.'));image.src=creationPage?creationNebulaURL():'/assets/nebula-eso-photographic.jpg';});
Promise.all([imageReady,firstPersonHands.ready,creation?.ready]).then(async()=>{
 if(firstPersonHands.state.loadError)throw new Error(firstPersonHands.state.loadError);
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 document.documentElement.dataset.presentationReady='1';loading.classList.add('done');
 if(creationPage)await revealPage();
}).catch(error=>{document.documentElement.dataset.sceneError=error.message;document.getElementById('loadErrorText').textContent=error.message;document.getElementById('loadIssue').hidden=false;loading.hidden=true;});

// Catch texture loading errors without hiding the fact that WebGL is active.
// Press D or use ?debug=1 to compare stronger camera perspective values.
