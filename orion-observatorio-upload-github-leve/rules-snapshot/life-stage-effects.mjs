/** Órion Fichas v0.6.0 · Projeção pura e NÃO CONCEDIDA dos efeitos de Prodígio.
 * Fonte: Suplemento Órion v1.9.3.1 p.15.
 * Somente para revisão do Worker. Não executa PATCH, não concede habilidades,
 * não atualiza PV/PE/DEF, não altera o orçamento de perícias nem o inventário.
 */
export const LIFE_EFFECT_SOURCE='Suplemento Órion v1.9.3.1 · p.15';
const ATTRIBUTES=Object.freeze(['FOR','INT','PRE','VIG']);
const TRAITS=Object.freeze(['JUNIOR','PIVETE','REBELDE']);
function fixed(id,target,amount,qualifier=''){
 return {id,target,amount,qualifier,source:LIFE_EFFECT_SOURCE,applied:false};
}
function conditional(id,description){
 return {id,description,source:LIFE_EFFECT_SOURCE,applied:false};
}
function exactTwo(list){return Array.isArray(list)&&list.length===2&&
 list.every(code=>ATTRIBUTES.includes(code))&&new Set(list).size===2;}
/** Retorna prévia estruturada apenas se a escolha Prodígio estiver completa,
 * com teto de atributos válido. Rejeita códigos não reconhecidos.
 */
export function previewProdigyEffects({stage,level,limitedAttributes,trait,attributes}={}){
 if(stage!=='PRODIGIO'||!Number.isSafeInteger(level)||level<1||level>20||
    !exactTwo(limitedAttributes)||!TRAITS.includes(trait)||
    !attributes||typeof attributes!=='object'||Array.isArray(attributes)||
    limitedAttributes.some(key=>!Number.isInteger(attributes[key])||attributes[key]<0||attributes[key]>2))return null;
 const numeric=[
  fixed('prodigio-jovem-imparavel-pe','peMaximum',level),
  fixed('prodigio-jovem-imparavel-pe-turn','pePerTurn',1)
 ];
 const conditions=[],itemChanges=[];
 if(trait==='PIVETE'){
  numeric.push(fixed('prodigio-pivete-furtividade','skill:Furtividade',2));
  numeric.push(fixed('prodigio-pivete-manobras','maneuverTests',-2));
  numeric.push(fixed('prodigio-pivete-defesa','defense',2));
  numeric.push(fixed('prodigio-pivete-resistencias','resistanceTests',2,
   'Testes de resistência: Fortitude, Reflexos e Vontade'));
 }else if(trait==='REBELDE'){
  conditions.push(conditional('prodigio-rebelde-vontade','+1d20 somente em testes de Vontade.'));
  conditions.push(conditional('prodigio-rebelde-controle','+5 em testes de resistência contra aprisionamento e efeitos de controle.'));
  conditions.push(conditional('prodigio-rebelde-ajuda','Não pode ser alvo da ação Ajudar.'));
  conditions.push(conditional('prodigio-rebelde-acalmar','Aliados sofrem −1d20 em testes de Acalmar realizados no Prodígio.'));
 }else if(trait==='JUNIOR'){
  itemChanges.push(conditional('prodigio-junior-categoria','Limite de categoria de item reduzido em 1 na maior categoria acessível (ou segunda maior, se a maior permitir apenas um item).'));
  itemChanges.push(conditional('prodigio-junior-modificacao','Pode personalizar um item com uma modificação sem elevar sua categoria.'));
 }
 return {
  status:'preview-not-granted',stage,trait,source:LIFE_EFFECT_SOURCE,level,
  ageAttributeCaps:limitedAttributes.map(code=>({code,max:2})),
  numeric,conditions,itemChanges,
  applied:false,
  notes:['A prévia não concede nenhum efeito: é necessário validar e aplicar no Worker exclusivo.',
   'Jovem Imparável já aparece na prévia de recursos deriveSheet: não somar este contrato novamente.',
   'Efeitos de turno, manobra, resistência, ajudar e inventário exigem contexto do sistema antes de homologação.']
 };
}

/** Contextual execution preview. It does not grant or persist modifiers.
 * Only use with a preview produced by reviewLifeStage from trusted state.
 */
export function evaluateProdigyContext(preview,context){
 const empty={status:'not-applicable',flatBonus:0,extraDice:0,allowed:true,effects:[],applied:false};
 if(preview?.status!=='preview-not-granted'||preview?.stage!=='PRODIGIO'||
    !TRAITS.includes(preview?.trait)||preview.applied!==false||
    !context||typeof context!=='object'||Array.isArray(context))return empty;
 const kind=String(context.kind||''),skill=String(context.skill||''),purpose=String(context.purpose||'');
 const resistance=['Fortitude','Reflexos','Vontade'].includes(skill);
 const effects=[];
 const add=(id,flatBonus=0,extraDice=0,allowed=true)=>effects.push({
   id,flatBonus,extraDice,allowed,applied:false,source:LIFE_EFFECT_SOURCE
 });
 if(preview.trait==='PIVETE'){
  if(kind==='skill-test'&&skill==='Furtividade')add('prodigio-pivete-furtividade',2);
  if(kind==='maneuver-test')add('prodigio-pivete-manobras',-2);
  if(kind==='defense')add('prodigio-pivete-defesa',2);
  if(kind==='resistance-test'&&resistance)add('prodigio-pivete-resistencias',2);
 }
 if(preview.trait==='REBELDE'){
  if(['skill-test','resistance-test'].includes(kind)&&skill==='Vontade')add('prodigio-rebelde-vontade',0,1);
  if(kind==='resistance-test'&&resistance&&['aprisionamento','controle'].includes(purpose))add('prodigio-rebelde-controle',5);
  if(kind==='help-action'&&context.target==='prodigio')add('prodigio-rebelde-ajuda',0,0,false);
  if(kind==='calm-test'&&context.target==='prodigio'&&context.actor==='ally')add('prodigio-rebelde-acalmar',0,-1);
 }
 return {status:effects.length?'preview-not-granted':'not-applicable',
  flatBonus:effects.reduce((n,e)=>n+e.flatBonus,0),
  extraDice:effects.reduce((n,e)=>n+e.extraDice,0),
  allowed:effects.every(e=>e.allowed),effects,applied:false};
}

/** Adjust a patent's *catalog-grounded* category quota for Júnior.
 * Free modification is NOT certified by this helper. No item is acquired.
 */
export function juniorAdjustedCategoryLimits(preview,baseLimits){
 if(preview?.stage!=='PRODIGIO'||preview?.trait!=='JUNIOR'||
    preview.status!=='preview-not-granted'||preview.applied!==false||
    !baseLimits||typeof baseLimits!=='object')return null;
 const categories=[1,2,3,4].filter(c=>Number.isSafeInteger(baseLimits[c])&&baseLimits[c]>0);
 if(!categories.length)return null;
 const highest=categories[categories.length-1];
 const reduced=baseLimits[highest]===1&&categories.length>1?categories[categories.length-2]:highest;
 const limits=Object.fromEntries([1,2,3,4].map(i=>[i,baseLimits[i]]));
 limits[reduced]=Math.max(0,limits[reduced]-1);
 return {status:'preview-not-granted',limits,reducedCategory:reduced,
  previousLimit:baseLimits[reduced],newLimit:limits[reduced],
  freeModificationCertified:false,applied:false,source:LIFE_EFFECT_SOURCE};
}
