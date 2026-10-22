import {test,expect} from '@playwright/test';
const base='http://127.0.0.1:4173/';
const query='?debug=1&quality=eco-plus&hands=mesh&handsMotion=rig';
async function ready(page){
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:24000}).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__orionDepthDebug.layers
    .find(x=>x.userData.layerName.includes('ESO')).material.map.image?.naturalWidth||0)).toBeGreaterThan(0);
}
async function metrics(page){
  return page.evaluate(()=>{
    const h=window.__orionHandsDebug,camera=window.__orionDepthDebug.camera;
    camera.parent.updateWorldMatrix(true,false);camera.updateMatrixWorld(true);
    return {state:{...h.state},textureCount:window.__orionPerformance.textures,
      rigs:h.rigs.map(r=>{
        const m=r.mesh,diagnostic=r.measure(),landmarks={};
        for(const [name,position] of Object.entries(diagnostic.landmarks)){
          const p=position.clone().project(camera);
          landmarks[name]={x:(p.x+1)/2,y:(1-p.y)/2};
        }
        const p=m.position.clone(),attribute=m.geometry.getAttribute('position');
        let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
        for(let i=0;i<attribute.count;i++){
          m.getVertexPosition(i,p).applyMatrix4(m.matrixWorld).project(camera);
          const x=(p.x+1)/2,y=(1-p.y)/2;
          left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
        }
        return {pose:r.pose,skin:m.isSkinnedMesh,bones:r.bones.length,
          angles:r.bones.map(b=>b.rotation.z),morph:r.mesh.morphTargetInfluences?.[0]||0,landmarks,bounds:{left,right,top,bottom},
          maxVertexDelta:diagnostic.maxVertexDelta,boneTextureBytes:diagnostic.boneTextureBytes,
          morphBytes:(m.geometry.morphAttributes.position||[]).reduce((sum,a)=>sum+a.array.byteLength,0),
          geometryBytes:Object.values(m.geometry.attributes).reduce((sum,a)=>sum+a.array.byteLength,0)+m.geometry.index.array.byteLength};
      })};
  });
}
function expectFraming(data){
  for(const r of data.rigs){
    if(r.pose==='left')expect(r.bounds.right).toBeLessThan(.32); // inclui cantos transparentes; alpha e landmarks protegem .30
    else expect(r.bounds.left).toBeGreaterThan(.70);
    // Margem do retângulo transparente rotacionado; alpha real medido na unidade.
    expect(r.bounds.left).toBeGreaterThan(r.pose==='left'?-.10:-.055);
    expect(r.bounds.right).toBeLessThan(1.055);
    expect(r.maxVertexDelta).toBeLessThan(.18);
    for(const point of Object.values(r.landmarks)){
      expect(point.x).toBeGreaterThan(-.05);expect(point.x).toBeLessThan(1.05);
      if(r.pose==='left')expect(point.x).toBeLessThan(.30);
      else expect(point.x).toBeGreaterThan(.70);
    }
  }
}
async function aim(page){
  const b=await page.locator('#heraldTarget').boundingBox();
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2);
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBeGreaterThan(.997);
}

test('MMV rig articula os dedos, protege enquadramento e mantém hover/viagem',async({page})=>{
  test.setTimeout(110000);
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/WebGLProgram|shader|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  await page.setViewportSize({width:1920,height:1080});
  await page.goto(base+query);await ready(page);
  await page.mouse.move(15,20);
  const before=await metrics(page);
  expect(before.state.animation).toBe('rig');
  expect(before.state.joints).toBe(27);expect(before.state.fingerJoints).toBe(21);
  expect(before.state.textureCount).toBe(3);
  expect(before.rigs.every(r=>r.skin&&r.bones===9)).toBe(true);
  expectFraming(before);
  await page.evaluate(()=>document.querySelector('#debug').hidden=true);
  await page.screenshot({path:test.info().outputPath('1920x1080-idle-a.png')});
  await expect.poll(async()=>{
    const after=await metrics(page);
    return after.rigs.every((r,i)=>r.angles.some((a,j)=>Math.abs(a-before.rigs[i].angles[j])>.0002));
  }).toBe(true);
  await page.screenshot({path:test.info().outputPath('1920x1080-idle-b.png')});
  for(const viewport of [{width:1920,height:1080},{width:1920,height:951},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    await page.mouse.move(15,20);
    await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBeLessThan(.003);
    expectFraming(await metrics(page));
    const resting=await metrics(page);
    await aim(page);
    const hovered=await metrics(page);expectFraming(hovered);
    const restFinger=resting.rigs.find(r=>r.pose==='neutral');
    const extendedFinger=hovered.rigs.find(r=>r.pose==='neutral');
    expect(extendedFinger.morph).toBeGreaterThan(.997);
    expect(restFinger.morph).toBeLessThan(.003);
    expect(restFinger.landmarks.indexTip.y-extendedFinger.landmarks.indexTip.y).toBeGreaterThan(viewport.width<500?.015:.05);
    expect(hovered.state.drawSurfaces).toBe(2);
    expect(hovered.rigs.reduce((sum,r)=>sum+r.boneTextureBytes,0)).toBeLessThanOrEqual(3072);
    await page.screenshot({path:test.info().outputPath(viewport.width+'x'+viewport.height+'-hover.png')});
    await page.mouse.move(15,20);
    await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBeLessThan(.003);
    await page.screenshot({path:test.info().outputPath(viewport.width+'x'+viewport.height+'-returned.png')});
  }
  console.log('MMV_RIG_METRICS',JSON.stringify(await metrics(page)));
  expect(errors).toEqual([]);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('MMV reduced-motion congela ossos e imagem sem bloquear o gesto',async({page})=>{
  test.setTimeout(45000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+query);await ready(page);
  const first=await metrics(page);
  expect(first.rigs.every(r=>r.angles.every(a=>a===0))).toBe(true);
  // Pesos Float32 somados após a transformação mundial deixam erro ~1e-6;
  // 1e-5 da imagem é subpixel, enquanto todos os ângulos devem ser exatamente zero.
  expect(first.state.maxVertexDelta).toBeLessThan(1e-5);
  await aim(page);
  expect((await metrics(page)).rigs.map(r=>r.angles)).toEqual(first.rigs.map(r=>r.angles));
  await page.mouse.move(15,20);
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBe(0);
});

test('modos antigos continuam explícitos e hands=off não aloca skeleton nem baixa os sprites',async({page})=>{
  test.setTimeout(45000);
  await page.goto(base+'?debug=1&quality=eco-plus&hands=mesh&handsMotion=mesh');await ready(page);
  expect(await page.evaluate(()=>window.__orionHandsDebug.rigs.length)).toBe(0);
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.animation)).toBe('mesh');
  await aim(page);
  const baselineTextures=await page.evaluate(()=>window.__orionPerformance.textures);
  await page.goto(base+query);await ready(page);await aim(page);
  const rigTextures=await page.evaluate(()=>window.__orionPerformance.textures);
  expect(rigTextures-baselineTextures).toBe(5);
  console.log('MMV_GPU_TEXTURES',JSON.stringify({baseline:baselineTextures,rig:rigTextures,additional:rigTextures-baselineTextures}));
  const requests=[];
  page.on('request',r=>{if(/\/overlay\/(left-hand|right-hand)/.test(r.url()))requests.push(r.url());});
  await page.goto(base+'?debug=1&quality=eco-plus&hands=off&handsMotion=rig');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady)).toBe('1');
  expect(await page.evaluate(()=>window.__orionHandsDebug.rigs.length)).toBe(0);
  expect(requests).toEqual([]);
});
