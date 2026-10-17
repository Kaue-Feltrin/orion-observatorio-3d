import {test,expect} from '@playwright/test';

const url='http://127.0.0.1:4173/';
const token=n=>String(n||'').toLowerCase().replace(/[^a-z0-9]/g,'');

test('v0.9.17 enquadramento arcano: C com polegar e indicador, sem bloquear Nox',async({page})=>{
  test.setTimeout(110000);
  const problems=[];
  page.on('pageerror',error=>problems.push(error.message));
  page.on('console',msg=>{if(msg.type()==='error'&&/webglprogram|shader error|compile|ERROR: 0:/i.test(msg.text()))problems.push(msg.text());});
  for(const viewport of [{width:1755,height:865},{width:1920,height:951}]){
    await page.setViewportSize(viewport);
    await page.goto(url+'?debug=1&quality=eco-plus&hands=fps&fpsStyle=frame',{waitUntil:'domcontentloaded'});
    await expect.poll(async()=>page.evaluate(()=>{
      const s=window.__orionHandsDebug?.state;
      return s?.loadError||(s?.loaded?'loaded':'waiting');
    }),{timeout:22000}).toBe('loaded');
    await page.waitForTimeout(120);
    const snapshot=await page.evaluate(()=>{
      const hands=window.__orionHandsDebug,camera=window.__orionDepthDebug.camera;
      hands.update(0,1/60,0,0);
      camera.updateMatrixWorld(true);hands.root.updateMatrixWorld(true);
      const find=n=>{let result;hands.root.traverse(o=>{
        if(o.isBone&&String(o.name||'').toLowerCase().replace(/[^a-z0-9]/g,'')===n)result=o;
      });return result;};
      const project=o=>o?.getWorldPosition(o.position.clone()).project(camera).toArray();
      const positions={
        indexL:project(find('findex03lend059')),indexR:project(find('findex03rend057')),
        thumbL:project(find('thumb03lend00')),thumbR:project(find('thumb03rend056'))
      };
      return{
        framing:hands.state.framing,style:hands.state.artStyle,
        fingers:hands.state.fingerJoints,meshCount:hands.meshes.length,
        triangles:hands.state.triangles,
        positions,lightMode:hands.state.lightMode,
        nox:window.__orionDiagnostic.snapshot().bloomRest,
        volume:window.__orionDiagnostic.snapshot().volumeLayers
      };
    });
    console.log('FPS_FRAME_REFERENCE',JSON.stringify({viewport,...snapshot}));
    expect(snapshot.style).toBe('frame');
    expect(snapshot.framing.posedLandmarks).toBe(true);
    expect(snapshot.fingers).toBeGreaterThanOrEqual(25);
    expect(snapshot.meshCount).toBeGreaterThan(0);
    expect(snapshot.nox).toBe(true);
    expect(snapshot.volume).toBe(3);
    expect(snapshot.framing.wristLeft.x).toBeLessThan(-.66);
    expect(snapshot.framing.wristRight.x).toBeGreaterThan(.66);
    for(const key of ['indexL','indexR','thumbL','thumbR']){
      expect(snapshot.positions[key]).toBeTruthy();
      expect(snapshot.positions[key].every(Number.isFinite)).toBe(true);
    }
    // O indicador, a borda superior do C, deve aparecer acima do polegar.
    expect(snapshot.positions.indexL[1]).toBeGreaterThan(snapshot.positions.thumbL[1]+.05);
    expect(snapshot.positions.indexR[1]).toBeGreaterThan(snapshot.positions.thumbR[1]+.05);
    await page.evaluate(()=>{const panel=document.querySelector('#debug');if(panel)panel.style.display='none';});
    await page.screenshot({path:'test-results/v0917-fps-frame-'+viewport.width+'x'+viewport.height+'.png'});
    await page.locator('#heraldTarget').click({force:true});
    await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
  }
  expect(problems).toEqual([]);
});

test('v0.9.17 mantém natural como comparação e não carrega GLB com hands=off',async({page})=>{
  await page.goto(url+'?debug=1&hands=fps&fpsStyle=natural&quality=eco-plus',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>{
    const s=window.__orionHandsDebug?.state;
    return s?.loadError||(s?.loaded?'loaded':'waiting');
  }),{timeout:22000}).toBe('loaded');
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.artStyle)).toBe('natural');
  const requests=[];
  page.on('request',r=>{if(r.url().includes('/david-fischer-fps-hands.glb'))requests.push(r.url());});
  await page.goto(url+'?quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:18000}).toBe('1');
  expect(requests).toEqual([]);
});

test('v0.9.17 comparar contorno C e gesto das mãos no navegador',async({page})=>{
  test.setTimeout(170000);
  await page.setViewportSize({width:1755,height:865});
  const variants=['frameA','frameB','frameC','frameD'];
  const snapshots=[];
  for(const preset of variants){
    await page.goto(url+'?quality=eco-plus&debug=1&hands=fps&fpsStyle=frame&fpsTune='+preset,{waitUntil:'domcontentloaded'});
    await expect.poll(async()=>page.evaluate(()=>{
      const s=window.__orionHandsDebug?.state;
      return s?.loadError||(s?.loaded?'loaded':'waiting');
    }),{timeout:24000}).toBe('loaded');
    snapshots.push(await page.evaluate(()=>{
      const s=window.__orionHandsDebug.state;
      return {preset:s.tune,frame:s.framing,triangles:s.triangles,light:s.lightMode};
    }));
    await page.evaluate(()=>{document.querySelector('#debug')?.setAttribute('hidden','');});
    await page.screenshot({path:'test-results/v0917-pose-'+preset+'.png'});
  }
  console.log('FPS_FRAME_AB',JSON.stringify(snapshots));
  expect(snapshots.map(x=>x.preset)).toEqual(variants);
  expect(snapshots.every(x=>x.triangles>7000)).toBe(true);
});
