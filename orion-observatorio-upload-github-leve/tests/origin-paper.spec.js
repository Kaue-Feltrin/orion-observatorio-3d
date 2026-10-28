import {test,expect} from '@playwright/test';
const base='http://127.0.0.1:4173';
async function paper(page,{reduce=true,name='Astra'}={}){
 if(reduce)await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'/criacao.html?stars=0&quality=eco&hands=off');
 await expect(page.locator('html')).toHaveAttribute('data-presentation-ready','1');
 await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();
 await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
 await page.getByLabel('Não definir gênero',{exact:true}).check();
 await page.locator('#herald-name').fill(name);
 await page.getByRole('button',{name:'Continuar com esta identidade'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-paper-ready','1');
 await expect(page.getByRole('heading',{name:'Toda história deixa marcas.'})).toBeFocused();
}
test('ficha física: consulta não confirma, origem salva só após escolha e identidade é preservada',async({page})=>{
 const writes=[],errors=[];page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
 await paper(page);await expect(page.locator('#originCount')).toHaveText('66 origens');
 await page.locator('#originSearch').fill('médico');
 await page.locator('[data-origin="AGENTE_SAUDE"]').click();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')).origin)).toBeUndefined();
 await page.getByRole('button',{name:'Escolher esta origem'}).click();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')))).toMatchObject({name:'Astra',gender:'nao-definir',step:'origin',origin:{code:'AGENTE_SAUDE'}});
 await page.getByRole('button',{name:'Voltar à identidade'}).click();
 await expect(page.locator('.paper-workshop')).toHaveCount(0);await expect(page.locator('#herald-name')).toHaveValue('Astra');
 await expect(page.getByLabel('Não definir gênero',{exact:true})).toBeChecked();
 await page.getByRole('button',{name:'Continuar com esta identidade'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-paper-ready','1');await expect(page.locator('.paper-chosen-name')).toHaveText('Agente de Saúde');
 expect(writes).toEqual([]);expect(errors).toEqual([]);
});
test('busca, filtros combinados, guia e comparação preservam confirmação explícita',async({page})=>{
 await paper(page);await page.locator('.advanced-origins summary').click();
 await page.locator('#originSource').selectOption('Arquivos Secretos #7');await expect(page.locator('#originResults li')).toHaveCount(2);
 await page.locator('#originSearch').fill('médico');await expect(page.locator('.origin-empty')).toBeVisible();
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();await expect(page.locator('#originResults li')).toHaveCount(66);
 await page.getByRole('button',{name:'Me ajude a escolher'}).click();await page.getByRole('button',{name:'Quero descobrir o que está escondido.'}).click();
 await expect(page.locator('[data-interest="investigar"]')).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();
 await page.locator('[data-origin="ACADEMICO"]').click();await page.getByRole('button',{name:'+ Comparar esta origem',exact:true}).click();
 await page.locator('[data-origin="INVESTIGADOR"]').click();await page.getByRole('button',{name:'+ Comparar esta origem',exact:true}).click();
 await page.getByRole('button',{name:'Comparar origens (2/2)',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('dialog').getByRole('heading',{name:'Acadêmico',exact:true})).toBeVisible();await expect(page.getByRole('dialog').getByRole('heading',{name:'Investigador',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')).origin)).toBeUndefined();
});
test('nome é texto, movimento reduzido não executa a queda, armazenamento recusado não confirma',async({page})=>{
 await paper(page,{name:'<img src=x onerror=alert(1)>'});await expect(page.locator('.paper-name')).toHaveText('<img src=x onerror=alert(1)>');await expect(page.locator('.paper-name img')).toHaveCount(0);
 expect(await page.locator('.workshop-plank').first().evaluate(e=>e.getAnimations().length)).toBe(0);
 await page.locator('[data-origin="ACADEMICO"]').click();await page.evaluate(()=>Storage.prototype.setItem=function(){throw new Error('blocked')});
 await page.getByRole('button',{name:'Escolher esta origem'}).click();await expect(page.locator('.paper-status')).toContainText('Não foi possível guardar');await expect(page.locator('.paper-chosen-name')).toHaveText('Ainda por escrever');
});
for(const viewport of [{width:390,height:844},{width:320,height:568},{width:568,height:320}]){
 test(`papel ${viewport.width}x${viewport.height}: busca, detalhes e confirmação alcançáveis`,async({browser})=>{
  const c=await browser.newContext({viewport,hasTouch:true,isMobile:true});const page=await c.newPage();try{
   await paper(page);expect(await page.locator('.paper-workshop').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
   await page.locator('#originSearch').fill('computador');await page.locator('[data-origin="TI"]').tap();await expect(page.locator('#originDetailTitle')).toBeFocused();
   const choose=page.getByRole('button',{name:'Escolher esta origem'});await choose.scrollIntoViewIfNeeded();const r=await choose.boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(viewport.width+1);await choose.tap();
   await expect(page.locator('.paper-chosen-name')).toHaveText('T.I.');
   await page.locator('.paper-return').scrollIntoViewIfNeeded();await page.locator('.paper-return').tap();await expect(page.locator('#herald-name')).toHaveValue('Astra');
  }finally{await c.close()}
 });
}
