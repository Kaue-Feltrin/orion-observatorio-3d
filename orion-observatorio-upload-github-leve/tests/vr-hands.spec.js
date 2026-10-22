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
  expect(a.nLayers).toBe(5);
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


test('v0.9.14 compara mãos relaxadas em 3/4 com pose aberta de referência',async({page})=>{
  const poses=[];
  await page.setViewportSize({width:1748,height:864});
  for(const pose of ['open','relaxed']){
    await page.goto('http://127.0.0.1:4173/?quality=eco-plus&hands=vr&handPose='+pose+'&debug=1',{waitUntil:'domcontentloaded'});
    await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:18000}).toBe(true);
    await page.waitForTimeout(300);
    const metrics=await page.evaluate(()=>{
      const h=window.__orionHandsDebug,c=window.__orionDepthDebug.camera;
      c.updateMatrixWorld(true);h.root.updateMatrixWorld(true);
      function sample(side){
        const points={};
        h.groups[side].traverse(obj=>{
          if(!obj.isBone)return;
          if(!/^(wrist|middle-finger-tip|index-finger-tip|thumb-tip)$/i.test(obj.name))return;
          const ndc=obj.getWorldPosition(obj.position.clone()).project(c);
          points[obj.name]=[ndc.x,ndc.y,ndc.z];
        });
        return points;
      }
      return{pose:h.state.pose,angles:h.driven.slice(0,3).map(x=>({name:x.bone.name,
        q:x.bone.quaternion.toArray(),base:x.base.toArray()})),
        groups:h.groups.map((g,i)=>({rotation:g.rotation.toArray().slice(0,3),points:sample(i)}))};
    });
    poses.push(metrics);
    await page.evaluate(()=>document.querySelector('#debug').style.display='none');
    await page.screenshot({path:'test-results/v0914-vr-'+pose+'.png'});
  }
  console.log('POSE_A_B',JSON.stringify(poses));
  expect(poses.map(x=>x.pose)).toEqual(['open','relaxed']);
  expect(poses[0].groups[0].rotation).not.toEqual(poses[1].groups[0].rotation);
  expect(poses[0].angles[0].q).not.toEqual(poses[1].angles[0].q);
  for(const group of poses[1].groups){
    expect(group.points['wrist']).toBeDefined();
    expect(group.points['middle-finger-tip']).toBeDefined();
  }
});
