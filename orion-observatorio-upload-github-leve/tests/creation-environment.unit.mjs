import assert from 'node:assert/strict';
import {bloodBeat,ATMOSPHERE_LAYERS,redSaturation,RED_BRIGHTNESS} from '../creation-environment.js';
assert.equal(ATMOSPHERE_LAYERS.length,4);assert.equal(new Set(ATMOSPHERE_LAYERS.map(l=>l.file)).size,4);
for(let t=0;t<30;t+=.01){const v=bloodBeat(t);assert.ok(v>=0&&v<=1);assert.ok(Math.abs(v-bloodBeat(t+.001))<.001);assert.ok(Math.abs(v-bloodBeat(t+4.8))<1e-10);}
assert.equal(bloodBeat(0),0);assert.equal(bloodBeat(2.4),1);assert.equal(bloodBeat(4.8),0);
console.log('OK: normalized motion cycle 0/1/0, smooth and periodic over 4.8s.');

assert.equal(redSaturation(0),.3);assert.equal(redSaturation(1),1);assert.equal(RED_BRIGHTNESS,.75);for(let t=0;t<10;t+=.01){const sat=redSaturation(bloodBeat(t));assert.ok(sat>=.3&&sat<=1);}
console.log('OK: red saturation stays at 30–100%; output brightness 75%.');
