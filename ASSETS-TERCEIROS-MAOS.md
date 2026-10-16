# Assets de terceiros — Observatório 3D

## WRAD ARMS — mãos/antebraços rigados em primeira pessoa

- **Autor:** wriks / [wwwriks](https://github.com/wwwriks)
- **Projeto original:** https://github.com/wwwriks/wrad-arms
- **Página de distribuição:** https://wriks.itch.io/wrad-arms
- **Asset incluído:** `orion-observatorio-upload-github-leve/public/models/wrad-arms.glb` (fonte `arms.glb` do repositório do autor).
- **Licença:** CC0 1.0 Universal — uso e modificação liberados, inclusive comercialmente, sem atribuição obrigatória. Referência: https://creativecommons.org/publicdomain/zero/1.0/
- **SHA Git original do blob:** `be023c46705bf8571e9ab97dbd3e71d2f18f8473` (preservado sem alterações).
- **Características verificadas no GLB:** 456.328 bytes, um mesh SkinnedMesh com 50 juntas no armature `arms` e aproximadamente 1.196 triângulos, uma textura PNG embutida. Bones para dedos indicadores, médios, anelares, mínimos e polegares de ambas as mãos (3 falanges por dedo).
- **Não incluso:** nenhum asset de Clove/VALORANT. A cor violeta, composição cinematográfica, animações de repouso dos dedos e lógica de interação com o Observatório são modificações originais implementadas no código do Projeto Órion.

O crédito acima é mantido por boa prática, embora o CC0 não exija atribuição. Verificar periodicamente se a procedência e licença permanecem documentadas.

## Decisão técnica v0.9.13

A alternativa de mão anatômica da Innerscene (https://www.innerscene.com/tools/library/3d-parts/posable-anatomical-right-hand-f6098b4f) também foi estudada: CC0, 495 KB, 16 ossos, mais realista, porém um modelo apenas da mão direita sem antebraço. Para **as duas mãos em viewmodel**, escolhemos o WRAD ARMS por já possuir as duas mãos e braços com todos os ossos, e por permitir armazenar o GLB localmente sem carregar conteúdo de domínios externos no site. O visual retro permanece experimental; se não agradar, mantemos a integração GLTF e trocamos somente o modelo.

## Teste e desempenho

Na prévia, `hands=rig` carrega este GLB local e aplica animação leve por quaternion em cada uma das 30 falanges. `hands=3d` restaura a geometria artesanal antiga, `hands=2d` volta à silhueta, `hands=off` remove todas as mãos. Em celulares, desligado por padrão.

O arquivo GLB com 456 KB não representa RAM ou VRAM residente. No modo rig ativo, apenas um draw call de malha é esperado, mas o orçamento de GPU precisa ser medido com o painel no computador do usuário. A referência de 60 FPS da v0.9.9 não comprova a performance da v0.9.13.
