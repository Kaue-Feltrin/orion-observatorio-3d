/**
 * Órion Fichas v0.6.0 — PR102 · retrato mecânico dos traços de Prodígio.
 * Ordem de fontes: Manual Consolidado v0.21; Suplemento Órion 1.9.3.1 p.15.
 * A v0.21 não contém entrada explícita de Prodígio; conferir no Suplemento.
 *
 * É um retrato calculado somente a partir da ficha canônica revisada pelo Worker.
 * Não é motor de rolagem, não aplica efeitos, não altera recursos e NÃO libera
 * a ativação. O cliente não envia números de bônus.
 */
import {reviewLifeStage} from './life-stage-review.mjs';
import {evaluateProdigyContext,LIFE_EFFECT_SOURCE} from './life-stage-effects.mjs';

const CASES=Object.freeze({
 PIVETE:Object.freeze([
  {key:'furtividade',label:'Furtividade',kind:'skill-test',skill:'Furtividade',effect:'prodigio-pivete-furtividade'},
  {key:'manobras',label:'Testes de manobra',kind:'maneuver-test',effect:'prodigio-pivete-manobras'},
  {key:'defesa',label:'Defesa',kind:'defense',effect:'prodigio-pivete-defesa'},
  {key:'fortitude',label:'Resistência · Fortitude',kind:'resistance-test',skill:'Fortitude',effect:'prodigio-pivete-resistencias'},
  {key:'reflexos',label:'Resistência · Reflexos',kind:'resistance-test',skill:'Reflexos',effect:'prodigio-pivete-resistencias'},
  {key:'vontade',label:'Resistência · Vontade',kind:'resistance-test',skill:'Vontade',effect:'prodigio-pivete-resistencias'}
 ]),
 REBELDE:Object.freeze([
  {key:'vontade',label:'Vontade',kind:'resistance-test',skill:'Vontade',effect:'prodigio-rebelde-vontade'},
  {key:'controle',label:'Resistência a controle',kind:'resistance-test',skill:'Vontade',purpose:'controle',
   effects:['prodigio-rebelde-vontade','prodigio-rebelde-controle']},
  {key:'aprisionamento',label:'Resistência a aprisionamento',kind:'resistance-test',skill:'Fortitude',purpose:'aprisionamento',
   effect:'prodigio-rebelde-controle'},
  {key:'ajudar',label:'Receber Ajudar',kind:'help-action',target:'prodigio',effect:'prodigio-rebelde-ajuda'},
  {key:'acalmar',label:'Acalmar por aliados',kind:'calm-test',target:'prodigio',actor:'ally',effect:'prodigio-rebelde-acalmar'}
 ])
});
const noGrant={applied:false,grant:false,activationApproved:false,canonicalUse:false};
export function projectProdigyTraitSheet(character){
 const life=reviewLifeStage(character);
 const empty={schemaVersion:1,stage:life.stage,trait:null,status:'not-applicable',
  sourceRef:LIFE_EFFECT_SOURCE,rows:[],...noGrant};
 if(life.stage!=='PRODIGIO')return empty;
 const preview=life.effectsPreview;
 if(!life.intentValid||!preview||preview.status!=='preview-not-granted'||
    preview.applied!==false||!['PIVETE','REBELDE'].includes(preview.trait))
  return {...empty,status:life.intentValid&&preview?.trait==='JUNIOR'?'reserved-for-junior':
    'invalid-or-incomplete-intent'};
 const rows=[];
 for(const item of CASES[preview.trait]){
  const context={kind:item.kind,
   ...(item.skill?{skill:item.skill}:{}),...(item.purpose?{purpose:item.purpose}:{}),
   ...(item.target?{target:item.target}:{}),...(item.actor?{actor:item.actor}:{})};
  const calculated=evaluateProdigyContext(preview,context);
  const expected=item.effects??[item.effect];
  const ids=calculated.effects.map(x=>x.id);
  if(calculated.status!=='preview-not-granted'||calculated.applied!==false||
     ids.length!==expected.length||ids.some((id,i)=>id!==expected[i])||
     calculated.effects.some(x=>x.applied!==false))
   return {...empty,trait:preview.trait,status:'inconsistent-context-projection'};
  rows.push({key:item.key,label:item.label,context,
   flatBonus:calculated.flatBonus,extraDice:calculated.extraDice,
   allowed:calculated.allowed,effectIds:ids,applied:false});
 }
 return {...empty,trait:preview.trait,status:'validated-read-only-projection',rows};
}
