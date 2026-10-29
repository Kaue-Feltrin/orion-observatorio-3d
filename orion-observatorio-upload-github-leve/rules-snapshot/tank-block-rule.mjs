/** Órion Fichas v0.6.0 · PR89 — origem Linha de Frente, O Tanque.
 * Fonte exata: Manual Consolidado Órion v0.15 OR-ADD-012,
 * Suplemento Órion 1.9.3.1, p.11.
 * Somente projeção do valor adicional ao BLOQUEIO. Não é Defesa,
 * Fortitude nem concessão; não requer combate, rolagem ou modificadores.
 */
export const TANK_SOURCE_REF='OR-ADD-012';
export const TANK_SOURCE='Suplemento Órion 1.9.3.1, p.11';
export const TANK_VERSION=1;
const normalize=x=>typeof x==='string'?x.normalize('NFD')
 .replace(/[\u0300-\u036f]/g,'').trim().toUpperCase():'';
const invalid=reason=>Object.freeze({
 version:TANK_VERSION,sourceRef:TANK_SOURCE_REF,ruleSource:TANK_SOURCE,
 status:'unavailable',valid:false,reason,trainingRank:null,
 blockBonus:null,defenseBonus:0,skillBonus:0,bonusApplied:false,
 grant:false,canonical:false
});
export function previewTankBlock({origin,fortitudeRank}={}){
 if(normalize(origin)!=='LINHA DE FRENTE')return invalid('origin_not_linha_de_frente');
 if(typeof fortitudeRank!=='number'||!Number.isInteger(fortitudeRank)||
  fortitudeRank<1||fortitudeRank>3)return invalid('fortitude_training_unverified');
 return Object.freeze({
  version:TANK_VERSION,sourceRef:TANK_SOURCE_REF,ruleSource:TANK_SOURCE,
  status:'read-only-origin-projection',valid:true,
  trainingRank:fortitudeRank,blockBonus:2*fortitudeRank,
  defenseBonus:0,skillBonus:0,bonusApplied:false,grant:false,
  canonical:false,condition:'apenas ao Bloquear'
 });
}
