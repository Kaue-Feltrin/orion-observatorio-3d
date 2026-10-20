import {test,expect} from '@playwright/test';
for(const index of [0,1,2])test(`destino ${index+1}: céu panorâmico e nuvens atravessadas em profundidade`,async({page})=>{
 test.setTimeout(45000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4173/?stars=3&quality=eco-plus&hands=mesh&handsMotion=perspective&debug=1');
 await expect.poll(()=>page.evaluate(()=>window.__orionHandsDebug?.state.loaded),{timeout:24000}).toBe(true);
 await page.evaluate(()=>{
  document.querySelector('#debug').hidden=true;
  const samples=[];let seen=false;
  function sample(){
   const d=window.__orionStarDebug,{camera,layers}=window.__orionDepthDebug;
   if(d.journey.active){
    seen=true;
    samples.push({p:d.journey.progress,zoom:d.sky.state.zoom,pan:d.sky.uniforms.uSkyPan.value.toArray(),clouds:layers.filter(l=>l.visible&&l.userData.volumeFragment).map(l=>{
     const center=l.position.clone().project(camera),local=l.position.clone().applyMatrix4(camera.matrixWorldInverse);
     return {id:l.uuid,depth:-local.z,size:l.scale.x/Math.max(.01,-local.z),center:[center.x,center.y],alpha:l.material.opacity,
      facing:Math.abs(l.quaternion.dot(camera.quaternion)),position:l.position.toArray(),scale:l.scale.toArray()};
    })});
   }else if(seen){sessionStorage.setItem('orion-cloud-depth-test',JSON.stringify(samples));return;}
   requestAnimationFrame(sample);
  }requestAnimationFrame(sample);
 });
 await page.locator('.herald-target').nth(index).click({force:true});
 await expect(page).toHaveURL(/ficha\.html/,{timeout:15000});
 const samples=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('orion-cloud-depth-test')));
 const initial=samples[0].clouds,flight=samples.filter(s=>s.p>.35&&s.p<.85);
 expect(flight.length).toBeGreaterThan(0);
 // Crescimento na tela com centro/escala fixos no mundo: profundidade real.
 const visiblePasses=flight.flatMap(s=>s.clouds.filter(c=>{
  const before=initial.find(b=>b.id===c.id);
  return c.depth>6&&c.size>before.size*1.7&&c.alpha>.02&&Math.abs(c.center[0])<1.5&&Math.abs(c.center[1])<1.5;
 }));
 expect(visiblePasses.length).toBeGreaterThan(0);
 for(const s of flight)for(const c of s.clouds){
  const before=initial.find(b=>b.id===c.id);
  expect(c.position).toEqual(before.position);expect(c.scale).toEqual(before.scale);
  expect(c.facing).toBeGreaterThan(.999999);
 }
 const final=samples.at(-1);
 expect(samples[0].zoom).toBeCloseTo(1,5);
 expect(final.zoom).toBeGreaterThan(1.21);
 for(let i=1;i<samples.length;i++){
  expect(samples[i].zoom).toBeGreaterThanOrEqual(samples[i-1].zoom);
  expect(samples[i].zoom).toBeLessThanOrEqual(1.22);
  if(samples[i].p<700/2550)expect(samples[i].zoom).toBe(1);
 }
 expect(final.clouds.some(c=>c.depth<0&&c.alpha===0)).toBe(true);
 if(index>0)expect(final.pan.some(v=>Math.abs(v)>.01)).toBe(true);
 expect(errors).toEqual([]);
 console.log('JOURNEY_DEPTH',JSON.stringify({index,visiblePasses:visiblePasses.length,maxGrowth:Math.max(...visiblePasses.map(c=>c.size/initial.find(b=>b.id===c.id).size)),finalPan:final.pan,finalZoom:final.zoom}));
});
