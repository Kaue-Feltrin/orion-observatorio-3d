import assert from 'node:assert/strict';
import {ORIGINS} from '../origin-catalog.js';
import {ORIGIN_BACKGROUNDS,backgroundFor} from '../origin-backgrounds.js';
import {findOrigins} from '../origin-discovery.js';
assert.deepEqual(Object.keys(ORIGIN_BACKGROUNDS).sort(),ORIGINS.map(o=>o.code).sort());
assert.equal(new Set(Object.values(ORIGIN_BACKGROUNDS)).size,66);
for(const o of ORIGINS){const value=backgroundFor(o);assert.ok(value.length>=35&&value.length<=145,`${o.code}: ${value.length}`);assert.ok(value.startsWith('Você '));assert.doesNotMatch(value,/<|>|\b[+]\d/);}
assert.ok(findOrigins({query:'plantão noturno'}).some(o=>o.code==='AGENTE_SAUDE'));
assert.ok(findOrigins({query:'pintava murais'}).some(o=>o.code==='ARTISTA'));
assert.equal(backgroundFor({code:'unknown'}),'');
console.log('OK: one short fictional background per catalog origin; searchable examples, no grants or prerequisite changes.');
