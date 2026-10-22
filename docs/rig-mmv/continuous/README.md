> **Revisão anterior (`29a571d`):** o usuário ainda observou quinas no indicador e nos três dedos dobrados. [Revisão atual](../smooth/README.md). As medidas e evidências abaixo são históricas.

# Mão inteira, sem recortes ou crossfade

A revisão `41071db` foi rejeitada pelo usuário: o recorte do indicador sobre a mão neutra criou uma emenda visível e anatomia quebrada. Os testes funcionais anteriores não detectaram esse defeito artístico. As evidências de `fingers/` são históricas e não representam uma correção aceita.

## Correção

`handsMotion=perspective` agora usa **uma única superfície e a imagem neutra íntegra da mão direita**, com alpha constante 0,46 durante o gesto. Foram removidos o shader de recorte, a camada corporal e o crossfade entre artes diferentes. Nenhuma imagem foi redesenhada. Os assets intermediários anteriores permanecem no repositório como histórico, mas não são carregados nesse modo.

O indicador percorre quatro morph targets de contorno, construídos a partir das poses medidas, mais um alvo Z de até 0,14 unidade. As posições intermediárias deformam continuamente a mesma malha; os outros três dedos, o polegar e a palma mantêm a mesma textura. Foi corrigida também a curva da raiz do indicador, que antes reutilizava pontos neutros e criava um calombo. A máscara inferior aprovada é preservada.

Ossos de repouso, mola de hover/retorno/reversão, proporção e ancoragem permanecem. Hover real do Nox é o único gatilho na aplicação. Reduced-motion usa poses instantâneas estáticas com ossos/profundidade desligados; off não carrega mãos. Os modos anteriores `mesh` e `rig`, câmera, ESO, Nox, viagem e restante da cena permanecem com o comportamento anterior.

A escolha reutiliza os [morph targets nativos Three.js r180](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_morphtargets.html) combinados ao [SkinnedMesh](https://github.com/mrdoob/three.js/blob/r180/docs/api/en/objects/SkinnedMesh.html), já pesquisados no projeto. Ao contrário da troca de quadros do [AnimatedSprite PixiJS](https://github.com/pixijs/pixijs/blob/v8.6.6/src/scene/sprite-animated/AnimatedSprite.ts), uma textura permanece sobre a geometria durante todo o movimento. Nenhum runtime, dependência ou asset de terceiros foi adicionado. Continua sendo uma imagem deformada em 2,5D: não reconstrói superfícies ocultas nem fecha ou gira os três dedos em 3D.

## Verificação

- Unidade percorre 41 progressos em quatro instantes: nenhum triângulo invertido; área relativa observada 0,5375–2,1464. Exige buffers base estáticos e ausência de morph XY nos dedos abaixo de v=0,54.
- Testes exigem mesma imagem/opacidade e duas superfícies durante todo o gesto, além de hover/retorno/interrupção, profundidade, centro livre, três viewports, reduced/off e descarte.
- Nove capturas ampliadas em progressos 0, 0,125, 0,25, 0,375, 0,5, 0,625, 0,75, 0,875 e 1 mostram também os meios das passagens. Os progressos são fixados pelo teste; a interação real é verificada separadamente.
- CI anterior: quatro casos falharam por tempo limite com duas cenas SwiftShader simultâneas, incluindo modos anteriores. O CI passa a usar um worker, como a validação local, sem retirar assertions, aumentar tolerâncias visuais ou desligar animações. A falha visual relatada pelo usuário era independente desses timeouts.

Resultado local: **npm run check, npm run build, quatro suítes unitárias e 13/13 testes Playwright aprovados, sem retries, em 4,1 minutos**. Inclui as nove regressões dos modos anteriores e quatro casos da perspectiva. As nove posições foram inspecionadas ampliadas; o contorno do indicador permanece ligado à mão, sem o recorte rejeitado. Avaliação artística final ainda depende do usuário.

## Evidências atuais

- [Nove posições ampliadas](poses.webp), incluindo os meios das passagens. Os três dedos recolhidos mantêm uma única imagem durante a extensão do indicador.
- Cena completa: [neutra](1920x1080-neutral.webp), [apontando](1920x1080-pointing.webp), [retorno](1920x1080-returned.webp), [1920×951](1920x951-pointing.webp), [390×844](390x844-pointing.webp).
- [Captura anterior rejeitada, para comparação](../fingers/1920x1080-pointing.webp).
- [Vídeo de hover, retorno e interrupção](continuous.mp4), capturado do canvas Eco+ 1091×613, sem HUD/vinheta CSS. Não mede FPS físico do equipamento.
- [Métricas reais do navegador](metrics.json) e [sequência observada durante a gravação](sequence.json).

## Recursos e arquivos

A/B na mesma janela: rig anterior **29 → perspectiva 26 texturas**; a revisão rejeitada tinha 40. São duas imagens, dois rigs/18 controles e **duas superfícies/3552 triângulos durante todo o gesto**. Arrays base 144768 bytes, morphs 64380 bytes, dados dos skeletons 2048 bytes. Não são RAM/VRAM totais nem FPS do dispositivo. Sem novas dependências, subdivisões ou imagens.

Arquivos de código: `first-person-hands-mesh.js`, `hands-image-rig.js` e `hands-perspective-motion.js`; removido `hands-index-layer.js`. Testes atualizados: `tests/hands-perspective.spec.js`, `tests/hands-perspective.unit.mjs` e serialização de CI em `playwright.config.js`. Documentação/evidências em `docs/rig-mmv/`, `CONTINUIDADE.md` e `CONTEXTO_COMPLETO_CUMULATIVO.md`.

Uso: `?quality=eco-plus&hands=mesh&handsMotion=perspective`. Mesma branch `codex/maos-rig-mmv`, PR #29. Sem alterar/mesclar main ou branch de referência. CI remoto da rodada a conferir após push. Não promover a padrão nem iniciar melhorias adicionais.
