# Mobile guiado — constelação em retrato e paisagem

Protótipo de 22/10/2026 sobre `40b98b5`, na branch `codex/maos-rig-mmv` / [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29). O usuário aprovou explorar uma estrela por vez, exigiu funcionamento em pé e deitado e pediu indicações claras de que é possível deslizar entre estrelas.

## Comportamento

- Uma estrela em destaque por vez. Deslizar horizontalmente muda o destino em foco; a transição desliza a constelação no mesmo loop da cena, com deslocamento discreto da câmera e paralaxe existente. Gestos curtos, verticais, cancelados ou dentro do resumo não trocam de destino nem confirmam viagem.
- Setas de 44 px, marcadores acessíveis, nome e posição `1 / 3`, além de “Deslize para mudar de estrela”. O símbolo ↔ faz uma indicação suave por três ciclos, desativada em reduced-motion. Setas têm limites, sem salto circular. Com uma estrela, controles e convite de deslize ficam ocultos.
- Toque na estrela abre o resumo. Segundo toque não viaja: só **Entrar no universo** confirma. Durante a troca, o alvo aguarda a estrela assentar; durante a confirmação, trocar de destino fica bloqueado.
- Retrato: estrela acima do painel inferior. Paisagem: estrela deslocada para a esquerda e resumo à direita. Rotação conserva a estrela e o resumo. Setas, marcadores e teclado oferecem alternativas ao swipe.
- Mãos em perspectiva ficam ocultas durante escolha/resumo e aparecem gradualmente na confirmação, usando os mesmos assets/rig. O quadro inicial móvel passa a zero superfícies de mãos desenhadas; as duas texturas existentes continuam carregadas para o gesto. Reduced-motion mantém a navegação instantânea, sem deslize de câmera ou animação da indicação.
- A coleção continua limitada a uma a três estrelas; nomes extras são provisórios. Sem criação de personagem, conta, backend ou ficha definitiva. Desktop e zoom de 32% da viagem preservados; a consolidação do gesto como padrão desktop identificada na auditoria anterior não faz parte desta alteração mobile.

## Evidências

[Antes — resumo móvel com a interface anterior](../../reviews/2026-10-22-desktop/mobile-summary.webp)

| Estado | Em pé, 390×844 | Deitado, 844×390 |
| --- | --- | --- |
| Escolha e convite de deslize | [Retrato](portrait-rest.webp) | [Paisagem](landscape-rest.webp) |
| Após deslizar para Estrela II | [Retrato](portrait-browse.webp) | [Paisagem](landscape-browse.webp) |
| Terceira estrela | [Retrato](portrait-third.webp) | [Paisagem](landscape-third.webp) |
| Resumo com confirmação | [Retrato](portrait-summary.webp) | [Paisagem](landscape-summary.webp) |
| Gesto ao confirmar | [Retrato](portrait-confirm.webp) | [Paisagem](landscape-confirm.webp) |
| Chegada | [Retrato](portrait-arrival.webp) | [Paisagem](landscape-arrival.webp) |

[Vídeo em pé](portrait.mp4) · [Vídeo deitado](landscape.mp4) · [Dados das gravações](recordings.json) · [Validação por caso](validation.json)

Dois vídeos reais da página inteira via CDP, com toque/swipe/controles e relógio reais, sem interceptar a navegação. Ambos passam por Estrela II/III e confirmam entrada em Estrela II; sem erros JS/shader. Perfil Eco+ fixo nas gravações para estabilidade de comparação. A captura histórica anterior usou perfil automático, e respiração/relógio não são sincronizados; a comparação é de interação/composição, não de desempenho. Métricas instantâneas não são benchmark.

## Verificação

Na conferência de 568×320, o resumo alto disputava espaço com Sair. O painel horizontal agora reserva espaço para o cabeçalho e mantém rolagem interna. Uma asserção nova também encontrou a confirmação ultrapassando a borda do cartão em 1 px; o rodapé sticky foi ajustado sem relaxar o limite. A rodada móvel adicional passou 11/12 antes desse ajuste; os quatro cenários de encaixe/viagem afetados passaram 4/4 após a correção, incluindo rotação e navegação completa nos dois formatos. [Captura final da tela menor](landscape-small-summary.webp) e [limites observados](small-landscape.json).

Check/build, cinco suítes unitárias e **32 casos distintos de navegador aprovados em rodadas**, sem retries automáticos: seis do novo guia e 26 de navegação, seleção e toque. Cobertos uma/duas/três estrelas, setas/marcadores/teclado/swipe, limites, gestos cancelados/verticais, toque no resumo, confirmação bloqueada contra troca, rotação, 320×568, 568×320, 390×844, 844×390, reduced/off, identidade/retorno e véu entre documentos.

Unidade nova projeta a coleção com câmera real em quatro aspectos, garantindo uma estrela visível por vez e posição segura do resumo. Unidade de continuidade das mãos foi atualizada: a expectativa antiga de mãos visíveis no hover móvel deixou de ser válida; agora testa desktop e toque, mantendo as asserções de continuidade da câmera/luz, anatomia e retirada. Nenhuma alteração da aplicação foi feita para contornar essa atualização de expectativa.

Sem assets, dependências, texturas ou superfícies 3D novos; controles são HTML/CSS. Sem loop adicional. Fonte: `mobile-constellation.js`, integração em `main.js`, `touch-navigation.js`, `first-person-hands-mesh.js`, `index.html` e `styles.css`, mais testes/CI/contexto.

Evidência local Chromium/SwiftShader com emulação de toque; ainda requer avaliação de uso e desempenho em Android e Safari/iPhone físicos. Main/referência preservadas, sem merge. Próxima ação do usuário: abrir a prévia no celular, deslizar entre as três estrelas em pé/deitado e confirmar uma escolha. Sem instalação ou upload necessário.
