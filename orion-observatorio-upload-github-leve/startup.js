// Entrada única da aplicação: sem CDN ou import maps remotos.
const loading = document.getElementById('loading');
const banner = document.getElementById('loadIssue');
const detail = document.getElementById('loadErrorText');
const retry = document.getElementById('retryScene');
let failed = false;
retry.addEventListener('click', () => location.reload());
function fail(message) {
  if (failed || document.documentElement.dataset.sceneReady === '1') return;
  failed = true;
  const value = String(message || 'Erro inesperado no módulo 3D.');
  detail.textContent = value.length > 420 ? value.slice(0, 420) + '…' : value;
  banner.hidden = false;
  loading.hidden = true;
  document.documentElement.dataset.sceneError = value;
  console.error('[Observatório 3D]', value);
}
window.addEventListener('error', event => {
  if (!failed && document.documentElement.dataset.sceneReady !== '1')
    fail(event.error?.message || event.message || 'Erro inesperado ao iniciar');
});
window.addEventListener('unhandledrejection', event => {
  if (!failed && document.documentElement.dataset.sceneReady !== '1')
    fail(event.reason?.message || String(event.reason) || 'Falha ao importar módulo 3D');
});
try {
  await import('./main.js');
  if (document.documentElement.dataset.sceneReady !== '1')
    fail('O motor 3D foi carregado, mas a cena não concluiu a inicialização.');
} catch (error) {
  fail(error?.message || String(error));
}
