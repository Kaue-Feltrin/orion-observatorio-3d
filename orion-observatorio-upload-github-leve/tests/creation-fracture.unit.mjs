import assert from 'node:assert/strict';
import {fractureCells,createFractureGeometry,sampleCreationRelease} from '../creation-fracture.js';
const cells=fractureCells();
assert.equal(cells.length,36);
let area=0;
for(const c of cells){
 assert.ok(c.polygon.length>=3);
 let cellArea=0;
 for(let i=0;i<c.polygon.length;i++){const a=c.polygon[i],b=c.polygon[(i+1)%c.polygon.length];cellArea+=a[0]*b[1]-a[1]*b[0];}
 assert.ok(cellArea>0,'polígonos orientados e sem faces degeneradas');area+=cellArea/2;
}
assert.ok(Math.abs(area-1)<1e-9,'células cobrem a textura inteira sem perda de área');
const g=createFractureGeometry();
for(const [name,a]of Object.entries(g.attributes)){
 assert.equal(a.count,g.attributes.position.count,name+' deve ter um valor por vértice');
 assert.ok([...a.array].every(Number.isFinite),'nenhum NaN no shader');
}
for(let i=0;i<g.attributes.position.count;i++){
 assert.ok(Math.abs(g.attributes.position.getX(i)+.5-g.attributes.uv.getX(i))<1e-6);
 assert.ok(Math.abs(g.attributes.position.getY(i)+.5-g.attributes.uv.getY(i))<1e-6);
 assert.ok(g.attributes.aEdge.getX(i)>=0);
}
for(let i=0;i<g.attributes.position.count;i+=3){
 const seeds=[0,1,2].map(j=>g.attributes.aSeed.getX(i+j));assert.equal(new Set(seeds).size,1,'impulso coerente por face, sem desmanchar o triângulo');
}
const charge=sampleCreationRelease(.2),crack=sampleCreationRelease(.65),split=sampleCreationRelease(1.9),end=sampleCreationRelease(2.8);
assert.ok(charge.charge>.5&&charge.children===0,'antecipação antes de revelar as figuras');
assert.ok(crack.fracture>0&&crack.children===0,'fissuras antes das crianças');
assert.ok(split.children>0&&split.baby<.1,'dissolução e surgimento se sobrepõem');
assert.equal(end.complete,true);assert.equal(end.children,1);assert.equal(end.baby,0);assert.equal(end.separation,1);
assert.equal(sampleCreationRelease(.19,true).complete,true);assert.equal(sampleCreationRelease(.19,true).particles,0);
g.dispose();console.log('OK: geometria contínua, UVs, fragmentos coerentes, sequência de VFX e movimento reduzido.');
