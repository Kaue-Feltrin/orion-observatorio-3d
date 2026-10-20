# Aproximação do fundo: 22% → 32%

A pedido do usuário, `SKY_APPROACH_ZOOM` passou de `1.22` para `1.32`, sobre a revisão `055f3dc`, na mesma branch `codex/maos-rig-mmv` / [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29).

Única alteração da aplicação: intensidade máxima da aproximação. Ritmo, início após alinhamento, proporção da imagem, panorama lateral, repouso e reduced-motion preservados. Sem novos assets, dependências ou alterações em mãos, nuvens, destinos ou transição entre páginas.

[Antes — 22%](before-22.webp) · [Depois — 32%](after-32.webp) · [Validação](validation.json)

Capturas do teste de renderização com céu isolado, mesma pose/pan e dimensões. A imagem anterior é reproduzida com ganho de 22% no shader, e a nova usa o limite de 32%. Relógio pausado apenas nesta comparação técnica; os três testes de viagem usam navegação e relógio reais. Vídeo real da etapa anterior: [sky-approach/right.mp4](../sky-approach/right.mp4).

Contexto cumulativo atualizado. Main/referência preservadas. Próxima ação do usuário: escolher uma estrela na nova prévia e avaliar a intensidade; nenhuma instalação necessária.

Check/build, duas suítes unitárias e quatro testes de navegador aprovados, sem falhas ou retries.
