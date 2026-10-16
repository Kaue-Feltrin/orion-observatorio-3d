import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173/';
const viewports=[{width:1748,height:864},{width:1920,height:951}];

async function loadHands(page,mode='fps'){
  await page.goto(base+'?debug=1&quality=eco-plus&hands='+mode,{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>{
    const s=window.__orionHandsDebug?.state;
    return s?.loadError|| (s?.loaded?'loaded':'waiting');
  }),{timeout:20000}).toBe('loaded');
}

test('v0.9.15 carrega GLB original David Fischer e rig, sem pedidos externos',async({page})=>{
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/sketchfab|kinetwin/i.test(r.url()))external.push(r.url());});
  const file=await page.request.get(base+'models/david-fischer-fps-hands.glb');
  expect(file.ok()).toBe(true);
  const bytes=await file.body();
  expect(bytes.subarray(0,4).toString()).toBe('glTF');
  expect(bytes.length).toBeGreaterThan(250000);
  expect(bytes.length).toBeLessThan(800000);
  await loadHands(page);
  const snap=await page.evaluate(()=>{
    const h=window.__orionHandsDebug,s=window.__orionDiagnostic.snapshot();
    return{loaded:h.state.loaded,error:h.state.loadError,bones:h.state.joints,
      fingerJoints:h.state.fingerJoints,meshes:h.meshes.map(m=>({skinned:m.isSkinnedMesh,vertexCount:m.geometry.attributes.position.count})),
      frame:h.state.framing,diagnostics:{mode:s.handsMode,volume:s.volumeLayers,gas:s.gasLayers,bloom:s.bloomRest}};
  });
  console.log('DAVID_FPS_IMPORTED',JSON.stringify(snap));
  expect(snap.loaded).toBe(true);
  expect(snap.error).toBeNull();
  expect(snap.bones).toBeGreaterThanOrEqual(60);
  expect(snap.fingerJoints).toBeGreaterThanOrEqual(25);
  expect(snap.meshes.length).toBeGreaterThan(0);
  expect(snap.meshes.every(m=>m.skinned)).toBe(true);
  expect(snap.frame.wristLeft).toBeTruthy();
  expect(snap.frame.wristRight).toBeTruthy();
  expect(snap.diagnostics.mode).toBe('fps');
  expect(snap.diagnostics.volume).toBe(3);
  expect(snap.diagnostics.bloom).toBe(true);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
  await expect(page.locator('#fpsHandsCredit')).toBeVisible();
  await expect(page.locator('#fpsHandsCredit')).toHaveAttribute('href',/sketchfab/);
});

test('v0.9.15 captura mãos FPS e landmarks para enquadramento verificável',async({page})=>{
  const frames=[];
  for(const viewport of viewports){
    await page.setViewportSize(viewport);
    await loadHands(page);
    await page.waitForTimeout(200);
    const p=await page.evaluate(()=>{
      const hands=window.__orionHandsDebug,cam=window.__orionDepthDebug.camera;
      cam.updateMatrixWorld(true);
      hands.root.updateMatrixWorld(true);
      const keys=Object.keys(hands.state.framing).filter(x=>/wrist|tip/i.test(x));
      return{mode:hands.state.mode,style:hands.state.artStyle,
        dimensions:[innerWidth,innerHeight],framing:hands.state.framing,
        meshCount:hands.meshes.length,triangles:hands.state.triangles,
        drawCalls:window.__orionDiagnostic.snapshot().drawCalls};
    });
    console.log('DAVID_FPS_VIEWPORT',JSON.stringify(p));
    frames.push(p);
    const dims=viewport.width+'x'+viewport.height;
    await page.evaluate(()=>{const x=document.querySelector('#debug');if(x)x.style.display='none';});
    await page.screenshot({path:'test-results/v0915-david-fps-'+dims+'.png'});
  }
  expect(frames).toHaveLength(2);
  for(const f of frames){
    expect(f.meshCount).toBeGreaterThan(0);
    expect(f.framing.wristLeft).toBeTruthy();
    expect(f.framing.wristRight).toBeTruthy();
  }
});

test('v0.9.15 mantém Nox, viagem e não carrega o GLB com hands=off',async({page})=>{
  const req=[];
  page.on('request',r=>{if(r.url().includes('david-fischer-fps-hands.glb'))req.push(r.url());});
  await page.goto(base+'?quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  expect(req).toEqual([]);
  await expect(page.locator('#fpsHandsCredit')).toBeHidden();
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.15 respeita prefers-reduced-motion e preserva navegação',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await loadHands(page);
  const s=await page.evaluate(()=>window.__orionHandsDebug.state.motionEnabled);
  expect(s).toBe(false);
  const first=await page.evaluate(()=>window.__orionHandsDebug.driven.slice(0,3).map(x=>x.bone.quaternion.toArray()));
  await page.mouse.move(1400,700);
  await page.waitForTimeout(250);
  const second=await page.evaluate(()=>window.__orionHandsDebug.driven.slice(0,3).map(x=>x.bone.quaternion.toArray()));
  expect(second).toEqual(first);
  await page.locator('#heraldTarget').click({force:true});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug.state.visible),{timeout:1000}).toBe(false);
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});


test('v0.9.15 compara orientação de punhos FPS sem alterar Nox nem universo',async({page})=>{
  await page.setViewportSize({width:1748,height:864});
  const variations=['base','forward','reach','inward','back'];
  const data=[];
  for(const tune of variations){
    await page.goto(base+'?debug=1&quality=eco-plus&hands=fps&fpsTune='+tune,{waitUntil:'domcontentloaded'});
    await expect.poll(async()=>page.evaluate(()=>{
      const s=window.__orionHandsDebug?.state;
      return s?.loadError||(s?.loaded?'loaded':'waiting');
    }),{timeout:20000}).toBe('loaded');
    await page.waitForTimeout(240);
    data.push(await page.evaluate(()=>{
      const h=window.__orionHandsDebug;
      return{tune:h.state.tune,framing:h.state.framing,meshes:h.meshes.length,
        wrists:(()=>{
          const arr=[];
          h.root.traverse(o=>{
            if(o.isBone&&/^hand[lr]$/i.test(o.name.replace(/[^a-z0-9]/ig,'')))arr.push(o.quaternion.toArray());
          });
          return arr;
        })()};
    }));
    await page.evaluate(()=>{const panel=document.querySelector('#debug');if(panel)panel.style.display='none';});
    await page.screenshot({path:'test-results/v0915-qa-pose-'+tune+'.png'});
  }
  console.log('DAVID_FPS_POSE_SWEEP',JSON.stringify(data));
  expect(data.map(x=>x.tune)).toEqual(variations);
  expect(data.every(x=>x.meshes>0&&x.framing?.wristLeft&&x.framing?.wristRight)).toBe(true);
  expect(data[0].wrists).not.toEqual(data[1].wrists);
});
