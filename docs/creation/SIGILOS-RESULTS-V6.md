# V6 — Acorrentado pela realidade

27/10/2026. Revisão da criação: a frase na fonte fornecida substitui as correntes e o campo de força; o cenário recebe nova atmosfera. A direção visual continua sujeita à avaliação do usuário.

## Implementado

- Fonte `SigilosDeConhecimento.ttf` extraída de `sigilos_de_conhecimento.zip`, preservada byte a byte. A família interna é “Sigilos De Conhecimento”; o alias de execução é `OrionKnowledge`. Os caracteres da frase existem no cmap da fonte. Não foi gerada uma imagem com letras inventadas nem aplicado esse alfabeto aos campos e botões da interface.
- Texto-base exato: **Acorrentado pela realidade**. Duas cópias completas em cada uma de duas faixas orbitais, separadas por espaços. São 96 glifos lógicos; as duas passagens de composição dianteira/traseira compartilham a mesma geometria e um único atlas de alpha.
- O atlas é desenhado com Canvas somente depois de `FontFace.load()` concluir e a fonte ser registrada. Os glifos usam o mesmo tamanho tipográfico e margens de célula; planos quadrados preservam suas proporções. O carregamento da arte/chegada aguarda a fonte real, sem desenhar letras de fallback.
- Órbitas calculadas no shader, com inclinações e sentidos diferentes. A profundidade de cada glifo determina sua participação na camada traseira ou dianteira. As letras circulam ao redor do feto; não é uma rotação CSS de um bloco de texto.
- Campo de força, névoa circular, cadeado e elos físicos retirados da cena ativa. O módulo histórico de elos permanece no repositório, sem import no caminho da aplicação. Nenhuma textura de escudo é carregada nesta versão. O contorno sombreado da própria arte fetal permanece.
- Ao Tornar Marcado, os glifos se dispersam e desaparecem na transição existente. O botão continua sem gesto das mãos. Movimento reduzido mantém as órbitas paradas e usa dissolução curta, sem voo de letras.
- Nova pintura de tinta cósmica em vinho/preto, poeira distante e massas de profundidade. A composição é uma textura original gerada para o estudo, preservada sem edição de pixels; a aplicação faz deriva, paralaxe e mudança cromática no shader. Na segunda etapa a mesma atmosfera perde a cor e vai para cinza/violeta. O enquadramento retrato foi ajustado para manter detalhes laterais sem perder o foco central.
- Feto, duas silhuetas/rigs, formulário, escolhas exclusivas e rascunho local da V5 preservados. A primeira página, mãos/seleção/viagem/véu originais e os dados/regras de Fichas permanecem fora da mudança.

## Correção reproduzida

Um caso móvel encontrou deslocamento e recorte da cena ao focar o nome. O fallback de céu antigo usava inset negativo/escala dentro de um contêiner com `overflow:hidden`, gerando área rolável desnecessária. Na criação, fallback agora ocupa o próprio quadro, e os contêineres usam `overflow:clip`. As verificações seguintes exigem scroll zero tanto no painel quanto em `#observatory`, além de alvos dentro da tela. As regras do Observatório original não foram alteradas.

## Verificações

Logs/capturas e vídeo `SIGILOS-V6.mp4` em `sigilos-v6-validation/`. O vídeo é captura do pacote no navegador emulado 390×844, transcodificada de WebM para MP4 sem alterar a cena.

- `npm run check`: aprovado.
- 17 arquivos de testes unitários: aprovados, zero falhas/skips. A nova unidade reconstrói a frase por órbita, verifica espaços/palavras, índices do atlas e dados instanciados finitos.
- As 14 regressões de navegação existentes passaram na rodada abrangente: destinos 1–3, retorno, toque, câmera e véu.
- Os 9 cenários de criação passaram na rodada de liberação, incluindo fonte real carregada, atlas com alpha, ausência de campo, circulação temporal, dissolução sem gesto, teclado, movimento reduzido e alvos móveis sem scroll.
- Os 4 cenários específicos de arte/fonte passaram novamente após o ajuste final de tamanho dos glifos. Uma asserção do teste de fonte atrasada foi corrigida para observar o marco de chegada (`arrivalReady`/véu), em vez do marco de inicialização técnica do renderer (`sceneReady`); nenhuma validação de funcionamento foi desativada.
- Build completo aprovado; bundle final refeito para a apresentação dos glifos. O pacote HTTP estático final passou sem erros de JS/console/HTTP e com alvos dentro da tela/scroll zero nos dois contêineres. Foi verificado separadamente em 1440×900, 390×844, 844×390 e 320×568, perfil Balanced, cobrindo cena, transição, nome e continuação local.

As prévias são capturas e gravação do navegador executando o pacote, não mockups do gerador. Chrome headless usa SwiftShader; não se afirma FPS de GPU física ou homologação em aparelho real. Os corpos continuam sendo rigs de imagem em 2,5D; glifos têm posicionamento orbital tridimensional e composição por profundidade.

## Origem da fonte e entrega

O ZIP enviado continha apenas o TTF, sem documento de licença separado. A origem do arquivo é registrada como fornecimento do usuário; não se atribui licença fictícia ou autoria ao projeto. O TTF incluído no pacote é idêntico ao enviado.

Entrega estática para upload manual no Cloudflare Pages, com fonte, imagens, modelos/licenças anteriores necessários e resultados. Assets de campo/correntes antigos não usados são excluídos do ZIP, preservando o repositório. Sem publicação de produção, migração, merge ou nova PR. A continuação segue guardando apenas o rascunho local da aba.
