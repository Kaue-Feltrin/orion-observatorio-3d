import assert from 'node:assert/strict';
import {ORIGINS} from '../origin-catalog.js';
import {ORIGIN_ICON_ART,originIcon} from '../origin-icons.js';

assert.deepEqual(Object.keys(ORIGIN_ICON_ART).sort(),ORIGINS.map(o=>o.code).sort());
assert.equal(new Set(Object.values(ORIGIN_ICON_ART)).size,ORIGINS.length);
for(const o of ORIGINS){
 const svg=originIcon(o.code);
 assert.match(svg,/viewBox="0 0 48 48"/);assert.match(svg,/aria-hidden="true"/);
 assert.match(svg,/<path d="[^"]+"/);assert.doesNotMatch(svg,/<script|href=|onload=|<image/);
}
assert.throws(()=>originIcon('<script>'));
console.log('OK: all 66 catalog origins have distinct, local, decorative vector pictograms; names remain the accessible labels.');
