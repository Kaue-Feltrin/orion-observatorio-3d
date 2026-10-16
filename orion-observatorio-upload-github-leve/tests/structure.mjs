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
assert.match(main,/nebulaVolume\.update\(time\)/,'nuvens independentes');
assert.match(main,/nebulaVolume\.resize\(\)/,'enquadramento na projeção');
assert.match(main,/Math\.exp\(-Math\.max\(\.001,delta\)\*18\)/,'mouse responde rapidamente');
assert.match(main,/cachedCardHeight/,'evitar reflow por quadro');
assert.doesNotMatch(main,/card\.offsetHeight-18/,'não ler layout a cada frame');
assert.match(main,/fpsCap:60/,'sem limite rígido de 30 fps');
assert.match(main,/selectiveBloom\.render\(travelling\|\|bloomTick%2===1,/,'bloom fora do caminho crítico da câmera');
assert.match(await read('selective-bloom.js'),/function render\(refreshBloom=true,enableBloom=true\)/,'renderização seletiva temporizada e desligável');
assert.match(await read('nebula-volume.js'),/const selected=quality===.lite./,'qualidade variável');
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
assert.match(await read('nebula-volume.js'),/\['lite','eco','eco-plus'\]/,'Eco+ mantém dois recortes em profundidade');
assert.match(await read('performance-panel.js'),/Eco\+ sem bloom/,'comparativo entre Eco+ com e sem bloom');
