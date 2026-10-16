import {test,expect} from '@playwright/test';

test('mede landmarks de mãos FPS no enquadramento atual',async({page})=>{
  await page.setViewportSize({width:1748,height:864});
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&hands=rig',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:18000}).toBe(true);
  const pose=await page.evaluate(()=>{
    const h=window.__orionHandsDebug;
    const cam=window.__orionDepthDebug.camera;
    cam.updateMatrixWorld(true);
    h.rigRoot.updateMatrixWorld(true);
    const names=['root','shoulderl','shoulderr','wristl','wristr',
      'finger_middle1l','finger_middle3l','finger_middle1r','finger_middle3r',
      'finger_index1l','finger_index3l','finger_index1r','finger_index3r',
      'finger_thumbl','finger_thumbr','finger_thumb3l','finger_thumb3r'];
    const nodes=[];
    h.rigRoot.traverse(o=>{
      if(names.some(n=>o.name.toLowerCase().replace(/[^a-z0-9]/g,'')===n.replace(/[^a-z0-9]/g,''))){
        const w=o.getWorldPosition(o.position.clone()),ndc=w.clone().project(cam);
        const cv=cam.worldToLocal(w.clone());
        nodes.push({name:o.name,ndc:ndc.toArray().map(x=>+x.toFixed(3)),
          camera:cv.toArray().map(x=>+x.toFixed(3))});
      }
    });
    const mesh=h.meshes[0];
    return{nodes,root:{p:h.rigRoot.position.toArray(),rotation:h.rigRoot.rotation.toArray().slice(0,3),
      scale:h.rigRoot.scale.toArray()},
      bounds:h.state.modelBounds,mesh:{name:mesh.name,geometry:mesh.geometry.type},
      cameraFov:cam.fov,aspect:cam.aspect};
  });
  console.log('FPS_FRAMING_LANDMARKS',JSON.stringify(pose));
  await page.screenshot({path:'test-results/v0914-antes.png'});
  expect(pose.nodes.length).toBeGreaterThan(10);
});
