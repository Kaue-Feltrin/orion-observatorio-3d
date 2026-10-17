import {test,expect} from '@playwright/test';
const url='http://127.0.0.1:4173/';

test('v0.9.20 duas mãos independentes, texturas, opacidade e Nox',async({page})=>{
  test.setTimeout(110000);
  for(const viewport of [{width:1755,height:865},{width:1920,height:951}]){
    await page.setViewportSize(viewport);
    await page.goto(url+'?debug=1&quality=eco-plus&hands=mesh',{waitUntil:'domcontentloaded'});
    await expect.poll(async()=>page.evaluate(()=>{
      const s=window.__orionHandsDebug?.state;
      return s?.loadError||(s?.loaded?'loaded':'pending');
    }),{timeout:24000}).toBe('loaded');
    const before=await page.evaluate(()=>{
      const h=window.__orionHandsDebug;
      return {state:{...h.state},
        names:h.meshes.map(m=>m.name),
        heights:h.meshes.map(m=>m.scale.y),
        positions:h.meshes.map(m=>[m.position.x,m.position.y]),
        alphas:h.meshes.map(m=>m.material.opacity),
        separateMaps:h.meshes[0].material.map!==h.meshes[1].material.map,
        vertices:h.meshes.map(m=>Array.from(m.geometry.attributes.position.array))};
    });
    expect(before.state.mode).toBe('mesh');
    expect(before.state.pose).toBe('feminine-asymmetric');
    expect(before.state.triangles).toBe(3552);
    expect(before.state.textureCount).toBe(2);
    expect(before.state.drawSurfaces).toBe(2);
    expect(before.separateMaps).toBe(true);
    expect(before.names).toEqual(['OrionFeminineLeftFraming','OrionFeminineRightPointing']);
    expect(before.alphas[0]).toBeCloseTo(.40,1);
    expect(before.alphas[1]).toBeCloseTo(.51,1);
    expect(before.positions[0][0]).toBeLessThan(before.positions[1][0]);
    expect(before.positions[1][1]).toBeGreaterThan(before.positions[0][1]);
    await page.mouse.move(viewport.width*.9,viewport.height*.4,{steps:10});
    await page.waitForTimeout(380);
    const after=await page.evaluate(()=>window.__orionHandsDebug.meshes.map(m=>
      Array.from(m.geometry.attributes.position.array)));
    expect(after.every((vertices,i)=>vertices.some((x,j)=>Math.abs(x-before.vertices[i][j])>1e-6))).toBe(true);
    await page.evaluate(()=>{document.querySelector('#debug')?.setAttribute('hidden','');});
    await page.screenshot({path:'test-results/v0920-feminine-hands-'+viewport.width+'x'+viewport.height+'.png'});
  }
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.20 hands=off não baixa os dois assets',async({page})=>{
  const urls=[];
  page.on('request',r=>{if(/left-hand-ethereal|right-hand-pointing/.test(r.url()))urls.push(r.url())});
  await page.goto(url+'?debug=1&quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:16000}).toBe('1');
  expect(urls).toEqual([]);
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.enabled)).toBe(false);
});

test('v0.9.20 movimento reduzido mantém os dedos estáticos',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(url+'?debug=1&quality=eco-plus&hands=mesh',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug?.state?.loaded),{timeout:24000}).toBe(true);
  await page.waitForTimeout(250);
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.maxVertexDelta)).toBe(0);
  expect(await page.evaluate(()=>window.__orionHandsDebug.meshes.map(m=>m.rotation.z))).toEqual([0,0]);
});
