# Reprodução e evidências V25

Base: `1aa438782f030861bcc1d21390fca10d2550e65f`, branch `feat/nascimento-marcado`. Fonte Fichas `f80bbaacc8acb4ad0158d43fb923e2f421e58528` somente leitura. Relatório: [resultados](../RECRUTAMENTO-RESULTS-V25.md).

## Ambiente

Node 24.19.0, SQLite embutido 3.53.3, Playwright 1.56.1, Google Chrome 156.0.8078.47 e SwiftShader. Rede externa do build ESO não reexecutada: assets cacheados preservados. Vite preview 4173 para testes do build, servidor Python 4306 para o conteúdo extraído do ZIP. Nenhuma publicação foi executada. Portas e caminhos abaixo são locais desta validação, não links para o usuário.

## Comandos e critério

Na pasta `orion-observatorio-upload-github-leve`:

```sh
npm run check
node --test tests/*.unit.mjs
npx vite build
npx vite preview --host 127.0.0.1 --port 4173
npx playwright test --config=playwright.local.config.js tests/creation-journey.spec.js tests/recruitment-v25.spec.js tests/origin-paper.spec.js tests/origin-reading-v17.spec.js tests/class-carousel.spec.js tests/herald-navigation.spec.js tests/quality-diagnostic.spec.js
```

A configuração local ignorada usa `workers: 1`, Chrome em `/workspace/orion-validation-pr179/chrome/root/opt/google/chrome/chrome` e as flags herdadas `--use-gl=angle`, `--use-angle=swiftshader`, `--enable-webgl`, `--enable-unsafe-swiftshader`. Adaptar o caminho ao navegador instalado. Não reconstruir dist durante testes/capturas.

Os logs mantêm resultados reais, inclusive falhas intermediárias; apenas ANSI e espaços finais foram removidos. `browser.log` tem 55 cenários, 54 aprovados e a falha de rolagem anterior ao ajuste do relógio. `final-browser.log` tem 28 cenários, 27 aprovados e o plural antes da correção. `regression-final.log` tem 12 cenários, dez aprovados, prazo da roleta e corrida do diagnóstico. `remaining-final.log` aprova os três cenários finais afetados. `new-browser.log` conserva a primeira investigação da nova suíte, incluindo erros de expectativa/fixture posteriormente corrigidos. `test-summary.json` consolida o resultado mais recente por identificador Playwright: **59 distintos aprovados**, sem somar repetições. Não equivale a alegar que todas as rodadas intermediárias passaram. Os 25 arquivos unitários/check/build passaram; os 1.319 testes do Fichas pertencem à rodada V24 e não foram repetidos nesta rodada.

Verificações incluem decisões completas nas três classes, edição/retomada, orçamento, idade, busca orientada, comparação, ícones, quota recusada, idempotência, recarga durante escrita, stars paginadas, texto escapado e carregamento sem dados da demonstração. Rolagem testa posição intermediária e cancelamento por entrada, sem inferir suavidade física da GTX 1660. Recrutamento normal verifica estados de foto, caneta e carimbo; reduzido/antecipado preserva o registro.

## Imagens, vídeo e ZIP

```sh
node docs/creation/recrutamento-v25-validation/capture-v25.mjs
python3 docs/creation/recrutamento-v25-validation/package-v25.py
node docs/creation/recrutamento-v25-validation/package-review-v25.mjs
```

Os auxiliares usam Astra fictícia. A captura prepara escolhas para focalizar o pedido, realiza ações reais na interface e grava o navegador; não é vídeo sintetizado nem representa percurso iniciado do zero. A suíte de criação completa percorre as decisões. Capturas registram comparação, idade, perícias, ícones, conferência, escrita, carimbo, ficha e estrela. Mobile é emulado em 390×844/320×568; testes também cobrem 568×320.

O helper de vídeo aponta em memória a interface FFmpeg do Playwright para `/usr/bin/ffmpeg` (Debian 7.1.5), sem editar node_modules. O WebM original foi transcodificado com `ffmpeg -i FLUXO-V25.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an FLUXO-V25.mp4`; duração/tamanho/resolução em `video-metadata.json`.

`package-validation.json` registra o ZIP efetivamente servido por HTTP: criar, concluir, exportar JSON, recarregar e encontrar estrela; 0 draws WebGL durante 500 ms de recrutamento. `capture-validation.json` registra erros JS/HTTP/requisições de escrita. `preservation.json` compara 56 assets rastreados e 40 recursos nativos do ZIP byte a byte com a V24, além de HEAD/status do Fichas. CRC/raiz do ZIP verificados; SHA e tamanho em `artifact.json`. A montagem altera somente a pasta de saída própria `/workspace/orion-v25-cloudflare-upload`; a fonte existente é preservada.

Registro concluído **local ao site/navegador**, chaves individuais `orion-character-v1:`. Não há autenticação, criação de conta, D1 ou ativação oficial. Não usar teste local como homologação dos efeitos pendentes de regras. Aprovação artística e teste Brave/GTX 1660 físicos seguem pendentes. Nenhum recurso de produção foi modificado.
