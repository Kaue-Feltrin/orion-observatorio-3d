export const PAGE_VEIL_COLOR='#fffaec';
const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));

export function createPageTransition(flash){
  const state={phase:'idle',destination:null,prepared:false};
  let preparation=null;
  function prepare(destination){
    const url=new URL(destination,location.href);
    if(url.origin!==location.origin)throw Error('Destino fora do Observatório');
    state.destination=url.href;state.phase='preparing';
    // O aquecimento é oportunista: falhar no prefetch não bloqueia um link.
    preparation=fetch(url.href,{credentials:'same-origin',cache:'force-cache'})
      .then(async response=>{if(response.ok){await response.text();state.prepared=true;}})
      .catch(()=>{});
    return preparation;
  }
  async function navigate(destination){
    if(state.phase==='covered'||state.phase==='navigating')return false;
    const url=new URL(destination,location.href);
    if(url.origin!==location.origin)throw Error('Destino fora do Observatório');
    state.destination=url.href;state.phase='covered';
    flash.style.background=PAGE_VEIL_COLOR;flash.style.opacity='1';
    flash.style.setProperty('--veil-opacity','1');
    // Dar ao compositor um quadro coberto antes de abandonar o documento,
    // mesmo quando a página seguinte já está inteiramente em cache.
    await frame();await frame();state.phase='navigating';
    location.assign(url.href);return true;
  }
  return {state,prepare,navigate};
}

export async function revealPage(){
  try{await document.fonts?.ready;}catch{}
  await frame();await frame();
  document.documentElement.dataset.arrivalReady='1';
  if(document.documentElement.dataset.pageVeil!=='enter')return;
  document.documentElement.dataset.pageVeil='reveal';
  const url=new URL(location.href);url.searchParams.delete('via');
  history.replaceState(history.state,'',url.href);
  const delay=matchMedia('(prefers-reduced-motion: reduce)').matches?220:800;
  setTimeout(()=>{delete document.documentElement.dataset.pageVeil;},delay);
}
