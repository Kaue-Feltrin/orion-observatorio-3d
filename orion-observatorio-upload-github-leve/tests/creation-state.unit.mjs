import assert from 'node:assert/strict';
import {newCreation,transitionCreation as send,canContinue} from '../creation-state.js';
import {getHeralds,heraldCount,getHeraldLayout,arrivalURL} from '../herald-catalog.js';

assert.equal(heraldCount('0'),0);
assert.deepEqual(getHeralds(new URLSearchParams('stars=0')),[]);
assert.deepEqual(getHeraldLayout(0,1),[]);
assert.equal(getHeralds(new URLSearchParams('stars=3')).length,3);
const u=arrivalURL('https://example.com/?stars=0&quality=eco&debug=1',{id:'new-herald',creation:true});
assert.equal(u.pathname,'/criacao.html');assert.equal(u.searchParams.get('stars'),'0');assert.equal(u.searchParams.get('quality'),'eco');assert.equal(u.searchParams.has('debug'),false);
let state=newCreation();
assert.equal(send(state,{type:'mark'}),state,'não romper antes de contemplar');
assert.equal(send(state,{type:'gender',value:'menino'}),state,'nenhuma escolha antes da ruptura');
state=send(state,{type:'reveal'});state=send(state,{type:'mark'});
assert.equal(state.phase,'breaking');assert.equal(send(state,{type:'continue'}),state);
state=send(state,{type:'released'});assert.equal(state.phase,'identity');
for(const gender of ['menino','menina','nao-definir']){
 state=send(state,{type:'gender',value:gender});assert.equal(state.gender,gender);
 assert.equal(canContinue(state),false);state=send(state,{type:'name',value:'   '});assert.equal(canContinue(state),false);
 state=send(state,{type:'name',value:'  Astra  '});assert.equal(canContinue(state),true);
 const next=send(state,{type:'continue'});assert.equal(next.name,'Astra');assert.equal(next.continued,true);assert.equal(send(next,{type:'continue'}),next,'entrega única');
 state=send(next,{type:'name',value:''});assert.equal(state.continued,false);
}
state=send(state,{type:'gender',value:null});assert.equal(canContinue(state),false);
assert.equal(send(state,{type:'gender',value:'qualquer'}),state);
assert.equal(send(state,{type:'name',value:'x'.repeat(90)}).name.length,60);
assert.equal(newCreation().phase,'sealed','instâncias novas não herdam outra identidade');
console.log('OK: conta vazia, viagem correta, sequência, três escolhas exclusivas, nome e entrega local única.');
