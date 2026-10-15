
test('diagnostico de inicializacao no Chromium',async({page})=>{
  const errors=[];const warnings=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')warnings.push(msg.text());});
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const state=await page.evaluate(()=>({
    sceneReady:document.documentElement.dataset.sceneReady,
    error:document.documentElement.dataset.sceneError,
    loadIssue:document.querySelector('#loadIssue')?.innerText,
    loading:document.querySelector('#loading')?.innerText,
    canvas:document.querySelectorAll('#world canvas').length,
    ua:navigator.userAgent
  }));
  console.log('WEBGL DIAGNOSTICS',JSON.stringify({state,errors,warnings}));
  expect(state.sceneReady,JSON.stringify({state,errors,warnings})).toBe('1');
});
import { test, expect } from '@playwright/test';

test('observatório 3D inicializa com Canvas e estrela', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil:'domcontentloaded' });
  await expect(page.locator('#heraldTarget')).toBeAttached();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.sceneReady),{timeout:14000}).toBe('1');
  await expect(page.locator('#world canvas')).toHaveCount(1);
  await expect(page.locator('#loadIssue')).toBeHidden();
  expect(errors).toEqual([]);
  await page.screenshot({path:'test-results/observatorio-inicial.png'});
});

test('clique na estrela realiza transição para a ficha', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.sceneReady)).toBe('1');
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/, {timeout:9000});
});

test('mouse move cambia yaw e deslocamento, mantendo projecao da estrela', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.sceneReady), {timeout:14000}).toBe('1');
  const before = await page.evaluate(() => window.__orionDepthDebug.rigYaw.rotation.y);
  await page.mouse.move(1210, 250);
  await expect.poll(async () => page.evaluate(() => window.__orionDepthDebug.rigYaw.rotation.y),{timeout:6000})
    .toBeLessThan(before - .015);
  const state=await page.evaluate(() => ({
    yaw:window.__orionDepthDebug.rigYaw.rotation.y,
    x:window.__orionDepthDebug.rigRoot.position.x,
    particles:window.__orionDepthDebug.foregroundParticles.children.length,
    targetX:document.querySelector('#heraldTarget').getBoundingClientRect().x
  }));
  expect(state.x).toBeGreaterThan(1);
  expect(state.particles).toBe(1);
  expect(Number.isFinite(state.targetX)).toBe(true);
});

test('cinco planos animados, bloom seletivo e controle de atmosfera',async({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const state=await page.evaluate(()=>({
    gasLayers:window.__orionAtmosphereDebug.atmosphere.layers.length,
    animated:window.__orionAtmosphereDebug.atmosphere.layers.every(l=>!!l.material.uniforms.uTime),
    bloom:window.__orionAtmosphereDebug.selectiveBloom.state.intensity,
    layerToggles:document.querySelectorAll('.layer-inspector input[type=checkbox]').length,
    sliders:document.querySelectorAll('input[type=range]').length
  }));
  expect(state.gasLayers).toBe(5);expect(state.animated).toBe(true);
  expect(state.bloom).toBeGreaterThan(0);expect(state.layerToggles).toBeGreaterThanOrEqual(11);
  expect(state.sliders).toBeGreaterThanOrEqual(4);expect(errors).toEqual([]);
});
