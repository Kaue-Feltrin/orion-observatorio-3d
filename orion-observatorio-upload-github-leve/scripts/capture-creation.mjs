// Run against the local dev/preview server. No clock/camera/gesture injection.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const output=process.env.CREATION_EVIDENCE_DIR||'test-results/creation';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,
 executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined,
 args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
const observations=[];
const metrics=page=>page.evaluate(()=>({
 ...window.__orionDiagnostic?.snapshot(),
 hands:{loaded:window.__orionHandsDebug?.state.loaded,visible:window.__orionHandsDebug?.state.visible,
 blend:window.__orionHandsDebug?.state.rightBlend,surfaces:window.__orionHandsDebug?.state.drawSurfaces},
 // These are renderer resource counts, not VRAM or RAM measurements.
 astronomyPhotoLoaded:!!window.__orionRespirationDebug?.nebula.material.map?.image?.width,
 textures:window.__orionPerformance?.textures,drawCalls:window.__orionPerformance?.drawCalls,
 frameHeap:performance.memory?.usedJSHeapSize??null,
 phase:document.getElementById('observatory').dataset.creationPhase??'sky'
}));
try{
 for(const viewport of [{width:1920,height:951,touch:false},{width:390,height:844,touch:true},{width:844,height:390,touch:true}]){
  const id=`${viewport.width}x${viewport.height}`;
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},hasTouch:viewport.touch,isMobile:viewport.touch,
   recordVideo:{dir:join(output,'videos'),size:{width:Math.min(1280,viewport.width),height:Math.min(720,viewport.height)}}});
  const page=await context.newPage(),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)missing.push({url:r.url(),status:r.status()})});
  const open=async()=>{
   await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='1');
   await page.waitForFunction(()=>window.__orionHandsDebug?.state.loaded);
   await page.evaluate(()=>document.getElementById('debug').hidden=true);
  };
  await page.goto('http://127.0.0.1:4173/?stars=0&quality=eco&debug=1');await open();
  await page.waitForTimeout(1500);await page.screenshot({path:join(output,`${id}-01-star.png`)});
  const sky=await metrics(page);
  const star=page.getByRole('button',{name:'Criar meu primeiro arauto'});
  if(viewport.touch)await star.tap();else await star.click();
  await page.waitForURL(/criacao\.html/); // Same real selection, travel and page veil.
  // Debug is intentionally not forwarded by the journey URL; reload the same
  // sealed chapter with debug only to collect its built-in resource counters.
  await page.waitForFunction(()=>document.documentElement.dataset.arrivalReady==='1');
  const url=new URL(page.url());url.searchParams.set('debug','1');await page.goto(url.href);await open();
  await page.waitForTimeout(1500);await page.screenshot({path:join(output,`${id}-02-sealed.png`)});
  const sealed=await metrics(page);
  await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();
  await page.screenshot({path:join(output,`${id}-03-mark.png`)});
  await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();
  await page.waitForFunction(()=>document.getElementById('observatory').dataset.creationPhase==='identity');
  await page.getByRole('button',{name:'Escolher menina',exact:true}).click();await page.locator('#herald-name').fill('Astra');
  await page.waitForTimeout(1500);await page.screenshot({path:join(output,`${id}-04-identity.png`)});
  const identity=await metrics(page);
  await page.getByRole('button',{name:'Continuar com esta identidade'}).click();
  const draft=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')));
  observations.push({viewport,sky,sealed,identity,draft,errors,missing});
  await context.close();
  console.log(id,'captured; errors:',errors.length,'missing assets:',missing.length);
 }
 await writeFile(join(output,'observations.json'),JSON.stringify(observations,null,2)+'\n');
}finally{await browser.close()}
