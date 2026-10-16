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
  // Medições precisam verificar PALMA E DEDOS, não apenas carregar ossos.
  const point=name=>pose.nodes.find(n=>n.name.toLowerCase().replace(/[^a-z0-9]/g,'')===name.replace(/[^a-z0-9]/g,''));
  for(const side of ['l','r']){
    const wrist=point('wrist'+side),tip=point('finger_middle3'+side),shoulder=point('shoulder'+side);
    expect(wrist,'Punho não localizado').toBeTruthy();
    expect(tip,'Ponta do dedo não localizada').toBeTruthy();
    expect(wrist.ndc[1]).toBeGreaterThan(-.98);
    expect(wrist.ndc[1]).toBeLessThan(-.73);
    expect(tip.ndc[1]).toBeGreaterThan(wrist.ndc[1]+.08);
    expect(tip.ndc[1]).toBeLessThan(-.51);
    expect(shoulder.ndc[1]).toBeLessThan(-1.05);
    expect(Math.abs(wrist.ndc[0])).toBeGreaterThan(.39);
    expect(Math.abs(wrist.ndc[0])).toBeLessThan(.57);
  }
  expect(pose.nodes.length).toBeGreaterThan(10);
  // Mesmo debug ativado para medições, a captura deve exibir a
  // experiência do visitante, sem o inspector cobrindo a mão esquerda.
  await page.evaluate(()=>{document.querySelector('#debug').style.display='none';});
  await page.screenshot({path:'test-results/v0914-framing-corrigido.png'});
});
