# Estudo de implementação — mãos em primeira pessoa no Observatório 3D

**Projeto Órion · v0.9.10 · 16 de outubro de 2026**  
**Status:** pesquisa técnica + protótipo reversível na prévia, **não** aprovado para produção.  
**Base:** Observatório v0.9.9 Eco+ com bloom, 3 recortes ESO, Nox selecionável e viagem preservados.  
**Motivação:** o usuário aprovou a maior resposta da paralaxe, pediu mais percepção de primeiro plano e aceitou testar mãos como recurso de imersão. A v0.9.9 marcou **60 FPS, p95 16,8 ms e 0% acima de 33ms** em uma amostra no seu PC a 1920×951. Isso é referência da v0.9.9, não medida da v0.9.10.

## 1. O problema visual

A fotografia panorâmica ESO e os recortes em Z oferecem profundidade do **ambiente**. Contudo, o observador permanece uma câmera abstrata: nada indica a presença de um corpo na cena. Mãos em primeira pessoa introduzem um **referencial visual de escala próximo do observador**. Portanto, elas não substituem as nuvens nem o véu frontal de Z=-75; complementam o volume e ajudam o visitante a sentir que está ali.

O Observatório não é um jogo FPS de tiro. Mãos de arma, luvas militares realistas, braços atravessando Nox e movimentação excessiva prejudicariam a proposta cinematográfica. O conceito adotado é **mãos etéreas em repouso**, com formas sugeridas, não um personagem específico. A arte final permanece **indefinida** e requer aprovação visual; o protótipo usa silhuetas temporárias.

## 2. Alternativas técnicas estudadas

| Método | Custo típico | O que prova / riscos | Decisão |
|---|---|---|---|
| Imagem/CSS fixa sobre o canvas | Potencialmente leve, mas movimentação desacoplada da câmera e possível custo de composição CSS | Fácil protótipo estático; aparência de HUD colado | Não escolhido |
| **2 planos transparentes ligados à câmera, com 1 textura compartilhada** | ~2 draw calls, 1 textura leve, sem rigs, luzes ou sombra | Boa referência corporal; silhueta é **2,5D**, não mão volumétrica real | **Protótipo v0.9.10** |
| Modelo low-poly 3D separado por mão | Mais geometria/materiais; maior controle de perspectiva e oclusão | Pode parecer artificial sem bom modelo/pose; precisa medir GPU | Futuro, após aceitação |
| glTF com `SkinnedMesh`, ossos e animação | Mais assets, carga/VRAM e gestão de animação | Ideal para mãos realistas expressivas; prematuro antes da direção de arte | Não implementar agora |

A documentação Three.js demonstra o uso de objetos presos à câmera e medição de draws/texturas pelo `renderer.info`, que **não equivale a RAM/VRAM**. Para malhas de animação esquelética, `SkinnedMesh` usa atributos de skinning e costuma ser importado por carregadores de modelo; seria complexidade sem benefício no primeiro teste. O padrão de viewmodel na primeira pessoa (braços/itens locais à câmera) também é documentado por motores de jogo.

Fontes:
- Three.js — WebGLRenderer (lifecycle de renderização, múltiplos passes, contadores): https://threejs.org/docs/pages/WebGLRenderer
- Three.js — SkinnedMesh: https://threejs.org/docs/pages/SkinnedMesh.html
- Guia de viewmodel em câmera de primeira pessoa (s&box, julho/2026): https://sboxguide.dev/guides/first-person-viewmodel
- MDN — prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion

## 3. Composição e narrativa

- **Posição:** duas mãos nas bordas inferiores, ocupando somente a periferia visual. Nenhuma no eixo da estrela Nox, especialmente na área central superior e nas regiões de interação.
- **Forma provisória:** silhuetas de mãos abertas com antebraços, ligeiramente translúcidas, azul-marinho/desaturado; mínimos reflexos frios. Evitar luz intensa, partículas e superposição de brilho.
- **Movimento:** prender ambas à câmera, com *sway* independente pequeno e respiração lenta (sem tremor, sem movimento forte de idle). A câmera pode mirar livremente: mãos continuam perto do corpo, e a nebulosa se desloca com a paralaxe própria. `prefers-reduced-motion` remove sway e respiração, mas conserva o referencial estático.
- **Foco:** o viewmodel deve ser visível só no repouso, sumindo na viagem antes do zoom/clarão, para não parecer um objeto atravessando a estrela. A seleção/raycast de Nox deve continuar funcional.
- **Tela:** acompanhar a razão de aspecto e o FOV; manter-se dentro das bordas inferiores em 1920×951 e dimensões responsivas. Em ponteiro `coarse`/mobile, mãos ficam **desligadas por padrão**, com opt-in explícito.
- **Acessibilidade:** Canvas é `aria-hidden`, sem criar nova interface clicável. Preferências de movimento reduzido são respeitadas. Controles de depuração são acessíveis por link, sem ativá-los em produção.

## 4. Implementação concreta no protótipo

Arquivo: `orion-observatorio-upload-github-leve/first-person-hands.js`.

1. No carregamento, desenhar **uma** textura RGBA (Canvas 320×512, traços e gradientes locais). Desenho à mão, **placeholder**, não uma captura/arte de pessoa real.
2. Criar **uma** `PlaneGeometry` e **um** `MeshBasicMaterial` compartilhados pelos dois planos, com espelhamento da mão direita.
3. Ambos são filhos da câmera, na layer 0 e `renderOrder` dedicado; sem depth test/depth write, evitando clipping indevido contra massas ESO, sem bloom layer 1.
4. No tick já existente: apenas deslocar e rotacionar levemente objetos, sem criar geometrias, texturas ou DOM a cada frame. Valor alvo suavizado com constante exponencial independente e baixa amplitude, com delta limitado.
5. `beginTravel()` desativa os meshes. `resize()` recalcula ancoragem usando `camera.fov` e `camera.aspect`.
6. `?debug=1&quality=eco-plus` mostra mãos; `?debug=1&quality=eco-plus&hands=off` restaura a aparência da v0.9.9. `?hands=on` permite opt-in em dispositivos móveis. Se `enabled=false`, **zero texturas/meshes de mãos são alocados**.
7. O painel informa visibilidade e número de superfícies. Nenhum dado é enviado para serviços externos.

### Orçamento gráfico e condições de aceite

A v0.9.9 marcou ~26 draw calls e 21 texturas GPU na janela reportada pelo usuário. **Objetivo estimado** de v0.9.10 com mãos: até ~2 draw calls e ~1 textura adicional; contadores podem variar por passagem de bloom ou navegador. **Não declarar 60 FPS como fato até o usuário medir no PC real.**

Critérios:
- As silhuetas devem ser reconhecíveis como mãos sem parecer armas/luvas sem contexto; se parecerem recortes de papel, rejeitar a estética e refazer os assets em outra etapa.
- A estrela permanece desobstruída, clicável por mouse e teclado.
- O véu frontal e a foto ESO não são recoloridos, desfocados ou reexportados.
- A viagem não mostra mãos flutuando durante a aceleração.
- Comparar duas medições próximas de **FPS, p95 e frames >33ms**, com e sem mãos, em janela/qualidade iguais, e medir RAM total separadamente pelo Chrome `Shift+Esc`.
- Sem perda perceptível de fluidez em comparação com o mesmo hardware e cena sem mãos; se houver regressão, deixar mãos opt-in ou voltar ao design sem mãos.

## 5. O que ainda precisa de decisão de arte

**Depois de testar o protótipo**, escolher a identidade das mãos: aparência etérea/desmaterializada ou corporal, cor principal (neutra escura vs pele/luva), proporção, pose, presença da manga e relação narrativa com o Observatório. Não impor material, tatuagem, classe, idade ou personagem ao usuário. Caso precise de arte final, produzir ou obter **assets de mãos próprios/permitidos**, com pose aprovada. Não confundir a silhueta temporária com um modelo definitivo.

Se a presença em primeira pessoa agradar mas o visual atual não, o caminho técnico é manter o mesmo viewmodel e **substituir somente o asset**, evitando refazer câmera, universo, Nox ou lógica da viagem. Um glTF leve pode ser carregado depois, com LOD/mobile e versão reduzida.

## 6. Riscos e mitigação

**Aparência 2D/adesivo:** formas geométricas de uma textura não têm volume ósseo real. Mitigar com tamanho discreto e testa A/B; não vender como mãos 3D realistas.

**Oclusão/legibilidade:** restringir as mãos às bordas inferiores e impedir qualquer cobertura de Nox/card/CTA. Verificar screenshots em resolução larga e estreita.

**Movimento excessivo:** evitar bob de caminhada sem deslocamento real do corpo; limitar posição/rotação, desligar com `prefers-reduced-motion`.

**GPU com bloom:** renderizar mãos somente no render principal, fora do composer de bloom; medir diferença em hardware real com toggle.

**Travessia da câmera:** ocultar na transição já existente, antes de `scene.attach(camera)` produzir qualquer quadro de viagem.

## 7. Próximos passos

1. CI de estrutura + Playwright: presença, A/B desligado, reduced motion, Nox, navegação, 3 recortes ESO e perf.
2. Visualizar a captura headless e verificar que mãos não cobrem o Nox. A captura é evidência de composição, **não de FPS**.
3. Pedir ao usuário avaliação real com **mãos ligadas vs desligadas**. Só após aprovar o conceito, decidir arte final e modelagem.
4. Nenhum merge em `main`/produção sem autorização explícita.
