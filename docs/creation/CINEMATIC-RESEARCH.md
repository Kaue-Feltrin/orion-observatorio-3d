# Revisão cinematográfica — camadas e VFX

Escopo solicitado: refazer o capítulo do bebê e a revelação das duas figuras, mantendo a primeira página e sua viagem. Sem gesto das mãos ao acionar Tornar Marcado. Composição com imagens independentes e fundo próprio, visto de dentro da nebulosa.

## Problema reproduzido na revisão anterior

Correntes e campo eram grupos inteiros que se deslocavam por animação CSS. Isso simulava cartões saindo de cena, sem fissuras que se propagassem, fragmentos independentes, inércia ou dissipação. As figuras vetoriais simplificadas não sustentavam o acabamento pedido. A nova implementação parte dessas causas, não de um teste verde.

## Pesquisa consultada antes de codificar

Fontes: exemplos oficiais Three.js **r180**, mesma versão do projeto, lidos de seu repositório em 26/10/2026. São demonstrações técnicas funcionais, não comprovação de arte AAA ou produção comercial.

| Referência verificável | Técnica observada | Decisão para o Órion |
|---|---|---|
| [Tessellation modifier](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_modifier_tessellation.html) | Geometria não indexada, atributos por face, deslocamento de vértices no shader | Campo e corrente repartidos em células coerentes; cada célula conserva sua região da imagem e recebe impulso/rotação próprios. Não apenas mudar escala/opacidade de uma figura inteira. |
| [Instanced billboards](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_buffergeometry_instancing_billboards.html) | Muitos elementos visuais submetidos em poucas chamadas, dados específicos por instância | Quantidade limitada de faíscas em um único BufferGeometry; sem um elemento DOM por partícula nem um loop de animação adicional. |
| [Selective Unreal Bloom](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_postprocessing_unreal_bloom_selective.html) | Separação de superfícies luminosas e composição do brilho | Preservar pipeline do Observatório; fissuras brilham, figuras e correntes mantêm leitura. Não clarear indiscriminadamente a tela toda para esconder a transição. |
| [Skinning e morph](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_animation_skinning_morph.html) | Mixer de animação, pesos e transições em personagem com rig/modelo | Referência de continuidade e estados. **Não** alegar morph anatômico 3D a partir de PNGs: aqui a passagem usa dissolução luminosa e revelação das formas em 2,5D. |

Conceitos adaptados; nenhum modelo, personagem ou ativo dos exemplos foi incorporado. Código do motor mantém a licença MIT existente. Imagens novas foram geradas para este estudo e seus originais permanecem preservados; sprites e fundo são arquivos locais, não dependem de geração/CDN no navegador.

## Composição e linha de tempo propostas

- Fundo exclusivo: centro livre e filamentos de névoa próximos às bordas. Plano distante + recortes por UV da mesma textura em profundidades distintas; mesma câmera/paralaxe da primeira página, sem reutilizar sua fotografia como cenário da criação.
- Silhueta fetal, força e correntes: texturas alpha distintas; nitidez de contato e valores de brilho separados.
- 0–0,35 s: breve contenção de energia, tensão do selo; **sem** gesto de clique da mão no botão.
- 0,25–0,8 s: fissuras iluminadas se propagam; o contorno continua reconhecível antes da ruptura.
- 0,65–1,9 s: fragmentos liberados com direções e giros próprios; correntes perdem coesão, luz converte-se em resíduos que desaceleram.
- 1,2–2,8 s: a figura fetal se dissolve em luz, as duas figuras emergem por máscara e trajetórias suaves. Não arrastar dois retângulos de uma posição para outra.
- Depois: poucas partículas lentas nas bordas; formulário habilitado após a cena, com controles de toque/teclado e foco preservados.

## Orçamento e validação

Reutilizar renderer, câmera, mãos e RAF. Textura do céu compartilhada entre véus, atlas das duas figuras com recorte por UV. Objetivo: até 48 células por camada quebrável, um lote de partículas, sem simulação física ou download de GLB novo. Limites reais de chamadas/texturas, FPS/p95 e heap serão registrados no navegador; contadores não medem VRAM total.

Validar visualmente 1920×951 e 390×844/844×390: transparência real, ausência de retângulos escuros, alinhamento das áreas clicáveis, fundo distinto e paralaxe reversível, botão sem gesto, ruptura que não dependa de temporizador CSS, escolhas exclusivas/nome/seta, movimento reduzido e regressão do Observatório. Nenhum resultado local equivale à aprovação visual do usuário ou desempenho em GPU física.
