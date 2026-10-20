# Seleção astral da Nox e gesto mais natural

20/10/2026. Pedido: melhorar somente a animação de escolher a estrela, com um efeito mais extravagante na Nox e gesto mais natural na mão. Base GitHub conferida `f7f1627`, mesma branch `codex/maos-rig-mmv`/PR #29, sem main/merge.

## Resultado

A confirmação reúne luz ao redor da estrela, abre uma coroa no contato do indicador e dispersa os fragmentos antes da viagem existente. Duas fitas inclinadas em 3D orbitam em sentidos opostos, doze raios formam a coroa e dezoito pequenos fragmentos convergem/expandem em espiral. As duas ondas anteriores ficaram maiores e mais luminosas; os glows existentes recebem um reforço sincronizado. Tudo fica ancorado na Nox e aparece somente ao selecionar. O fundo em repouso não recebe partículas novas.

A direita começa com um pequeno recuo e relaxamento do indicador. Sobe por um arco, avança discretamente e inclina o punho em X/Y; o polegar e os três dedos recolhidos se acomodam no contato, com menos oscilação de repouso durante a pressão. O indicador pressiona e solta antes de o punho assentar. A pose inteira volta ao estado de hover sem rotação residual de seleção antes da retirada das mãos na viagem.

Não há troca de imagem ou fades de poses na perspectiva. Assets, transparência 0,38, proporção, ponta arredondada, máximo de apontar 0,60, alinhamento/fechamento da esquerda e camadas da atmosfera permanecem. A câmera e `star-journey.js` não mudaram.

| Controle | Antes | Agora |
| --- | --- | --- |
| Confirmação nominal | 840 ms | 1120 ms |
| Avanço do corpo da direita | 0,045 em Z | 0,052 em Z, com arco e inclinação |
| Pressão do indicador | morph 0,10 | 0,10, com preparação menor e acomodação do rig |
| Raios máximos das ondas | 54 / 54 | 78 / 90 |
| Superfícies do efeito | 2 | 6 |
| Triângulos do efeito | 1536 | 2936 |
| Texturas do efeito | 0 | 0 |

Curvas quintic C2 conectam preparação, elevação, avanço, pressão e assentamento. Elevação começa antes de o avanço atingir o máximo; a pressão termina antes do assentamento do punho. Fitas/raios/fragmentos são geometrias Three.js nativas, sem shader, imagem, dependência ou loop novo. Quatro geometrias únicas compartilhadas onde possível, seis materiais, todos com uma passagem por superfície. A alocação ocorre só no primeiro clique, com descarte idempotente.

Reduced-motion mantém a confirmação estática de 160 ms, apenas com as duas ondas existentes, sem coroa/fita/fragmentos alocados, sem inclinação/avanço/pressão da mão ou expansão. Clique repetido continua ignorado; teclado, dois toques no celular e hands=off seguem atendidos.

## Validação

Check/build e sete suítes unitárias aprovados. A seleção verifica carga tardia, geometria limitada, sinal luminoso sincronizado, ausência de texturas, recursos únicos/descarte, retorno sem inclinação residual, clique único, 30/60/120 Hz e proteção de quadro lento. A nova amostra de anatomia mede 21 estágios em três instantes com morph e acomodação do rig: área relativa **0,3939347–1,3745913**, sem inversões, mantendo o limite anterior de 0,10–4,0.

Treze casos distintos de navegador aprovados: cinco fluxos da seleção, quatro da perspectiva, três de fechamento/alinhamento/atmosfera e uma captura por fases. A captura foi repetida após corrigir uma referência no coletor de métricas do teste (1/1 em 32,8 s); o app não foi alterado para resolver esse erro. Sem retries automáticos. Mais 2/2 smokes da navegação padrão passaram em 21,7 s. Total de **15 casos distintos aprovados**, não uma execução única de 15 casos. O vídeo real foi conferido, sem erros de página.

O CI completo da base `f7f1627` terminou com FAILURE em Testar WebGL. As anotações consultadas informam somente saída 1, sem nome do teste/causa. Os avisos de Node/Ubuntu não identificam essa falha; logs externos ficaram bloqueados no ambiente nas rodadas anteriores. O CI da revisão nova será conferido após publicar. Testes locais não substituem o CI completo.

## Evidências

- [Comparação em 50% da seleção](comparison.webp) e [detalhe ampliado da Nox](star-detail.webp): base f7f1627 e revisão atual, no mesmo estágio normalizado; respiração ambiente não sincronizada entre revisões.
- Doze capturas: antes e fases 8/25/50/75/92%, em desktop 1920×1080 e celular 390×844. [Contato desktop](1920-click-50.webp), [dispersão desktop](1920-click-75.webp), [contato celular](390-click-50.webp).
- [Métricas das fases](metrics.json) e [cobertura/recursos](validation.json). Relógio congelado somente nessas capturas; fluxos funcionais usam entradas/tempo reais.
- [Vídeo real de 7,36 s](selection.mp4): hover, clique, coroa/fragmentos e viagem. Mouse/relógio reais, canvas 768×432. Só a navegação final é interceptada com HTTP 204 para exportar; testes verificam chegada real à ficha.

Evidência do build local de produção com Chromium/SwiftShader; não mede FPS/RAM no dispositivo do usuário e não é aceite artístico.

Código: `star-selection.js`, `first-person-hands-mesh.js`, `hands-image-rig.js`, `main.js`. Regressões da seleção, documentação e contexto cumulativo atualizados. Nenhum arquivo da atmosfera ou asset das mãos foi alterado nesta etapa.

Ação do usuário na entrega: abrir a nova prévia e clicar na Nox, observando o arco/contato/retorno da direita e a coroa luminosa. Sem instalação, upload ou credencial necessária. Encerrar após esta etapa.
