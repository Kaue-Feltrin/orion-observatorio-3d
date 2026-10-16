# v0.9.12 — Prova de conceito de mãos verdadeiramente 3D

**Data:** 16/10/2026. **Status:** prévia isolada, a produção está preservada.  
**Pedido:** substituir mãos planas da v0.9.11 por mãos 3D de primeira pessoa, sem apagar o modo anterior.

## Fundamentação técnica

O Observatório já usa uma câmera com rig, viagem 3D real e orçamento gráfico medido no PC do usuário. A v0.9.9 atingiu 60 FPS, p95 16,8 ms e 0% de quadros acima de 33 ms, com 3 recortes ESO e bloom ativo. Os resultados da v0.9.12 **ainda exigem medição real**.

Para não multiplicar draw calls, a implementação usa **geometrias tridimensionais nativas**, mescladas **uma vez** em uma só malha por mão. A geometria final tem palma/dorso arredondados com espessura Z, punho, antebraço com manga, quatro dedos com articulações, polegar articulado e pequenos reflexos violeta incorporados na malha. O modelo é low-poly autoral; **não é** a mão/modelo/textura extraído de Clove/VALORANT. A inspiração é somente a cor e a pose de primeira pessoa, conforme intenção do usuário.

A documentação oficial Three.js confirma que `BufferGeometryUtils.mergeGeometries()` permite combinar malhas em um objeto e usar `vertexColors` para manter cores diferentes sem mudar de material, reduzindo draw calls. `MeshBasicMaterial` não exige luz, e `depthTest=false` evita oclusões estranhas nos elementos de primeiro plano.

Referências:
- https://threejs.org/docs/pages/module-BufferGeometryUtils.html
- https://threejs.org/manual/pages/optimize-lots-of-objects.html
- https://threejs.org/docs/pages/MeshBasicMaterial.html
- https://threejs.org/docs/pages/Material.html
- https://playvalorant.com/pt-br/news/game-updates/clove-a-morte-e-so-o-comeco/

## Arquivos e decisões de implementação

**`orion-observatorio-upload-github-leve/first-person-hands-3d.js` (novo):**
- Cinco dedos completos por mão, com duas falanges por dedo, pontas arredondadas, polegar separado, volumes de palma/dorso/punho/manga.
- Mescla de primitivas geradas uma vez. **Dois meshes compartilham uma geometria e um material**; sem texturas ou luzes adicionais.
- Cores por vértice com sombreamento estilizado calculado ao construir a malha, alpha por vértice para o antebraço desaparecer abaixo do quadro; transparência e depth test desligados.
- Poses inspiradas nas proporções da v0.9.11: esquerda `z=-1.10 x=-.70 y=-.72`, direita `z=-1.00 x=+.68 y=-.66`; direita ligeiramente avançada e maior.
- Movimento levemente independente usando a mesma suavização `7.5/s`, sem animação de todos os vértices/ossos por frame; respeita `prefers-reduced-motion`. Oculta na viagem.
- Consumo projetado por frame: **2 draw calls de mãos, 0 texturas de mãos**, geometria compartilhada. Triângulos por mão aparecem no debug; mais vértices que versão 2,5D, mas renderização com número pequeno de chamadas.

**`main.js`:** modo `hands=3d`/ `hands=on` é o novo padrão no desktop. `hands=2d` conserva o desenho anterior (mesmas texturas e comportamento). `hands=off` não aloca geometria/meshes/texture. Mobile ainda off por padrão, mas aceita `hands=3d` manual. Nenhuma mudança na câmera, no Nox, na viagem, no bloom, nas 146 estrelas ou nos 3 recortes ESO.

**`performance-panel.js`:** adicionar variante 2,5D e relatório com modo, superfícies, texturas e triângulos por mão.

**`tests/observatorio.spec.js`, `tests/structure.mjs`:** antigos testes 2,5D executados explicitamente com `hands=2d` para preservar baseline; novos testes do modelo volumétrico verificam a malha única compartilhada, cores RGBA por vértice, 5 dedos, limite de triângulos, 0 texturas, modo reduzido, desligamento, navegação e A/B.

## Teste A/B para avaliação visual e de performance

- **3D:** https://preview-maos-3d-v0912.orion-observatorio-3d.pages.dev/?quality=eco-plus&hands=3d
- **2,5D anterior:** https://preview-maos-3d-v0912.orion-observatorio-3d.pages.dev/?quality=eco-plus&hands=2d
- **Sem mãos:** https://preview-maos-3d-v0912.orion-observatorio-3d.pages.dev/?quality=eco-plus&hands=off

Acrescentar `debug=1` para comparar FPS, p95, 0% frames >33ms, draw calls, texturas e triangulação do viewmodel. **Medir no PC do usuário** com mesma janela, alguns segundos de estabilização e mesmo movimento do mouse. Ram total da aba separadamente no Chrome (Shift+Esc).

## Critérios para passar à próxima versão

1. Reconhecíveis como **mãos volumétricas**, com cinco dedos cada, polegar, palma e punho — sem aparência de cartão/papel.
2. Profundidade e pose confortáveis; a mão direita mais presente, centro/Nox não encobertos, seleção e viagem inalteradas.
3. 60 FPS observado anteriormente continua **meta**, não valor afirmado para esta versão.
4. Aparência pode ser estilizada por enquanto: anatomia/arte final (modelagem glTF e animação de dedos) dependerão da aprovação visual; primeiro testar volume real e escala.
5. Manter a opção 2D e o modo desligado, e manter produção `main` sem merge até autorização explícita.
