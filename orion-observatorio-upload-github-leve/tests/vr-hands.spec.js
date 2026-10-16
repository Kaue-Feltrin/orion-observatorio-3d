import {test,expect} from '@playwright/test';

test('v0.9.14 carrega mãos anatômicas MIT com dedos posicionados em primeira pessoa',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1748,height:864});
  for(const name of ['left','right']){
    const res=await page.request.get('http://127.0.0.1:4173/models/wonderland-'+name+'.glb');
    expect(res.ok()).toBe(true);
    expect((await res.body()).subarray(0,4).toString()).toBe('glTF');
  }
  await page.goto('http://127.0.0.1:4173/?quality=eco-plus&hands=vr&debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded||window.__orionHandsDebug?.state.loadError),{timeout:18000}).toBe(true);
  const a=await page.evaluate(()=>{
    const h=window.__orionHandsDebug, cam=window.__orionDepthDebug.camera;
    cam.updateMatrixWorld(true);h.root.updateMatrixWorld(true);
    const project=node=>{
      if(!node)return null;
      const v=node.getWorldPosition(node.position.clone()).project(cam);
      return {x:v.x,y:v.y,z:v.z};
    };
    const pose=h.groups.map((group,i)=>{
      const nodes={};
      group.traverse(n=>{
        if(n.isBone&&/wrist|middle.*finger.*tip/i.test(n.name)){
          nodes[n.name]=project(n);
        }
      });
      return{group:group.name,position:group.position.toArray(),scale:group.scale.x,rotation:group.rotation.toArray().slice(0,3),
      nodes};
    });
    return{state:h.state,pose,meshes:h.meshes.map(m=>({skinned:m.isSkinnedMesh,
      vertices:m.geometry.attributes.position.count,
      material:m.material.type,colors:m.geometry.attributes.color?.itemSize})),
      nLayers:window.__orionDiagnostic.snapshot().volumeLayers};
  });
  console.log('VR_HANDS_FRAMING',JSON.stringify(a));
  expect(a.state.loadError).toBeNull();
  expect(a.state.mode).toBe('vr');
  expect(a.state.joints).toBeGreaterThanOrEqual(50);
  expect(a.state.fingerJoints).toBeGreaterThanOrEqual(24);
  expect(a.state.drawSurfaces).toBe(2);
  expect(a.state.textureCount).toBe(0);
  expect(a.meshes).toHaveLength(2);
  expect(a.meshes.every(x=>x.skinned&&x.colors===4)).toBe(true);
  expect(a.nLayers).toBe(3);
  await page.evaluate(()=>{document.querySelector('#debug').style.display='none';});
  await page.screenshot({path:'test-results/v0914-vr-maos-anatomicas.png'});
  expect(errors).toEqual([]);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.14 modo desligado não solicita nem aloca as mãos',async({page})=>{
  const requests=[];
  page.on('request',r=>{if(r.url().includes('wonderland-'))requests.push(r.url());});
  await page.goto('http://127.0.0.1:4173/?quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  expect(requests).toEqual([]);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});
