import {test,expect} from '@playwright/test';

const url='http://127.0.0.1:4173/';
async function loadFps(page,params=''){
  await page.goto(url+'?quality=eco-plus&hands=fps&debug=1'+params,{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>{
    const s=window.__orionHandsDebug?.state;
    return s?.loaded?'loaded':s?.loadError||'loading';
  }),{timeout:20000}).toBe('loaded');
}

test('v0.9.15 GLB original David Fischer e rig FPS com atribuição correta',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const asset=await page.request.get(url+'models/david-fischer-fps-hands.glb');
  expect(asset.ok()).toBe(true);
  const b=await asset.body();
  expect(b.subarray(0,4).toString()).toBe('glTF');
  expect(b.length).toBeGreaterThan(250000);
  await page.setViewportSize({width:1748,height:864});
  await loadFps(page);
  const data=await page.evaluate(()=>{
    const h=window.__orionHandsDebug,s=window.__orionDiagnostic.snapshot();
    const c=window.__orionDepthDebug.camera;
    c.updateMatrixWorld(true);h.root.updateMatrixWorld(true);
    const f=h.state.framing;
    return {state:h.state,meshes:h.meshes.map(m=>({isSkinnedMesh:m.isSkinnedMesh,
      vertices:m.geometry.attributes.position.count,triangles:(m.geometry.index?.count||m.geometry.attributes.position.count)/3,
      vertexColors:m.geometry.attributes.color?.itemSize,material:m.material.type})),
      bones:h.driven.slice(0,4).map(d=>d.bone.name),framing:f,
      attached:h.root.parent===c,snapshot:s,credit:document.querySelector('#fpsHandsCredit')?.hidden};
  });
  console.log('DAVID_FISCHER_FPS_DIAGNOSTIC',JSON.stringify(data));
  expect(data.state.loadError).toBeNull();
  expect(data.state.mode).toBe('fps');
  expect(data.state.loaded).toBe(true);
  expect(data.state.joints).toBeGreaterThanOrEqual(63);
  expect(data.state.fingerJoints).toBeGreaterThanOrEqual(25);
  expect(data.state.drawSurfaces).toBeGreaterThanOrEqual(1);
  expect(data.state.triangles).toBeGreaterThan(5000);
  expect(data.state.triangles).toBeLessThan(10500);
  expect(data.meshes.every(m=>m.isSkinnedMesh&&m.vertexColors===4)).toBe(true);
  expect(data.attached).toBe(true);
  expect(data.credit).toBe(false);
  expect(data.snapshot.handsMode).toBe('fps');
  expect(data.snapshot.volumeLayers).toBe(3);
  expect(data.snapshot.bloomRest).toBe(true);
  expect(errors).toEqual([]);
  expect(data.framing.wristLeft).toBeTruthy();
  expect(data.framing.wristRight).toBeTruthy();
  expect(data.framing.tipLeft).toBeTruthy();
  expect(data.framing.tipRight).toBeTruthy();
  await page.evaluate(()=>{document.querySelector('#debug').style.display='none';});
  await page.screenshot({path:'test-results/v0915-david-1748.png'});
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.15 captura real 1920×951 com Nox sem obstrução',async({page})=>{
  await page.setViewportSize({width:1920,height:951});
  await page.goto(url+'?quality=eco-plus&hands=fps',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await expect(page.locator('#fpsHandsCredit')).toBeVisible({timeout:15000});
  await page.waitForTimeout(700);
  await page.screenshot({path:'test-results/v0915-david-1920-publico.png'});
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.15 anima dedos do GLB e para ao respeitar movimento reduzido',async({page})=>{
  await loadFps(page);
  const before=await page.evaluate(()=>window.__orionHandsDebug.driven.slice(0,5).map(d=>d.bone.quaternion.toArray()));
  await page.waitForTimeout(290);
  const after=await page.evaluate(()=>window.__orionHandsDebug.driven.slice(0,5).map(d=>d.bone.quaternion.toArray()));
  expect(after).not.toEqual(before);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:18000}).toBe(true);
  const fixed=await page.evaluate(()=>window.__orionHandsDebug.driven.slice(0,5).map(d=>d.bone.quaternion.toArray()));
  await page.waitForTimeout(260);
  const fixed2=await page.evaluate(()=>window.__orionHandsDebug.driven.slice(0,5).map(d=>d.bone.quaternion.toArray()));
  expect(fixed2).toEqual(fixed);
});

test('v0.9.15 desligado não baixa GLB; modo VR permanece disponível',async({page})=>{
  const requests=[];
  page.on('request',request=>{if(request.url().includes('david-fischer-fps-hands.glb'))requests.push(request.url());});
  await page.goto(url+'?quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  expect(requests).toHaveLength(0);
  expect(await page.locator('#fpsHandsCredit').isVisible()).toBe(false);
  await page.goto(url+'?quality=eco-plus&hands=vr&debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:18000}).toBe(true);
  expect(await page.evaluate(()=>window.__orionDiagnostic.snapshot().handsMode)).toBe('vr');
  expect(requests).toHaveLength(0);
});

test('v0.9.15 pose aberta e relaxada alteram falanges sem trocar GLB',async({page})=>{
  const samples=[];
  for(const pose of ['open','relaxed']){
    await loadFps(page,'&fpsPose='+pose);
    await page.waitForTimeout(100);
    samples.push(await page.evaluate(()=>{
      const h=window.__orionHandsDebug;
      return{pose:h.state.pose,rot:h.driven[0].bone.quaternion.toArray(),
        file:h.meshes[0].geometry.attributes.position.count};
    }));
  }
  expect(samples.map(s=>s.pose)).toEqual(['open','relaxed']);
  expect(samples[0].file).toEqual(samples[1].file);
  expect(samples[0].rot).not.toEqual(samples[1].rot);
});
