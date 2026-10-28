# V16 — Madeira contínua, ícones e marcas de tinta

28/10/2026. Refinamento do protótipo visual V15 na branch `feat/nascimento-marcado`. Implementado e testado em Chrome. Acabamento artístico e aparelho físico ainda aguardam avaliação do usuário.

## Falha reproduzida e correção

A madeira desaparecia na parte inferior depois de rolar a folha. O contêiner de rolagem também tinha `perspective`, criando um bloco de referência para os descendentes `position:fixed`. Assim, as tábuas se deslocavam junto do conteúdo em vez de permanecerem cobrindo a tela.

A regressão executada sobre a V15 reproduziu o problema em 1855×711: o topo da camada de tábuas estava em **−489 px** após rolar. O teste falhou antes da correção, como esperado. A V16 separa `.paper-scroll` da camada fixa de madeira; só a folha e seus controles rolam. A perspectiva da folha fica nesse novo contêiner, sem englobar as tábuas.

Três regressões exercitam desktop 1855×711, móvel 390×844 e paisagem 568×320. Conferem a cobertura geométrica e os pixels de madeira na borda inferior após rolar até o fim. A captura final `1855-paper-bottom.png` reproduz a região mostrada pelo usuário com madeira cobrindo toda a tela.

## Ícones e acabamento implementados

- **66 pictogramas distintos em SVG**, um para cada origem do catálogo existente, com traços arredondados em tinta sépia. São representações editoriais de objetos e ideias — livro, maleta médica, lupa, ferramentas etc. Não são selos oficiais dos livros, imagens de personagens ou novas regras.
- Ícones pequenos na lista, maiores junto ao nome da origem aberta e também na comparação. Todos são decorativos para tecnologia assistiva; nomes e textos continuam identificando cada opção. Nenhum emoji ou recurso externo foi acrescentado.
- Bordas discretamente assimétricas na folha, retirada da moldura interna retangular, divisórias com tinta que se dissipa nas extremidades e seleção por uma mancha suave e sublinhado. Os interesses ativos usam uma marca oval.
- Botão de confirmação com contorno arredondado semelhante a um carimbo, mantendo texto, foco e área de toque. Campos nativos usam o esquema de cores claro da folha.
- Catálogo, filtros, guia, histórias, comparação, confirmação explícita, rascunho e retorno da V15 preservados. A textura da madeira não foi regenerada nem alterada.

O conjunto completo dos pictogramas renderizados está em `icons-66.png`. São vetores programados nesta revisão; não se atribui origem humana ou oficial às imagens. O material da madeira permanece a saída de `image_gen` já registrada na V15.

## Resultados reais

- Node 24.19.0. `npm run check` e bundle Vite aprovados.
- **20 arquivos unitários aprovados**, zero falhas/skips. A nova verificação cobre correspondência com todas as 66 origens, geometria distinta, SVG local e marcação decorativa. Não altera concessões ou regras.
- **10 cenários de navegador aprovados**: os três casos de cobertura da madeira, presença de ícones em lista/detalhe/comparação e os seis cenários anteriores da ficha. Estes incluem filtros, guia, Escape, nome tratado como texto, armazenamento recusado, retorno/reabertura e confirmação em 390×844, 320×568 e 568×320.
- O ensaio anterior à correção teve uma falha reproduzida da madeira. Não se apresenta essa rodada como aprovada. Log e captura antes/depois preservados.
- Pacote estático servido por HTTP: vídeo e capturas reais da sequência tábuas → papel → escolhas, captura do fim da folha em 1855×711 e fluxo móvel em 390×844. Tempo do shader da figura permanece congelado enquanto a folha cobre a cena. No ensaio, nenhum erro JavaScript, resposta HTTP de erro ou requisição de escrita remota.
- Amostragem local de contraste em 22 combinações de texto/janela, em 1440×1000 e 390×844, com transições desativadas apenas no ensaio: mínimo de **4,82:1** entre os textos examinados. Amostragem de estados selecionados, não certificação WCAG completa.

Evidências e logs em `acabamento-v16-validation/`. Testes de navegador usam Chrome headless/SwiftShader e toque emulado; não são homologação em GPU ou telefone físico e não demonstram FPS em hardware real.

## Preservação e limites

`main.js`, `herald-creation.js`, catálogo, descoberta, CSS/camadas/rig da criação e sigilos permanecem idênticos à V15 (`70923b6b1b4aaa3dbe405f7ffe83fc80c9b90b71`). Os módulos originais de seleção, viagem, véu e mesh das mãos continuam idênticos à origem. Alterados somente a apresentação da folha, os pictogramas e o manifesto visual, além dos testes e documentação da revisão.

Órion Fichas continua em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, com árvore rastreada limpa. Sem mudanças no motor, no Órion principal, em contas, D1, migrações, produção, merge ou PR nova. ZIP para upload manual; sem deploy Cloudflare.

Continua um protótipo de criação com rascunho de sessão. Não foram implementadas retomada automática após recarregar, próxima etapa mecânica, concessão de benefícios ou nova conferência integral dos livros. A lista de referência continua com 66 origens; os ícones não representam homologação ou elegibilidade mecânica.
