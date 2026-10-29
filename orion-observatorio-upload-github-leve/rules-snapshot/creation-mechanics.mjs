/** Relatório integrado de criação N1. As três revisões são puras.
 * A aprovação de aquisição só ocorre em PATCH autenticado do Worker.
 */
import {reviewCharacterCreation} from './creation-review.mjs';
import {reviewEquipment,reviewInitialRituals} from './loadout-review.mjs';
import {reviewLifeStage} from './life-stage-review.mjs';
import {projectProdigyTraitSheet} from './prodigy-trait-projection.mjs';
import {preflightJuniorEquipment} from './junior-equipment-preflight.mjs';
import {auditProdigyActivation} from './prodigy-activation-audit.mjs';
import {reviewCharacterHomologation} from './homologation-matrix.mjs';
import {reviewOriginChoice} from './origin-choice-review.mjs';
import {reviewChefActivationBoundary} from './chef-activation-boundary-pr155.mjs';
import {deriveSheet} from './index.mjs';
export function reviewCreationMechanics(ch){
 const creation=reviewCharacterCreation(ch);
 const equipment=reviewEquipment(ch);
 const rituals=reviewInitialRituals(ch);
 const lifeStage=reviewLifeStage(ch);
 const prodigyTraitProjection=projectProdigyTraitSheet(ch);
 const juniorEquipmentPreflight=preflightJuniorEquipment(ch);
 const prodigyCertification=auditProdigyActivation(ch);
 const originChoices=reviewOriginChoice(ch);
 const chefActivationBoundary=reviewChefActivationBoundary(ch);
 const originEligible=originChoices.status==='not-applicable'||originChoices.ready===true;
 let tankPreview=null;
 // Same pure core projection as the sheet, exposed to the owner's server
 // readiness report. Never grants a Block bonus or edits current resources.
 if(ch?.origin==='Linha de Frente')try{
  const sheet=deriveSheet(ch);
  tankPreview=sheet.effects.conditional.find(x=>x.id==='origem-tanque-bloqueio')?.tankProjection??null;
 }catch{tankPreview=null;}
 let swimmerPreview=null;
 // Owner-only read-only maximum projection. Current PV is never changed.
 if(ch?.origin==='Mergulhador')try{
  const sheet=deriveSheet(ch);
  const max=sheet.effects.applied.find(x=>x.id==='origem-mergulhador-pv')?.swimmerProjection;
  const breath=sheet.effects.conditional.find(x=>x.id==='origem-mergulhador-folego')?.swimmerProjection;
  if(max?.valid&&breath?.valid&&max.sourceRef===breath.sourceRef&&
     max.maxPvBonus===breath.maxPvBonus&&max.breathRounds===breath.breathRounds)
   swimmerPreview=max;
 }catch{swimmerPreview=null;}
 let originMaximaPreview=null;
 // The private Worker report must agree with its own max-resource projection.
 if(['Vítima','Universitário'].includes(ch?.origin))try{
  const sheet=deriveSheet(ch);
  const id=ch.origin==='Vítima'?'origem-vitima-san':'origem-universitario-pe';
  const match=sheet.effects.applied.filter(x=>x.id===id);
  const p=match.length===1?match[0].originMaximaProjection:null;
  const companion=ch.origin==='Universitário'?
   sheet.effects.applied.filter(x=>x.id==='origem-universitario-limite-pe'):[];
  if(p?.valid&&match[0].value===(ch.origin==='Vítima'?p.sanMaxBonus:p.peMaxBonus)&&
     (ch.origin!=='Universitário'||(companion.length===1&&companion[0].value===p.pePerTurnBonus)))
    originMaximaPreview=p;
 }catch{originMaximaPreview=null;}
 return {...creation,creation,tankPreview,swimmerPreview,originMaximaPreview,chefActivationBoundary,
  ready:creation.ready&&equipment.ready&&rituals.ready&&lifeStage.ready&&originEligible&&
    (!prodigyCertification.applies||prodigyCertification.canActivate),
  equipment,rituals,lifeStage,prodigyTraitProjection,juniorEquipmentPreflight,prodigyCertification,originChoices,
  homologation:reviewCharacterHomologation(ch,{creation,equipment,rituals,lifeStage}),
  issues:[...creation.issues,...equipment.issues,...rituals.issues,...lifeStage.issues,...originChoices.issues,
    ...(prodigyCertification.applies&&!prodigyCertification.canActivate?
     [{code:'prodigy_activation_uncertified',message:'Prodígio exige concessão atômica e homologação de todos os efeitos antes da ativação.'}]:[])]};
}
