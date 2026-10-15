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
const names = ['00-starfield-base.jpg','01-nebula-far.webp','02-nebula-main.webp','03-mid-clouds.webp','04-front-fog.png','05-star-dust.png','06-star-glow.png'];
for (const n of names) {
  const f='public/assets/'+n;
  assert.ok((await stat(join(base,f))).size>9000, 'missing/empty '+f);
  assert.ok(main.includes('/assets/'+n) || css.includes('/assets/'+n),'unreferenced '+n);
}
const forbidden = (await readdir(join(base,'public/assets'))).filter(x=>x==='masters');
assert.equal(forbidden.length,0,'Masters must not be deployed');
console.log('OK: arquivos, PNGs, Vite multipágina e Three.js local verificados.');
