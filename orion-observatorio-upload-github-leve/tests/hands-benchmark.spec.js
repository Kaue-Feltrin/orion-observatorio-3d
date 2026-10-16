import {test,expect} from '@playwright/test';

test('v0.9.16 benchmark A/B compara medições locais e não cria render loop',async({page})=>{
  await page.goto('http://127.0.0.1:4173/ficha.html?debug=1&quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  const data=await page.evaluate(async()=>{
    const mod=await import('/hands-benchmark.js');
    const base={quality:'eco-plus',effects:'normal',bloomRest:true,
      viewport:'1920×951',dpr:.6,canvasPixels:670000,
      gasLayers:0,volumeLayers:3,foregroundNear:true,
      depthMotion:true,parallaxStrength:1};
    const signature=mod.benchmarkSignature(base);
    const off={...base,mode:'off',signature,fps:60,p95Ms:16.8,longFrames:0,
      drawCalls:25,textures:14,samples:240};
    const fps={...base,mode:'fps',signature,fps:57,p95Ms:19.2,longFrames:4,
      drawCalls:26,textures:14,samples:226};
    const delta=mod.compareHandsSamples(off,fps);
    const mismatch=mod.compareHandsSamples(off,{...fps,signature:'another viewport'});
    sessionStorage.setItem('orion-observatorio-hands-ab-v1',JSON.stringify({off,fps}));
    const root=document.createElement('fieldset');
    document.body.appendChild(root);
    const widget=mod.createHandsBenchmark(root,()=>off);
    const text=document.getElementById('orionHandsABResult').textContent;
    const report=widget.report();
    const href=document.getElementById('orionHandsABSwitch').getAttribute('href');
    document.getElementById('orionHandsABClear').click();
    const cleared=widget.report();
    root.remove();
    return {delta,mismatch,text,report,href,cleared};
  });
  expect(data.delta).toMatchObject({ok:true,fpsDifference:-3,p95Difference:2.4,drawCallsDifference:1,texturesDifference:0});
  expect(data.mismatch.ok).toBe(false);
  expect(data.text).toContain('60 → com mãos 57');
  expect(data.report).toContain('Diferença com mãos menos sem mãos');
  expect(data.href).toContain('hands=fps');
  expect(data.href).toContain('quality=eco-plus');
  expect(data.cleared).toContain('sem dados registrados');
});
