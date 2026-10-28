import {test,expect} from '@playwright/test';
test('o carregamento cobre a cena parcial até fundo e mãos estarem prontos',async({page})=>{
 let release;const held=new Promise(r=>release=r);await page.route('**/nebula-eso-photographic.jpg',async route=>{await held;await route.continue()});
 await page.goto('http://127.0.0.1:4173/?stars=0&quality=eco&debug=1');
 await expect(page.locator('#sceneLoading')).toBeVisible();await expect(page.locator('html')).not.toHaveAttribute('data-presentation-ready','1');
 expect(await page.locator('#sceneLoading').evaluate(e=>{const p=document.elementFromPoint(innerWidth/2,innerHeight/2);return e.contains(p)})).toBe(true);
 await page.screenshot({path:'/workspace/orion-v9-evidence/loading.png'});release();
 await expect(page.locator('html')).toHaveAttribute('data-presentation-ready','1');await expect(page.locator('#sceneLoading')).toBeHidden();expect(await page.evaluate(()=>window.__orionHandsDebug.state.loaded)).toBe(true);
 await page.getByRole('button',{name:'Criar meu primeiro arauto'}).click();await expect(page).toHaveURL(/criacao.html/);
});
test('só as camadas vermelhas pulsam e o movimento para na identidade',async({page})=>{
 await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&debug=1&quality=eco');await expect(page.locator('html')).toHaveAttribute('data-presentation-ready','1');await page.evaluate(()=>document.getElementById('debug').hidden=true);
 const beat=()=>page.evaluate(()=>window.__orionCreationEnvironment.layers.map(l=>l.material.uniforms.beat.value));const first=await beat();expect(first.slice(0,2)).toEqual([1,1]);await expect.poll(async()=>Math.abs((await beat())[2]-first[2])).toBeGreaterThan(.015);
 await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');await expect.poll(beat).toEqual([1,1,.82,.82]);
});
test('movimento reduzido mantém as duas massas vermelhas estáticas',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&debug=1&quality=eco');await expect(page.locator('html')).toHaveAttribute('data-presentation-ready','1');expect(await page.evaluate(()=>window.__orionCreationEnvironment.layers.map(l=>l.material.uniforms.beat.value))).toEqual([1,1,.82,.82]);
});
