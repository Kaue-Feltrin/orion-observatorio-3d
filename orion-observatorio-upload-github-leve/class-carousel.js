import './class-carousel.css';
import {CLASS_CHOICES,classByCode,wrapClassIndex,orbitalPose} from './class-catalog.js';
import {bindPointerActivation} from './pointer-activation.js';
const artURLs=['combatente','especialista','ocultista'].map(name=>`/assets/workshop/${name}-v20.png`);
let artReady=null;
export function prepareClassCarousel(){
 if(!artReady)artReady=Promise.all(artURLs.map(url=>{const image=new Image();image.src=url;return image.decode();})).then(()=>true).catch(()=>false);
 return artReady;
}
const poseFrame=p=>({transform:`translate(-50%,-50%) translate(${p.x}px,${p.y}px) scale(${p.scale})`,zIndex:p.z});

export function mountClassCarousel(root,{name,originLabel,classCode=null,reducedMotion=false,onConfirm=()=>false,onBack=()=>{},onContinue=null}){
 const state={index:Math.max(0,CLASS_CHOICES.findIndex(c=>c.code===classCode)),rotation:0,busy:false,confirmed:classByCode(classCode)?.code??null};
 state.rotation=state.index*120;let disposed=false,animations=[],readingAnimations=[],pointerStart=null,suppressClickUntil=0;
 root.innerHTML=`<div class="paper-chapter"><span>03 / CLASSE</span></div><h1 id="classPaperTitle" tabindex="-1">Escolha sua classe.</h1><p class="paper-intro">Gire ou use as setas. Confirme a classe que você quer.</p>
  <p class="class-context"><strong class="class-arauto"></strong><span aria-hidden="true"> · </span><span class="class-origin"></span></p>
  <div class="class-layout"><section class="class-picker" aria-label="Roleta de classes" aria-roledescription="carrossel"><div class="class-orbit" tabindex="0" aria-label="Use as setas esquerda e direita para explorar as classes"><div class="roulette-ink-ring" aria-hidden="true"></div><svg class="roulette-inscription" viewBox="0 0 400 400" aria-hidden="true"><defs><path id="classInscriptionPath" d="M200 30a170 170 0 1 1-.1 0"/></defs><text textLength="1000" lengthAdjust="spacing"><textPath href="#classInscriptionPath">Acorrentado pela realidade   Acorrentado pela realidade   Acorrentado pela realidade</textPath></text></svg>${CLASS_CHOICES.map(c=>`<button type="button" class="roulette-option" data-class-index="${c.atlas}" aria-label="Ver classe ${c.label}" aria-pressed="false"><span class="class-art-layer" aria-hidden="true"><span class="class-silhouette class-silhouette-${c.atlas}"></span></span><span class="roulette-label">${c.label}</span></button>`).join('')}<p class="class-art-loading" role="status">Preparando as silhuetas…</p></div>
   <div class="class-rotation-controls"><button type="button" class="class-previous ink-link" aria-label="Classe anterior">←</button><button type="button" class="class-spin ink-primary">Girar roleta <span aria-hidden="true">↻</span></button><button type="button" class="class-next ink-link" aria-label="Próxima classe">→</button></div>
   <nav class="class-pages" aria-label="Escolher classe em destaque">${CLASS_CHOICES.map(c=>`<button type="button" data-class-page="${c.atlas}" aria-pressed="false">${c.label}</button>`).join('')}</nav><p class="class-position" aria-live="off"></p>
  </section><section class="class-reading" aria-labelledby="className"><span class="class-theme"></span><h2 id="className"></h2><p class="class-summary"></p><div class="class-tradeoffs"><section><h3>Pontos fortes</h3><ul class="class-strengths"></ul></section><section><h3>Limitações</h3><ul class="class-limits"></ul></section></div><section class="origin-example class-example" aria-label="Exemplo de personagem"><span>Por exemplo…</span><p></p></section>
   <details class="class-comparison"><summary>Comparar as três classes</summary><p>Valores-base da classe. Atributos, origem e outras escolhas alteram o total.</p><div class="class-table-scroll"><table><caption>Bases de recursos e escolhas livres de perícias</caption><thead><tr><th scope="col">Base</th>${CLASS_CHOICES.map(c=>`<th scope="col">${c.label}</th>`).join('')}</tr></thead><tbody>${[['PV','pv'],['PE','pe'],['SAN','san'],['Perícias livres','freeSkills']].map(([label,key])=>`<tr><th scope="row">${label}</th>${CLASS_CHOICES.map(c=>`<td>${c.base[key]}${key==='freeSkills'?' + INT':''}</td>`).join('')}</tr>`).join('')}</tbody></table></div><dl class="class-resource-key"><div><dt>PV</dt><dd>Pontos de Vida</dd></div><div><dt>PE</dt><dd>Pontos de Esforço</dd></div><div><dt>SAN</dt><dd>Sanidade</dd></div></dl><small>Perícias livres não incluem os treinamentos fixos de classe e origem.</small></details>
   <button type="button" class="confirm-class ink-primary">Escolher esta classe <span aria-hidden="true">→</span></button><p class="class-status" role="status" aria-live="polite"></p><button type="button" class="continue-creation ink-primary" hidden>Continuar para atributos <span aria-hidden="true">→</span></button>
  </section></div><footer class="paper-footer class-footer"><button type="button" class="back-to-origins ink-link">← Rever origem</button><span class="paper-page">ÓRION / 03</span></footer>`;
 const $=s=>root.querySelector(s),orbit=$('.class-orbit'),options=[...root.querySelectorAll('[data-class-index]')],pages=[...root.querySelectorAll('[data-class-page]')];
 const removers=[],activate=(button,fn)=>removers.push(bindPointerActivation(button,fn));
 $('.class-arauto').textContent=name;$('.class-origin').textContent=originLabel;
 function radius(){return Math.min(210,orbit.clientWidth*.36);}
 function poseAll(rotation){options.forEach((button,index)=>Object.assign(button.style,poseFrame(orbitalPose(index,rotation,radius()))));}
 function render(enter=false){
  const c=CLASS_CHOICES[state.index];$('.class-theme').textContent=c.theme;$('#className').textContent=c.label;$('.class-summary').textContent=c.summary;
  for(const [selector,values]of[['.class-strengths',c.strengths],['.class-limits',c.limits]]){const list=$(selector);list.replaceChildren(...values.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));}
  $('.class-example p').textContent=c.example;$('.class-position').textContent=`${state.index+1} / 3 · ${c.label}`;
  options.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===state.index));b.classList.toggle('is-front',i===state.index);});pages.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===state.index));b.disabled=state.busy;});
  for(const s of['.class-previous','.class-next','.class-spin'])$(s).disabled=state.busy;
  const confirm=$('.confirm-class');confirm.disabled=state.busy||state.confirmed===c.code;confirm.firstChild.textContent=state.confirmed===c.code?'✓ Classe escolhida ':'Escolher esta classe ';
  root.setAttribute('aria-busy',String(state.busy));$('.continue-creation').hidden=!onContinue||state.confirmed!==c.code;$('.continue-creation').disabled=state.busy;
  if(enter&&!reducedMotion){for(const a of readingAnimations)a.cancel();readingAnimations=['#className','.class-summary','.class-tradeoffs','.class-example'].map((s,i)=>$(s).animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,delay:i*35,easing:'cubic-bezier(.2,.7,.2,1)'}));}
 }
 async function turn(steps,spin=false){
  if(disposed||state.busy||!steps)return;
  const from=state.rotation,to=from+steps*120;state.busy=true;render();$('.class-status').textContent=spin?'Girando a roleta…':'Mudando a classe em destaque…';
  if(!reducedMotion){
   const samples=spin?72:18,r=radius();
   animations=options.map((button,index)=>button.animate(Array.from({length:samples+1},(_,n)=>{const t=n/samples,ease=1-(1-t)**3;return{offset:t,...poseFrame(orbitalPose(index,from+(to-from)*ease,r))};}),{duration:spin?1550:460,easing:'linear',fill:'forwards'}));
   await Promise.all(animations.map(a=>a.finished.catch(()=>{})));
  }
  if(disposed)return;
  state.rotation=to;state.index=wrapClassIndex(Math.round(to/120));poseAll(to);for(const a of animations)a.cancel();animations=[];state.busy=false;render(true);$('.class-status').textContent=`${CLASS_CHOICES[state.index].label} em destaque. Confirme se quiser escolher.`;
 }
 activate($('.class-previous'),()=>turn(-1));activate($('.class-next'),()=>turn(1));activate($('.class-spin'),()=>turn(6+Math.floor(Math.random()*3),true));
 for(const b of[...options,...pages])activate(b,event=>{if(event.type==='click'&&event.detail>0&&event.pointerType!=='mouse'&&performance.now()<suppressClickUntil)return;const index=Number(b.dataset.classIndex??b.dataset.classPage),diff=wrapClassIndex(index-state.index);turn(diff===2?-1:diff);});
 orbit.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();turn(e.key==='ArrowLeft'?-1:1);}});
 orbit.addEventListener('pointerdown',e=>{if(e.isPrimary&&(e.pointerType==='touch'||e.pointerType==='pen'))pointerStart={x:e.clientX,y:e.clientY};});
 orbit.addEventListener('pointerup',e=>{if(!pointerStart)return;const x=e.clientX-pointerStart.x,y=e.clientY-pointerStart.y;pointerStart=null;if(Math.abs(x)>45&&Math.abs(x)>Math.abs(y)*1.3){suppressClickUntil=performance.now()+400;turn(x<0?1:-1);}});orbit.addEventListener('pointercancel',()=>{pointerStart=null;});
 activate($('.confirm-class'),()=>{if(state.busy||state.confirmed===CLASS_CHOICES[state.index].code)return;const c=CLASS_CHOICES[state.index];if(onConfirm(c.code)){state.confirmed=c.code;render();if(!reducedMotion)options[state.index].animate([{transform:options[state.index].style.transform,opacity:.7},{opacity:1}],{duration:380,easing:'ease-out'});$('.class-status').textContent=`${c.label} é a classe de ${name}. Você pode revisar sua escolha.`;}else $('.class-status').textContent='Não foi possível guardar esta classe. Tente novamente.';});
 activate($('.back-to-origins'),onBack);activate($('.continue-creation'),()=>{if(state.confirmed===CLASS_CHOICES[state.index].code)onContinue?.();});
 const look=e=>{if(reducedMotion||e.pointerType!=='mouse')return;const r=orbit.getBoundingClientRect();orbit.style.setProperty('--class-look-x',`${((e.clientX-r.x)/r.width-.5)*5}px`);orbit.style.setProperty('--class-look-y',`${((e.clientY-r.y)/r.height-.5)*3}px`);};
 const rest=()=>{orbit.style.setProperty('--class-look-x','0px');orbit.style.setProperty('--class-look-y','0px');};orbit.addEventListener('pointermove',look);orbit.addEventListener('pointerleave',rest);
 const resize=new ResizeObserver(()=>{if(!state.busy)poseAll(state.rotation);});resize.observe(orbit);root.dataset.classMotion=reducedMotion?'reduced':'full';render(true);poseAll(state.rotation);
 prepareClassCarousel().then(ok=>{if(disposed)return;root.dataset.classArt=ok?'ready':'error';$('.class-art-loading').textContent=ok?'':'As silhuetas não carregaram. As descrições continuam disponíveis.';$('.class-art-loading').hidden=ok;});
 return{get state(){return{...state};},dispose(){disposed=true;resize.disconnect();for(const remove of removers)remove();for(const a of [...animations,...readingAnimations])a.cancel();root.replaceChildren();}};
}
