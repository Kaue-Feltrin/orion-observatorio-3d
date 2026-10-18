# Contornos suaves do indicador e dos três dedos dobrados

Feedback do usuário sobre `29a571d`: ainda parecia quebrado; confirmou **ambos**, indicador e três dedos dobrados. Base GitHub conferida antes de alterar, com CI completo e Cloudflare aprovados. Mesma branch `codex/maos-rig-mmv`, PR #29, sem modificar main ou a branch de referência.

## Correção

A grade 36×28 e a interpolação linear deixavam quinas na extensão. O morph também alterava a base perto dos outros dedos. A imagem original tinha articulações angulosas e a textura do indicador dobrado mantinha um vinco mesmo depois de estendida.

- Novo asset **`right-hand-pointing-smooth.webp`**: refinamento por ImageGen da imagem existente, com indicador já estendido e dobras/pontas mais arredondadas nos três dedos recolhidos. Mesmo canvas 1122×1402, alpha, registro do punho/palma, escala e linguagem azul-violeta. Conversão para WebP sem resize/crop/rotação. Apenas a perspectiva usa a nova imagem; originais mantidos. [Procedência e hashes](asset.json).
- A mão inteira usa essa imagem durante todo o gesto. O apontamento final preserva o desenho estendido; quatro morph targets a dobram até o repouso e as poses intermediárias. Assim a textura final não depende de esticar o vinco de um indicador desenhado dobrado. Continua sem recorte ou crossfade.
- Contornos calibrados pela borda alpha e interpolação Hermite monotônica, com tangentes contínuas. Base/palma ancoradas desde u≈0,33; faixa abaixo do indicador restrita para não puxar os outros dedos. Perfil de ossos/landmark da perspectiva acompanha a nova imagem.
- Grade direita **72×72**, apenas na perspectiva, com 56 faixas concentradas em UV v=0,38–0,85, cobrindo indicador, dedos dobrados e polegar. Antebraço recebe menos amostras. Esquerda e modos anteriores preservados; mesmo renderer/loop, sem dependências novas.
- Proporção, posição, máscara inferior, translucidez, hover real do Nox, retorno/reversão e alcance Z permanecem. Reduced-motion usa poses estáticas (em repouso, a imagem é dobrada sem animar; ao apontar, exibe a arte estendida sem morph/depth). Off não carrega mãos.

A imagem continua sendo um rig 2,5D: não reconstrói faces ocultas, fecha os três dedos nem gira a mão em 3D. O refinamento dos dedos dobrados é da arte e da malha; não adiciona uma sequência de fechamento.

## Validação

Unidade exige continuidade de tangente nas colunas, base/palma fora da extensão, malha densa em todos os dedos, buffers estáticos, alpha/canvas reais da nova arte, nenhum recorte/fade e contagem real de triângulos. A articulação do médio e as pontas dos três dedos são verificadas fora do morph; a versão anterior a esse ajuste deslocava o ponto do médio em aproximadamente 1,82 pixel da imagem. Amostra 41 progressos em quatro instantes: área relativa observada **0,1811–1,6173**, sem inversões. Os limites anteriores não foram relaxados.

Check/build e quatro suítes unitárias aprovados. **13/13 casos de navegador passaram, sem retries, em 3,8 minutos**. Após restringir a influência junto ao médio e adicionar o teste dessa articulação, os **quatro casos da perspectiva foram repetidos e passaram, sem retries, em 1,9 minuto**. As nove regressões dos modos anteriores não usam essa função e já haviam passado. Nenhum teste foi retirado ou teve limites relaxados.

Cobertos: shader sem erro, hover real/retorno/viagem, reduced/off, centro protegido e landmarks em 1920×1080, 1920×951 e 390×844, texturas/opacidade constantes, todas as poses e descarte. Nove posições atuais foram inspecionadas ampliadas, incluindo os meios das passagens. Não confundir aprovação funcional com aceite artístico do usuário.

## Evidências atuais

- [Antes/depois em repouso e apontando](comparison.webp).
- [Nove posições do gesto](poses.webp), sem troca de textura.
- Cena completa: [neutra](1920x1080-neutral.webp), [apontando](1920x1080-pointing.webp), [retorno](1920x1080-returned.webp), [1920×951](1920x951-pointing.webp), [390×844](390x844-pointing.webp).
- [Vídeo de hover, retorno e interrupção](smooth.mp4), capturado do canvas Eco+ 1091×613, sem HUD/vinheta CSS; não mede FPS físico.
- [Métricas reais](metrics.json) e [sequência observada durante a gravação](sequence.json).

## Recursos e arquivos

A/B observado: rig anterior 29 → perspectiva **26 texturas**, mesmo número da rodada anterior. Duas imagens, dois rigs/18 controles, **duas superfícies/11904 triângulos constantes**; antes eram 3552 triângulos. Arrays base 501312 bytes, morphs 319740 bytes, dados dos skeletons 2048 bytes. São contagens/buffers, não RAM/VRAM totais nem FPS do dispositivo. O aumento da malha cobre a suavidade de todos os dedos; a textura nova mantém a mesma resolução.

Código: `first-person-hands-mesh.js`, `hands-image-rig.js`, `hands-perspective-motion.js`. Asset: `public/overlay/right-hand-pointing-smooth.webp`. Testes: `tests/hands-perspective.unit.mjs` e `tests/hands-perspective.spec.js`. Documentação/evidências: `docs/rig-mmv/smooth/`, `CONTINUIDADE.md` e `CONTEXTO_COMPLETO_CUMULATIVO.md`.

Uso: `?quality=eco-plus&hands=mesh&handsMotion=perspective`. Mesmo PR #29. CI remoto do novo commit a conferir após push. Sem main/merge, promoção automática ou melhorias adicionais.
