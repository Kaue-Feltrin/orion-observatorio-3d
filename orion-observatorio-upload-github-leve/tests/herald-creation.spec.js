import {test,expect} from '@playwright/test';
const origin='http://127.0.0.1:4173';
const params='stars=0&quality=eco&effects=no-gas';
async function identity(page){
 await page.goto(`${origin}/criacao.html?${params}`);
 await expect(page.locator('html')).toHaveAttribute('data-scene-ready','1');
 await expect(page.getByRole('button',{name:'Tornar Marcado',exact:true})).toBeHidden();
 await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();
 await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
}
test('conta vazia tem estrela central e atravessa o mesmo véu até o bebê selado',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${origin}/?${params}`);
 await expect(page.locator('html')).toHaveAttribute('data-scene-ready','1');
 const star=page.getByRole('button',{name:'Criar meu primeiro arauto'});
 await expect(star).toHaveCount(1);
 const bounds=await star.boundingBox(),view=page.viewportSize();
 expect(Math.abs(bounds.x+bounds.width/2-view.width/2)).toBeLessThan(30);
 expect(Math.abs(bounds.y+bounds.height/2-view.height/2)).toBeLessThan(30);
 await star.click();
 await expect(page).toHaveURL(/criacao\.html/,{timeout:14000});
 await expect(page.locator('html')).toHaveAttribute('data-arrival-ready','1');
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-art','ready');
 await expect(page.getByRole('button',{name:'Contemplar a silhueta etérea'})).toBeEnabled();
 await expect(page.locator('#identityForm')).toBeHidden();expect(errors).toEqual([]);
});
test('ruptura completa, gênero exclusivo, nome e continuação sem gravação remota',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const writes=[];page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url())});
 await identity(page);
 await expect(page.locator('.sealed-being')).toBeHidden();
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-art','ready');
 await expect(page.getByRole('button',{name:'Continuar com esta identidade'})).toBeHidden();
 await page.getByRole('button',{name:'Escolher menina',exact:true}).click();
 const next=page.getByRole('button',{name:'Continuar com esta identidade'});await expect(next).toBeVisible();await expect(next).toBeDisabled();
 await page.locator('#herald-name').fill('   ');await expect(next).toBeDisabled();
 await page.getByLabel('Não definir gênero',{exact:true}).check();
 await expect(page.locator('[data-gender][aria-pressed=true]')).toHaveCount(0);
 await page.getByRole('button',{name:'Escolher menino',exact:true}).click();
 await expect(page.getByLabel('Não definir gênero',{exact:true})).not.toBeChecked();
 await expect(page.locator('[data-gender][aria-pressed=true]')).toHaveCount(1);
 await page.locator('#herald-name').fill('Astra');
 await expect(page.locator('#creationStatus')).toHaveText('Sua identidade está pronta para continuar.');
 await page.evaluate(()=>{window.creationEvents=[];document.addEventListener('orion:creation-continue',e=>window.creationEvents.push(e.detail))});
 await next.click();await expect(next).toBeDisabled();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')))).toMatchObject({name:'Astra',gender:'menino',step:'identity'});
 expect(await page.evaluate(()=>window.creationEvents.length)).toBe(1);
 expect(writes).toEqual([]);expect(errors).toEqual([]);
});
test('teclado e movimento reduzido completam ruptura e não definir gênero',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(`${origin}/criacao.html?${params}&hands=off&debug=1`);
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-art','ready');
 await page.evaluate(()=>document.getElementById('debug').hidden=true);
 expect(await page.evaluate(()=>window.__orionCreationDebug.meshes.field.material.uniforms.uMotion.value)).toBe(0);
 const baby=page.getByRole('button',{name:'Contemplar a silhueta etérea'});await baby.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Tornar Marcado',exact:true})).toBeFocused();await page.keyboard.press('Enter');
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
 const undefinedChoice=page.getByLabel('Não definir gênero',{exact:true});await undefinedChoice.focus();await page.keyboard.press('Space');
 await expect(undefinedChoice).toBeChecked();await page.locator('#herald-name').fill('Sem definição');
 await page.getByRole('button',{name:'Continuar com esta identidade'}).click();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')).gender)).toBe('nao-definir');
});
for(const viewport of [{width:390,height:844},{width:844,height:390}]){
 test(`toque ${viewport.width}x${viewport.height}: alvo, escolhas e seta dentro da tela`,async({browser})=>{
  const context=await browser.newContext({viewport,hasTouch:true,isMobile:true});const page=await context.newPage();
  try{
   await page.goto(`${origin}/?${params}`);await expect(page.locator('html')).toHaveAttribute('data-scene-ready','1');
   await page.getByRole('button',{name:'Criar meu primeiro arauto'}).tap();await expect(page).toHaveURL(/criacao\.html/,{timeout:14000});
   await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).tap();await page.getByRole('button',{name:'Tornar Marcado',exact:true}).tap();
   await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
   await page.getByRole('button',{name:'Escolher menina',exact:true}).tap();await page.locator('#herald-name').fill('Luna');
   for(const sel of ['#herald-name','#undefinedGender','.creation-next','[data-gender="menina"]','[data-gender="menino"]']){
    const r=await page.locator(sel).boundingBox();expect(r).not.toBeNull();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(viewport.width+1);expect(r.y+r.height).toBeLessThanOrEqual(viewport.height+1);
    if(sel==='.creation-next')expect(viewport.height-r.y-r.height).toBeLessThan(65);
   }
   await page.getByRole('button',{name:'Continuar com esta identidade'}).tap();
   expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')).name)).toBe('Luna');
  }finally{await context.close()}
 });
}
