import './graphics-advisor.css';

import{classifyRenderer,graphicsHelpFor}from './graphics-support.js';
export function createGraphicsHelp(container,{renderer='',userAgent=navigator.userAgent,brave=Boolean(navigator.brave)}={}){
 const path=graphicsHelpFor({userAgent,brave}),status=classifyRenderer(renderer),details=document.createElement('details');details.className='graphics-help';
 details.innerHTML='<summary>Melhor experiência com aceleração gráfica</summary><p class="graphics-state"></p><ol><li>Abra as configurações do navegador.</li><li>Ative “Usar aceleração gráfica quando disponível”. No Firefox, confira a seção Desempenho.</li><li>Reinicie o navegador para aplicar a mudança.</li><li>Confira se o WebGL está usando aceleração por hardware e teste a cena novamente.</li></ol><div class="graphics-address-actions"></div><p class="graphics-copy-feedback" role="status"></p><label class="graphics-fallback" hidden>Endereço: copie e cole na barra do navegador<input readonly></label>';
 details.dataset.renderingStatus=status;
 details.querySelector('.graphics-state').textContent=status==='software'?'O WebGL informou renderização por software. Ativar a aceleração gráfica pode melhorar bastante a experiência.':status==='unknown'?'O navegador não informou se a aceleração está ativa. Você pode verificar nas configurações abaixo.':'O navegador informou um renderizador. Se houver lentidão, estas configurações ajudam a conferir a aceleração.';
 const actions=details.querySelector('.graphics-address-actions'),feedback=details.querySelector('.graphics-copy-feedback');
 for(const [url,label]of[[path.settings,'Copiar endereço das configurações'],[path.gpu,'Copiar endereço do diagnóstico']]){
  if(!url)continue;const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.graphicsAddress=url;button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url);feedback.textContent='Endereço copiado. Cole na barra de endereços de '+path.browser+'.';}catch{const fallback=details.querySelector('.graphics-fallback'),input=fallback.querySelector('input');fallback.hidden=false;input.value=url;input.focus();input.select();feedback.textContent='Copie o endereço e cole na barra do navegador.';}});actions.append(button);
 }
 if(!path.settings)details.querySelector('ol li').textContent='Consulte as opções de gráficos e desempenho do navegador. Nem todo navegador oferece esse ajuste.';
 container.append(details);return{details,status};
}
export function mountGraphicsAdvisor(root,dialog,options={}){
 const help=createGraphicsHelp(dialog,options),notice=document.createElement('aside');notice.className='graphics-advice';notice.hidden=true;notice.setAttribute('aria-label','Orientação de desempenho');
 notice.innerHTML='<p role="status"></p><button type="button" class="graphics-learn">Ver orientação</button><button type="button" class="graphics-dismiss" aria-label="Dispensar orientação de desempenho">×</button>';root.append(notice);
 let dismissed=false,lastSample=null,slowWindows=0,firstSample=null;
 try{dismissed=sessionStorage.getItem('orion-graphics-advice-v24')==='dismissed';}catch{}
 const open=()=>{if(!dialog.open)dialog.showModal();help.details.open=true;help.details.querySelector('summary').focus();notice.hidden=true;};
 notice.querySelector('.graphics-learn').addEventListener('click',open);notice.querySelector('.graphics-dismiss').addEventListener('click',()=>{dismissed=true;notice.hidden=true;try{sessionStorage.setItem('orion-graphics-advice-v24','dismissed');}catch{}});
 const button=root.querySelector('.quality-toggle');if(button)button.dataset.graphicsStatus=help.status;
 return{status:help.status,open,observeSample(sample,now){
  if(dismissed||sample.updatedAt===null||sample.updatedAt===lastSample)return;
  lastSample=sample.updatedAt;firstSample??=now;slowWindows=sample.averageMs>42?slowWindows+1:0;
  const suspected=help.status==='unknown'&&slowWindows>=2&&now-firstSample>=3000;
  if(help.status!=='software'&&!suspected)return;
  // Guidance stays available in Fluidez on every screen. Automatic notices
  // only use the spacious observatory, outside character-creation controls.
  if(options.creationPage||innerWidth<760||dialog.open||root.classList.contains('jumping')||root.classList.contains('selecting'))return;
  notice.querySelector('p').textContent=help.status==='software'?'Renderização por software detectada. Veja como ativar a aceleração gráfica.':'A cena está pouco fluida. Vale conferir a aceleração gráfica do navegador.';notice.hidden=false;
 },dispose(){notice.remove();}};
}
