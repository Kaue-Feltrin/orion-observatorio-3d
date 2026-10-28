> Revisão visual atual: [V12 — Membranas orgânicas](ORGANICO-RESULTS-V12.md). Duas artes vermelhas refeitas; efeitos preservados. Aprovação artística pendente e falha estrutural pré-existente registrada.

> Histórico V11: [V11 — Vermelho preservado e brilho menor](COR-RESULTS-V11.md). Saturação 30–100% e brilho 75%; sincronismo e expansão preservados.

> Histórico V10: [V10 — Saturação sincronizada](SATURACAO-RESULTS-V10.md). Saturação 0–100–0%, escala até 1,02 e correção da pulsação em toque.

> Histórico V9: [V9 — Cinco camadas e atmosfera pulsante](CAMADAS-RESULTS-V9.md). Base preta, quatro PNGs transparentes distintos, carregamento próprio e silhuetas jovens.

> Histórico V8: [V8 — Voltar, brilho e interação](INTERACOES-RESULTS-V8.md). Quatro componentes de fundo com máscaras distintas, paralaxe suave, dourado e convites visíveis.

> Histórico V7: [V7 — Corpo opaco, cinco faixas e novas silhuetas](SIGILOS-RESULTS-V7.md). Fundo com composição própria para retrato e resolução automática revisada na criação.

> Histórico V6: [V6 — Acorrentado pela realidade](SIGILOS-RESULTS-V6.md). Fonte enviada pelo usuário, órbitas de sigilos e novo fundo; sem campo de força.

> Histórico V5: [V5 — Nova composição](ORIGEM-RESULTS-V5.md). Capturas reais e resultados nesse documento.

> Histórico V4: [V4 — Almas e camadas](ALMAS-RESULTS-V4.md). [Estudo e decisões](ESTUDO-V4-DIRECAO-E-CAMADAS.md). Os registros V1–V3 abaixo são históricos.

> **Histórico V2:** a versão cinematográfica V2 substitui os vetores e a ruptura CSS descritos abaixo. Veja [pesquisa](CINEMATIC-RESEARCH.md) e [resultado/testes/limitações](CINEMATIC-RESULTS.md). O histórico abaixo documenta a primeira implementação. O build completo da V2 já passou com a fotografia ESO incluída.

# Criação inicial do arauto — prévia local

Implementação baseada no ZIP/commit `a45c8d6d89c5be4892fa049ed755218fad3fb006` da branch `codex/maos-rig-mmv`. Branch local `feat/nascimento-marcado`. Não houve push, publicação, merge, PR, migração ou conexão com dados reais.

## Fluxo implementado

1. No Observatório, abrir `?stars=0` (ou usar o link discreto da prévia). Uma única estrela central representa o convite para criar; não é uma ficha fictícia adicionada à coleção. As contagens 1–3 e o acesso histórico aos arautos permanecem.
2. O clique inicia os mesmos módulos de seleção, mãos, viagem e véu. Somente o destino da conta vazia passa a ser `criacao.html`.
3. Na chegada, silhueta fetal em campo luminoso, correntes e cadeado. O primeiro clique revela “Tornar Marcado”.
4. A ação dispara a ruptura conjunta. Durante a mesma animação, duas figuras se afastam do centro. Os campos aguardam o fim da ruptura antes de receber interação.
5. Menina, menino ou não definir gênero são alternativas exclusivas. A seta aparece após uma escolha; só habilita com nome não vazio. Nome é limitado a 60 caracteres e espaços nas extremidades são removidos na continuação.
6. A seta guarda somente um rascunho de identidade em `sessionStorage` e emite `orion:creation-continue`. Não cria ficha, personagem de conta, concessão, atributo, gênero presumido ou gravação remota. A próxima tela ainda não foi especificada. Ao recarregar, a experiência visual reinicia; o rascunho concluído fica disponível nesta aba para a futura integração.

O desktop reutiliza o rig e a amostragem do gesto de seleção. O mobile mantém a política da base: mãos ocultas. Teclado e preferência de movimento reduzido têm caminhos funcionais. `hands=off` e demais opções visuais são preservadas na viagem e no retorno.

## Arquivos

- `herald-catalog.js`, `main.js`, `index.html`, `styles.css`: estado vazio e conexão da experiência com os módulos existentes.
- `criacao.html`, `creation.css`, `creation-figures.js`: capítulo visual, figuras vetoriais originais e ruptura.
- `creation-state.js`, `herald-creation.js`: sequência, exclusividade das escolhas, validação e entrega local.
- `arrival.js`: proteção para acesso direto à antiga chegada com coleção vazia.
- `vite.config.js`: inclui a nova página no build multipágina.
- Testes novos de estado e navegador; unidade incorporada ao workflow existente. Nenhum resultado de GitHub Actions foi verificado nesta tarefa.

Os arquivos `star-journey.js`, `star-selection.js`, `page-transition.js` e `first-person-hands-mesh.js` continuam idênticos à base. Os parâmetros de fotografia, qualidade e enquadramento não foram ajustados para fazer a nova cena passar.

## Executar localmente

Na pasta `orion-observatorio-upload-github-leve`, Node 24:

```sh
npm install --no-package-lock --no-audit --no-fund
npm run dev
```

Abrir o Observatório com `?stars=0`. A página de criação também pode ser inspecionada diretamente em `criacao.html`. Estes são caminhos locais de desenvolvimento, não um endereço hospedado entregue ao usuário.

## Verificação executada

- `npm run check`: aprovado.
- `node --test --test-concurrency=4 tests/*.unit.mjs`: 14 arquivos de testes passaram, incluindo criação, posições/viagem, mãos e continuidade.
- Rodada de navegador: 14 cenários distintos aprovados sem retries, incluindo o fluxo novo (5), navegação por destinos 1–3 e regressões de toque/mãos desligadas. Criação novamente exercitada depois dos refinamentos; testes de retrato/paisagem exigem seta a menos de 65 px da borda inferior.
- Corrigidos durante a execução: alvo inicial herdava `pointer-events:none`; área de clique flutuava junto da arte; transformações do contêiner deslocavam a seta; mensagem de nome permanecia desatualizada depois de preencher.
- `vite build`: empacotamento das três páginas aprovado. **Não equivale ao comando completo de build** descrito abaixo.
- `scripts/capture-creation.mjs`: percorre a experiência com entradas/relógio reais, registra quatro capturas por viewport, vídeos e diagnóstico do motor existente. Uma recarga explícita da chegada em debug é feita apenas para obter seus contadores; o salto anterior é real. Sem injeção de pose, câmera ou tempo. Evidências locais em `/workspace/observatorio-creation-evidence/`.

Capturas/observações: 1920×951, 390×844 e 844×390; zero erros JS nas três gravações. A verificação da foto em `observations.json` é necessária: respostas HTTP 200 do fallback do servidor não comprovam decodificação da textura.

## Limitações e bloqueio de build

`NODE_USE_ENV_PROXY=1 npm run build` falhou no passo **pré-existente** que baixa a fotografia de `cdn.eso.org`: acesso recusado pela rede (403 confirmado com curl). A foto ESO e seus recortes não foram substituídos, e a preparação original não foi desativada. O domínio foi acrescentado ao rascunho de rede do ambiente; salvar um rascunho não aplica nem publica essa configuração.

Nas capturas, `astronomyPhotoLoaded=false`; o fundo visível vem das camadas/fallbacks já existentes no projeto. Portanto, essas capturas validam composição e interação desta prévia, **não** a reprodução integral do cenário com a fotografia original. É necessário liberar o domínio e executar o build completo antes de homologar a composição final.

Medições foram obtidas em Chrome headless/SwiftShader, perfil Eco, com gravação e poucas amostras. Não são medição de GPU real nem comparação A/B equivalente entre versões. A rodada inicial observou 6–30 FPS e p95 entre 116,7 e 466,6 ms; não se declara meta de 60 FPS atingida. Contagens do renderizador: 14 draw calls/7 texturas na criação desktop e 10/2 no toque. Duas superfícies de mãos no desktop e zero no toque. Heap JS foi observado, mas RAM total e VRAM em bytes **não foram medidas**. O diagnóstico local preserva os valores completos por etapa.

As silhuetas são a primeira arte vetorial da prévia, não assets anatômicos finais. Ainda pendem revisão visual do usuário, cenário completo, desempenho em dispositivo físico e integração futura com contas/fichas. Não houve homologação de produção.

## Capturar novamente

Com dev/preview ativo e navegador/FFmpeg do Playwright instalados:

```sh
CREATION_EVIDENCE_DIR=test-results/creation node scripts/capture-creation.mjs
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permite apontar um Chrome já instalado. Nesta máquina foi usado Chrome 156.0.8078.47 e FFmpeg 7.1.5 do sistema, disponibilizado ao Playwright num diretório local; nada foi instalado fora do workspace. Reexecuções geram evidências novas e podem sobrescrever as capturas do mesmo destino.

## Evidências finais preservadas

Os quatro recortes em `captures/` mostram bebê selado e identidade após os ajustes finais. `validation/observations-final.json` contém as três gravações finais; vídeos e todas as doze capturas permanecem em `/workspace/observatorio-creation-evidence-final/`. A rodada inicial foi preservada separadamente. Em todas as três execuções finais houve zero erros JS e a foto ESO continuou não carregada; nenhum HTTP 200 de fallback foi tratado como aprovação da textura. Esses arquivos são evidências locais, não anexos ou links publicados no chat.

## Atualização de entrega autorizada

Após a implementação local, o usuário autorizou enviar esta branch e gerar uma prévia isolada. O commit de código `9a82846` foi enviado para `origin/feat/nascimento-marcado`. Os avisos anteriores de ausência de push descrevem a fase local da implementação. A verificação de build/publicação continua bloqueada pela rede; não foi confirmada uma URL de deployment e não houve merge nem alteração de produção. As capturas versionadas podem ser consultadas diretamente na branch do GitHub.
