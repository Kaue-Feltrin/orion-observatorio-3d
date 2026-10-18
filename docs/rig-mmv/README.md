# Protótipo MMV das mãos

Nova avaliação autorizada: [três poses intermediárias e apontamento com perspectiva](perspective/README.md), ativada por `handsMotion=perspective`. O rig descrito abaixo continua disponível para comparação.

Base: `8811a40`, acabamento e proporção da v0.9.21. O CI completo e o deploy dessa base foram confirmados como aprovados antes de iniciar esta etapa. Trabalho isolado em `codex/maos-rig-mmv`.

Objetivo: dar movimento perceptível às imagens aprovadas, com articulação de punho, palma e dedos, preservando enquadramento, translucidez, saída inferior e apontamento somente no hover do Nox. Protótipo opt-in por `?hands=mesh&handsMotion=rig`; a apresentação aprovada continua disponível sem esse parâmetro.

## Comparação antes da implementação

1. [Three.js r180 — SkinnedMesh, exemplo oficial](https://github.com/mrdoob/three.js/blob/r180/docs/api/en/objects/SkinnedMesh.html): geometria com `skinIndex`/`skinWeight`, `Bone`, `Skeleton` e `bind`. O mesmo mecanismo funciona em uma malha plana texturizada. Vantagem: renderizador e dependência já presentes, ossos interpolados na GPU, nenhum arquivo de modelo novo. Limite: exige pesos e pivôs coerentes com a imagem e não inventa partes ocultas dos dedos. Licença MIT da dependência já instalada.
2. [Spine 4.2 — exemplo oficial WebGL](https://github.com/EsotericSoftware/spine-runtimes/blob/4.2/spine-ts/spine-webgl/example/index.html): animação de imagem com esqueleto, attachments e estado de animação. Confirma o padrão de articulação 2D por pesos. Vantagem: ferramentas de autoria maduras. Custo para este projeto: runtime/exportação e [licenciamento específico](https://github.com/EsotericSoftware/spine-runtimes/blob/4.2/LICENSE). Consultado como referência arquitetural; nenhum código, runtime ou asset do Spine será incorporado.

Escolha: rig nativo Three.js sobre os sprites existentes, com pivôs próprios para esquerda, direita neutra e direita apontando. Movimentos de repouso e articulação do indicador no hover, com troca das imagens existentes concentrada no meio do gesto. Sem nova animação 3D de grande amplitude ou redesenho de assets.

## Implementação e orçamento

- Mesma câmera e loop, materiais básicos, duas superfícies estáveis e três durante o blend.
- Nove controles por pose: punho, palma, dois para indicador, dois para polegar, um para cada outro dedo. Pesos calculados apenas na construção; quatro influências por vértice.
- Sem aumento de resolução, textura de imagem ou subdivisões. Medir separadamente o custo das texturas de ossos e a contagem de geometria no renderer; não equiparar contagens a FPS no hardware do usuário.
- Reduced-motion deixa todos os controles na pose de repouso. `hands=off` não deve carregar imagens nem criar rigs. Descartar geometrias, materiais e skeletons ao encerrar.
- Testes: pesos normalizados, articulação real dos vértices, deslocamento e inversão de triângulos limitados, congelamento de reduced-motion, descarte, enquadramento projetado e Nox/hover/viagem.
- Capturas A/B e sequência temporal em 1920×1080, além de 1920×951 e janela estreita. Medir landmarks de punho/palma/dedos projetados na câmera. Aceite visual e medição no computador do usuário continuam necessários.

O protótipo implementa três `SkinnedMesh`: esquerda, direita apontando e direita neutra. As duas poses direitas mantêm punho/palma alinhados, mas possuem pesos e pivôs próprios para o indicador. Os buffers de vértices e de morph permanecem estáticos; a GPU aplica o morph e os ossos. O Raycaster continua sendo o único gatilho do apontamento. Seu progresso controla um morph do contorno do indicador na GPU, combinado aos ossos de repouso. A mão neutra começa a estender o dedo enquanto sua opacidade permanece constante; a mão apontando termina de estender após a troca de textura. Correspondências entre as bordas das imagens aproximam suas silhuetas antes do blend, reduzindo o contorno duplo. Uma mola criticamente amortecida permite inverter o gesto sem saltar a pose. O modo antigo mantém o fade anterior.

No modo padrão, o código anterior de deformação continua em uso. `hands=off` retorna antes de carregar imagens ou alocar skeletons. Reduced-motion mantém todos os ângulos exatamente em zero, com a mesma resposta acessível do Nox.

Os diagnósticos completos de vértices são calculados somente quando solicitados pela depuração/testes. O update normal altera os controles e dois coeficientes de morph, sem percorrer os vértices na CPU. Os buffers dos morphs são calculados apenas ao construir os rigs.

## Capturas e uso

Abrir a prévia deste PR com `?quality=eco-plus&hands=mesh&handsMotion=rig`. Remover `handsMotion=rig` permite comparar com a apresentação aprovada. Adicionar `debug=1` expõe `window.__orionHandsDebug.rigs` para diagnóstico; os controles técnicos não foram acrescentados à interface do site.

| Repouso A | Repouso B | Hover do Nox | Retorno |
| --- | --- | --- | --- |
| [Imagem](1920x1080-idle-a.webp) | [Imagem](1920x1080-idle-b.webp) | [Imagem](1920x1080-hover.webp) | [Imagem](1920x1080-returned.webp) |

O enquadramento e a máscara inferior aprovados estão preservados. Os arquivos WebP da documentação têm qualidade 82 e resolução 1920×1080; PNGs originais e vídeo do canvas ficam nos artefatos da tarefa.

[Vídeo do rig: repouso → hover → retorno](rig-mmv.mp4), 20,5 segundos. [Frame intermediário do gesto](canvas-transition.webp), na resolução nativa do canvas 1091×613. É uma gravação do canvas WebGL na resolução nativa do perfil Eco+, sem o HUD e a vinheta CSS sobrepostos pelo navegador; as capturas acima mostram a composição completa. O vídeo demonstra os movimentos, não mede FPS do dispositivo do usuário.

## Verificações

```sh
cd orion-observatorio-upload-github-leve
npm run check
node tests/hands-image-rig.unit.mjs
node tests/hands-hover.unit.mjs
node tests/hands-mesh.unit.mjs
NODE_USE_ENV_PROXY=1 npm run build
```

O workflow do repositório passa a executar a suíte unitária do rig. O ambiente de nuvem usa Node 24 com o proxy configurado para o fetch da ESO; não se alterou o requisito Node ≥20 do projeto.

A suíte unitária verifica pesos normalizados, limites e índices válidos, movimento real de palma e dos cinco dedos, buffers de vértices estáticos, deslocamento de repouso abaixo de 3,5% da imagem em 24 amostras de tempo por pose. O gesto percorre 21 posições em cinco instantes por pose direita, com deslocamento abaixo de 18%, área de triângulos positiva e limitada entre 0,25 e 2,7 vezes a original. A unidade também prova articulação antes do fade, retorno à posição, reversão e equivalência em 30/60 Hz. Também verifica reduced-motion, integração com a câmera, blend, viagem, off e descarte de skeletons/geometrias.

Os testes de navegador usam Chromium/SwiftShader sobre `dist/`, um worker e sem retries:

```sh
XDG_CONFIG_HOME=/workspace/.cache/orion/chromium-config CI=1 npm run test:browser -- \
  tests/hands-image-rig.spec.js tests/hands-mesh.spec.js \
  --config /workspace/.cloud-setup/orion/playwright.config.mjs --workers=1 --retries=0
```

A configuração externa apenas seleciona o Chromium instalado e os diretórios de relatórios. O runner inicia `npm run preview`. Verificações: shader sem erro, vértices efetivamente articulados, landmarks projetados, centro protegido, 1920×1080/1920×951/390×844, hover/retorno/viagem, reduced-motion, opt-in e off. As seis regressões de mãos aprovadas são executadas junto aos três testes do protótipo.

Resultado da revisão: check/build e três suítes unitárias aprovados; **9/9 testes de navegador aprovados, sem retries, em 2,3 minutos**, após adicionar o morph. Depois de refinar as correspondências das bordas, os **3/3 casos do rig foram repetidos e passaram**, com build e gravação novos. As seis regressões do modo anterior já haviam passado e não dependem dessas correspondências. CI remoto do novo commit a conferir após o push.

Uma primeira execução identificou apenas uma tolerância numérica excessiva no teste de imagem parada: pesos Float32 transformados pela matriz mundial produziram erro de aproximadamente `1,05e-6` unidades da imagem. O teste continua exigindo ângulos exatamente zero e ausência de movimento; a tolerância espacial foi definida em `1e-5`, abaixo de um pixel. Nenhum controle de animação foi desabilitado para fazer o teste passar.

## Medidas observadas e limites

- Renderer na revisão: 24 texturas no modo anterior, 29 no rig após carregar as duas poses. Cinco adicionais de dados: três de ossos e duas de morph. Nenhuma imagem adicional.
- Cada skeleton alocou uma textura de 1024 bytes de dados; total 3072 bytes. Isso mede o buffer de dados, não o consumo total do driver/GPU.
- Os arrays base de geometria do rig somam 234120 bytes: esquerda 55416, apontamento 89352, neutra 89352. A direita neutra precisa de geometria/pesos próprios. Os dois morphs somam mais 25752 bytes de arrays de posições; total de arrays 259872 bytes. Não se aumentaram as subdivisões nem a resolução das imagens.
- Superfícies: duas estáveis, três no blend, mantendo 3552 triângulos estáveis. 27 controles totais nas três representações, sendo 21 controles de dedos; somente duas representações ficam visíveis em repouso.
- Build: chunk principal de aproximadamente 688,45 kB, contra 683,49 kB da base; o aviso acima de 500 kB já existia. Nenhuma dependência ou asset de imagem foi adicionado.
- FPS/p95/RAM no computador do usuário ainda precisam ser avaliados. O rig não recria partes ocultas da imagem nem serve para fechar completamente a mão ou girá-la em 3D.

[Dados observados](metrics.json), incluindo os landmarks da última amostra em 390×844 e contagens da comparação A/B.

Para revisão, observar naturalidade de punho/dedos, centro livre, a mudança de gesto somente no Nox e a suavidade no dispositivo real. Não promover o protótipo para padrão nem fazer merge na main sem aprovação explícita.

## Revisão: movimento visível e apontamento articulado

Feedback do usuário: o rig inicial funcionou, mas o movimento quase não aparecia e o apontamento era apenas fade. Esta revisão aumenta as amplitudes angulares de repouso de dedos/palma em 3× e punho em 4×, com ciclos um pouco mais rápidos. Não aumenta as dimensões nem a opacidade das mãos.

O hover passa a estender de fato a malha do indicador, com correspondências de contorno entre as poses neutra e apontando. Foi consultado também o [exemplo oficial Three.js r180 de morph targets](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_morphtargets.html), usando `morphAttributes.position` e `morphTargetInfluences` nativos, combináveis com o SkinnedMesh existente. A mistura de textura ocorre apenas entre 25% e 75% do gesto; fora disso, uma única imagem continua se deformando pela malha animada. Portanto ainda existe mistura de textura para preservar os dois desenhos, mas ela já não é a única animação. O remapeamento vertical por coluna é monotônico e preserva a orientação dos triângulos. Os ossos mantêm os movimentos de repouso; o morph cuida da grande mudança de forma do indicador. Não se tenta reconstruir partes ocultas ou uma mão 3D completa.

A suíte final amostra 21 progressos em cinco instantes por pose: exige nenhuma inversão, razão de área entre 0,25 e 2,7 e deslocamento abaixo de 0,18 da imagem, incluindo regiões transparentes. Esses números descrevem a malha, não estiramento percebido ou FPS. Manter a avaliação visual do usuário.

Comparação com a primeira versão: [vídeo anterior no commit 884bd5d](https://github.com/Kaue-Feltrin/orion-observatorio-3d/blob/884bd5d26df7560729582d05f602c269365616e9/docs/rig-mmv/rig-mmv.mp4). As quatro capturas e `metrics.json` desta pasta foram substituídos pelos resultados da revisão.

As correspondências finais do contorno foram medidas nas bordas alpha dos próprios WebPs (sem editar os assets), substituindo a primeira aproximação manual. A projeção dos vértices continua protegendo o centro.
