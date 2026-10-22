# Galáxia panorâmica com atmosfera em profundidade

Correção sobre `64b196b`, em `codex/maos-rig-mmv` / [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29). O usuário esclareceu que o problema era a perspectiva de parede da fotografia ao olhar para as estrelas laterais e autorizou corrigir preservando a sensação de avanço.

Durante a viagem, a fotografia ESO recebe projeção panorâmica local: conserva a projeção da partida e desliza uniformemente conforme o ângulo do olhar. Translação da câmera e variação de FOV não inclinam, aproximam ou comprimem a fotografia. A troca de projeção preserva a vista inicial e reutiliza malha/material/textura existentes. O recorte original não é uma fotografia 360°: fora dele há céu escuro com transição suave, sem repetir pixels das bordas ou inventar outro panorama. O repouso e a imagem original não mudaram.

A alternativa de céu distante de `6915ce5` já evitava a parede, mas eliminava os recortes distantes antes do giro, reduzindo a sensação de avanço. Nesta revisão, **todos os recortes de nuvem habilitados pelo perfil continuam em profundidade**:

- Centros e escalas permanecem fixos no mundo; seu crescimento na tela vem da aproximação real.
- Nuvens transparentes acompanham suavemente a orientação do olhar durante o alinhamento, evitando aparência de placas inclinadas.
- Presença cresce gradualmente até 2,4× durante o avanço, sem saltar na partida e sem mudar o repouso. Reduced-motion mantém o ganho original.
- Dissipação usa a distância na direção da visão, entre 55 e 6 unidades antes da câmera, mantendo nuvens próximas visíveis por mais tempo e evitando atravessar uma superfície cheia.
- Mesmos recortes, texturas, camadas, perfis e 540 rastros; não foram acrescentados assets, dependências ou superfícies. Amostras das duas gravações mantêm 28 texturas; draw calls instantâneos não são um benchmark, pois o bloom alterna passes.

Curva suave, duração, saída das outras estrelas antes do giro, seleção, mãos, uma a três estrelas/identidades, retorno e véu entre páginas preservados. Sem criação de personagem ou nova adaptação mobile.

## Comparação visual

[Antes — plano no mundo, 64b196b](../restored-motion/after.mp4) · [Experimento anterior — céu com recortes dissipados](../distant-sky/after.mp4)

[Depois — estrela direita/III](right.mp4) · [Depois — estrela esquerda/II](left.mp4)

[Repouso](right-3-stars.webp) · [Hover direita](right-hover.webp) · [Chegada III](right-arrival.webp) · [Hover esquerda](left-hover.webp) · [Chegada II](left-arrival.webp)

[Dados das gravações](recordings.json) · [Validação por caso](validation.json)

Vídeos reais em 1280×720/Eco+, página inteira via CDP, entradas e relógio reais, com troca efetiva de documento e sem interceptação. Sem erros JS/shader. Os vídeos anteriores são reutilizados por link, sem duplicar binários. Evidência local Chromium/SwiftShader; não representa desempenho ou aceite visual no equipamento do usuário.

## Regressões verificadas

O teste WebGL isolado pausa apenas o pan, gira/translada a câmera e altera seu FOV. Os pixels da galáxia permanecem iguais dentro da tolerância; liberar o pan confirma deslocamento efetivo. Esse congelamento existe apenas no teste isolado, não nos vídeos ou na navegação normal.

Três novos casos de navegador verificam a viagem real para cada destino: pelo menos uma nuvem visível cresce mais de 1,7× sem mudar seu centro/escala no mundo; sua orientação acompanha a câmera e ela desaparece ao ser ultrapassada. As unidades percorrem 30/60/120 Hz e múltiplos aspectos, preservando limites de curva/colinearidade, continuidade na partida, céu sem perspectiva de parede e presença das nuvens.

Contexto cumulativo atualizado na raiz. Main e branch de referência preservadas. Próxima ação do usuário: escolher as duas estrelas laterais na nova prévia e comparar a perspectiva do fundo e a sensação de avanço; nenhuma instalação necessária.

**Check/build, quatro suítes unitárias e 25 casos distintos de navegador aprovados**, sem falhas ou retries: quatro de renderização/profundidade, 20 de navegação/seleção e um smoke com configuração padrão. No teste isolado, diferença média com pan pausado: 0,000228/255 por canal, nenhum canal >2 níveis; com pan liberado: 31,938/255. As métricas completas estão no JSON de validação.

Capturas comparáveis do repouso: [antes](../restored-motion/after-3-stars.webp) e [depois](right-3-stars.webp); hover da Estrela III: [antes](../restored-motion/after-hover.webp) e [depois](right-hover.webp). Mesmos viewport/perfil, com respiração/hover em relógios reais não sincronizados.
