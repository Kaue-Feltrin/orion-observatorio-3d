/** Núcleo mecânico: revisão de rituais iniciais, capacidade e categorias.
 * Derivado de projeto-orion/worker/rules/ritualsEquipment.ts (v0.15).
 * Não aplica modificações ou maldições ainda não automatizadas.
 */
import {MANUAL_RITUALS,MANUAL_EQUIPMENT,MANUAL_CATALOG_VERSION} from './manual-items.mjs';
import {VERIFIED_ORIGINS} from './index.mjs';
import {CREATION_SKILLS} from './creation-catalog.mjs';
import {lifeStageForAge,validateLifeStageStructure,lifeStagePayload} from './life-stage-review.mjs';
import {previewProdigyEffects,juniorAdjustedCategoryLimits} from './life-stage-effects.mjs';
import {reviewJuniorModification} from './junior-modifications.mjs';
import {reviewOriginChoice} from './origin-choice-review.mjs';
import {previewBombadoCapacity} from './bombado-capacity-rule.mjs';

const ritByKey=new Map(MANUAL_RITUALS.map(x=>[x.stableKey,x]));
const itemByKey=new Map(MANUAL_EQUIPMENT.map(x=>[x.stableKey,x]));
const ritByName=new Map(MANUAL_RITUALS.map(x=>[normalize(x.name),x]));
const itemByName=new Map(MANUAL_EQUIPMENT.map(x=>[normalize(x.name),x]));
const patentLimits=Object.freeze({
 RECRUTA:{1:2,2:0,3:0,4:0},
 OPERADOR:{1:3,2:1,3:0,4:0},
 AGENTE_ESPECIAL:{1:3,2:2,3:1,4:0},
 OFICIAL_OPERACOES:{1:3,2:3,3:2,4:1},
 AGENTE_ELITE:{1:3,2:3,3:3,4:2}
});
const aliases=new Map([['OFICIAL_DE_OPERACOES','OFICIAL_OPERACOES'],['OFICIAL_DE_OPERAÇÕES','OFICIAL_OPERACOES'],['AGENTE_DE_ELITE','AGENTE_ELITE']]);
function normalize(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();}
function enumCode(v){return normalize(v).replace(/[^A-Z0-9]+/g,'_')}
function unpack(v){if(typeof v==='string'){try{return JSON.parse(v)}catch{return null}}return v}
function err(code,message){return {code,message}}
// An explicit stableKey must be authoritative. Never silently fall back to a
// display name if the declared key is unknown; name-only legacy rows remain
// readable so existing drafts are not destroyed.
function findItem(row){
 const key=String(row?.stableKey||'');
 return key?itemByKey.get(key):itemByName.get(normalize(row?.name));
}
function findRitual(row){
 const key=String(row?.stableKey||'');
 return key?ritByKey.get(key):ritByName.get(normalize(row?.name));
}
export function limitsForPatent(value){
 const code=enumCode(value||'RECRUTA');
 const normalized=aliases.get(code)||code;
 return {code:normalized,limits:patentLimits[normalized]||null};
}
export function equipmentBaseCapacity(strength){
 return strength<=0?2:strength*5;
}
export function reviewEquipment(character){
 const issues=[],ch=character||{},raw=unpack(ch.inventory_json);
 const selections=Array.isArray(raw)?raw:[];
 if(!Array.isArray(raw))issues.push(err('invalid_inventory','Lista de equipamentos inválida.'));
 const {code:patent,limits:patentLimits}=limitsForPatent(ch.patent);
 let limits=patentLimits,lifeStageCategory=null;
 const lifeContract=validateLifeStageStructure(ch.narrative_json);
 if(lifeStageForAge(ch.age)==='PRODIGIO'&&!lifeContract.valid)
   issues.push(err('invalid_life_stage_contract','Contrato de escolhas etárias inválido.'));
 if(lifeStageForAge(ch.age)==='PRODIGIO'&&lifeContract.valid){
   const choices=lifeStagePayload(ch.narrative_json)?.byStage?.PRODIGIO;
   const attribute=unpack(ch.attributes_json)||{};
   const preview=previewProdigyEffects({stage:'PRODIGIO',level:Number(ch.level),
     limitedAttributes:choices?.limitedAttributes,trait:choices?.prematureTrait,attributes:attribute});
   lifeStageCategory=juniorAdjustedCategoryLimits(preview,patentLimits);
   if(lifeStageCategory)limits=lifeStageCategory.limits;
 }
 if(!limits)issues.push(err('invalid_patent','Patente não reconhecida. Selecione uma patente disponível.'));
 const attribute=unpack(ch.attributes_json)||{},FOR=Number(attribute.FOR),VIG=Number(attribute.VIG);
 if(!Number.isInteger(FOR)||FOR<0||FOR>9)issues.push(err('invalid_strength','Força não definida corretamente.'));
 const origin=VERIFIED_ORIGINS.find(x=>normalize(x.name)===normalize(ch.origin));
 const originKey=origin?enumCode(origin.name):'';
 const knownOrigin=Boolean(origin);
 const knownPowerCodes=new Set((Array.isArray(unpack(ch.abilities_json))?unpack(ch.abilities_json):[])
  .filter(x=>String(x?.source||'').startsWith('canonical-level-')).map(x=>String(x.code||'')));
 // Bombado: preserve existing quota behavior, with one source-backed rule.
 const baseCapacity=Number.isInteger(FOR)?equipmentBaseCapacity(FOR):0;
 const bombadoCapacityPreview=knownOrigin&&originKey==='BOMBADO'?
  previewBombadoCapacity({origin:origin.name,strength:attribute.FOR,vigor:attribute.VIG}):null;
 let capacity=bombadoCapacityPreview?.valid?
  bombadoCapacityPreview.combinedCapacity:baseCapacity;
 if(knownOrigin&&originKey==='MOCHILEIRO')capacity+=5;
 if(knownPowerCodes.has('PO-GER-007'))capacity+=2;
 if(selections.some(x=>String(x?.stableKey||'')==='EQ-GER-BASE-MOCHILA-MILITAR'&&Number(x?.quantity)>0)&&originKey!=='MOCHILEIRO')capacity+=2;
 const counts={1:0,2:0,3:0,4:0},normalized=[],seen=new Set(),accessorySkillChoices=[];
 let juniorModification=null, juniorUses=0;
 let usedSpaces=0;
 for(const row of selections){
  const item=findItem(row);
  if(!row||typeof row!=='object'||Array.isArray(row)||!item){
   issues.push(err('unknown_equipment','Um equipamento não foi reconhecido no catálogo v0.15. Mantenha-o como legado até revisão.'));continue;
  }
  if(seen.has(item.stableKey)){issues.push(err('duplicate_equipment','Equipamento duplicado: '+item.name+'. Ajuste a quantidade no mesmo registro.'));continue;}
  seen.add(item.stableKey);
  // Only integer JSON numbers are unambiguous inventory quantities.
  // "2", true and other coerced values must not pass creation validation
  // when they would be rejected by the later instance-conversion planner.
  // A missing quantity remains 1 for compatibility with older named rows.
  const quantity=row.quantity===undefined?1:row.quantity;
  if(typeof quantity!=='number'||!Number.isSafeInteger(quantity)||quantity<1||quantity>20){
   issues.push(err('invalid_quantity','Quantidade inválida em '+item.name+' (permitido: inteiro de 1 a 20).'));continue;
  }
  if(item.group==='AMALDICOADO'){issues.push(err('cursed_equipment_pending','Equipamento amaldiçoado exige concessão/configuração específica: '+item.name+'.'));continue;}
  const mods=row.config?.modifications, curses=row.config?.curses;
  let certifiedJunior=null;
  if((mods!==undefined&&(!Array.isArray(mods)||mods.length>0))||(curses!==undefined&&(!Array.isArray(curses)||curses.length>0))){
   certifiedJunior=lifeStageCategory&&reviewJuniorModification(item,row,quantity);
   if(!certifiedJunior){
    issues.push(err('augmentation_pending','Modificação ou maldição de '+item.name+' não homologada. Júnior permite somente uma modificação elegível em um único exemplar.'));continue;
   }
   if(ch.status==='active'){
    issues.push(err('junior_active_acquisition_unverified',
     'Uma modificação de Júnior em ficha ativa exige concessão e proveniência geradas pelo Worker. Prévia de rascunho não é aquisição.'));continue;
   }
   juniorUses++;
   if(juniorUses>1){
    issues.push(err('junior_modification_multiple','Júnior permite uma única modificação gratuita em um item da ficha.'));continue;
   }
   juniorModification=certifiedJunior;
  }
  if(item.configurableSkill){
   // A perícia é uma escolha estruturada para este tipo de acessório.
   // Não equivale a aprovação do mestre nem a um item vestido/empunhado.
   const config=row.config;
   if(config===undefined||config===null){
    issues.push(err('equipment_skill_config_required',
      'Escolha uma perícia para '+item.name+'.'));continue;
   }
   if(typeof config!=='object'||Array.isArray(config)||
      Object.keys(config).some(key=>!['skillCode','modifications','curses'].includes(key))){
    issues.push(err('equipment_skill_config_invalid',
     'A configuração de '+item.name+' deve informar apenas uma perícia válida, sem aprovações declaradas pelo jogador.'));continue;
   }
   const code=config.skillCode;
   if(typeof code!=='string'||!CREATION_SKILLS.some(x=>x.code===code)||
      ['LUTA','PONTARIA'].includes(code)){
    issues.push(err('equipment_skill_config_required','Escolha a perícia válida para '+item.name+'.'));continue;
   }
  }
  // Evidência do jogador, não parecer do mestre; nunca apagar silenciosamente na aquisição.
  if(item.configurableSkill&&row.description!==undefined&&
     (typeof row.description!=='string'||row.description.length>240||
      /[<>\u0000-\u001f\u007f]/.test(row.description))){
   issues.push(err('equipment_accessory_description_invalid',
    'A descrição de '+item.name+' deve ter até 240 caracteres válidos.'));continue;
  }
  if(item.category>0)counts[item.category]+=quantity;
  const effectiveSpaces=certifiedJunior?certifiedJunior.spaces:item.spaces;
  usedSpaces+=effectiveSpaces*quantity;
  if(item.configurableSkill){
   const code=row.config.skillCode,skill=CREATION_SKILLS.find(x=>x.code===code);
   accessorySkillChoices.push({
    stableKey:item.stableKey,skillCode:code,skillLabel:skill.label,quantity,
    referenceBonus:2,sourceRef:'Ordem Paranormal RPG 1.3 p.63; Suplemento Órion 1.9.3.1 p.48',
    requiredUse:item.stableKey==='EQ-GER-BASE-VESTIMENTA'?'vestido':'empunhado',
    maxBenefitingWornItems:5,
    // Contextual approval and actual worn/held slots are not certified yet.
    masterApproved:false,activeUseCertified:false,bonusApplied:false,
    stackableWithEquipmentBonus:false,grant:false
   });
  }
  normalized.push({stableKey:item.stableKey,name:item.name,quantity,category:item.category,spaces:effectiveSpaces,group:item.group,
   ...(certifiedJunior?{juniorModification:certifiedJunior}:{}),
   ...(item.configurableSkill&&typeof row.description==='string'&&row.description.trim()?{description:row.description.trim()}:{}),
   ...(item.configurableSkill||certifiedJunior?{config:{...(item.configurableSkill?{skillCode:String(row.config.skillCode)}:{}),
    ...(certifiedJunior?{modifications:[certifiedJunior.code]}:{})}}:{})});
 }

 // Os totais iniciais usam somente a classificação oficial do catálogo.
 // Para Engenheiro, a única redução permitida vem de um tipo explicitamente
 // revisado e da escolha do próprio personagem, validada no Worker.
 const originalCounts={...counts};
 let engineerCategoryPreview=null,engineerCategoryGrant=null;
 if(enumCode(ch.origin)==='ENGENHEIRO'){
  const selection=reviewOriginChoice(ch),key=selection.selected?.itemTypeStableKey;
  const item=key?itemByKey.get(key):null;
  const legacyMatch=item&&selections.some(row=>
   !row?.stableKey&&normalize(row?.name)===normalize(item.name));
  if(selection.ready&&legacyMatch)
   issues.push(err('engineer_stable_key_required',
    'Ferramenta Favorita exige stableKey em todos os exemplares do tipo escolhido.'));
  if(selection.ready&&!legacyMatch&&issues.length===0&&item){
   const affected=normalized.filter(row=>row.stableKey===key);
   // Uma ficha ativa legada não ganha desconto só por possuir narrativa
   // compatível. Cada exemplar presente deve comprovar a aquisição gerada
   // pelo Worker na ativação anterior (source e assinatura mecânica de tipo).
   const alreadyAcquired=ch.status!=='active'||affected.every(entry=>{
    const saved=selections.find(row=>row?.stableKey===entry.stableKey);
    const grant=saved?.originGrant;
    return saved?.source==='creation-approved'&&
     grant?.code==='ORIGEM_ENGENHEIRO_FERRAMENTA_FAVORITA'&&
     grant?.acquisition==='creation-approved'&&grant?.typeStableKey===key&&
     grant?.catalogCategory===item.category&&
     grant?.effectiveCategory===item.category-1;
   });
   if(!alreadyAcquired)issues.push(err('engineer_acquisition_provenance_missing',
    'Equipamentos de Engenheiro em ficha ativa exigem comprovação da aquisição canônica.'));
   const units=affected.reduce((total,row)=>total+row.quantity,0);
   if(!alreadyAcquired)return {ready:false,canonical:false,manual:MANUAL_CATALOG_VERSION,
    capacity,usedSpaces,maxCarry:capacity*2,overloaded:usedSpaces>capacity&&usedSpaces<=capacity*2,
    counts,originalCounts,limits,baseLimits:patentLimits,lifeStageCategory,juniorModification,patent,
    items:normalized,engineerCategoryGrant:null,engineerCategoryPreview:null,issues};
   for(const entry of affected){
    const original=entry.category;
    // Não aceitar o campo category declarado pelo jogador: já foi
    // recuperado do catálogo MANUAL_EQUIPMENT.
    if(!Number.isInteger(original)||original<1||original>4)continue;
    entry.catalogCategory=original;
    entry.category=original-1;
    entry.originGrant={
     code:'ORIGEM_ENGENHEIRO_FERRAMENTA_FAVORITA',
     typeStableKey:key,catalogCategory:original,effectiveCategory:entry.category,
     sourceRef:'Livro Base 1.3 p.28; Guia Órion p.4',
     acquisition:'creation-approved'
    };
   }
   if(units>0&&item.category>=1&&item.category<=4){
    counts[item.category]-=units;
    if(item.category>1)counts[item.category-1]+=units;
   }
   engineerCategoryGrant={
    typeStableKey:key,sourceRef:'Livro Base 1.3 p.28; Guia Órion p.4',
    catalogCategory:item.category,effectiveCategory:item.category-1,
    affectedUnits:units,appliesToAllUnitsOfType:true,
    originalCounts,effectiveCounts:{...counts}
   };
  }
 }
 if(limits)for(const cat of [1,2,3,4]){
  if(counts[cat]>limits[cat])issues.push(err('equipment_category_limit',
   'Categoria '+cat+': '+counts[cat]+' itens, limite '+limits[cat]+' para '+patent+'.'));
 }
 if(usedSpaces>capacity*2)
  issues.push(err('equipment_over_max_capacity',
   'Equipamentos ocupam '+usedSpaces+' espaços; máximo permitido: '+capacity*2+'.'));
 if(engineerCategoryGrant&&ch.status==='draft'){
  const quotaIssues=limits?[1,2,3,4].filter(cat=>counts[cat]>limits[cat]):[];
  engineerCategoryPreview={
   mode:'dry-run-only',canonical:false,grant:false,applied:false,canActivate:false,
   selectedTypeStableKey:engineerCategoryGrant.typeStableKey,
   baseCategory:engineerCategoryGrant.catalogCategory,
   effectiveCategory:engineerCategoryGrant.effectiveCategory,
   affectedUnits:engineerCategoryGrant.affectedUnits,appliesToAllUnitsOfType:true,
   originalCounts,projectedCounts:{...counts},categoryLimits:limits?{...limits}:null,
   quotaWithinLimits:limits?quotaIssues.length===0:false,
   quotaExceededCategories:quotaIssues,
   items:normalized.map(row=>({
    stableKey:row.stableKey,quantity:row.quantity,
    catalogCategory:row.catalogCategory??row.category,projectedCategory:row.category,
    discounted:row.originGrant?.code==='ORIGEM_ENGENHEIRO_FERRAMENTA_FAVORITA'
   }))
  };
 }
 return {ready:issues.length===0,canonical:false,manual:MANUAL_CATALOG_VERSION,
  capacity,bombadoCapacityPreview,usedSpaces,maxCarry:capacity*2,overloaded:usedSpaces>capacity&&usedSpaces<=capacity*2,
  counts,originalCounts,limits,baseLimits:patentLimits,lifeStageCategory,juniorModification,patent,
  items:normalized,accessorySkillChoices,engineerCategoryGrant,engineerCategoryPreview,issues};

}
export function reviewInitialRituals(character){
 const issues=[],ch=character||{},raw=unpack(ch.rituals_json);
 const rows=Array.isArray(raw)?raw:[];
 if(!Array.isArray(raw))issues.push(err('invalid_rituals','Lista de rituais inválida.'));
 const initial=String(ch.class_code)==='OCULTISTA',seen=new Set(),rituals=[];
 for(const row of rows){
  if(!row||typeof row!=='object'||Array.isArray(row)){issues.push(err('invalid_ritual','Registro de ritual inválido.'));continue;}
  const entry=findRitual(row);
  if(!entry){issues.push(err('unknown_ritual','Ritual não encontrado no Manual v0.15: '+String(row.name||row.stableKey||'sem nome')));continue;}
  if(seen.has(entry.stableKey)){issues.push(err('duplicate_initial_ritual','Ritual duplicado: '+entry.name+'.'));continue;}
  seen.add(entry.stableKey);
  if(entry.circle!==1)issues.push(err('invalid_initial_ritual','Rituais iniciais devem ser de 1º círculo: '+entry.name+'.'));
  rituals.push({stableKey:entry.stableKey,name:entry.name,element:entry.element,circle:entry.circle});
 }
 if(initial&&rituals.length!==3)issues.push(err('occultist_three_rituals_required','Ocultista deve escolher exatamente três rituais de 1º círculo na criação.'));
 if(!initial&&rows.length>0)issues.push(err('initial_ritual_not_available','Essa classe não recebe rituais iniciais. Obtenha-os pela Progressão.'));
 return {ready:issues.length===0,canonical:false,manual:MANUAL_CATALOG_VERSION,
   required:initial?3:0,selected:rituals.length,rituals,issues};
}
export function approveInitialLoadout(character,review){
 if(!review?.ready)throw new Error('mechanical_review_required');
 const equipment=review.equipment.items.map(item=>({...item,source:'creation-approved',kind:'owned'}));
 const rituals=review.rituals.rituals.map(item=>({...item,source:'creation-approved',kind:'known'}));
 return {inventory_json:JSON.stringify(equipment),rituals_json:JSON.stringify(rituals)};
}
