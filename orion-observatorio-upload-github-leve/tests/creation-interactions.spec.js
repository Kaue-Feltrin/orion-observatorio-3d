import {test,expect} from '@playwright/test';
for(const mobile of [false,true])for(const identity of [false,true]){
 test(`voltar por ${mobile?'toque':'clique'} na etapa ${identity?'identidade':'feto'}`,async({browser})=>{
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile});const page=await context.newPage();
 try{await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&quality=eco&debug=1');await expect(page.locator('#observatory')).toHaveAttribute('data-creation-art','ready');await page.evaluate(()=>document.getElementById('debug').hidden=true);
 if(identity){await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');}
 const back=page.getByRole('link',{name:'Voltar ao observatório'});expect(await back.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})).toBe(true);
 if(mobile)await back.tap();else await back.click();await expect(page).toHaveURL(/index\.html\?.*stars=0/);await expect(page.getByRole('button',{name:'Criar meu primeiro arauto'})).toBeVisible();
 }finally{await context.close()}
 });
}
test('convites visíveis, destaque ao apontar e confirmação da escolha',async({page})=>{
 await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&quality=balanced&debug=1');await expect(page.locator('#observatory')).toHaveAttribute('data-creation-art','ready');await page.evaluate(()=>document.getElementById('debug').hidden=true);
 await expect(page.locator('.interaction-cue')).toBeVisible();const baby=page.getByRole('button',{name:'Contemplar a silhueta etérea'});await baby.hover();await expect.poll(()=>page.evaluate(()=>window.__orionCreationDebug.meshes.baby.material.uniforms.uHover.value)).toBeGreaterThan(.8);
 await baby.click();await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
 const girl=page.getByRole('button',{name:'Escolher menina',exact:true});await expect(girl.locator('small')).toHaveText('Selecionar');await girl.hover();await expect.poll(()=>page.evaluate(()=>window.__orionCreationDebug.meshes.menina.material.uniforms.uHover.value)).toBeGreaterThan(.8);await girl.click();await expect(girl.locator('small')).toHaveText('✓ Selecionado');
 const layers=await page.evaluate(()=>window.__orionCreationEnvironment.layers.map(l=>({kind:l.material.uniforms.layer.value,offset:l.userData.parallaxOffsetX})));expect(layers.map(l=>l.kind)).toEqual([1,2,3]);expect(layers.every(l=>Math.abs(l.offset)<1.7)).toBe(true);
});
test('retrato compacto separa os botões de seleção do campo de nome',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&quality=eco');
 await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
 const label=await page.locator('.name-label').boundingBox();for(const option of await page.locator('.child-choice>span').all()){const r=await option.boundingBox();expect(r.y+r.height).toBeLessThan(label.y-3);}
 await page.getByRole('button',{name:'Escolher menina',exact:true}).click();await page.locator('#herald-name').fill('Astra');await expect(page.getByRole('button',{name:'Continuar com esta identidade'})).toBeEnabled();
});
