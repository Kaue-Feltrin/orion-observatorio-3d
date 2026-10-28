import './origin-workshop.css';
import {ORIGINS,SKILLS} from './origin-catalog.js';
import {INTERESTS,findOrigins,interestsFor,skillLabel,storyFor} from './origin-discovery.js';
import {CREATION_DRAFT_KEY} from './creation-state.js';
import {originIcon} from './origin-icons.js';

const woodURL='/assets/workshop/walnut-v15.png';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const skillText=o=>o.fixedSkills.map(skillLabel).join(' · ');
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
    <div class="paper-chapter"><span>02 / ORIGEM</span><span>Uma vida antes do inexplicável</span></div>
    <h1 id="paperTitle" tabindex="-1">Toda história deixa marcas.</h1>
    <p class="paper-intro">Antes do paranormal, havia uma vida. Quem você era?</p>
    <div class="paper-identity"><div><span>Nome do arauto</span><strong class="paper-name"></strong></div><div><span>Origem</span><strong class="paper-chosen-name">Ainda por escrever</strong></div></div>
    <nav class="discovery-modes" aria-label="Como explorar as origens"><button type="button" data-mode="explore" aria-pressed="true">Explorar origens</button><button type="button" data-mode="guide" aria-pressed="false">Me ajude a escolher</button></nav>
    <section class="origin-guide" aria-label="Ajuda para escolher uma origem" hidden><h2>Que tipo de passado você imagina?</h2><p>Origem é sua vida anterior. Comece por um interesse; esses interesses não escolhem sua classe.</p><div>${INTERESTS.map(i=>`<button type="button" data-guide="${i.id}">${i.prompt}<span aria-hidden="true">→</span></button>`).join('')}</div></section>
    <section class="origin-tools" aria-label="Buscar e filtrar origens">
     <div class="paper-search"><label for="originSearch">Encontre uma história</label><div><span aria-hidden="true">⌕</span><input id="originSearch" type="search" placeholder="Nome, perícia ou ideia…" autocomplete="off" aria-controls="originResults"><button class="clear-search ink-link" type="button" aria-label="Limpar busca" hidden>×</button></div><small>Experimente “médico”, “tecnologia” ou “pistas”.</small></div>
     <div class="interest-filters" role="group" aria-label="Filtrar por interesse"><button type="button" data-interest="" aria-pressed="true">Todas</button>${INTERESTS.map(i=>`<button type="button" data-interest="${i.id}" aria-pressed="false">${i.label}</button>`).join('')}</div>
     <details class="advanced-origins"><summary>Filtrar por livro e perícia</summary><div><label>Livro de origem<select id="originSource"><option value="">Todos os livros</option>${[...new Set(ORIGINS.map(o=>o.source))].map(s=>`<option>${s}</option>`).join('')}</select></label><label>Perícia associada<select id="originSkill"><option value="">Todas as perícias</option>${SKILLS.map(s=>`<option value="${s.code}">${s.label}</option>`).join('')}</select></label></div></details>
    </section>
    <div class="origin-library"><section class="origin-index" aria-labelledby="originCount"><div class="index-heading"><h2 id="originCount"></h2><button type="button" class="reset-filters ink-link" hidden>Limpar filtros</button></div><ol id="originResults"></ol><p class="origin-empty" hidden>Nenhuma origem com esses filtros. Tente outra palavra ou limpe os filtros.</p></section>
     <section class="origin-detail" id="originDetail" aria-labelledby="originDetailTitle"><div class="detail-placeholder"><span class="ink-star" aria-hidden="true">✧</span><h2 id="originDetailTitle">Um passado ainda não escrito.</h2><small>Abra uma origem para conhecer sua história, perícias e habilidade.</small></div></section></div>
    <footer class="paper-footer"><div><button class="open-comparison ink-link" type="button" disabled>Comparar origens (0/2)</button><p class="paper-status" role="status" aria-live="polite">Explore à vontade. A origem só será escolhida quando você confirmar.</p></div><span class="paper-page">ÓRION / 02</span></footer>
   </div>
  </article></div></div>
  <dialog class="origin-comparison" aria-labelledby="compareTitle"><header><div><small>Duas possibilidades para sua história</small><h2 id="compareTitle">Lado a lado</h2></div><button type="button" class="close-comparison ink-link" aria-label="Fechar comparação">×</button></header><div class="comparison-content"></div></dialog>`;
 document.body.append(stage);document.documentElement.dataset.paperActive='1';
 stage.querySelector('.paper-name').textContent=draft.name;
 const $=s=>stage.querySelector(s),status=$('.paper-status'),results=$('#originResults'),detail=$('#originDetail');
 const content=$('.paper-content'),sheet=$('.physical-sheet'),dialog=$('dialog');
 let closed=false;
 function announce(text){status.textContent=text;}
 function compareLabel(){const b=$('.open-comparison');b.textContent=`Comparar origens (${state.compared.length}/2)`;b.disabled=state.compared.length!==2;}
 function rowSelection(){for(const b of results.querySelectorAll('[data-origin]')){b.setAttribute('aria-pressed',String(b.dataset.origin===state.selected));b.querySelector('.origin-row-arrow').textContent=b.dataset.origin===state.selected?'✓':'→';}}
 function renderResults(){
  const found=findOrigins(state);$('#originCount').textContent=`${found.length} ${found.length===1?'origem':'origens'}`;
  results.innerHTML=found.map(o=>`<li><button type="button" data-origin="${o.code}" aria-pressed="${o.code===state.selected}" aria-controls="originDetail"><span class="origin-row-symbol">${originIcon(o.code)}</span><span><strong>${escape(o.label)}</strong><small>${escape(skillText(o))}</small></span><span class="origin-row-arrow" aria-hidden="true">${o.code===state.selected?'✓':'→'}</span></button></li>`).join('');
  $('.origin-empty').hidden=found.length>0;$('.reset-filters').hidden=!(state.query||state.interest||state.source||state.skill);$('.clear-search').hidden=!state.query;
  for(const b of stage.querySelectorAll('[data-interest]'))b.setAttribute('aria-pressed',String(b.dataset.interest===state.interest));
  announce(`${found.length} ${found.length===1?'origem encontrada':'origens encontradas'}.${state.selected?' A origem aberta continua disponível para revisão.':''}`);
 }
 function renderDetail(){
  const o=ORIGINS.find(o=>o.code===state.selected);if(!o)return;
  detail.innerHTML=`<div class="detail-overline"><span>Uma possibilidade de passado</span><button class="back-to-index ink-link" type="button">↑ Lista</button></div><div class="origin-heading"><div class="origin-portrait">${originIcon(o.code)}</div><h2 id="originDetailTitle" tabindex="-1">${escape(o.label)}</h2></div><p class="origin-story">${escape(storyFor(o))}</p><p class="story-caption">Uma ideia para sua história; os detalhes são seus.</p><div class="detail-tags">${interestsFor(o).map(i=>`<span>${i.label}</span>`).join('')}</div><dl class="origin-facts"><div><dt>Perícias associadas</dt><dd>${escape(skillText(o))}${o.variableSkillCount?`<small>Mais ${o.variableSkillCount} perícia à sua escolha.</small>`:''}${o.professionRequired?'<small>Esta origem envolve uma especialidade de Profissão.</small>':''}</dd></div><div><dt>Habilidade de origem</dt><dd>${escape(o.powerName)}</dd></div><div><dt>Livro de origem</dt><dd class="origin-book">${escape(o.source)}</dd></div></dl><div class="origin-detail-actions"><button type="button" class="choose-origin ink-primary" ${state.confirmed===o.code?'disabled':''}>${state.confirmed===o.code?'✓ Origem escolhida':'Escolher esta origem'}<span aria-hidden="true">→</span></button><button type="button" class="compare-origin ink-link" aria-pressed="${state.compared.includes(o.code)}">${state.compared.includes(o.code)?'− Retirar da comparação':'+ Comparar esta origem'}</button></div>`;
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
 for(const b of stage.querySelectorAll('[data-interest]'))b.addEventListener('click',()=>filterInterest(b.dataset.interest));
 for(const b of stage.querySelectorAll('[data-guide]'))b.addEventListener('click',()=>{filterInterest(b.dataset.guide);$('.origin-tools').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});$('#originSearch').focus({preventScroll:true});});
 for(const b of stage.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{for(const m of stage.querySelectorAll('[data-mode]'))m.setAttribute('aria-pressed',String(m===b));$('.origin-guide').hidden=b.dataset.mode!=='guide';});
 $('#originSource').addEventListener('change',e=>{state.source=e.target.value;renderResults();});
 $('#originSkill').addEventListener('change',e=>{state.skill=e.target.value;renderResults();});
 $('.reset-filters').addEventListener('click',()=>{Object.assign(state,{query:'',interest:'',source:'',skill:''});$('#originSearch').value='';$('#originSource').value='';$('#originSkill').value='';renderResults();});
 $('.open-comparison').addEventListener('click',()=>{
  $('.comparison-content').innerHTML=state.compared.map(code=>{const o=ORIGINS.find(o=>o.code===code);return `<section><div class="comparison-origin-heading">${originIcon(o.code)}<h3>${escape(o.label)}</h3></div><p>${escape(storyFor(o))}</p><dl><dt>Perícias</dt><dd>${escape(skillText(o))}</dd><dt>Habilidade</dt><dd>${escape(o.powerName)}</dd><dt>Livro</dt><dd>${escape(o.source)}</dd></dl><button type="button" class="ink-link" data-remove-compare="${o.code}">Retirar da comparação</button></section>`}).join('');dialog.showModal();
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
