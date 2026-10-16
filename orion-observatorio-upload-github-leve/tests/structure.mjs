import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
const base = process.cwd();
const read = p => readFile(join(base,p),'utf8');
const [index, main, css, vite] = await Promise.all(['index.html','main.js','styles.css','vite.config.js'].map(read));
assert.match(index, /src="\/startup\.js"/,'index must load startup module');
assert.match(await read('startup.js'), /await import\('\.\/main\.js'\)/);
assert.doesNotMatch(index, /bootstrap\.js|unpkg|jsdelivr/,'no CDN runtime');
assert.match(main, /import \* as THREE from ['"]three['"]/,'Three.js local import required');
assert.equal((main.match(/function tick\(now\)/g)||[]).length,1,'only one animation loop');
assert.equal((main.match(/requestAnimationFrame\(tick\)/g)||[]).length,2,'RAF inside and at startup');
assert.match(vite, /ficha\.html/,'ficha must be included in multipage build');
assert.match(css, /\.constellation/);
const names = ['00-starfield-base.jpg','01-nebula-far.webp','03-mid-clouds.webp','04-front-fog.png','05-star-dust.png','06-star-glow.png'];
for (const n of names) {
  const f='public/assets/'+n;
  assert.ok((await stat(join(base,f))).size>9000, 'missing/empty '+f);
  assert.ok(main.includes('/assets/'+n) || css.includes('/assets/'+n),'unreferenced '+n);
}
const forbidden = (await readdir(join(base,'public/assets'))).filter(x=>x==='masters');
assert.equal(forbidden.length,0,'Masters must not be deployed');
console.log('OK: arquivos, PNGs, Vite multipágina e Three.js local verificados.');

assert.ok(main.includes('/assets/nebula-eso-photographic.jpg'), 'cena precisa usar nebulosa ESO');
assert.match(await read('package.json'), /prepare-astro-assets/,'build deve preparar imagem fotográfica');

assert.match(main, /const rigRoot = new THREE.Group\(\)/, 'camera rig translation');
assert.match(main, /const rigYaw = new THREE.Group\(\)/, 'camera rig yaw');
assert.match(main, /const rigPitch = new THREE.Group\(\)/, 'camera rig pitch');
assert.match(main, /const rigRoll = new THREE.Group\(\)/, 'camera rig roll');
assert.match(await read('star-journey.js'), /scene\.attach\(camera\)/, 'travel remains in world space');
assert.match(main, /const foregroundParticles = new THREE.Group\(\)/, 'near-camera volume');
assert.match(main, /camera\.updateWorldMatrix\(true,false\)/, 'star projection current pose');
assert.doesNotMatch(main, /const intendedX=smooth\.x\*8\.8/, 'remove old translation-only camera');

assert.match(main, /createCosmicAtmosphere\(scene/,'GLSL gas');
assert.match(main, /selectiveBloom\.render\(/,'selective bloom render');
assert.match(main, /atmosphere\.update\(time\)/,'atmosphere motion');
assert.match(await read('cosmic-atmosphere.js'), /uniform float uFlow/);
assert.match(await read('cosmic-atmosphere.js'), /uniform float uDensity/);
assert.match(await read('selective-bloom.js'), /UnrealBloomPass/);
assert.match(await read('selective-bloom.js'), /camera\.layers\.set\(1\)/,'bloom layer isolation');

assert.match(main,/createStarJourney\(/,'journey 3D integrada');
assert.match(main,/new THREE\.Raycaster\(\)/,'raycaster 3D na estrela');
assert.match(main,/heraldPickSprite\.layers\.set\(2\)/,'camada dedicada de selecao');
assert.match(await read('star-journey.js'),/scene\.attach\(camera\)/,'camera viaja no mundo');
assert.match(await read('star-journey.js'),/THREE\.MathUtils\.lerp\(startPos\.z,endpoint\.z,distancePhase\)/,'camera atravessa profundidades');
assert.match(await read('star-journey.js'),/gasLayers\.map/,'camadas gasosas com fade de travessia');
assert.match(await read('star-journey.js'),/onArrive\(\)/,'termina dentro da luz');

// v0.9.1 respiração cósmica: os arquivos da viagem não foram alterados.
assert.match(main,/aTwinkleRate/,'cada estrela tem ritmo próprio');
assert.match(main,/aTwinkleAmp/,'cada estrela tem amplitude própria');
assert.match(main,/aTwinkleSecondary/,'cintilação de duas frequências');
assert.match(main,/const breathingVeils/,'névoa independente da foto');
assert.match(main,/const beaconGlow=addGlow/,'estrela principal tem farol de luz');
assert.match(main,/starJourney\.update\(now,delta\)/,'viagem v0.9 preservada');
assert.match(await read('cosmic-atmosphere.js'),/uniform float uBreath/,'respiração no shader');
assert.match(await read('cosmic-atmosphere.js'),/uBreath\.value=reducedMotion\?1/,'acessibilidade de movimento reduzido');

// Política de memória e renderização v0.9.1.1
assert.match(main,/maxPixels:2200000/,'limite de pixels no modo equilibrado');
assert.match(main,/renderer\.setPixelRatio\(pixelRatioForViewport\(\)\)/,'resolução limitada');
assert.match(main,/function adaptPerformance/,'perfil adaptável a lentidão');
assert.match(main,/if\(document\.hidden\)return/,'não desenha em aba oculta');
assert.match(main,/function applyGasBudget/,'camadas de shader desligáveis');
assert.match(await read('cosmic-atmosphere.js'),/i < 3/,'ruído mais econômico');
assert.match(await read('selective-bloom.js'),/scale=\.34/,'bloom de baixo custo');

// v0.9.2 clean cinematic: compor por subtração, sem alterar a viagem.
assert.match(main,/createStars\(110,/,'fundo com 110 pontos');
assert.match(main,/createStars\(28,/,'meio com 28 pontos');
assert.match(main,/createStars\(8,/,'proximidade com 8 pontos');
assert.match(main,/createStars\(0,/,'nenhuma poeira em primeiro plano');
assert.match(main,/mainCloud\.material\.color\.setRGB\(\.43,\.46,\.53\)/,'ESO escurecida apenas por material');
assert.match(main,/starBackdrop\.visible=false/,'remover base com centenas de pontos');
assert.match(main,/dustCloud\.visible=false/,'remover poeira rasterizada');
assert.match(main,/targetSlopeY=43\/\(26\+470\)/,'área limpa ao redor da estrela');
assert.match(main,/createCinematicStarSpikes/,'pontas de estrela procedurais');
assert.match(main,/cinematicSpikes\.update\(time,cardVisible,travelling\)/,'rotação das pontas no loop');
assert.match(await read('cinematic-star.js'),/material\.rotation/,'pontas com rotação na GPU');
assert.match(await read('cinematic-star.js'),/AdditiveBlending/,'difração sem blocos opacos');
assert.match(await read('cinematic-star.js'),/reducedMotion/,'movimento reduzido');
assert.match(main,/gas:\[0,2\]/,'equilibrado usa 2 planos GLSL');

// v0.9.2d: não processar/remover as estrelas impressas na foto.
// A nova branch parte de v0.9.2b, ANTES da mediana destrutiva da v0.9.2c.
const photoScript=await read('scripts/prepare-astro-assets.mjs');
assert.doesNotMatch(photoScript.split('// Os quatro recortes abaixo')[0],/\.median\(/,'não aplicar mediana no panorama ESO principal');
assert.doesNotMatch(photoScript,/const preserve=1-eased/,'não apagar estrelas da foto');
assert.match(main,/--nox-focus-x/,'filtro acompanha posição da estrela em tela');
assert.match(css,/v0\.9\.2d/,'filtro simples implementado via CSS');
assert.match(css,/radial-gradient\(ellipse 22% 28% at var\(--nox-focus-x/,'spotlight discreto');

// v0.9.3: 4 recortes fotográficos reais (sem editar o panorama) e cena mais leve.
assert.match(main,/createNebulaVolume\(scene,mainCloud/,'recortes da foto ESO em planos 3D');
assert.match(main,/nebulaVolume\.update\(time,mouse\.x,mouse\.y,delta\)/,'nuvens independentes e resposta imediata ao alvo do cursor');
assert.match(main,/nebulaVolume\.resize\(\)/,'enquadramento na projeção');
assert.match(main,/Math\.exp\(-Math\.max\(\.001,delta\)\*18\)/,'mouse responde rapidamente');
assert.match(main,/cachedCardHeight/,'evitar reflow por quadro');
assert.doesNotMatch(main,/card\.offsetHeight-18/,'não ler layout a cada frame');
assert.match(main,/fpsCap:60/,'sem limite rígido de 30 fps');
assert.match(main,/selectiveBloom\.render\(travelling\|\|bloomTick%2===1,/,'bloom fora do caminho crítico da câmera');
assert.match(await read('selective-bloom.js'),/function render\(refreshBloom=true,enableBloom=true\)/,'renderização seletiva temporizada e desligável');
assert.match(await read('nebula-volume.js'),/const selected=quality==='eco-plus'/,'Eco+ seleciona 3 recortes com véu opcional');
assert.match(await read('nebula-depth-specs.js'),/export const nebulaDepthSpecs/,'recortes coordenados');
assert.match(await read('scripts/prepare-astro-assets.mjs'),/eso-gas-/,'4 texturas RGBA preparadas no build');
assert.doesNotMatch(await read('scripts/prepare-astro-assets.mjs'),/const preserve=1-eased/,'ESO integral não deve ser apagada');

// v0.9.5: perfil eco + experimentos não alteram a foto original ou a viagem.
assert.match(main,/eco:\{dpr:\.53,maxPixels:500000/,'perfil eco limita pixels');
assert.match(main,/qualityMode!=='eco'/,'bloom desligável durante o repouso Eco');
assert.match(main,/effectsMode==='no-gas'/,'A/B do gás sem mudança do panorama');
assert.match(main,/!manualQuality && qualityMode!=='eco'/,'fallback automático em caso de quadros lentos');
assert.match(await read('performance-panel.js'),/Eco\+ sem bloom/,'comparativo A/B no debug');
assert.match(await read('selective-bloom.js'),/if\(!enableBloom\)/,'passagens de bloom realmente ignoradas');


// v0.9.6: Eco+ intermediário sem gás, com bloom, e comparação controlada.
assert.match(main,/qualityOverride==='eco-plus'/,'perfil Eco+ selecionável');
assert.match(main,/'eco-plus':\{dpr:\.60,maxPixels:670000,bloomScale:\.22,gas:\[\]/,'Eco+ contém gás desligado e orçamento de pixels intermediário');
assert.match(main,/qualityOrder=\['eco','eco-plus','lite','balanced','high'\]/,'fallback gradual entre Eco+ e Eco');
assert.match(await read('nebula-volume.js'),/state\.foregroundEnabled\?\[1,2,3\]:\[1,3\]/,'Eco+ adiciona recorte frontal desligável');
assert.match(await read('performance-panel.js'),/Eco\+ sem bloom/,'comparativo entre Eco+ com e sem bloom');

// v0.9.7 — profundidade puramente por transformação, sem shader ou textura extra.
const volumeScript=await read('nebula-volume.js');
assert.match(volumeScript,/parallaxOffsetX/,'paralaxe em coordenadas do mundo 3D');
assert.match(volumeScript,/baseScaleX/,'respiração usa escala cacheada');
assert.match(volumeScript,/parallaxEnabled=true/,'desligamento controlado de paralaxe A\/B');
assert.match(main,/nebulaVolume\.update\(time,mouse\.x,mouse\.y,delta\)/,'cursor alimenta paralaxe sem uma segunda inércia da câmera');
assert.match(main,/parallaxEnabled:depthMotionEnabled/,'A\/B para comparar sem mexer na fotografia');
assert.match(await read('performance-panel.js'),/Profundidade orgânica/,'painel registra efeito ativo');
assert.match(await read('nebula-depth-specs.js'),/parallaxX:16\.5/,'véu da frente desloca mais que massa distante');

// v0.9.8: amplitude visível com resposta rápida, sem trabalho gráfico extra.
assert.match(await read('nebula-volume.js'),/Math\.exp\(-Math\.max\(0,Math\.min\(\.1,delta\)\)\*14\)/,'inércia da nebulosa de aproximadamente 70ms');
assert.match(await read('nebula-volume.js'),/setParallaxStrength/,'intensidade ajustável sem reconstruir cena');
assert.match(main,/addSlider\('Paralaxe da nebulosa'/,'controle opcional de intensidade na depuração');
assert.match(await read('performance-panel.js'),/parallaxStrength/,'relatório registra intensidade da paralaxe');

// v0.9.9 — véu ESO frontal com camada de comparação, sem foto alterada.
assert.match(main,/foregroundEnabled=params\.get\('foreground'\)!=='off'/,'comparativo do véu próximo na URL');
assert.match(volumeScript,/mesh\.position\.z=nearVeil\?-75:spec\.z/,'camada do meio promovida para Z=-75');
assert.match(volumeScript,/mesh\.userData\.opacityFactor=nearVeil\?\.38:1/,'recorte frontal discreto');
assert.match(volumeScript,/mesh\.renderOrder=2\.11\+\(425\+mesh\.position\.z\)\*\.0008/,'ordem transparente usa profundidade efetiva');
assert.match(await read('performance-panel.js'),/Véu frontal próximo da câmera/,'comparador reporta presença do primeiro plano');


// v0.9.10 — protótipo acessível e reversível sem WebGL extra pesado.
const hands=await read('first-person-hands.js');
assert.match(main,/import \{ createFirstPersonHands \} from '.\/first-person-hands.js'/,'mãos têm módulo isolado');
assert.match(main,/firstPersonHands\.beginTravel\(\)/,'mãos desaparecem antes da viagem');
assert.match(main,/firstPersonHands\.resize\(\)/,'mãos respondem ao viewport');
assert.match(main,/firstPersonHands\.update\(time,delta,mouse\.x,mouse\.y\)/,'sway das mãos em camera local');
assert.match(main,/const handsEnabled=\['on','rig','3d','2d'\]\.includes\(handsSetting\)/,'modos A/B rig, 3D, 2D e opt-in no mobile');
assert.match(hands,/new THREE\.CanvasTexture\(canvas\)/,'um asset CanvasTexture gerado uma única vez');
assert.match(hands,/const left=new THREE\.Mesh\(geometry,material\)/,'mão esquerda compartilha material');
assert.match(hands,/const right=new THREE\.Mesh\(geometry,material\)/,'mão direita compartilha material');
assert.match(hands,/camera\.add\(left,right\)/,'viewmodel preso à câmera');
assert.match(hands,/camera\.remove\(left,right\)/,'descarta corretamente as mãos');
assert.match(hands,/meshes\.forEach\(mesh=>mesh\.visible=false\)/,'invisível ao viajar');
assert.match(await read('performance-panel.js'),/Mãos em primeira pessoa/,'diagnóstico local identifica as mãos');

// v0.9.11 — pose expressiva, material compartilhado e desenho autoral sem shaders novos.
const handsV0911=await read('first-person-hands.js');
assert.match(handsV0911,/const poses=\{/,'poses com ancoragem separadas');
assert.match(handsV0911,/left:\{z:-1\.10,x:-\.70,y:-\.72,size:1\.10/,'mão esquerda mais alta');
assert.match(handsV0911,/right:\{z:-1\.00,x:\.68,y:-\.66,size:1\.17/,'mão direita levemente mais próxima');
assert.match(handsV0911,/opacity:\.78/,'mãos mais visíveis sem neon excessivo');
assert.match(handsV0911,/const energy=ctx\.createRadialGradient/,'luz violeta pintada na textura');
assert.match(handsV0911,/hand\.bezierCurveTo/,'cinco dedos com contorno orgânico autoral');
assert.match(handsV0911,/new THREE\.CanvasTexture\(canvas\)/,'somente uma textura para as duas mãos');
assert.match(handsV0911,/Math\.sin\(time\*\.81\)\*\.006/,'respiração leve');

// v0.9.12: geometria real por mão e modos 3D/2D sem afetar fotografia ESO.
const hands3d=await read('first-person-hands-3d.js');
assert.match(main,/createFirstPersonHands3D/,'novo viewmodel 3D integrado');
assert.match(main,/handsSetting==='3d'\?'3d':'rig'/,'rig gratuito padrão e versões anteriores disponíveis');
assert.match(hands3d,/mergeGeometries\(parts,false\)/,'uma malha por mão via mesh merging');
assert.match(hands3d,/vertexColors:true/,'cores por vértice sem nova textura');
assert.match(hands3d,/fingerCount=5/,'cinco dedos distintos por mão');
assert.match(hands3d,/const fingers=\[/,'quatro dedos articulados mais polegar');
assert.match(hands3d,/const t0=\[/,'polegar 3D com duas falanges');
assert.match(hands3d,/const left=new THREE\.Mesh\(geometry,material\),right=new THREE\.Mesh\(geometry,material\)/,'as duas mãos compartilham geometria');
assert.match(hands3d,/textureCount:0/,'mãos 3D não carregam texturas');
assert.match(hands3d,/camera\.add\(left,right\)/,'mãos em primeira pessoa presas à câmera');
assert.match(hands3d,/hand\.renderOrder=30/,'renderizar mãos por cima do panorama');
assert.match(hands3d,/hand\.visible=false/,'mãos ocultas durante viagem');
assert.match(await read('performance-panel.js'),/triângulos por mão/,'diagnóstico expõe peso gráfico 3D');

// v0.9.13 · GLB CC0 original no repositório, sem chamadas a assets externos.
const rig=await read('first-person-hands-rig.js');
assert.match(main,/createRiggedFirstPersonHands/,'mãos rigadas integradas à câmera');
assert.match(rig,/const ASSET_URL='\/models\/wrad-arms\.glb'/,'asset local servido pela Cloudflare');
assert.match(rig,/new GLTFLoader\(\)\.load/,'carregador local Three.js');
assert.match(rig,/FINGER_NAMES=/,'cinco dedos com juntas identificáveis');
assert.match(rig,/obj\.isBone/,'juntas reais disponíveis');
assert.match(rig,/d\.bone\.quaternion\.copy\(d\.base\)\.multiply\(_rotation\)/,'animação de dedos por quaternion');
assert.match(rig,/rigRoot\.visible=false/,'rig oculto durante viagem');
assert.match(rig,/depthTest:false,depthWrite:false/,'mãos não atrapalham cena e Nox');
assert.match(rig,/owner\.disposed=true/,'dispose seguro');
assert.match(await read('performance-panel.js'),/juntas de dedos/,'contadores do rig no debug');
