import assert from 'node:assert/strict';
import {SIGIL_PHRASE,SIGIL_ORBITS,sigilSlots,createSigilGeometry} from '../creation-sigils.js';
assert.equal(SIGIL_PHRASE,'Acorrentado pela realidade');
const slots=sigilSlots();assert.equal(slots.length,240);
for(const ring of SIGIL_ORBITS.keys()){
 const list=slots.filter(s=>s.ring===ring),letters=Array(list[0].slots).fill(' ');
 for(const s of list)letters[s.slot]=s.char;
 assert.deepEqual(letters.join('').trim().split(/ {3}/),[SIGIL_PHRASE,SIGIL_PHRASE]);
}
const {geometry,chars}=createSigilGeometry(slots);assert.equal(geometry.instanceCount,slots.length);
for(const name of ['aAngle','aRing','aCell','aSeed'])assert.equal(geometry.getAttribute(name).count,slots.length);
for(const v of geometry.getAttribute('aAngle').array)assert.ok(Number.isFinite(v)&&v>=0&&v<Math.PI*2);
for(const v of geometry.getAttribute('aCell').array)assert.ok(Number.isInteger(v)&&v>=0&&v<chars.length);
assert.ok(chars.every(c=>SIGIL_PHRASE.includes(c)&&c!==' '));assert.ok(chars.length<=32);geometry.dispose();
console.log('OK: exact phrase reconstructed per orbit, repeated words/spaces, valid atlas indexes and instanced glyph geometry.');
