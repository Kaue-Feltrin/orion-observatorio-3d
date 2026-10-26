# Revisão cinematográfica V2 — resultado verificável

Esta revisão atende ao pedido de camadas de imagem, cenário interno da nebulosa, paralaxe, botão redesenhado sem gesto de clique e ruptura/revelação com linguagem de VFX de jogo. A arte e o movimento continuam sujeitos à revisão visual do usuário.

## Analisado

Pesquisa registrada em [CINEMATIC-RESEARCH.md](CINEMATIC-RESEARCH.md): quatro exemplos oficiais Three.js r180 (tesselação, billboards instanciados, bloom seletivo e skinning/morph). Código consultado efetivamente nesta sessão, classificado como demonstração técnica. Não foi apresentada evidência de uso de nossos efeitos em jogo AAA comercial.

## Implementado

- Cinco PNGs locais: interior da nebulosa, silhueta fetal, campo, correntes/cadeado e atlas das duas figuras. Imagens com transparência real, dimensões e hashes em `public/assets/creation/manifest.json`. Os arquivos são saídas do gerador preservadas; recortes e composição ocorrem por UV no renderer.
- Fundo exclusivo da criação, com uma textura compartilhada entre plano distante e véus em profundidades diferentes. Mesma câmera, paralaxe e renderer do Observatório; foto original e navegação 1–3 da primeira página preservadas.
- “Tornar Marcado” virou uma ação tipográfica integrada ao cenário. A ação limpa o gesto anterior e não inicia outro; somente interações com as figuras usam o apontamento.
- Ruptura no WebGL: 36 células Voronoi por camada quebrável, fissuras luminosas, rotação/impulso por célula e um lote de 64 partículas. Fragmentos pequenos remanescentes cintilam lentamente. Geometria e textura são compartilhadas; sem uma malha/arquivo por fragmento.
- Linha de tempo com antecipação, fissura, liberação, dissolução da figura fetal e revelação das outras duas figuras. A sequência termina no mesmo loop da cena, não em um temporizador CSS de peças HTML.
- A chegada aguarda as imagens antes de retirar o véu; o convite inicial preaquece os assets de criação. Movimento reduzido usa uma passagem curta sem deslocamento dos fragmentos, voo de partículas ou paralaxe.
- Planos transparentes usam uma passagem com `forceSinglePass`. Campo e partículas participam do bloom seletivo nos perfis que já o habilitam. Nenhum renderer, dependência ou loop RAF adicional foi criado.
- Corrigido um vazamento de recorte do atlas: os dedos da menina ultrapassavam o limite de 50% e apareciam no sprite do menino. O limite final é 52%, preservando os dois contornos.

É **composição 2,5D com VFX**, não morph anatômico 3D nem simulação rígida de correntes. Os dados permanecem fictícios e a continuação entrega somente um rascunho local de identidade. O próximo estágio não foi inventado.

## Testado

- `npm run check`: aprovado.
- 15 arquivos de testes unitários: aprovados, zero falhas/skips. A unidade nova verifica cobertura dos polígonos, UVs preservados, impulso coerente por célula, ordem dos eventos e movimento reduzido.
- Oito cenários de criação/WebGL: aprovados sem retries; incluem imagens carregadas, paralaxe reversível, botão sem gesto, ausência de animação DOM de ruptura, céu inicial separado, viagem real, exclusividade de gênero/nome/continuação, teclado, toque 390×844 e 844×390 e movimento reduzido. Nova rodada final repetiu esses oito cenários após os ajustes.
- Três regressões de navegação: uma estrela/destino I, duas/destino II e três/destino III; chegada e retorno corretos.
- `npm run build`: aprovado com os assets da ESO e as novas imagens. O bloqueio de rede da etapa anterior foi resolvido nesta máquina; ele não é bloqueio atual. Bundle final refeito depois da correção do atlas, reutilizando esses assets preparados.
- Pacote estático testado em desktop Eco, mobile Eco e desktop Balanced: viagem, cinco imagens locais, VFX e continuação completos; zero erros HTTP/JS. O recorte final do atlas também foi conferido novamente no pacote Balanced.

## Capturas, vídeo e desempenho

Gravações reais em 1920×951, 390×844 e 844×390 em `/workspace/observatorio-cinematic-final/`. Sem congelar relógio, injetar poses ou trocar câmera. Há uma recarga explícita da chegada com debug para obter seus contadores, registrada pelo script. As imagens de pesquisa/arte não foram apresentadas como capturas do jogo.

`cinematic-validation/` preserva logs, observações e recortes da rodada. Ela foi gravada em Chrome headless/SwiftShader, perfil Eco, antes da otimização de passagem única: criação selada desktop 6 FPS/p95 550 ms; identidade desktop 9 FPS/p95 183,4 ms; criação/identidade móveis 35–57 FPS/p95 16,8–83,3 ms. São amostras curtas sob gravação, não benchmark de GPU física nem comparação A/B equivalente.

Naquela rodada, selado/identidade: 16/15 draw calls desktop, 12/11 no toque; 9/10 texturas desktop e 4/5 no toque. Heap JS registrado, mas RAM total/VRAM em bytes não medidas. Os contadores não justificam afirmar que a meta de 60 FPS foi atingida. A passagem única foi verificada funcionalmente no pacote final, sem transformar uma estimativa em nova medição de desempenho.

Capturas adicionais Balanced mostram a arte com maior resolução e foram conferidas para transparência/recorte. A correção de UV não altera o arquivo PNG do atlas nem a primeira página.

## Homologação e entrega

Homologação visual pelo usuário, desempenho em GPU real e teclado virtual de aparelho físico ainda pendentes. Não houve alteração de produção, merge ou integração com fichas/contas reais. A entrega é um ZIP estático para upload direto no Cloudflare Pages, com pesquisa incluída e sem dependência de build/GitHub no painel do usuário.
