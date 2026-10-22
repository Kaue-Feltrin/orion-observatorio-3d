# Card mobile em paisagem e confirmação sem mãos — 22/10/2026

O usuário encontrou o cabeçalho cortado ao girar o celular com o resumo aberto. O painel inteiro era rolável, tinha pouco espaço vertical e mantinha um botão sticky no fim. Agora cabeçalho/nome/fechar e confirmação ficam em partes fixas; somente os dados têm rolagem. Na paisagem, o painel usa a altura disponível entre as áreas seguras e o crédito da fotografia. Sair fica oculto enquanto o resumo está aberto na paisagem, evitando disputa com Fechar; reaparece ao fechar o resumo. Retrato e desktop conservam seus fluxos.

As mãos estavam programadas para surgir na confirmação mobile, o que produzia a aparição inesperada pelos cantos. No toque elas agora permanecem ocultas na escolha, resumo, confirmação e viagem. A seleção luminosa da estrela continua, assim como o rig padrão do desktop. Texturas/rigs existentes continuam alocados no mobile; não há novas superfícies ou assets, e nenhuma mão é desenhada.

A tela temporária de chegada também estava alta demais no celular deitado. A disposição compacta em paisagem com pouca altura mantém texto e botão de retorno dentro da área útil, sem iniciar a implementação da ficha definitiva.

## Evidência

Capturas do build local, Eco+, três estrelas; entrada pelo toque real. O resumo foi aberto em retrato e girado antes da confirmação, reproduzindo o caminho relatado.

| Formato | Resumo | Confirmação | Chegada |
| --- | --- | --- | --- |
| 390×844 | [Ver](390x844-summary.webp) | [Ver](390x844-confirm.webp) | [Ver](390x844-arrival.webp) |
| 844×390 | [Ver](844x390-summary.webp) | [Ver](844x390-confirm.webp) | [Ver](844x390-arrival.webp) |
| 780×260 | [Ver](780x260-summary.webp) | [Ver](780x260-confirm.webp) | [Ver](780x260-arrival.webp) |

[Vídeo da paisagem curta](landscape-trip.mp4) · [Limites e mãos por quadro](inspection.json) · [Validação por caso](validation.json).

Referência da etapa anterior: [resumo horizontal anterior](../guided-constellation/landscape-summary.webp). Capturas não sincronizam a respiração e não substituem as imagens fornecidas pelo usuário como evidência do defeito no aparelho.

Validação local em Chromium/SwiftShader com toque emulado, não em Android/Safari físicos. Publicação conferida pelo check Cloudflare; pages.dev não é acessível diretamente pela rede deste ambiente. Main/referência preservadas, mesma branch/PR #29, sem merge, dependências novas ou criação de personagem.

Check/build e unidades `selection-handoff`/`hands-balance` aprovados. **15 casos distintos de navegador passaram em duas rodadas**, sem retries: 14 mobile, regressão do rig desktop e repetição do teste de orçamento móvel após renomeá-lo. Testes cobrem também 320 px, rotação com resumo aberto, rolagem somente dos dados, ausência de mãos por quadro, reduced/off, destino bloqueado, confirmação e chegada em 780×260.

Conferência das capturas levou a compactar o cabeçalho e os espaçamentos horizontais para os dados da Nox caberem inteiros em 780×260. Os quatro cenários afetados foram repetidos no build final e passaram. O teste de encaixe agora exige que todos os valores visíveis da Nox fiquem dentro da região de dados, além de nome/ações dentro do card.
