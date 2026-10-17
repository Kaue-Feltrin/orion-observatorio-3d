import assert from 'node:assert/strict';
import {createEtherealHandsOverlay} from '../first-person-hands-overlay.js';
let requests=0;
function element(tag){
  return{tag,className:'',style:{},dataset:{},children:[],attributes:{},
    appendChild(x){this.children.push(x);return x},
    setAttribute(k,v){this.attributes[k]=v},
    remove(){this.removed=true},
    classList:{values:new Set(),add(v){this.values.add(v)},contains(v){return this.values.has(v)}}};
}
globalThis.document={createElement:element};
globalThis.Image=class{
  set src(v){requests++;queueMicrotask(()=>this.onload?.())}
  get complete(){return false}
};
const scene=element('main');
const obj=createEtherealHandsOverlay(scene,{enabled:true});
assert.equal(await obj.ready,true);
assert.equal(obj.state.loaded,true);
assert.equal(obj.state.mode,'overlay');
assert.equal(obj.state.drawSurfaces,0);
assert.equal(obj.layer.children.length,2);
obj.update(3,1/60,.7,.4);
assert.notEqual(obj.layer.children[0].style.transform,obj.layer.children[1].style.transform);
obj.beginTravel();
assert.equal(obj.state.visible,false);
assert.equal(obj.layer.classList.contains('is-leaving'),true);
obj.dispose();
assert.equal(obj.layer.removed,true);
const reduced=createEtherealHandsOverlay(element('main'),{enabled:true,reducedMotion:true});
await reduced.ready;reduced.update(5,1/60,.5,.7);
assert.ok(reduced.layer.children.every(x=>x.style.transform.includes('translate3d(0.00px,0.00px,0) rotate(0.000deg)')));
reduced.dispose();
const before=requests;
const off=createEtherealHandsOverlay(element('main'),{enabled:false});
assert.equal(await off.ready,false);
assert.equal(requests,before);
console.log('OK: independent 2.5D sway, travel, reduced motion, off never downloads asset');
