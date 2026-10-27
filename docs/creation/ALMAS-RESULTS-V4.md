# V4 — Almas e camadas

27/10/2026. Prévia visual estática para upload manual no Cloudflare Pages; o conteúdo inclui animação WebGL em execução. Homologação visual pelo usuário pendente.

## Analisado

Estudo em ESTUDO-V4-DIRECAO-E-CAMADAS.md e inspeção dos rigs de imagem usados nas mãos. Os critérios pertinentes do documento de diretrizes enviado pelo usuário foram aplicados a anatomia/gesto, hierarquia, materiais, continuidade dos vínculos e distinção entre produção, testes e homologação.

## Implementado

- Duas imagens novas de silhuetas, com alpha verdadeiro: feto e atlas das duas almas. A primeira geração trouxe cabelo/proporções inadequadas e foi substituída por edições específicas no gerador. Os PNGs finais são cópias integrais dessas saídas. A composição foi inspecionada em fundo neutro e na cena. São artes geradas com revisão de contorno, não alegação de autoria manual ou de ausência de origem generativa.
- Três `SkinnedMesh` com esqueletos próprios de 16 ossos, malhas 48×64 e pesos normalizados. Controles de coluna, pescoço, cabeça e membros; flutuação e flexões pequenas, fases diferentes e resposta sutil da cabeça à seleção. Pivôs calibrados separadamente para a pose fetal e as duas poses diagonais. As mãos existentes não foram alteradas.
- É rig de imagem em **2,5D**: deforma vértices de uma silhueta pintada em plano. Não há volume corporal oculto, giro orbital ou transformação anatômica entre feto e crianças. A separação continua usando luz/revelação conforme a transição aprovada.
- Névoa procedural em dois planos distintos, um atrás e outro à frente do feto, com transparência, densidade e fase diferentes. Controles DOM estáveis permanecem separados da arte animada.
- Correntes substituídas por **144 elos geométricos instanciados** em duas trajetórias coerentes. Elos alternam a orientação; cada elo pertence exclusivamente ao lote traseiro ou dianteiro. Um fecho com arco/placa e abertura própria ocupa um cruzamento próximo. Material âmbar com iluminação contida calculada no shader; sem pintura de metal cromado ou aura intensa permanente. A soltura transforma cada elo separadamente. Não é simulação física de colisões.
- Fundos refeitos por shader com pigmentos abstratos de baixa frequência: vinho/preto no início, cinza/violeta discreto depois, poucas estrelas e pulsação leve. As fotos de tecido literal e de nuvens brancas não são carregadas pela nova cena. Os assets anteriores permanecem no repositório, mas não entram no ZIP V4.
- Mesmos tempos do clarão e da mudança cromática aprovados. “Tornar Marcado” conserva o botão e não inicia gesto das mãos. Seleção, nome, exclusividade de gênero e rascunho local preservados; a próxima etapa de criação não foi inventada.
- Movimento reduzido mantém rigs em repouso, ruído/ambiente sem animação temporal, sem deslocamento dos elos ou partículas. Dissolução curta mantém o fluxo utilizável.
- Nenhuma dependência, renderer ou loop RAF novo. Geometria de elos e material compartilhados; divisão da atmosfera por perfil de qualidade. Perfis existentes de resolução são respeitados.

## Verificações

Resultados finais e capturas em `almas-validation/`, executados com Node 24.19.0:

- `npm run check`: aprovado.
- 16 arquivos unitários: aprovados, zero falhas/skips.
- Build completo: aprovado com a fotografia ESO e os assets locais.
- 22 cenários de criação/navegação: aprovados sem retries.
- 8 cenários de criação: repetidos e aprovados após os ajustes finais de modo reduzido e shaders.
- Pacote HTTP estático em desktop 1440×900 e toque 390×844/844×390, Balanced: fluxo completo aprovado, sem erros JS/console/HTTP.

Os logs são de execução local; nenhum resultado de CI remoto é alegado. A nova unidade foi acrescentada à configuração de CI existente. O teste unitário novo verifica pesos/índices, deformações finitas e pequenas, triângulos sem inversão em poses amostradas, retorno ao repouso no modo reduzido e separação/soltura dos lotes de correntes. Não substitui revisão anatômica ou aceitação do usuário.

Os cenários de navegador incluem imagens, três malhas articuladas e seus ossos, frente/verso da névoa, paralaxe reversível, ruptura sem gesto, chegada pelo observatório, gêneros/nome/rascunho, teclado, movimento reduzido, toque vertical/horizontal e regressões de 1–3 estrelas, retorno e véu de navegação. A revisão final de movimento reduzido é conferida novamente no build final.

O pacote é aberto separadamente por servidor HTTP local, com capturas reais em 1440×900, 390×844 e 844×390. Contadores de draw calls/texturas e dimensões das texturas de ossos, quando presentes, são observações de recursos, não medidas de VRAM total ou garantia de FPS. Chrome headless usa SwiftShader; desempenho em GPU física e teclado virtual de aparelho real não foram homologados.

## Preservação e entrega

Observatório original, módulos de mãos/seleção/viagem/véu e repositório Fichas PR179 preservados. Nenhuma conta, dado de ficha, regra de jogo, migração, produção, merge ou nova PR foi alterada. Rascunho de identidade continua local à aba. Entrega: ZIP com index.html na raiz, assets, licenças e documentos de estudo/resultados.
