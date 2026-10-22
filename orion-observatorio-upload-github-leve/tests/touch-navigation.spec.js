import {test,expect} from '@playwright/test';
const base='http://127.0.0.1:4173/?debug=1&quality=eco-plus';
test.use({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
async function ready(page,url=base){
  await page.goto(url);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:25000}).toBe('1');
  await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.loaded),{timeout:25000}).toBe(true);
  await page.evaluate(()=>document.querySelector('#debug').hidden=true);
}
async function drag(page,from,to,cancel=false){
  const client=await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from.x,y:from.y,id:0}]});
  for(let i=1;i<=5;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/5,y:from.y+(to.y-from.y)*i/5,id:0}]});
  await client.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
  await client.detach();
}
test('arrasto explora, não seleciona e toque seguinte abre resumo sem confirmar',async({page})=>{
  test.setTimeout(55000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
  await expect(page.locator('#hint')).toContainText('Toque');
  expect(await page.evaluate(()=>window.__orionHandsDebug.state.animation)).toBe('perspective');
  await drag(page,{x:60,y:260},{x:290,y:350});
  expect(await page.evaluate(()=>window.__orionMotionDebug.targetX)).toBe(0);
  const after=await page.evaluate(()=>({dragging:window.__orionTouchDebug.state.dragging,gestures:window.__orionTouchDebug.state.gestures,
    activations:window.__orionStarDebug.selection.state.activations}));
  expect(after).toEqual({dragging:false,gestures:1,activations:0});
  const star=await page.locator('#heraldTarget').boundingBox();
  await drag(page,{x:star.x+star.width/2,y:star.y+star.height/2},{x:star.x+star.width/2+80,y:star.y+star.height/2+45});
  expect(await page.evaluate(()=>window.__orionStarDebug.selection.state.activations)).toBe(0);
  await expect(page.locator('#heraldCard')).toHaveAttribute('aria-hidden','true');
  await page.locator('#heraldTarget').tap();await expect(page.locator('#heraldCard')).toHaveClass(/visible/);
  await expect(page.locator('#confirmHerald')).toBeVisible();
  await page.locator('#heraldTarget').tap();
  expect(await page.evaluate(()=>window.__orionStarDebug.selection.state.activations)).toBe(0);
  await page.locator('#confirmHerald').tap();
  await expect(page).toHaveURL(/ficha\.html/,{timeout:10000});expect(errors).toEqual([]);
});
test('fechar, Escape, toque fora e cancelar arrasto não iniciam viagem',async({page})=>{
  test.setTimeout(55000);await ready(page);const target=page.locator('#heraldTarget'),card=page.locator('#heraldCard');
  await target.tap();await page.locator('#dismissHerald').tap();
  await expect(card).toHaveAttribute('aria-hidden','true');await expect(target).toHaveAttribute('aria-expanded','false');
  expect(await card.evaluate(node=>node.inert)).toBe(true);
  await target.tap();await page.keyboard.press('Escape');await expect(card).toHaveAttribute('aria-hidden','true');
  await expect(target).toBeFocused();
  await target.tap();await page.touchscreen.tap(40,230);await expect(card).toHaveAttribute('aria-hidden','true');
  await drag(page,{x:30,y:240},{x:160,y:320},true);
  expect(await page.evaluate(()=>window.__orionTouchDebug.state.dragging)).toBe(false);
  await target.tap();await expect(card).toHaveClass(/visible/);
  await expect(page.locator('#confirmHerald')).toBeVisible();
  await page.locator('#confirmHerald').focus();await expect(page.locator('#confirmHerald')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/ficha\.html/,{timeout:10000});
});
test('painel e controles cabem em retrato pequeno, celular, paisagem e rotação',async({page})=>{
  test.setTimeout(110000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await ready(page);
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);await page.waitForTimeout(200);
    await page.locator('#heraldTarget').tap();await expect(page.locator('#heraldCard')).toHaveClass(/visible/);
    await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug.state.hoverBlend)).toBeGreaterThan(.98);
    const card=await page.locator('#heraldCard').boundingBox(),target=await page.locator('#heraldTarget').boundingBox();
    const button=await page.locator('#confirmHerald').boundingBox(),close=await page.locator('#dismissHerald').boundingBox();
    expect(card.x).toBeGreaterThanOrEqual(10);expect(card.x+card.width).toBeLessThanOrEqual(viewport.width-10);
    expect(card.y).toBeGreaterThanOrEqual(10);expect(card.y+card.height).toBeLessThanOrEqual(viewport.height-25);
    expect(card.y>target.y+target.height/2+20||card.x>target.x+target.width/2+20).toBe(true);
    expect(button.height).toBeGreaterThanOrEqual(48);expect(close.width).toBeGreaterThanOrEqual(44);
    expect(button.y+button.height).toBeLessThanOrEqual(card.y+card.height);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:test.info().outputPath(`${viewport.width}-touch-summary.png`)});
    await page.locator('#dismissHerald').tap();await expect(page.locator('#heraldCard')).toHaveAttribute('aria-hidden','true');
    await page.waitForTimeout(350);await page.screenshot({path:test.info().outputPath(`${viewport.width}-touch-rest.png`)});
  }
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);await page.goto('http://127.0.0.1:4173/ficha.html');
    await page.waitForTimeout(800);
    const arrival=await page.locator('.arrival').boundingBox();
    expect(arrival.x).toBeGreaterThanOrEqual(23);
    expect(arrival.x+arrival.width).toBeLessThanOrEqual(viewport.width-23);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(viewport.width);
    await expect(page.getByRole('link',{name:'Retornar ao Observatório'})).toBeVisible();
    console.log('TOUCH_ARRIVAL',JSON.stringify({viewport,arrival}));
    if(viewport.width===320)await page.screenshot({path:test.info().outputPath('320-touch-arrival.png')});
  }
  expect(errors).toEqual([]);
});
test('movimento reduzido mantém vista estática ao arrastar e confirma pelo botão',async({page})=>{
  test.setTimeout(50000);await page.emulateMedia({reducedMotion:'reduce'});await ready(page);
  await drag(page,{x:40,y:240},{x:300,y:360});
  expect(await page.evaluate(()=>({x:window.__orionMotionDebug.targetX,y:window.__orionMotionDebug.targetY}))).toEqual({x:0,y:0});
  await page.locator('#heraldTarget').tap();await page.locator('#confirmHerald').tap();
  await expect(page).toHaveURL(/ficha\.html/,{timeout:10000});
  expect(await page.locator('.arrival').evaluate(node=>getComputedStyle(node).animationName)).toBe('none');
});
test('toque usa orçamento leve e reserva as mãos para a confirmação',async({page})=>{
  test.setTimeout(45000);await ready(page,'http://127.0.0.1:4173/?debug=1');
  const state=await page.evaluate(()=>({mode:window.__orionPerformance.mode,maxPixels:window.__orionPerformance.maxPixels,
    canvasPixels:document.querySelector('canvas').width*document.querySelector('canvas').height,
    hands:window.__orionHandsDebug.state.drawSurfaces,touch:window.__orionHandsDebug.state.touchLayout,
    effects:window.__orionStarDebug.selection.effects.length}));
  expect(['lite','eco-plus','eco']).toContain(state.mode);expect(state.canvasPixels).toBeLessThanOrEqual(950000);
  expect(state.hands).toBe(0);expect(state.touch).toBe(true);expect(state.effects).toBe(0);
});
test('hands=off no toque não baixa imagens e mantém confirmação explícita',async({page})=>{
  test.setTimeout(45000);const assets=[];
  page.on('request',r=>{if(/\/overlay\/(left-hand|right-hand)/.test(r.url()))assets.push(r.url());});
  await page.goto(base+'&hands=off');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady)).toBe('1');
  await page.evaluate(()=>document.querySelector('#debug').hidden=true);
  await page.locator('#heraldTarget').tap();await page.locator('#confirmHerald').tap();
  await expect(page).toHaveURL(/ficha\.html/,{timeout:10000});expect(assets).toEqual([]);
});
