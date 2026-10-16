# Implementação v0.9.11 — Mãos de primeira pessoa etéreas (inspiradas na linguagem visual de Clove)

**Data:** 16/10/2026  
**Escopo:** executar e documentar as mudanças aprovadas na direção visual. Prévia isolada; `main` não pode ser alterada.  
**Referência funcional:** v0.9.10, PR #17. Referência de performance anterior: v0.9.9 Eco+ com 3 recortes, **60 FPS e p95 16,8 ms**, medida pelo usuário; esses números **não são garantia** para a v0.9.11.

## Direção de arte e direitos

Inspiração: enquadramento de mãos de primeira pessoa em jogos, incluindo VALORANT/Clove: mãos legíveis na periferia inferior e energia rosada/roxa com contraste escuro. O visual foi desenhado com **traçados originais**, sem copiar modelos, texturas, acessórios, ornamentos, marcas ou imagens do jogo. Não inserir material da Riot nos assets finais.

Referência de cor/efeitos: artigo oficial de desenvolvimento de Clove descreve rosa, roxo e uma estética de transformação entre vida/morte. Fonte: https://playvalorant.com/pt-br/news/game-updates/clove-a-morte-e-so-o-comeco/

A v0.9.11 ainda é **conceito 2,5D**, não um modelo anatômico completo. Se a aparência ainda parecer recorte plano, próximo passo seria produzir um asset autoral mais detalhado ou uma malha 3D low-poly sem alterar o Observatório.

## Checklist executado — mudanças por arquivo

### `orion-observatorio-upload-github-leve/first-person-hands.js`

- [x] **Trocar a textura placeholder**: redesenhar mão com dedos semi-curvados, palma definida, antebraço e início de manga, bordas arredondadas. Em Canvas 2D transparente 320×512; criar a textura **uma vez**, não a cada frame.
- [x] **Nova paleta**: roxo escuro, azul quase preto e reflexos magenta/lavanda. Brilho é **pintado na textura** (gradientes, linhas internas e sombra da criação), sem novos shaders, bloom, partículas ou render targets.
- [x] **Opacidade compartilhada**: alterar material de `0.67` para `0.78`; bordas já têm alpha parcial no PNG procedural e antebraço esmaece no limite inferior.
- [x] **Mão esquerda**: `z=-1.10`, `x=-0.70*halfWidth`, `y=-0.72*halfHeight`; altura `1.10*halfHeight`; inclinação `-0.20 rad`.
- [x] **Mão direita**: `z=-1.00`, `x=+0.68*halfWidth`, `y=-0.66*halfHeight`; altura `1.17*halfHeight`; inclinação `+0.18 rad`. A direita é um pouco mais próxima e visível.
- [x] **Rotação discreta** de pitch/yaw (`0.035–0.055 rad`, yaw `±0.025 rad`); renderizar só as mãos na periferia, com área central livre.
- [x] **Sway**: usar o movimento suavizado existente (7,5/s, estável contra FPS), até aproximadamente 2,9% da meia largura e 2,4% da meia altura; direita 100%, esquerda 86%, rotação de até `±0.020 rad`.
- [x] **Respiração**: seno lento de 0,81 rad/s, deslocamento vertical máximo de 0,6% de `halfHeight`; desativar em `prefers-reduced-motion`.
- [x] **Orçamento**: dois `Mesh` com uma `PlaneGeometry`, um `MeshBasicMaterial`, uma `CanvasTexture`. Custo projetado 2 superfícies e 1 textura, sem skeleton, glTF, luz adicional ou reflow.
- [x] **Reversibilidade**: `enabled=false` retorna sem criar textura nem meshes; `beginTravel()` oculta as duas superfícies.

### `orion-observatorio-upload-github-leve/main.js`

- [x] **Não alterar o código de cena** além da integração já concluída na v0.9.10: viewmodel filho de `camera`, atualização no tick, `beginTravel` e `resize`. A v0.9.11 muda o módulo de mãos, não a nebulosa.
- [x] **Não alterar** `Nox`, `heraldTarget`, Raycaster, bloom, foto ESO/S. Brunier, 146 estrelas e os três recortes do Eco+.
- [x] **Manter `hands=on/off`** (desligado por padrão em pointer coarse/mobile, salvo `hands=on` explícito).

### `orion-observatorio-upload-github-leve/performance-panel.js`

- [x] Mostrar título **v0.9.11** no diagnóstico.
- [x] Comparação `hands=on` vs `hands=off`; mesmo bloom, câmera, resolução e camadas fotográficas.
- [x] Exibir se as mãos estão visíveis e quantas superfícies estão desenhadas.
- [x] Nenhuma coleta de dados remota.

### `orion-observatorio-upload-github-leve/tests/observatorio.spec.js` e `tests/structure.mjs`

- [x] Verificar poses reais, opacidade, profundidades distintas, proporção/asimetria e material/textura compartilhados.
- [x] Preservar regressões existentes do Nox, passagem à ficha, redução de movimento e modo sem mãos.
- [x] Salvar screenshot Playwright como evidência visual (não prova FPS).
- [ ] Exigir CI verde antes de liberar como candidata; corrigir falhas sem alterar `main`.

## Como testar no navegador (A/B)

**Com mãos:** `https://preview-maos-eterias-v0911.orion-observatorio-3d.pages.dev/?quality=eco-plus&hands=on`

**Sem mãos:** `https://preview-maos-eterias-v0911.orion-observatorio-3d.pages.dev/?quality=eco-plus&hands=off`

**Com diagnóstico:** acrescentar `debug=1` nos parâmetros para copiar FPS, p95, quadros acima de 33ms, draw calls e texturas. Em 1920×951, deixar estabilizar 10–15 segundos, mover mouse de ponta a ponta e medir pelo menos duas vezes cada modo. RAM total da aba no Chrome pelo Shift+Esc.

**Teste visual obrigatório:** verificar se mãos têm pose reconhecível, não parecem "stop", não ficam como adesivos transparentes, não cobrem Nox/card, não competem com o bloom e parecem próximas da câmera; conferir em janela 1920×951, tela menor e reduced motion.

**Critério de aceite:** manter boa aparência e a cadência de quadro observada na v0.9.9 como referência; a v0.9.11 só pode ser aprovada após feedback do usuário no hardware real. Nenhum merge na produção sem pedido explícito.

## Limitações e plano posterior

Duas superfícies planas **não têm dedos volumétricos nem deformação natural por juntas**; refletem uma prova de composição/energia e a sensação de primeira pessoa. Se o usuário gostar da posição, mas reprovar a arte, manter os valores de ancoragem e trocar apenas o asset por mãos autorais pintadas ou modelo 3D leve. Se o usuário quiser idêntico ao viewmodel de Clove, não usar recursos extraídos de VALORANT: recriar linguagem visual própria, sem copiar elementos distintivos.
