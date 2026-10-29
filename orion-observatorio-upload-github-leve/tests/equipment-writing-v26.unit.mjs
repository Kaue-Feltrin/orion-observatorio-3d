import assert from'node:assert/strict';
import{complete}from './character-fixture.mjs';
import{MANUAL_EQUIPMENT,setInventory,reviewEquipment,engineeringItemTypeCandidates,stepIssues,completionIssues}from '../creation-journey-core.js';
import{equipmentGuidance,additionGuidance}from '../equipment-guidance.js';
import{HANDWRITING}from '../handwriting-atlas.js';
import{pencilSize}from '../handwriting.js';
const{ch}=complete(),rifle=MANUAL_EQUIPMENT.find(i=>i.name==='Fuzil de assalto'),pistol=MANUAL_EQUIPMENT.find(i=>i.name==='Pistola');
assert.equal(additionGuidance(ch,rifle).fits,false);assert.equal(additionGuidance(ch,pistol).fits,true);setInventory(ch,rifle.stableKey,1);
let g=equipmentGuidance(ch);assert.equal(g.conflicts.length,1);assert.match(g.conflicts[0].errors[0],/Categoria II.*Recruta/);assert.equal(g.review.limits[2],0);assert.equal(stepIssues(ch,'equipment').length,1);assert(completionIssues(ch).some(i=>i.step==='equipment'));
setInventory(ch,rifle.stableKey,0);assert.equal(stepIssues(ch,'equipment').length,0);setInventory(ch,pistol.stableKey,3);assert.match(equipmentGuidance(ch).conflicts[0].errors[0],/Retire 1 unidade/);setInventory(ch,pistol.stableKey,2);assert.equal(equipmentGuidance(ch).conflicts.length,0);
ch.patent='OPERADOR';setInventory(ch,rifle.stableKey,1);assert.equal(equipmentGuidance(ch).conflicts.length,0);assert.equal(reviewEquipment(ch).ready,true);
const engineer=complete().ch;engineer.origin='Engenheiro';const type=engineeringItemTypeCandidates()[0];engineer.narrative_json.creatorOriginChoiceV1={version:1,originCode:'ENGENHEIRO',profession:'mecânico',itemTypeStableKey:type.stableKey};setInventory(engineer,type.stableKey,3);assert.equal(equipmentGuidance(engineer).rows[0].category,type.category-1);assert.equal(equipmentGuidance(engineer).conflicts.length,0);assert.equal(additionGuidance(engineer,type).fits,true,'reviewed engineer discount must not be flagged from raw category');
const before=JSON.stringify(ch);for(const item of MANUAL_EQUIPMENT)additionGuidance(ch,item);assert.equal(JSON.stringify(ch),before,'suggestions must not mutate selections, categories or patent');
for(const width of[296,820,1120]){const s=pencilSize(width);assert.equal(s.height/width,.35);assert.equal(s.height/s.width,12);}
for(const char of 'Márcia Ávila Órion Não definida AGI 2 FOR 2')if(char!==' ')assert(HANDWRITING[char]?.outline&&HANDWRITING[char]?.strokes.length,char);
for(const glyph of Object.values(HANDWRITING)){assert(glyph.advance>=0);for(const stroke of glyph.strokes){assert(stroke.length>1);assert(stroke.every(p=>p.length===2&&p.every(Number.isFinite)));}}
console.log('OK: source-reviewed category hints, explicit repair, complete equipment gate, non-mutating suggestions, paper-relative pencil and finite accented handwriting strokes.');
