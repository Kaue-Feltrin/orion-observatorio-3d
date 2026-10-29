/** Órion Fichas v0.6.0 · PR155
 * Prato do Dia — fronteira mecânica entre declaração de origem, aquisição de
 * habilidade e execução em missão. SOMENTE revisão, nunca concessão.
 *
 * Manual Consolidado Órion v0.21 · OR-ALT-009; Suplemento Órion 1.9.3.1 p.13:
 * preparo no início da missão ou interlúdio; consumo como ação livre; PV
 * temporários. O criador de fichas não controla esses eventos em cena.
 */
import {reviewOriginChoice} from './origin-choice-review.mjs';
import {CHEF_DISH_SOURCE,CHEF_DISH_SOURCE_REF} from './chef-dish-rule.mjs';

const REQUIREMENTS=Object.freeze([
 Object.freeze({id:'ability_acquisition',scope:'character-sheet',
  proof:'worker-authenticated-activation-and-character-audit',implemented:false}),
 Object.freeze({id:'dish_preparation',scope:'mission-start-or-interlude',
  proof:'authoritative-creation-event-and-ownership',implemented:false}),
 Object.freeze({id:'dish_consumption',scope:'scene-free-action',
  proof:'authoritative-consumption-event-and-single-use',implemented:false}),
 Object.freeze({id:'temporary_pv',scope:'scene-resource-state',
  proof:'authoritative-roll-and-resource-transition',implemented:false})
]);

/** Returns null for other origins. Never trusts client ability rows, supplied
 * audit objects or narrative self-claims as evidence of canonical acquisition.
 * This is a preflight diagnostic, not an activation gate or receipt validator.
 */
export function reviewChefActivationBoundary(character){
 if(!character||typeof character!=='object'||Array.isArray(character)||
    character.origin!=='Chef')return null;
 const reviewed=reviewOriginChoice(character);
 const preview=reviewed.selected?.dishProjection;
 // Being structurally complete means only that the N1 Cozinheiro intention
 // is saved and reviewed. The mandatory lifecycle blocker must still exist.
 const intentRecorded=reviewed.status==='choice-reviewed-but-blocked'&&
  reviewed.issues.length===1&&
  reviewed.issues[0]?.code==='origin_choice_dish_lifecycle_pending'&&
  preview?.valid===true;
 const ruleReference=intentRecorded?Object.freeze({
  dice:preview.dishDice,formula:preview.dishFormula,category:preview.category,
  spaces:preview.spaces,temporaryPvOnly:true
 }):null;
 return Object.freeze({
  schemaVersion:1,origin:'Chef',sourceRef:CHEF_DISH_SOURCE_REF,source:CHEF_DISH_SOURCE,
  readOnly:true,canonical:false,purpose:'boundary-audit-not-grant',
  intentRecorded,ruleReference,
  canActivate:false,abilityAcquired:false,dishCreated:false,
  dishConsumed:false,temporaryPvGranted:0,
  acquisitionProofAvailable:false,sceneEventProofAvailable:false,
  blocker:'chef_lifecycle_not_implemented',
  requirements:REQUIREMENTS
 });
}
