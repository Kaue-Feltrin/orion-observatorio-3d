import {test,expect} from '@playwright/test';
import sharp from 'sharp';
async function openPaper(page){
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&quality=eco&hands=off');
 await expect(page.locator('html')).toHaveAttribute('data-presentation-ready','1');
 await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();
 await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();
 await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
 await page.getByLabel('Não definir gênero',{exact:true}).check();
 await page.locator('#herald-name').fill('Astra');
 await page.getByRole('button',{name:'Continuar com esta identidade'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-paper-ready','1');
}
for(const viewport of [{width:1855,height:711},{width:390,height:844},{width:568,height:320}]){
 test(`madeira cobre o fundo depois de rolar a ficha ${viewport.width}x${viewport.height}`,async({browser})=>{
  const c=await browser.newContext({viewport});const page=await c.newPage();try{
   await openPaper(page);
   await page.locator('[data-interest="cuidar"]').click();
   await page.locator('.paper-workshop').evaluate(stage=>{const scroll=stage.querySelector('.paper-scroll')??stage;scroll.scrollTop=scroll.scrollHeight;});
   const rect=await page.locator('.workshop-planks').boundingBox();
   expect(rect.y).toBeGreaterThanOrEqual(-1);expect(rect.y+rect.height).toBeGreaterThanOrEqual(viewport.height-1);
   const pixel=await sharp(await page.screenshot({clip:{x:1,y:viewport.height-5,width:4,height:4}})).removeAlpha().stats();
   expect(pixel.channels[0].mean).toBeGreaterThan(20);
   expect(pixel.channels[0].mean).toBeGreaterThan(pixel.channels[2].mean);
  }finally{await c.close()}
 });
}
test('ícones acompanham lista, detalhes e comparação sem substituir o nome',async({page})=>{
 await openPaper(page);await expect(page.locator('#originResults .origin-icon')).toHaveCount(66);
 const academic=page.locator('[data-origin="ACADEMICO"]');await expect(academic).toContainText('Acadêmico');await academic.click();
 await expect(page.locator('.origin-portrait [data-origin-icon="ACADEMICO"]')).toBeVisible();
 await page.getByRole('button',{name:'+ Comparar esta origem',exact:true}).click();
 await page.locator('[data-origin="AGENTE_SAUDE"]').click();await expect(page.locator('.origin-portrait [data-origin-icon="AGENTE_SAUDE"]')).toBeVisible();
 await page.getByRole('button',{name:'+ Comparar esta origem',exact:true}).click();await page.getByRole('button',{name:'Comparar origens (2/2)',exact:true}).click();
 await expect(page.getByRole('dialog').locator('.origin-icon')).toHaveCount(2);
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')).origin)).toBeUndefined();
});
