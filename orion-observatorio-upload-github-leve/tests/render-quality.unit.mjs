import assert from'node:assert/strict';import{boundedPixelRatio,createFrameMonitor}from'../render-quality.js';
for(const [width,height,native]of[[1440,900,1],[3840,2160,2],[390,844,3],[320,568,1]]){
 let previous=Infinity;
 for(const profile of[{dpr:1,maxPixels:2200000},{dpr:.75,maxPixels:950000},{dpr:.6,maxPixels:670000},{dpr:.53,maxPixels:500000}]){
  const ratio=boundedPixelRatio(profile,native,width,height),pixels=Math.floor(width*ratio)*Math.floor(height*ratio);assert.ok(pixels<=profile.maxPixels);assert.ok(pixels<previous);previous=pixels;
 }
}
function window(monitor,now,ms){let reduced=false;for(let i=0;i<240;i++){now+=ms;if(monitor.record(now,ms)){reduced=true;break;}}return{now,reduced};}
const fast=createFrameMonitor();for(let i=0;i<600;i++)assert.equal(fast.record(i*16.67,16.67),false);
const severe=createFrameMonitor();assert.equal(window(severe,0,50).reduced,true);
const borderline=createFrameMonitor(),first=window(borderline,0,28);assert.equal(first.reduced,true);assert.ok(first.now>=4800,'a moderate slowdown needs two observation windows');
const resumed=createFrameMonitor();resumed.record(0,50);assert.equal(resumed.record(5000,5000),false);for(let i=0;i<60;i++)assert.equal(resumed.record(5000+i*16.67,16.67),false);
const interrupted=createFrameMonitor();for(let i=0;i<50;i++)interrupted.record(i*30,30);interrupted.reset(1500);for(let i=0;i<120;i++)assert.equal(interrupted.record(1500+i*16.67,16.67),false);
console.log('OK: every fallback reduces actual pixels, slow windows adapt, fast frames and background gaps do not force degradation.');
// Changing a profile must not label the last profile's FPS as a new sample.
const fresh=createFrameMonitor({interval:100,minSamples:2});
fresh.record(0,100);fresh.record(100,100);
assert.equal(fresh.state.averageMs,100);assert.equal(fresh.state.samples,2);
fresh.reset(101);
assert.equal(fresh.state.averageMs,null,'reset must clear FPS from the previous profile');
assert.equal(fresh.state.samples,0,'reset must clear the previous sample count');
assert.equal(fresh.state.updatedAt,null);assert.equal(fresh.state.windowMs,0);
fresh.record(151,50);assert.equal(fresh.state.averageMs,null);
fresh.record(201,50);assert.equal(fresh.state.averageMs,50);assert.equal(fresh.state.updatedAt,201);assert.equal(fresh.state.windowMs,100);
fresh.record(8000,5000);assert.equal(fresh.state.averageMs,null,'background gaps invalidate the published sample');
console.log('OK: a reset or invalid frame hides the previous measurement until a complete new window.');
