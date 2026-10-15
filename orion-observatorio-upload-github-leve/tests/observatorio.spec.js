
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

test('estrela distante aponta no mundo, mostra hover e seleciona via raycaster',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1');
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady)).toBe('1');
  const state=await page.evaluate(()=>({
    starZ:window.__orionStarDebug.heraldGroup.position.z,
    backdrop:window.__orionDepthDebug.layers.find(x=>x.userData.layerName.includes('ESO')).position.z,
    pickLayer:window.__orionStarDebug.heraldPickSprite.layers.mask,
    starX:document.querySelector('#heraldTarget').getBoundingClientRect().x
  }));
  expect(state.starZ).toBeLessThan(-400);
  expect(state.backdrop).toBeLessThan(state.starZ);
  expect(state.pickLayer).toBe(4);
  const target=page.locator('#heraldTarget');
  const box=await target.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await expect(page.locator('body')).toHaveClass(/star-aimed/);
  await expect(page.locator('#heraldCard')).toHaveClass(/visible/);
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await expect.poll(async()=>page.evaluate(()=>window.__orionStarDebug.journey.active)).toBe(true);
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
  const trip=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-last-trip-v09')));
  expect(trip.passedGasLayers).toBeGreaterThanOrEqual(5);
  expect(trip.endZ).toBeLessThan(-400);
  expect(trip.endZ).toBeGreaterThan(trip.starZ+40);
});

test('respiração cósmica anima apenas véus e mantém a fotografia ESO intacta',async({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const sample=await page.evaluate(async()=>{
    const r=window.__orionRespirationDebug;
    const a={star:r.state.star,gas:r.state.gas,beacon:r.state.beacon,alpha:r.veils[0].mesh.material.opacity,photo:r.nebula.material.opacity,
      glow:r.beaconGlow.material.opacity,
      twinkle:window.__orionDepthDebug.foregroundParticles.children[0].geometry.getAttribute('aTwinkleRate').count};
    await new Promise(resolve=>setTimeout(resolve,1200));
    const middle={star:r.state.star,alpha:r.veils[0].mesh.material.opacity};
    await new Promise(resolve=>setTimeout(resolve,1200));
    const b={star:r.state.star,gas:r.state.gas,beacon:r.state.beacon,alpha:r.veils[0].mesh.material.opacity,photo:r.nebula.material.opacity,glow:r.beaconGlow.material.opacity};
    return {a,middle,b};
  });
  expect(sample.a.photo).toBe(1);expect(sample.b.photo).toBe(1);
  const range=items=>Math.max(...items)-Math.min(...items);
  expect(range([sample.a.alpha,sample.middle.alpha,sample.b.alpha])).toBeGreaterThan(.00003);
  expect(range([sample.a.star,sample.middle.star,sample.b.star])).toBeGreaterThan(.001);
  expect(sample.a.twinkle).toBe(20);
  expect(errors).toEqual([]);
});

test('movimento reduzido suspende pulso e mantém seleção acessível',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const result=await page.evaluate(()=>({
    state:window.__orionRespirationDebug.state,
    gas:window.__orionAtmosphereDebug.atmosphere.layers[0].material.uniforms.uBreath.value
  }));
  expect(result.state.beacon).toBe(0);
  expect(result.state.gas).toBe(1);
  expect(result.gas).toBe(1);
  await expect(page.locator('#heraldTarget')).toBeAttached();
});

test('desempenho limita pixels e draw calls sem apagar a nebulosa ESO',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const p=await page.evaluate(()=>{
    const q=window.__orionPerformance;
    const canvas=document.querySelector('#world canvas');
    return {mode:q.mode,maxPixels:q.maxPixels,pixels:canvas.width*canvas.height,
      visibleGas:q.visibleGas,photograph:window.__orionRespirationDebug.nebula.material.opacity};
  });
  expect(p.mode).toBe('balanced');
  expect(p.pixels).toBeLessThanOrEqual(p.maxPixels+8000);
  expect(p.visibleGas).toBe(2);
  expect(p.photograph).toBe(1);
});

test('qualidade leve mantém estrela e viagem acessíveis',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?quality=lite&debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const p=await page.evaluate(()=>({
    mode:window.__orionPerformance.mode,
    visibleGas:window.__orionPerformance.visibleGas,
    pixels:document.querySelector('#world canvas').width*document.querySelector('#world canvas').height,
    cap:window.__orionPerformance.maxPixels
  }));
  expect(p.mode).toBe('lite');
  expect(p.visibleGas).toBe(1);
  expect(p.pixels).toBeLessThanOrEqual(p.cap+8000);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('composição limpa reduz estrelas e mantém as pontas luminosas em movimento',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const x=await page.evaluate(async()=>{
    const d=window.__orionCinematicDebug;
    const mat=d.spikes.primary.material;
    const first=mat.rotation;
    await new Promise(resolve=>setTimeout(resolve,950));
    const second=mat.rotation;
    return {first,second,bg:d.starsGroup.children.map(x=>x.geometry.attributes.position.count),
      close:d.foregroundParticles.children[0].geometry.attributes.position.count,
      eso:window.__orionRespirationDebug.nebula.material.opacity,
      gas:window.__orionPerformance.visibleGas,
      bloom:window.__orionAtmosphereDebug.selectiveBloom.state.intensity};
  });
  expect(x.bg).toEqual([720,205,65]);
  expect(x.close).toBe(20);
  expect(Math.abs(x.second-x.first)).toBeGreaterThan(.008);
  expect(x.eso).toBe(1);
  expect(x.gas).toBe(2);
  expect(x.bloom).toBeLessThan(.3);
  expect(errors).toEqual([]);
  await page.screenshot({path:'test-results/observatorio-clean-v092.png'});
});

test('spikes não giram com preferência de movimento reduzido',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const a=await page.evaluate(()=>window.__orionCinematicDebug.spikes.primary.material.rotation);
  await page.waitForTimeout(500);
  const b=await page.evaluate(()=>window.__orionCinematicDebug.spikes.primary.material.rotation);
  expect(a).toBe(b);
});
