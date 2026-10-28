import {test,expect} from '@playwright/test';
for(const viewport of [{width:1440,height:900},{width:390,height:430},{width:568,height:320},{width:320,height:568},{width:320,height:256}]){
 test(`formulário ${viewport.width}x${viewport.height}: controles separados e toque correto após reflow`,async({browser})=>{
 const context=await browser.newContext({viewport,hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();try{
 await page.goto('http://127.0.0.1:4173/criacao.html?stars=0&quality=eco&debug=1');await expect(page.locator('html')).toHaveAttribute('data-presentation-ready','1');await page.evaluate(()=>document.getElementById('debug').hidden=true);
 await page.getByRole('button',{name:'Contemplar a silhueta etérea'}).click();await page.getByRole('button',{name:'Tornar Marcado',exact:true}).click();await expect(page.locator('#observatory')).toHaveAttribute('data-creation-phase','identity');
 await expect(page.getByRole('heading',{name:'O início de uma história.'})).toBeVisible();
 await page.getByRole('button',{name:'Escolher menino',exact:true}).click();await page.locator('#herald-name').fill('Aurora');
 const rects=await page.evaluate(()=>['.child-choice[data-gender="menina"]>span','.child-choice[data-gender="menino"]>span','.name-label','#herald-name','.undefined-choice','.creation-next'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return{s,x:r.x,y:r.y,w:r.width,h:r.height}}));
 for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j],w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);expect(w>0&&h>0,JSON.stringify({a,b,w,h})).toBe(false);}
 await page.locator('#herald-name').scrollIntoViewIfNeeded();const input=await page.locator('#herald-name').boundingBox();await page.mouse.click(input.x+input.width-2,input.y+input.height/2);await expect(page.locator('#herald-name')).toBeFocused();expect(await page.evaluate(()=>sessionStorage.getItem('orion-herald-creation-v1'))).toBeNull();
 const girl=page.locator('[data-gender="menina"]>span');await girl.scrollIntoViewIfNeeded();const g=await girl.boundingBox();await page.mouse.click(g.x+g.width-3,g.y+g.height-3);await expect(page.locator('[data-gender="menina"]')).toHaveAttribute('aria-pressed','true');
 const next=page.getByRole('button',{name:'Continuar com esta identidade'});await next.scrollIntoViewIfNeeded();await next.tap();expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-herald-creation-v1')).gender)).toBe('menina');
 expect(await page.locator('#observatory').evaluate(e=>[e.scrollLeft,e.scrollTop])).toEqual([0,0]);
 }finally{await context.close()}
 });
}
