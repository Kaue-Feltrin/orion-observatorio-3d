import {test,expect} from '@playwright/test';
test('v0.9.15 comparar enquadramentos com antebraços atenuados e dedos 3D',async({page})=>{
  await page.setViewportSize({width:1748,height:864});
  const examples=[];
  for(const style of ['original','calm','cinematic']){
    await page.goto('http://127.0.0.1:4173/?quality=eco-plus&hands=fps&fpsStyle='+style+'&debug=1',{waitUntil:'domcontentloaded'});
    await expect.poll(async()=>page.evaluate(()=>{
      const s=window.__orionHandsDebug?.state;
      return s?.loaded?'loaded':s?.loadError||'loading';
    }),{timeout:18000}).toBe('loaded');
    await page.waitForTimeout(300);
    const example=await page.evaluate(()=>{
      const h=window.__orionHandsDebug,c=window.__orionDepthDebug.camera;
      c.updateMatrixWorld(true);h.root.updateMatrixWorld(true);
      const k=o=>o.getWorldPosition(o.position.clone()).project(c);
      const hands={};
      h.root.traverse(o=>{
        if(o.isBone&&/^(?:hand[LR]|f_middle03[LR])/i.test(o.name)){
          const v=k(o);hands[o.name]=[v.x,v.y,v.z].map(n=>+n.toFixed(4));
        }
      });
      return{style:h.state.artStyle,pose:h.state.pose,framing:h.state.framing,
        hands,meshCount:h.meshes.length,bones:h.state.joints,
        surfaces:h.state.drawSurfaces};
    });
    examples.push(example);
    await page.evaluate(()=>{const p=document.querySelector('#debug');if(p)p.style.display='none';});
    await page.screenshot({path:'test-results/v0915-visual-'+style+'.png'});
  }
  console.log('FPS_ART_VARIANTS',JSON.stringify(examples));
  expect(examples.map(x=>x.style)).toEqual(['original','calm','cinematic']);
  for(const v of examples){
    expect(v.bones).toBeGreaterThanOrEqual(63);
    expect(v.meshCount).toBe(1);
  }
  expect(examples[0].framing.wristLeft.y).not.toEqual(examples[2].framing.wristLeft.y);
});
