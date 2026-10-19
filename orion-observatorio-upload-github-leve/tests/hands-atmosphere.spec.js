import {test,expect} from '@playwright/test';
const base='http://127.0.0.1:4173/?debug=1&quality=eco-plus&hands=mesh&handsMotion=perspective';
async function ready(page){
 await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:20000}).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__orionDepthDebug.layers.filter(l=>l.userData.volumeFragment&&l.visible).every(l=>l.material.map.image?.naturalWidth>0))).toBe(true);
 await page.evaluate(()=>{document.querySelector('#debug').hidden=true;});
}
async function aperture(page){return page.evaluate(()=>{const p=window.__orionHandsDebug.rigs[0].measure().landmarks;return p.indexTip.distanceTo(p.thumbTip);});}
async function hover(page){const b=await page.locator('#heraldTarget').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.hoverBlend)).toBeGreaterThan(.997);}

test('esquerda fecha os dedos no hover e reabre em três enquadramentos',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[1920,1080],[1920,951],[390,844]]){
  await page.setViewportSize({width,height});await page.goto(base);await ready(page);await page.mouse.move(15,20);
  const before=await aperture(page);await page.screenshot({path:test.info().outputPath(`${width}x${height}-neutral.png`)});
  await hover(page);const closed=await aperture(page);expect(closed/before).toBeLessThan(.85);expect(closed/before).toBeGreaterThan(.65);
  expect(await page.evaluate(()=>window.__orionHandsDebug.meshes.every(m=>m.material.opacity===.38))).toBe(true);
  await page.screenshot({path:test.info().outputPath(`${width}x${height}-pointing.png`)});
  await page.mouse.move(15,20);await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.leftFollow)).toBeLessThan(.003);
  const returned=await aperture(page);expect(returned/before).toBeGreaterThan(.94);expect(returned/before).toBeLessThan(1.06);
  await page.screenshot({path:test.info().outputPath(`${width}x${height}-returned.png`)});
  console.log('LEFT_CLOSURE',JSON.stringify({width,height,before,closed,returned,ratio:closed/before}));
 }expect(errors).toEqual([]);
});

test('cinco planos ESO no Eco+ dão paralaxe distinta sem esconder a Nox',async({page})=>{
 test.setTimeout(60000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});await page.goto(base);await ready(page);
 const read=()=>page.evaluate(()=>({layers:window.__orionDepthDebug.layers.filter(l=>l.userData.volumeFragment&&l.visible).map(l=>({
  id:l.userData.spec.id,z:l.position.z,order:l.renderOrder,offset:l.userData.parallaxOffsetX/(26-l.position.z),opacity:l.material.opacity,
  loaded:l.material.map.image.naturalWidth,singlePass:l.material.forceSinglePass})),photo:window.__orionRespirationDebug.nebula.material.opacity,
  calls:window.__orionPerformance.drawCalls,textures:window.__orionPerformance.textures}));
 await page.mouse.move(1800,400);await expect.poll(async()=>{const d=await read();return d.layers.find(l=>l.id==='06').offset;}).toBeLessThan(-.07);
 const right=await read();await page.screenshot({path:test.info().outputPath('1920-parallax-right.png')});
 await page.mouse.move(120,400);await expect.poll(async()=>{const d=await read();return d.layers.find(l=>l.id==='06').offset;}).toBeGreaterThan(.07);
 const left=await read();await page.screenshot({path:test.info().outputPath('1920-parallax-left.png')});
 expect(left.layers).toHaveLength(5);expect(left.layers.map(l=>l.z)).toEqual([-342,-75,-185,-130,-42]);expect(left.photo).toBe(1);
 for(const id of ['05','06']){const a=right.layers.find(l=>l.id===id),b=left.layers.find(l=>l.id===id);expect(a.loaded).toBeGreaterThan(100);expect(a.singlePass).toBe(true);expect(a.opacity).toBeLessThan(.12);expect(a.offset).toBeLessThan(0);expect(b.offset).toBeGreaterThan(0);}
 expect(left.layers.find(l=>l.id==='06').offset).toBeGreaterThan(left.layers.find(l=>l.id==='05').offset*1.4);
 console.log('ATMOSPHERE_DEPTH',JSON.stringify({left,right}));expect(errors).toEqual([]);
 await hover(page);await page.locator('#heraldTarget').click({force:true});await expect(page).toHaveURL(/ficha\.html/,{timeout:10000});
});

test('reduced-motion mantém esquerda imóvel e orçamento leve não carrega planos novos',async({page})=>{
 test.setTimeout(60000);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);await ready(page);
 const before=await aperture(page);await hover(page);expect(await aperture(page)).toBeCloseTo(before,6);
 expect(await page.evaluate(()=>window.__orionHandsDebug.state.leftFollow)).toBe(0);
 expect(await page.evaluate(()=>window.__orionHandsDebug.rigs[0].bones.every(b=>b.rotation.z===0))).toBe(true);
 const sample=()=>page.evaluate(()=>window.__orionDepthDebug.layers.filter(l=>l.userData.volumeFragment&&l.visible).map(l=>[...l.position.toArray(),l.material.opacity]));
 const frozen=await sample();await page.waitForTimeout(300);expect(await sample()).toEqual(frozen);
 for(const query of ['quality=eco','quality=lite','quality=eco-plus&foreground=off']){
  const requests=[];const listen=r=>{if(/eso-gas-0[56]/.test(r.url()))requests.push(r.url());};page.on('request',listen);
  await page.goto('http://127.0.0.1:4173/?debug=1&hands=mesh&handsMotion=perspective&'+query);await ready(page);
  expect(await page.evaluate(()=>window.__orionDiagnostic.snapshot().volumeLayers)).toBe(2);expect(requests).toEqual([]);page.off('request',listen);
 }
});
