import {test,expect} from '@playwright/test';

async function ready(page){
  await expect.poll(async()=>page.evaluate(()=>{
    const s=window.__orionHandsDebug?.state;
    return s?.loadError|| (s?.loaded?'loaded':'loading');
  }),{timeout:18000}).toBe('loaded');
}

test('v0.9.15 David Fischer: GLB local, ossos completos e enquadramento FPS medido',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1748,height:864});
  const asset=await page.request.get('http://127.0.0.1:4173/models/david-fischer-fps-hands.glb');
  expect(asset.ok()).toBe(true);
  const data=await asset.body();
  expect(data.length).toBeGreaterThan(370000);
  expect(data.subarray(0,4).toString()).toBe('glTF');
  await page.goto('http://127.0.0.1:4173/?quality=eco-plus&hands=fps&debug=1',{waitUntil:'domcontentloaded'});
  await ready(page);
  await page.waitForTimeout(220);
  const metrics=await page.evaluate(()=>{
    const h=window.__orionHandsDebug;
    return {
      state:h.state,meshes:h.meshes.map(x=>({skinned:x.isSkinnedMesh,
        vertices:x.geometry.getAttribute('position')?.count,
        colors:x.geometry.getAttribute('color')?.itemSize})),
      bones:h.driven.slice(0,6).map(x=>x.bone.name),
      credit:!!document.querySelector('#fpsHandsCredit:not([hidden])'),
      layers:window.__orionDiagnostic.snapshot().volumeLayers,
      bloom:window.__orionDiagnostic.snapshot().bloomRest
    };
  });
  console.log('FPS_DAVID_LANDMARKS',JSON.stringify(metrics));
  expect(metrics.state.loaded).toBe(true);
  expect(metrics.state.mode).toBe('fps');
  expect(metrics.state.joints).toBeGreaterThanOrEqual(60);
  expect(metrics.state.fingerJoints).toBeGreaterThanOrEqual(25);
  expect(metrics.state.drawSurfaces).toBe(1);
  expect(metrics.state.textureCount).toBe(0);
  expect(metrics.meshes).toHaveLength(1);
  expect(metrics.meshes[0].skinned).toBe(true);
  expect(metrics.meshes[0].vertices).toBeGreaterThan(4000);
  expect(metrics.meshes[0].colors).toBe(4);
  expect(metrics.credit).toBe(true);
  expect(metrics.layers).toBe(5);
  expect(metrics.bloom).toBe(true);
  const f=metrics.state.framing;
  expect(f).toBeTruthy();
  for(const key of ['wristLeft','wristRight','tipLeft','tipRight'])expect(f[key]).toBeTruthy();
  expect(f.wristLeft.x).toBeLessThan(-.30);
  expect(f.wristRight.x).toBeGreaterThan(.30);
  for(const side of ['Left','Right']){
    expect(f['wrist'+side].y).toBeGreaterThan(-.99);
    expect(f['wrist'+side].y).toBeLessThan(-.61);
    expect(f['tip'+side].y).toBeGreaterThan(f['wrist'+side].y+.055);
    expect(f['tip'+side].y).toBeLessThan(.24);
  }
  await page.evaluate(()=>document.querySelector('#debug').style.display='none');
  await page.screenshot({path:'test-results/v0915-david-fps-preview.png'});
  expect(errors).toEqual([]);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.15 sem mãos não solicita arquivo David e oculta atribuição contextual',async({page})=>{
  const requests=[];
  page.on('request',r=>{if(r.url().includes('david-fischer-fps-hands.glb'))requests.push(r.url());});
  await page.goto('http://127.0.0.1:4173/?quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  expect(requests).toEqual([]);
  await expect(page.locator('#fpsHandsCredit')).toBeHidden();
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.15 rig FPS respeita movimento reduzido',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&hands=fps',{waitUntil:'domcontentloaded'});
  await ready(page);
  const a=await page.evaluate(()=>({
    pose:window.__orionHandsDebug.driven.slice(0,5).map(x=>x.bone.quaternion.toArray()),
    root:window.__orionHandsDebug.root.position.toArray(),
    moving:window.__orionHandsDebug.state.motionEnabled
  }));
  await page.mouse.move(1430,730);
  await page.waitForTimeout(250);
  const b=await page.evaluate(()=>({
    pose:window.__orionHandsDebug.driven.slice(0,5).map(x=>x.bone.quaternion.toArray()),
    root:window.__orionHandsDebug.root.position.toArray()
  }));
  expect(a.moving).toBe(false);
  expect(b).toEqual({pose:a.pose,root:a.root});
  await page.locator('#heraldTarget').click({force:true});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug.state.visible),{timeout:1500}).toBe(false);
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});
