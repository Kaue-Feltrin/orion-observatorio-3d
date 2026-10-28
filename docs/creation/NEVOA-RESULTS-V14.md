# V14 — Névoa na identidade e controles sem painéis

28/10/2026. Revisão da criação visual do Observatório, em resposta à captura da V13. Implementada e testada em Chrome; aprovação artística pelo usuário e homologação em telefone físico pendentes.

## Diagnóstico e mudanças

A V13 preservava os planos orgânicos depois de retirar sua cor. Por isso a segunda etapa continuava parecendo carne cinza. Os painéis opacos melhoravam o contraste, mas interrompiam a cena; a regra genérica de foco também prevalecia sobre a opção de personagem, desenhando uma moldura grande.

- **Primeira tela:** duas novas imagens vermelhas de 1536×1024 com alpha, compostas como dobras foscas e ilustradas. Menos textura anatômica, sem os vasos e o brilho molhado da V12. A direção é uma sugestão de matéria viva em segundo plano. O resultado deve ser avaliado nas capturas, não por uma alegação de acabamento AAA ou de origem humana.
- **Segunda tela:** os planos vermelhos perdem alpha durante a transição e são ocultados ao final. Permanecem a base preta e as duas névoas cinzas, com presença ajustada e deslocamento muito lento. Não há conversão de carne vermelha em carne cinza. Movimento reduzido congela o deslocamento.
- **Interface:** removidos os fundos retangulares de título, opções, nome e status. Gradientes radiais desfocados sustentam a leitura sem bordas duras. Nome conserva somente a linha inferior; seleção conserva legenda textual e linha dourada. O foco de teclado na opção usa sublinhado, sem moldura ao redor de toda a figura.
- **Preservado:** fluxo em Grid, rolagem em telas curtas, coluna da seta, textos de ajuda e áreas de clique separadas da V13. Fonte, feto, figuras, rig e animação de transição existentes não foram regenerados nesta revisão.

## Método e resultados reais

Foi reaplicado o método do review: inspeção de capturas do renderer real, regressões dos destinos de clique e reflow, inspeção do estado das camadas e medição local de contraste sob glifos.

- Node 24.19.0; `npm run check` aprovado; 18 arquivos unitários aprovados, zero falhas/skips; bundle Vite aprovado com recursos locais já preparados.
- Rodada final: **10 testes de navegador aprovados**. Inclui carregamento antes da apresentação, pulsação/movimento reduzido/toque, foco por teclado e retirada efetiva dos dois planos vermelhos. Reflow exercitado em 1440×900, 390×430, 568×320, 320×568 e 320×256, incluindo cliques nas bordas dos controles e rascunho correto.
- A rodada inicial teve **9 aprovados e 1 falha real**: a nova asserção identificou um fundo opaco remanescente no título. A inspeção também encontrou gradientes sem âncora local, cobrindo a cena e escondendo as figuras. CSS corrigido com fundo transparente e posicionamento local; a rodada final de dez cenários foi executada após o build estabilizar.
- Pacote estático servido por HTTP: capturas Balanced em 1440×900 e 390×844, captura de foco por teclado e gravação móvel com toque emulado. Fluxo até nome/representação/rascunho aprovado, sem erros JavaScript ou respostas HTTP de erro. A primeira tentativa de gravar vídeo falhou porque o caminho do FFmpeg do Playwright não estava configurado; reexecutada com `PLAYWRIGHT_BROWSERS_PATH`, aprovada.
- Pulsação conferida no inspetor e em dois ciclos no renderer móvel: saturação 30–100%, brilho 75%, escala 1–1,02, alpha constante e vermelhos sincronizados. Amostra final: 90 frames, extremos normalizados aproximadamente 0,000008 e 0,999934. As camadas cinzas não pulsam.
- Contraste local estabilizado com movimento reduzido, Balanced: mínimos em 1440×900 de 17,06:1 (título), 12,93:1 (subtítulo), 13,65:1 (rótulo), 12,93:1 (opção sem gênero), 12,33:1 (status). Em 390×844, mesmos textos entre 12,33:1 e 17,06:1. Amostragem local de estados selecionados; não é certificação WCAG completa.

Evidências e logs em `nevoa-v14-validation/`. `1440-identity.png` mostra o estado neutro, `1440-keyboard.png` mostra o foco de teclado e `390-balanced-identity.png` mostra a seleção e nome preenchidos. O vídeo registra o pacote entregue, não um conceito pré-renderizado.

## Integridade e limites

Manifesto atualizado com arquivos ativos, origem e hashes. Os dois novos PNGs são saídas nativas de `image_gen`, em edições referenciadas das imagens V12, preservadas sem alteração de pixels. Base, névoas, feto, figuras e fonte foram preservados byte a byte. Os quatro módulos originais de viagem, seleção, véu e mesh das mãos continuam idênticos ao commit de origem `a45c8d6d89c5be4892fa049ed755218fad3fb006`.

Órion Fichas permanece no HEAD `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, com árvore rastreada limpa. Revisão limitada ao protótipo visual. Sem deploy Cloudflare/produção, merge, PR, migração remota ou gravação em conta real. O ZIP é para upload manual.

A continuação ainda grava somente um rascunho local de sessão; próxima etapa e retomada não foram implementadas. Testes headless/SwiftShader e toque emulado não homologam GPU, navegador, teclado virtual ou desempenho de telefone físico. Qualidade visual e atmosfera continuam sujeitas à avaliação do usuário.
