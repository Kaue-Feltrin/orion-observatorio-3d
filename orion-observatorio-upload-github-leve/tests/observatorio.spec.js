
test('diagnostico de inicializacao no Chromium',async({page})=>{
  const errors=[];const warnings=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')warnings.push(msg.text());});
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const state=await page.evaluate(()=>({
    sceneReady:document.documentElement.dataset.sceneReady,
    error:document.documentElement.dataset.sceneError,
    loadIssue:document.querySelector('#loadIssue')?.innerText,
    loading:document.querySelector('#loading')?.innerText,
    canvas:document.querySelectorAll('#world canvas').length,
    ua:navigator.userAgent
  }));
  console.log('WEBGL DIAGNOSTICS',JSON.stringify({state,errors,warnings}));
  expect(state.sceneReady,JSON.stringify({state,errors,warnings})).toBe('1');
});
import { test, expect } from '@playwright/test';

test('observatório 3D inicializa com Canvas e estrela', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil:'domcontentloaded' });
  await expect(page.locator('#heraldTarget')).toBeAttached();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.sceneReady),{timeout:14000}).toBe('1');
  await expect(page.locator('#world canvas')).toHaveCount(1);
  await expect(page.locator('#loadIssue')).toBeHidden();
  expect(errors).toEqual([]);
  await page.screenshot({path:'test-results/observatorio-inicial.png'});
});

test('clique na estrela realiza transição para a ficha', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.sceneReady)).toBe('1');
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/, {timeout:9000});
});

test('mouse move cambia yaw e deslocamento, mantendo projecao da estrela', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.sceneReady), {timeout:14000}).toBe('1');
  const before = await page.evaluate(() => window.__orionDepthDebug.rigYaw.rotation.y);
  await page.mouse.move(1210, 250);
  await expect.poll(async () => page.evaluate(() => window.__orionDepthDebug.rigYaw.rotation.y),{timeout:6000})
    .toBeLessThan(before - .015);
  const state=await page.evaluate(() => ({
    yaw:window.__orionDepthDebug.rigYaw.rotation.y,
    x:window.__orionDepthDebug.rigRoot.position.x,
    particles:window.__orionDepthDebug.foregroundParticles.children.length,
    targetX:document.querySelector('#heraldTarget').getBoundingClientRect().x
  }));
  expect(state.x).toBeGreaterThan(1);
  expect(state.particles).toBe(1);
  expect(Number.isFinite(state.targetX)).toBe(true);
});

test('cinco planos animados, bloom seletivo e controle de atmosfera',async({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const state=await page.evaluate(()=>({
    gasLayers:window.__orionAtmosphereDebug.atmosphere.layers.length,
    animated:window.__orionAtmosphereDebug.atmosphere.layers.every(l=>!!l.material.uniforms.uTime),
    bloom:window.__orionAtmosphereDebug.selectiveBloom.state.intensity,
    layerToggles:document.querySelectorAll('.layer-inspector input[type=checkbox]').length,
    sliders:document.querySelectorAll('input[type=range]').length
  }));
  expect(state.gasLayers).toBe(5);expect(state.animated).toBe(true);
  expect(state.bloom).toBeGreaterThan(0);expect(state.layerToggles).toBeGreaterThanOrEqual(11);
  expect(state.sliders).toBeGreaterThanOrEqual(4);expect(errors).toEqual([]);
});

test('estrela distante aponta no mundo, mostra hover e seleciona via raycaster',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1');
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady)).toBe('1');
  const state=await page.evaluate(()=>({
    starZ:window.__orionStarDebug.heraldGroup.position.z,
    backdrop:window.__orionDepthDebug.layers.find(x=>x.userData.layerName.includes('ESO')).position.z,
    pickLayer:window.__orionStarDebug.heraldPickSprite.layers.mask,
    starX:document.querySelector('#heraldTarget').getBoundingClientRect().x
  }));
  expect(state.starZ).toBeLessThan(-400);
  expect(state.backdrop).toBeLessThan(state.starZ);
  expect(state.pickLayer).toBe(4);
  const target=page.locator('#heraldTarget');
  const box=await target.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await expect(page.locator('body')).toHaveClass(/star-aimed/);
  await expect(page.locator('#heraldCard')).toHaveClass(/visible/);
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await expect.poll(async()=>page.evaluate(()=>window.__orionStarDebug.journey.active)).toBe(true);
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
  const trip=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-last-trip-v09')));
  expect(trip.passedGasLayers).toBeGreaterThanOrEqual(5);
  expect(trip.endZ).toBeLessThan(-400);
  expect(trip.endZ).toBeGreaterThan(trip.starZ+40);
});

test('respiração cósmica anima apenas véus e mantém a fotografia ESO intacta',async({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const sample=await page.evaluate(async()=>{
    const r=window.__orionRespirationDebug;
    const a={star:r.state.star,gas:r.state.gas,beacon:r.state.beacon,alpha:r.veils[0].mesh.material.opacity,photo:r.nebula.material.opacity,
      glow:r.beaconGlow.material.opacity,
      twinkle:window.__orionDepthDebug.foregroundParticles.children[0].geometry.getAttribute('aTwinkleRate').count};
    await new Promise(resolve=>setTimeout(resolve,1200));
    const middle={star:r.state.star,alpha:r.veils[0].mesh.material.opacity};
    await new Promise(resolve=>setTimeout(resolve,1200));
    const b={star:r.state.star,gas:r.state.gas,beacon:r.state.beacon,alpha:r.veils[0].mesh.material.opacity,photo:r.nebula.material.opacity,glow:r.beaconGlow.material.opacity};
    return {a,middle,b};
  });
  expect(sample.a.photo).toBe(1);expect(sample.b.photo).toBe(1);
  const range=items=>Math.max(...items)-Math.min(...items);
  expect(range([sample.a.alpha,sample.middle.alpha,sample.b.alpha])).toBeGreaterThan(.00003);
  expect(range([sample.a.star,sample.middle.star,sample.b.star])).toBeGreaterThan(.001);
  expect(sample.a.twinkle).toBe(0);
  expect(errors).toEqual([]);
});

test('movimento reduzido suspende pulso e mantém seleção acessível',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const result=await page.evaluate(()=>({
    state:window.__orionRespirationDebug.state,
    gas:window.__orionAtmosphereDebug.atmosphere.layers[0].material.uniforms.uBreath.value
  }));
  expect(result.state.beacon).toBe(0);
  expect(result.state.gas).toBe(1);
  expect(result.gas).toBe(1);
  await expect(page.locator('#heraldTarget')).toBeAttached();
});

test('desempenho limita pixels e draw calls sem apagar a nebulosa ESO',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const p=await page.evaluate(()=>{
    const q=window.__orionPerformance;
    const canvas=document.querySelector('#world canvas');
    return {mode:q.mode,maxPixels:q.maxPixels,pixels:canvas.width*canvas.height,
      visibleGas:q.visibleGas,photograph:window.__orionRespirationDebug.nebula.material.opacity};
  });
  expect(p.mode).toBe('balanced');
  expect(p.pixels).toBeLessThanOrEqual(p.maxPixels+8000);
  expect(p.visibleGas).toBe(2);
  expect(p.photograph).toBe(1);
});

test('qualidade leve mantém estrela e viagem acessíveis',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?quality=lite&debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const p=await page.evaluate(()=>({
    mode:window.__orionPerformance.mode,
    visibleGas:window.__orionPerformance.visibleGas,
    pixels:document.querySelector('#world canvas').width*document.querySelector('#world canvas').height,
    cap:window.__orionPerformance.maxPixels
  }));
  expect(p.mode).toBe('lite');
  expect(p.visibleGas).toBe(1);
  expect(p.pixels).toBeLessThanOrEqual(p.cap+8000);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('composição limpa reduz estrelas e mantém as pontas luminosas em movimento',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const x=await page.evaluate(async()=>{
    const d=window.__orionCinematicDebug;
    const mat=d.spikes.primary.material;
    const first=mat.rotation;
    await new Promise(resolve=>setTimeout(resolve,950));
    const second=mat.rotation;
    return {first,second,bg:d.starsGroup.children.map(x=>x.geometry.attributes.position.count),
      close:d.foregroundParticles.children[0].geometry.attributes.position.count,
      eso:window.__orionRespirationDebug.nebula.material.opacity,
      gas:window.__orionPerformance.visibleGas,
      bloom:window.__orionAtmosphereDebug.selectiveBloom.state.intensity};
  });
  expect(x.bg).toEqual([110,28,8]);
  expect(x.close).toBe(0);
  expect(Math.abs(x.second-x.first)).toBeGreaterThan(.001);
  expect(x.eso).toBe(1);
  expect(x.gas).toBe(2);
  expect(x.bloom).toBeLessThan(.3);
  expect(errors).toEqual([]);
  await page.screenshot({path:'test-results/observatorio-clean-v092.png'});
});

test('spikes não giram com preferência de movimento reduzido',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/?debug=1',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const a=await page.evaluate(()=>window.__orionCinematicDebug.spikes.primary.material.rotation);
  await page.waitForTimeout(500);
  const b=await page.evaluate(()=>window.__orionCinematicDebug.spikes.primary.material.rotation);
  expect(a).toBe(b);
});

test('sparse void: 146 estrelas reais, zero poeira, zonas vazias e viagem funcionando',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const stats=await page.evaluate(()=>{
    const debug=window.__orionCinematicDebug;
    const depths=debug.starsGroup.children.map(obj=>obj.geometry.attributes.position.count);
    const tan=Math.tan(52*Math.PI/360),aspect=innerWidth/innerHeight;
    let centerViolations=0;
    for(const obj of debug.starsGroup.children){
      const pos=obj.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){
        const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        const ndcX=(x/(26-z))/(tan*aspect);
        const ndcY=(y/(26-z)-43/(26+470))/tan;
        if((ndcX/.51)**2+(ndcY/.42)**2<1)centerViolations++;
      }
    }
    const layers=window.__orionDepthDebug.layers;
    return{
      count:depths.reduce((n,v)=>n+v,0),depths,
      foreground:debug.foregroundParticles.children[0].geometry.attributes.position.count,
      centerViolations,
      backdropVisible:layers.find(o=>o.userData.layerName.includes('Fundo espacial')).visible,
      dustVisible:layers.find(o=>o.userData.layerName.includes('Poeira estelar')).visible,
      photoOpacity:window.__orionRespirationDebug.nebula.material.opacity,
      photoTint:window.__orionRespirationDebug.nebula.material.color.toArray(),
      spikes:debug.spikes.primary.visible
    };
  });
  expect(stats.depths).toEqual([110,28,8]);
  expect(stats.count).toBe(146);
  expect(stats.foreground).toBe(0);
  expect(stats.centerViolations).toBe(0);
  expect(stats.backdropVisible).toBe(false);
  expect(stats.dustVisible).toBe(false);
  expect(stats.photoOpacity).toBe(1);
  expect(stats.spikes).toBe(true);
  expect(errors).toEqual([]);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('filtro segue o Nox sem editar os pixels da fotografia astronômica',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const data=await page.evaluate(async()=>{
    const image=new Image();image.src='/assets/nebula-eso-photographic.jpg';
    await image.decode();
    const root=document.getElementById('observatory');
    const initial={x:parseFloat(root.style.getPropertyValue('--nox-focus-x')),
      y:parseFloat(root.style.getPropertyValue('--nox-focus-y'))};
    const vignette=getComputedStyle(document.querySelector('.scene-vignette')).backgroundImage;
    const material=window.__orionRespirationDebug.nebula.material;
    return{initial,exists:!!image.naturalWidth,imageWidth:image.naturalWidth,
      gradient:vignette.includes('radial-gradient'),texture:!!material.map,
      source:material.map.image?.currentSrc||material.map.image?.src||'',
      opacity:material.opacity};
  });
  expect(data.initial.x).toBeGreaterThan(0);
  expect(data.initial.x).toBeLessThan(100);
  expect(data.initial.y).toBeGreaterThan(0);
  expect(data.initial.y).toBeLessThan(100);
  expect(data.exists).toBe(true);
  expect(data.imageWidth).toBeGreaterThan(3000);
  expect(data.gradient).toBe(true);
  expect(data.texture).toBe(true);
  expect(data.opacity).toBe(1);
  expect(errors).toEqual([]);
});

test('Nebulosa em Volume tem quatro recortes fotográficos com paralaxe real',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=high',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const data=await page.evaluate(async()=>{
    const ls=window.__orionDepthDebug.layers.filter(x=>x.userData.volumeFragment);
    const existing=await Promise.all(['01','02','03','04'].map(async id=>{
      const res=await fetch('/assets/depth/eso-gas-'+id+'.webp');
      return {status:res.status,type:res.headers.get('content-type'),bytes:(await res.arrayBuffer()).byteLength};
    }));
    const initial=ls.map(l=>({x:l.position.x,y:l.position.y,z:l.position.z,opacity:l.material.opacity,width:l.scale.x,visible:l.visible}));
    await new Promise(resolve=>setTimeout(resolve,1100));
    const final=ls.map(l=>({x:l.position.x,y:l.position.y}));
    return {length:ls.length,initial,final,existing,starZ:window.__orionStarDebug.heraldGroup.position.z,
      photo:window.__orionRespirationDebug.nebula.material.opacity};
  });
  expect(data.length).toBe(4);
  expect(data.initial.map(l=>l.z)).toEqual([-425,-342,-252,-185]);
  expect(data.initial.every(l=>l.width>20&&l.visible&&l.opacity>0&&l.opacity<.28)).toBe(true);
  expect(data.existing.every(x=>x.status===200&&x.bytes>3000)).toBe(true);
  expect(data.initial.some((p,i)=>Math.abs(data.final[i].x-p.x)>.03)).toBe(true);
  expect(data.photo).toBe(1);
  expect(errors).toEqual([]);
});

test('mouse segue a direção rapidamente sem forçar layout a cada quadro',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await page.mouse.move(1150,260);
  await expect.poll(async()=>page.evaluate(()=>Math.abs(
    window.__orionMotionDebug.x-window.__orionMotionDebug.targetX)),{timeout:5000}).toBeLessThan(.13);
  const state=await page.evaluate(()=>({
    difference:Math.abs(window.__orionMotionDebug.x-window.__orionMotionDebug.targetX),
    layers:window.__orionMotionDebug.volumeLayers,
    card:document.querySelector('#heraldCard').style.left,
    ratio:window.__orionPerformance.pixelRatio
  }));
  expect(state.layers).toBe(4);
  expect(state.difference).toBeLessThan(.13);
  expect(state.card).toMatch(/px$/);
});

test('modo leve carrega menos fragmentos sem limitar câmera a 30fps',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=lite',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const result=await page.evaluate(()=>{
    const ls=window.__orionDepthDebug.layers.filter(l=>l.userData.volumeFragment);
    return {count:ls.length,visible:ls.filter(l=>l.visible).length,
      ratio:window.__orionPerformance.pixelRatio};
  });
  expect(result.count).toBe(4);
  expect(result.visible).toBe(2);
  expect(result.ratio).toBeLessThanOrEqual(.75);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});


test('mouse distante dispensa Raycaster e vinheta não repinta parada',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await page.waitForTimeout(250);
  const sample=await page.evaluate(async()=>{
    const metrics=window.__orionInteractionMetrics;
    const first=metrics.raycasts;
    for(let i=0;i<50;i++){
      dispatchEvent(new PointerEvent('pointermove',{
        clientX:15+(i%10),clientY:innerHeight-15-(i%5),
        pointerType:'mouse',bubbles:true
      }));
    }
    const distant={events:metrics.pointerEvents,raycasts:metrics.raycasts-first};
    await new Promise(resolve=>setTimeout(resolve,300));
    const idleBefore=metrics.focusWrites;
    await new Promise(resolve=>setTimeout(resolve,900));
    const idleAfter=metrics.focusWrites;
    return {distant,idleWrites:idleAfter-idleBefore};
  });
  expect(sample.distant.events).toBeGreaterThanOrEqual(50);
  expect(sample.distant.raycasts).toBe(0);
  // Movimento respiratório mínimo não deve causar repinturas CSS periódicas.
  // Em SwiftShader a câmera pode levar quadros extras para terminar o movimento.
  expect(sample.idleWrites).toBeLessThanOrEqual(4);
  const box=await page.locator('#heraldTarget').boundingBox();
  const before=await page.evaluate(()=>window.__orionInteractionMetrics.raycasts);
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await expect.poll(async()=>page.evaluate(()=>window.__orionInteractionMetrics.raycasts)).toBeGreaterThan(before);
  await expect(page.locator('body')).toHaveClass(/star-aimed/);
});

// Diagnóstico sem limite de FPS artificial: CI/Chromium não representa a GPU do usuário.
// Salva amostras no log para comparação entre revisões sem aprovar por benchmark isolado.
test('diagnóstico do frame time e uso de recursos da prévia',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const perf=await page.evaluate(async()=>{
    const frames=[];
    let last=0;
    await new Promise(resolve=>{
      const start=performance.now();
      function measure(now){
        if(last)frames.push(now-last);
        last=now;
        if(now-start<1200)requestAnimationFrame(measure);
        else resolve();
      }
      requestAnimationFrame(measure);
    });
    frames.sort((a,b)=>a-b);
    const q=window.__orionPerformance;
    return{
      frameSamples:frames.length,
      medianMs:Number((frames[Math.floor(frames.length/2)]||0).toFixed(2)),
      p90Ms:Number((frames[Math.floor(frames.length*.9)]||0).toFixed(2)),
      drawCalls:q.drawCalls,textures:q.textures,
      pixelRatio:q.pixelRatio,quality:q.mode,
      fragments:window.__orionDepthDebug.layers.filter(l=>l.userData.volumeFragment&&l.visible).length
    };
  });
  console.log('ORION-PERF-SMOKE',JSON.stringify(perf));
  // SwiftShader no CI pode entregar menos de 2 FPS: registrar o valor
  // como diagnóstico, sem impor um limite de FPS do hardware do usuário.
  expect(perf.fragments).toBe(3);
  expect(perf.drawCalls).toBeGreaterThan(1);
});

test('v0.9.4: diagnóstico fica isolado no debug e coleta dados reais locais',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=balanced',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await expect(page.locator('#orionPerfReadout')).toContainText('Perfil:',{timeout:15000});
  await expect(page.locator('#orionPerfReadout')).toContainText('Diferença interna mouse/câmera:');
  const state=await page.evaluate(()=>{
    const o=window.__orionDiagnostic.snapshot();
    return {
      samples:o.samples,quality:o.quality,gas:o.gasLayers,volume:o.volumeLayers,
      fps:o.fps,drawCalls:o.drawCalls,textures:o.textures,report:window.__orionDiagnostic.report()
    };
  });
  expect(state.samples).toBeGreaterThan(0);
  // O perfil adaptativo pode reduzir qualidade em SwiftShader durante o teste.
  expect(['balanced','lite']).toContain(state.quality);
  expect(state.gas).toBe(state.quality==='balanced'?2:1);
  expect(state.volume).toBe(state.quality==='balanced'?3:2);
  expect(state.drawCalls).toBeGreaterThan(1);
  expect(state.report).toContain('não é RAM total');
  expect(state.report).toContain('Shift+Esc');
  await page.locator('.perf-copy').click();
  await expect(page.locator('.perf-copy-status')).not.toBeEmpty();
});

test('v0.9.4: sem debug não adiciona painel nem métricas expostas',async({page})=>{
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await expect(page.locator('#orionPerfReadout')).toHaveCount(0);
  await expect(page.locator('.perf-copy')).toHaveCount(0);
  expect(await page.evaluate(()=>window.__orionDiagnostic)).toBeUndefined();
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});


test('v0.9.5 Eco mantém a foto e duas massas, sem gás ou bloom em repouso',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await expect(page.locator('#orionPerfReadout')).toContainText('Perfil: eco',{timeout:15000});
  const value=await page.evaluate(()=>({
    scene:window.__orionDiagnostic.snapshot(),
    photo:window.__orionRespirationDebug.nebula.material.opacity,
    z:window.__orionDepthDebug.layers.filter(layer=>layer.userData.volumeFragment&&layer.visible).map(layer=>layer.position.z),
    budget:window.__orionPerformance.maxPixels,
    actualPixels:document.querySelector('#world canvas').width*document.querySelector('#world canvas').height
  }));
  expect(value.scene.quality).toBe('eco');
  expect(value.scene.gasLayers).toBe(0);
  expect(value.scene.volumeLayers).toBe(2);
  expect(value.scene.bloomRest).toBe(false);
  expect(value.photo).toBe(1);
  expect(value.z).toEqual([-342,-185]);
  expect(value.budget).toBe(500000);
  expect(value.actualPixels).toBeLessThanOrEqual(value.budget+10000);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.5 comparação isola bloom e gás sem perder seleção do Nox',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=lite&effects=no-bloom',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const b=await page.evaluate(()=>window.__orionDiagnostic.snapshot());
  expect(b.quality).toBe('lite');
  expect(b.effects).toBe('no-bloom');
  expect(b.bloomRest).toBe(false);
  expect(b.gasLayers).toBe(1);
  await expect(page.locator('.perf-comparisons a')).toHaveCount(5);
  await page.locator('.perf-comparisons a').filter({hasText:'Lite sem gás GLSL'}).click();
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const g=await page.evaluate(()=>window.__orionDiagnostic.snapshot());
  expect(g.effects).toBe('no-gas');
  expect(g.bloomRest).toBe(true);
  expect(g.gasLayers).toBe(0);
  expect(g.volumeLayers).toBe(2);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.5 comparações não aparecem fora do modo de depuração',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?quality=eco',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await expect(page.locator('.perf-comparisons a')).toHaveCount(0);
  await expect(page.locator('#orionPerfReadout')).toHaveCount(0);
});


test('v0.9.6 Eco+ conserva bloom, duas massas e um limite de resolução intermediário',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&foreground=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await expect(page.locator('#orionPerfReadout')).toContainText('Perfil: eco-plus',{timeout:15000});
  const info=await page.evaluate(()=>({
    snapshot:window.__orionDiagnostic.snapshot(),
    photo:window.__orionRespirationDebug.nebula.material.opacity,
    maxPixels:window.__orionPerformance.maxPixels,
    pixels:document.querySelector('#world canvas').width*document.querySelector('#world canvas').height,
    volumeZ:window.__orionDepthDebug.layers.filter(l=>l.userData.volumeFragment&&l.visible).map(l=>l.position.z)
  }));
  expect(info.snapshot.quality).toBe('eco-plus');
  expect(info.snapshot.bloomRest).toBe(true);
  expect(info.snapshot.gasLayers).toBe(0);
  expect(info.snapshot.volumeLayers).toBe(2);
  expect(info.volumeZ).toEqual([-342,-185]);
  expect(info.photo).toBe(1);
  expect(info.maxPixels).toBe(670000);
  expect(info.pixels).toBeLessThanOrEqual(680000);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.6 Eco+ sem bloom desliga apenas passes luminosos, mantendo profundidade',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&foreground=off&effects=no-bloom',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const p=await page.evaluate(()=>window.__orionDiagnostic.snapshot());
  expect(p.quality).toBe('eco-plus');
  expect(p.effects).toBe('no-bloom');
  expect(p.bloomRest).toBe(false);
  expect(p.gasLayers).toBe(0);
  expect(p.volumeLayers).toBe(2);
  await expect(page.locator('.perf-comparisons a[aria-current=page]')).toContainText('Eco+ sem bloom');
  await expect(page.locator('#heraldTarget')).toBeAttached();
});


test('v0.9.7 Eco+ tem paralaxe orgânica diferencial sem novos meshes ou gás',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&foreground=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await expect(page.locator('#orionPerfReadout')).toContainText('Profundidade orgânica: ativa',{timeout:15000});
  await page.evaluate(()=>{
    dispatchEvent(new PointerEvent('pointermove',{
      clientX:innerWidth-35,clientY:innerHeight*.20,pointerType:'mouse',bubbles:true
    }));
  });
  await expect.poll(async()=>page.evaluate(()=>{
    const l=window.__orionDepthDebug.layers.find(x=>x.userData.volumeFragment&&x.userData.spec.id==='04');
    return Math.abs(l.userData.parallaxOffsetX);
  }),{timeout:18000}).toBeGreaterThan(.6);
  const data=await page.evaluate(()=>{
    const l=window.__orionDepthDebug.layers.filter(x=>x.userData.volumeFragment&&x.visible);
    const a=window.__orionDiagnostic.snapshot();
    return{
      motion:window.__orionDepthDebug.nebulaMotion.parallaxEnabled,
      z:l.map(x=>x.position.z),offsets:l.map(x=>Math.abs(x.userData.parallaxOffsetX)),
      scales:l.map(x=>x.scale.x/x.userData.baseScaleX),
      gas:a.gasLayers,volumes:a.volumeLayers,bloom:a.bloomRest,
      photo:window.__orionRespirationDebug.nebula.material.opacity,
      budget:window.__orionPerformance.maxPixels
    };
  });
  expect(data.motion).toBe(true);
  expect(data.z).toEqual([-342,-185]);
  expect(data.offsets[1]).toBeGreaterThan(data.offsets[0]);
  expect(data.scales.every(v=>v>.995&&v<1.005)).toBe(true);
  expect(data.gas).toBe(0);
  expect(data.volumes).toBe(2);
  expect(data.bloom).toBe(true);
  expect(data.photo).toBe(1);
  expect(data.budget).toBe(670000);
  expect(errors).toEqual([]);
  await page.screenshot({path:'test-results/eco-plus-v097-profundidade.png'});
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.7 comparativo legado e movimento reduzido não deslocam fotos',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&foreground=off&depthMotion=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await page.evaluate(()=>{
    dispatchEvent(new PointerEvent('pointermove',{
      clientX:innerWidth-25,clientY:15,pointerType:'mouse',bubbles:true
    }));
  });
  await page.waitForTimeout(450);
  const compare=await page.evaluate(()=>{
    const l=window.__orionDepthDebug.layers.filter(x=>x.userData.volumeFragment&&x.visible);
    return{motion:window.__orionDiagnostic.snapshot().depthMotion,
      offset:l.map(x=>x.userData.parallaxOffsetX),bloom:window.__orionDiagnostic.snapshot().bloomRest,
      target:document.querySelector('.perf-depth-compare')?.textContent};
  });
  expect(compare.motion).toBe(false);
  expect(compare.offset).toEqual([0,0]);
  expect(compare.bloom).toBe(true);
  expect(compare.target).toContain('Ativar profundidade');
  await page.locator('.perf-depth-compare').first().click();
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  expect(await page.evaluate(()=>window.__orionDiagnostic.snapshot().depthMotion)).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  expect(await page.evaluate(()=>window.__orionDiagnostic.snapshot().depthMotion)).toBe(false);
});


test('v0.9.8 responde rapidamente ao cursor com amplitude 3x maior sem camadas extras',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&foreground=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const first=await page.evaluate(()=>{
    const layers=window.__orionDepthDebug.layers.filter(x=>x.userData.volumeFragment&&x.visible);
    return {amplitudes:layers.map(l=>l.userData.spec.parallaxX),
      state:window.__orionDepthDebug.nebulaMotion.parallaxStrength};
  });
  expect(first.amplitudes).toEqual([5.2,16.5]);
  expect(first.state).toBe(1);
  await page.evaluate(()=>{
    dispatchEvent(new PointerEvent('pointermove',{
      clientX:innerWidth-20,clientY:innerHeight*.42,pointerType:'mouse',bubbles:true
    }));
  });
  await expect.poll(async()=>page.evaluate(()=>{
    const near=window.__orionDepthDebug.layers.find(l=>l.userData.volumeFragment&&l.userData.spec.id==='04');
    return Math.abs(near.userData.parallaxOffsetX);
  }),{timeout:18000}).toBeGreaterThan(8);
  const sample=await page.evaluate(()=>window.__orionDiagnostic.snapshot());
  expect(sample.quality).toBe('eco-plus');
  expect(sample.gasLayers).toBe(0);
  expect(sample.volumeLayers).toBe(2);
  expect(sample.bloomRest).toBe(true);
  expect(sample.parallaxStrength).toBe(1);
  expect(errors).toEqual([]);
});

test('v0.9.8 intensidade ajustável no debug sem alterar qualidade nem viagem',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&foreground=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await page.evaluate(()=>{
    const input=document.querySelector('input[aria-label="Paralaxe da nebulosa"]');
    input.value='1.6';
    input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect.poll(async()=>page.evaluate(()=>window.__orionDepthDebug.nebulaMotion.parallaxStrength)).toBe(1.6);
  const p=await page.evaluate(()=>window.__orionDiagnostic.snapshot());
  expect(p.parallaxStrength).toBe(1.6);
  expect(p.bloomRest).toBe(true);
  expect(p.canvasPixels).toBeLessThanOrEqual(680000);
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});


test('v0.9.9 Eco+ cria terceiro recorte ESO mais próximo com ordem correta',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  await expect(page.locator('#orionPerfReadout')).toContainText('Véu frontal próximo da câmera: sim',{timeout:15000});
  const data=await page.evaluate(()=>{
    const ls=window.__orionDepthDebug.layers.filter(l=>l.userData.volumeFragment&&l.visible);
    return {depth:ls.map(l=>l.position.z),
      order:ls.map(l=>l.renderOrder),
      opacity:ls.map(l=>l.material.opacity),
      originals:ls.map(l=>l.userData.spec.id),
      status:window.__orionDiagnostic.snapshot(),
      photo:window.__orionRespirationDebug.nebula.material.opacity};
  });
  expect(data.depth).toEqual([-342,-75,-185]);
  expect(data.originals).toEqual(['02','03','04']);
  expect(data.order[1]).toBeGreaterThan(data.order[2]); // -75 is in front of -185.
  expect(data.opacity[1]).toBeLessThan(.095); // Soft photographic foreground.
  expect(data.status.foregroundNear).toBe(true);
  expect(data.status.volumeLayers).toBe(3);
  expect(data.status.gasLayers).toBe(0);
  expect(data.status.bloomRest).toBe(true);
  expect(data.status.quality).toBe('eco-plus');
  expect(data.photo).toBe(1);
  expect(errors).toEqual([]);
  await page.screenshot({path:'test-results/v099-terceiro-recorte-frontal.png'});
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.9 sem véu frontal restaura exatamente os dois planos e mantém o bloom',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&foreground=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const data=await page.evaluate(()=>{
    const ls=window.__orionDepthDebug.layers.filter(l=>l.userData.volumeFragment&&l.visible);
    const stat=window.__orionDiagnostic.snapshot();
    return{depth:ls.map(l=>l.position.z),volumes:stat.volumeLayers,
      foreground:stat.foregroundNear,bloom:stat.bloomRest,
      href:document.querySelectorAll('.perf-depth-compare')[1]?.href};
  });
  expect(data.depth).toEqual([-342,-185]);
  expect(data.volumes).toBe(2);
  expect(data.foreground).toBe(false);
  expect(data.bloom).toBe(true);
  expect(data.href).toContain('quality=eco-plus');
  expect(data.href).not.toContain('foreground=off');
  // Painel v0.9.10 inclui também o toggle de mãos; escolher por função.
  await page.locator('.perf-depth-compare').filter({hasText:'Ativar véu próximo'}).click();
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  expect(await page.evaluate(()=>window.__orionDiagnostic.snapshot().volumeLayers)).toBe(3);
});


test('v0.9.10 mãos etéreas são viewmodel da câmera e não cobrem o Nox',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&hands=on',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const data=await page.evaluate(()=>{
    const h=window.__orionHandsDebug;
    const c=window.__orionDepthDebug.camera;
    const a=window.__orionDiagnostic.snapshot();
    // Local à câmera: projetar sem depender de THREE global no navegador.
    const halfHeight=Math.tan(c.fov*Math.PI/360)*1.2;
    const projection=h.meshes.map(mesh=>[
      mesh.position.x/(halfHeight*c.aspect),mesh.position.y/halfHeight
    ]);
    return {state:h.state,meshes:h.meshes.length,
      attached:h.meshes.every(m=>m.parent===c),
      sameTexture:h.meshes[0].material.map===h.meshes[1].material.map,
      sameMaterial:h.meshes[0].material===h.meshes[1].material,
      depth:h.meshes.map(m=>m.position.z),
      names:h.meshes.map(m=>m.name),
      layer:h.meshes.map(m=>m.layers.mask),
      opacity:h.meshes[0].material.opacity,
      planes:a.volumeLayers,gas:a.gasLayers,bloom:a.bloomRest,
      handsVisible:a.handsVisible,handsSurfaces:a.handsSurfaces,
      projection:projection,photo:window.__orionRespirationDebug.nebula.material.opacity};
  });
  expect(data.meshes).toBe(2);
  expect(data.state.visible).toBe(true);
  expect(data.attached).toBe(true);
  expect(data.sameTexture).toBe(true);
  expect(data.sameMaterial).toBe(true);
  expect(data.layer).toEqual([1,1]);
  expect(data.opacity).toBeGreaterThanOrEqual(.72);
  expect(data.opacity).toBeLessThanOrEqual(.82);
  expect(data.depth).toEqual([-1.1,-1]);
  expect(data.projection[0][0]).toBeLessThan(-.64);
  expect(data.projection[1][0]).toBeGreaterThan(.50); // Centro livre mesmo após sway.
  expect(data.projection[0][1]).toBeLessThan(-.67);
  expect(data.projection[1][1]).toBeLessThan(-.61);
  expect(data.planes).toBe(3);
  expect(data.gas).toBe(0);
  expect(data.bloom).toBe(true);
  expect(data.handsVisible).toBe(true);
  expect(data.handsSurfaces).toBe(2);
  expect(data.photo).toBe(1);
  expect(errors).toEqual([]);
  await page.screenshot({path:'test-results/v0911-maos-corpo-presenca.png'});
  await page.locator('#heraldTarget').click({force:true});
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});

test('v0.9.10 sem mãos restaura cena e não aloca viewmodel',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&hands=off',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const initial=await page.evaluate(()=>({
    enabled:window.__orionHandsDebug.state.enabled,
    childCount:window.__orionHandsDebug.meshes.length,
    textures:window.__orionHandsDebug.state.textureCount,
    result:window.__orionDiagnostic.snapshot(),
    toggle:[...document.querySelectorAll('.perf-depth-compare')].at(-1)?.textContent
  }));
  expect(initial.enabled).toBe(false);
  expect(initial.childCount).toBe(0);
  expect(initial.textures).toBe(0);
  expect(initial.result.handsVisible).toBe(false);
  expect(initial.result.handsSurfaces).toBe(0);
  expect(initial.result.volumeLayers).toBe(3);
  expect(initial.toggle).toContain('Ativar mãos etéreas');
  await page.locator('.perf-depth-compare').last().click();
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  expect(await page.evaluate(()=>window.__orionDiagnostic.snapshot().handsVisible)).toBe(true);
});

test('v0.9.10 movimento reduzido remove sway e viagem oculta mãos',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&hands=on',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const before=await page.evaluate(()=>window.__orionHandsDebug.meshes.map(m=>({x:m.position.x,y:m.position.y,rot:m.rotation.z})));
  await page.mouse.move(1500,700);
  await page.waitForTimeout(400);
  const after=await page.evaluate(()=>({
    current:window.__orionHandsDebug.meshes.map(m=>({x:m.position.x,y:m.position.y,rot:m.rotation.z})),
    moving:window.__orionHandsDebug.state.motionEnabled
  }));
  expect(after.moving).toBe(false);
  expect(after.current).toEqual(before);
  await page.locator('#heraldTarget').click({force:true});
  await expect.poll(async()=>page.evaluate(()=>window.__orionHandsDebug?.state.visible===false),{timeout:1200}).toBe(true);
  await expect(page).toHaveURL(/ficha\.html/,{timeout:9000});
});


test('v0.9.11 nova pose deixa mãos mais altas e assimétricas, com mesma textura',async({page})=>{
  await page.goto('http://127.0.0.1:4173/?debug=1&quality=eco-plus&hands=on',{waitUntil:'domcontentloaded'});
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:15000}).toBe('1');
  const p=await page.evaluate(()=>{
    const m=window.__orionHandsDebug.meshes;
    const camera=window.__orionDepthDebug.camera;
    return{
      poses:m.map(x=>{
        const halfHeight=Math.tan(camera.fov*Math.PI/360)*Math.abs(x.position.z);
        return{x:x.position.x/(halfHeight*camera.aspect),y:x.position.y/halfHeight,
          roll:x.rotation.z,pitch:x.rotation.x,
          scaledHeight:x.scale.y/halfHeight,z:x.position.z};
      }),
      mapped:m[0].material.map===m[1].material.map,
      counts:window.__orionDiagnostic.snapshot()
    };
  });
  expect(p.poses[0].x).toBeGreaterThan(-.76);
  expect(p.poses[0].x).toBeLessThan(-.63);
  expect(p.poses[1].x).toBeGreaterThan(.60);
  expect(p.poses[1].x).toBeLessThan(.75);
  expect(p.poses[0].y).toBeGreaterThan(-.80);
  expect(p.poses[1].y).toBeGreaterThan(-.73);
  expect(p.poses[0].scaledHeight).toBeGreaterThan(1.04);
  expect(p.poses[1].scaledHeight).toBeGreaterThan(p.poses[0].scaledHeight);
  expect(p.poses[0].roll).toBeLessThan(-.12);
  expect(p.poses[1].roll).toBeGreaterThan(.12);
  expect(p.mapped).toBe(true);
  expect(p.counts.quality).toBe('eco-plus');
  expect(p.counts.bloomRest).toBe(true);
  expect(p.counts.volumeLayers).toBe(3);
});
