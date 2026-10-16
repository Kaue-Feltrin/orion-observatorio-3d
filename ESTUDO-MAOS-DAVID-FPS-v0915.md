# Observatório v0.9.15 — Estudo, integração e validação das mãos FPS

**Status:** prévia de código; **não promover produção nem considerar aprovado visualmente antes de conferir captura e FPS reais**.  
**Pedido:** substituir modelos artificiais/VR que ficaram feios pelo candidato estudado de David Fischer e seguir o processo de pesquisa prévia de sistemas funcionais.

## 1. Referências efetivamente pesquisadas

1. [IRONLINE / Three.js — enquadramento de mãos FPS](https://github.com/cktang88/3d-fps/blob/main/docs/FP_FRAMING.md): referência de câmera/viewmodel específico, enquadramento real e QA por screenshot.
2. [s&box — viewmodel de primeira pessoa](https://sboxguide.dev/guides/first-person-viewmodel): separar transformação das mãos da cena do mundo, com offsets locais e poses em primeira pessoa.
3. [David Fischer — First Person hands rigged](https://sketchfab.com/3d-models/first-person-hands-rigged-547a45535f0c4fe787948f7a7a6a88db): obra específica de FPS, .blend/.fbx originais, 8,2 mil triângulos e rig pronto para animar, com CC BY.
4. [Sketchfab — Download API](https://sketchfab.com/developers/download-api/downloading-models): obtenção direta por API requer autenticação; não burlar autenticação, nem expor credenciais ou usar links temporários.
5. [KineTwin — licença e redistribuição](https://github.com/Pruek-Sang/kinetwin/blob/main/LICENSE-ASSETS.md): cópia original GLB baixada da API em 22/06/2026, mantida com atribuição CC BY. O repositório distribui arquivo `src/deploy/blender/models/first_person_hands_rigged.glb` sob CC BY; essa cópia foi importada byte a byte para o Órion.

## 2. Por que preferir este GLB aos anteriores

| Asset | Viabilidade de animação | Aparência em FPS | Limitação |
| --- | --- | --- | --- |
| WRAD ARMS CC0 | 50 bones, FPS | PS1/retrô, visual rejeitado | Mesmos braços enormes quando mal orientado |
| Wonderland Hand Poser MIT | 25 bones em cada mão, leve | Anatomia mais limpa, mas pose aberta/garra rejeitada | Sem antebraço artístico e acabamento simples |
| **David Fischer CC BY** | **63 ossos**, falanges individuais, ~8,2k tri | Criado para câmeras FPS | Exige calibração pela posição dos punhos e verificação de pose/material |

O GLB local pesa aproximadamente **388 KB**; isso NÃO é a memória GPU/RAM de execução. Há duas geometrias de origem, mas a segunda é acessório pequeno (~170 vértices); o viewmodel renderiza apenas o `SkinnedMesh` principal (~4.564 vértices).

## 3. Arquivos e alterações no repositório

- `public/models/david-fischer-fps-hands.glb`: GLB proveniente do KineTwin, com SHA de objeto Git `110be5c6f6a72c396058be927de5e89f3c7d1bb5`, mesma origem Sketchfab.
- `first-person-hands-fps.js`: `GLTFLoader`, `SkinnedMesh` original, cores leves por vértice, fade nos braços, animação dos ossos usando quaternions (sem render target extra), fallback desligado limpo, `resize` e `beginTravel`.
- `main.js`: `hands=fps` como modo padrão **apenas da prévia**. `hands=vr`, `rig`, `3d`, `2d`, `off` permanecem para A/B. Em telas touch, sem mãos por padrão, exceto opt-in.
- `performance-panel.js`: relatório de modo, falanges, triângulos, texturas e posição projetada dos ossos.
- `index.html` / `styles.css`: atribuição visível ao autor, **somente quando hands=fps está ativo**.
- `LICENCAS/DAVID-FISCHER-FPS-HANDS-CC-BY-4.0.md`: autor, link, CC BY, cópia, alterações e ausência de endosso.
- `tests/fps-hands.spec.js`: enquadramento projetado de punhos/pontas, captura, rig, reduced motion, Nox e modo sem mãos, sem requisição do GLB.
- `.github/workflows/validar-fps-david.yml`: CI focado e captura de evidência no Chromium.
- `tests/structure.mjs`: proteção das decisões anteriores e do novo asset.

## 4. Calibração geométrica

Não usar `Box3` do braço inteiro para definir a pose, pois isso foi a origem dos antebraços descomunais na v0.9.13. Em vez disso:

1. Ler os ossos `hand.L`/`hand.R` e `f_middle.03.L`/`f_middle.03.R`.
2. Obter os pontos em espaço local do viewmodel usando `getWorldPosition` / `worldToLocal`.
3. Testar orientações candidatas e escolher a que projeta a ponta do médio **acima** dos punhos no frame, sem cruzar as mãos.
4. Calcular escala pelo afastamento lateral dos punhos e ancorar os punhos em torno do terço inferior lateral da tela (aproximadamente NDC x ±0,54, y -0,84).
5. Checar na cena resultante (mesmo FOV do usuário) que todos os quatro landmarks estão no quadro e que Nox permanece clicável.
6. Preservar foto ESO, recortes, bloom e 146 estrelas; nenhuma iluminação dinâmica nova para esconder defeitos de arte.

Esses valores são condições de partida, não aprovação de pose. A captura e o hardware real decidirão.

## 5. Limites gráficos e QA

Alvo: pouco custo adicional sobre Eco+, sem efeitos novos. O modelo requer skinning de 63 ossos, ~8,2k tri, 1 draw do mesh principal e **0 texturas do modelo**. Conferir números reais no painel; o custo da malha não é inferível por tamanho do arquivo.

Validar em 1920×951, 1748×864 e viewport estreito; comparar `hands=fps` com `hands=off`. Conferir screenshots sem painel de diagnóstico e com Nox visível. `prefers-reduced-motion` deve desligar sway e microanimação; `hands=off` não deve baixar GLB. Confirmar transição ao Nox, e medir FPS médio de 4 s, p95 e frames >33 ms no PC com mesma qualidade/resolução. Os 60 FPS da v0.9.9 são **referência histórica**, não benchmark desta versão.

## 6. Regras permanentes

Seguir `PADRAO-PESQUISA-NOVAS-FUNCIONALIDADES.md` antes de novos recursos, com duas implementações existentes analisadas, licença e QA por captura. Não declarar a arte final aprovada por apenas passar CI. Branch preview e PR draft; **não alterar Worker/Cloudflare produção, main ou banco** sem autorização explícita.
