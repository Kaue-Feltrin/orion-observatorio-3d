# Ponta do indicador sem compressão

Feedback sobre `0fd3f62`: ponta achatada/com aspecto quebrado no repouso. Base GitHub conferida antes de alterar (Cloudflare aprovado; CI geral ainda em execução). Mesma branch `codex/maos-rig-mmv`, PR #29; sem main/merge.

## Causa e correção localizada

O contorno de repouso reaproveitava a espessura fina da antiga ponta na coluna x=150. Na imagem atual, a ponta começa perto de x=100 e x=150 já pertence à falange distal: ali a arte tem 69 pixels de espessura, mas o morph a reduzia para 22, aproximadamente **32%**. Isso produzia o bico fino visto na captura do usuário.

As bordas inferiores do contorno foram recalibradas para preservar a espessura real da arte atual nas colunas da ponta/falange. O arco relaxado foi ajustado localmente para acomodar essa espessura sem comprimir excessivamente a malha abaixo do indicador. Apontamento final, imagem, demais dedos, raiz/palma, transparência, proporção, máscara inferior, câmera/cena e recursos permanecem.

Nenhum asset foi redesenhado. Mudança de aplicação apenas em `hands-perspective-motion.js`. Nova regressão em `tests/hands-perspective.unit.mjs` lê o alpha real do WebP nas colunas x=100,150,180,220 e exige entre 90–110% da espessura durante todos os cinco estágios. Na falange x=150, a razão agora é **100%**, antes 32%. Mantidos os testes de tangente contínua, base/médio/pontas dos outros dedos ancorados e ausência de inversão, sem relaxar limites.

A unidade percorre 41 progressos em quatro instantes: área relativa observada **0,1141–1,7117**, sem inversões. Check/build, quatro suítes unitárias e **4/4 casos de navegador da perspectiva aprovados, sem retries, em 1,8 minuto**. Nove posições atuais e a comparação antes/depois foram inspecionadas ampliadas. As regressões dos outros modos já haviam passado na etapa anterior e não usam o contorno alterado. Continua uma imagem deformada em 2,5D, sem recortes ou crossfade.

## Evidências e arquivos

- [Antes/depois da ponta no repouso](comparison.webp); apontamento final preservado.
- [Nove posições do gesto](poses.webp).
- Cena completa: [neutra](1920x1080-neutral.webp), [apontando](1920x1080-pointing.webp), [retorno](1920x1080-returned.webp), [1920×951](1920x951-pointing.webp), [390×844](390x844-pointing.webp).
- [Métricas atuais](metrics.json): mesma quantidade de recursos — 26 texturas, duas imagens, 18 controles, duas superfícies e 11904 triângulos. Sem novos downloads de imagem ou subdivisões.

Código: `hands-perspective-motion.js`. Teste: `tests/hands-perspective.unit.mjs`. Documentação e contexto atualizados; nenhum asset alterado. Mesma opção `?quality=eco-plus&hands=mesh&handsMotion=perspective`. CI remoto da rodada a conferir após push; não mesclar main, promover a padrão ou iniciar melhorias adicionais.
