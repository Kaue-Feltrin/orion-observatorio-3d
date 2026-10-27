import {test,expect} from '@playwright/test';
const query='stars=0&quality=eco&debug=1';
async function ready(page){
 await page.goto('http://127.0.0.1:4173/criacao.html?'+query);
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-art','ready');
 await page.waitForFunction(()=>window.__orionHandsDebug?.state.loaded);
 await page.evaluate(()=>document.getElementById('debug').hidden=true);
}
test('camadas carregam com alpha, céu exclusivo e paralaxe reversível',async({page})=>{
 const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await ready(page);
 await page.waitForFunction(()=>window.__orionCreationEnvironment.photo.material.map.image?.width>0);
 const info=await page.evaluate(()=>({photo:window.__orionCreationEnvironment.photo.material.map.image.src,glyphs:window.__orionCreationDebug.state.glyphs,surfaces:window.__orionCreationDebug.state.surfaces,shared:window.__orionCreationEnvironment.layers.every(l=>l.material.uniforms.map.value===window.__orionCreationEnvironment.photo.material.map)}));
 expect(info.photo).toContain('/creation/ink-cosmos-v6.png');expect(info.glyphs).toBe(96);expect(info.surfaces).toBe(5);expect(info.shared).toBe(true);
 await page.mouse.move(20,300);await expect.poll(()=>page.evaluate(()=>window.__orionCreationEnvironment.layers[0].userData.parallaxOffsetX)).toBeGreaterThan(.5);
 await page.mouse.move(1240,300);await expect.poll(()=>page.evaluate(()=>window.__orionCreationEnvironment.layers[0].userData.parallaxOffsetX)).toBeLessThan(-.5);
 const assets=await page.evaluate(()=>({baby:window.__orionCreationDebug.meshes.baby.material.uniforms.uMap.value.image.src,children:window.__orionCreationDebug.meshes.menina.material.uniforms.uMap.value.image.src,rigs:Object.values(window.__orionCreationDebug.rigs).map(r=>({skinned:r.mesh.isSkinnedMesh,joints:r.bones.length})),font:window.__orionCreationDebug.bindings.state,alpha:window.__orionCreationDebug.bindings.front.material.uniforms.uMap.value.image.getContext("2d").getImageData(0,0,1024,512).data.some((v,i)=>i%4===3&&v>0)}));
 expect(assets.baby).toContain('unborn-v5.png');expect(assets.children).toContain('souls-v5.png');expect(assets.rigs).toEqual(Array(3).fill({skinned:true,joints:16}));expect(assets.font.loaded).toBe(true);expect(assets.font.phrase).toBe('Acorrentado pela realidade');expect(assets.font.fontURL).toBe('/fonts/SigilosDeConhecimento.ttf');expect(assets.alpha).toBe(true);
 const layerState=await page.evaluate(()=>({field:window.__orionCreationDebug.state.fieldLayers,hasField:!!window.__orionCreationDebug.meshes.field,orbitTime:window.__orionCreationDebug.bindings.state.time}));
 expect(layerState.field).toBe(0);expect(layerState.hasField).toBe(false);
 await expect.poll(()=>page.evaluate(()=>window.__orionCreationDebug.bindings.state.time)).toBeGreaterThan(layerState.orbitTime);
 await expect(page.locator('.blood-prologue')).toHaveText('Tudo começa pelo sangue.');
 expect(errors).toEqual([]);expect(failed).toEqual([]);
});
test('Tornar Marcado inicia VFX sem gesto e transforma o sangue em vazio cinza',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();
 const mark=page.getByRole('button',{name:'Tornar Marcado',exact:true});await expect(mark).toBeVisible();
 await mark.click();
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','breaking');
 const initial=await page.evaluate(()=>({selecting:window.__orionHandsDebug.state.selecting,hover:window.__orionHandsDebug.state.rightHover,domAnimations:document.querySelector('.sealed-being').getAnimations({subtree:true}).length}));
 expect(initial.selecting).toBe(false);expect(initial.hover).toBe(false);expect(initial.domAnimations).toBe(0);
 await expect.poll(()=>page.evaluate(()=>window.__orionCreationDebug.state.releaseProgress)).toBeGreaterThan(.2);
 await page.waitForFunction(()=>{const art=window.__orionCreationDebug;return art.state.bindingFracture>0});
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
 expect(await page.evaluate(()=>window.__orionCreationDebug.bindings.root.visible)).toBe(false);
 expect(await page.evaluate(()=>window.__orionCreationDebug.meshes.menina.visible&&window.__orionCreationDebug.meshes.menino.visible)).toBe(true);
 expect(await page.evaluate(()=>window.__orionCreationDebug.state.environmentTransition)).toBe(1);
 await page.getByRole('button',{name:'Escolher menina',exact:true}).click();
 expect(await page.evaluate(()=>window.__orionCreationDebug.state.selected)).toBe('menina');
 await page.locator('#herald-name').fill('Alma');
 expect(await page.locator('#herald-name').evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('none');
 expect(await page.evaluate(()=>window.__orionCreationDebug.state.fieldLayers)).toBe(0);
});
test('céu original do Observatório continua separado da nova criação',async({page})=>{
 await page.goto('http://127.0.0.1:4173/?stars=3&quality=eco&debug=1');
 await expect(page.locator('html')).toHaveAttribute('data-scene-ready','1');
 await expect(page.locator('.herald-target')).toHaveCount(3);
 await page.waitForFunction(()=>window.__orionRespirationDebug.nebula.material.map.image?.width>0);
 expect(await page.evaluate(()=>window.__orionRespirationDebug.nebula.material.map.image.src)).toContain('/assets/nebula-eso-photographic.jpg');
 expect(await page.evaluate(()=>window.__orionCreationEnvironment)).toBeUndefined();
});

 test('a chegada aguarda a fonte real sem exibir alfabeto de fallback',async({page})=>{
  let releaseFont;const held=new Promise(resolve=>releaseFont=resolve);
  await page.route('**/fonts/SigilosDeConhecimento.ttf',async route=>{await held;await route.continue();});
  await page.goto('http://127.0.0.1:4173/criacao.html?'+query+'&via=observatory');
  await expect(page.locator('#observatory')).not.toHaveAttribute('data-creation-art','ready');
  await expect(page.locator('html')).toHaveAttribute('data-page-veil','enter');
  await expect(page.locator('html')).not.toHaveAttribute('data-arrival-ready','1');
  await expect(page.locator('.baby-target')).toBeDisabled();
  releaseFont();
  await expect(page.locator('#observatory')).toHaveAttribute('data-creation-art','ready');
  await expect(page.locator('html')).toHaveAttribute('data-arrival-ready','1');
  expect(await page.evaluate(()=>document.fonts.check('16px OrionKnowledge'))).toBe(true);
 });
