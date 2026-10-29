import './quality-control.css';
import{mountGraphicsAdvisor}from './graphics-advisor.js';
const key='orion-render-quality-v1',choices=[['auto','Automático'],['eco','Mais fluidez'],['high','Mais detalhe']];
export function readQualityPreference(){try{const value=localStorage.getItem(key);return choices.some(([code])=>code===value)?value:null;}catch{return null;}}
export function mountQualityControl(root,{value='auto',onChange,diagnostic,graphics={}}){
 const button=document.createElement('button');button.type='button';button.className='quality-toggle';button.textContent='◐ Fluidez';button.setAttribute('aria-label','Ajustar qualidade visual');button.setAttribute('aria-haspopup','dialog');
 const dialog=document.createElement('dialog');dialog.className='quality-dialog';dialog.setAttribute('aria-labelledby','qualityTitle');dialog.innerHTML=`<button class="quality-close" type="button" aria-label="Fechar ajustes de qualidade">×</button><h2 id="qualityTitle">Qualidade visual</h2><p>Escolha o equilíbrio entre detalhe e movimento.</p><fieldset><legend>Preferência de imagem</legend>${choices.map(([code,label])=>`<label><input type="radio" name="renderQuality" value="${code}"><span>${label}</span></label>`).join('')}</fieldset><p class="quality-feedback" role="status"></p><details><summary>Diagnóstico deste navegador</summary><pre></pre><button type="button" class="quality-copy">Copiar diagnóstico</button><p class="quality-copy-feedback" role="status"></p></details>`;
 root.append(button,dialog);
 const advisor=mountGraphicsAdvisor(root,dialog,graphics);
 const travel=new MutationObserver(()=>{button.disabled=root.classList.contains('jumping')||root.classList.contains('selecting');if(button.disabled&&dialog.open)dialog.close();});
 travel.observe(root,{attributes:true,attributeFilter:['class']});
 const radios=[...dialog.querySelectorAll('input[name="renderQuality"]')],feedback=dialog.querySelector('.quality-feedback'),details=dialog.querySelector('details'),output=dialog.querySelector('pre');
 let refreshTimer=null;
 function refresh(){radios.forEach(r=>r.checked=r.value===value);output.textContent=diagnostic();}
 function stopRefresh(){if(refreshTimer!==null)clearInterval(refreshTimer);refreshTimer=null;}
 function syncRefresh(){
  stopRefresh();if(!dialog.open||!details.open)return;
  refresh();refreshTimer=setInterval(()=>{
   const selection=document.getSelection();
   // Keep fallback manual copying usable while text is selected.
   if(!dialog.open||!details.open||document.hidden||(selection&&!selection.isCollapsed&&output.contains(selection.anchorNode)))return;
   refresh();
  },1000);
 }
 button.addEventListener('click',()=>{refresh();dialog.showModal();syncRefresh();(radios.find(r=>r.checked)||radios[0]).focus();});
 dialog.querySelector('.quality-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{stopRefresh();button.focus();});
 details.addEventListener('toggle',syncRefresh);
 for(const radio of radios)radio.addEventListener('change',()=>{value=radio.value;onChange(value);let saved=false;try{localStorage.setItem(key,value);saved=true;}catch{}feedback.textContent=saved?'Ajuste aplicado e salvo neste navegador.':'Ajuste aplicado nesta aba.';refresh();});
 dialog.querySelector('.quality-copy').addEventListener('click',async()=>{const text=diagnostic();dialog.querySelector('pre').textContent=text;try{await navigator.clipboard.writeText(text);dialog.querySelector('.quality-copy-feedback').textContent='Diagnóstico copiado.';}catch{dialog.querySelector('.quality-copy-feedback').textContent='Selecione e copie os dados acima.';}});
 return{button,dialog,observeSample:advisor.observeSample,openGraphicsHelp:advisor.open};
}
