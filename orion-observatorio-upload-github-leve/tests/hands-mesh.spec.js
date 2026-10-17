import {test,expect} from '@playwright/test';
const url='http://127.0.0.1:4173/';
test('v0.9.19 malha deformável com arte original, Nox e enquadramento',async({page})=>{
  test.setTimeout(110000);
  for(const viewport of [{width:1755,height:865},{width:1920,height:951}]){
    await page.setViewportSize(viewport);
    await page.goto(url+'?debug=1&quality=eco-plus&hands=mesh',{waitUntil:'domcontentloaded'});
    await expect.poll(async()=>page.evaluate(()=>{
      const s=window.__orionHandsDebug?.state;
      return s?.loadError||(s?.loaded?'loaded':'pending');
    }),{timeout:22000}).toBe('loaded');
    const before=await page.evaluate(()=>{
      const h=window.__orionHandsDebug;
      return{state:{...h.state},vertices:Array.from(h.meshes[0].geometry.attributes.position.array)};
    });
    expect(before.state.mode).toBe('mesh');
    expect(before.state.triangles).toBe(3072);
    expect(before.state.textureCount).toBe(1);
    expect(before.state.drawSurfaces).toBe(2);
    await page.mouse.move(viewport.width*.9,viewport.height*.4,{steps:10});
    await page.waitForTimeout(320);
    const moved=await page.evaluate(()=>Array.from(window.__orionHandsDebug.meshes[0].geometry.attributes.position.array));
    expect(moved.some((x,i)=>Math.abs(x-before.vertices[i])>1e-6)).toBe(true);
    await page.evaluate(()=>{document.querySelector('#debug')?.setAttribute('hidden','');});
    await page.screenshot({path:'test-results/v0919-mesh-'+viewport.width+'x'+viewport.height+'.png'});
  }
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.19 modo off não carrega textura WebP das mãos',async({page})=>{
  const urls=[];
  page.on('request',r=>{if(r.url().includes('orion-hands-frame.webp'))urls.push(r.url())});
  await page.goto(url+'?debug=1&quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:16000}).toBe('1');
  expect(urls).toEqual([]);
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.enabled)).toBe(false);
});

test('v0.9.19 reduced motion desativa deformação dos vértices',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(url+'?debug=1&quality=eco-plus&hands=mesh',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug?.state?.loaded),{timeout:22000}).toBe(true);
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.maxVertexDelta)).toBe(0);
});
