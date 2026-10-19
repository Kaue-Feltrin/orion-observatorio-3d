# Clique na Nox: gesto e confirmação luminosa

Registro da implementação `058cd21`. O refinamento atual de timing e ondas está no [estudo de mesh/rig](../study/README.md); as evidências abaixo preservam o antes dessa revisão.

Base `62eff3a`, aprovada visualmente pelo usuário em 19/10/2026 (“ficou ótimo”). Novo pedido: animar a mão no clique e sinalizar a seleção da estrela. Mesmo PR #29 e branch `codex/maos-rig-mmv`; sem merge ou alteração da main.

O clique inicia uma confirmação de aproximadamente 840 ms antes da viagem existente. A direita avança 0,09 unidade em Z, sobe levemente e faz uma pressão com o indicador, usando até 16% do contorno de flexão já validado. Punho acompanha e retorna antes da retirada normal da viagem. A esquerda mantém sua animação anterior. A imagem inteira, a opacidade de 0,46 e as duas superfícies da perspectiva permanecem constantes no gesto; nenhum asset foi redesenhado. O foco/brilho da Nox e a aproximação de hover são mantidos durante a confirmação, mesmo com a descrição fechada.

A Nox recebe duas ondas de luz dourada/violeta com bordas suaves e um reforço local de brilho. O efeito acompanha o astro em 3D e desaparece antes da viagem. Duas malhas compartilham uma geometria, criada apenas no primeiro clique: 1536 triângulos nas duas superfícies e até quatro chamadas adicionais (material de dupla face) durante a confirmação, sem textura, dependência, bloom, renderer ou loop novos. O enquadramento/rig em repouso permanece o aprovado.

Cliques repetidos durante a confirmação não reiniciam o gesto nem duplicam a viagem. O mesmo fluxo atende Raycaster e teclado. No celular, primeiro toque abre a descrição; segundo confirma. O foco provocado por toque não deve pular a primeira etapa. `hands=off` conserva o efeito luminoso e a navegação, sem carregar mãos. Os modos de mãos anteriores continuam disponíveis.

Com `prefers-reduced-motion: reduce`, há uma confirmação estática de 160 ms e pelo menos um quadro desenhado: sem avanço, pressão ou expansão dos anéis. A viagem acessível anterior continua igual. Ao ocultar a aba, o loop pausa e a confirmação retoma ao voltar. O relógio considera somente o tempo após o clique e tem limite próprio de 100 ms por passo para não pular o gesto após uma pausa longa de renderização. Em 10 FPS ou mais acompanha o tempo real; abaixo disso pode durar mais, preservando as fases visíveis.

## Evidências

- Desktop: [antes](1920-before.webp), [avanço](1920-click-25.webp), [pressão](1920-click-50.webp), [retorno](1920-click-75.webp).
- Janela estreita: [antes](390-before.webp), [avanço](390-click-25.webp), [pressão](390-click-50.webp), [retorno](390-click-75.webp).
- [Amostras e posições](metrics.json). As capturas de etapas congelam somente o relógio da confirmação; o desenho vem do build real no Chromium. Os testes funcionais usam clique/toque/teclado reais e o relógio normal até chegar à ficha.
- [Vídeo do hover, clique e viagem](selection.mp4): 6,45 s, canvas 768×432 em janela 1280×720, mouse e relógio reais, sem erros de página. A navegação final recebeu resposta 204 apenas nesta gravação para exportar o canvas; os testes funcionais verificam a chegada real à ficha. Captura local SwiftShader, sem inferir FPS do dispositivo do usuário.

## Validação

Check/build e cinco suítes unitárias aprovados. 13/13 regressões de mãos passaram; após os ajustes de foco/relógio e proteção de quadros lentos, 6/6 casos da seleção passaram sem retries em 1,0 min. A captura foi repetida separadamente (1/1 em 23,8 s), usando passos pequenos no relógio congelado para respeitar o limite do controlador; seis poses de 25/50/75% verificadas em desktop/celular. Os testes exigem pressão/depth reais, mesma textura/opacidade/superfícies, centro livre, clique único, chegada à ficha, toque/teclado/reduced/off. Unidade cobre também pausa de 1 s e confirmação estática com primeiro quadro lento. CI remoto do novo commit a conferir após push. Testes locais usam SwiftShader; não equivalem a uma medição de FPS/RAM no PC do usuário nem a aceite visual da nova animação.

Arquivos de código: `main.js`, `first-person-hands-mesh.js`, novo `star-selection.js`. Testes novos `tests/star-selection.unit.mjs` e `tests/star-selection.spec.js`; assert de integração em `tests/structure.mjs` acompanha o foco das pontas durante a confirmação. CI inclui a unidade da seleção. `star-journey.js`, fotografia ESO, créditos, assets das mãos e curva anatômica aprovada preservados. Contexto e continuidade atualizados nesta rodada.

Próxima ação do usuário após a entrega: clicar na Nox na nova prévia e avaliar a força/naturalidade do gesto e a leitura da luz de seleção. Sem upload, credencial ou configuração adicional.
