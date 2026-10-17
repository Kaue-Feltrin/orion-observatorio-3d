// Projeto Órion v0.9.16 — comparativo A/B local das mãos FPS.
// Sem rede, sem loop de renderização extra e sem telemetria persistente no servidor.
const KEY='orion-observatorio-hands-ab-v1';

export function benchmarkSignature(s){
  return JSON.stringify({
    quality:s.quality,effects:s.effects,bloomRest:s.bloomRest,
    viewport:s.viewport,dpr:s.dpr,canvasPixels:s.canvasPixels,
    gasLayers:s.gasLayers,volumeLayers:s.volumeLayers,
    foregroundNear:s.foregroundNear,depthMotion:s.depthMotion,
    parallaxStrength:s.parallaxStrength
  });
}

export function compareHandsSamples(off,fps){
  if(!off||!fps)return{ok:false,reason:'Faltam medições dos dois modos.'};
  if(off.mode!=='off'||fps.mode!=='fps')return{ok:false,reason:'Modos A/B inválidos.'};
  if(off.signature!==fps.signature)return{ok:false,reason:'Configurações ou resolução diferentes. Limpe as medições e repita no mesmo tamanho de janela.'};
  for(const v of [off.fps,off.p95Ms,fps.fps,fps.p95Ms]){
    if(!Number.isFinite(v))return{ok:false,reason:'Medições incompletas.'};
  }
  return {
    ok:true,
    fpsDifference:fps.fps-off.fps,
    p95Difference:+(fps.p95Ms-off.p95Ms).toFixed(1),
    drawCallsDifference:(fps.drawCalls??0)-(off.drawCalls??0),
    texturesDifference:(fps.textures??0)-(off.textures??0)
  };
}

function loadStored(){
  try {
    const parsed=JSON.parse(sessionStorage.getItem(KEY)||'{}');
    return parsed&&typeof parsed==='object'?parsed:{};
  }catch{return{};}
}
function saveStored(data){
  try{sessionStorage.setItem(KEY,JSON.stringify(data));return true;}
  catch{return false;}
}

export function createHandsBenchmark(field,snapshot){
  const section=document.createElement('section');
  section.className='perf-ab-inspector';
  section.setAttribute('aria-label','Benchmark local das mãos FPS');
  const heading=document.createElement('strong');
  heading.textContent='Comparação A/B · mãos FPS';
  const guidance=document.createElement('small');
  guidance.textContent='Mesmo PC e janela: espere 10 s com a aba visível, registre uma amostra, mude de modo e registre a outra. Repita para confirmar. Não mede VRAM nem FPS efetivamente exibido pela GPU.';
  const result=document.createElement('output');
  result.id='orionHandsABResult';
  result.className='perf-values';
  result.setAttribute('aria-live','polite');
  const capture=document.createElement('button');
  capture.id='orionHandsABCapture';
  capture.className='perf-copy';
  capture.type='button';
  capture.textContent='Registrar amostra atual';
  const swap=document.createElement('a');
  swap.id='orionHandsABSwitch';
  swap.className='perf-depth-compare';
  const clear=document.createElement('button');
  clear.id='orionHandsABClear';
  clear.className='perf-copy';
  clear.type='button';
  clear.textContent='Limpar comparativo';
  const status=document.createElement('small');
  status.id='orionHandsABStatus';
  status.setAttribute('aria-live','polite');
  const params=new URLSearchParams(location.search);
  const off=params.get('hands')==='off';
  const url=new URL(location.href);
  url.searchParams.set('debug','1');
  url.searchParams.set('quality','eco-plus');
  url.searchParams.set('hands',off?'fps':'off');
  url.searchParams.set('fpsStyle','frame');
  url.searchParams.delete('fpsTune');
  swap.href=url.pathname+url.search;
  swap.textContent=off?'Testar com mãos FPS':'Testar sem mãos FPS';
  section.append(heading,guidance,result,capture,swap,clear,status);
  field.appendChild(section);

  function report(){
    const data=loadStored();
    const a=data.off,b=data.fps;
    if(!a&&!b)return'Comparativo A/B: sem dados registrados.';
    const fmt=s=>s?'FPS '+s.fps+' | p95 '+s.p95Ms+' ms | >33 ms '+s.longFrames+'% | draw calls '+s.drawCalls+' | texturas '+s.textures+' | amostras '+s.samples+' | viewport '+s.viewport:'pendente';
    const comparison=compareHandsSamples(a,b);
    return [
      'Observatório · mãos FPS · comparação local A/B',
      'Sem mãos: '+fmt(a),
      'David Fischer (natural): '+fmt(b),
      comparison.ok
        ?'Diferença com mãos menos sem mãos: FPS '+(comparison.fpsDifference>=0?'+':'')+comparison.fpsDifference+
          ' | p95 '+(comparison.p95Difference>=0?'+':'')+comparison.p95Difference+' ms'+
          ' | draw calls '+(comparison.drawCallsDifference>=0?'+':'')+comparison.drawCallsDifference+
          ' | texturas '+(comparison.texturesDifference>=0?'+':'')+comparison.texturesDifference
        :'Comparação pendente: '+comparison.reason,
      'Amostras do loop da página, não benchmark de GPU. Repetir pares A/B na mesma janela.'
    ].join('\n');
  }

  function render(){
    const data=loadStored();
    const comparison=compareHandsSamples(data.off,data.fps);
    if(comparison.ok){
      result.textContent='FPS: sem mãos '+data.off.fps+' → com mãos '+data.fps.fps+
        ' ('+(comparison.fpsDifference>=0?'+':'')+comparison.fpsDifference+')'+
        '\np95: '+data.off.p95Ms+' → '+data.fps.p95Ms+' ms'+
        ' ('+(comparison.p95Difference>=0?'+':'')+comparison.p95Difference+' ms)'+
        '\nDraw calls: '+data.off.drawCalls+' → '+data.fps.drawCalls+
        ' | Texturas: '+data.off.textures+' → '+data.fps.textures;
    }else{
      result.textContent='Sem mãos: '+(data.off?'registrado':'pendente')+
        ' · Com mãos FPS: '+(data.fps?'registrado':'pendente')+
        '\n'+(data.off&&data.fps?comparison.reason:'Aguardando duas amostras comparáveis.');
    }
  }
  capture.addEventListener('click',()=>{
    const s=snapshot();
    const isOff=params.get('hands')==='off';
    const mode=isOff?'off':'fps';
    if(document.hidden){status.textContent='Volte para a aba visível antes de medir.';return;}
    if(s.quality!=='eco-plus'){status.textContent='Selecione Eco+ para comparar com resolução fixa.';return;}
    if(!isOff&&(s.handsMode!=='fps'||!s.handsVisible||!s.handsReady||s.handsLoadError)){
      status.textContent='O modelo FPS ainda não está pronto para a medição.';return;
    }
    if(isOff&&s.handsVisible){status.textContent='Desligue as mãos antes de medir o modo sem mãos.';return;}
    if(performance.now()<10000||s.samples<30||!Number.isFinite(s.fps)||!Number.isFinite(s.p95Ms)){
      status.textContent='Espere pelo menos 10 s de cena carregada e 30 quadros de amostra.';return;
    }
    const item={
      mode,signature:benchmarkSignature(s),
      fps:s.fps,p95Ms:s.p95Ms,longFrames:s.longFrames,
      drawCalls:s.drawCalls,textures:s.textures,samples:s.samples,
      viewport:s.viewport,quality:s.quality,recordedAt:new Date().toISOString()
    };
    const data=loadStored();
    data[mode]=item;
    if(!saveStored(data)){status.textContent='Armazenamento da aba bloqueado. Não foi possível preservar a comparação.';return;}
    status.textContent='Amostra '+(mode==='fps'?'com mãos FPS':'sem mãos')+' registrada nesta aba.';
    render();
  });
  clear.addEventListener('click',()=>{
    try{sessionStorage.removeItem(KEY);}catch{}
    status.textContent='Comparação limpa.';
    render();
  });
  render();
  return{report};
}
