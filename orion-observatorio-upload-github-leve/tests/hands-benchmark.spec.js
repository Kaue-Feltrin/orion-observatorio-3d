import {test,expect} from '@playwright/test';

test('v0.9.16 painel A/B registra, compara e limpa medições locais',async({page})=>{
  test.setTimeout(100000);
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#orionHandsABCapture')).toBeVisible({timeout:18000});
  await expect(page.locator('#orionHandsABSwitch')).toHaveAttribute('href',/hands=fps/);
  await page.evaluate(()=>{
    const shared={quality:'eco-plus',effects:'normal',bloomRest:true,
      viewport:'1920×951',dpr:.6,canvasPixels:670000,gasLayers:0,
      volumeLayers:3,foregroundNear:true,depthMotion:true,parallaxStrength:1};
    const signature=JSON.stringify(shared);
    const off={mode:'off',signature,fps:60,p95Ms:16.8,longFrames:0,
      drawCalls:25,textures:14,samples:240,viewport:shared.viewport};
    const fps={mode:'fps',signature,fps:57,p95Ms:19.2,longFrames:4,
      drawCalls:26,textures:14,samples:226,viewport:shared.viewport};
    sessionStorage.setItem('orion-observatorio-hands-ab-v1',JSON.stringify({off,fps}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#orionHandsABResult')).toContainText('60 → com mãos 57',{timeout:18000});
  await expect(page.locator('#orionHandsABResult')).toContainText('16.8 → 19.2 ms');
  await page.locator('#orionHandsABClear').click();
  await expect(page.locator('#orionHandsABResult')).toContainText('pendente');
  const value=await page.evaluate(()=>sessionStorage.getItem('orion-observatorio-hands-ab-v1'));
  expect(value).toBeNull();
});
