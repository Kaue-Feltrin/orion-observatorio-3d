# Correção da transição dos dedos recolhidos

Feedback: os fades da perspectiva não estavam bem alinhados, principalmente médio, anelar e mínimo. Base remota conferida `95566fe`, PR #29. Cloudflare aprovado; CI geral da base ainda em execução ao iniciar esta correção. Mesma branch, sem alterar main.

## Causa e escolha

As cinco artes diferem no desenho/oclusão dos dedos recolhidos. A correção de contorno anterior alinhava somente o indicador. Misturar o restante da mão continuava mostrando duas posições dos outros dedos, mesmo com shaders e testes funcionais aprovados.

A correção mantém palma, polegar e os três dedos recolhidos em **uma única camada**, com a imagem neutra existente e o rig/depth atuais. Essa camada tem opacidade constante durante o gesto e não recebe os morphs que trocam o contorno do indicador. Os cinco quadros agora são recortados no shader para mostrar somente o indicador; só esse recorte participa da mistura. Não foram editadas/regeradas imagens ou removidas as poses intermediárias. Mesmos enquadramento, transparência, hover/retorno, profundidade, câmera e loop.

Padrões consultados: [fragmento alpha oficial Three.js r180](https://github.com/mrdoob/three.js/blob/r180/src/renderers/shaders/ShaderChunk/alphamap_fragment.glsl.js), que multiplica o alpha do material por uma máscara, e [Sprite do PixiJS 8.6.6](https://github.com/pixijs/pixijs/blob/v8.6.6/src/scene/sprite/Sprite.ts), em conjunto com o AnimatedSprite já pesquisado: camadas independentes, uma imagem estável e animação do componente móvel. Implementação adaptada ao SkinnedMesh existente; sem PixiJS, novo renderer ou assets de terceiros.

O recorte é por UV com feather estreito, preservando a máscara inferior aprovada. A imagem corporal compartilhada continua flexionando pelo rig; ela não tenta reconstruir as oclusões diferentes das cinco artes. A perspectiva continua no indicador e no alcance Z da malha. Não é uma mão 3D completa.

## Verificações previstas

- Três dedos/polegar/palma fora das imagens misturadas; corpo com mesma textura e opacidade durante todo o hover.
- Ossos/depth ativos, indicador com todos os intermediários, retorno/reversão e centro protegido em desktop/celular.
- Reduced-motion estático, off sem cargas, descarte sem duplicar a textura compartilhada.
- Inspeção dos quadros em passagem e vídeo, além dos testes; CI verde sozinho não aprova fades/anatomia.
- Medir o custo da camada extra: uma superfície e um skeleton/morph adicionais, sem imagem nova. Registrar valores observados ao concluir.

## Evidências e resultado

- [Vídeo corrigido](fingers.mp4), 32 segundos, com hover/retorno/interrupção. É um stream do canvas Eco+, sem HUD/vinheta CSS; não mede FPS físico.
- Quadros reais do canvas: [neutro](frame-0.webp), [1](frame-1.webp), [2](frame-2.webp), [3](frame-3.webp), [final](frame-4.webp). Os três dedos recolhidos mantêm uma única silhueta; o indicador continua passando pelas artes intermediárias.
- Cena completa: [neutra](1920x1080-neutral.webp), [apontando](1920x1080-pointing.webp), [retorno](1920x1080-returned.webp), [1920×951](1920x951-pointing.webp), [390×844](390x844-pointing.webp).
- [Métricas de navegador](metrics.json) e [observações durante a gravação](sequence.json).
- [Vídeo anterior para comparação](https://github.com/Kaue-Feltrin/orion-observatorio-3d/blob/95566fe0844e7b2e10c72da87c29256542c9fb98/docs/rig-mmv/perspective/perspective.mp4).

Check/build e quatro suítes unitárias aprovados. **12/12 testes Playwright sobre produção aprovados, sem retries, em 4,0 minutos**. Cobertos: mesma textura/opacidade corporal durante o gesto, máscaras excluindo os três dedos/palma/polegar dos quadros misturados, todos os intermediários, profundidade, shader sem erros, enquadramento/landmarks em três viewports, hover/retorno/viagem, reduced/off, descarte deduplicado e modos anteriores.

A gravação observou 172 amostras: opacidade corporal mínima/máxima **0,46/0,46**, **uma identidade de textura** corporal e todos os quadros do indicador presentes. Não confundir esse registro de estado com FPS do equipamento do usuário.

## Recursos observados

A/B na mesma janela: rig anterior **29** texturas; perspectiva corrigida **40**, duas a mais que as 38 da primeira perspectiva. As duas novas são dados do skeleton/morph corporal; a textura neutra é compartilhada. Nenhuma imagem/dependência nova.

São sete representações/63 controles alocados. A correção custa uma superfície extra: **três estáveis/quatro na passagem** (5568 triângulos estáveis, 7584 durante dois quadros do indicador). Arrays base de geometria **591528 bytes**, morphs **231768 bytes**, dados de textura dos ossos **7168 bytes**; não são VRAM/RAM totais. Chunk principal ~693,48 kB. FPS/p95/RAM no dispositivo real não medidos.

Modo de uso permanece `?quality=eco-plus&hands=mesh&handsMotion=perspective`. A versão sem perspectiva continua em `handsMotion=rig`. Aceite visual da correção ainda depende do usuário; não promover ou mesclar main automaticamente. CI remoto do novo commit a conferir após push.
