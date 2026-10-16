import {test,expect} from '@playwright/test';

const url='http://127.0.0.1:4173/';

test('mãos David: dedos reais avançam ao centro e respeitam o enquadramento depois da pose',async({page})=>{
  test.setTimeout(75000);
  for(const viewport of [{width:1748,height:864},{width:1920,height:951}]){
    await page.setViewportSize(viewport);
    await page.goto(url+'?quality=eco-plus&hands=fps&fpsStyle=natural&debug=1',{waitUntil:'domcontentloaded'});
    await expect.poll(async()=>windowStatus(page),{timeout:18000}).toBe('loaded');
    const result=await page.evaluate(()=>{
      const h=window.__orionHandsDebug,c=window.__orionDepthDebug.camera;
      // O pose-calibrator não pode ignorar a flexão dos punhos depois da carga.
      h.update(0,1/60,0,0);
      c.updateMatrixWorld(true);h.root.updateMatrixWorld(true);
      const bone=name=>{let found=null;h.root.traverse(o=>{
        if(o.isBone&&o.name===name)found=o;
      });return found;};
      const project=b=>b.getWorldPosition(b.position.clone()).project(c);
      const frame=h.state.framing;
      const l=project(bone('f_middle.03.L_end_061')),r=project(bone('f_middle.03.R_end_054'));
      return {
        viewport:[innerWidth,innerHeight],frame,
        actualLeft:{x:l.x,y:l.y},actualRight:{x:r.x,y:r.y},
        bloom:window.__orionDiagnostic.snapshot().bloomRest,
        layers:window.__orionDiagnostic.snapshot().volumeLayers
      };
    });
    console.log('FPS_NATURAL_LANDMARKS',JSON.stringify(result));
    expect(result.frame.posedLandmarks).toBe(true);
    expect(result.bloom).toBe(true);
    expect(result.layers).toBe(3);
    for(const [wrist,tip,actual,side] of [
      [result.frame.wristLeft,result.frame.tipLeft,result.actualLeft,1],
      [result.frame.wristRight,result.frame.tipRight,result.actualRight,-1]
    ]){
      expect(wrist.y).toBeGreaterThan(-1);
      expect(wrist.y).toBeLessThan(-.6);
      expect(tip.y).toBeGreaterThan(wrist.y+.12);
      expect(tip.y).toBeLessThan(.1);
      expect((tip.x-wrist.x)*side).toBeGreaterThan(.04);
      expect((tip.x-wrist.x)*side).toBeLessThan(.30);
      expect(Math.abs(tip.x)).toBeLessThan(.59);
      expect(Math.abs(tip.x-actual.x)).toBeLessThan(.025);
      expect(Math.abs(tip.y-actual.y)).toBeLessThan(.025);
    }
    await page.evaluate(()=>{const d=document.querySelector('#debug');if(d)d.style.display='none';});
    await page.screenshot({path:'test-results/fps-natural-'+viewport.width+'x'+viewport.height+'.png'});
    await page.locator('#heraldTarget').click({force:true});
    await expect(page).toHaveURL(/ficha\\.html/,{timeout:9000});
  }
});

async function windowStatus(page){
 return page.evaluate(()=>{
   const h=window.__orionHandsDebug?.state;
   return h?.loadError||(h?.loaded?'loaded':'waiting');
 });
}

test('mãos FPS desligadas não consomem a geometria GLB',async({page})=>{
  const req=[];
  page.on('request',r=>{if(r.url().includes('david-fischer-fps-hands.glb'))req.push(r.url());});
  await page.goto(url+'?hands=off&quality=eco-plus',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>documentReady(page),{timeout:18000}).toBe('1');
  expect(req).toEqual([]);
});
async function documentReady(page){
 return page.evaluate(()=>document.documentElement.dataset.sceneReady);
}
