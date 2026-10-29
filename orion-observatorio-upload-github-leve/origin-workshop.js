import './origin-workshop.css';
import{createPaperScroll}from './paper-scroll.js';
import{comparisonMarkup}from './origin-comparison.js';
import{createPaperMotion,landWorkshop}from './paper-motion.js';
import {ORIGINS,SKILLS} from './origin-catalog.js';
import {INTERESTS,findOrigins,skillLabel,storyFor} from './origin-discovery.js';
import {CREATION_DRAFT_KEY} from './creation-state.js';
import {originIcon} from './origin-icons.js';
import {backgroundFor} from './origin-backgrounds.js';
import {mountClassCarousel,prepareClassCarousel} from './class-carousel.js';
import {classByCode,nextClassDraft} from './class-catalog.js';
import {bindPointerActivation} from './pointer-activation.js';

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
export function openOriginWorkshop(draft,{onReturn=()=>{},onChoose=()=>{},reducedMotion=false,resume=false}={}){
 if(opening)return opening;
 const previous=document.activeElement,stage=document.createElement('section');
 const state={query:'',interest:'',source:'',skill:'',selected:null,compared:[],confirmed:null};
 let classChoice=classByCode(draft.classCode)?.code??null,classView=null,journeyView=null;
 stage.className='paper-workshop';stage.setAttribute('aria-label','Ficha de criação: origem');
 stage.dataset.phase='preparing';
 stage.innerHTML=`<div class="workshop-mist" aria-hidden="true"></div><svg class="workshop-binding" viewBox="0 0 400 400" aria-hidden="true"><defs><path id="workshopBindingPath" d="M200 35a165 165 0 1 1-.1 0"/></defs><text><textPath href="#workshopBindingPath">Acorrentado pela realidade   Acorrentado pela realidade</textPath></text></svg><p class="paper-preparing" role="status">Materializando sua história…</p>
  <div class="workshop-planks" aria-hidden="true">${Array.from({length:6},(_,i)=>`<div class="workshop-plank" style="--plank:${i};--grain:${i*19}%"></div>`).join('')}</div>
  <div class="paper-scroll"><div class="paper-landing"><article class="physical-sheet" aria-labelledby="paperTitle" aria-busy="true">
   <div class="paper-content" inert>
    <header class="paper-header"><div class="paper-imprint"><span>ÓRION</span><small>Ficha do arauto</small></div><button class="paper-return ink-link" type="button">← Voltar à identidade</button></header>
    <section class="origin-chapter-content">
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
    <aside class="comparison-tray" aria-label="Origens na comparação"><div><strong>Compare dois caminhos</strong><p class="comparison-tray-hint">Use Comparar nas origens que chamarem sua atenção.</p></div><div class="comparison-slots"></div><button class="open-comparison ink-primary" type="button" disabled>Comparar origens (0/2)</button></aside><div class="origin-library"><section class="origin-index" aria-labelledby="originCount"><div class="index-heading"><h2 id="originCount" tabindex="-1"></h2></div><ol id="originResults"></ol><p class="origin-empty" hidden>Nenhuma origem com esses filtros. Tente outra palavra ou limpe os filtros.</p></section>
     <section class="origin-detail" id="originDetail" aria-labelledby="originDetailTitle"><div class="detail-placeholder"><span class="ink-star" aria-hidden="true">✧</span><h2 id="originDetailTitle">Seu passado começa aqui.</h2><small>Abra uma origem para ver um exemplo.</small></div></section></div>
    <footer class="paper-footer"><div><p class="paper-status" role="status" aria-live="polite">Abra uma origem para começar.</p><button type="button" class="origin-next ink-primary" hidden>Continuar para classe <span aria-hidden="true">→</span></button><small class="origin-next-hint" hidden>Confirme a origem aberta para continuar.</small></div><span class="paper-page">ÓRION / 02</span></footer>
    </section><section class="class-chapter" aria-label="Escolha da classe" hidden></section><section class="creation-journey" aria-label="Continuar criação do arauto" hidden></section>
   </div>
  </article></div></div>
  <dialog class="origin-comparison" aria-labelledby="compareTitle"><header><div><small>Duas possibilidades para sua história</small><h2 id="compareTitle">Lado a lado</h2></div><button type="button" class="close-comparison ink-link" aria-label="Fechar comparação">×</button></header><div class="comparison-content"></div></dialog>`;
 document.body.append(stage);document.documentElement.dataset.paperTransition='1';
 stage.querySelector('.paper-name').textContent=draft.name;
 const $=s=>stage.querySelector(s),status=$('.paper-status'),results=$('#originResults'),detail=$('#originDetail');
 const content=$('.paper-content'),sheet=$('.physical-sheet'),dialog=$('dialog');
 const emptyDetail=detail.innerHTML;
 let closed=false,originScroll=0;
 const motion=createPaperMotion(stage,{reducedMotion});
 const paperScroll=createPaperScroll($('.paper-scroll'),{reducedMotion});
 function notify(value){draft={...value};onChoose(value);}
 function announce(text){status.textContent=text;}
 function updateClassLink(){const b=$('.origin-next'),pending=Boolean(state.selected&&state.selected!==state.confirmed);b.hidden=!state.confirmed;b.disabled=pending;$('.origin-next-hint').hidden=!state.confirmed||!pending;b.firstChild.textContent=classChoice?'Rever classe ':'Continuar para classe ';}
 function originsCommit(){journeyView?.save();journeyView?.dispose();journeyView=null;classView?.dispose();classView=null;$('.class-chapter').hidden=true;$('.creation-journey').hidden=true;$('.origin-chapter-content').hidden=false;stage.dataset.chapter='origin';stage.setAttribute('aria-label','Ficha de criação: origem');sheet.setAttribute('aria-labelledby','paperTitle');$('.paper-return').textContent='← Voltar à identidade';updateClassLink();return paperScroll.top(originScroll);}
 function showOrigins(){if(closed||motion.busy)return;return motion.turn(originsCommit,{backward:true,focus:()=>$('.origin-next')});}
 function classesCommit(){
  journeyView?.save();journeyView?.dispose();journeyView=null;classView?.dispose();
  const origin=ORIGINS.find(o=>o.code===state.confirmed);$('.origin-chapter-content').hidden=true;$('.creation-journey').hidden=true;$('.class-chapter').hidden=false;stage.dataset.chapter='class';stage.setAttribute('aria-label','Ficha de criação: classe');sheet.setAttribute('aria-labelledby','classPaperTitle');$('.paper-return').textContent='← Voltar às origens';
  classView=mountClassCarousel($('.class-chapter'),{name:draft.name,originLabel:origin.label,classCode:classChoice,reducedMotion,onBack:showOrigins,onContinue:()=>showJourney(),onConfirm(code){
   const value=nextClassDraft({...draft,origin:{code:origin.code,label:origin.label,source:origin.source}},code);if(!value)return false;
   try{sessionStorage.setItem(CREATION_DRAFT_KEY,JSON.stringify(value));classChoice=code;notify(value);stage.dispatchEvent(new CustomEvent('orion:class-chosen',{detail:value,bubbles:true}));updateClassLink();return true;}catch{return false;}
  }});return paperScroll.top(0);
 }
 function showClasses(){if(closed||motion.busy||!state.confirmed||$('.origin-next').disabled)return;if(stage.dataset.chapter==='origin')originScroll=$('.paper-scroll').scrollTop;return motion.turn(classesCommit,{backward:stage.dataset.chapter==='journey',focus:()=>$('#classPaperTitle')});}
 async function journeyCommit(){
  const {mountCreationJourney}=await import('./creation-journey.js');if(closed)return;
  classView?.dispose();classView=null;journeyView?.dispose();$('.class-chapter').hidden=true;$('.origin-chapter-content').hidden=true;$('.creation-journey').hidden=false;stage.dataset.chapter='journey';stage.setAttribute('aria-label','Ficha de criação: decisões do arauto');sheet.setAttribute('aria-labelledby','journeyTitle');$('.paper-return').textContent='← Rever classe';
  journeyView=mountCreationJourney($('.creation-journey'),{draft,onSave:notify,onBack:showClasses,onOrigin:showOrigins,onTurn:(commit,options)=>motion.turn(commit,options),scroll:()=>paperScroll.top(0),reducedMotion});await paperScroll.top(0);
 }
 async function showJourney(){if(closed||motion.busy||!classChoice)return;try{await motion.turn(journeyCommit,{focus:()=>$('#journeyTitle')});}catch{const output=$('.class-status');if(output)output.textContent='Não foi possível abrir a próxima etapa. Suas escolhas foram preservadas; tente novamente.';}}
 function compareLabel(){const b=$('.open-comparison');b.textContent=`Comparar origens (${state.compared.length}/2)`;b.disabled=state.compared.length!==2;
  $('.comparison-tray-hint').textContent=state.compared.length===2?'Duas origens separadas. Veja as diferenças e escolha uma.':state.compared.length===1?'Falta uma origem. Use Comparar em outra opção da lista.':'Use Comparar nas origens que chamarem sua atenção.';
  $('.comparison-slots').innerHTML=Array.from({length:2},(_,i)=>{const o=ORIGINS.find(o=>o.code===state.compared[i]);return o?`<div class="comparison-slot">${originIcon(o.code)}<span>${escape(o.label)}</span><button type="button" data-remove-tray="${o.code}" aria-label="Retirar ${escape(o.label)} da comparação">×</button></div>`:`<div class="comparison-slot is-empty"><span>${i+1}. Escolha uma origem</span></div>`}).join('');
  for(const b of results.querySelectorAll('[data-compare-origin]')){const selected=state.compared.includes(b.dataset.compareOrigin);b.setAttribute('aria-pressed',String(selected));b.querySelector('span').textContent=selected?'✓ Comparando':'Comparar';}
 }
 function toggleComparison(code){if(state.compared.includes(code))state.compared=state.compared.filter(c=>c!==code);else if(state.compared.length<2)state.compared.push(code);else{announce('A comparação já tem duas origens. Retire uma pelo × para trocar.');paperScroll.to($('.comparison-tray'));return;}
  compareLabel();if(state.selected===code){const b=$('.compare-origin');if(b){b.setAttribute('aria-pressed',String(state.compared.includes(code)));b.textContent=state.compared.includes(code)?'✓ Na comparação':'Comparar esta origem';}}
  announce(state.compared.length===2?'Duas origens escolhidas para comparar. Abra Comparar origens.':`${state.compared.length} de 2 origens na comparação.`);
 }
 function renderComparison(){const chosen=state.compared.map(code=>ORIGINS.find(o=>o.code===code));$('.comparison-content').innerHTML=comparisonMarkup(chosen);}
 function rowSelection(){for(const b of results.querySelectorAll('[data-origin]')){b.setAttribute('aria-pressed',String(b.dataset.origin===state.selected));b.querySelector('.origin-row-arrow').textContent=b.dataset.origin===state.selected?'✓':'→';}}
 function renderResults(){
  const found=findOrigins(state);$('#originCount').textContent=`${found.length} ${found.length===1?'origem':'origens'}`;
  results.innerHTML=found.map(o=>`<li><button type="button" data-origin="${o.code}" aria-pressed="${o.code===state.selected}" aria-controls="originDetail"><span class="origin-row-symbol">${originIcon(o.code)}</span><strong>${escape(o.label)}</strong><span class="origin-row-arrow" aria-hidden="true">${o.code===state.selected?'✓':'→'}</span></button><button type="button" class="origin-compare-toggle" data-compare-origin="${o.code}" aria-label="Comparar ${escape(o.label)}" aria-pressed="${state.compared.includes(o.code)}"><span>${state.compared.includes(o.code)?'✓ Comparando':'Comparar'}</span></button></li>`).join('');
  $('.origin-empty').hidden=found.length>0;$('.reset-filters').hidden=!(state.query||state.interest||state.source||state.skill);$('.clear-search').hidden=!state.query;
  for(const b of stage.querySelectorAll('[data-interest]'))b.setAttribute('aria-pressed',String(b.dataset.interest===state.interest));
  for(const b of stage.querySelectorAll('[data-guide]'))b.setAttribute('aria-pressed',String(b.dataset.guide===state.interest));
  const labels=[INTERESTS.find(i=>i.id===state.interest)?.label,state.query?`Busca: ${state.query}`:'',state.source,state.skill?skillLabel(state.skill):''].filter(Boolean);
  $('#originFilters').hidden=!labels.length;$('.filter-applied-label').textContent=labels.join(' · ');$('.filter-result-count').textContent=`${found.length} ${found.length===1?'origem para explorar':'origens para explorar'}`;$('.change-interest').hidden=!state.interest;
  announce(`${found.length} ${found.length===1?'origem encontrada':'origens encontradas'}.${state.selected?' A origem aberta continua disponível para revisão.':''}`);
 }
 function renderDetail(){
  updateClassLink();
  const o=ORIGINS.find(o=>o.code===state.selected);if(!o){detail.innerHTML=emptyDetail;return;}
  detail.innerHTML=`<div class="detail-overline"><button class="back-to-index ink-link" type="button">↑ Voltar à lista</button></div><div class="origin-heading"><div class="origin-portrait">${originIcon(o.code)}</div><h2 id="originDetailTitle" tabindex="-1">${escape(o.label)}</h2></div><section class="origin-example" aria-label="Exemplo de passado"><span>Por exemplo…</span><p>${escape(backgroundFor(o))}</p></section><dl class="origin-facts"><div><dt>Perícias</dt><dd><ul class="origin-skill-chips">${o.fixedSkills.map(s=>`<li>${escape(skillLabel(s))}</li>`).join('')}${o.variableSkillCount?`<li>+${o.variableSkillCount} à escolha</li>`:''}</ul></dd></div><div><dt>Habilidade</dt><dd>${escape(o.powerName)}</dd></div></dl>${o.professionRequired?'<p class="origin-choice-note">Exige uma especialidade de Profissão.</p>':''}<details class="origin-more"><summary>Ver contexto e fonte</summary><p class="origin-story">${escape(storyFor(o))}</p><p class="origin-book">${escape(o.source)}</p><small>O exemplo é só uma inspiração para sua história.</small></details><div class="origin-detail-actions"><button type="button" class="choose-origin ink-primary" ${state.confirmed===o.code?'disabled':''}>${state.confirmed===o.code?'✓ Origem escolhida':'Escolher esta origem'}<span aria-hidden="true">→</span></button><button type="button" class="compare-origin ink-link" aria-pressed="${state.compared.includes(o.code)}">${state.compared.includes(o.code)?'✓ Na comparação':'Comparar esta origem'}</button></div>`;
  $('.choose-origin').addEventListener('click',()=>{
   const value={...draft,step:'origin',origin:{code:o.code,label:o.label,source:o.source},...(classChoice?{classCode:classChoice}:{})};
   try{sessionStorage.setItem(CREATION_DRAFT_KEY,JSON.stringify(value));state.confirmed=o.code;$('.paper-chosen-name').textContent=o.label;renderDetail();prepareClassCarousel();announce(`${o.label} é a origem de ${draft.name}. Continue para escolher a classe.`);notify(value);stage.dispatchEvent(new CustomEvent('orion:origin-chosen',{detail:value,bubbles:true}));}
   catch{announce('Não foi possível guardar esta escolha. Você pode continuar explorando e tentar novamente.');}
  });
  $('.compare-origin').addEventListener('click',()=>toggleComparison(o.code));
  $('.back-to-index').addEventListener('click',()=>{const b=results.querySelector(`[data-origin="${o.code}"]`);b?.focus({preventScroll:true});paperScroll.to($('.origin-index'));});
 }
 results.addEventListener('click',e=>{const compare=e.target.closest('[data-compare-origin]');if(compare){toggleComparison(compare.dataset.compareOrigin);return;}const b=e.target.closest('[data-origin]');if(!b)return;state.selected=b.dataset.origin;rowSelection();renderDetail();announce(`${ORIGINS.find(o=>o.code===state.selected).label} aberta. Confira os detalhes antes de escolher.`);if(matchMedia('(max-width: 760px)').matches){$('#originDetailTitle').focus({preventScroll:true});paperScroll.to(detail);}});
 $('#originSearch').addEventListener('input',e=>{state.query=e.target.value;renderResults();});
 $('.clear-search').addEventListener('click',()=>{state.query='';$('#originSearch').value='';renderResults();$('#originSearch').focus();});
 function filterInterest(value){state.interest=value;renderResults();}
 function showGuide(show){for(const b of stage.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String((b.dataset.mode==='guide')===show));$('.origin-guide').hidden=!show;$('.origin-tools').hidden=show;$('.origin-library').hidden=show;$('#originFilters').hidden=show||!(state.query||state.interest||state.source||state.skill);}
 function showResults(){const target=$('#originFilters').hidden?$('.origin-library'):$('#originFilters');paperScroll.to(target);$('#originCount').focus({preventScroll:true});}
 for(const b of stage.querySelectorAll('[data-interest]'))b.addEventListener('click',()=>filterInterest(b.dataset.interest));
 for(const b of stage.querySelectorAll('[data-guide]'))b.addEventListener('click',()=>{Object.assign(state,{query:'',source:'',skill:'',selected:null});$('#originSearch').value='';$('#originSource').value='';$('#originSkill').value='';filterInterest(b.dataset.guide);renderDetail();showGuide(false);showResults();announce(`${INTERESTS.find(i=>i.id===state.interest).label}: filtro aplicado. ${findOrigins(state).length} origens para explorar.`);});
 for(const b of stage.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>showGuide(b.dataset.mode==='guide'));
 $('.change-interest').addEventListener('click',()=>{showGuide(true);paperScroll.to($('.origin-guide'));stage.querySelector(`[data-guide="${state.interest}"]`)?.focus({preventScroll:true});});
 $('#originSource').addEventListener('change',e=>{state.source=e.target.value;renderResults();});
 $('#originSkill').addEventListener('change',e=>{state.skill=e.target.value;renderResults();});
 $('.reset-filters').addEventListener('click',()=>{Object.assign(state,{query:'',interest:'',source:'',skill:''});$('#originSearch').value='';$('#originSource').value='';$('#originSkill').value='';renderResults();showResults();});
 $('.open-comparison').addEventListener('click',()=>{renderComparison();dialog.showModal();});
 $('.comparison-slots').addEventListener('click',e=>{const b=e.target.closest('[data-remove-tray]');if(b)toggleComparison(b.dataset.removeTray);});
 $('.comparison-content').addEventListener('click',e=>{const remove=e.target.closest('[data-remove-compare]'),choose=e.target.closest('[data-choose-compared]');
  if(remove){toggleComparison(remove.dataset.removeCompare);renderComparison();return;}
  if(e.target.closest('[data-compare-browse]')){dialog.close();paperScroll.to($('.origin-index'));return;}
  if(choose){state.selected=choose.dataset.chooseCompared;rowSelection();renderDetail();$('.choose-origin')?.click();if(state.confirmed===state.selected){dialog.close();paperScroll.to(detail);}}
 });
 $('.close-comparison').addEventListener('click',()=>dialog.close());
 bindPointerActivation($('.origin-next'),showClasses);
 bindPointerActivation($('.paper-return'),async()=>{if(closed||motion.busy)return;if(stage.dataset.chapter==='class'){showOrigins();return;}if(stage.dataset.chapter==='journey'){showClasses();return;}closed=true;motion.dispose();paperScroll.dispose();classView?.dispose();journeyView?.save();journeyView?.dispose();stage.inert=true;delete document.documentElement.dataset.paperActive;document.documentElement.dataset.paperTransition='1';if(!reducedMotion){const animations=[$('.paper-landing').animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-70px) rotateX(6deg)'}],{duration:360,fill:'forwards'}),$('.workshop-planks').animate([{opacity:1},{opacity:0}],{duration:360,delay:120,fill:'forwards'})];await Promise.all(animations.map(a=>a.finished.catch(()=>{})));}stage.remove();delete document.documentElement.dataset.paperReady;delete document.documentElement.dataset.paperTransition;opening=null;onReturn();previous?.focus({preventScroll:true});});
 // Restoring a previously confirmed local origin never creates a new grant.
 if(draft.origin&&ORIGINS.some(o=>o.code===draft.origin.code)){state.selected=state.confirmed=draft.origin.code;$('.paper-chosen-name').textContent=ORIGINS.find(o=>o.code===state.selected).label;renderDetail();}
 renderResults();compareLabel();updateClassLink();stage.dataset.chapter='origin';
 opening=(async()=>{
  await prepareOriginWorkshop();if(closed)return;
  $('.paper-preparing').textContent='';
  if(resume&&draft.character&&classChoice)await journeyCommit();
  await landWorkshop(stage,{reducedMotion});if(closed)return;
  stage.dataset.phase='ready';content.inert=false;sheet.setAttribute('aria-busy','false');document.documentElement.dataset.paperReady='1';delete document.documentElement.dataset.paperTransition;(stage.dataset.chapter==='journey'?$('#journeyTitle'):$('#paperTitle')).focus({preventScroll:true});
 })().catch(error=>{stage.remove();opening=null;delete document.documentElement.dataset.paperActive;delete document.documentElement.dataset.paperReady;delete document.documentElement.dataset.paperTransition;motion.dispose();paperScroll.dispose();throw error;});
 return opening;
}
