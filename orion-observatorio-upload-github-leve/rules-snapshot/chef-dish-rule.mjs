/** Órion Fichas v0.6.0 · PR88 — Prato do Dia (Chef), read-only rules.
 * Regra Órion: Suplemento 1.9.3.1, p.13, índice Manual v0.15 OR-ALT-009.
 * N1: 2d6 PV temporários. +1d6 em N5/10/13/16. Categoria 0, 1 espaço.
 *
 * SOMENTE projeção de capacidade. Não cria item, concede PV, sorteia dados,
 * registra preparação/consumo, valida momento de missão ou libera ativação.
 */
export const CHEF_DISH_RULE_VERSION=1;
export const CHEF_DISH_SOURCE_REF='OR-ALT-009';
export const CHEF_DISH_SOURCE='Suplemento Órion 1.9.3.1, p.13';
export const CHEF_DISH_MILESTONES=Object.freeze([5,10,13,16]);
const invalid=reason=>Object.freeze({
 version:CHEF_DISH_RULE_VERSION,sourceRef:CHEF_DISH_SOURCE_REF,
 ruleSource:CHEF_DISH_SOURCE,valid:false,reason,canonical:false,
 eligibleToActivate:false,created:false,consumed:false,grant:false,
 temporaryPvGranted:0,bonusApplied:false,dishDice:0,dishFormula:null,
 category:null,spaces:null,temporaryPvOnly:true
});
const normalize=x=>typeof x==='string'?x.normalize('NFD')
 .replace(/[\u0300-\u036f]/g,'').trim().toUpperCase():'';
export function previewChefDish({originCode,profession,level}={}){
 if(normalize(originCode)!=='CHEF')return invalid('origin_not_chef');
 if(normalize(profession)!=='COZINHEIRO')return invalid('profession_not_cook');
 if(typeof level!=='number'||!Number.isSafeInteger(level)||level<1||level>20)
  return invalid('invalid_level');
 const dishDice=2+CHEF_DISH_MILESTONES.filter(n=>level>=n).length;
 return Object.freeze({
  version:CHEF_DISH_RULE_VERSION,sourceRef:CHEF_DISH_SOURCE_REF,
  ruleSource:CHEF_DISH_SOURCE,valid:true,status:'canonical-reference-only',
  level,dishDice,dishFormula:dishDice+'d6',dieFaces:6,
  category:0,spaces:1,temporaryPvOnly:true,
  trigger:'mission-start-or-interlude',consumptionAction:'free',
  // Preparing/consuming affects gameplay beyond character-sheet CRUD.
  // None of those effects is authorized or implemented here.
  canonical:false,eligibleToActivate:false,created:false,consumed:false,
  grant:false,temporaryPvGranted:0,bonusApplied:false
 });
}
