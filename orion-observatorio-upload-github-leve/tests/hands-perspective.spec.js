import {test,expect} from '@playwright/test';
const base='http://127.0.0.1:4173/';
const query='?debug=1&quality=eco-plus&hands=mesh&handsMotion=perspective';
async function ready(page){
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:24000}).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__orionDepthDebug.layers
    .find(x=>x.userData.layerName.includes('ESO')).material.map.image?.naturalWidth||0)).toBeGreaterThan(0);
}
async function aim(page){
  const box=await page.locator('#heraldTarget').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBeGreaterThan(.997);
}
async function metrics(page){
  return page.evaluate(()=>{
    const h=window.__orionHandsDebug,camera=window.__orionDepthDebug.camera;
    camera.parent.updateWorldMatrix(true,false);camera.updateMatrixWorld(true);
    const surfaces=h.rigs.map(r=>{
      const data=r.measure(),point=r.mesh.position.clone();
      let left=Infinity,right=-Infinity;
      for(let i=0;i<r.mesh.geometry.attributes.position.count;i++){
        r.mesh.getVertexPosition(i,point).applyMatrix4(r.mesh.matrixWorld).project(camera);
        left=Math.min(left,(point.x+1)/2);right=Math.max(right,(point.x+1)/2);
      }
      const landmarks={};
      for(const [name,p] of Object.entries(data.landmarks)){
        const screen=p.clone().project(camera),local=p.clone().applyMatrix4(camera.matrixWorldInverse);
        landmarks[name]={x:(screen.x+1)/2,y:(1-screen.y)/2,z:local.z};
      }
      return {pose:r.pose,role:r.role,left,right,landmarks,bones:r.bones.length,
        angles:r.bones.map(b=>b.rotation.z),morph:r.mesh.morphTargetInfluences?.[0]||0,
        boneTextureBytes:data.boneTextureBytes,
        morphBytes:(r.mesh.geometry.morphAttributes.position||[]).reduce((s,a)=>s+a.array.byteLength,0),
        geometryBytes:Object.values(r.mesh.geometry.attributes).reduce((s,a)=>s+a.array.byteLength,0)+r.mesh.geometry.index.array.byteLength};
    });
    return {state:{...h.state},rendererTextures:window.__orionPerformance.textures,surfaces};
  });
}
function framing(data){
  for(const surface of data.surfaces){
    if(surface.pose==='left')expect(surface.right).toBeLessThan(.30);
    else expect(surface.left).toBeGreaterThan(.70);
    expect(surface.left).toBeGreaterThan(-.055);expect(surface.right).toBeLessThan(1.055);
    for(const p of Object.values(surface.landmarks)){
      if(surface.pose==='left')expect(p.x).toBeLessThan(.30);
      else expect(p.x).toBeGreaterThan(.70);
    }
  }
}

test('perspectiva usa três intermediários, profundidade e retorno no hover real',async({page})=>{
  test.setTimeout(150000);
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram|GL_INVALID/i.test(m.text()))errors.push(m.text());});
  page.on('request',r=>{if(r.url().includes('/overlay/'))requests.push(r.url());});
  await page.setViewportSize({width:1920,height:1080});
  await page.goto(base+query);await ready(page);await page.mouse.move(15,20);
  const idle=await metrics(page);
  expect(idle.state.animation).toBe('perspective');expect(idle.state.textureCount).toBe(6);
  expect(idle.state.joints).toBe(63);expect(idle.state.drawSurfaces).toBe(3);
  expect(idle.state.rightFrameWeights).toEqual([1,0,0,0,0]);framing(idle);
  expect(requests.filter(url=>/right-hand-reach-/.test(url))).toHaveLength(4);
  expect(requests.some(url=>/right-hand-pointing/.test(url))).toBe(false);
  await page.evaluate(()=>{
    document.querySelector('#debug').hidden=true;
    window.__sequenceSamples=[];window.__sequenceSampling=true;
    function sample(){
      if(!window.__sequenceSampling)return;
      const s=window.__orionHandsDebug.state;
      window.__sequenceSamples.push({progress:s.rightBlend,weights:[...s.rightFrameWeights],draws:s.drawSurfaces,bodyOpacity:window.__orionHandsDebug.rightBody.material.opacity,bodyMap:window.__orionHandsDebug.rightBody.material.map.uuid});
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.screenshot({path:test.info().outputPath('1920x1080-neutral.png')});
  await aim(page);
  const samples=await page.evaluate(()=>{window.__sequenceSampling=false;return window.__sequenceSamples;});
  for(let i=0;i<5;i++)expect(samples.some(sample=>sample.weights[i]>.6)).toBe(true);
  expect(samples.every(sample=>sample.draws<=4)).toBe(true);
  expect(samples.every(sample=>sample.bodyOpacity===.46)).toBe(true);
  expect(new Set(samples.map(sample=>sample.bodyMap)).size).toBe(1);
  for(const viewport of [{width:1920,height:1080},{width:1920,height:951},{width:390,height:844}]){
    await page.setViewportSize(viewport);await page.mouse.move(15,20);
    await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBeLessThan(.003);
    framing(await metrics(page));await aim(page);
    const pointed=await metrics(page);framing(pointed);
    expect(pointed.state.drawSurfaces).toBe(3);expect(pointed.state.rightDepth).toBeGreaterThan(.139);
    for(const surface of pointed.surfaces.filter(s=>s.pose!=='left'))
      expect(surface.landmarks.indexTip.z-surface.landmarks.wrist.z).toBeLessThan(-.08);
    await page.screenshot({path:test.info().outputPath(viewport.width+'x'+viewport.height+'-pointing.png')});
    await page.mouse.move(15,20);
    await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBeLessThan(.003);
    await page.screenshot({path:test.info().outputPath(viewport.width+'x'+viewport.height+'-returned.png')});
  }
  console.log('PERSPECTIVE_METRICS',JSON.stringify(await metrics(page)));
  expect(errors).toEqual([]);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('perspectiva reduced-motion usa somente extremos estáticos',async({page})=>{
  test.setTimeout(45000);await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+query);await ready(page);
  const neutral=await metrics(page);expect(neutral.state.rightFrameWeights).toEqual([1,0,0,0,0]);
  await aim(page);const pointed=await metrics(page);
  expect(pointed.state.rightFrameWeights).toEqual([0,0,0,0,1]);expect(pointed.state.rightDepth).toBe(0);
  for(const surface of pointed.surfaces){expect(surface.angles.every(a=>a===0)).toBe(true);expect(surface.morph).toBe(0);}
  await page.mouse.move(15,20);
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightBlend)).toBe(0);
});

test('perspectiva não aloca nada em off e mantém alternativa rig',async({page})=>{
  test.setTimeout(45000);const requests=[];
  page.on('request',r=>{if(/\/overlay\/(left-hand|right-hand)/.test(r.url()))requests.push(r.url());});
  await page.goto(base+'?debug=1&quality=eco-plus&hands=off&handsMotion=perspective');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady)).toBe('1');
  expect(requests).toEqual([]);expect(await page.evaluate(()=>window.__orionHandsDebug.rigs.length)).toBe(0);
  await page.goto(base+'?debug=1&quality=eco-plus&hands=mesh&handsMotion=rig');await ready(page);
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.animation)).toBe('rig');
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.textureCount)).toBe(3);
  expect(requests.some(url=>/right-hand-reach-/.test(url))).toBe(false);
  await aim(page);
  const before=await page.evaluate(()=>window.__orionPerformance.textures);
  await page.goto(base+query);await ready(page);await aim(page);
  await expect.poll(()=>page.evaluate(()=>window.__orionPerformance.textures)).toBe(before+11);
  console.log('PERSPECTIVE_GPU_TEXTURES',JSON.stringify({rig:before,
    perspective:await page.evaluate(()=>window.__orionPerformance.textures),additional:11}));
});
