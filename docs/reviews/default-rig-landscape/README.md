# Rig padrão no PC e navegação lateral em paisagem — 22/10/2026

O acesso comum no PC carregava o modo antigo `mesh`, com três texturas e transição de alpha entre duas poses direitas. O rig aprovado só aparecia com `handsMotion=perspective`. A seleção do site agora usa `perspective` por padrão no desktop e no toque: duas mãos articuladas, duas texturas, uma superfície contínua por mão e nenhuma mão neutra sobreposta. O hover aponta à estrela, a esquerda fecha um pouco e a saída retorna suavemente; limites anatômicos, transparência e artes aprovadas foram preservados. Os modos antigos continuam disponíveis explicitamente por `handsMotion=mesh` e `handsMotion=rig`; `hands=off` continua sem carregar mãos.

No celular deitado, as setas agora ocupam as extremidades laterais, no meio da altura, com área de toque de 44 px e margens para áreas seguras. O centro inferior conserva nome/posição e marcadores; o convite ao deslize e a instrução de toque foram reunidos em uma linha. A região da estrela fica livre dos botões. A camada de navegação ocupa a tela, mas somente os controles recebem eventos; não bloqueia tocar a estrela ou deslizar no fundo. Retrato, resumo, confirmação, destino e viagem permanecem iguais.

## Comparação e evidências

- Antes no PC: [hover antigo](../2026-10-22-desktop/default-hover.webp). Depois: [repouso](desktop-rest.webp), [hover](desktop-hover.webp), [retorno](desktop-return.webp) e [vídeo real do gesto e seleção](desktop-gesture.mp4). Comparação com viewport 1280×720, Eco+, três estrelas e relógio real; respiração não sincronizada.
- Antes no celular deitado: [844×390](../../mobile/guided-constellation/landscape-rest.webp). Depois: [844×390](mobile-844x390.webp), [844×280](mobile-844x280.webp) e [780×260](mobile-780x260.webp). Alturas menores representam a área útil reduzida pelas barras do navegador; não simulam uma marca específica de aparelho.
- Retrato preservado: [390×844](mobile-390x844.webp). As capturas correspondentes com sufixo `-second` mostram a mudança para Estrela II.
- [Estado e limites observados](inspection.json). Capturas e vídeo do build local em Chromium/SwiftShader, sem substituir relógio, imagens, entradas ou navegação.

Nenhum asset foi redesenhado, nenhuma dependência adicionada e nenhuma política de resolução alterada. Remover a mistura de poses resolve a duplicação identificada; a qualidade final da tela ainda depende do perfil adaptativo e do aparelho. Não houve teste físico Android/Safari. O acesso direto a pages.dev é bloqueado pela rede do ambiente; a publicação é conferida no check Cloudflare. Main/referência preservadas, mesma branch e PR #29, sem merge ou início da criação de personagem.

## Validação

`npm run check` e `NODE_USE_ENV_PROXY=1 npm run build` aprovados. Cinco suítes unitárias aprovadas: `mobile-constellation`, `hands-perspective`, `hands-balance`, `selection-handoff` e `journey-motion`. A unidade de disposição agora cobre também 844×280 e 780×260, além dos quatro formatos anteriores. O teste da perspectiva usa o acesso comum, sem parâmetros de mãos; os testes históricos escolhem seus modos explicitamente.

Resultados de navegador por caso em [validation.json](validation.json).

**18 casos distintos de navegador aprovados em duas rodadas**, sem retries: 17 principais e dois de regressão, com repetição do caso de rotação para incluir 844×280 e 780×260. Cobertos rig padrão/hover/retorno/duas mãos sem fades, reduced/off, modos históricos explícitos, contagens 1–3, toque/swipe/setas/marcadores, rotação, paisagem curta, resumo, confirmação e chegada.

A conferência visual final encontrou o convite ao deslize muito próximo do crédito ESO na paisagem curta. Espaçamento e tamanho do símbolo foram ajustados; o teste agora exige pelo menos 4 px entre as linhas. Os três cenários afetados foram repetidos no build final.
