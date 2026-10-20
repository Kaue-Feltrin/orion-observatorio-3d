import {test,expect} from '@playwright/test';
const base='http://127.0.0.1:4173/';
const query='quality=eco-plus&hands=mesh&handsMotion=perspective&debug=1';
async function ready(page,count){
 await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:24000}).toBe('1');
 await expect(page.locator('.herald-target')).toHaveCount(count);
 await page.evaluate(()=>document.querySelector('#debug').hidden=true);
 await expect.poll(()=>page.evaluate(()=>window.__orionStarDebug.heralds.every(h=>Number.isFinite(h.screen.x)))).toBe(true);
}
for(const count of [1,2,3])for(let index=0;index<count;index++){
 test(`${count} estrela(s): destino ${index+1} preserva identidade e permite retornar`,async({page})=>{
  test.setTimeout(50000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}?${query}&stars=${count}`);await ready(page,count);
  const buttons=page.locator('.herald-target'),button=buttons.nth(index);
  await page.mouse.move(12,190);await button.focus();
  const name=index===0?'Nox':`Estrela ${index===1?'II':'III'}`,id=index===0?'nox':`preview-${index+1}`;
  await expect(page.locator('#heraldName')).toHaveText(name);
  await expect(button).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Enter');
  await expect.poll(()=>page.evaluate(()=>window.__orionStarDebug.selectedHeraldId)).toBe(id);
  // Eventos repetidos e tentativa de trocar de alvo durante a confirmação não desviam a viagem.
  await buttons.nth((index+1)%count).dispatchEvent('click',{detail:1});
  const state=await page.evaluate(()=>window.__orionStarDebug.heralds.map(h=>({id:h.data.id,activations:h.selection.state.activations})));
  expect(state.filter(h=>h.activations===1).map(h=>h.id)).toEqual([id]);
  await expect(page).toHaveURL(/ficha\.html/,{timeout:15000});
  await expect(page.locator('.arrival h1')).toHaveText(name);
  await expect(page.locator('.arrival')).toHaveAttribute('data-herald-id',id);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.arrivalReady)).toBe('1');
  expect(new URL(page.url()).searchParams.has('via')).toBe(false);
  const trip=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-last-trip-v09')));
  expect(trip.heraldId).toBe(id);expect(trip.passedGasLayers).toBeGreaterThanOrEqual(5);expect(trip.endZ).toBeCloseTo(-417,8);
  await page.locator('.arrival a').click();await expect(page).toHaveURL(/index\.html/); 
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:24000}).toBe('1');
  await expect(buttons).toHaveCount(count);expect(new URL(page.url()).searchParams.get('handsMotion')).toBe('perspective');
  expect(errors).toEqual([]);
 });
}
test('raio do mouse escolhe cada estrela e compartilha texturas sem misturar resumos',async({page})=>{
 test.setTimeout(45000);await page.goto(`${base}?${query}&stars=3`);await ready(page,3);
 for(let i=0;i<3;i++){
  const position=await page.evaluate(index=>window.__orionStarDebug.heralds[index].screen,i);
  await page.mouse.move(position.x+20,position.y); // pointer:fine desativa hit testing do HTML; a mira passa pelo sprite 3D.
  await expect.poll(()=>page.evaluate(()=>window.__orionStarDebug.heraldGroup.uuid)).toBe(await page.evaluate(index=>window.__orionStarDebug.heralds[index].group.uuid,i));
  await expect(page.locator('#heraldName')).toHaveText(i===0?'Nox':i===1?'Estrela II':'Estrela III');
 }
 const maps=await page.evaluate(()=>window.__orionStarDebug.heralds.map(h=>[h.glows.main.material.map.uuid,h.spikes.primary.material.map.uuid]));
 expect(new Set(maps.map(m=>m[0])).size).toBe(1);expect(new Set(maps.map(m=>m[1])).size).toBe(1);
 const position=await page.evaluate(()=>window.__orionStarDebug.heralds[1].screen);
 await page.mouse.click(position.x+20,position.y);
 await expect(page).toHaveURL(/herald=preview-2/,{timeout:15000});await expect(page.locator('.arrival h1')).toHaveText('Estrela II');
});
test('véu cobre saída e primeiro quadro da chegada até módulo atrasado ficar pronto',async({page})=>{
 test.setTimeout(50000);
 let releaseModule;const moduleReady=new Promise(resolve=>releaseModule=resolve);
 await page.route(/\/assets\/ficha-[^/]+\.js$/,async route=>{await moduleReady;await route.continue();});
 // A preparação falha, mas a navegação real continua funcionando.
 await page.route(/\/ficha\.html\?/,async route=>{
  if(!route.request().isNavigationRequest()){await route.abort();return;}
  await new Promise(resolve=>setTimeout(resolve,700));await route.continue();
 });
 await page.goto(`${base}?${query}&stars=3`);await ready(page,3);
 await page.evaluate(()=>{
  const samples=[];
  function sample(){
   const phase=window.__orionStarDebug.transition.phase;
   if(phase==='covered'||phase==='navigating'){
    const flash=document.querySelector('#arrivalFlash');samples.push({phase,opacity:getComputedStyle(flash).opacity,veil:flash.style.getPropertyValue('--veil-opacity'),background:getComputedStyle(flash).backgroundColor});
    sessionStorage.setItem('orion-veil-test',JSON.stringify(samples));
   }
   requestAnimationFrame(sample);
  }requestAnimationFrame(sample);
 });
 await page.locator('#heraldTarget-preview-3').click({force:true});
 await page.waitForURL(/ficha\.html/,{waitUntil:'commit',timeout:15000});
 // O bootstrap é anterior ao módulo e à primeira pintura: o fundo já está coberto.
 await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.pageVeil)).toBe('enter');
 const covered=await page.evaluate(()=>({opacity:getComputedStyle(document.documentElement,'::before').opacity,
  background:getComputedStyle(document.documentElement,'::before').backgroundColor,samples:JSON.parse(sessionStorage.getItem('orion-veil-test'))}));
 expect(covered.opacity).toBe('1');expect(covered.background).toBe('rgb(255, 250, 236)');
 expect(covered.samples.length).toBeGreaterThan(0);
 expect(covered.samples.every(s=>s.opacity==='1'&&s.veil==='1'&&s.background===covered.background)).toBe(true);
 releaseModule();await expect(page.locator('.arrival h1')).toHaveText('Estrela III');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.arrivalReady)).toBe('1');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.pageVeil)).toBe(undefined);
 await expect(page).not.toHaveURL(/via=/);
});
test('movimento reduzido, acesso direto e destino inválido mantêm chegada utilizável',async({page})=>{
 test.setTimeout(45000);await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(`${base}?${query}&stars=2`);await ready(page,2);
 await page.locator('#heraldTarget-preview-2').click({force:true});await expect(page).toHaveURL(/herald=preview-2/,{timeout:12000});
 await expect(page.locator('.arrival h1')).toHaveText('Estrela II');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.pageVeil)).toBe(undefined);
 await page.goto(`${base}ficha.html?stars=3&herald=not-a-star`);await expect(page.locator('.arrival h1')).toHaveText('Nox');
 await expect(page.locator('.arrival a')).toBeVisible();
});
test.describe('regressão do toque compartilhado',()=>{
 test.use({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
 test('segunda estrela abre resumo sem viagem e confirmação chega ao destino correto',async({page})=>{
  test.setTimeout(45000);await page.goto(`${base}?${query}&stars=3`);await ready(page,3);
  await page.locator('#heraldTarget-preview-2').tap();await expect(page.locator('#heraldName')).toHaveText('Estrela II');
  expect(await page.evaluate(()=>window.__orionStarDebug.selectedHeraldId)).toBe(undefined);
  await page.locator('#confirmHerald').tap();await expect(page).toHaveURL(/herald=preview-2/,{timeout:15000});
  await expect(page.locator('.arrival h1')).toHaveText('Estrela II');
 });
});
test('limite de três, fallback de contagem inválida e reposicionamento mantêm alvos separados',async({page})=>{
 test.setTimeout(50000);
 await page.goto(`${base}?${query}&stars=99`);await ready(page,3);
 for(const viewport of [{width:1280,height:720},{width:844,height:390}]){
  await page.setViewportSize(viewport);
  await expect.poll(()=>page.evaluate(()=>window.__orionDepthDebug.camera.aspect)).toBeCloseTo(viewport.width/viewport.height,4);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const points=await page.evaluate(()=>window.__orionStarDebug.heralds.map(h=>h.screen));
  for(const p of points){expect(p.x).toBeGreaterThan(30);expect(p.x).toBeLessThan(viewport.width-30);expect(p.y).toBeGreaterThan(50);expect(p.y).toBeLessThan(viewport.height-50);}
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)expect(Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)).toBeGreaterThan(100);
 }
 await page.goto(`${base}?${query}&stars=invalid`);await ready(page,1);await expect(page.locator('#heraldCount')).toHaveText('1 arauto ativo');
});
test('voltar pelo navegador restaura o Observatório sem clarão ou seleção travados',async({page})=>{
 test.setTimeout(50000);await page.goto(`${base}?${query}&stars=3`);await ready(page,3);
 await page.locator('#heraldTarget-preview-3').click({force:true});await expect(page).toHaveURL(/ficha\.html/,{timeout:15000});
 await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.arrivalReady)).toBe('1');
 await page.goBack();await ready(page,3);
 expect(await page.evaluate(()=>window.__orionStarDebug.selectedHeraldId)).toBe(undefined);
 await expect.poll(()=>page.locator('#arrivalFlash').evaluate(node=>getComputedStyle(node).opacity)).toBe('0');
 await page.locator('#heraldTarget').focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/herald=nox/,{timeout:15000});
});
