import {test,expect} from '@playwright/test';
test.use({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
async function ready(page,count=3){
 await page.goto(`http://127.0.0.1:4173/?debug=1&stars=${count}&quality=eco-plus`);
 await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:24000}).toBe(true);
 await page.evaluate(()=>document.querySelector('#debug').hidden=true);
}
async function settled(page,index){
 await expect.poll(()=>page.evaluate(()=>window.__orionMobileDebug.state.index)).toBe(index);
 await expect.poll(()=>page.evaluate(()=>window.__orionMobileDebug.state.settled)).toBe(true);
 await expect(page.locator('.herald-target').nth(index)).toBeEnabled();
}
async function drag(page,from,to,cancel=false){
 const client=await page.context().newCDPSession(page);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from.x,y:from.y,id:0}]});
 for(let i=1;i<=5;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/5,y:from.y+(to.y-from.y)*i/5,id:0}]});
 await client.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});await client.detach();
}
for(const viewport of [{width:390,height:844},{width:844,height:390}])test(`guiado ${viewport.width}×${viewport.height}: deslizar, setas, marcadores e confirmação`,async({page})=>{
 test.setTimeout(65000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(viewport);await ready(page);
 await expect(page.locator('#swipeHint')).toBeVisible();await expect(page.locator('#previousStar')).toBeDisabled();
 await expect(page.locator('.star-page')).toHaveCount(3);await expect(page.locator('.herald-target:visible')).toHaveCount(1);
 expect(await page.evaluate(()=>window.__orionHandsDebug.state.visible)).toBe(false);
 for(const button of await page.locator('.browse-controls button').all()){const box=await button.boundingBox();expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
 await drag(page,{x:viewport.width*.8,y:viewport.height*.44},{x:viewport.width*.2,y:viewport.height*.44});await settled(page,1);
 await expect(page.locator('#browseName')).toHaveText('Estrela II');await expect(page.locator('#browseCount')).toHaveText('2 / 3');
 expect(await page.evaluate(()=>window.__orionStarDebug.selectedHeraldId)).toBe(undefined);
 await page.locator('#nextStar').tap();await settled(page,2);await expect(page.locator('#nextStar')).toBeDisabled();
 await page.locator('.star-page').nth(1).tap();await settled(page,1);
 await page.locator('#heraldTarget-preview-2').tap();await expect(page.locator('#heraldCard')).toHaveClass(/visible/);
 await expect(page.locator('#starBrowser')).not.toBeVisible();await expect(page.locator('#confirmHerald')).toHaveText(/Entrar no universo/);
 const card=await page.locator('#heraldCard').boundingBox(),target=await page.locator('#heraldTarget-preview-2').boundingBox();
 expect(viewport.width>viewport.height?card.x>target.x+target.width:card.y>target.y+target.height).toBe(true);
 expect(await page.evaluate(()=>window.__orionHandsDebug.state.visible)).toBe(false);
 await page.locator('#confirmHerald').tap();await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.visible)).toBe(true);
 await page.locator('#nextStar').dispatchEvent('click');
 await expect(page).toHaveURL(/herald=preview-2/,{timeout:15000});await expect(page.locator('.arrival h1')).toHaveText('Estrela II');expect(errors).toEqual([]);
});
test('uma estrela dispensa indicações falsas; duas têm limites e teclado',async({page})=>{
 test.setTimeout(45000);await ready(page,1);await expect(page.locator('#swipeHint')).not.toBeVisible();await expect(page.locator('#nextStar')).not.toBeVisible();
 await drag(page,{x:320,y:350},{x:50,y:350});await settled(page,0);
 await ready(page,2);await expect(page.locator('.star-page')).toHaveCount(2);
 await page.locator('#nextStar').focus();await page.keyboard.press('ArrowRight');await settled(page,1);
 await expect(page.locator('#nextStar')).toBeDisabled();await expect(page.locator('#browseCount')).toHaveText('2 / 2');
 await page.locator('#previousStar').tap();await settled(page,0);await expect(page.locator('#previousStar')).toBeDisabled();
});
test('arrasto vertical, gesto cancelado e toque no resumo não mudam destino',async({page})=>{
 test.setTimeout(45000);await ready(page);
 await drag(page,{x:300,y:300},{x:300,y:500});await settled(page,0);
 await drag(page,{x:320,y:350},{x:50,y:350},true);await settled(page,0);
 await page.locator('#heraldTarget').tap();await page.locator('#heraldTarget').tap();
 expect(await page.evaluate(()=>window.__orionStarDebug.selectedHeraldId)).toBe(undefined);
 await drag(page,{x:250,y:650},{x:60,y:650});expect(await page.evaluate(()=>window.__orionMobileDebug.state.index)).toBe(0);
 await page.locator('#dismissHerald').tap();await expect(page.locator('#swipeHint')).toBeVisible();
});
test('rotação mantém estrela e resumo em 320px, retrato e paisagem',async({page})=>{
 test.setTimeout(60000);await ready(page);await page.locator('#nextStar').tap();await settled(page,1);await page.locator('#heraldTarget-preview-2').tap();
 for(const viewport of [{width:320,height:568},{width:568,height:320},{width:844,height:280},{width:780,height:260},{width:390,height:844},{width:844,height:390}]){
  await page.setViewportSize(viewport);await expect.poll(()=>page.evaluate(()=>window.__orionMobileDebug.state.summary)).toBeGreaterThan(.999);
  await expect(page.locator('#heraldName')).toHaveText('Estrela II');
  const card=await page.locator('#heraldCard').boundingBox();expect(card.x).toBeGreaterThanOrEqual(10);expect(card.y).toBeGreaterThanOrEqual(10);
  expect(card.x+card.width).toBeLessThanOrEqual(viewport.width-10);expect(card.y+card.height).toBeLessThanOrEqual(viewport.height-25);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const leave=await page.locator('#leave').boundingBox(),close=await page.locator('#dismissHerald').boundingBox(),confirm=await page.locator('#confirmHerald').boundingBox();
  expect(close.y).toBeGreaterThan(leave.y+leave.height+8);
  expect(confirm.y+confirm.height).toBeLessThanOrEqual(card.y+card.height);
  expect(confirm.y).toBeGreaterThanOrEqual(card.y);
 }
 await page.locator('#dismissHerald').tap();await settled(page,1);await expect(page.locator('#browseName')).toHaveText('Estrela II');
});
test('movimento reduzido muda estrela sem deslize animado e mantém viagem',async({page})=>{
 test.setTimeout(45000);await page.emulateMedia({reducedMotion:'reduce'});await ready(page,3);await page.locator('#nextStar').tap();await settled(page,1);
 expect(await page.evaluate(()=>window.__orionMobileDebug.state.position)).toBe(1);
 expect(await page.locator('.swipe-cue>span').first().evaluate(n=>getComputedStyle(n).animationName)).toBe('none');
 await page.locator('#heraldTarget-preview-2').tap();await page.locator('#confirmHerald').tap();await expect(page).toHaveURL(/herald=preview-2/,{timeout:15000});
});
test('paisagem curta mantém setas nas laterais e estrela livre dos indicadores',async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:844,height:280});await ready(page);
 for(const viewport of [{width:844,height:280},{width:780,height:260},{width:844,height:390}]){
  await page.setViewportSize(viewport);await settled(page,0);
  const prev=await page.locator('#previousStar').boundingBox(),next=await page.locator('#nextStar').boundingBox();
  const star=await page.locator('#heraldTarget').boundingBox(),name=await page.locator('.browse-heading').boundingBox();
  const dots=await page.locator('#starPages').boundingBox();
  expect(prev.x+prev.width).toBeLessThan(viewport.width*.15);
  expect(next.x).toBeGreaterThan(viewport.width*.85);
  expect(Math.abs(prev.y+prev.height/2-viewport.height/2)).toBeLessThan(1);
  expect(name.y).toBeGreaterThan(star.y+star.height+8);
  expect(dots.y).toBeGreaterThan(name.y+name.height);
  const cue=await page.locator('.swipe-cue').boundingBox(),credit=await page.locator('.astro-credit:visible').boundingBox();
  expect(cue.y+cue.height+4).toBeLessThanOrEqual(credit.y);
  await page.locator('#nextStar').tap();await settled(page,1);
  await page.locator('#previousStar').tap();await settled(page,0);
 }
 await page.setViewportSize({width:390,height:844});await settled(page,0);
 const prev=await page.locator('#previousStar').boundingBox(),next=await page.locator('#nextStar').boundingBox();
 expect(Math.abs(prev.y-next.y)).toBeLessThan(1);expect(prev.y).toBeGreaterThan(600);
});
