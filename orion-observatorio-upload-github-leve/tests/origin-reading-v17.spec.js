import {test,expect} from '@playwright/test';
async function paper(page){
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&quality=eco&hands=off');
 await expect(page.locator('html')).toHaveAttribute('data-presentation-ready','1');await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');await page.getByLabel('Não definir gênero',{exact:true}).check();await page.locator('#herald-name').fill('Astra');await page.getByRole('button',{name:'Continuar com esta identidade'}).click();await expect(page.locator('html')).toHaveAttribute('data-paper-ready','1');
}
test('guia aplica interesse com confirmação visível, limpa restrições anteriores e permite trocar',async({page})=>{
 await paper(page);await page.locator('.advanced-origins summary').click();await page.locator('#originSource').selectOption('Arquivos Secretos #7');await page.locator('#originSearch').fill('médico');
 await page.getByRole('button',{name:'Me ajude a escolher'}).click();await page.getByRole('button',{name:'Quero descobrir o que está escondido.'}).click();
 await expect(page.getByRole('region',{name:'Filtros aplicados'})).toBeVisible();await expect(page.locator('.filter-applied-label')).toHaveText('Investigar');await expect(page.locator('.filter-result-count')).toContainText('origens para explorar');
 await expect(page.locator('#originCount')).toBeFocused();await expect(page.locator('.origin-guide')).toBeHidden();await expect(page.locator('#originSearch')).toHaveValue('');await expect(page.locator('#originSource')).toHaveValue('');await expect(page.locator('[data-origin="ACADEMICO"]')).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')).origin)).toBeUndefined();
 await page.locator('[data-origin="ACADEMICO"]').click();await expect(page.locator('#originDetailTitle')).toHaveText('Acadêmico');
 await page.getByRole('button',{name:'Trocar interesse'}).click();await expect(page.locator('[data-guide="investigar"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-guide="investigar"]')).toBeFocused();await expect(page.locator('.origin-tools')).toBeHidden();await expect(page.locator('.origin-library')).toBeHidden();
 await page.getByRole('button',{name:'Quero cuidar de pessoas ou animais.'}).click();await expect(page.locator('.filter-applied-label')).toHaveText('Cuidar');await expect(page.locator('[data-origin="AGENTE_SAUDE"]')).toBeVisible();await expect(page.locator('[data-origin="ACADEMICO"]')).toHaveCount(0);await expect(page.locator('#originDetailTitle')).toHaveText('Seu passado começa aqui.');
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();await expect(page.locator('#originFilters')).toBeHidden();await expect(page.locator('#originCount')).toHaveText('66 origens');
});
for(const viewport of[{width:1440,height:1000},{width:390,height:844}]){
 test(`leitura ${viewport.width}: exemplo curto e detalhes opcionais sem ocultar escolhas obrigatórias`,async({browser})=>{
  const c=await browser.newContext({viewport,hasTouch:viewport.width<500,isMobile:viewport.width<500});const page=await c.newPage();try{
   await paper(page);await expect(page.locator('#originResults small')).toHaveCount(0);await page.locator('[data-origin="AGENTE_SAUDE"]').click();
   await expect(page.getByRole('region',{name:'Exemplo de passado'})).toBeVisible();await expect(page.locator('.origin-example p')).toHaveText('Você cuidava de pacientes no plantão noturno de um hospital.');
   await expect(page.locator('.origin-story')).toBeHidden();await expect(page.locator('.origin-skill-chips li')).toHaveCount(2);await page.locator('.origin-more summary').click();await expect(page.locator('.origin-book')).toHaveText('Livro Base');
   await page.locator('#originSearch').fill('chef');await page.locator('[data-origin="CHEF"]').click();await expect(page.locator('.origin-choice-note')).toBeVisible();await expect(page.locator('.origin-choice-note')).toContainText('Profissão');
   expect(await page.locator('.paper-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')).origin)).toBeUndefined();
  }finally{await c.close()}
 });
}
