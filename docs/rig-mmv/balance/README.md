# Equilíbrio das mãos e apontamento contido

Base conferida no GitHub: `823e0d0`. Feedback de 19/10/2026: direita mais opaca, mãos desalinhadas nos dois eixos, esquerda sem acompanhar o hover e apontamento exagerado/esticado. Mesma branch `codex/maos-rig-mmv`, PR #29; sem main/merge.

## Ajustes

| Controle | Antes | Agora |
| --- | --- | --- |
| Opacidade esquerda/direita | 0,38 / 0,46 | 0,38 / 0,38 |
| Altura-base esquerda/direita | 0,565 / 0,66 da janela | Ambas 0,565 |
| Margem lateral-base | −0,030 / −0,018 | Ambas −0,030, espelhadas |
| Ancoragem inferior | −0,020 / −0,005 | Ambas −0,020 |
| Extensão máxima do indicador na perspectiva | 100% do contorno | 60% |
| Profundidade efetiva máxima no hover | 0,14 | 0,042 |
| Avanço adicional da mão no clique | 0,09 | 0,045 |

As duas malhas compartilham a mesma configuração de enquadramento e mantêm proporção da imagem, com o limite horizontal de 30% por lado. A arte e a pose própria de cada mão permanecem as mesmas. O ajuste reduz a direita à escala da esquerda, sem esticar/redesenhar a textura ou alterar o contorno anatômico aprovado.

A esquerda acompanha suavemente o mesmo progresso do hover: pequena elevação/aproximação e articulação real de punho/palma no rig. Ao sair, volta pela mesma mola, sem salto. O acompanhamento permanece durante a confirmação de clique; reduced-motion mantém a esquerda estática.

O indicador direito conserva uma curvatura mais relaxada e para antes da extensão total. O clique usa uma pressão menor, com avanço reduzido. As ondas de seleção e a viagem existentes permanecem iguais. `hoverBlend` representa a entrada completa; `rightBlend` passa a representar a pose efetiva contida — os testes distinguem os dois contratos.

## Validação e evidências

Aprovados: `npm run check`, `npm run build`, seis suítes unitárias (balance, seleção, perspectiva, rig, hover e malha), **19/19 casos de navegador** da família mesh/rig/perspectiva/seleção sem retries em 5,3 min, e **2/2 regressões da navegação padrão** sem retries em 26,9 s. A unidade nova verifica opacidade, escala, margens e altura nos três enquadramentos; acompanhamento real e retorno da esquerda; contenção do indicador/profundidade e reduced-motion. As regressões de anatomia continuam cobrindo todos os contornos matemáticos, inclusive os que o hover agora não usa, sem relaxar limites de inversão/espessura.

O CI da base `823e0d0` foi encontrado com **FAILURE** na etapa de testes de navegador. A causa não foi estabelecida: o ambiente bloqueou o download dos logs externos do GitHub; anotações da API só indicam saída 1. O usuário compartilhou o resumo do run `39247654033` (22m16s, saída 1 em Testar WebGL) e o artefato `12184518033` de 322 MB; o download desse artefato também foi bloqueado. O resumo não identifica o teste/erro. Os avisos de runtime Node.js e migração do Ubuntu não fornecem a causa da falha. O CI da revisão nova será conferido após publicar; testes locais não substituem seu resultado.

### Capturas

[Antes/depois no hover](comparison.webp): esquerda, base `823e0d0` salva no estudo anterior; direita, revisão atual. Mesmo modo/câmera/enquadramento; a respiração ambiente não foi sincronizada entre revisões. Capturas de estados usam relógio congelado apenas nas fases do clique; fluxos funcionais usam mouse/teclado/toque e tempo reais.

- [Repouso desktop](1920x1080-neutral.webp), [hover desktop](1920x1080-pointing.webp), [retorno desktop](1920x1080-returned.webp).
- [Hover 1920×951](1920x951-pointing.webp), [hover celular](390x844-pointing.webp), [retorno celular](390x844-returned.webp).
- Doze capturas da seleção: antes do clique e 8/25/50/75/92%, em 1920×1080 e 390×844. [Pressão desktop](1920-click-50.webp), [pressão celular](390-click-50.webp).
- [Métricas de seleção](metrics.json), extraídas do mesmo run aprovado. [Vídeo de 16,63 s](balance.mp4): repouso → hover → retorno → hover → clique/viagem, com mouse e relógio reais, sem erros de página. A gravação exporta apenas o canvas 768×432; intercepta somente a navegação final com HTTP 204 para terminar a exportação. Os testes verificam a chegada real à ficha.

Evidência local do build de produção com Chromium/SwiftShader; não mede FPS/RAM no dispositivo do usuário nem constitui aceite artístico.

Código: `first-person-hands-mesh.js`, `hands-image-rig.js`, `hands-perspective-motion.js`. Unidade nova `tests/hands-balance.unit.mjs`, incluída no CI; contratos de opacidade/pose atualizados nas regressões existentes. Assets, pesos, grade, ponta arredondada, ESO/créditos, câmera, seleção luminosa e `star-journey.js` preservados.

Próxima ação do usuário na entrega: abrir a nova prévia, observar as mãos em repouso, passar/retirar o cursor da Nox e clicar. Avaliar equilíbrio/transparência e naturalidade do gesto contido. Nenhum upload, instalação ou credencial necessário.
