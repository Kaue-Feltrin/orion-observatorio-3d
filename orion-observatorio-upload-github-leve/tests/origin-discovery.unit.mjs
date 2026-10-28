import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ORIGINS,SKILLS,CATALOG_PROVENANCE} from '../origin-catalog.js';
import {findOrigins,interestsFor,storyFor} from '../origin-discovery.js';

const before=JSON.stringify(ORIGINS);
assert.equal(ORIGINS.length,66);
assert.equal(SKILLS.length,28);
assert.equal(new Set(ORIGINS.map(o=>o.code)).size,66);
assert.equal(CATALOG_PROVENANCE.canonical,false);
assert.equal(CATALOG_PROVENANCE.completeManualCoverageVerified,false);
assert.equal(findOrigins({source:'Arquivos Secretos #7'}).length,2);
assert.ok(findOrigins({query:'medico'}).some(o=>o.code==='AGENTE_SAUDE'));
assert.ok(findOrigins({query:'MÉDICA'}).some(o=>o.code==='AGENTE_SAUDE'));
assert.ok(findOrigins({query:'computador'}).some(o=>o.code==='TI'));
assert.ok(findOrigins({query:'t.i.'}).some(o=>o.code==='TI'));
assert.equal(findOrigins({query:'zzzz-não-existe'}).length,0);
assert.equal(findOrigins({query:'médico',source:'Arquivos Secretos #7'}).length,0);
for(const o of findOrigins({interest:'investigar',skill:'INVESTIGACAO',source:'Livro Base'})){
 assert.ok(o.fixedSkills.includes('INVESTIGACAO'));assert.equal(o.source,'Livro Base');
}
for(const o of ORIGINS){assert.ok(storyFor(o).length>20);assert.ok(interestsFor(o).length>0);}
assert.equal(JSON.stringify(ORIGINS),before);
assert.doesNotMatch(await readFile(new URL('../origin-workshop.js',import.meta.url),'utf8'),/fetch\s*\(|XMLHttpRequest|\/api\//);
console.log('OK: 66 reference origins, four sources, accent/alias search, conjunctive filters, immutable metadata, no remote rule grant.');
