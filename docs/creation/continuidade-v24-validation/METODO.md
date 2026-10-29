# Reprodução V24

Ambiente testado: Node 24.19.0, SQLite embutido 3.53.3, Playwright 1.56.1 e Chrome 156 extraído em `/workspace/orion-validation-pr179/chrome/root/opt/google/chrome/chrome`. WebGL usa SwiftShader; não são métricas da GTX 1660.

Na aplicação `orion-observatorio-upload-github-leve`, executar `npm run check`, `node --test tests/*.unit.mjs` e `npx vite build`. O comando completo também baixa ESO e não foi reexecutado; os assets existentes foram verificados por hash. Manter o preview em 4173; não recompilar enquanto testes/capturas estiverem em andamento.

Regressões: `npx playwright test --config=playwright.local.config.js tests/class-carousel.spec.js tests/creation-cinematic.spec.js tests/sigil-atlas.spec.js tests/creation-clean-v21.spec.js tests/creation-interactions.spec.js tests/creation-loading.spec.js tests/quality-control.spec.js tests/quality-diagnostic.spec.js tests/herald-navigation.spec.js tests/hands-atmosphere.spec.js` — 54 casos.

Criação/continuidade: `npx playwright test --config=playwright.local.config.js tests/creation-journey.spec.js tests/scene-continuity-v24.spec.js` — 15 casos. Depois da correção CSS do campo de cópia, a continuidade e os quatro controles de qualidade foram repetidos (10 casos já contados). Sem retries. Conferir logs/estatísticas finais, não contar reexecuções como novos casos.

`prodigy-before.log` é o teste da retomada de Prodígio contra o bundle anterior à correção. `conference-before.log` preserva a rodada que encontrou a referência inexistente na conferência. A fonte atual resolve ambas. Uma corrida do teste de idade foi corrigida esperando o foco após a transição; o conteúdo continua inerte durante a animação.

`package-v24.py` copia dist para saída própria, remove somente assets obsoletos do pacote (não da fonte), acrescenta instruções/relatório e verifica CRC. Servir essa pasta com `python3 -m http.server 4305 --bind 127.0.0.1 --directory /workspace/orion-v24-cloudflare-upload`. Não apresentar o loopback como prévia pública. `package-review-v24.mjs` exercita exatamente essa saída, incluindo rascunho e retomada. Os personagens do teste são fictícios.

`capture-v24.mjs` abre a estrela pela interface, registra o percurso normal até a conferência e captura estados desktop/mobile. A navegação real remove debug da URL na chegada; os contadores da criação não são inventados para esse vídeo. `capture-diagnostic-samples.json` contém a primeira amostragem direta com debug; `capture-validation.json` é o percurso normal do pacote HTTP. `inspect-v24.mjs` captura vínculo/identidade em Balanced, canvas nativo 1440×1000, e mede o fallback da cópia. Ajustar caminhos absolutos se reproduzir fora deste ambiente.

Vídeo: helper usa o FFmpeg Debian 7.1.5 existente, selecionado em memória apenas no registrador da captura, sem editar dependências ou substituir artefatos baixados. Transcodificado de WebM real para H.264, sem interpolar movimentos ou criar quadros artificiais. Ele mostra a renderização por software desta nuvem e não demonstra o FPS do usuário.

`cost-guard-v24.mjs` compara pacotes V23 (4304) e V24 (4305) com mesmo navegador, viewport, Eco e movimento reduzido. Verifica pixels, texturas, superfícies e limite de um draw adicional. Não é benchmark de ganho de FPS. A instrumentação do pacote também verifica zero draws durante 500 ms com o papel ativo.

`preservation.json` confere 56 assets rastreados da fonte, 40 recursos nativos do ZIP anterior (36 imagens/fontes/vetores e quatro modelos), HEAD/status do Fichas. `rules-snapshot/provenance.json` e o unitário novo conferem os 30 arquivos puros exatos. Nenhum Worker ou usuário real foi copiado. O Fichas protegido passou seus 1.319 testes e guardas locais; não houve chamada remota.

Os logs tiveram somente códigos ANSI e espaços finais removidos para leitura. Workflow de CI configurado para Node 24; não se afirma execução no GitHub Actions. `artifact.json` e `.sha256` identificam o ZIP; salvar o rascunho de startup do ambiente não publica nem valida uma restauração futura.
