import {test,expect} from '@playwright/test';
import sharp from 'sharp';
const base='http://127.0.0.1:4173/';
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function difference(a,b){
 const left=await sharp(a).removeAlpha().raw().toBuffer(),right=await sharp(b).removeAlpha().raw().toBuffer();
 expect(left.length).toBe(right.length);let sum=0,changed=0;
 for(let i=0;i<left.length;i++){const delta=Math.abs(left[i]-right[i]);sum+=delta;if(delta>2)changed++;}
 return {mean:sum/left.length,changed:changed/left.length};
}
test('shader preserva formato no giro e aplica aproximação uniforme controlada',async({page})=>{
 test.setTimeout(50000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram|GL_INVALID/i.test(m.text()))errors.push(m.text());});
 await page.goto(base+'?debug=1&stars=3&quality=eco&hands=off');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.sceneReady),{timeout:24000}).toBe('1');
 await page.evaluate(()=>{
  const d=window.__orionStarDebug,c=window.__orionDepthDebug.camera,real=d.journey.update;
  let frozen=null,initial=null;
  window.__skyPose=0;window.__skyLockPan=true;window.__skyApproach=0;
  d.journey.update=(now,delta)=>{
   if(frozen===null)frozen=now;
   real(frozen,0);
   if(!d.journey.active)return;
   if(!initial)initial={p:c.position.clone(),q:c.quaternion.clone(),fov:c.fov};
   if(window.__skyPose){c.position.set(180,-55,-240);c.rotation.set(.24,-.52,.01);c.fov=56;c.updateProjectionMatrix();}
   else{c.position.copy(initial.p);c.quaternion.copy(initial.q);c.fov=initial.fov;c.updateProjectionMatrix();}
   d.sky.update(window.__skyApproach);if(window.__skyLockPan)d.sky.uniforms.uSkyPan.value.set(0,0);
   for(const object of c.parent.children)if(object!==c)object.visible=false;
   for(const object of c.children)if(object!==d.sky.photo)object.visible=false;
  };
 });
 await page.locator('#heraldTarget-preview-3').click({force:true});
 await expect.poll(()=>page.evaluate(()=>window.__orionStarDebug.sky.state.active)).toBe(true);
 await page.addStyleTag({content:'#observatory > :not(#world){visibility:hidden!important} #observatory::before,#observatory::after{display:none!important}'});
 await frames(page);const before=await page.locator('#world canvas').screenshot();
 await page.evaluate(()=>{window.__skyPose=1;});await frames(page);
 const turned=await page.locator('#world canvas').screenshot(),same=await difference(before,turned);
 expect(same.mean).toBeLessThan(.3);expect(same.changed).toBeLessThan(.005);
 await page.evaluate(()=>{window.__skyLockPan=false;});await frames(page);
 const panned=await page.locator('#world canvas').screenshot(),motion=await difference(turned,panned);
 expect(motion.mean).toBeGreaterThan(2);expect(motion.changed).toBeGreaterThan(.1);
 await page.evaluate(()=>{window.__skyApproach=1;});await frames(page);
 const zoomed=await page.locator('#world canvas').screenshot();
 const {width,height}=await sharp(panned).metadata();
 const cropWidth=Math.round(width/1.22),cropHeight=Math.round(height/1.22);
 const expected=await sharp(panned).extract({left:Math.round((width-cropWidth)/2),top:Math.round((height-cropHeight)/2),width:cropWidth,height:cropHeight}).resize(width,height).png().toBuffer();
 const zoomDifference=await difference(panned,zoomed),uniformDifference=await difference(expected,zoomed);
 console.log('SKY_ZOOM_COMPARISON',JSON.stringify({zoomDifference,uniformDifference}));
 expect(zoomDifference.mean).toBeGreaterThan(2);
 expect(uniformDifference.mean).toBeLessThan(4);
 expect(uniformDifference.mean).toBeLessThan(zoomDifference.mean*.5);
 expect(errors).toEqual([]);
 console.log('SKY_PIXEL_COMPARISON',JSON.stringify({lockedPan:same,angularPan:motion}));
 await test.info().attach('sky-initial',{body:before,contentType:'image/png'});
 await test.info().attach('sky-turned-locked-pan',{body:turned,contentType:'image/png'});
 await test.info().attach('sky-angular-pan',{body:panned,contentType:'image/png'});
 await test.info().attach('sky-approach-22-percent',{body:zoomed,contentType:'image/png'});
});
