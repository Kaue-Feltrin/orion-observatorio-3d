import {newCreation,transitionCreation,canContinue,CREATION_DRAFT_KEY} from './creation-state.js';
import {createCreationArt} from './creation-cinematic.js';
import {observatoryURL} from './herald-catalog.js';
import {sampleStarSelection} from './star-selection.js';

export function createHeraldCreation(root,{hands,reducedMotion=false,scene,camera,environment}){
 let state=newCreation(),gestureStart=null,aim={x:0,y:0},storageWarning=false;
 const panel=document.createElement('section');
 panel.className='herald-creation';panel.setAttribute('aria-label','O nascimento do Marcado');
 panel.innerHTML=`<a class="creation-back" href="index.html?stars=0" aria-label="Voltar ao observatório">←</a><span class="creation-label">O despertar</span><h1 class="blood-prologue">Tudo começa pelo sangue.</h1><div class="identity-title" hidden><strong>O início de uma história.</strong><small>Escolha uma representação para seu arauto.</small></div><div class="creation-stage"><div class="sealed-being"><button class="baby-target" type="button" data-creation-point aria-label="Contemplar a silhueta etérea" aria-controls="markBeing" aria-expanded="false"><span class="sr-only">Acorrentado pela realidade: uma silhueta cercada por sigilos de conhecimento</span></button></div><button class="mark-being" id="markBeing" aria-label="Tornar Marcado" type="button" hidden disabled><span class="mark-sigil" aria-hidden="true">✧</span><span class="mark-title">Tornar Marcado</span><span class="mark-hint">Romper o vínculo</span></button><form id="identityForm" class="identity-form" hidden><fieldset class="child-choices"><legend class="sr-only">Escolha a silhueta ou não defina gênero</legend>${['menina','menino'].map(g=>`<button type="button" class="child-choice" data-gender="${g}" data-creation-point aria-label="Escolher ${g}" aria-pressed="false"><span>${g==='menina'?'Menina':'Menino'}</span></button>`).join('')}</fieldset><div class="identity-fields"><label for="herald-name" class="name-label">Nome do arauto</label><input id="herald-name" name="name" type="text" placeholder="Nomeie seu arauto" maxlength="60" required autocomplete="off" aria-describedby="creationStatus"><label class="undefined-choice"><input type="checkbox" id="undefinedGender">Não definir gênero</label></div><button class="creation-next" type="submit" aria-label="Continuar com esta identidade" hidden disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></form></div><p id="creationStatus" class="creation-status" role="status" aria-live="polite">Tudo começa pelo sangue.</p>`;
 root.append(panel);
 const back=observatoryURL(location.href);back.searchParams.set('stars','0');panel.querySelector('.creation-back').href=back.href;
 const baby=panel.querySelector('.baby-target'),mark=panel.querySelector('#markBeing');
 const being=panel.querySelector('.sealed-being'),form=panel.querySelector('form');
 const name=panel.querySelector('#herald-name'),undefinedGender=panel.querySelector('#undefinedGender');
 const next=panel.querySelector('.creation-next'),status=panel.querySelector('#creationStatus');
 const art=createCreationArt({scene,camera,panel,reducedMotion,environment});
 baby.disabled=true;
 art.ready.then(()=>{root.dataset.creationArt='ready';baby.disabled=false;mark.disabled=false;status.textContent='Contemple o que ainda não tem forma.';}).catch(()=>{root.dataset.creationArt='error';status.textContent='Não foi possível carregar a cena. Recarregue a página.';});
 if(new URLSearchParams(location.search).has('debug'))window.__orionCreationDebug=art;
 function sync(){
   panel.dataset.phase=state.phase;root.dataset.creationPhase=state.phase;
   panel.querySelector('.identity-title').hidden=state.phase!=='identity';
   panel.querySelector('.blood-prologue').setAttribute('aria-hidden',String(state.phase==='identity'));
   for(const b of panel.querySelectorAll('[data-gender]'))b.setAttribute('aria-pressed',String(b.dataset.gender===state.gender));
   undefinedGender.checked=state.gender==='nao-definir';
   next.hidden=state.gender===null;next.disabled=!canContinue(state)||state.continued;
 }
 function gesture(){gestureStart=performance.now();hands.setStarHovered?.(true);}
 function update(now){
   art.update(now);
   hands.setStarDirection?.(aim.x,aim.y);
   if(gestureStart!==null){const pose=sampleStarSelection((now-gestureStart)/1000,reducedMotion);hands.setStarSelection?.(pose.progress<1?pose:null);if(pose.progress>=1)gestureStart=null;}
 }
 function point(e){aim={x:(e.clientX/innerWidth-.5)*2,y:(.5-e.clientY/innerHeight)*2};hands.setStarHovered?.(!!e.target.closest('[data-creation-point]'));art.point(aim);}
 panel.addEventListener('focusin',e=>hands.setStarHovered?.(e.target.matches(':focus-visible')&&!!e.target.closest('[data-creation-point]')));
 panel.addEventListener('focusout',()=>hands.setStarHovered?.(false));
 baby.addEventListener('click',()=>{
   if(state.phase!=='sealed')return;
   state=transitionCreation(state,{type:'reveal'});gesture();sync();
   baby.setAttribute('aria-expanded','true');mark.hidden=false;
   status.textContent='Acorrentado pela realidade.';mark.focus({preventScroll:true});
 });
 mark.addEventListener('click',async()=>{
   if(state.phase!=='revealed')return;
   state=transitionCreation(state,{type:'mark'});sync();
   gestureStart=null;hands.setStarSelection?.(null);hands.setStarHovered?.(false);mark.disabled=true;
   baby.inert=true;form.hidden=false;form.inert=true;status.textContent='Os sigilos se desfazem. A alma desperta.';
   // The shared WebGL clock resolves this promise after the VFX timeline.
   // No DOM pieces flying apart and no button-click hand animation.
   await art.release();
   state=transitionCreation(state,{type:'released'});sync();being.hidden=true;mark.hidden=true;form.hidden=false;form.inert=false;
   status.textContent='Dê um nome ao seu arauto e escolha como deseja representá-lo.';
   panel.querySelector('.child-choice').focus({preventScroll:true});
 });
 function choose(value){state=transitionCreation(state,{type:'gender',value});art.select(value);if(value==='menina'||value==='menino')gesture();sync();status.textContent=state.name.trim()?'Sua identidade começa a tomar forma.':'Digite um nome para continuar.';}
 for(const button of panel.querySelectorAll('[data-gender]'))button.addEventListener('click',()=>choose(button.dataset.gender));
 undefinedGender.addEventListener('change',()=>choose(undefinedGender.checked?'nao-definir':null));
 name.addEventListener('input',()=>{state=transitionCreation(state,{type:'name',value:name.value});sync();status.textContent=state.gender===null?'Escolha uma silhueta ou não defina gênero.':state.name.trim()?'Sua identidade está pronta para continuar.':'Digite um nome para continuar.';});
 form.addEventListener('submit',e=>{
   e.preventDefault();
   if(!canContinue(state)||state.continued){if(!state.name.trim()){name.setCustomValidity('Dê um nome ao seu arauto.');name.reportValidity();name.setCustomValidity('');}return;}
   state=transitionCreation(state,{type:'continue'});sync();
   const draft={version:1,name:state.name,gender:state.gender,step:'identity'};
   try{sessionStorage.setItem(CREATION_DRAFT_KEY,JSON.stringify(draft));}catch{storageWarning=true;}
   status.textContent=storageWarning?'Identidade preparada nesta tela. Seu navegador não permitiu guardar o rascunho.':`${state.name}: identidade preparada. A próxima etapa ainda será definida.`;
   // Explicit local handoff only; no account, character, gameplay value or remote write is created.
   root.dispatchEvent(new CustomEvent('orion:creation-continue',{detail:draft,bubbles:true}));
 });
 sync();return {ready:art.ready,point,update,finishFrame(){const seen=new Set();hands.root?.traverse(obj=>{if(obj.isMesh&&obj.material&&!seen.has(obj.material)){seen.add(obj.material);obj.material.opacity*=.56;}});},get state(){return {...state};}};
}
