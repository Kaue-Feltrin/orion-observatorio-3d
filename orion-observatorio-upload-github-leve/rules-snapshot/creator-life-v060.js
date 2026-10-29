/* Órion Fichas v0.6.0 · subescolhas etárias, contrato de intenção privada.
 * Não concede efeitos, não altera atributos/perícias/poderes nem substitui validação do Worker.
 * Fontes: Suplemento Órion v1.9.3.1 pp.15-17; Livro Base v1.3 p.173 (apenas remissões).
 */
(function(root){
 'use strict';
 const VERSION=1,FIELD='creatorLifeV1';
 const GROUPS=Object.freeze({PRODIGIO:[16,17],JOVEM:[18,24],ADULTO:[25,44],MADURO:[45,64],IDOSO:[65,null]});
 const LIMITED=Object.freeze(['FOR','INT','PRE','VIG']);
 const TRAITS=Object.freeze([
  {code:'JUNIOR',label:'Júnior',summary:'Uma categoria de item tem limite reduzido; permite uma modificação gratuita em um item.',source:'Suplemento p.15'},
  {code:'PIVETE',label:'Pivete',summary:'+2 Furtividade e Defesa, +2 resistência, −2 manobras; efeitos dependem da homologação.',source:'Suplemento p.15'},
  {code:'REBELDE',label:'Rebelde',summary:'+1d20 Vontade e +5 contra controle/aprisionamento; restrições de ajuda.',source:'Suplemento p.15'}
 ]);
 const DISADVANTAGES=Object.freeze([
  {code:'DEFINHAMENTO_MUSCULAR',label:'Definhamento Muscular',source:'Suplemento p.16',detail:'−5 Luta e Atletismo; perder 2 PV ao falhar em FOR ou VIG'},
  {code:'DEVAGAR_JOVEM',label:'“Devagar meu jovem”',source:'Livro Base p.173, por remissão do Suplemento',detail:'Deslocamento −3m; sem investida'},
  {code:'DISTRAIDO',label:'Distraí... eita que bichinho bonito',source:'Suplemento p.16',detail:'Surpreendido na 1ª rodada; chance de perder primeira ação social/investigação'},
  {code:'TOSSE',label:'Eu tô- cof, cof - bem',source:'Suplemento p.16',detail:'Tosse em interação/combate, com rolagem de 1d6'},
  {code:'FRAGIL',label:'Frágil',source:'Livro Base p.173, por remissão do Suplemento',detail:'Perde 2 PV por NEX — observar conversão vigente Órion'},
  {code:'GOTA',label:'Gota',source:'Livro Base p.173, por remissão do Suplemento',detail:'Dano 1d6 em testes de AGI ou Esquiva'},
  {code:'MELANCOLICO',label:'Melancólico',source:'Livro Base p.173, por remissão do Suplemento',detail:'Perde 1 PE por NEX — observar conversão vigente Órion'},
  {code:'NA_MINHA_EPOCA',label:'“Na Minha Época!”',source:'Suplemento p.17',detail:'−5 Atualidades/Tecnologia; mais dano de Presença Perturbadora'},
  {code:'OSSOS_DE_VETERANO',label:'Ossos de Veterano',source:'Suplemento p.17',detail:'−5 Acrobacia/Reflexos e redução do bônus de Esquiva'},
  {code:'PESSIMO_PARCEIRO',label:'Péssimo Parceiro de Viagem',source:'Suplemento p.17',detail:'Uma ação de interlúdio; qualidade de descanso menor'},
  {code:'PULMAO_RUIM',label:'Pulmão Ruim',source:'Livro Base p.173, por remissão do Suplemento',detail:'Dano em testes de Força; limita respiração e investidas'},
  {code:'RECURVADO',label:'Recurvado',source:'Livro Base p.173, por remissão do Suplemento',detail:'Considerado Pequeno, sem bônus de Furtividade'},
  {code:'SISTEMA_IMUNOLOGICO',label:'Sistema Imuno- Aaa-tchim! ...lógico',source:'Suplemento p.17',detail:'−5 Fortitude; doenças iniciam em estágio II'},
  {code:'TEIMOSO',label:'Teimoso',source:'Suplemento p.17',detail:'Não recebe ajuda nem bônus de habilidades não paranormais de aliados'},
  {code:'TODOS_ME_ODIAVAM',label:'“Todos Me Odiavam”',source:'Suplemento p.17',detail:'−5 Diplomacia/Enganação; atitudes de NPCs reduzidas'},
  {code:'VISAO_PREJUDICADA',label:'Visão prejudicada',source:'Suplemento p.17',detail:'−5 Percepção/Pontaria; não recebe benefício de mirar'}
 ]);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const obj=o=>o&&typeof o==='object'&&!Array.isArray(o)?o:{};
 function stage(age){const n=Number(age);if(!Number.isInteger(n)||n<16)return null;return n<=17?'PRODIGIO':n<=24?'JOVEM':n<=44?'ADULTO':n<=64?'MADURO':'IDOSO';}
 function read(ch){let n=ch?.narrative_json||{};if(typeof n==='string'){try{n=JSON.parse(n)}catch{n={}}}const c=obj(obj(n)[FIELD]);return {version:VERSION,byStage:obj(c.byStage)};}
 function selected(ch){const c=read(ch),s=stage(ch?.age);return {stage:s,choices:obj(c.byStage[s]),byStage:c.byStage};}
 const uniq=(items,allowed)=>Array.isArray(items)?[...new Set(items.filter(v=>typeof v==='string'&&allowed.includes(v)))]:[];
 function powerOptions(ch){const cat=root.OrionAdvancedCatalog?.powers||[];const kind=ch?.class_code;return cat.filter(p=>p?.code&&p?.label&&(!p.minLevel||p.minLevel<=1)&&p.category===kind).map(p=>({code:p.code,label:p.label,category:p.category}));}
 function trainedOptions(ch){let rows=ch?.skills_json||[];if(typeof rows==='string'){try{rows=JSON.parse(rows)}catch{rows=[]}}
  return Array.isArray(rows)?[...new Set(rows.filter(r=>r?.name&&['treinado','veterano','expert'].includes(String(r.training).toLowerCase())).map(r=>r.name))].sort((a,b)=>a.localeCompare(b,'pt-BR')):[];
 }
 function update(ch,key,value){const s=stage(ch?.age);if(!s)throw Error('invalid_age');const c=read(ch),prev=obj(c.byStage[s]);const next={...prev};
  if(s==='PRODIGIO'&&key==='limitedAttributes')next[key]=uniq(value,LIMITED).slice(0,2);
  else if(s==='PRODIGIO'&&key==='prematureTrait')next[key]=TRAITS.some(t=>t.code===value)?value:null;
  else if(['ADULTO','MADURO','IDOSO'].includes(s)&&key==='disadvantages')next[key]=uniq(value,DISADVANTAGES.map(d=>d.code)).slice(0,s==='ADULTO'?1:s==='MADURO'?2:3);
  else if(['ADULTO','MADURO','IDOSO'].includes(s)&&key==='vivenciaPower')next[key]=powerOptions(ch).some(p=>p.code===value)?value:null;
  else if(s==='MADURO'&&key==='experienceMode')next[key]=['TRAINED','GRADE'].includes(value)?value:null;
  else if(s==='IDOSO'&&key==='experienceMode')next[key]=['TWO_TRAINED','TWO_GRADES','MIXED'].includes(value)?value:null;
  else if(['MADURO','IDOSO'].includes(s)&&['experienceSkills','masterSkill'].includes(key)){
   const names=trainedOptions(ch);if(key==='masterSkill')next[key]=names.includes(value)&&!['Luta','Pontaria'].includes(value)?value:null;
   else next[key]=uniq(value,root.OrionCatalog?.skills?.map(x=>x.label)||[]).slice(0,2);
  }else throw Error('invalid_life_choice');
  return {version:VERSION,byStage:{...c.byStage,[s]:next}};
 }
 function check(ch){const {stage:s,choices:c}=selected(ch),issues=[];
  if(!s)return {stage:s,complete:false,issues:['Idade inválida.'],choices:c};
  if(s==='PRODIGIO'){
   if(uniq(c.limitedAttributes,LIMITED).length!==2)issues.push('Selecione exatamente dois atributos com limite 2.');
   if(!TRAITS.some(x=>x.code===c.prematureTrait))issues.push('Escolha um traço Agente Prematuro.');
   let attrs=ch?.attributes_json||{};if(typeof attrs==='string'){try{attrs=JSON.parse(attrs)}catch{attrs={}}}
   for(const key of uniq(c.limitedAttributes,LIMITED))if(Number(obj(attrs)[key])>2)issues.push(key+' está acima do teto 2 selecionado.');
  }
  if(['ADULTO','MADURO','IDOSO'].includes(s)){
   const n=s==='ADULTO'?1:s==='MADURO'?2:3;
   if(uniq(c.disadvantages,DISADVANTAGES.map(x=>x.code)).length!==n)issues.push('Selecione '+n+' desvantagem(ns) de idade diferentes.');
   if(!powerOptions(ch).some(p=>p.code===c.vivenciaPower))issues.push('Escolha uma referência de poder para Vivência; os pré-requisitos serão conferidos pela Staff.');
  }
  if(s==='MADURO'){
   if(!['TRAINED','GRADE'].includes(c.experienceMode))issues.push('Escolha a modalidade de Anos de Experiência.');
   if(!trainedOptions(ch).filter(n=>!['Luta','Pontaria'].includes(n)).includes(c.masterSkill))issues.push('Mestre na Área exige uma perícia treinada, exceto Luta e Pontaria.');
   if(uniq(c.experienceSkills,root.OrionCatalog?.skills?.map(x=>x.label)||[]).length!==1)issues.push('Escolha a perícia-alvo de Anos de Experiência.');
  }
  if(s==='IDOSO'){
   if(!['TWO_TRAINED','TWO_GRADES','MIXED'].includes(c.experienceMode))issues.push('Escolha a modalidade de Décadas de Experiência.');
   if(uniq(c.experienceSkills,root.OrionCatalog?.skills?.map(x=>x.label)||[]).length!==2)issues.push('Selecione duas perícias-alvo de Décadas de Experiência.');
  }
  return {stage:s,complete:issues.length===0,issues,choices:c};
 }
 function attributesCompatible(ch,values){const c=selected(ch);if(c.stage!=='PRODIGIO')return {valid:true,issues:[]};const issues=[];
  if(uniq(c.choices.limitedAttributes,LIMITED).length!==2)issues.push('Escolha antes os dois atributos limitados em Estágio da vida.');
  for(const key of uniq(c.choices.limitedAttributes,LIMITED))if(Number(obj(values)[key])>2)issues.push(key+' precisa ser no máximo 2 para Prodígio.');
  return {valid:!issues.length,issues};
 }
 function render(ch){const {stage:s,choices:c}=selected(ch),status=check(ch),parts=[];
  if(!s)return '<p class="orion-life-warning">Informe uma idade válida para configurar as escolhas.</p>';
  const heading=(h,desc)=>'<div class="orion-life-block-heading"><h4>'+esc(h)+'</h4><p>'+esc(desc)+'</p></div>';
  const toggles=(field,opts,selectedValues,max)=>'<div class="orion-life-options" role="group" aria-label="'+esc(field)+'">'+opts.map(x=>'<button type="button" class="orion-life-option '+(selectedValues.includes(x.code)?'selected':'')+'" data-life-toggle="'+esc(field)+'" data-code="'+esc(x.code)+'" aria-pressed="'+(selectedValues.includes(x.code)?'true':'false')+'"><strong>'+esc(x.label)+'</strong><small>'+esc(x.summary||x.detail||x.source||'')+'</small></button>').join('')+'</div><small class="orion-life-count">'+selectedValues.length+' / '+max+' selecionados</small>';
  const select=(field,label,options,current)=>'<label class="orion-life-select">'+esc(label)+'<select data-life-select="'+esc(field)+'"><option value="">Selecione uma opção...</option>'+options.map(o=>'<option value="'+esc(o.code)+'" '+(o.code===current?'selected':'')+'>'+esc(o.label)+'</option>').join('')+'</select></label>';
  if(s==='PRODIGIO'){
   parts.push(heading('Corpo em formação','Selecione dois atributos que terão teto de 2 pontos no momento da criação.'));
   parts.push(toggles('limitedAttributes',LIMITED.map(code=>({code,label:code,summary:'Máximo 2 na criação'})),c.limitedAttributes||[],2));
   parts.push(heading('Agente Prematuro','Escolha exatamente um traço juvenil. Os efeitos especiais ainda não são aplicados pelo criador.'));
   parts.push(select('prematureTrait','Traço juvenil',TRAITS,c.prematureTrait));
   const trait=TRAITS.find(t=>t.code===c.prematureTrait);if(trait)parts.push('<p class="orion-life-reference">'+esc(trait.summary)+' · '+esc(trait.source)+'</p>');
   parts.push('<p class="orion-life-reference">Benefício fixo: Jovem Imparável (+1 PE por nível; +1 limite de PE/turno) — efeitos derivados somente pelo motor homologado.</p>');
  }
  if(s==='JOVEM')parts.push('<p class="orion-life-reference">Jovem não exige subescolhas e não recebe vantagens ou penalidades etárias.</p>');
  if(['ADULTO','MADURO','IDOSO'].includes(s)){
   const num=s==='ADULTO'?1:s==='MADURO'?2:3;
   parts.push(heading('Peso da Idade','Escolha '+num+' desvantagem(ns) sem repetição. O texto é referência de regra; nenhum efeito é concedido aqui.'));
   parts.push(toggles('disadvantages',DISADVANTAGES,c.disadvantages||[],num));
   parts.push(heading('Vivência','Escolha um poder como intenção de aquisição. A elegibilidade e os pré-requisitos ainda exigem validação oficial.'));
   parts.push(select('vivenciaPower','Poder de classe (referência)',powerOptions(ch),c.vivenciaPower));
  }
  if(['MADURO','IDOSO'].includes(s)){
   const modes=s==='MADURO'?[{code:'TRAINED',label:'Uma perícia treinada adicional'},{code:'GRADE',label:'Um grau de treinamento adicional (benefício futuro)'}]:[
    {code:'TWO_TRAINED',label:'Duas perícias treinadas adicionais'},{code:'TWO_GRADES',label:'Dois graus adicionais (benefícios futuros)'},{code:'MIXED',label:'Uma perícia treinada e um grau adicional'}];
   parts.push(heading(s==='MADURO'?'Anos de Experiência':'Décadas de Experiência','Escolha modalidade e perícias-alvo. Benefícios transitórios e grau futuro permanecem aguardando homologação.'));
   parts.push(select('experienceMode','Modalidade',modes,c.experienceMode));
   const options=(root.OrionCatalog?.skills||[]).map(x=>({code:x.label,label:x.label}));
   parts.push(toggles('experienceSkills',options,c.experienceSkills||[],s==='MADURO'?1:2));
   if(s==='MADURO'){
    parts.push(heading('Mestre na Área','Selecione uma perícia já treinada; Luta e Pontaria não são elegíveis.'));
    parts.push(select('masterSkill','Perícia dominada',trainedOptions(ch).filter(n=>!['Luta','Pontaria'].includes(n)).map(n=>({code:n,label:n})),c.masterSkill));
   }else parts.push('<p class="orion-life-reference">Decrepitude e Inabalável são benefícios/limitações fixos do Idoso. Não são aplicados antecipadamente neste formulário.</p>');
  }
  return '<section class="orion-life-choices" aria-label="Configuração etária da ficha"><div class="orion-life-head"><div><p class="orion-v6-eyebrow">CONTRATO DE ESCOLHAS · v1</p><h3>Decisões da faixa etária</h3></div><span class="orion-life-state">'+(status.complete?'Escolhas registradas':'Rascunho incompleto')+'</span></div>'+parts.join('')+
   (status.issues.length?'<ul class="orion-life-issues">'+status.issues.map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul>':'')+
   '<p class="orion-life-disclaimer">Registro privado com CAS. Ao mudar a idade, as escolhas antigas ficam guardadas por faixa, mas não se aplicam à nova. Esta etapa registra intenções; a validação dos efeitos mecânicos pelo Worker e a aprovação da Staff continuam pendentes.</p></section>';
 }
 root.OrionCreatorLife=Object.freeze({VERSION,FIELD,GROUPS,LIMITED,TRAITS,DISADVANTAGES,stage,read,selected,update,check,attributesCompatible,powerOptions,trainedOptions,render});
})(typeof window!=='undefined'?window:globalThis);
