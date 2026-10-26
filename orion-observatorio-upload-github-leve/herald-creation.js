import {newCreation,transitionCreation,canContinue,CREATION_DRAFT_KEY} from './creation-state.js';
import {figure,seal} from './creation-figures.js';
import {observatoryURL} from './herald-catalog.js';
import {sampleStarSelection} from './star-selection.js';

export function createHeraldCreation(root,{hands,reducedMotion=false}){
 let state=newCreation(),gestureStart=null,aim={x:0,y:0},storageWarning=false;
 const panel=document.createElement('section');
 panel.className='herald-creation';panel.setAttribute('aria-label','O nascimento do Marcado');
 panel.innerHTML=`<a class="creation-back" href="index.html?stars=0" aria-label="Voltar ao observatório">←</a><span class="creation-label">Nascimento de um arauto · Prévia</span><div class="creation-stage"><div class="sealed-being">${seal()}<button class="baby-target" type="button" data-creation-point aria-label="Contemplar a silhueta etérea" aria-controls="markBeing" aria-expanded="false">${figure('baby')}</button></div><button class="mark-being" id="markBeing" data-creation-point type="button" hidden>Tornar Marcado</button><div class="creation-shards" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--i:${i};--edge-x:${i<8?4+(i%4)*2:90+(i%4)*2}%;--edge-y:${i%8<4?5+(i%4)*6:78+(i%4)*5}%;--rotation:${i*59}deg;--delay:${(i%5)*.4}s"></i>`).join('')}</div><form id="identityForm" class="identity-form" hidden><fieldset class="child-choices"><legend class="sr-only">Escolha a silhueta ou não defina gênero</legend>${['menina','menino'].map(g=>`<button type="button" class="child-choice" data-gender="${g}" data-creation-point aria-label="Escolher ${g}" aria-pressed="false">${figure(g)}<span>${g==='menina'?'Menina':'Menino'}</span><i class="choice-selected" aria-hidden="true">✦</i></button>`).join('')}</fieldset><div class="identity-fields"><label for="herald-name" class="sr-only">Nomeie seu arauto</label><input id="herald-name" name="name" type="text" placeholder="Nomeie seu arauto" maxlength="60" required autocomplete="off" aria-describedby="creationStatus"><label class="undefined-choice" data-creation-point><input type="checkbox" id="undefinedGender">Não definir gênero</label></div><button class="creation-next" type="submit" data-creation-point aria-label="Continuar com esta identidade" hidden disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></form></div><p id="creationStatus" class="creation-status" role="status" aria-live="polite">Uma vida aguarda seu chamado.</p>`;
 root.append(panel);
 const back=observatoryURL(location.href);back.searchParams.set('stars','0');panel.querySelector('.creation-back').href=back.href;
 const baby=panel.querySelector('.baby-target'),mark=panel.querySelector('#markBeing');
 const being=panel.querySelector('.sealed-being'),form=panel.querySelector('form');
 const name=panel.querySelector('#herald-name'),undefinedGender=panel.querySelector('#undefinedGender');
 const next=panel.querySelector('.creation-next'),status=panel.querySelector('#creationStatus');
 function sync(){
   panel.dataset.phase=state.phase;root.dataset.creationPhase=state.phase;
   for(const b of panel.querySelectorAll('[data-gender]'))b.setAttribute('aria-pressed',String(b.dataset.gender===state.gender));
   undefinedGender.checked=state.gender==='nao-definir';
   next.hidden=state.gender===null;next.disabled=!canContinue(state)||state.continued;
 }
 function gesture(){gestureStart=performance.now();hands.setStarHovered?.(true);}
 function update(now){
   hands.setStarDirection?.(aim.x,aim.y);
   if(gestureStart!==null){const pose=sampleStarSelection((now-gestureStart)/1000,reducedMotion);hands.setStarSelection?.(pose.progress<1?pose:null);if(pose.progress>=1)gestureStart=null;}
 }
 function point(e){aim={x:(e.clientX/innerWidth-.5)*2,y:(.5-e.clientY/innerHeight)*2};hands.setStarHovered?.(!!e.target.closest('[data-creation-point]'));}
 panel.addEventListener('focusin',e=>hands.setStarHovered?.(!!e.target.closest('[data-creation-point]')));
 panel.addEventListener('focusout',()=>hands.setStarHovered?.(false));
 baby.addEventListener('click',()=>{
   if(state.phase!=='sealed')return;
   state=transitionCreation(state,{type:'reveal'});gesture();sync();
   baby.setAttribute('aria-expanded','true');mark.hidden=false;
   status.textContent='Torne este ser um Marcado.';mark.focus({preventScroll:true});
 });
 mark.addEventListener('click',async()=>{
   if(state.phase!=='revealed')return;
   state=transitionCreation(state,{type:'mark'});sync();gesture();mark.disabled=true;
   baby.inert=true;form.hidden=false;form.inert=true;status.textContent='A luz se rompe. Um novo destino desperta.';
   // animation.finished follows the actual visual timeline, not a guessed click delay.
   const animations=reducedMotion?[]:[...being.querySelectorAll('.shell-arc,.chain,.seal-lock')].map((el,i)=>el.animate([
     {opacity:1,transform:'translate(0,0) rotate(0deg)'},
     {offset:.25,opacity:1,transform:`translate(${i%2?4:-4}px,0) rotate(${i%2?3:-3}deg)`},
     {opacity:0,transform:`translate(${i%2?140:-140}px,${i<2?-85:100}px) rotate(${i%2?28:-28}deg)`}
   ],{duration:1250,easing:'cubic-bezier(.35,0,.15,1)',fill:'forwards'}));
   await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));
   state=transitionCreation(state,{type:'released'});sync();being.hidden=true;mark.hidden=true;form.hidden=false;form.inert=false;
   status.textContent='Dê um nome ao seu arauto e escolha como deseja representá-lo.';
   panel.querySelector('.child-choice').focus({preventScroll:true});
 });
 function choose(value){state=transitionCreation(state,{type:'gender',value});gesture();sync();status.textContent=state.name.trim()?'Sua identidade começa a tomar forma.':'Digite um nome para continuar.';}
 for(const button of panel.querySelectorAll('[data-gender]'))button.addEventListener('click',()=>choose(button.dataset.gender));
 undefinedGender.addEventListener('change',()=>choose(undefinedGender.checked?'nao-definir':null));
 name.addEventListener('input',()=>{state=transitionCreation(state,{type:'name',value:name.value});sync();status.textContent=state.gender===null?'Escolha uma silhueta ou não defina gênero.':state.name.trim()?'Sua identidade está pronta para continuar.':'Digite um nome para continuar.';});
 form.addEventListener('submit',e=>{
   e.preventDefault();
   if(!canContinue(state)||state.continued){if(!state.name.trim()){name.setCustomValidity('Dê um nome ao seu arauto.');name.reportValidity();name.setCustomValidity('');}return;}
   state=transitionCreation(state,{type:'continue'});sync();gesture();
   const draft={version:1,name:state.name,gender:state.gender,step:'identity'};
   try{sessionStorage.setItem(CREATION_DRAFT_KEY,JSON.stringify(draft));}catch{storageWarning=true;}
   status.textContent=storageWarning?'Identidade preparada nesta tela. Seu navegador não permitiu guardar o rascunho.':`${state.name}: identidade preparada. A próxima etapa ainda será definida.`;
   // Explicit local handoff only; no account, character, gameplay value or remote write is created.
   root.dispatchEvent(new CustomEvent('orion:creation-continue',{detail:draft,bubbles:true}));
 });
 sync();return {point,update,get state(){return {...state};}};
}
