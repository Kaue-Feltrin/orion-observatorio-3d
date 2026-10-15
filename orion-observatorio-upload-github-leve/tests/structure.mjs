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
assert.match(main, /scene\.attach\(camera\)/, 'travel remains in world space');
assert.match(main, /const foregroundParticles = new THREE.Group\(\)/, 'near-camera volume');
assert.match(main, /camera\.updateWorldMatrix\(true,false\)/, 'star projection current pose');
assert.doesNotMatch(main, /const intendedX=smooth\.x\*8\.8/, 'remove old translation-only camera');

assert.match(main, /createCosmicAtmosphere\(scene/,'GLSL gas');
assert.match(main, /selectiveBloom\.render\(\)/,'selective bloom render');
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
