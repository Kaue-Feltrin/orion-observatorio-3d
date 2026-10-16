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
    {label:'Lite original',quality:'lite',effects:null},
    {label:'Lite sem bloom',quality:'lite',effects:'no-bloom'},
    {label:'Lite sem gás GLSL',quality:'lite',effects:'no-gas'},
    {label:'Eco (menos pixels, sem bloom/gás)',quality:'eco',effects:null}
  ];
  for(const choice of choices){
    const url=new URL(window.location.href);
    url.searchParams.set('debug','1');
    url.searchParams.set('quality',choice.quality);
    if(choice.effects)url.searchParams.set('effects',choice.effects);
    else url.searchParams.delete('effects');
    const anchor=document.createElement('a');
    anchor.href=url.pathname+url.search;
    anchor.textContent=choice.label;
    if(choice.quality===new URLSearchParams(location.search).get('quality') &&
      (choice.effects||'normal') === (new URLSearchParams(location.search).get('effects')||'normal')){
      anchor.setAttribute('aria-current','page');
    }
    comparisons.appendChild(anchor);
  }
  const compareHelp=document.createElement('small');
  compareHelp.textContent='Compare FPS após estabilizar cada versão. Uma diferença grande indica qual efeito pesa mais neste computador.';
  field.append(compareHelp,comparisons);
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
      'Draw calls: ' + s.drawCalls + ' · texturas GPU: ' + s.textures,
      'Diferença interna mouse/câmera: ' + s.mouseDeltaPx + ' px',
      'Heap JavaScript: ' + (s.jsHeapMB == null ? 'indisponível' : s.jsHeapMB + ' MB') + ' (não é RAM total)'
    ].join('\n');
  }

  function report() {
    const s = snapshot();
    return [
      'Projeto Órion · Observatório v0.9.5 (prévia)',
      new Date().toLocaleString('pt-BR'),
      format(s),
      'Amostras: ' + s.samples + ' · adaptações automáticas: ' + s.adaptations,
      'Janela: ' + s.viewport,
      'Memória total da aba: verificar no Gerenciador de tarefas do Chrome (Shift+Esc).',
      'Os valores são observações locais, não benchmarks de GPU nem medidas de VRAM.'
    ].join('\n');
  }

  function refresh(now) {
    if (now - lastRefresh < 1000) return;
    lastRefresh = now;
    current = snapshot(now);
    info.textContent = format(current);
  }

  copy.addEventListener('click', async () => {
    const text = report();
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
