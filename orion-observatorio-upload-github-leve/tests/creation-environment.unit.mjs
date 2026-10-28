import assert from 'node:assert/strict';
import {bloodBeat,ATMOSPHERE_LAYERS} from '../creation-environment.js';
assert.equal(ATMOSPHERE_LAYERS.length,4);assert.equal(new Set(ATMOSPHERE_LAYERS.map(l=>l.file)).size,4);
for(let t=0;t<30;t+=.01)for(const p of [0,1]){const v=bloodBeat(t,p);assert.ok(v>=.72&&v<=1.000001);assert.ok(Math.abs(v-bloodBeat(t+.001,p))<.002);assert.ok(Math.abs(v-bloodBeat(t+4.8,p))<1e-10);}
assert.notEqual(bloodBeat(1,0),bloodBeat(1,1));console.log('OK: four distinct atmosphere assets; bounded, periodic, continuous and phase-separated blood pulse.');
