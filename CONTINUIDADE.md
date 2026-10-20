## 20/10/2026 — seleção astral mais marcante e gesto natural da direita

- Pedido exclusivo: melhorar a animação de escolher a estrela, com efeito mais extravagante na Nox e gesto mais natural na mão. Continuação autorizada em 20/10. Base GitHub `f7f1627` conferida antes de alterar; mesma branch `codex/maos-rig-mmv`/PR #29. Main/referência preservadas, sem merge.
- Confirmação nominal passa de 840 para 1120 ms. A Nox reúne luz, abre coroa com doze raios no contato e dispersa dezoito fragmentos; duas fitas 3D giram em sentidos opostos. Ondas anteriores maiores/mais intensas e glows existentes sincronizados. Efeito ancorado na estrela, somente durante seleção, sem partículas novas no repouso ou alteração da fotografia/atmosfera/câmera/viagem.
- Direita faz recuo/preparação, sobe em arco, avança 0,052 em Z (antes 0,045) e inclina discretamente o punho em X/Y. Polegar e três dedos recolhidos se acomodam no contato; oscilação de repouso reduzida durante pressão. Indicador pressiona/solta antes do assentamento. Mesma imagem/alpha 0,38, sem fades de poses na perspectiva, máximo de apontar 0,60 e contorno aprovado mantidos. Esquerda, alinhamento, acabamento inferior e camadas anteriores preservados.
- Seis superfícies/2936 triângulos no efeito (antes duas/1536), quatro geometrias únicas e seis materiais, todos de uma passagem. Alocação só no primeiro clique e descarte idempotente. Zero textura/dependência/shader/loop novo. Reduced-motion mantém confirmação estática de 160 ms com duas ondas, sem coroa/fita/fragmentos alocados e sem movimento da mão.
- Check/build e sete suítes unitárias aprovados. Nova anatomia amostra 21 estágios/três instantes com morph e acomodação dos ossos: área relativa 0,3939347–1,3745913, sem inversões; limites anteriores 0,10–4,0 mantidos. Unidades verificam carga tardia, descarte de todos os recursos, geometria limitada, sincronização, ausência de textura, retorno sem rotação residual, quadros lentos e 30/60/120 Hz.
- **15 casos distintos de navegador aprovados**: cinco fluxos da seleção, quatro da perspectiva, três de fechamento/alinhamento/atmosfera, uma captura por fases e dois smokes da navegação padrão. Rodada principal: 12 aprovados e erro no coletor de métricas da captura; após corrigir a referência do coletor, 1/1 captura passou em 32,8 s, sem mudança no app para resolver esse erro. Dois smokes passaram em 21,7 s. Sem retries automáticos. Cobertos clique único, teclado, toque, reduced/off, mesma imagem/opacidade/centro livre, ondas/coroa/fita/fragmentos, anatomia, chegada real à ficha e recursos.
- Doze capturas de antes e 8/25/50/75/92% em desktop/celular, antes/depois e detalhe ampliado em [docs/rig-mmv/astral-selection/](docs/rig-mmv/astral-selection/README.md). Clock congelado só nas capturas por fase; fluxos funcionais com entradas e tempo reais. Vídeo real de 7,36 s sem erros, com hover/clique/viagem e sem congelar o relógio. A gravação intercepta só a navegação final com 204 para exportar canvas; os testes verificam chegada real à ficha. Evidência local Chromium/SwiftShader, sem medição de FPS/RAM no hardware do usuário e sem presumir aceite artístico.
- CI completo da base f7f1627 terminou FAILURE em Testar WebGL. Anotações informam saída 1 sem nome/causa do teste; logs externos ficaram bloqueados no ambiente em rodadas anteriores. Avisos de Node/Ubuntu não identificam a falha. CI completo da revisão nova a conferir após push; resultado local não substitui CI remoto.
- Código: star-selection.js, first-person-hands-mesh.js, hands-image-rig.js e main.js; regressões da seleção e contexto/documentação. Nenhum asset de mão, arquivo de atmosfera ou star-journey.js alterado. Próxima ação do usuário: abrir a nova prévia e clicar na Nox, avaliando gesto e efeito luminoso; sem instalação, upload ou credencial. Encerrar após esta etapa.

## 19/10/2026 — esquerda fecha no hover, entradas laterais e atmosfera em profundidade

- Novo feedback: acompanhamento esquerdo imperceptível, pedido de fechar um pouco os dedos quando a direita aponta, braços nascendo em bordas diferentes e mais camadas de paralaxe. Escopo ampliado explicitamente à atmosfera. Base GitHub `67e0491` conferida antes de alterar; CI completo e Cloudflare dessa base aprovados durante a etapa. Mesma branch `codex/maos-rig-mmv`/PR #29, sem main/merge.
- Esquerda: flexão real de indicador/falange, médio, anelar e mínimo; oposição leve do polegar, guiadas pela mola do hover. Abertura indicador–polegar cai ~21% no ensaio congelado. Entrada/retorno suaves, mesma imagem/alpha, sem fades de poses. Reduced-motion mantém ossos estáticos. Prévia usa `hands=mesh&handsMotion=perspective`; rig alternativo também fecha a esquerda. Modo mesh antigo permanece para comparação.
- Alinhamento óptico: esquerda rotacionada −0,20 rad e deslocada mais 1,2% da largura para a lateral. Novo acabamento do antebraço esquerdo em v=0,09–0,30; direita e sua máscara preservadas. Escala/proporção/altura-base e alpha 0,38 mantidos. Unidade agora mede alpha real dos WebPs multiplicado pelo acabamento de vértice e projetado pelas malhas nas duas bordas, sem confundir retângulo transparente com silhueta. Verifica três enquadramentos e evita o canto inferior em desktop.
- Fechamento amostrado em 41 progressos/quatro instantes, área relativa esquerda 0,25749–1,57560, sem inversões; limites 0,10–4,0 mantidos. Direita continua contida a 60%, depth máximo 0,042 e clique/seleção anteriores preservados.
- Duas camadas ESO adicionais: bruma esquerda em Z=−130/alpha 0,10 e filamento próximo direito em Z=−42/alpha 0,055, com paralaxe/drift/respiração distintos. Eco+/balanced ficam com cinco massas; high, seis. Eco/lite e Eco+ foreground=off mantêm duas e não baixam assets novos. Reduced-motion congela as camadas. Ordenação pela profundidade física; fotografia principal/créditos e Nox preservados.
- Recortes gerados no build existente: ~97 + 96 KiB, 800×395 e 800×400. Duas superfícies/quatro triângulos, duas texturas adicionais nos perfis que as usam, forceSinglePass por nova superfície. Perspectiva local passa de 26 para 28 texturas GPU. Nenhuma dependência, shader ou loop novo; mãos não redesenhadas. Sem medição de FPS/RAM no hardware do usuário.
- Check/build e sete suítes unitárias aprovados. **18/18 regressões da cena/qualidade** aprovadas; **22 casos distintos das mãos/seleção** aprovados no build final, incluindo os três casos de enquadramento repetidos após atualizar as asserções do retângulo transparente (3/3 em 2,6 min). A rodada de 22 passou 21; o único erro restante era a medida do canto transparente do rig antigo, resolvida ao separar envelope e alpha real. Sem retries automáticos, sem limites anatômicos relaxados. Total: **40 casos distintos aprovados**; não corresponde a uma execução única de 40 testes.
- Evidências locais Chromium/SwiftShader em [docs/rig-mmv/closure-atmosphere/](docs/rig-mmv/closure-atmosphere/README.md): repouso/hover/retorno em desktop/celular, fases do clique, paralaxe, antes/depois, comparação ampliada da esquerda e vídeo real de 16,18 s sem erros. Não presumir aceite artístico; CI remoto da nova revisão a conferir após push.
- Código: first-person-hands-mesh.js, hands-image-rig.js, nebula-depth-specs.js e nebula-volume.js; comentários de contagem em main.js e preparação de assets. Unidade de volume nova no CI, auxiliar de silhueta e regressões de fechamento/paralaxe. Contagens de planos atualizadas nos testes anteriores; margens do retângulo transparente adaptadas à rotação óptica, sem relaxar anatomia ou proteção do centro.
- Ação do usuário: abrir nova prévia, passar/retirar cursor da Nox para observar esquerda fechar/reabrir, mover cursor lateralmente para avaliar camadas e clicar para conferir seleção/viagem. Nenhuma instalação, upload ou credencial necessária. Encerrar após esta etapa.

## 19/10/2026 — equilíbrio das mãos e apontamento contido

- Feedback: direita menos transparente, mãos desalinhadas nos dois eixos, esquerda sem acompanhar o hover e apontamento exagerado/esticado. Base `823e0d0` conferida no GitHub antes de alterar. Mesma branch `codex/maos-rig-mmv`/PR #29; sem main/merge.
- Enquadramento compartilhado: alpha 0,38, altura-base 0,565, margem lateral −0,030 espelhada e ancoragem inferior −0,020. Direita reduzida à escala da esquerda, preservando proporção da imagem e limite de 30% por lateral. Poses anatômicas próprias mantidas; nenhuma imagem redesenhada.
- Perspectiva limita apontar a 60% da sequência e profundidade efetiva a 0,042 (antes 0,14). Avanço do clique 0,045 (antes 0,09), pressão/rotação menores. Contorno, ponta arredondada, pesos e grade aprovados preservados; nenhuma inversão/limite anatômico relaxado.
- Esquerda acompanha o hover com pequena elevação/aproximação e movimento real de punho/palma. Mesmo progresso suave de entrada/retorno; reduced-motion congela a esquerda e remove profundidade. `hoverBlend` registra entrada completa; `rightBlend`, pose efetiva contida. Seleção luminosa e viagem mantidas.
- Check/build e seis suítes unitárias aprovados. **19/19 casos de navegador** (mesh, rig, perspectiva e seleção) sem retries em 5,3 min; **2/2 regressões da navegação padrão** sem retries em 26,9 s. Unidade nova `tests/hands-balance.unit.mjs` incluída no CI, cobrindo igualdade de frame/alpha em três enquadramentos, acompanhamento/retorno sem escala e limites de pose/depth. Anatomia matemática completa permanece testada, inclusive poses não usadas pelo hover contido.
- Antes/depois, repouso/hover/retorno em desktop/celular, fases do clique e vídeo real de 16,63 s sem erros em [docs/rig-mmv/balance/](docs/rig-mmv/balance/README.md). Evidência local Chromium/SwiftShader; não é aceite artístico nem medição de hardware do usuário.
- CI da base `823e0d0`: FAILURE em Testar WebGL, causa ainda desconhecida. Usuário forneceu resumo do run `39247654033`/artefato `12184518033`; sem erro específico. Download de logs/artefato bloqueado neste ambiente. Avisos de Node/Ubuntu não identificam a causa. CI da nova revisão a conferir após push; resultados locais não substituem o CI completo.
- Código: first-person-hands-mesh.js, hands-image-rig.js e hands-perspective-motion.js; regressões/CI e documentação/contexto. Assets, câmera, fotografia/créditos ESO, Nox, ondas de seleção e star-journey.js preservados.
- Ação do usuário na entrega: abrir a nova prévia, observar repouso, passar/retirar o cursor da Nox e clicar; avaliar transparência, alinhamento e naturalidade do gesto. Nenhum upload, instalação ou credencial necessário. Encerrar após esta etapa.

## 19/10/2026 — estudo de mesh/rig e refinamento pequeno

- Pedido explícito: estudar esse tipo de animação por mesh/rig e melhorar um pouco a mão e a seleção da estrela. Base GitHub conferida `058cd21`, Cloudflare aprovado, CI completo ainda em execução ao iniciar. Mesma branch codex/maos-rig-mmv/PR #29, sem main/merge.
- Estudo de referências primárias Three.js r180 (SkinnedMesh e forceSinglePass), timelines de bones/deform do Spine 4.2 e guia de easing/sincronização do Tween.js. Fontes, revisões e decisões em [docs/rig-mmv/study/](docs/rig-mmv/study/README.md). Nenhuma biblioteca/código/asset dessas referências foi incorporado.
- Curvas C2 com velocidade/aceleração nulas nas bordas; pequeno recuo preparatório (-0,012 Z), avanço/pressão anteriores e assentamento do punho depois do indicador (+0,007 rad). Na perspectiva, dedos se acomodam até 18% da amplitude e recebem onda lenta com peso de até 16% durante o apontamento. Neutra/esquerda/modos anteriores mantêm movimento original.
- Seleção: segunda onda começa aos 30% e acompanha a pressão; expansão desacelera e brilho acentua o contato, com opacidades um pouco menores. Mesmo raio máximo 54, geometria e duas superfícies. Anéis planos usam forceSinglePass, uma passagem por superfície. Sem textura, dependência ou loop novos.
- Cinco suítes unitárias, check/build e 10/10 casos de navegador aprovados sem retries em 2,8 min. Cobertos gesto, hover/retorno, mesma imagem/alpha, anatomia sem inversões, profundidade, centro livre, toque/teclado/reduced/off, navegação real e descarte. Testes novos verificam preparação antes do avanço, assentamento depois da pressão e energia dos dedos reduzida ao apontar; nenhum limite anatômico relaxado. Área relativa da malha permanece 0,1141668645–1,7116198024 na amostra anterior.
- Doze capturas (antes e cinco fases em desktop/celular), gráfico das curvas, comparação com 058cd21 e vídeo real de 6,96 s acompanham o estudo. Evidência local Chromium/SwiftShader; não é aceite artístico ou medição de FPS/RAM no equipamento do usuário. CI remoto da nova revisão a conferir após push.
- Código: star-selection.js, first-person-hands-mesh.js e hands-image-rig.js; testes da seleção, documentação/contexto. Assets, pesos, grid, contorno aprovado, ESO/créditos, câmera e star-journey.js preservados.
- Ação do usuário após entrega: abrir a nova prévia, passar/retirar o cursor e clicar na Nox para avaliar o refinamento leve. Sem upload, credenciais ou configuração adicional. Encerrar após esta etapa.

## 19/10/2026 — clique da mão e seleção luminosa da Nox

- Usuário aprovou a revisão `62eff3a` (“ficou ótimo”). CI completo e Cloudflare dessa base conferidos como aprovados. Pediu explicitamente uma nova animação da mão ao clicar na estrela e um efeito de seleção; esse é o novo escopo autorizado, sem autorização de merge/produção.
- Confirmação de 840 ms antes da viagem existente: a direita avança em Z, faz uma pressão do indicador e retorna. Usa a mesma imagem íntegra e contorno anatômico aprovados, sem fades, recortes ou redesenho. Esquerda, proporção, acabamento inferior e centro livre mantidos.
- Duas ondas de luz com bordas suaves acompanham a Nox em 3D; brilho local, sem textura/dependência/loop novos. Uma geometria compartilhada e dois materiais alocados apenas no primeiro clique; duas superfícies/1536 triângulos e até quatro chamadas (material de dupla face) durante o efeito. Viagem original só começa após a confirmação; cliques repetidos são ignorados.
- Raycaster, teclado, dois toques no celular e hands=off atendidos. Foco de toque não pula a etapa de descrição. Reduced-motion usa confirmação estática de 160 ms, sem avanço/pressão/expansão; depois segue a viagem acessível anterior. Relógio da confirmação independente do limite de delta da física; teto próprio de 100 ms evita pular fases após pausas longas. Reduced-motion garante ao menos um quadro estático. Pausa com aba oculta.
- Código: main.js, first-person-hands-mesh.js, novo star-selection.js; novas suítes tests/star-selection.unit.mjs e tests/star-selection.spec.js e unidade incluída no CI. star-journey.js, assets, contorno aprovado, ESO/créditos preservados. Evidências e limites em [docs/rig-mmv/selection/](docs/rig-mmv/selection/README.md).
- Check/build e cinco suítes unitárias aprovados. 13/13 regressões de mãos passaram; após os ajustes de foco/relógio e proteção de quadros lentos, 6/6 casos da seleção passaram sem retries em 1,0 min. A captura foi repetida separadamente (1/1 em 23,8 s), usando passos pequenos no relógio congelado para respeitar o limite do controlador; seis poses de 25/50/75% verificadas em desktop/celular. Os testes exigem pressão/depth reais, mesma textura/opacidade/superfícies, centro livre, clique único, chegada à ficha, toque/teclado/reduced/off. Unidade cobre também pausa de 1 s e confirmação estática com primeiro quadro lento. Vídeo real de 6,45 s (hover, clique e viagem) e oito capturas comparativas em docs/rig-mmv/selection/. CI remoto do novo commit a conferir após push. Nenhuma aprovação artística da seleção nova presumida.
- Mesmo PR #29 e branch codex/maos-rig-mmv; main e referência preservadas. Próxima ação do usuário na entrega: clicar na Nox na nova prévia e avaliar gesto/luz. Nenhum upload, credencial ou configuração necessário. Encerrar após esta etapa, sem melhorias adicionais.

## 18/10/2026 — ponta do indicador achatada no repouso

- Base remota `0fd3f62` conferida antes de alterar, Cloudflare aprovado e CI geral ainda em execução. Usuário apontou somente a ponta com aspecto quebrado.
- O morph reduzia o trecho x=150 de 69 para 22 pixels de espessura (~32%), por usar o contorno da ponta antiga sobre a falange da imagem atual. Contorno local recalibrado para preservar a espessura; arco de repouso ajustado para acomodá-la. Apontamento final e demais dedos preservados. Sem redesenhar assets.
- Regressão mede alpha real em quatro colunas da ponta/falange e exige espessura entre 90–110% em cinco estágios, além dos testes anteriores sem limites relaxados. Código apenas em hands-perspective-motion.js e seu teste unitário. Ver [evidências e resultado](docs/rig-mmv/fingertip/README.md).
- Check/build, quatro suítes unitárias e 4/4 casos de navegador da perspectiva aprovados, sem retries, em 1,8 min. Nove posições e antes/depois inspecionados. Recursos preservados; CI remoto da rodada a conferir após push.
- Mesmo PR #29/branch, sem main/merge. Ação do usuário ao receber prévia: conferir a ponta parada e ao entrar/sair do hover do Nox. Sem nova configuração/upload necessário. Encerrar esta etapa sem melhorias adicionais.

## 18/10/2026 — quinas no indicador e nos três dedos (ambos confirmados)

- Base remota `29a571d` conferida com CI e Cloudflare aprovados. Usuário ainda observou aspecto quebrado e confirmou ambos: indicador e três dedos dobrados.
- Curvas monotônicas C1 no indicador, base/palma ancoradas e faixa de influência reduzida. Grade direita 72×72 só na perspectiva, concentrada em todos os dedos. Arte própria já apontando refinada por ImageGen para manter o indicador estendido sem vinco e arredondar articulações/pontas dos três dedos; a malha dobra a imagem inteira até o repouso, com mesmo canvas/alpha/registro. Imagens/modos anteriores mantidos.
- Mesma imagem íntegra durante o gesto, sem shader de recorte ou fades. Proporção, saída inferior, hover/retorno, profundidade, Nox/ESO/câmera/cena preservados. Ver [documentação e evidências](docs/rig-mmv/smooth/README.md). Mesma branch/PR #29, sem main/merge.
- Check/build e quatro suítes unitárias aprovados. 13/13 casos de navegador em 3,8 min; depois do ajuste final junto ao médio, 4/4 da perspectiva repetidos em 1,9 min, sem retries. Nove posições e antes/depois inspecionados. Dois rigs/18 controles, duas imagens, duas superfícies/11904 triângulos; GPU A/B 29→26 texturas. CI remoto do novo commit a conferir após push.
- Ação do usuário após entrega: avaliar ambos os contornos na nova prévia ao passar/retirar o cursor do Nox. Sem nova configuração/upload necessário. Não iniciar melhorias adicionais.

## 18/10/2026 — reparo da anatomia após recorte rejeitado

- Usuário relatou “tudo quebrado” e forneceu captura. A revisão `41071db` foi visualmente rejeitada: a junção artificial do indicador sobre a mão neutra rompeu o contorno. Os testes anteriores não cobriam adequadamente a anatomia durante as passagens.
- `handsMotion=perspective` passa a uma imagem íntegra da direita, uma superfície contínua e quatro contornos geométricos intermediários/final + profundidade. Sem shader de recorte, camada corporal ou crossfade. Demais dedos/palma preservados na mesma textura; corrigido calombo na raiz do indicador. Assets existentes preservados, intermediários antigos sem download nesse modo. Proporção/acabamento inferior mantidos.
- 18 controles/duas imagens/duas superfícies durante todo o gesto. Reduced-motion estático, off sem alocação, mesmos hover/retorno/câmera/cena. CI passa a um worker para evitar concorrência de cenas SwiftShader; quatro falhas anteriores eram timeouts, não prova da correção visual.
- Check/build, quatro suítes unitárias e **13/13 testes de navegador aprovados, sem retries, em 4,1 minutos**. Nove posições ampliadas inspecionadas. A/B rig 29→perspectiva 26 texturas (revisão rejeitada: 40), duas superfícies constantes. CI remoto desta rodada a conferir após push. Ver [evidências e limites](docs/rig-mmv/continuous/README.md). Mesma branch/PR #29, sem alterar main ou branch de referência. Nenhuma nova configuração/upload/credencial necessária do usuário; após entrega, conferir apenas naturalidade/continuidade do gesto na nova prévia.

## 18/10/2026 — correção dos fades dos dedos recolhidos (em avaliação visual)

- Feedback: transições ruins, principalmente médio/anelar/mínimo. Base remota `95566fe`, Cloudflare aprovado e CI geral ainda em execução ao iniciar. Mesma branch `codex/maos-rig-mmv`, PR #29.
- Causa: as artes alteram posições/oclusões dos três dedos, mas só o indicador tinha correspondência geométrica. A mistura do resto da mão produzia silhuetas sobrepostas.
- Correção: palma, polegar e dedos recolhidos passam a uma única camada com a imagem neutra e o rig/depth atuais, com opacidade constante durante hover. Os cinco quadros são recortados no shader para mostrar apenas o indicador. Sem redesenhar assets. Enquadramento, máscara inferior, transparência, hover/retorno, perspectiva, Nox/ESO/viagem e modos anteriores preservados.
- Custo previsto/medido nas evidências: uma superfície extra e um skeleton/morph adicionais, sem imagem nova. Quatro superfícies máximas na passagem. Ver [documentação e evidências](docs/rig-mmv/fingers/README.md).
- Check/build, quatro suítes unitárias e **12/12 testes de navegador aprovados, sem retries, em 4,0 minutos**. Vídeo de 32 s inspecionado; corpo com mesma textura e alpha 0,46 durante todo o gesto. A/B rig 29→perspectiva 40 texturas, sem imagem nova. CI remoto do novo commit a conferir após push. Ação do usuário após receber prévia: avaliar a transição desses três dedos, sem repetir aprovação da proporção ou iniciar melhorias extras.

## 17/10/2026 — sequência MMV com perspectiva (em avaliação visual)

- Usuário autorizou três poses intermediárias com profundidade/perspectiva. Base remota conferida `c3dce97`, com CI completo e Cloudflare aprovados. Mesma branch `codex/maos-rig-mmv`, PR #29; sem alteração da main.
- Novo modo opcional `handsMotion=perspective`: neutra existente → três intermediários gerados → apontamento final com mudança de perspectiva. O modo anterior `handsMotion=rig` permanece disponível para comparação.
- Transição por contornos correspondentes na GPU + ossos de repouso + profundidade de até 0,14 unidade na região da mão. Punho/saída inferior e borda central ancorados. Mesma câmera, loop, proporção, máscara, Nox/ESO/viagem. Só dois quadros vizinhos visíveis, duas superfícies estáveis/três na passagem.
- Imagens novas 896×1120 com alpha, total 311174 bytes; três intermediárias e uma final. Procedência e pesquisa oficial Three.js/PixiJS documentadas. Sem novo runtime/dependência.
- Check/build e quatro suítes unitárias aprovados; **12/12 testes de navegador em 3,4 minutos, sem retries**. Caso de recursos ampliado/repetido: **1/1 aprovado**, A/B 29→38 texturas na mesma janela. Vídeo de 32,9 s e capturas inspecionados. CI remoto do novo commit a conferir após push. Resultado final na [documentação da perspectiva](docs/rig-mmv/perspective/README.md).
- Próxima ação do usuário ao receber a prévia: comparar naturalidade/profundidade do gesto. Proporção já aprovada; não repetir essa pergunta. Não promover a padrão, fazer merge ou iniciar etapa adicional sem autorização.

## 17/10/2026 — revisão do rig: movimento perceptível e indicador articulado

- Feedback: primeira versão funcional, mas quase imóvel e apontamento apenas por fade. Mesma branch `codex/maos-rig-mmv`, PR #29; HEAD remoto `884bd5d` com CI/Cloudflare aprovados, conferido antes de alterar.
- Repouso 3× nos dedos/palma e 4× no punho. Hover agora estende a malha do indicador por morph de contorno na GPU, combinado aos ossos de repouso; retorno/reversões por mola amortecida. Blend de textura concentrado no meio do gesto, com deformação real antes/depois. Correspondências das bordas das imagens reduzem o contorno duplo; remapeamento monotônico evita inversões.
- Enquadramento, transparência, máscara inferior e assets preservados. Rig continua opcional com `handsMotion=rig`; reduced-motion estático e off sem alocações. Sem alterações na main ou no restante da cena.
- Check/build, três suítes unitárias e **9/9 testes de navegador aprovados, sem retries, em 2,3 minutos**. Após o morph, 9/9 passaram novamente; após refinar bordas, build/gravação e 3/3 casos do rig repetidos com sucesso. CI remoto do novo commit a conferir após push.
- [Detalhes, testes e evidências atualizados](docs/rig-mmv/README.md). [Contexto cumulativo integral](CONTEXTO_COMPLETO_CUMULATIVO.md).
- Ação do usuário: avaliar intensidade e movimento do indicador na nova prévia; proporção já aprovada. Sem configuração adicional, merge ou promoção automática.

## 17/10/2026 — protótipo MMV/rig 2,5D opcional

- Usuário autorizou explicitamente avançar para animação MMV/rig 2,5D. Base `8811a40`, com CI completo e Cloudflare aprovados; branch nova `codex/maos-rig-mmv`, destinada à branch do PR #28, sem alterar main.
- Ativar com `?hands=mesh&handsMotion=rig`. Rig nativo Three.js: punho, palma e dedos, nove controles por pose; pivôs/pesos próprios para esquerda, direita neutra e apontando. Mesmas imagens, câmera, enquadramento, máscara e loop. O modo anterior permanece sem o parâmetro.
- Pesos calculados na construção; GPU articula os vértices. Reduced-motion sem animação dos ossos; off sem cargas/alocações. Apontamento somente pelo hover real do Nox. Sem novo runtime ou dependência.
- Check/build, três suítes unitárias e 9/9 testes Playwright sobre produção aprovados, sem retries, em 2,4 minutos. Verificados landmarks projetados, deformação/triângulos limitados e descarte. CI remoto da nova branch ainda deve concluir.
- A/B medido: renderer de 24 para 27 texturas, três extras de ossos com 3072 bytes de dados totais. Duas superfícies estáveis/três no blend; sem imagens novas. FPS/RAM físicos não medidos.
- [Pesquisa, capturas, vídeo, protocolo e medidas](docs/rig-mmv/README.md). [Contexto cumulativo integral](CONTEXTO_COMPLETO_CUMULATIVO.md).
- Ação do usuário: avaliar naturalidade/intensidade do movimento e fluidez no seu equipamento. Proporção já aprovada; não repetir essa pergunta. Não promover rig a padrão nem fazer merge/main/produção sem autorização.

## 17/10/2026 — proporção aprovada; acabamento inferior da direita

- Usuário aprovou a proporção e apontou um vazamento/contorno no canto inferior direito. Mantidos escala e posicionamento aprovados; ampliada somente a máscara alpha do antebraço, que terminava antes da borda da textura. A mesma máscara atende neutro e apontamento, preservando palma e dedos.
- Check/build, duas suítes unitárias e 10/10 testes Playwright sobre produção aprovados, sem retries. Acrescentada verificação unitária do corte transparente e da região superior intacta. [Capturas de acabamento](docs/qa/v0921/README.md). Sem redesenho de assets, novo rig ou alterações na main.
- Ação do usuário: conferir apenas o acabamento inferior na nova captura; a proporção já está aprovada.

## 17/10/2026 — proporção conforme referência e consulta sobre rig

- Usuário forneceu referência 1920×1080 com mãos maiores nas extremidades inferiores. Ajustadas escala e ancoragem, mantendo proporções dos assets, transparência, centro livre e hover exclusivo do Nox. [Capturas atualizadas](docs/qa/v0921/README.md).
- CI anterior `39049543751`: 72 aprovados, 1 timeout no teste que acumulava três saídas de hover. Separados pointerleave, blur e visibilitychange em testes independentes, com as mesmas assertions e orçamento próprio. Acrescentada a resolução da referência e nomes de screenshots sem colisão.
- Check/build, duas suítes unitárias e **10/10 testes Chromium sobre produção, sem retries**, aprovados. Novo CI remoto ainda precisa concluir após o push.
- Rig 2D/2,5D é viável no Three.js para punho e flexões sutis, preservando as imagens. Grandes articulações exigem camadas/áreas ocultas preparadas. Não foi implantado novo rig. O usuário confirmou MMV como animação de imagem estática, no estilo de mangá animado; não repetir essa pergunta.
- Ação do usuário: avaliar tamanho/enquadramento na nova captura. Acesso de rede restabelecido; nenhuma configuração adicional necessária nesta consulta. Mesma branch do PR #28, sem merge ou alteração da main.

## 17/10/2026 — v0.9.21: mãos nas bordas e apontamento contextual

- Base remota conferida antes das alterações: `preview/star-hover-hands-v0921`, `2a2c6a06157cc6141d81842f1f8d37dd8c54aaa1`. Trabalho exclusivo na nova branch `codex/finalizar-maos-etereas-v0921`; PR destinado à branch de referência, sem alterar `main`.
- Implementação/evidências no commit `86f251f`; [PR #28 em draft](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/28), sem merge. O commit documental subsequente registra estes identificadores no contexto completo.
- Uma mão em cada extremidade, esquerda discreta; largura dos planos limitada a 28% da janela. A direita possui novo asset neutro próprio (`right-hand-neutral.webp`), gerado a partir do asset direito existente, sem espelhar a esquerda. Assets anteriores preservados.
- Raycaster do Nox como único gatilho de apontamento; retorno suave ao sair e reset em saída da janela, blur, aba oculta e viagem. Movimento reduzido respeitado. Corrigida a chamada de update das mãos durante a viagem para permitir o fade que já existia no módulo.
- Mesmo renderizador/loop, sem novo shader. Geometria compartilhada entre as poses direitas, 2 draws estáveis/3 transitórios e 3 texturas de mãos. A textura adicional ocupa aproximadamente 104 KiB em disco. Nenhuma alegação de FPS/RAM no PC do usuário.
- Validação final: `npm run check`, `NODE_USE_ENV_PROXY=1 npm run build`, `node tests/hands-mesh.unit.mjs`, `node tests/hands-hover.unit.mjs` e **8/8 testes Playwright selecionados no build de produção, sem retries**. Testes de bordas/poses em 1755×865, 1920×951 e 390×844, reduced-motion, off, saída/blur/aba e regressões de Nox/câmera/navegação.
- [Comparação visual e protocolo](docs/qa/v0921/README.md). [Contexto completo cumulativo](CONTEXTO_COMPLETO_CUMULATIVO.md): preserva integralmente o documento anexado e acrescenta o checkpoint desta etapa.
- Fotografia ESO, Nox, bloom, câmera, painel, viagem e demais componentes preservados. O acesso a `cdn.eso.org` foi restabelecido na configuração do ambiente; TLS mantido. Aviso do chunk Vite acima de 500 KiB permanece fora deste escopo.
- Pendente: revisão artística do usuário, métricas no seu hardware e eventual promoção expressamente autorizada. Nenhum merge ou deploy de produção executado. A tarefa termina nesta etapa.

## Etapa v0.9.16 — benchmark A/B das mãos FPS (16/10/2026)

- Usuário pediu continuar o Observatório v0.9.15 e solicitou **um arquivo de contexto novo em cada resposta**, para retomar integralmente o trabalho em outro chat. A fonte permanente ainda é este arquivo + PRs/GitHub; respostas devem anexar um Markdown atualizado em `/mnt/data`.
- V0.9.15 confirmada com **4 workflows aprovados no commit 02233a8** (QA, enquadramento, viewmodel e suíte geral). PR [#22](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/22) é **draft**, não mesclado. Pose padrão David Fischer `fpsStyle=natural` / variante `rest1`, bend=1.0/yaw ±.36/roll ∓.38, aguardando aprovação artística do usuário e medição real no hardware.
- Para avançar sem comprometer a cena, criada a **branch independente** `preview/benchmark-maos-fps-v0916`, baseada na v0.9.15, PR [#23](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/23) **draft** contra a branch da v0.9.15, não contra produção.
- Pesquisa oficial: MDN `requestAnimationFrame`, web.dev smoothness do Chrome, MDN Page Visibility API. Decisão: **reutilizar FPS/p95 capturados pelo único loop de renderização existente**, sem RAF extra, shaders, meshes ou mudanças de câmera. Registro somente mediante clique.
- Novo `orion-observatorio-upload-github-leve/hands-benchmark.js`: botões de registrar amostra, alternar `hands=fps`/ `off` e limpar; `sessionStorage` somente da aba, sem rede, com assinatura de qualidade, efeitos, bloom, DPR, janela, pixels, recortes, foreground e paralaxe. A comparação só aparece quando as duas assinaturas são idênticas. Captura rejeita aba oculta, menos de 10s ou menos de 30 frames, qualidade diferente de `eco-plus`, rig não carregado.
- `performance-panel.js` integra o controle no painel `?debug=1`, deixa `hands=off` alternar expressamente para `hands=fps&fpsStyle=natural` e acrescenta o comparativo ao **Copiar diagnóstico** existente. `styles.css` dá legibilidade isolada no debug. O resto da UI/3D não muda.
- `tests/hands-benchmark.spec.js` verifica o painel no **build Vite**, persistência, delta e reset; `tests/structure.mjs` valida os cálculos puros e a ausência de novo RAF/fetch. Documento `ESTUDO-BENCHMARK-MAOS-FPS-v0916.md` descreve pesquisa e protocolo.
- Próximos passos: confirmar CI completo e screenshot do novo painel; obter amostras **no PC do usuário** após 10 s por modo, duas repetições, com mesma viewport; comparar FPS e p95, inspecionar hands natural ao vivo; se aprovados, decidir promoção com autorização expressa. **Não fazer merge na main nem deploy em produção sem aprovação.**

## Continuação concluída — v0.9.15 mãos FPS posição relaxada (16/10/2026)

- **Fonte de verdade:** PR #22 em draft na branch `preview/fps-hands-david-v0915`; código verificado no commit `0ad834394c8acdc1a7714e068246b07bf8d9c20f`. A produção `main` e o restante do universo 3D foram preservados.
- A falha era a pose inicial com as mãos abertas verticalmente (efeito "pare") e uma calibração que media as pontas ANTES de atualizar o rig. Corrigidos os landmarks medidos DEPOIS da pose do punho, com correspondência entre NDC registrado e projeção verdadeira.
- Rodada A/B com **8 variantes** (base, forward, reach, inward, back, rest1, rest2, rest3), fotos reais armazenadas nas capturas do workflow [Enquadramento David #38951107610](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38951107610).
- Escolhida como novo padrão `?hands=fps&fpsStyle=natural` a pose **rest1**, com flexão `bend=+1.0`, yaw `±0.36` e roll `∓0.38`, com palmas mais diagonais e dedos direcionados para frente, sem excesso de braço no quadro. Preservada `?fpsTune=back` para referência, `rest2` e `rest3` para A/B e todos os modos antigos.
- **Código final aprovado pelos testes específicos:** [QA #38951577356](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38951577356), [enquadramento #38951577454](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38951577454), [viewmodel #38951577441](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38951577441). Nox, 3 recortes ESO, bloom, rig original de 63 ossos, 40 falanges, CC BY, `hands=off` e reduced-motion preservados. Browser de CI não é medidor de desempenho do hardware real.
- **Pendência de aceite:** análise do usuário da nova captura de mão em 1748×864 e medição FPS/p95 com `?debug=1&quality=eco-plus&hands=fps` vs `hands=off`. Não fazer merge para `main` nem promover produção sem autorização explícita. A regressão geral pode ter execução mais longa que o QA isolado; conferir o workflow geral antes de qualquer merge.

## Resultado da revisão visual das mãos — v0.9.15 (16/10/2026)

- **Padrão atual aprovado tecnicamente, aguardando aceite estético do usuário:** `?quality=eco-plus&hands=fps&fpsStyle=natural` usa a pose diagonal do antigo `fpsTune=back` (`bend=+0,70`, `yaw=±0,30`, `roll=∓0,30`). A comparação visual real mostrou palmas em 3/4 e dedos apontando para frente, melhores que a antiga pose frontal e que o autoaim exagerado em "garra".
- A busca de orientação por projeção/quatérnios permanece como fallback apenas quando as pontas não estiverem nas faixas de enquadramento; caso a pose diagonal esteja correta, ela **não é alterada pelo otimizador**. Mantém GLB original David Fischer, 63 ossos, 40 falanges, 7.966 tri, 1 SkinnedMesh e 0 texturas novas. Calibração atual lê landmarks DEPOIS da pose.
- **CI da última revisão de código `20fae007`:** [QA de mãos #38949868330](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38949868330) **9/9 aprovado**; [enquadramento #38949868349](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38949868349) **aprovado**; [validação do viewmodel #38949868312](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38949868312) **aprovada**. Capturas 1748×864 e 1920×951 renderizadas, inspecionadas e comparadas com original/cinematic. O teste de 2 viewports confirmou mão esquerda ponta x≈-0,390 vs punho x≈-0,540, mão direita ponta x≈0,392 vs punho x≈0,540, y ponta≈-0,495 vs punho≈-0,850, com projeção pós-pose idêntica à medida; Nox e bloom preservados.
- O teste headless em GitHub Actions usa GPU virtual e NÃO mede FPS no hardware real. **Faltam** comparação `hands=fps` vs `hands=off` com FPS/p95/RAM no PC, resultado do CI geral, e aceite visual explícito antes de mesclar. Produção `main` absolutamente intocada.
- Preview e PR existentes: [PR #22](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/22) em draft. Comparar `fpsStyle=natural` (padrão) contra `fpsStyle=cinematic` e `fpsTune=back` (legado).

## Inspeção visual adicional da pose David FPS (16/10/2026)

- Captura `v0915-qa-pose-base.png` inspecionada após a primeira correção: dedos convergiam mais ao centro, mas palmas ainda estavam frontais e verticais, como gesto de "pare". **Primeiro resultado reprovado visualmente, apesar de NDC válido**.
- Refinamento seguinte: `aimNaturalPose()` busca dois graus de liberdade por punho — roll na tela e pitch para dentro da profundidade real da câmera. O objetivo é reduzir a verticalidade dos dedos, deixar parte das palmas em 3/4 e apontar a mão para frente sem quebrar o rig. Busca executada apenas no carregamento e resize, sem custo contínuo.
- Os testes antigos não mediam realmente os ossos pós-pose; agora `tests/fps-natural.spec.js` resolve os nomes sanitizados do GLTF e compara a projeção verdadeira dos dedos contra os landmarks.
- **Ainda pendente:** conferir nova captura do navegador e qualidade anatômica, validar CI completo e FPS/p95 do usuário. Um teste intermediário falhou por procura literal do nome `f_middle.03.L_end` em vez de usar a normalização dos nomes do GLTF; teste corrigido, não era falha de renderização.
- PR #22 segue draft, produção intocada.

## Correção da pose natural — continuação da v0.9.15 (16/10/2026)

- Feedback do usuário: o modelo original de David Fischer continua, mas os punhos e dedos não têm uma posição natural de primeira pessoa. **Não trocar o GLB nem redesenhar o universo.**
- Diagnóstico comprovado nas capturas do CI #38940487099: na variante cinematic, o NDC salvo para a ponta do dedo indicava y≈-0,45, enquanto a projeção real após girar os punhos era y≈-0,61. A causa é medição dos landmarks antes de aplicar a pose definitiva.
- Correção de código: extrair `setBonePose()` comum a calibração/animação; medir punhos e pontas após posicionamento dos bones, orientar suavemente cada mão para o centro por comparação de projeções reais, e atualizar `state.framing` após o ajuste.
- Nova variante padrão `fpsStyle=natural`: punhos sem dobra FBX extrema; ajuste individual em espaço da câmera, procurando ponta do médio levemente acima e para dentro, mantendo a origem do punho fixa. `fpsStyle=original|calm|cinematic` e `fpsTune` seguem disponíveis para comparações.
- Nova regressão `tests/fps-natural.spec.js` validada em 1748×864 e 1920×951: posição de ponta dos dedos pós-pose, direção para dentro do quadro, Nox, 3 planos ESO, bloom; anexa screenshots no CI dedicado. Imagens e FPS/p95 real ainda são **pendências até o resultado do CI e inspeção humana**, não declarar pose final aprovada.
- Branch `preview/fps-hands-david-v0915`, PR #22 em draft. **Nenhuma promoção para produção `main` sem aprovação explícita.** Processo de pesquisa obrigatória para novidades permanece em vigor.

## Continuação v0.9.15 — QA visual real (16/10/2026)

- Após duas interrupções de conexão, trabalho retomado na `preview/fps-hands-david-v0915`. O modelo de David Fischer, licença CC BY, crédito visível, código e PR #22 já estavam presentes e foram preservados. A produção `main` permanece intacta.
- [Teste de integração local #38940487126](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38940487126) passou **4/4**: arquivo GLB, 63 ossos e falanges, Nox/viagem, movimento reduzido, atribuição e modo `hands=off`. Capturas de 1748×864 e 1920×951 analisadas.
- [QA artístico #38940487099](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38940487099) passou **7/7**; foram comparados `fpsStyle=original|calm|cinematic` e luzes básicas/dedicadas. A malha profissional é bem mais anatômica que o WRAD, mas a pose padrão ainda estava excessivamente vertical.
- Para evitar aprovar o visual apenas pelo CI, criados ajustes A/B `fpsTune=base|forward|reach|inward|back`, com screenshots idênticos. Comparação visual inicial: `forward`, `reach` e `inward` escondem ou deformam demais os dedos; **`base` permanece a pose mais legível** até avaliação do usuário. Os ajustes extremos ficam disponíveis somente como parâmetros técnicos, não padrão.
- `tests/fps-hands-david.spec.js` e CI isolado `testar-david-fischer.yml` verificam GLB, NDC, créditos, reduzido, Nox e screenshot nas duas resoluções; regressão completa segue em execução. Corrigida expectativa obsoleta do teste A/B dos punhos e timeout de captura multi-variante.
- Pendente: fechar o CI final, aprovar a direção estética com o usuário e obter FPS/p95 reais com `hands=fps` e `hands=off`. **Nunca promover para produção sem autorização explícita.**

## Em andamento — v0.9.15 David Fischer FPS com rig original (16/10/2026)

- **PR #22 draft:** https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/22, branch `preview/fps-hands-david-v0915`, base `preview/viewmodel-pesquisado-v0914`. **Produção `main` intocada.**
- Pedido do usuário: integrar o **First Person hands rigged de David Fischer** e validar no nível mais alto de qualidade visual, estrutura, FPS e licença. Não continuar usando modelos procedurais/VR reprovados como padrão.
- Pesquisados padrões de viewmodel em [IRONLINE (Three.js)](https://github.com/cktang88/3d-fps/blob/main/docs/FP_FRAMING.md), [s&box first-person viewmodel](https://sboxguide.dev/guides/first-person-viewmodel), bibliotecas Three.js SkinnedMesh/GLTFLoader, e a implementação do [KineTwin](https://github.com/Pruek-Sang/kinetwin) com essa mesma malha e rig. Seguir `PADRAO-PESQUISA-NOVAS-FUNCIONALIDADES.md` para toda feature.
- **Arquivo CC BY original de David**, obtido da redistribuição documentada pelo KineTwin (via Sketchfab API em 22/06/2026), blob SHA `110be5c6f6a72c396058be927de5e89f3c7d1bb5`, 387.856 bytes, 63 ossos, 40 falanges e 7.966 triângulos, armazenado localmente. Atribuição completa em `LICENCAS/DAVID-FISCHER-FPS-HANDS-CC-BY-4.0.md`, visível em rodapé `#fpsHandsCredit`.
- `first-person-hands-fps.js`: viewmodel preso à câmera, usa mesh original, calibra NDC de punhos e dedos, material violeta e alpha por vértice, quaternions de dedos, sway e movimento reduzido. `hands=fps` padrão na prévia desktop; fallback `hands=vr`, `hands=rig`, `hands=3d`, `hands=2d`, `hands=off`.
- **Diagnóstico inicial passou:** [run 38933712805](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38933712805) 3/3 testes, com punhos NDC x±.54/y≈-.84 e ponta do médio y≈-.446; câmera 1748×864. Captura revelou **pose de "pare", braços longos** apesar de bom rig. Por isso foi adicionada comparação A/B `fpsStyle=original|calm|cinematic`, alterando flexão real dos punhos, fade e posição, com screenshots no CI antes de escolher o padrão.
- CI completo, screenshot final, FPS/p95 no PC e aprovação visual do usuário **ainda em andamento**; não presumir 60 FPS atuais; não promover produção.

## Prévia v0.9.15 — integração do modelo profissional de David Fischer (16/10/2026)

- O usuário aprovou a estratégia de migrar para **First Person hands rigged (David Fischer)** e pediu a execução completa após rejeitar visualmente o WRAD e o Wonderland VR. Sem mexer na produção `main`.
- [PR #22 draft](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/22), branch `preview/fps-hands-david-v0915`, base `preview/viewmodel-pesquisado-v0914`.
- Pesquisa: fonte Sketchfab original CC BY, Download API oficial exige autenticação; foi encontrada **redistribuição documentada KineTwin** de um GLB baixado pela API, com CC BY e mesma autoria. Importado sem modificar arquivo binário, SHA `110be5c6f6a72c396058be927de5e89f3c7d1bb5`, ~388KB, 63 ossos. Documentação `ESTUDO-MAOS-DAVID-FPS-v0915.md`, `ASSETS-TERCEIROS-MAOS.md`, `LICENCAS/DAVID-FISCHER-FPS-HANDS-CC-BY-4.0.md`.
- Novo `first-person-hands-fps.js` monta SkinnedMesh principal com material discreto, fade dos braços, estado `ready`, pose relaxada, reduced-motion e seleção da viagem. **Calibra posição pelos ossos dos punhos e ponta dos dedos**, não pelos braços/Box3. UI dá atribuição visível CC BY quando FPS ativo.
- `hands=fps` é padrão somente nesta prévia desktop; `hands=vr`, `rig`, `3d`, `2d`, `off` continuam reversíveis. Sem efeitos extra, e foto ESO/3 recortes/bloom/Nox/146 estrelas preservados.
- Testes novos `tests/fps-hands.spec.js` exigem GLB local, ossos e dedos, screenshot e NDC de punhos/pontas, navegação ao Nox, reduced-motion e sem downloads quando off. CI isolado `.github/workflows/validar-fps-david.yml` para não esperar apenas pelo CI completo.
- **Status:** integração feita, aguardando validação visual e técnica por GitHub Actions/Cloudflare e FPS no PC. Não afirmar 60 FPS da v0.9.15 sem medição e **nunca fazer merge na produção sem autorização explícita**.

## QA final — v0.9.14 (16/10/2026)

- **Correção após comparação visual:** a pose VR "pare" e dobra excessiva ainda estavam feias; nova pose `handPose=relaxed` (padrão) usa inclinação da palma em profundidade (pitch 2,11 rad), dedos curvados moderadamente, sway leve e braço/punho na periferia inferior. `handPose=open` preserva A/B.
- [Calibração e capturas A/B #38928849138](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38928849138): **4/4 testes aprovados**. Medições 1748×864: punhos ±0,54/y≈-0,936, pontas dos médios ±0,495/y≈-0,635. Nox livre.
- [CI completo #38928849187](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38928849187): **48/48 testes Playwright aprovados, sem flaky**, código/estrutura e compilação aprovados. [Cloudflare preview](https://preview-viewmodel-pesquisado.orion-observatorio-3d.pages.dev/?quality=eco-plus&hands=vr) confirmado no commit `e4ec6d2`.
- O modelo VR MIT do Wonderland Engine é **provisório**; ergonomia está melhor, mas acabamento continua distante do visual de Clove e precisa de aprovação. Modelo FPS de David Fischer (Sketchfab CC BY 8,2k tri, Blender/FBX) é candidato **não incorporado**; confirmar licença e fonte original antes de qualquer download/conversão.
- **Regra definitiva do projeto:** antes de introduzir qualquer recurso novo, estudar pelo menos duas implementações similares que já funcionam, fundamentar comparação, plano de custos e QA por screenshot; ver `PADRAO-PESQUISA-NOVAS-FUNCIONALIDADES.md`. Não promover para produção `main` sem autorização do usuário.
- Pendente somente decisão de arte com o usuário e medição FPS/p95 no seu hardware (60 FPS históricos não atribuídos à revisão).

# Continuidade do Observatório 3D

Este é o ponto de entrada do desenvolvimento quando o histórico do chat do ChatGPT ficar grande ou for necessário abrir uma conversa nova.

**Fonte de verdade:** o código e o histórico dos PRs do GitHub. Para decisões criativas, problemas e próximos passos, consultar a [issue permanente #10](https://github.com/Kaue-Feltrin/orion-observatorio-3d/issues/10). **Não presumir que este arquivo ou o chat substitui a inspeção do repositório.**


## Processo revisado — pesquisa obrigatória e enquadramento real FPS (16/10/2026)

- Instrução contínua do usuário: **sempre pesquisar sistemas similares que já funcionam antes de implementar qualquer recurso novo**. Seguir `PADRAO-PESQUISA-NOVAS-FUNCIONALIDADES.md` com no mínimo duas referências técnicas reais, licenças, viabilidade, plano de QA visual, métricas e prévia separada. **Não considerar CI verde como aprovação estética**.
- Captura do usuário em v0.9.13: dois antebraços enormes rosa apontando para dentro; mãos e dedos ausentes. O WRAD ARMS é explicitamente PS1/retro e **não é estética final adequada**.
- Referências pesquisadas: [IRONLINE/Three.js `FP_FRAMING.md`](https://github.com/cktang88/3d-fps/blob/main/docs/FP_FRAMING.md), que mede viewmodel por coordenadas de mão e câmera vFOV 52°, e [s&box Field Guide — FP Viewmodel](https://sboxguide.dev/guides/first-person-viewmodel), que separa pose de viewmodel da cena.
- [PR #21 draft](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/21), branch `preview/viewmodel-pesquisado-v0914`, baseada na v0.9.13, produção `main` preservada.
- Diagnóstico mediu **punhos NDC ±0,572, y=-1,106 e dedos y≈-1,16** (abaixo da tela); ombros centrais em y=-0,53, precisamente a inversão mostrada na foto.
- Corrigido: giro X=π do rig em espaço da câmera, enquadramento **pelos ossos dos punhos** em vez de pelo `Box3` global, vFOV 52° preservado. Primeira calibração passou: punhos x±.54/y=-.70, dedo médio x±.66/y=-.57, ombros y=-1.10 (fora da tela). Ajuste fino em andamento: punhos x±.47/y≈-.84; fade progressivo da malha dos ombros/antebraços por vertex alpha, para exibir mãos ao invés de braços intermináveis.
- Captura e teste `tests/framing-probe.spec.js` exigem punhos/dedos **dentro** do quadro, ombros **fora**, mais screenshot sem painel. A/B mantém `hands=rig`, `hands=3d`, `hands=2d`, `hands=off`.
- Pendente: CI e captura final, FPS/p95 no PC do usuário, e principalmente **seleção de modelo mais refinado, não retro**. Alternativas verificadas incluem [Rigged FPS Arms RafaP, CC BY](https://sketchfab.com/3d-models/rigged-fps-arms-6b1cde4746774b7893513f84cac7a866), com requisitos de licença/arquivo. Não promover modelo WRAD a definitivo sem feedback visual.

## Nova prévia — v0.9.13 Modelo CC0 rigado com dedos animáveis (16/10/2026)

- Feedback explícito do usuário: v0.9.12 funcionou mas **as mãos artificiais ficaram muito feias**. Pedido: pegar **modelo 3D gratuito e animável**.
- **PR #20 draft:** https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/20. Branch `preview/maos-rig-gratuito-v0913` baseada na v0.9.12; **main e produção intocadas**.
- Pesquisados modelos gratuitos com licenças; escolhidas as **duas mãos/braços do WRAD ARMS** de wriks, **CC0** com GLB local `orion-observatorio-upload-github-leve/public/models/wrad-arms.glb`, 456.328 bytes e blob SHA `be023c46705bf8571e9ab97dbd3e71d2f18f8473`. Um SkinnedMesh, **50 bones, 30 juntas de dedo** (5 por mão, 3 falanges), 1.196 triângulos, textura embutida. Fonte https://github.com/wwwriks/wrad-arms e documentação `ASSETS-TERCEIROS-MAOS.md`. Nenhum download externo é necessário em tempo de execução.
- Módulo `first-person-hands-rig.js` usa GLTFLoader, modelagem original do artista, pigmentação violeta leve e **idle autoral com pequenas rotações por quaternion nos ossos reais**. Futuras animações: abrir/fechar dedos, gesto e interação. `hands=rig` / `hands=on` é o padrão em desktop; `hands=3d` preserva 3D rudimentar v0.9.12, `hands=2d` preserva v0.9.11 e `hands=off` sem modelo.
- **A/B:** `?debug=1&quality=eco-plus&hands=rig`, versus `hands=3d`/`2d`/`off`; painel registra joints, número de falanges, texturas e erro de download se ocorrer.
- Preservados Nox, 3 planos ESO, bloom, 146 estrelas, viagem, ficha e qualidade Eco+; `prefers-reduced-motion` mantém bones parados.
- **Pendência:** CI/headless, conferir screenshot sem debug, FPS/p95 reais e opinião visual. WRAD é modelo retro leve e pode requerer futuro modelo mais realista. NÃO fazer merge em produção sem autorização.

## Próxima prévia — v0.9.12 Mãos 3D reais em primeira pessoa (16/10/2026)

- [PR #19 draft](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/19), branch `preview/maos-3d-v0912`, base `preview/maos-eterias-v0911`. `main` intocada.
- Usuário: v0.9.11 funcionando; agora quer mãos **verdadeiramente tridimensionais** mantendo estilo primeira pessoa e fluidez.
- Módulo novo `first-person-hands-3d.js`: palma/dorso, cinco dedos com falanges e polegar, punho/antebraço/manga 3D; primitivas mescladas num único BufferGeometry, **2 meshes, 1 material, 0 texturas**. Vertex colors com alpha e reflexos violetas estilizados, sem shaders/luzes/bloom adicionais.
- `main.js`: desktop usa **3D padrão**; `hands=on`/`hands=3d` seleciona 3D, `hands=2d` preserva totalmente arte v0.9.11, `hands=off` cria zero modelos de mãos; mobile sem mãos por padrão. `?debug=1` mostra A/B e vértices/triângulos, modo, texturas.
- `ESTUDO-MAOS-3D-v0912.md` contém arquitetura, custos, análise estética e URLs de teste.
- Nox, 3 recortes ESO, bloom, 146 estrelas, céu vazio, viagem, fichas e produção intocados.
- CI, screenshot e FPS reais pendentes; **60 FPS permanecem meta do histórico, não resultado desta versão**. Não mesclar sem autorização.

## Nova prévia — v0.9.11 Mãos mais visíveis / pose primeira pessoa (16/10/2026)

- **PR #18 draft:** https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/18, branch `preview/maos-eterias-v0911`, base `preview/maos-primeira-pessoa-v0910`. **Produção `main` não tocada**.
- Pedido: executar checklist com mãos mais ao estilo de linguagem etérea da Clove, em primeira pessoa, mais próximas/visíveis e assimétricas; usar arte autoral e não copiar game assets.
- Módulo `first-person-hands.js`: redesenho CanvasTexture 320×512 com contorno de dedos relaxados, manga, gradientes violeta/rosa, luz interna pintada. Material alpha 0,67→0,78; 2 planos, 1 única textura/geometria/material.
- Pose **esquerda**: z=-1.10, x=-0.70, y=-0.72, altura 1.10 relativo ao semi-frustum, rotação -.20 rad. **direita**: z=-1.00, x=+.68, y=-.66, altura 1.17, rotação +.18. Sway e respiração discretos, sem shaders ou sprites adicionais.
- Mantém bloom do Nox, 3 recortes ESO, foto original, viagem, `hands=off` sem alocação e reduced-motion estático. Código de `main.js` da v0.9.10 preservado.
- Instrução pronta: `INSTRUCAO-IMPLEMENTACAO-MAOS-v0911.md`, descrição arquivo a arquivo, referências de estilo, limites e testes.
- **Validação técnica concluída:** [CI #59](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/38912033362) com **36/36 testes Playwright aprovados, sem flaky**, check e build aprovados; Cloudflare confirmou [prévia v0.9.11 publicada](https://preview-maos-eterias-v0911.orion-observatorio-3d.pages.dev/?quality=eco-plus&hands=on) no commit `f16949e`. Screenshot do CI analisado: mão direita presente na borda inferior, centro/Nox desobstruído; painel de depuração cobre parcialmente mão esquerda. **Pendente apenas feedback visual e FPS/p95 reais do usuário**, não assumir 60 FPS desta prévia nem mesclar em produção.

## Nova prévia — v0.9.10 Estudo + mãos etéreas em primeira pessoa (16/10/2026)

- **PR #17 draft:** https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/17, branch `preview/maos-primeira-pessoa-v0910`, base v0.9.9 (`preview/veu-proximo-v099`). Produção `main` preservada.
- **Solicitação:** fazer um estudo de como adicionar mãos em primeira pessoa e implementar o protótipo mantendo a estética discreta do Observatório e a referência de 60 FPS já medida na v0.9.9.
- **Estudo integral:** `ESTUDO-MAOS-PRIMEIRA-PESSOA-v0910.md` compara sobreposição CSS, viewmodel de planos, low-poly 3D e glTF rigado, além de riscos de oclusão, motion sickness, acessibilidade e orçamento.
- **Prova de conceito:** novo módulo `first-person-hands.js` desenha duas silhuetas etéreas **provisórias**, usando 1 CanvasTexture compartilhada e 2 meshes planares sob a câmera (layer 0, fora do bloom). Sway mínimo e respiração sutil; `prefers-reduced-motion` remove animação; mãos escondidas na viagem.
- **Comparativos:** `?debug=1&quality=eco-plus&hands=on` versus `?debug=1&quality=eco-plus&hands=off`; telas touch ficam sem mãos por padrão. A/B mantém foto ESO, Nox, bloom, 3 recortes ESO e viagem.
- **Meta:** estimativa de +2 draw calls e +1 textura; FPS/p95 do hardware do usuário **ainda não confirmados** na v0.9.10. Verificar também percepção visual: mãos reconhecíveis, sem cobrir Nox/UI, sem aspecto de papel colado.
- **Próximo:** validar CI/Cloudflare, analisar screenshot e testes, comparar performance real e aprovar/rejeitar conceito antes de pensar em asset final. Nunca mesclar `main` sem consentimento explícito.

## Próxima prévia — v0.9.9 Primeiro plano de nebulosa (16/10/2026)

- [PR #16 draft](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/16) na branch `preview/veu-proximo-v099`, base `preview/paralaxe-responsiva-v098`; `main`/produção não alterada.
- O usuário aprovou a maior responsividade da v0.9.8, mas sente falta de planos ainda mais próximos. Perguntou se futuras **mãos** resolveriam a profundidade. Diretriz: mãos ajudam presença e escala, porém a profundidade da nebulosa requer um primeiro plano independente; NÃO criar mãos especulativas nesta fase.
- V0.9.9: recorte `03` já disponível da própria ESO, posicionado em Z=-75 com opacidade 0,38× original, passa a compor o Eco+ junto de `02` em -342 e `04` em -185; transparência ordenada por Z, redimensionamento reprojeta a foto original.
- Comparação: `?debug=1&quality=eco-plus` (3 recortes) e `?debug=1&quality=eco-plus&foreground=off` (2 recortes v0.9.8). Mantém bloom aprovado, 0 gás GLSL, espaçamento vazio, 146 estrelas e Nox. Custo adicional possível de **1 draw call e 1 textura carregada**. Não assumir 60 FPS desta revisão.
- Próximo: validar CI, deploy, conferir screenshot e pedir percepção visual e FPS/p95 do usuário. Sem merge para produção sem aprovação.

## Próxima prévia — v0.9.8 Paralaxe Responsiva (16/10/2026)

- Após testar a v0.9.7, usuário relatou **“ainda tme pouco movimento responsivo”**. Criado [PR #15 (draft)](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/15), branch `preview/paralaxe-responsiva-v098`, base `preview/profundidade-organica-v097`. **Produção main preservada**.
- Correção de causa concreta: v0.9.7 usava câmera já suavizada (`smooth.x`) e mais um filtro lento de 4,2/s nos planos. V0.9.8 usa alvo direto do mouse, filtro rápido 14/s (~70ms) e amplitudes 3× maiores (central 5,2, próximo 16,5 unidades X; Y 2,1/6,2).
- Slider no debug `Paralaxe da nebulosa` (0,45× a 1,60×), valor de controle no relatório; `?depthMotion=off` continua disponível para A/B.
- Mesmos 2 recortes ESO em profundidade, zero camadas GLSL de gás no Eco+, bloom do Nox mantido. Zero novos shaders/texturas/meshes/draw calls. O panorama ESO, 146 estrelas e `star-journey.js` não foram modificados.
- Próximo passo: CI, deploy prévia, feedback de movimento lateral/vertical, FPS/p95 no PC. A referência real de 60 FPS é **v0.9.6** e não comprova desempenho da v0.9.8. PR segue draft, sem merge.

## Nova prévia — v0.9.7 Profundidade Orgânica (16/10/2026)

- PR #14 (draft): https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/14, branch `preview/profundidade-organica-v097`, base `preview/eco-plus-v096`; **não mesclado com produção**.
- Base aprovada: Eco+ com bloom do Nox; usuário gostou do brilho mais forte. Eco+ com e sem bloom foram ambos 60 FPS, p95 16,8ms (16/10, janela 1920×951). A aprovação foi para **manter o brilho**, não para produção.
- V0.9.7: *sem novos passes/texturas/objetos*; dois recortes da fotografia ESO já existentes em planos z=-342 e -185 têm resposta inercial suave ao movimento da câmera, com leve respiração de escala abaixo de 0,4%, sem alterar a foto ESO, as estrelas ou o Nox.
- Comparação A/B: `?debug=1&quality=eco-plus` versus `?debug=1&quality=eco-plus&depthMotion=off`. Respeita preferência de movimento reduzido. Registrar percepção de profundidade e FPS/p95 reais antes de aprovar.
- Próximos passos: validar CI, abrir prévia, testar na GPU real, confirmar viagem para a ficha, documentar resposta visual. PR continua draft, produção intacta.

## Nova prévia — v0.9.6 Eco+ com bloom (15/10/2026)

- PR #13: https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/13, branch `preview/eco-plus-v096`, base `preview/eco-diagnostico-v095`, **draft, sem merge**.
- Medição real em 1920×951: Lite 20 FPS/p95 72,2 ms/100% frames >33ms; Lite sem bloom 17 FPS/72,3 ms/96%; Lite sem gás 23 FPS/50,1 ms/60%; Eco 33 FPS/38,9 ms/29%.
- Interpretação: tirar bloom sozinho não melhorou; remover gás trouxe melhoria; Eco trouxe ganho total de 65% vs Lite, mas é impossível isolar a contribuição de menos pixels no teste anterior. Não afirmar causalidade exclusiva de GPU.
- Eco+ é **experimento de equilíbrio**: DPR máximo .60, 670k pixels, 2 recortes ESO em Z, sem gás procedural, bloom de repouso mantido e efeitos de viagem preservados. Variante Eco+ sem bloom isola o custo desse efeito com DPR igual.
- Painel permite comparar Lite, Lite sem gás, Eco+ com/sem bloom e Eco; com qualidade manual, desabilitar adaptação automática para comparações. Perfil automático pode cair em etapas Lite → Eco+ → Eco.
- **Pendente:** CI, observar foto ESO e Nox no PC do usuário e obter novas medidas em Eco+ com e sem bloom. Não enviar produção sem aprovação.

## Nova prévia — v0.9.5 Eco + comparação A/B (15/10/2026)

- **PR #12 (draft):** https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/12
- **Branch:** `preview/eco-diagnostico-v095` baseada em v0.9.4, sem merge na produção ou na branch v0.9.3.
- **Evidência real no PC:** 14 FPS no perfil Lite, p95 105,5–111,1 ms, quadros acima de 33ms 100%, DPR .72, 25 draw calls, 20 texturas, defasagem interna mouse/câmera .2–.4 px; heap JS 9 MB **não** é RAM total.
- **Tese a testar, NÃO conclusão:** custo de fragment shader/bloom/resolução do render principal pode estar limitando FPS. Comparar Lite, Lite sem bloom, Lite sem GLSL e Eco para distinguir causas.
- **Modo Eco:** limite de 500k pixels, 2 recortes reais da ESO em profundidade, nenhum shader GLSL de gás em repouso, sem passes de bloom em repouso; **bloom e viagem preservados durante o clique**. Modo automático pode degradar Lite→Eco; opção manual fica estável para testes.
- **Próximo passo:** validar CI e abrir os quatro comparativos `?debug=1`. Colher números reais do usuário e verificar nitidez/profundidade do Eco antes de alterar padrão ou mesclar.
- **Preservados:** ESO, Nox, raios, Raycaster, estrela, `star-journey.js`, ficha, cenário sem estrelas extras.

## Continuação em andamento — v0.9.4 (15/10/2026)

- **PR #11 (draft):** https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/11
- **Branch:** `preview/diagnostico-fluidez-v094`, partindo da `preview/nebulosa-volume-fluidez-v093` (PR #9), **sem merge ou alterações na `main`**.
- **Objetivo:** diagnóstico no hardware real antes de ajustar novamente parallax, iluminação ou qualidade adaptativa.
- **Entrega:** `performance-panel.js` — painel de FPS/p95/quadros longos/camadas/draw calls/texturas e defasagem interna do mouse, habilitado exclusivamente em `?debug=1`, com cópia do relatório. RAM total **não** medida pelo JavaScript.
- **Próximo passo:** conferir pipeline do PR #11, abrir prévia, coletar diagnóstico no computador do usuário, confirmar fluidez e volume visual. Não aprovar a estética apenas pelo CI.
- Documentação mais completa no README do projeto e na issue #10.

## Estado registrado — 15/10/2026
- Repositório: https://github.com/Kaue-Feltrin/orion-observatorio-3d
- Versão em avaliação: **v0.9.3 — Nebulosa em Volume + Fluidez**, [PR #9](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/9).
- Branch de trabalho: `preview/nebulosa-volume-fluidez-v093`.
- Base do PR #9: `preview/foco-nox-foto-original-v092d`.
- Ao registrar este estado, o PR estava **aberto e em draft, sem merge**.
- Aplicação Vite + Three.js no diretório `orion-observatorio-upload-github-leve/`.
- Verificação funcional: `npm run check`, `npm run build`, `npm run test:browser` com Playwright/Chromium.
- **O visual e a performance da v0.9.3 ainda precisam de aprovação do usuário em seu computador.**

## Decisões imutáveis sem aprovação explícita
1. O **Nox** é o foco visual; preservar a estrela, seus raios luminosos giratórios e a seleção por clique/teclado.
2. Preservar o **JPEG fotográfico ESO/S. Brunier**, sua nitidez e seus créditos. Não remover estrelas da própria foto. A tentativa da v0.9.2c foi rejeitada.
3. Estética espacial cinematográfica **vazia e contida**: pouco ruído, poucas estrelas extras, pouca névoa decorativa e bloom discreto.
4. Manter a animação de viagem em `star-journey.js`, Raycaster, caminho da ficha e acessibilidade, salvo pedido expresso.
5. Desempenho é um requisito: o usuário já relatou quase 4 GB de RAM e atraso no seguimento do mouse em versões anteriores. Testes automatizados **não** equivalem a medições de RAM/FPS no hardware dele.
6. **Nunca fazer merge ou deploy de produção sem autorização explícita do usuário.** Trabalhar em prévias e evitar mexer na `main` durante avaliações.

## O que a v0.9.3 pretende entregar
- Foto ESO original preservada.
- Quatro recortes fotográficos orgânicos transparentes da nebulosa, em profundidades z=-425, -342, -252 e -185, com movimentos diferentes e um véu frontal sutil.
- Dois/três/quatro recortes carregados conforme qualidade lite/equilibrada/alta.
- Câmera com resposta ao mouse mais rápida (~55ms em vez de ~140ms), menos trabalho desnecessário no DOM, bloom em cadência reduzida no repouso e até 60FPS no modo leve **quando o dispositivo suportar**.
- Manutenção da viagem e estrela, sem poluir o cenário com partículas adicionais.

## Próximo passo obrigatório
Avaliar a v0.9.3: profundidade perceptível da nebulosa versus aparência de imagem plana, fluidez do mouse, RAM/FPS no dispositivo do usuário, integridade do Nox, fotografia ESO e viagem. Ajustar **somente na branch de prévia** conforme feedback. Não declarar aprovação visual ou desempenho real sem verificação.

## Protocolo de cada versão
1. **Antes de editar:** consultar issue #10, PR mais recente, branch/base, arquivos envolvidos e testes. Verificar se o estado registrado continua atual.
2. **Implementar:** usar branch de prévia, alterações pequenas e reversíveis; não reintroduzir abordagens já rejeitadas.
3. **Validar:** registrar precisamente quais checks/build/testes passaram; separar testes de navegador de avaliação visual e medições no PC do usuário.
4. **Entregar:** informar links diretos, diferença para a versão anterior, o que foi preservado e o que ainda precisa de avaliação.
5. **Registrar antes de encerrar:** atualizar a issue #10 com versão, branch/PR, commits relevantes, mudanças, testes **de fato executados**, decisões rejeitadas, pendências e próximo passo. Manter o resumo atual em destaque e as versões anteriores em histórico cronológico.
6. **Só aprovar/mesclar:** após feedback expresso do usuário. Nunca converter automaticamente um check verde em aprovação estética.

### Mini-modelo de atualização da issue #10
```md
## [data] — vX.Y.Z — [em desenvolvimento / em avaliação / aprovada]
- PR/branch:
- Objetivo:
- Alterações implementadas:
- Itens preservados:
- Testes executados e resultados:
- Validação visual/FPS/RAM no PC do usuário: [não realizada / resultados]
- Feedback e abordagens rejeitadas:
- Pendências/bloqueios:
- Próxima ação:
- Produção: [preservada / merge autorizado em ...]
```

## Comando para iniciar outro chat
> Continue o Projeto Órion — Observatório 3D. Abra a issue #10, o arquivo CONTINUIDADE.md e o PR mais recente no repositório Kaue-Feltrin/orion-observatorio-3d. Confira o estado real, preserve ESO/Nox/viagem e trabalhe na branch de prévia. Atualize o registro ao terminar cada versão. Não mexa na produção sem minha autorização.

**Privacidade:** nunca gravar tokens, senhas, dados privados ou segredos em issues/PRs públicos.

**Limite importante:** o GitHub não captura automaticamente todo o histórico do chat. O protocolo precisa ser seguido a cada rodada de desenvolvimento; não há garantia de atualizações por conversas futuras sem executar essa etapa.
