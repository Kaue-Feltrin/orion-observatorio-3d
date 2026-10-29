/** Órion Fichas v0.6.0 · PR91 · Mergulhador / Fôlego de Nadador
 * Fonte: Sobrevivendo ao Horror 1.3.1, p.12 impressa / PDF p.13.
 * A origem dá +5 PV MÁXIMOS uma única vez (não +5 por nível), pode
 * prender a respiração por 2×VIG rodadas e nadar com deslocamento normal
 * quando passar no teste de Atletismo. A última cláusula é contextual:
 * não altera deslocamento permanentemente nem resolve testes neste site.
 */
export const SWIMMER_RULE_VERSION=1;
export const SWIMMER_SOURCE_REF='SAH-1.3.1-P12-MERGULHADOR';
export const SWIMMER_SOURCE='Sobrevivendo ao Horror 1.3.1, p.12 (PDF p.13)';
function unavailableSwimmer(reason){
 return Object.freeze({version:SWIMMER_RULE_VERSION,sourceRef:SWIMMER_SOURCE_REF,
  ruleSource:SWIMMER_SOURCE,valid:false,status:'unavailable',reason,
  maxPvBonus:null,breathRounds:null,swimMovementNote:null,
  currentPvGranted:0,changesCurrentPv:false,skillBonus:0,grant:false});
}
export function previewSwimmerOrigin({origin,vigor,level}={}){
 if(origin!=='Mergulhador')return unavailableSwimmer('origin_not_mergulhador');
 if(typeof level!=='number'||!Number.isSafeInteger(level)||level<1||level>20)
  return unavailableSwimmer('invalid_level');
 if(typeof vigor!=='number'||!Number.isSafeInteger(vigor)||vigor<0||vigor>9)
  return unavailableSwimmer('invalid_vigor');
 return Object.freeze({version:SWIMMER_RULE_VERSION,sourceRef:SWIMMER_SOURCE_REF,
  ruleSource:SWIMMER_SOURCE,valid:true,status:'read-only-origin-projection',
  level,vigor,maxPvBonus:5,breathRounds:2*vigor,
  swimMovementNote:'Ao passar no teste de Atletismo para natação, deslocamento normal em vez de metade.',
  currentPvGranted:0,changesCurrentPv:false,skillBonus:0,grant:false});
}
