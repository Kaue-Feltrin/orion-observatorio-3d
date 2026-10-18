# Apontamento com poses intermediárias e perspectiva

Este documento registra a primeira sequência (`95566fe`). A tentativa posterior de separar o indicador em `fingers/` foi rejeitada pelo usuário por quebrar a anatomia. [Revisão atual com a mão inteira, sem recortes ou crossfade](../continuous/README.md). As medidas abaixo pertencem à primeira sequência.

Base conferida: `c3dce97` na branch `codex/maos-rig-mmv`, PR #29. CI completo e Cloudflare da base aprovados. Usuário autorizou três poses intermediárias com pequena mudança de perspectiva, mantendo proporção e visual etéreo. Trabalho apenas na prévia.

## Referências consultadas antes da implementação

- [Three.js r180: exemplo oficial de morph animado](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_morphtargets_horse.html): animação de poses de geometria pelo tempo, `AnimationMixer`, clip e atualização no loop único. Demonstração funcional, não sistema de produção. Reutilizar os morph targets nativos com o rig existente, sem importar o modelo do exemplo. Three.js MIT já instalado.
- [PixiJS 8.6.6: AnimatedSprite oficial](https://github.com/pixijs/pixijs/blob/v8.6.6/src/scene/sprite-animated/AnimatedSprite.ts): lista de texturas, durações e seleção de quadro pelo tempo; reprodução reversa. Implementação de biblioteca em uso, não apenas tutorial. Adaptar a sequência de quadros ao progresso do hover e misturar somente os dois vizinhos. Não adicionar PixiJS ou outro loop/renderizador; referência MIT, sem copiar assets.

Escolha: cinco poses direitas (neutra existente, três intermediárias novas, final com perspectiva) e o rig Three.js atual. Quadros desenham o giro/oclusão; morph de profundidade dá pequeno avanço da ponta para dentro da cena. O progresso vem exclusivamente do hover real do Nox; saída e reversão percorrem a mesma sequência para trás. O rig anterior permanece disponível para comparação.

## Plano e orçamento

1. Gerar as três artes intermediárias e a pose final coerente com perspectiva a partir das imagens aprovadas, com alpha verdadeiro e registro de palma/punho.
2. Integrar em `handsMotion=perspective`, preservando o modo `rig` anterior e o modo padrão. Mesmos enquadramento, máscara inferior, câmera e loop; só dois quadros vizinhos visíveis por vez.
3. Exigir pesos normalizados, retorno/reversão, centro protegido em 1920×1080/1920×951/390×844, profundidade real na malha, reduced-motion estático, off sem cargas e descarte completo.
4. Medir contagens reais do renderer, dimensões/bytes dos novos arquivos e buffers de geometria. Não tratar browser headless como medição de FPS/RAM no computador do usuário.
5. Registrar vídeo e capturas de neutro/intermediários/final/retorno para avaliação visual. Sem merge ou alteração da main.

## Procedência das imagens

Imagens novas geradas nesta tarefa com a ferramenta de geração/edição de imagens, usando as duas imagens do próprio projeto como referência. Nenhum asset de jogo, modelo de terceiros ou biblioteca de animação adicional incorporado. Não atribuir uma licença de terceiros a material gerado; manter a procedência aqui e a licença geral do repositório.

## Implementação e preservação

Ativar com `?quality=eco-plus&hands=mesh&handsMotion=perspective`. Para comparar com o rig anterior, usar `handsMotion=rig`. Sem esse parâmetro, a apresentação padrão permanece a mesma. Não há controle técnico novo na interface do site.

As cinco poses compartilham o enquadramento aprovado da direita. A esquerda continua com o mesmo asset e movimentos. O progresso da mola do hover seleciona dois vizinhos; cada imagem deforma seu contorno do indicador para o estágio comum antes da mistura. As correspondências são monotônicas/reversíveis e medidas nas bordas alpha das imagens. Um terceiro morph move a região superior até 0,14 unidade para longe da câmera, mantendo a saída inferior e a borda central ancoradas. O punho fica próximo à borda e a ponta recua na profundidade; as artes desenham o giro e as oclusões que uma imagem plana não consegue inventar.

É uma animação 2,5D com ângulos preparados, não uma mão 3D completa. Existe mistura de textura entre vizinhos para preservar detalhes, além do movimento efetivo da geometria. Fora do hover retorna pela mesma sequência; reduced-motion troca diretamente entre extremos sem ossos/morph animados. Off não carrega os novos assets. Geometrias, materiais, imagens e skeletons são descartados uma única vez.

## Evidências

- [Cinco artes da sequência fora da cena](poses.webp).
- Cena completa 1920×1080: [neutra](1920x1080-neutral.webp), [apontando](1920x1080-pointing.webp), [retorno](1920x1080-returned.webp).
- Outras janelas: [1920×951](1920x951-pointing.webp), [390×844](390x844-pointing.webp).
- [Vídeo do hover, retorno e interrupção](perspective.mp4), 32,9 segundos, gravado no canvas WebGL Eco+. O HUD e a vinheta CSS não são capturados pelo stream; as imagens completas acima mostram a composição final. O vídeo demonstra poses, não mede FPS no equipamento do usuário.
- [Procedência/dimensões/alpha/tamanho dos assets](assets.json) e [diagnóstico medido no navegador](metrics.json).

## Validação

Check, build e quatro suítes unitárias aprovados:

```sh
npm run check
node tests/hands-mesh.unit.mjs
node tests/hands-hover.unit.mjs
node tests/hands-image-rig.unit.mjs
node tests/hands-perspective.unit.mjs
NODE_USE_ENV_PROXY=1 npm run build
```

Chromium/SwiftShader sobre o build de produção: **12/12 testes de navegador aprovados, sem retries, em 3,4 minutos**. Incluem as nove regressões de mãos padrão/rig anterior e três casos novos de perspectiva: todos os intermediários no hover real, profundidade ponta/punho, shader sem erro, enquadramento/landmarks em três viewports, retorno e viagem, movimento reduzido, off e alternativa anterior. O teste de recursos foi ampliado após essa passagem para comparar os dois modos na mesma janela; **1/1 repetição aprovada, sem retries, em 20,3 segundos**, com A/B no mesmo viewport: rig 29 → perspectiva 38 texturas.

```sh
XDG_CONFIG_HOME=/workspace/.cache/orion/chromium-config CI=1 npm run test:browser -- \
  tests/hands-perspective.spec.js tests/hands-image-rig.spec.js tests/hands-mesh.spec.js \
  --config /workspace/.cloud-setup/orion/playwright.config.mjs --workers=1 --retries=0
```

A configuração externa apenas seleciona o Chromium do ambiente e os diretórios de evidências; o CI usa a configuração normal do repositório. A suíte unitária nova também foi acrescentada ao workflow.

## Recursos observados e limites

- Quatro novos WebPs com alpha, 896×1120, qualidade 92/alpha 100: **311174 bytes** no total. A mão neutra e os assets anteriores não foram editados. A resolução foi reduzida na exportação mantendo proporção e alpha, sem esticar a anatomia.
- Renderer após percorrer as poses: **38 texturas** no modo novo, contra 29 observadas no rig anterior e 24 no modo padrão Eco+. O novo modo usa seis imagens (esquerda + cinco direitas), seis skeletons e cinco texturas de dados de morph. Contagem de texturas não equivale a VRAM ou FPS.
- Seis representações/54 controles de ossos alocados; somente esquerda + uma direita em repouso. No máximo dois quadros direitos durante a passagem, portanto duas superfícies estáveis/três na transição, 3552 triângulos estáveis.
- Arrays base de geometria: **502176 bytes**; posições dos morphs: **193140 bytes**; dados de textura dos ossos observados: **6144 bytes**. Esses valores não incluem todo o custo do driver/GPU e não são RAM total do aplicativo.
- Chunk principal do build: aproximadamente **691,63 kB**. Nenhuma dependência nova. Nenhum loop, câmera ou renderizador extra.
- Aceite da naturalidade/perspectiva e FPS/p95/RAM no computador do usuário continuam pendentes. Não promover a padrão nem mesclar main sem autorização.

Os três intermediários também foram capturados no canvas durante o hover real: [1](intermediate-1.webp), [2](intermediate-2.webp), [3](intermediate-3.webp). A amostra da gravação observou cada quadro com peso máximo acima de 98%, máximo de três superfícies e profundidade de 0,1399995; [resumo da sequência](sequence.json). Esses números verificam participação/estado da animação, não FPS real.

Estado da entrega: validações locais concluídas. Commit, PR e URL da prévia registrados na entrega e no contexto completo. CI remoto do novo commit deve ser conferido após o push.
