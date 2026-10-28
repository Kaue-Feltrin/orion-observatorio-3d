import assert from 'node:assert/strict';
import {CLASS_CHOICES,classByCode,wrapClassIndex,orbitalPose,nextClassDraft} from '../class-catalog.js';
assert.deepEqual(CLASS_CHOICES.map(c=>c.code),['COMBATENTE','ESPECIALISTA','OCULTISTA']);
assert.equal(wrapClassIndex(-1),2);assert.equal(wrapClassIndex(3),0);
for(let index=-30;index<30;index++)assert.ok(wrapClassIndex(index)>=0&&wrapClassIndex(index)<3);
for(const radius of[96,190,210])for(let rotation=-720;rotation<=720;rotation+=15)for(let i=0;i<3;i++){
 const p=orbitalPose(i,rotation,radius),again=orbitalPose(i,rotation+360,radius);
 assert.ok(Math.abs(p.x)<=radius+1e-9);assert.ok(p.scale>=.62-1e-9&&p.scale<=1+1e-9);
 assert.ok(Math.abs(p.x-again.x)<1e-9);assert.ok(Math.abs(p.scale-again.scale)<1e-9);
}
for(let i=0;i<3;i++){const p=orbitalPose(i,i*120,190);assert.ok(Math.abs(p.x)<1e-9);assert.equal(p.scale,1);assert.equal(p.z,100);}
for(const c of CLASS_CHOICES){assert.equal(c.strengths.length,2);assert.equal(c.limits.length,2);assert.ok(c.example.length<120);assert.ok(Object.isFrozen(c.base));}
const draft={version:1,name:'Astra',gender:'nao-definir',origin:{code:'ACADEMICO',label:'Acadêmico',source:'Livro Base'},step:'origin'},before=JSON.stringify(draft);
const chosen=nextClassDraft(draft,'OCULTISTA');assert.equal(chosen.classCode,'OCULTISTA');assert.equal(chosen.step,'class');assert.deepEqual(chosen.origin,draft.origin);assert.equal(JSON.stringify(draft),before);
assert.equal('pv'in chosen,false);assert.equal('abilities'in chosen,false);assert.equal('skills'in chosen,false);assert.equal(classByCode('SURVIVOR'),null);assert.equal(nextClassDraft(draft,'SURVIVOR'),null);assert.equal(nextClassDraft({...draft,origin:null},'COMBATENTE'),null);
console.log('OK: circular wrap, bounded periodic geometry, front focus, three supported classes and immutable local class choice without rule grants.');
