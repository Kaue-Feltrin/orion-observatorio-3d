# Movimento da galáxia restaurado

O usuário avaliou o céu distante de `6915ce5` e preferiu a sensação de avanço anterior. Esta revisão restaura `main.js` e `star-journey.js` exatamente como em `03e9f0c`, na mesma branch `codex/maos-rig-mmv` / [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29).

A fotografia e os recortes voltam a ocupar posições no ambiente 3D: a aproximação da câmera produz movimento e profundidade durante a viagem. A cobertura dos cantos da tela acompanha o percurso sem encolher. Isso recupera também a perspectiva do fundo da revisão anterior, uma escolha visual expressamente preferida pelo usuário após experimentar a alternativa distante.

Permanecem a curva suave da câmera, a saída das outras estrelas antes do giro, os destinos de uma a três estrelas, as mãos e a transição entre páginas. O módulo do céu distante, seus testes específicos e sua execução no CI foram removidos. As correções de sincronização dos testes de navegador permanecem: aguardar a primeira pintura e verificar fases da viagem sem impor FPS ao CI.

## Comparação

- [Antes: céu distante avaliado pelo usuário](../distant-sky/after.mp4)
- [Depois: movimento restaurado](after.mp4)
- [Referência original restaurada — 03e9f0c](../flight-continuity/after.mp4)
- [Repouso](after-3-stars.webp), [hover](after-hover.webp) e [chegada](after-arrival.webp)
- [Dados da gravação](recordings.json) e [validação](validation.json)

A nova gravação seleciona Estrela III em 1280×720/Eco+, com entradas e relógio reais, página inteira via CDP e troca efetiva de documento. Os vídeos anteriores são reutilizados por link, sem duplicação. Evidências locais com Chromium/SwiftShader; não representam uma medição de desempenho no dispositivo do usuário.

O contexto cumulativo foi atualizado. Main e branch de referência preservadas. Criação de personagem e nova adaptação mobile continuam para etapas futuras. A ação do usuário após a publicação é comparar a sensação de avanço escolhendo as duas estrelas laterais na prévia.

Check/build, três suítes unitárias e **21 casos de navegador aprovados**, sem falhas ou retries: 20 de navegação/seleção e um smoke do clique com configuração padrão. O conteúdo dos dois módulos de runtime restaurados foi comparado byte a byte com `03e9f0c`; hashes e resultados por caso constam no JSON de validação.
