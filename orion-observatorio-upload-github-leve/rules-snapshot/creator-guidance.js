/* Órion Fichas · opções de criação, importadas do criador antigo.
 * Estado de RASCUNHO; não substitui validação canônica de progressão/Staff.
 * Sem I/O, sem banco/Cloudflare, sem geração de bônus condicionais.
 */
(function(root){
 'use strict';
 const APPROVED=new Set(['ENGENHEIRO','MERGULHADOR','UNIVERSITARIO','VITIMA','INVESTIGADOR','SERVIDOR_PUBLICO','TRABALHADOR_RURAL','TEORICO_CONSPIRACAO','ACADEMICO','AGENTE_SAUDE','ARTISTA','ATLETA','ACALENTADOR','ATIRADOR_EXIMIO','BOMBADO','BOTICARIO','LINHA_FRENTE','MOCHILEIRO_ORIGEM','PLAYER','PROFETA','VETERINARIO','EXORCIZADO','BODYBUILDER','LUTADOR']);
 const SLOTS={primary:['LUTA','PONTARIA'],resistance:['FORTITUDE','REFLEXOS']};
 function originByValue(value,catalog){return catalog.origins.find(o=>o.label===value||o.code===value)||null}
 function skillByValue(value,catalog){return catalog.skills.find(s=>s.label===value||s.code===value)||null}
 function trained(row){const grade=String(row?.training??row?.rank??row?.degree??row?.level??'').trim().toLowerCase();return ['treinado','veterano','expert'].includes(grade)||row?.trained===true&&grade!=='destreinado';}
 // O Worker já aceita objetos ou JSON serializado em rascunhos. O resumo
 // do criador deve ler ambos sem mutar a ficha nem presumir concessões.
 function parseSnapshot(value){
  if(typeof value!=='string')return value;
  try{return JSON.parse(value)}catch{return null}
 }
 function trainingRows(character){
  const rows=parseSnapshot(character?.skills_json);
  return Array.isArray(rows)?rows:[];
 }
 function intellectValue(character){
  const values=parseSnapshot(character?.attributes_json);
  return values&&typeof values==='object'&&!Array.isArray(values)?values.INT:undefined;
 }
 function classFixed(code){return code==='OCULTISTA'?['OCULTISMO','VONTADE']:[]}
 function freeBudget(classCode,intelecto){
  const int=Number.isInteger(intelecto)&&intelecto>=0?intelecto:0;
  return (classCode==='COMBATENTE'?1:classCode==='ESPECIALISTA'?7:3)+int;
 }
 function plan(character,catalog){
  const origin=originByValue(character.origin,catalog),skillRows=trainingRows(character);
  const originCodes=new Set(origin?.fixedSkills||[]);
  const originLabels=new Set([...originCodes].map(x=>skillByValue(x,catalog)?.label||x));
  const isVerifiedOrigin=Boolean(origin&&APPROVED.has(origin.code));
  const countedOriginLabels=isVerifiedOrigin?originLabels:new Set();
  const classCodes=classFixed(character.class_code);
  const roleRows=skillRows.filter(x=>['primary','resistance'].includes(x?.classRole));
  if(character.class_code==='COMBATENTE')for(const role of ['primary','resistance']){
   const row=roleRows.find(x=>x.classRole===role),def=skillByValue(row?.name,catalog);
   if(def&&SLOTS[role].includes(def.code))classCodes.push(def.code);
  }
  const classLabels=new Set(classCodes.map(x=>skillByValue(x,catalog)?.label||x));
  const duplicates=classCodes.filter(x=>isVerifiedOrigin&&originCodes.has(x)).length;
  const selected=skillRows.filter(x=>x&&x.name&&trained(x)&&!countedOriginLabels.has(x.name)&&!classLabels.has(x.name)).length;
  const budget=freeBudget(character.class_code,intellectValue(character))+duplicates;
  const missingCombat=character.class_code==='COMBATENTE'?['primary','resistance'].filter(role=>!roleRows.some(x=>x.classRole===role)):[];
  return {origin,originVerified:isVerifiedOrigin,originLabels:[...originLabels],
   classLabels:[...classLabels],budget,selected,remaining:budget-selected,
   missingCombat,duplicates,overBudget:selected>budget,manualOnly:!origin||!APPROVED.has(origin.code)};
 }
 /** Leitura da criação; nunca concede, remove ou grava perícias. */
 function trainingOverview(character,catalog){
  const summary=plan(character,catalog);
  const rows=trainingRows(character);
  const listed=(code)=>{
   const skill=skillByValue(code,catalog);
   const name=skill?.label||code;
   const row=rows.find(x=>x?.name===name||x?.name===code);
   return {code,name,attribute:skill?.attribute||'',present:!!row&&trained(row),
    source:row?.source||'',classRole:row?.classRole||''};
  };
  const originSkills=(summary.origin?.fixedSkills||[]).map(listed);
  const classSkills=summary.classLabels.map(name=>{
   const skill=skillByValue(name,catalog);
   return listed(skill?.code||name);
  });
  const fixed=new Set([...summary.classLabels,...(summary.originVerified?summary.originLabels:[])]);
  const free=rows.filter(x=>x?.name&&trained(x)&&!fixed.has(x.name))
   .map(x=>({name:x.name,source:x.source||''}));
  const pending=[];
  if(!summary.origin)pending.push('Escolha uma origem para conhecer suas perícias fixas.');
  else if(!summary.originVerified)pending.push('Treinamentos e habilidade desta origem ainda não homologados; nenhuma concessão de origem é presumida.');
  if(summary.origin?.professionRequired)pending.push('Especialização de Profissão exige configuração e revisão.');
  if(summary.origin?.variableSkillCount)pending.push('Perícia variável da origem aguarda configuração homologada.');
  if(summary.missingCombat.length)pending.push('Combatente precisa definir as perícias de combate e resistência.');
  if(summary.overBudget)pending.push('Escolhas livres acima do orçamento atual; revise antes da ativação.');
  return {...summary,originSkills,classSkills,free,pending};
 }
 function syncGrants(character,catalog){
  const origin=originByValue(character.origin,catalog),effective=origin&&APPROVED.has(origin.code)?origin:null;
  const rows=Array.isArray(character.skills_json)?character.skills_json.map(x=>({...x})):[];
  const activeSrc=effective?'auto-origin:'+effective.code:null;
  // Remover APENAS linhas criadas automaticamente com proveniência antiga.
  const result=rows.filter(x=>!String(x.source||'').startsWith('auto-origin:')||x.source===activeSrc);
  const fixed=character.class_code==='OCULTISTA'?classFixed('OCULTISTA'):[];
  const classResult=result.filter(x=>
   (x.source!=='auto-class:occultist'||character.class_code==='OCULTISTA')&&
   (x.source!=='auto-class:combatant'||character.class_code==='COMBATENTE'));
  if(character.class_code!=='COMBATENTE')for(const row of classResult)if(row.classRole)delete row.classRole;
  // Papel da perícia de classe continua selecionado mesmo se a origem antiga for removida.
  if(character.class_code==='COMBATENTE')for(const role of ['primary','resistance']){
   const previous=rows.find(x=>x.classRole===role);
   if(!previous||classResult.some(x=>x.classRole===role))continue;
   const skill=skillByValue(previous.name,catalog);
   if(!skill||!SLOTS[role].includes(skill.code))continue;
   const current=classResult.find(x=>x.name===skill.label);
   if(current)current.classRole=role;
   else classResult.push({name:skill.label,attribute:skill.attribute,training:'treinado',bonus:'',source:'auto-class:combatant',classRole:role});
  }
  if(effective)for(const code of effective.fixedSkills){
   const skill=skillByValue(code,catalog);if(!skill||classResult.some(x=>x.name===skill.label))continue;
   classResult.push({name:skill.label,attribute:skill.attribute,training:'treinado',bonus:'',source:activeSrc});
  }
  for(const code of fixed){
   const skill=skillByValue(code,catalog);if(!skill||classResult.some(x=>x.name===skill.label))continue;
   classResult.push({name:skill.label,attribute:skill.attribute,training:'treinado',bonus:'',source:'auto-class:occultist'});
  }
  return classResult;
 }
 function combatChoice(character,role,code,catalog){
  if(character.class_code!=='COMBATENTE'||!Object.hasOwn(SLOTS,role)||!SLOTS[role].includes(code))return null;
  const skill=skillByValue(code,catalog);if(!skill)return null;
  const rows=(Array.isArray(character.skills_json)?character.skills_json:[]).map(x=>({...x}));
  const cleaned=rows.filter(x=>!(x.classRole===role&&x.source==='auto-class:combatant'));
  for(const row of cleaned)if(row.classRole===role)delete row.classRole;
  const existing=cleaned.find(x=>x.name===skill.label);
  if(existing){existing.classRole=role;}
  else cleaned.push({name:skill.label,attribute:skill.attribute,training:'treinado',bonus:'',source:'auto-class:combatant',classRole:role});
  return cleaned;
 }
 root.OrionCreatorGuidance=Object.freeze({plan,trainingOverview,syncGrants,combatChoice,originByValue,skillByValue,APPROVED_CODES:Object.freeze([...APPROVED])});
})(typeof window!=='undefined'?window:globalThis);
