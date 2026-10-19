import {test,expect} from '@playwright/test';
const url='http://127.0.0.1:4173/';

async function ready(page){
  await expect.poll(()=>page.evaluate(()=>{
    const s=window.__orionHandsDebug?.state;
    return s?.loadError||(s?.loaded?'loaded':'pending');
  }),{timeout:24000}).toBe('loaded');
  // Uma cena sem a fotografia ESO não serve como prova visual do Observatório.
  await expect.poll(()=>page.evaluate(()=>window.__orionDepthDebug.layers
    .find(x=>x.userData.layerName.includes('ESO')).material.map.image?.naturalWidth||0)
  ).toBeGreaterThan(0);
}
async function aim(page){
  const box=await page.locator('#heraldTarget').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.rightHover)).toBe(true);
}
async function blend(page){
  return page.evaluate(()=>window.__orionHandsDebug.state.rightBlend);
}
async function bounds(page){
  return page.evaluate(()=>{
    const h=window.__orionHandsDebug,c=window.__orionDepthDebug.camera;
    c.updateWorldMatrix(true,true);
    return [...h.meshes,h.root.getObjectByName('OrionFeminineRightNeutral')].map(m=>{
      m.geometry.computeBoundingBox();
      const b=m.geometry.boundingBox,points=[];
      for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y]){
        const p=b.min.clone().set(x,y,0).applyMatrix4(m.matrixWorld).project(c);
        points.push({x:(p.x+1)/2,y:(1-p.y)/2});
      }
      return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),
        top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
    });
  });
}
function expectEdges(boxes){
  expect(boxes[0].right).toBeLessThan(.30);
  expect(boxes[0].left).toBeLessThan(.04);
  for(const b of boxes.slice(1)){
    expect(b.left).toBeGreaterThan(.70);
    expect(b.right).toBeGreaterThan(.96);
  }
  for(const b of boxes){
    expect(b.left).toBeGreaterThan(-.05);
    expect(b.right).toBeLessThan(1.05);
    // O plano inclui a margem transparente acima da silhueta dos dedos.
    expect(b.top).toBeGreaterThan(.32);
    expect(b.bottom).toBeLessThan(1.06);
  }
}

test('v0.9.21 bordas protegidas, neutra própria, hover real e retorno suave',async({page})=>{
  test.setTimeout(110000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'?debug=1&quality=eco-plus&hands=mesh');
  await ready(page);
  const assets=await page.evaluate(()=>{
    const h=window.__orionHandsDebug,n=h.root.getObjectByName('OrionFeminineRightNeutral');
    return {state:{...h.state},urls:[...h.meshes,n].map(m=>m.material.map.image.currentSrc),
      sharedRightGeometry:n.geometry===h.meshes[1].geometry};
  });
  expect(assets.state.pose).toBe('feminine-star-hover');
  expect(assets.state.textureCount).toBe(3);
  expect(assets.sharedRightGeometry).toBe(true);
  expect(new Set(assets.urls).size).toBe(3);
  expect(assets.urls[2]).toContain('/right-hand-neutral.webp');
  for(const viewport of [{width:1920,height:1080},{width:1755,height:865},{width:1920,height:951},{width:390,height:844}]){
    const size=viewport.width+'x'+viewport.height;
    await page.setViewportSize(viewport);
    await page.mouse.move(15,20);
    await expect.poll(()=>blend(page)).toBeLessThan(.003);
    expectEdges(await bounds(page));
    const neutral=await page.evaluate(()=>{
      const h=window.__orionHandsDebug,n=h.root.getObjectByName('OrionFeminineRightNeutral');
      return {pointVisible:h.meshes[1].visible,neutralVisible:n.visible,
        neutralOpacity:n.material.opacity,leftOpacity:h.meshes[0].material.opacity,
        draw:h.state.drawSurfaces,triangles:h.state.triangles};
    });
    expect(neutral.pointVisible).toBe(false);
    expect(neutral.neutralVisible).toBe(true);
    expect(neutral.neutralOpacity).toBeCloseTo(.38,2);
    expect(neutral.leftOpacity).toBeCloseTo(.38,2);
    expect(neutral.draw).toBe(2);
    expect(neutral.triangles).toBe(3552);
    await page.evaluate(()=>document.querySelector('#debug').hidden=true);
    await page.screenshot({path:test.info().outputPath(size+'-neutral.png')});
    await aim(page);
    await expect.poll(()=>blend(page)).toBeGreaterThan(.997);
    expectEdges(await bounds(page));
    expect(await page.evaluate(()=>window.__orionHandsDebug.root
      .getObjectByName('OrionFeminineRightNeutral').visible)).toBe(false);
    await page.screenshot({path:test.info().outputPath(size+'-hover.png')});
    await page.mouse.move(15,20);
    const returning=await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>{
      resolve({...window.__orionHandsDebug.state});
    })));
    expect(returning.rightHover).toBe(false);
    expect(returning.rightBlend).toBeGreaterThan(0);
    await expect.poll(()=>blend(page)).toBeLessThan(.003);
    expectEdges(await bounds(page));
    await page.screenshot({path:test.info().outputPath(size+'-returned.png')});
  }
  expect(errors).toEqual([]);
  await page.evaluate(()=>window.addEventListener('pagehide',()=>{
    const s=window.__orionHandsDebug.state;
    sessionStorage.setItem('orion-v0921-hands-at-arrival',JSON.stringify({visible:s.visible,rightHover:s.rightHover}));
  },{once:true}));
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-v0921-hands-at-arrival'))))
    .toEqual({visible:false,rightHover:false});
});

for(const event of ['pointerleave','blur','visibilitychange']){
  test('v0.9.21 encerra hover em '+event,async({page})=>{
    test.setTimeout(45000);
    await page.goto(url+'?debug=1&quality=eco-plus&hands=mesh');
    await ready(page);
    await aim(page);
    await expect.poll(()=>blend(page)).toBeGreaterThan(.9);
    await page.evaluate(name=>{
      if(name==='pointerleave')document.documentElement.dispatchEvent(new PointerEvent(name));
      else if(name==='blur')window.dispatchEvent(new Event(name));
      else {
        Object.defineProperty(document,'hidden',{configurable:true,value:true});
        document.dispatchEvent(new Event(name));
        delete document.hidden;
      }
    },event);
    await expect.poll(()=>blend(page)).toBeLessThan(.003);
    await page.mouse.move(15,20);
    await page.locator('#heraldTarget').focus();
    expect(await page.evaluate(()=>window.__orionHandsDebug.state.rightHover)).toBe(false);
  });
}

test('v0.9.21 hands=off não baixa nenhum asset das mãos',async({page})=>{
  const urls=[];
  page.on('request',r=>{if(/\/overlay\/(left-hand|right-hand)/.test(r.url()))urls.push(r.url());});
  await page.goto(url+'?debug=1&quality=eco-plus&hands=off');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady)).toBe('1');
  expect(urls).toEqual([]);
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.enabled)).toBe(false);
});

test('v0.9.21 movimento reduzido mantém dedos estáticos e troca de pose sem animação',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(url+'?debug=1&quality=eco-plus&hands=mesh');
  await ready(page);
  const vertices=await page.evaluate(()=>window.__orionHandsDebug.meshes.map(m=>Array.from(m.geometry.attributes.position.array)));
  await aim(page);
  await expect.poll(()=>blend(page)).toBe(1);
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.maxVertexDelta)).toBe(0);
  expect(await page.evaluate(()=>window.__orionHandsDebug.meshes.map(m=>m.rotation.z))).toEqual([0,0]);
  expect(await page.evaluate(()=>window.__orionHandsDebug.meshes.map(m=>Array.from(m.geometry.attributes.position.array)))).toEqual(vertices);
  await page.mouse.move(15,20);
  await expect.poll(()=>blend(page)).toBe(0);
});
