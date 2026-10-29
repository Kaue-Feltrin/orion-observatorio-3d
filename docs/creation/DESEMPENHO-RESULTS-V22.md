# V22 — Custo de desenho, medição e correções

28/10/2026 (São Paulo). Revisão do Observatório independente, base V21 `c4bacd13907a9e1c1ac8fbdeb5d66f28feebf719`, branch `feat/nascimento-marcado`. Não é mudança da versão das regras ou do Órion Fichas.

## Analisado

A V21 reduziu leituras de layout, mas não demonstrou aumento de FPS. Nesta revisão foi instrumentada a execução dos desenhos, por objeto/programa, com `EXT_disjoint_timer_query_webgl2`, separada do benchmark de FPS. A instrumentação é intrusiva e serve para localizar custo; não é homologação da GPU do usuário. O ambiente usa Chrome/ANGLE/SwiftShader por software, sem a GTX 1660 física.

Na amostra de nascimento, o fundo consumiu 57,3% do tempo de desenho acumulado, silhueta 16,6%, sigilos 7,8%. Na identidade, fundo 41,9% e silhuetas 33,4%. Atualizar os objetos em JavaScript custou em média menos de 0,14 ms por chamada, enquanto cada quadro levava centenas de ms em software. O cache de layout anterior atuava numa parcela pequena do gargalo.

No Observatório, 31,7% do tempo de desenho medido veio do gás procedural; texturas e transparências também custam. Essas proporções são observações desta configuração, não medidas do Brave do usuário. O renderer efetivo do PC ainda precisa ser confirmado pelo diagnóstico do menu Fluidez; ter uma GTX instalada não confirma que o WebGL está usando essa placa.

## Implementado

- **Silhuetas:** o ruído de dissolução passa a ser calculado apenas quando `uReveal < 1`. Totalmente revelada, a máscara antiga é matematicamente 1. Pixels de cobertura opaca também dispensam as quatro consultas de alpha que só poderiam produzir contorno zero. Consultas no contorno e fora do corpo, brilho, carga e seleção foram preservados.
- **Fundo da criação:** transformações UV afins (proporção, âncora, zoom, pan e deriva) foram movidas para os quatro vértices de cada plano. As mesmas coordenadas são interpoladas; clamp e filtragem continuam no fragmento. Não se compõem as quatro imagens num shader único e não se retoma o experimento descartado na V21.
- **Observatório:** planos transparentes de névoa usam `forceSinglePass`, evitando desenhar o verso separadamente em quads planos. O mecanismo é documentado pelo Three.js em `Material.forceSinglePass` para superfícies planas transparentes. A alteração de `main.js` limita-se a esse parâmetro na fábrica de planos; câmera e viagem não mudaram.

Imagens, dimensões nativas, resolução, perfis/DPR, quantidade de camadas, sigilos, bloom, pulsação e rigs não foram reduzidos. As fontes e o visual da V21 continuam preservados.

## Método e resultados

Benchmark final sem queries de GPU nem outro navegador concorrente: duas pastas HTTP imutáveis (V21 porta 4302, V22 porta 4303), ordem A–B–B–A, duas repetições por versão/etapa. Canvas 829×927 = **768.483 pixels**, balanced manual, movimento ativo, mãos mesh originais habilitadas. Aquecimento de 1,8 s e amostra de 6 s por etapa. FPS medido por RAF, não por contador externo. Chrome SwiftShader por software.

| Etapa | V21, FPS | V22, FPS |
| --- | --- | --- |
| Observatório | 5.38–5.67 | 5.59–5.62 |
| Feto | 5.41–5.95 | 6.50–6.54 |
| Identidade | 6.50–7.96 | 9.15–9.47 |

Há melhora local na criação. **No Observatório, o FPS permanece sem ganho conclusivo.** Cinco desenhos redundantes foram eliminados (32/50 → 27/45 chamadas, alternância do bloom); nascimento e identidade mantêm 18/35 e 15/31 chamadas, com menos cálculos por pixel. Mesmas imagens, pixels, texturas e rigs nos diagnósticos. As faixas e dados brutos são mais informativos que uma promessa percentual; há variação entre repetições. Nenhum número desta tabela prevê o FPS da GTX 1660 no Brave.

Ensaios exploratórios anteriores separaram a otimização da silhueta, das coordenadas e a combinação, nos dois sentidos da ordem; outro ensaio isolou a passagem única dos quads. Esses resultados estão nos JSONs, separados do benchmark final, e não devem ser somados como medições independentes da versão entregue.

**Comparação visual:** 18 casos controlados nos tamanhos 829×927, 390×844 e 1440×900. Na mesma cena, apenas os shaders são trocados entre a fonte congelada V21 e V22, com câmera/rig estáticos e uniformes controlados. Inclui máscara 0,25/0,5/0,75/1, carga, hover/seleção, pan, pulsação vermelha, deriva, enquadramento retrato e transição. Maior diferença: **1/255 por canal**, sem canais acima de 2/255. Não houve mudança de arquivos de imagem. O ensaio independente de quads encontrou diferença zero em três posições de câmera.

**Verificações finais:** `npm run check`, 23 arquivos de testes unitários e **24 cenários Chrome** aprovados. Cobrem camadas e proporção, oclusão dos sigilos pelo corpo com bloom, dissolução, troca de cenário, carregamento/fontes, clique/toque/voltar, controles de qualidade e três destinos de viagem com profundidade. Mobile simulado; não é aparelho físico. Sem falhas nesta execução. Bundle `npx vite build` aprovado; download separado ESO do comando completo não foi reexecutado, mantendo os sete assets existentes por hash.

**Pacote HTTP:** fluxo real despertar → identidade → origem → classe completado em 829×927, 390×844 e 320×568, com mãos habilitadas e confirmação do rascunho. Sem erros JavaScript, respostas HTTP de erro ou requisições de escrita remota. Imagens nativas, regras e rascunho continuam preservados.

## Preservação e homologação

49 módulos de raiz fora das quatro alterações de runtime foram comparados com a V21 e permanecem idênticos. Os 36 arquivos nativos de imagens/fontes do ZIP anterior permanecem iguais byte a byte. Arquivos de mãos, seleção, viagem e transição também conferidos com a base original do Observatório. Catálogo, origens, classes, folha e rascunho local não mudaram.

Órion Fichas permanece no HEAD `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, árvore rastreada limpa. Sem alteração de contas/dados reais, regras, Worker/D1, migrações, recursos de produção, merge ou PR nova. ZIP para upload manual; nenhuma ação de deploy foi executada.

**Implementado:** quatro arquivos de runtime, cálculos redundantes e passagens de quads. **Testado:** resultados locais descritos e registros em `desempenho-v22-validation/`. **Homologação pendente:** Brave/GTX 1660 e aparelhos físicos. A lentidão do Observatório no PC do usuário ainda não é considerada resolvida; o diagnóstico solicitado é necessário para separar a carga do site da escolha de renderizador pelo navegador.
