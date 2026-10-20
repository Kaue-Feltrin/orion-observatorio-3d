# Continuidade da seleção e experiência própria de toque

20/10/2026. Pedido: integrar hover, gesto, seleção e viagem e adaptar o Observatório ao celular. Base GitHub conferida `9db7fc4`; continuação na branch `codex/maos-rig-mmv`/PR #29, sem main/merge.

## Desktop: uma sequência contínua

Foco de câmera e reforço luminoso agora entram/saem com amortecimento, em vez de saltarem entre dois estados. Foco de teclado também conduz o gesto; perder a janela/aba devolve a cena ao repouso. A direita acompanha discretamente a direção projetada da Nox pelo punho, sem estender o indicador além do limite anterior.

A viagem começa aos 78% da confirmação, aproximadamente 874 ms após clicar, durante o assentamento. Os últimos 246 ms do efeito e do gesto continuam no início da viagem. A câmera conserva posição, orientação e FOV de partida; os quatro glows partem de seus tamanhos/opacidades reais e se conectam à iluminação da viagem durante a fase de mira de 290 ms. As mãos mantêm a articulação enquanto se retiram com fade quintic de 380 ms, sem voltar abruptamente à pose neutra. Pontas de difração também amortecem foco/viagem.

O clarão final, destino, trajetória, quantidade de rastros e travessia das camadas permanecem. Reduced-motion mantém confirmação estática de 160 ms, sem sobreposição antecipada, inclinação ou arrasto de câmera, e a viagem acessível anterior. Repetir clique não reinicia a sequência.

## Celular: arrastar, escolher, confirmar

- Arrastar o céu explora a perspectiva com amplitude limitada, inclusive quando o gesto começa sobre a estrela. Não depende de mouse ou giroscópio. Pinch-zoom continua disponível; cancelamento/segundo dedo encerram o arrasto.
- Tocar na Nox abre o resumo. Outro toque na estrela mantém o resumo; a viagem exige o botão **Atravessar o véu**. Arrasto não vira seleção acidental. Fechar, Escape ou tocar fora dispensam o painel; fechar pelo botão/Escape restaura foco sem reabrir.
- Em retrato, o painel fica na parte inferior; em paisagem, na lateral direita. Respeita áreas seguras, tem rolagem interna quando necessária, controles de 44/48 px e dados preenchidos. Campos sem valor não ocupam o resumo móvel. A estrela continua descoberta; alvos escondidos ficam `inert`.
- Duas mãos compactas entram por padrão no toque, usando a perspectiva com a mesma arte e alpha 0,38. No retrato, o limite lateral é 27% da largura e as mãos sobem juntas ao escolher a Nox, acompanhando o painel. Fechamento esquerdo, anatomia direita e apontar máximo 0,60 preservados. `hands=off` continua sem baixar imagens das mãos.
- Qualidade automática começa em lite nos dispositivos de toque e mantém os fallbacks existentes. Parâmetros manuais de qualidade continuam respeitados. Nenhum asset, dependência, shader ou loop novo; as mãos móveis passam a usar os dois assets já existentes da perspectiva.

A fotografia ESO, recortes/camadas e créditos não foram alterados. Esta etapa adapta o Observatório; `ficha.html` continua sendo a chegada temporária existente. Seu cartão agora respeita a largura útil (em 320 px, antes terminava em x=328), áreas seguras e movimento reduzido; conteúdo e destino preservados.

## Validação e evidências

Check/build e **oito suítes unitárias** aprovados. A unidade nova conecta seleção, mãos, câmera e glows reais: primeiro quadro sem salto de posição/orientação/FOV/tamanho/opacidade; cauda luminosa e articulação mantidas ao partir; encerramento/retirada únicos; direção do punho contida; reduced-motion estático. Anatomia anterior preservada, sem relaxar limites.

**97 casos distintos de navegador aprovados, sem retries automáticos.** A execução completa de 16 min passou 95 e encontrou duas falhas nos testes anteriores: contagem de atmosfera ainda em três (agora cinco) e uma espera fixa de 240 ms que podia terminar antes de haver um quadro animado no rig legado. Corrigida a expectativa para o perfil manual balanced/cinco planos, preservando o orçamento real; o teste de quaternion agora espera mudança real e dois quadros em reduced-motion. Ambos passaram em repetição dirigida (2/2 em 14,4 s), sem alterar o rig legado.

Após o ajuste exclusivo de HTML/CSS da chegada, os seis casos móveis passaram novamente (6/6 em 52,4 s), incluindo enquadramento da chegada em 320×568, 390×844 e 844×390 e animação desligada em reduced-motion. Código da cena/mãos/seleção/viagem é o mesmo da execução completa. Total corresponde a 97 casos distintos aprovados entre execuções; não a uma única rodada verde de 97. [Lista e cobertura](validation.json), [métricas das fases/toque/chegada](metrics.json).

- [Comparação no retrato](mobile-comparison.webp) e [comparação na horizontal](landscape-comparison.webp).
- Seis capturas reais de toque: repouso/resumo em três enquadramentos; [resumo 390 px](390-touch-summary.webp), [resumo 320 px](320-touch-summary.webp), [paisagem](844-touch-summary.webp). [Chegada 320 px](320-touch-arrival.webp).
- Doze capturas isoladas da seleção: desktop e viewport estreito com entrada de mouse, antes e cinco fases. Nessas poses, relógio da seleção, passos das mãos e viagem são controlados para inspeção; não representam um vídeo em tempo real. Exemplos: [contato](1920-click-50.webp) e [ponte aos 92%](1920-click-92.webp).
- [Vídeo desktop de 6,84 s](desktop.mp4) e [vídeo de toque de 7,64 s](mobile.mp4): entradas/relógio reais, página inteira via CDP com timestamps reais, sem interceptar a chegada. Incluem a sobreposição seleção/viagem com mão ainda visível e chegada real à ficha, sem erros de página/WebGL. [Metadados](recordings.json).

O CI completo da base 9db7fc4 terminou FAILURE em Testar WebGL. As anotações externas não indicam o teste; as duas falhas descritas acima foram identificadas e corrigidas localmente. CI da revisão nova a conferir após publicação. Não atribuir a falha aos avisos de Node/Ubuntu nem substituir o resultado remoto pelo local.

Comparação usa a base `9db7fc4` em uma cópia de fontes extraída por `git archive`, sem trocar a branch de trabalho. Vite executado na pasta dessa cópia; assets ESO gerados previamente reutilizados porque seus fontes não mudaram. Mesmo viewport e entrada de toque nas duas versões; respiração ambiente não sincronizada. Na base, o painel em 844×390 terminava em y=432, fora da tela, e o texto ainda pedia clique. A revisão mede enquadramento e acessibilidade dos controles em 320×568, 390×844 e 844×390, incluindo rotação na mesma página.

Evidência local de produção em Chromium/SwiftShader com emulação de toque. Não substitui teste de fluidez, áreas seguras e gestos no navegador de um celular real.

## Arquivos e próxima ação

Código: `main.js`, `touch-navigation.js`, `index.html`, `styles.css`, `first-person-hands-mesh.js`, `star-selection.js`, `star-journey.js`, `cinematic-star.js` e ajuste responsivo de `ficha.html`. Unidade de continuidade adicionada ao CI e regressões de seleção, foco e toque atualizadas. Contexto completo cumulativo preserva as etapas anteriores.

Ação do usuário: na nova prévia, testar hover/clique no desktop; no celular, arrastar, tocar na Nox, confirmar pelo botão e girar a tela. Sem instalação, upload, sensor ou credencial necessária. Encerrar após esta etapa.
