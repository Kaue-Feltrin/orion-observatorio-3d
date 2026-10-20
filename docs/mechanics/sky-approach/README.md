# Aproximação leve do fundo durante a viagem

Ajuste sobre `c2c6b95`, na branch `codex/maos-rig-mmv` / [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29). O usuário pediu aproximar um pouco a galáxia porque a sensação de avanço ainda estava fraca.

O fundo cresce uniformemente até **22%** durante o avanço, centrado na direção de chegada. A ampliação segue o deslocamento real da câmera, com a mesma curva suave, e começa apenas depois dos 700 ms de alinhamento. Não há contração antes da chegada. O panorama continua deslizando no giro e mantém sua perspectiva: a ampliação ocorre no espaço da tela, com a mesma proporção horizontal e vertical, sem voltar ao plano inclinado no mundo.

Repouso, movimento reduzido, mãos, nuvens próximas, seleção, tempos de viagem, destinos e transição entre páginas preservados. O zoom é um uniforme no shader existente; sem assets, superfícies, texturas, passagens ou dependências adicionais. `SKY_APPROACH_ZOOM=1.22` concentra a intensidade do efeito em `distant-sky.js`.

## Comparação

[Antes — fundo sem aproximação](../panoramic-flight/right.mp4) · [Depois — aproximação gradual](right.mp4)

[Repouso antes](../panoramic-flight/right-3-stars.webp) · [Repouso depois](right-3-stars.webp) · [Hover](right-hover.webp) · [Chegada](right-arrival.webp)

[Dados da gravação](recordings.json) · [Resultados da validação](validation.json)

Vídeo novo com Estrela III/1280×720/Eco+, página inteira via CDP, relógio/entradas reais e troca efetiva de documento, sem interceptação. Vídeo anterior reutilizado por link, sem duplicar binário. Evidência local Chromium/SwiftShader; não representa desempenho ou aceite visual no dispositivo do usuário.

O teste de pixels isola a galáxia: confirma que o giro não deforma a imagem com pan pausado, que liberar pan a desloca e que o novo zoom corresponde a um recorte central ampliado uniformemente. Esse congelamento existe somente no teste isolado. Os testes das três viagens reais verificam início sem zoom, crescimento monotônico limitado a 22% e ausência de ampliação durante o alinhamento, mantendo as verificações de profundidade das nuvens. As unidades também verificam a ausência do zoom adicional em reduced-motion.

Contexto cumulativo atualizado na raiz. Main/referência preservadas; criação de personagem e nova adaptação mobile não iniciadas. Próxima ação do usuário: comparar a aproximação do fundo escolhendo uma estrela lateral na nova prévia. Nenhuma instalação necessária.

**Check/build, duas suítes unitárias e sete casos distintos de navegador aprovados**, sem falhas ou retries. Comparação de pixels: diferença média 2,743/255 por canal para o recorte ampliado esperado, contra 17,690/255 da referência sem zoom. Giro com pan pausado: média 0,000226/255 e nenhum canal >2 níveis.
