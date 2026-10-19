import {test,expect} from '@playwright/test';
const base='http://127.0.0.1:4173/';
const query='?debug=1&quality=eco-plus&hands=mesh&handsMotion=perspective';
async function ready(page){
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:24000}).toBe('1');
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.loaded),{timeout:24000}).toBe(true);
  await page.evaluate(()=>{document.querySelector('#debug').hidden=true;});
}
async function aim(page){
  const box=await page.locator('#heraldTarget').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.hoverBlend)).toBeGreaterThan(.997);
}
async function watch(page){
  await page.evaluate(()=>{
    const samples=[];
    function sample(){
      const d=window.__orionStarDebug,h=window.__orionHandsDebug;
      if(d.selection.state.active){
        samples.push({p:d.selection.state.progress,reach:h.state.selectionReach,press:h.state.selectionPress,
          anticipation:h.state.selectionAnticipation,followThrough:h.state.selectionFollowThrough,
          blend:h.state.rightBlend,z:h.meshes?.[1]?.position.z,opacity:h.meshes?.[1]?.material.opacity,
          map:h.meshes?.[1]?.material.map.uuid,draws:h.state.drawSurfaces,
          journey:d.journey.active,fov:window.__orionDepthDebug.camera.fov,
          light:d.selection.rings.map(r=>r.material.opacity)});
      }
      if(d.journey.active){
        sessionStorage.setItem('orion-selection-test',JSON.stringify({samples,activations:d.selection.state.activations,
          completed:d.selection.state.completed,hidden:!d.selection.root.visible,selecting:h.state.selecting}));return;
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
}
async function result(page){
  await expect(page).toHaveURL(/ficha\.html/,{timeout:10000});
  const data=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-selection-test')));
  expect(data.activations).toBe(1);expect(data.completed).toBe(true);
  expect(data.hidden).toBe(true);expect(data.selecting).toBe(false);
  expect(data.samples.length).toBeGreaterThan(0);
  expect(data.samples.every(s=>!s.journey)).toBe(true);
  const trip=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-last-trip-v09')));
  expect(trip.passedGasLayers).toBeGreaterThanOrEqual(5);
  console.log('SELECTION_SAMPLES',JSON.stringify(data));return data.samples;
}

test('clique real confirma com pressão e onda de luz antes da viagem, sem duplicar',async({page})=>{
  test.setTimeout(50000);const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  await page.goto(base+query);await ready(page);
  await page.mouse.click(15,200);expect(await page.evaluate(()=>window.__orionStarDebug.selection.state.activations)).toBe(0);
  const target=page.locator('#heraldTarget');await aim(page);
  const box=await target.boundingBox();
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2,{button:'right'});
  expect(await page.evaluate(()=>window.__orionStarDebug.selection.state.activations)).toBe(0);
  await watch(page);
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  // Um segundo evento no mesmo alvo não reinicia nem repete a viagem.
  await target.dispatchEvent('click',{detail:1});
  const samples=await result(page);
  expect(samples.some(s=>s.press>.8&&s.blend<.53)).toBe(true);
  expect(samples.every(s=>s.blend<=.60)).toBe(true);
  expect(samples.some(s=>s.anticipation>.1)).toBe(true);
  expect(samples.some(s=>s.followThrough>.5&&s.press<.5)).toBe(true);
  expect(samples.some(s=>s.z>-2.46)).toBe(true);
  expect(samples.every(s=>s.opacity===.38&&s.draws===2)).toBe(true);
  expect(samples.every(s=>s.fov===51)).toBe(true);
  expect(new Set(samples.map(s=>s.map)).size).toBe(1);
  expect(samples.some(s=>s.light[0]>.2)).toBe(true);expect(errors).toEqual([]);
});

test('teclado seleciona sem exigir hover e mantém navegação',async({page})=>{
  test.setTimeout(45000);await page.goto(base+query);await ready(page);await watch(page);
  await page.locator('#heraldTarget').focus();await page.keyboard.press('Enter');
  const samples=await result(page);expect(samples.some(s=>s.reach>.8)).toBe(true);
});

test('movimento reduzido confirma sem avanço, pressão ou expansão luminosa',async({page})=>{
  test.setTimeout(45000);await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+query);await ready(page);await watch(page);
  await page.locator('#heraldTarget').click({force:true});
  const samples=await result(page);
  expect(samples.every(s=>s.press===0&&s.reach===0&&s.z===-2.5)).toBe(true);
});

test('mãos desligadas mantêm confirmação luminosa e viagem',async({page})=>{
  test.setTimeout(45000);const requests=[];
  page.on('request',r=>{if(/\/overlay\/(left-hand|right-hand)/.test(r.url()))requests.push(r.url());});
  await page.goto(base+'?debug=1&quality=eco-plus&hands=off');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady)).toBe('1');
  await watch(page);await page.locator('#heraldTarget').click({force:true});await result(page);
  expect(requests).toEqual([]);
});

test.describe('toque',()=>{
  test.use({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
  test('primeiro toque mostra ficha, segundo confirma com gesto e viaja',async({page})=>{
    test.setTimeout(45000);await page.goto(base+query);await ready(page);
    await page.locator('#heraldTarget').tap();
    expect(await page.evaluate(()=>window.__orionStarDebug.selection.state.activations)).toBe(0);
    await expect(page.locator('#heraldCard')).toHaveClass(/visible/);
    expect(await page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBe(0);
    await watch(page);await page.locator('#heraldTarget').tap();
    const samples=await result(page);expect(samples.some(s=>s.press>.8)).toBe(true);
  });
});

test('registra etapas do clique e preservação do centro em desktop e celular',async({page})=>{
  test.setTimeout(90000);
  for(const viewport of [{width:1920,height:1080},{width:390,height:844}]){
    await page.setViewportSize(viewport);await page.goto(base+query);await ready(page);
    await aim(page);
    await page.evaluate(()=>{
      document.querySelector('#debug').hidden=true;
      window.addEventListener('pointerdown',()=>{
        const d=window.__orionStarDebug.selection;
        window.__selectionRealUpdate=d.update;d.update=()=>{};
      },{once:true});
    });
    await page.screenshot({path:test.info().outputPath(`${viewport.width}-before.png`)});
    const box=await page.locator('#heraldTarget').boundingBox();
    await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    for(const p of [.08,.25,.50,.75,.92]){
      const data=await page.evaluate(p=>{
        const d=window.__orionStarDebug.selection,h=window.__orionHandsDebug;
        while(d.state.elapsed<.84*p-1e-9)
          window.__selectionRealUpdate(Math.min(.04,.84*p-d.state.elapsed));
        h.update(0,0);
        const camera=window.__orionDepthDebug.camera;camera.updateWorldMatrix(true,true);
        const point=h.rigs[1].measure().landmarks.indexTip.clone().project(camera);
        return {p:d.state.progress,tipX:(point.x+1)/2,z:h.meshes[1].position.z,
          anticipation:h.state.selectionAnticipation,followThrough:h.state.selectionFollowThrough,
          opacity:h.meshes[1].material.opacity,draws:h.state.drawSurfaces,
          rings:d.rings.map(r=>({radius:r.scale.x,opacity:r.material.opacity,singlePass:r.material.forceSinglePass}))};
      },p);
      expect(data.p).toBeCloseTo(p,4);
      expect(data.tipX).toBeGreaterThan(.70);expect(data.opacity).toBe(.38);expect(data.draws).toBe(2);
      expect(data.rings.every(r=>r.singlePass)).toBe(true);
      if(p===.08){expect(data.z).toBeLessThan(-2.51);expect(data.rings[1].opacity).toBe(0);}
      if(p===.5)expect(data.rings[1].opacity).toBeGreaterThan(.15);
      console.log('SELECTION_POSE',JSON.stringify({viewport,...data}));
      await page.screenshot({path:test.info().outputPath(`${viewport.width}-click-${Math.round(p*100)}.png`)});
    }
  }
});
