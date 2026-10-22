# Viagem lateral com direção estável

Correção de 20/10/2026 sobre `6c7972d`, na mesma branch `codex/maos-rig-mmv` / [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29). O usuário aprovou a etapa de uma a três estrelas e apontou movimento estranho do ambiente e dos outros destinos quando a câmera virava.

A trajetória anterior terminava na vertical da estrela: a câmera precisava desfazer parte do giro enquanto avançava. O panorama também crescia e encolhia para cobrir a tela, enquanto seus recortes transparentes mantinham outro enquadramento. As outras estrelas permaneciam visíveis durante boa parte dessa combinação de movimentos.

Agora:

- Os destinos não escolhidos se dissipam em 160 ms, antes do giro. Permanecem nas posições do mundo; só sua luz desaparece.
- A câmera orienta suavemente e só avança após 700 ms. Segue a linha de mira inicial, mantendo o rumo até o clarão, sem oscilação lateral ou contra-curva.
- A viagem normal dura 2550 ms (antes, 2150); o trecho de avanço continua com aproximadamente 1850 ms. Abertura extra do campo de visão cai de 11° para 4°, com entrada e saída suaves. Rastros só aparecem quando há avanço.
- A cobertura já necessária do panorama é mantida durante o avanço, sem contra-zoom. Recortes fotográficos acompanham a mesma cobertura, preservando profundidades e paralaxe reais. Foto em repouso e arquivos das imagens não mudam.
- Névoa e gás partem de seus valores reais no clique, inclusive após respiração/controles, sem queda de opacidade no primeiro quadro.
- Distância final em Z, limite de segurança, destinos, seleção, mãos e véu entre páginas preservados. Reduced-motion mantém a duração anterior de 850 ms e não aloca rastros.

## Comparação

[Vídeo anterior](before.mp4) · [Vídeo corrigido](after.mp4) · [Dados das gravações](recordings.json)

Ambos usam três estrelas e selecionam a **Estrela III**, com o mesmo viewport de 1280×720 e perfil Eco+ em perspectiva. São gravações da página inteira via CDP, relógio e entradas reais, incluindo navegação efetiva à chegada sem interceptação. A base foi extraída com `git archive`, sem trocar de branch. Não há sincronização da respiração ou duração do hover. Sem erros JS/shader; Chromium/SwiftShader local, sem presumir desempenho ou aceite no equipamento do usuário.

| Etapa | Antes | Depois |
| --- | --- | --- |
| Repouso | [Captura](before-3-stars.webp) | [Captura](after-3-stars.webp) |
| Hover | [Captura](before-hover.webp) | [Captura](after-hover.webp) |
| Chegada | [Captura](before-arrival.webp) | [Captura](after-arrival.webp) |

Unidades verificam curva sem reversão, avanço colinear, direção constante, saída dos outros destinos antes do giro, continuidade do gás, ausência de contra-zoom e alinhamento dos recortes a 30/60/120 Hz. A cobertura/recorte continua verificada em quatro proporções de tela e agora percorre a duração completa nova. Dois casos de navegador adicionais medem a viagem real para os destinos esquerdo e direito. **Check/build, três suítes unitárias e 23 casos de navegador aprovados**, em duas rodadas (20 de navegação/seleção + três da cena), sem falhas ou retries. Resultados por caso e arquivos alterados em [validation.json](validation.json).

Main e branch de referência preservadas. Criação de personagem e nova adaptação mobile continuam para etapas posteriores. Próxima ação do usuário: abrir a nova prévia e comparar a viagem para as estrelas laterais. Nenhuma instalação, upload ou credencial necessária.
