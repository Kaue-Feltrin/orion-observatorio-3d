import {test,expect} from '@playwright/test';
async function openClass(page,{reduce=true}={}){
 if(reduce)await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&quality=eco&hands=off');await expect(page.locator('html')).toHaveAttribute('data-presentation-ready','1');
 await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
 await page.getByLabel('Não definir gênero',{exact:true}).check();await page.locator('#herald-name').fill('Astra');await page.getByRole('button',{name:'Continuar com esta identidade'}).click();await expect(page.locator('html')).toHaveAttribute('data-paper-ready','1');
 await expect(page.locator('.origin-next')).toBeHidden();await page.locator('[data-origin="ACADEMICO"]').click();await page.getByRole('button',{name:'Escolher esta origem'}).click();await page.getByRole('button',{name:'Continuar para classe',exact:false}).click();await expect(page.locator('.paper-workshop')).toHaveAttribute('data-chapter','class');await expect(page.getByRole('heading',{name:'Escolha sua classe.'})).toBeFocused();
}
const draft=page=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')));
test('roleta explora as três classes; só confirmar grava e retorno preserva identidade/origem/classe',async({page})=>{
 const writes=[],errors=[];page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
 await openClass(page);await expect(page.locator('.class-chapter')).toHaveAttribute('data-class-art','ready');await expect(page.locator('#className')).toHaveText('Combatente');expect((await draft(page)).classCode).toBeUndefined();
 await page.getByRole('button',{name:'Classe anterior',exact:true}).click();await expect(page.locator('#className')).toHaveText('Ocultista');await expect(page.locator('.class-limits')).toContainText('Menor base de Pontos de Vida');expect((await draft(page)).classCode).toBeUndefined();
 await page.locator('.class-orbit').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#className')).toHaveText('Combatente');await page.keyboard.press('ArrowRight');await expect(page.locator('#className')).toHaveText('Especialista');await expect(page.locator('.class-example')).toContainText('técnico de manutenção');
 await page.locator('.class-comparison summary').click();await expect(page.getByRole('table')).toBeVisible();await expect(page.getByRole('table').getByRole('columnheader',{name:'Ocultista'})).toBeVisible();
 await page.getByRole('button',{name:'Escolher esta classe',exact:false}).click();expect(await draft(page)).toMatchObject({name:'Astra',gender:'nao-definir',origin:{code:'ACADEMICO'},classCode:'ESPECIALISTA',step:'class'});
 await page.getByRole('button',{name:'Voltar às origens',exact:false}).click();await expect(page.locator('.paper-chosen-name')).toHaveText('Acadêmico');await page.getByRole('button',{name:'Rever classe',exact:false}).click();await expect(page.locator('#className')).toHaveText('Especialista');
 await page.getByRole('button',{name:'Voltar às origens',exact:false}).click();await page.getByRole('button',{name:'Voltar à identidade',exact:false}).click();await expect(page.locator('#herald-name')).toHaveValue('Astra');await page.getByRole('button',{name:'Continuar com esta identidade'}).click();await expect(page.locator('html')).toHaveAttribute('data-paper-ready','1');await page.getByRole('button',{name:'Rever classe',exact:false}).click();await expect(page.locator('#className')).toHaveText('Especialista');expect(writes).toEqual([]);expect(errors).toEqual([]);
});
test('giro animado não confirma classe e sair durante o giro cancela sem erro',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await openClass(page,{reduce:false});await expect(page.locator('.class-chapter')).toHaveAttribute('data-class-art','ready');
 await page.getByRole('button',{name:'Girar roleta',exact:false}).click();await expect(page.locator('.class-chapter')).toHaveAttribute('aria-busy','true');await expect(page.locator('.confirm-class')).toBeDisabled();await expect(page.locator('.class-chapter')).toHaveAttribute('aria-busy','false');expect(['Combatente','Especialista','Ocultista']).toContain(await page.locator('#className').innerText());expect((await draft(page)).classCode).toBeUndefined();
 await page.getByRole('button',{name:'Girar roleta',exact:false}).click();await page.getByRole('button',{name:'Voltar às origens',exact:false}).click();await expect(page.locator('.paper-workshop')).toHaveAttribute('data-chapter','origin');await page.getByRole('button',{name:'Continuar para classe',exact:false}).click();await expect(page.locator('#className')).toHaveText('Combatente');expect(errors).toEqual([]);
});
for(const viewport of[{width:390,height:844},{width:320,height:568},{width:568,height:320}]){
 test(`roleta móvel ${viewport.width}x${viewport.height}: deslize, explicação e confirmação acessíveis`,async({browser})=>{
  const c=await browser.newContext({viewport,hasTouch:true,isMobile:true}),page=await c.newPage();try{
   await openClass(page);await expect(page.locator('.class-chapter')).toHaveAttribute('data-class-art','ready');expect(await page.locator('.paper-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
   const orbit=page.locator('.class-orbit');await orbit.scrollIntoViewIfNeeded();const r=await orbit.boundingBox(),client=await c.newCDPSession(page),y=r.y+r.height*.45,start=r.x+r.width*.7,end=r.x+r.width*.3;
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start,y}]});for(let i=1;i<=5;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start+(end-start)*i/5,y}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('#className')).toHaveText('Especialista');
   async function tap(locator){await locator.scrollIntoViewIfNeeded();await locator.tap();}
   await tap(page.locator('.class-next'));await expect(page.locator('#className')).toHaveText('Ocultista');await tap(page.locator('.class-previous'));await expect(page.locator('#className')).toHaveText('Especialista');
   await tap(page.locator('.confirm-class'));await expect(page.locator('.class-status')).toContainText('Especialista é a classe');expect((await draft(page)).classCode).toBe('ESPECIALISTA');await tap(page.getByRole('button',{name:'Rever origem',exact:false}));await expect(page.locator('.paper-chosen-name')).toHaveText('Acadêmico');
  }finally{await c.close()}
 });
}
test('armazenamento recusado mantém origem e não anuncia confirmação de classe',async({page})=>{
 await openClass(page);await page.evaluate(()=>Storage.prototype.setItem=function(){throw new Error('blocked')});await page.locator('.confirm-class').click();await expect(page.locator('.class-status')).toContainText('Não foi possível guardar');expect((await draft(page)).classCode).toBeUndefined();expect((await draft(page)).origin.code).toBe('ACADEMICO');
});
