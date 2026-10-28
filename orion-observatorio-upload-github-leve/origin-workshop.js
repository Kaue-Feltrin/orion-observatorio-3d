import './origin-workshop.css';
import {ORIGINS,SKILLS} from './origin-catalog.js';
import {INTERESTS,findOrigins,skillLabel,storyFor} from './origin-discovery.js';
import {CREATION_DRAFT_KEY} from './creation-state.js';
import {originIcon} from './origin-icons.js';
import {backgroundFor} from './origin-backgrounds.js';

const woodURL='/assets/workshop/walnut-v15.png';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const skillText=o=>o.fixedSkills.map(skillLabel).join(' · ');
const guideIcons={investigar:'INVESTIGADOR',cuidar:'AGENTE_SAUDE',criar:'INVENTOR',convencer:'DIPLOMATA',sobreviver:'EXPLORADOR',agir:'LUTADOR',paranormal:'JOVEM_MISTICO',discricao:'CRIMINOSO'};
let opening=null;
let materialReady=null;
export function prepareOriginWorkshop(){
 if(!materialReady){const image=new Image();image.src=woodURL;materialReady=image.decode().catch(()=>{});}
 return materialReady;
}

// One local paper view. It neither imports nor calls the rules engine/Worker.
export function openOriginWorkshop(draft,{onReturn=()=>{},onChoose=()=>{},reducedMotion=false}={}){
 if(opening)return opening;
 const previous=document.activeElement,stage=document.createElement('section');
 const state={query:'',interest:'',source:'',skill:'',selected:null,compared:[],confirmed:null};
 stage.className='paper-workshop';stage.setAttribute('aria-label','Ficha de criação: origem');
 stage.dataset.phase='preparing';
 stage.innerHTML=`<div class="workshop-mist" aria-hidden="true"></div><p class="paper-preparing" role="status">Materializando sua história…</p>
  <div class="workshop-planks" aria-hidden="true">${Array.from({length:6},(_,i)=>`<div class="workshop-plank" style="--plank:${i};--grain:${i*19}%"></div>`).join('')}</div>
  <div class="paper-scroll"><div class="paper-landing"><article class="physical-sheet" aria-labelledby="paperTitle" aria-busy="true">
   <div class="paper-content" inert>
    <header class="paper-header"><div class="paper-imprint"><span>ÓRION</span><small>Ficha do arauto · prévia</small></div><button class="paper-return ink-link" type="button">← Voltar à identidade</button></header>
    <div class="paper-chapter"><span>02 / ORIGEM</span></div>
    <h1 id="paperTitle" tabindex="-1">Toda história deixa marcas.</h1>
    <p class="paper-intro">Escolha o passado do seu arauto.</p>
    <div class="paper-identity"><div><span>Nome do arauto</span><strong class="paper-name"></strong></div><div><span>Origem</span><strong class="paper-chosen-name">Ainda por escrever</strong></div></div>
    <nav class="discovery-modes" aria-label="Como explorar as origens"><button type="button" data-mode="explore" aria-pressed="true">Explorar origens</button><button type="button" data-mode="guide" aria-pressed="false">Me ajude a escolher</button></nav>
    <section class="origin-guide" aria-label="Ajuda para escolher uma origem" hidden><h2>Que passado você imagina?</h2><p>Comece por uma ideia.</p><div>${INTERESTS.map(i=>`<button type="button" data-guide="${i.id}" aria-label="${i.prompt}" aria-pressed="false">${originIcon(guideIcons[i.id])}<strong>${i.label}</strong><span class="guide-check" aria-hidden="true">✓</span></button>`).join('')}</div></section>
    <section class="origin-tools" aria-label="Buscar e filtrar origens">
     <div class="paper-search"><label for="originSearch">Encontre uma história</label><div><span aria-hidden="true">⌕</span><input id="originSearch" type="search" placeholder="Nome, profissão ou perícia…" autocomplete="off" aria-controls="originResults"><button class="clear-search ink-link" type="button" aria-label="Limpar busca" hidden>×</button></div></div>
     <div class="interest-filters" role="group" aria-label="Filtrar por interesse"><button type="button" data-interest="" aria-pressed="true">Todas</button>${INTERESTS.map(i=>`<button type="button" data-interest="${i.id}" aria-pressed="false">${i.label}</button>`).join('')}</div>
     <details class="advanced-origins"><summary>Filtrar por livro e perícia</summary><div><label>Livro de origem<select id="originSource"><option value="">Todos os livros</option>${[...new Set(ORIGINS.map(o=>o.source))].map(s=>`<option>${s}</option>`).join('')}</select></label><label>Perícia associada<select id="originSkill"><option value="">Todas as perícias</option>${SKILLS.map(s=>`<option value="${s.code}">${s.label}</option>`).join('')}</select></label></div></details>
    </section>
    <section class="origin-filter-feedback" id="originFilters" aria-label="Filtros aplicados" hidden><span class="filter-seal" aria-hidden="true">✓</span><div><small>Filtro aplicado</small><strong class="filter-applied-label"></strong><p class="filter-result-count"></p></div><div class="filter-feedback-actions"><button type="button" class="change-interest ink-link">Trocar interesse</button><button type="button" class="reset-filters ink-link">Limpar filtros</button></div></section>
    <div class="origin-library"><section class="origin-index" aria-labelledby="originCount"><div class="index-heading"><h2 id="originCount" tabindex="-1"></h2></div><ol id="originResults"></ol><p class="origin-empty" hidden>Nenhuma origem com esses filtros. Tente outra palavra ou limpe os filtros.</p></section>
     <section class="origin-detail" id="originDetail" aria-labelledby="originDetailTitle"><div class="detail-placeholder"><span class="ink-star" aria-hidden="true">✧</span><h2 id="originDetailTitle">Seu passado começa aqui.</h2><small>Abra uma origem para ver um exemplo.</small></div></section></div>
    <footer class="paper-footer"><div><button class="open-comparison ink-link" type="button" disabled>Comparar origens (0/2)</button><p class="paper-status" role="status" aria-live="polite">Abra uma origem para começar.</p></div><span class="paper-page">ÓRION / 02</span></footer>
   </div>
  </article></div></div>
  <dialog class="origin-comparison" aria-labelledby="compareTitle"><header><div><small>Duas possibilidades para sua história</small><h2 id="compareTitle">Lado a lado</h2></div><button type="button" class="close-comparison ink-link" aria-label="Fechar comparação">×</button></header><div class="comparison-content"></div></dialog>`;
 document.body.append(stage);document.documentElement.dataset.paperActive='1';
 stage.querySelector('.paper-name').textContent=draft.name;
 const $=s=>stage.querySelector(s),status=$('.paper-status'),results=$('#originResults'),detail=$('#originDetail');
 const content=$('.paper-content'),sheet=$('.physical-sheet'),dialog=$('dialog');
 const emptyDetail=detail.innerHTML;
 let closed=false;
 function announce(text){status.textContent=text;}
 function compareLabel(){const b=$('.open-comparison');b.textContent=`Comparar origens (${state.compared.length}/2)`;b.disabled=state.compared.length!==2;}
 function rowSelection(){for(const b of results.querySelectorAll('[data-origin]')){b.setAttribute('aria-pressed',String(b.dataset.origin===state.selected));b.querySelector('.origin-row-arrow').textContent=b.dataset.origin===state.selected?'✓':'→';}}
 function renderResults(){
  const found=findOrigins(state);$('#originCount').textContent=`${found.length} ${found.length===1?'origem':'origens'}`;
  results.innerHTML=found.map(o=>`<li><button type="button" data-origin="${o.code}" aria-pressed="${o.code===state.selected}" aria-controls="originDetail"><span class="origin-row-symbol">${originIcon(o.code)}</span><strong>${escape(o.label)}</strong><span class="origin-row-arrow" aria-hidden="true">${o.code===state.selected?'✓':'→'}</span></button></li>`).join('');
  $('.origin-empty').hidden=found.length>0;$('.reset-filters').hidden=!(state.query||state.interest||state.source||state.skill);$('.clear-search').hidden=!state.query;
  for(const b of stage.querySelectorAll('[data-interest]'))b.setAttribute('aria-pressed',String(b.dataset.interest===state.interest));
  for(const b of stage.querySelectorAll('[data-guide]'))b.setAttribute('aria-pressed',String(b.dataset.guide===state.interest));
  const labels=[INTERESTS.find(i=>i.id===state.interest)?.label,state.query?`Busca: ${state.query}`:'',state.source,state.skill?skillLabel(state.skill):''].filter(Boolean);
  $('#originFilters').hidden=!labels.length;$('.filter-applied-label').textContent=labels.join(' · ');$('.filter-result-count').textContent=`${found.length} ${found.length===1?'origem para explorar':'origens para explorar'}`;$('.change-interest').hidden=!state.interest;
  announce(`${found.length} ${found.length===1?'origem encontrada':'origens encontradas'}.${state.selected?' A origem aberta continua disponível para revisão.':''}`);
 }
 function renderDetail(){
  const o=ORIGINS.find(o=>o.code===state.selected);if(!o){detail.innerHTML=emptyDetail;return;}
  detail.innerHTML=`<div class="detail-overline"><button class="back-to-index ink-link" type="button">↑ Voltar à lista</button></div><div class="origin-heading"><div class="origin-portrait">${originIcon(o.code)}</div><h2 id="originDetailTitle" tabindex="-1">${escape(o.label)}</h2></div><section class="origin-example" aria-label="Exemplo de passado"><span>Por exemplo…</span><p>${escape(backgroundFor(o))}</p></section><dl class="origin-facts"><div><dt>Perícias</dt><dd><ul class="origin-skill-chips">${o.fixedSkills.map(s=>`<li>${escape(skillLabel(s))}</li>`).join('')}${o.variableSkillCount?`<li>+${o.variableSkillCount} à escolha</li>`:''}</ul></dd></div><div><dt>Habilidade</dt><dd>${escape(o.powerName)}</dd></div></dl>${o.professionRequired?'<p class="origin-choice-note">Exige uma especialidade de Profissão.</p>':''}<details class="origin-more"><summary>Ver contexto e fonte</summary><p class="origin-story">${escape(storyFor(o))}</p><p class="origin-book">${escape(o.source)}</p><small>O exemplo é só uma inspiração para sua história.</small></details><div class="origin-detail-actions"><button type="button" class="choose-origin ink-primary" ${state.confirmed===o.code?'disabled':''}>${state.confirmed===o.code?'✓ Origem escolhida':'Escolher esta origem'}<span aria-hidden="true">→</span></button><button type="button" class="compare-origin ink-link" aria-pressed="${state.compared.includes(o.code)}">${state.compared.includes(o.code)?'− Retirar da comparação':'+ Comparar esta origem'}</button></div>`;
  $('.choose-origin').addEventListener('click',()=>{
   const value={...draft,step:'origin',origin:{code:o.code,label:o.label,source:o.source}};
   try{sessionStorage.setItem(CREATION_DRAFT_KEY,JSON.stringify(value));state.confirmed=o.code;$('.paper-chosen-name').textContent=o.label;renderDetail();announce(`${o.label} é a origem de ${draft.name}. Você pode explorar e trocar antes da próxima etapa.`);onChoose(value);stage.dispatchEvent(new CustomEvent('orion:origin-chosen',{detail:value,bubbles:true}));}
   catch{announce('Não foi possível guardar esta escolha. Você pode continuar explorando e tentar novamente.');}
  });
  $('.compare-origin').addEventListener('click',()=>{
   if(state.compared.includes(o.code))state.compared=state.compared.filter(code=>code!==o.code);
   else if(state.compared.length<2)state.compared.push(o.code);
   else{announce('Há duas origens na comparação. Retire uma delas para adicionar outra.');return;}
   compareLabel();renderDetail();$('.compare-origin').focus({preventScroll:true});announce(state.compared.length===2?'Duas origens separadas. Abra a comparação no fim da folha.':`${state.compared.length} origem na comparação.`);
  });
  $('.back-to-index').addEventListener('click',()=>{results.querySelector(`[data-origin="${o.code}"]`)?.focus();});
 }
 results.addEventListener('click',e=>{const b=e.target.closest('[data-origin]');if(!b)return;state.selected=b.dataset.origin;rowSelection();renderDetail();announce(`${ORIGINS.find(o=>o.code===state.selected).label} aberta. Confira os detalhes antes de escolher.`);if(matchMedia('(max-width: 760px)').matches){$('#originDetailTitle').focus({preventScroll:true});detail.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});}});
 $('#originSearch').addEventListener('input',e=>{state.query=e.target.value;renderResults();});
 $('.clear-search').addEventListener('click',()=>{state.query='';$('#originSearch').value='';renderResults();$('#originSearch').focus();});
 function filterInterest(value){state.interest=value;renderResults();}
 function showGuide(show){for(const b of stage.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String((b.dataset.mode==='guide')===show));$('.origin-guide').hidden=!show;$('.origin-tools').hidden=show;$('.origin-library').hidden=show;$('#originFilters').hidden=show||!(state.query||state.interest||state.source||state.skill);}
 function showResults(){const target=$('#originFilters').hidden?$('.origin-library'):$('#originFilters');target.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});$('#originCount').focus({preventScroll:true});}
 for(const b of stage.querySelectorAll('[data-interest]'))b.addEventListener('click',()=>filterInterest(b.dataset.interest));
 for(const b of stage.querySelectorAll('[data-guide]'))b.addEventListener('click',()=>{Object.assign(state,{query:'',source:'',skill:'',selected:null});$('#originSearch').value='';$('#originSource').value='';$('#originSkill').value='';filterInterest(b.dataset.guide);renderDetail();showGuide(false);showResults();announce(`${INTERESTS.find(i=>i.id===state.interest).label}: filtro aplicado. ${findOrigins(state).length} origens para explorar.`);});
 for(const b of stage.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>showGuide(b.dataset.mode==='guide'));
 $('.change-interest').addEventListener('click',()=>{showGuide(true);$('.origin-guide').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});stage.querySelector(`[data-guide="${state.interest}"]`)?.focus({preventScroll:true});});
 $('#originSource').addEventListener('change',e=>{state.source=e.target.value;renderResults();});
 $('#originSkill').addEventListener('change',e=>{state.skill=e.target.value;renderResults();});
 $('.reset-filters').addEventListener('click',()=>{Object.assign(state,{query:'',interest:'',source:'',skill:''});$('#originSearch').value='';$('#originSource').value='';$('#originSkill').value='';renderResults();showResults();});
 $('.open-comparison').addEventListener('click',()=>{
  $('.comparison-content').innerHTML=state.compared.map(code=>{const o=ORIGINS.find(o=>o.code===code);return `<section><div class="comparison-origin-heading">${originIcon(o.code)}<h3>${escape(o.label)}</h3></div><p class="comparison-background">${escape(backgroundFor(o))}</p><dl><dt>Perícias</dt><dd>${escape(skillText(o))}</dd><dt>Habilidade</dt><dd>${escape(o.powerName)}</dd><dt>Livro</dt><dd>${escape(o.source)}</dd></dl><button type="button" class="ink-link" data-remove-compare="${o.code}">Retirar da comparação</button></section>`}).join('');dialog.showModal();
 });
 $('.comparison-content').addEventListener('click',e=>{const b=e.target.closest('[data-remove-compare]');if(!b)return;state.compared=state.compared.filter(c=>c!==b.dataset.removeCompare);compareLabel();renderDetail();dialog.close();announce('Origem retirada da comparação.');});
 $('.close-comparison').addEventListener('click',()=>dialog.close());
 $('.paper-return').addEventListener('click',()=>{closed=true;stage.remove();delete document.documentElement.dataset.paperActive;delete document.documentElement.dataset.paperReady;opening=null;onReturn();previous?.focus({preventScroll:true});});
 // Restoring a previously confirmed local origin never creates a new grant.
 if(draft.origin&&ORIGINS.some(o=>o.code===draft.origin.code)){state.selected=state.confirmed=draft.origin.code;$('.paper-chosen-name').textContent=ORIGINS.find(o=>o.code===state.selected).label;renderDetail();}
 renderResults();
 opening=(async()=>{
  await prepareOriginWorkshop();if(closed)return;
  stage.dataset.phase='landing';
  $('.paper-preparing').textContent='';
  const planks=[...stage.querySelectorAll('.workshop-plank')];
  if(!reducedMotion){
   await Promise.all(planks.map((plank,i)=>plank.animate([{transform:`translate3d(${i%2?3:-3}%, -115vh, 180px) rotateX(28deg) rotateZ(${i%2?3:-3}deg)`,opacity:.3},{transform:'translate3d(0, 3px, 0) rotateX(0) rotateZ(0)',opacity:1,offset:.86},{transform:'none',opacity:1}],{duration:650,delay:i*95,easing:'cubic-bezier(.24,.66,.32,1)',fill:'both'}).finished));
  }
  if(closed)return;
  stage.dataset.phase='paper';
  const leaf=$('.paper-landing');
  await leaf.animate(reducedMotion?[{opacity:0},{opacity:1}]:[{transform:'translate3d(0,-105vh,120px) rotateX(14deg) rotateZ(-6deg) scale(1.04)',opacity:0},{opacity:1,offset:.13},{transform:'translate3d(0,5px,0) rotateX(0) rotateZ(.35deg)',opacity:1,offset:.87},{transform:'none',opacity:1}],{duration:reducedMotion?120:860,easing:'cubic-bezier(.22,.68,.30,1)',fill:'both'}).finished;
  if(closed)return;
  stage.dataset.phase='ready';content.inert=false;sheet.setAttribute('aria-busy','false');document.documentElement.dataset.paperReady='1';$('#paperTitle').focus({preventScroll:true});
 })().catch(error=>{stage.remove();opening=null;delete document.documentElement.dataset.paperActive;delete document.documentElement.dataset.paperReady;throw error;});
 return opening;
}
