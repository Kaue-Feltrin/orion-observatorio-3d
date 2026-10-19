# Fechamento da esquerda, entradas laterais e profundidade da atmosfera

Base GitHub conferida antes de alterar: `67e0491`, branch `codex/maos-rig-mmv`, PR #29. Feedback de 19/10/2026: esquerda sem movimento perceptível, pedido de fechar um pouco os dedos quando a direita aponta, antebraços começando em bordas diferentes e mais camadas atmosféricas para a paralaxe. Esse pedido amplia a etapa para a atmosfera; sem main/merge.

## Mão esquerda

O acompanhamento anterior só articulava punho/palma. Agora o hover também flexiona indicador (−0,17 rad), falange distal (−0,13), médio (−0,15), anelar (−0,12) e mínimo (−0,09); o polegar faz oposição (+0,09 e +0,06 rad). A mola existente continua guiando a entrada e a volta. Não há troca de imagem, fade ou mudança de alpha. A abertura entre pontas de indicador/polegar cai aproximadamente **21%** no ensaio unitário congelado; os três enquadramentos são conferidos com mouse real.

O rig 2,5D é usado por `handsMotion=rig` e `handsMotion=perspective`; a prévia desta entrega usa a perspectiva. O modo mesh antigo continua disponível para comparação. Reduced-motion mantém os ossos esquerdos estáticos. O apontar direito permanece contido em 0,60, profundidade máxima 0,042, e a pressão/clique anterior é preservada.

A flexão foi limitada para evitar colapsos da malha. Teste amostra 41 progressos × quatro instantes e exige área relativa dos triângulos entre 0,10 e 4,0; resultado esquerdo **0,25749–1,57560**, sem inversões. A anatomia direita continua com os limites anteriores.

## Entrada dos braços

Retângulos iguais não garantiam a mesma origem visível: o antebraço esquerdo chegava ao canto inferior e a arte direita terminava pela lateral. A esquerda recebe rotação estática de −0,20 rad (aprox. −11,5°) e compensação lateral de −1,2% da largura da janela. Escala, proporção, altura-base e transparência continuam iguais. A máscara direita permanece igual. A esquerda recebe um fade próprio do antebraço em UV v=0,09–0,30 para igualar o acabamento visível, sem afetar palma/dedos ou redesenhar a arte.

A unidade `hands-balance.unit.mjs` agora amostra o alpha real dos WebPs multiplicado pelo alpha de vértice do acabamento e o projeta pela malha deformada nas duas bordas, em 1920×1080, 1920×951 e 390×844. Exige diferença menor que 1,2% da altura entre topos/bases das entradas; em desktop, ambos precisam sair pela lateral antes de atingir o canto inferior. No ensaio congelado em 1920×1080, as entradas ocupam aproximadamente y≈0,819–0,893 à esquerda e 0,823–0,888 à direita.

As regressões de navegador continuam protegendo centro e landmarks. O envelope do **retângulo transparente** esquerdo permite a nova rotação (até 32% da largura na borda interna). O contorno visível com alpha real e os landmarks mantêm o limite de 30%, em vez de confundir a borda do PNG com a borda do braço. O ensaio final detectou um canto transparente em 30,019% no rig antigo; isso motivou distinguir essas duas medidas. Nenhum limite anatômico foi relaxado.

## Duas camadas atmosféricas novas

| Recorte ESO | Profundidade Z | Opacidade-base | Paralaxe X/Y em unidades 3D |
| --- | ---: | ---: | ---: |
| Bruma intermediária esquerda (`05`) | −130 | 0,10 | 12 / 4 |
| Filamento próximo direito (`06`) | −42 | 0,055 | 8 / 3 |

As camadas usam regiões distintas da mesma fotografia ESO, com bordas transparentes e deriva/respiração próprias. A camada próxima tem maior deslocamento **projetado** por estar mais perto da câmera. Não acrescentam partículas/estrelas nem alteram o JPEG principal, o foco da Nox ou a câmera.

- Eco+ passa de três para **cinco** recortes ativos; balanced de três para cinco; high de quatro para seis.
- Eco/lite continuam com dois e não solicitam as texturas novas. `foreground=off` no Eco+ preserva a comparação com dois planos. Reduced-motion congela deriva/respiração/paralaxe.
- Novas texturas são geradas no build existente, a partir da fonte ESO licenciada/créditos já presentes: 800×395 e 800×400, aproximadamente 97 + 96 KiB WebP. Não são arte de mãos redesenhada nem assets de outro projeto.
- Duas superfícies/quatro triângulos e duas texturas adicionais nos perfis que as usam. Material plano com `forceSinglePass` limita cada nova superfície a uma passagem por render da cena. Nenhuma dependência, shader ou loop extra.
- Resultado local de texturas GPU no modo perspectiva: 26 → 28. Contagem de chamadas depende das passagens de bloom e não representa FPS/RAM físicos do usuário.

## Validação

Check/build e sete suítes unitárias aprovados: malha, hover, rig, perspectiva, seleção, equilíbrio/fechamento e volume atmosférico. **18/18 regressões da cena/qualidade** aprovadas; **22 casos distintos das mãos/seleção** aprovados no build final, incluindo os três casos de enquadramento repetidos após atualizar as asserções do retângulo transparente (3/3 em 2,6 min). A rodada de 22 passou 21; o único erro restante era a medida do canto transparente do rig antigo, resolvida ao separar envelope e alpha real. Sem retries automáticos, sem limites anatômicos relaxados. Total: **40 casos distintos aprovados**; não corresponde a uma execução única de 40 testes.

A primeira execução dos três casos novos aprovou fechamento/retorno nos três enquadramentos e paralaxe/viagem. A comparação exata de uma distância mundial em reduced-motion diferiu por cerca de 10⁻⁸ devido às transformações da câmera; o teste usa tolerância numérica de 10⁻⁶ e exige também `leftFollow=0` e todos os ângulos dos ossos iguais a zero. Sem alteração do comportamento para resolver essa asserção.

Evidência do build local de produção com Chromium/SwiftShader. O CI completo da base `67e0491` terminou aprovado durante esta etapa. O CI remoto da revisão nova será conferido após publicar; os resultados locais não substituem o CI. Avaliação artística do novo gesto/atmosfera ainda depende do usuário.

## Evidências

- [Antes/depois das entradas dos braços](comparison.webp), comparando repouso da base `67e0491` e da revisão atual. A respiração ambiente não foi sincronizada entre revisões.
- [Esquerda ampliada: repouso e fechamento no hover](left-closure.webp), com o mesmo recorte da tela.
- [Repouso desktop](1920x1080-neutral.webp), [hover desktop](1920x1080-pointing.webp), [retorno desktop](1920x1080-returned.webp), [hover 1920×951](1920x951-pointing.webp).
- [Repouso celular](390x844-neutral.webp), [hover celular](390x844-pointing.webp), [retorno celular](390x844-returned.webp).
- [Paralaxe: cursor à esquerda](1920-parallax-left.webp) e [à direita](1920-parallax-right.webp).
- Doze fases da seleção, em desktop/celular: antes do clique e 8/25/50/75/92%. [Pressão desktop](1920-click-50.webp) e [pressão celular](390-click-50.webp).
- [Métricas](metrics.json), [cobertura dos testes](validation.json) e [procedência/hashes dos recortes novos](assets.json).
- [Vídeo de 16,18 s](closure-atmosphere.mp4), sem erros de página: movimento lateral/paralaxe, hover/fechamento esquerdo, retorno, hover e clique/viagem. Mouse e relógio reais, canvas 768×432. Somente a navegação final é interceptada com HTTP 204 para exportar a gravação; os testes verificam chegada real à ficha.

Fluxos funcionais com entradas/relógio reais. Somente as capturas de fases do clique congelam o relógio para registrar o mesmo estágio. Capturas novas são do build final, depois do acabamento do antebraço esquerdo.

## Arquivos

Código: `first-person-hands-mesh.js`, `hands-image-rig.js`, `nebula-depth-specs.js`, `nebula-volume.js`; comentário de contagem atualizado em `main.js`. Regressões: `hands-balance.unit.mjs`, auxiliar `hands-silhouette.mjs`, novos `hands-atmosphere.spec.js` e `nebula-volume.unit.mjs`; contratos de contagem/enquadramento nas suítes anteriores e nova unidade no CI. Contexto cumulativo e continuidade atualizados, preservando o histórico.

Próxima ação do usuário: abrir a nova prévia, mover o cursor lateralmente para avaliar a profundidade, entrar/sair do hover da Nox para ver a esquerda fechar/reabrir, e clicar para conferir a seleção/viagem. Nenhuma instalação, upload ou credencial necessária. Encerrar após esta etapa.
