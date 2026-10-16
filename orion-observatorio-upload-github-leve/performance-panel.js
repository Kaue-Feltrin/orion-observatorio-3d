import { createHandsBenchmark } from './hands-benchmark.js';

// v0.9.4 · Telemetria local e opcional para avaliar fluidez no próprio PC.
// Não envia nada pela rede e não afirma medir RAM/VRAM totais do navegador.
export function createPerformancePanel(debugRoot, readScene) {
  const field = document.createElement('fieldset');
  field.className = 'layer-inspector perf-inspector';
  const legend = document.createElement('legend');
  legend.textContent = 'Diagnóstico de fluidez · prévia';
  const info = document.createElement('output');
  info.id = 'orionPerfReadout';
  info.className = 'perf-values';
  info.setAttribute('aria-label', 'Indicadores de desempenho locais');
  info.textContent = 'Coletando amostras do seu navegador…';
  const explain = document.createElement('small');
  explain.textContent = 'FPS medido na aba, não pela GPU. Texturas e draw calls não representam RAM/VRAM. Para memória total: Shift+Esc no Chrome.';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'perf-copy';
  copy.textContent = 'Copiar diagnóstico';
  const feedback = document.createElement('small');
  feedback.className = 'perf-copy-status';
  feedback.setAttribute('aria-live', 'polite');
  field.append(legend, info, explain, copy, feedback);
  // Links recarregam o mesmo Observatório sob configurações comparáveis.
  // O usuário pode copiar um diagnóstico de cada variante.
  const comparisons=document.createElement('nav');
  comparisons.className='perf-comparisons';
  comparisons.setAttribute('aria-label','Comparação de custos de renderização');
  const choices=[
    {label:'Lite original · 950k px',quality:'lite',effects:null},
    {label:'Lite sem gás GLSL',quality:'lite',effects:'no-gas'},
    {label:'Eco+ · 670k px + bloom',quality:'eco-plus',effects:null},
    {label:'Eco+ sem bloom',quality:'eco-plus',effects:'no-bloom'},
    {label:'Eco · 500k px',quality:'eco',effects:null}
  ];
  for(const choice of choices){
    const url=new URL(window.location.href);
    url.searchParams.set('debug','1');
    url.searchParams.set('quality',choice.quality);
    url.searchParams.delete('depthMotion');
    if(choice.effects)url.searchParams.set('effects',choice.effects);
    else url.searchParams.delete('effects');
    const anchor=document.createElement('a');
    anchor.href=url.pathname+url.search;
    anchor.textContent=choice.label;
    if(choice.quality===new URLSearchParams(location.search).get('quality') &&
      (choice.effects||'normal') === (new URLSearchParams(location.search).get('effects')||'normal') &&
      new URLSearchParams(location.search).get('depthMotion')!=='off'){
      anchor.setAttribute('aria-current','page');
    }
    comparisons.appendChild(anchor);
  }
  const compareHelp=document.createElement('small');
  compareHelp.textContent='Compare após ~10 s em cada modo e repita as medições. Lite sem gás e Eco+ preservam o bloom: a diferença isola principalmente a resolução; Eco+ sem bloom mostra o custo do bloom na mesma resolução.';
  const depthComparison=document.createElement('a');
  const comparisonUrl=new URL(window.location.href);
  comparisonUrl.searchParams.set('debug','1');
  comparisonUrl.searchParams.set('quality','eco-plus');
  comparisonUrl.searchParams.delete('effects');
  if(new URLSearchParams(location.search).get('depthMotion')==='off'){
    comparisonUrl.searchParams.delete('depthMotion');
    depthComparison.textContent='Ativar profundidade orgânica · Eco+';
  }else{
    comparisonUrl.searchParams.set('depthMotion','off');
    depthComparison.textContent='Comparar profundidade original · Eco+';
  }
  depthComparison.href=comparisonUrl.pathname+comparisonUrl.search;
  depthComparison.className='perf-depth-compare';
  const foregroundComparison=document.createElement('a');
  const fgUrl=new URL(window.location.href);
  fgUrl.searchParams.set('debug','1');
  fgUrl.searchParams.set('quality','eco-plus');
  fgUrl.searchParams.delete('effects');
  const foregroundOff=new URLSearchParams(location.search).get('foreground')==='off';
  if(foregroundOff){
    fgUrl.searchParams.delete('foreground');
    foregroundComparison.textContent='Ativar véu próximo · Eco+';
  }else{
    fgUrl.searchParams.set('foreground','off');
    foregroundComparison.textContent='Comparar sem véu próximo · Eco+';
  }
  foregroundComparison.href=fgUrl.pathname+fgUrl.search;
  foregroundComparison.className='perf-depth-compare';
  const handsComparison=document.createElement('a');
  const handsUrl=new URL(window.location.href);
  handsUrl.searchParams.set('debug','1');
  handsUrl.searchParams.set('quality','eco-plus');
  const handsOff=new URLSearchParams(location.search).get('hands')==='off';
  if(handsOff){
    handsUrl.searchParams.set('hands','fps');
    handsUrl.searchParams.set('fpsStyle','natural');
    handsUrl.searchParams.delete('fpsTune');
    handsComparison.textContent='Ativar mãos FPS David Fischer · Eco+';
  }else{
    handsUrl.searchParams.set('hands','off');
    handsComparison.textContent='Comparar sem mãos · Eco+';
  }
  handsComparison.href=handsUrl.pathname+handsUrl.search;
  handsComparison.className='perf-depth-compare';
  const handModes=document.createElement('nav');
  handModes.className='perf-comparisons';
  handModes.setAttribute('aria-label','Comparar modelos das mãos');
  const currentHands=new URLSearchParams(location.search).get('hands')||'fps';
  for(const {mode,label} of [
    {mode:'fps',label:'David Fischer · FPS (CC BY)'},
    {mode:'vr',label:'Mãos anatômicas VR · MIT'},
    {mode:'rig',label:'WRAD retrô · 50 ossos'},
    {mode:'3d',label:'Modelo 3D anterior'},
    {mode:'2d',label:'Silhueta 2,5D'},
    {mode:'off',label:'Sem mãos'}
  ]){
    const url=new URL(window.location.href);
    url.searchParams.set('quality','eco-plus');
    url.searchParams.set('debug','1');
    url.searchParams.set('hands',mode);
    const a=document.createElement('a');
    a.href=url.pathname+url.search;
    a.textContent=label;
    if(mode===currentHands||(mode==='fps'&&currentHands==='on'))a.setAttribute('aria-current','page');
    handModes.appendChild(a);
  }
  field.append(compareHelp,comparisons,depthComparison,foregroundComparison,handModes,handsComparison);
  debugRoot.appendChild(field);

  const MAX_SAMPLES = 360, WINDOW_MS = 4000;
  const frames = new Array(MAX_SAMPLES);
  let next = 0, count = 0, lastRefresh = -Infinity;
  let current = null;

  function reset() {
    count = 0;
    next = 0;
    lastRefresh = -Infinity;
    current = null;
    info.textContent = 'Coletando amostras do seu navegador…';
  }

  function record(now, frameMs) {
    if (!Number.isFinite(now) || !Number.isFinite(frameMs) || frameMs <= 0) return;
    // Ignorar retomada de abas em segundo plano.
    if (frameMs > 1000) { reset(); return; }
    frames[next] = { t:now, dt:frameMs };
    next = (next + 1) % MAX_SAMPLES;
    count = Math.min(MAX_SAMPLES, count + 1);
  }

  function snapshot(now = performance.now()) {
    const samples = [];
    for (let i = 0; i < count; i++) {
      const item = frames[(next - count + i + MAX_SAMPLES) % MAX_SAMPLES];
      if (now - item.t <= WINDOW_MS) samples.push(item.dt);
    }
    samples.sort((a,b) => a-b);
    const total = samples.reduce((n, dt) => n + dt, 0);
    const scene = readScene();
    // JS heap: disponível apenas em alguns navegadores; não é memória total.
    const jsHeapMB = typeof performance.memory?.usedJSHeapSize === 'number'
      ? Math.round(performance.memory.usedJSHeapSize / 1048576)
      : null;
    return {
      fps: total > 0 ? Math.round(1000 * samples.length / total) : null,
      p95Ms: samples.length ? Math.round(samples[Math.min(samples.length - 1, Math.ceil(samples.length * .95) - 1)] * 10) / 10 : null,
      longFrames: samples.length ? Math.round(100 * samples.filter(ms => ms > 33.3).length / samples.length) : null,
      samples: samples.length,
      jsHeapMB,
      ...scene
    };
  }

  function format(s) {
    return [
      'FPS médio (~4s): ' + (s.fps ?? '—'),
      'Quadro p95: ' + (s.p95Ms ?? '—') + ' ms',
      'Quadros acima de 33 ms: ' + (s.longFrames ?? '—') + '%',
      'Perfil: ' + s.quality + ' · DPR: ' + s.dpr,
      'Efeitos: ' + s.effects + ' · bloom em repouso: ' + (s.bloomRest?'sim':'não'),
      'Pixels do canvas: ' + s.canvasPixels,
      'Camadas: ' + s.gasLayers + ' gás / ' + s.volumeLayers + ' recortes',
      'Véu frontal próximo da câmera: ' + (s.foregroundNear?'sim':'não'),
      'Mãos em primeira pessoa: ' + (s.handsVisible?'visíveis':'desligadas') + ' · modo: ' + s.handsMode + ' · superfícies: ' + s.handsSurfaces + ' · texturas de mãos: ' + s.handsTextures + ' · triângulos por mão: ' + s.handsTriangles,
      'Rig pronto: ' + (s.handsReady?'sim':'carregando/indisponível') + ' · ossos: ' + s.handsJoints + ' · juntas de dedos: ' + s.handsFingerJoints,
      ...(s.handsMode==='fps' && window.__orionHandsDebug?.state?.framing ? ['FPS | punhos NDC: '+JSON.stringify(window.__orionHandsDebug.state.framing)] : []),
      ...(s.handsLoadError ? ['Falha no rig: ' + s.handsLoadError] : []),
      'Profundidade orgânica: ' + (s.depthMotion?'ativa':'desativada') + ' · intensidade: ' + s.parallaxStrength,
      'Draw calls: ' + s.drawCalls + ' · texturas GPU: ' + s.textures,
      'Diferença interna mouse/câmera: ' + s.mouseDeltaPx + ' px',
      'Heap JavaScript: ' + (s.jsHeapMB == null ? 'indisponível' : s.jsHeapMB + ' MB') + ' (não é RAM total)'
    ].join('\n');
  }

  function report() {
    const s = snapshot();
    return [
      'Projeto Órion · Observatório v0.9.15 (prévia)',
      new Date().toLocaleString('pt-BR'),
      format(s),
      'Amostras: ' + s.samples + ' · adaptações automáticas: ' + s.adaptations,
      'Janela: ' + s.viewport,
      'Memória total da aba: verificar no Gerenciador de tarefas do Chrome (Shift+Esc).',
      'Os valores são observações locais, não benchmarks de GPU nem medidas de VRAM.'
    ].join('\n');
  }

  const handsAB=createHandsBenchmark(field, snapshot);

  function refresh(now) {
    if (now - lastRefresh < 1000) return;
    lastRefresh = now;
    current = snapshot(now);
    info.textContent = format(current);
  }

  copy.addEventListener('click', async () => {
    const text = report()+'\n\n'+handsAB.report();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard indisponível');
      await navigator.clipboard.writeText(text);
      feedback.textContent = 'Diagnóstico copiado. Pode colar no chat.';
    } catch {
      // Permissões de cópia variam por navegador. Exibir o texto para cópia manual.
      feedback.textContent = 'Cópia automática indisponível; selecione o texto abaixo.';
      const details = document.createElement('textarea');
      details.readOnly = true;
      details.className = 'perf-fallback';
      details.setAttribute('aria-label', 'Diagnóstico para cópia manual');
      details.value = text;
      field.querySelector('.perf-fallback')?.remove();
      field.appendChild(details);
      details.focus();
      details.select();
    }
  });

  return { record, refresh, reset, snapshot, report, get latest(){return current;} };
}
