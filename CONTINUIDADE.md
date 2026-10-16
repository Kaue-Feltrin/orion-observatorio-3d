# Continuidade do Observatório 3D

Este é o ponto de entrada do desenvolvimento quando o histórico do chat do ChatGPT ficar grande ou for necessário abrir uma conversa nova.

**Fonte de verdade:** o código e o histórico dos PRs do GitHub. Para decisões criativas, problemas e próximos passos, consultar a [issue permanente #10](https://github.com/Kaue-Feltrin/orion-observatorio-3d/issues/10). **Não presumir que este arquivo ou o chat substitui a inspeção do repositório.**


## Próxima prévia — v0.9.9 Primeiro plano de nebulosa (16/10/2026)

- [PR #16 draft](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/16) na branch `preview/veu-proximo-v099`, base `preview/paralaxe-responsiva-v098`; `main`/produção não alterada.
- O usuário aprovou a maior responsividade da v0.9.8, mas sente falta de planos ainda mais próximos. Perguntou se futuras **mãos** resolveriam a profundidade. Diretriz: mãos ajudam presença e escala, porém a profundidade da nebulosa requer um primeiro plano independente; NÃO criar mãos especulativas nesta fase.
- V0.9.9: recorte `03` já disponível da própria ESO, posicionado em Z=-75 com opacidade 0,38× original, passa a compor o Eco+ junto de `02` em -342 e `04` em -185; transparência ordenada por Z, redimensionamento reprojeta a foto original.
- Comparação: `?debug=1&quality=eco-plus` (3 recortes) e `?debug=1&quality=eco-plus&foreground=off` (2 recortes v0.9.8). Mantém bloom aprovado, 0 gás GLSL, espaçamento vazio, 146 estrelas e Nox. Custo adicional possível de **1 draw call e 1 textura carregada**. Não assumir 60 FPS desta revisão.
- Próximo: validar CI, deploy, conferir screenshot e pedir percepção visual e FPS/p95 do usuário. Sem merge para produção sem aprovação.

## Próxima prévia — v0.9.8 Paralaxe Responsiva (16/10/2026)

- Após testar a v0.9.7, usuário relatou **“ainda tme pouco movimento responsivo”**. Criado [PR #15 (draft)](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/15), branch `preview/paralaxe-responsiva-v098`, base `preview/profundidade-organica-v097`. **Produção main preservada**.
- Correção de causa concreta: v0.9.7 usava câmera já suavizada (`smooth.x`) e mais um filtro lento de 4,2/s nos planos. V0.9.8 usa alvo direto do mouse, filtro rápido 14/s (~70ms) e amplitudes 3× maiores (central 5,2, próximo 16,5 unidades X; Y 2,1/6,2).
- Slider no debug `Paralaxe da nebulosa` (0,45× a 1,60×), valor de controle no relatório; `?depthMotion=off` continua disponível para A/B.
- Mesmos 2 recortes ESO em profundidade, zero camadas GLSL de gás no Eco+, bloom do Nox mantido. Zero novos shaders/texturas/meshes/draw calls. O panorama ESO, 146 estrelas e `star-journey.js` não foram modificados.
- Próximo passo: CI, deploy prévia, feedback de movimento lateral/vertical, FPS/p95 no PC. A referência real de 60 FPS é **v0.9.6** e não comprova desempenho da v0.9.8. PR segue draft, sem merge.

## Nova prévia — v0.9.7 Profundidade Orgânica (16/10/2026)

- PR #14 (draft): https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/14, branch `preview/profundidade-organica-v097`, base `preview/eco-plus-v096`; **não mesclado com produção**.
- Base aprovada: Eco+ com bloom do Nox; usuário gostou do brilho mais forte. Eco+ com e sem bloom foram ambos 60 FPS, p95 16,8ms (16/10, janela 1920×951). A aprovação foi para **manter o brilho**, não para produção.
- V0.9.7: *sem novos passes/texturas/objetos*; dois recortes da fotografia ESO já existentes em planos z=-342 e -185 têm resposta inercial suave ao movimento da câmera, com leve respiração de escala abaixo de 0,4%, sem alterar a foto ESO, as estrelas ou o Nox.
- Comparação A/B: `?debug=1&quality=eco-plus` versus `?debug=1&quality=eco-plus&depthMotion=off`. Respeita preferência de movimento reduzido. Registrar percepção de profundidade e FPS/p95 reais antes de aprovar.
- Próximos passos: validar CI, abrir prévia, testar na GPU real, confirmar viagem para a ficha, documentar resposta visual. PR continua draft, produção intacta.

## Nova prévia — v0.9.6 Eco+ com bloom (15/10/2026)

- PR #13: https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/13, branch `preview/eco-plus-v096`, base `preview/eco-diagnostico-v095`, **draft, sem merge**.
- Medição real em 1920×951: Lite 20 FPS/p95 72,2 ms/100% frames >33ms; Lite sem bloom 17 FPS/72,3 ms/96%; Lite sem gás 23 FPS/50,1 ms/60%; Eco 33 FPS/38,9 ms/29%.
- Interpretação: tirar bloom sozinho não melhorou; remover gás trouxe melhoria; Eco trouxe ganho total de 65% vs Lite, mas é impossível isolar a contribuição de menos pixels no teste anterior. Não afirmar causalidade exclusiva de GPU.
- Eco+ é **experimento de equilíbrio**: DPR máximo .60, 670k pixels, 2 recortes ESO em Z, sem gás procedural, bloom de repouso mantido e efeitos de viagem preservados. Variante Eco+ sem bloom isola o custo desse efeito com DPR igual.
- Painel permite comparar Lite, Lite sem gás, Eco+ com/sem bloom e Eco; com qualidade manual, desabilitar adaptação automática para comparações. Perfil automático pode cair em etapas Lite → Eco+ → Eco.
- **Pendente:** CI, observar foto ESO e Nox no PC do usuário e obter novas medidas em Eco+ com e sem bloom. Não enviar produção sem aprovação.

## Nova prévia — v0.9.5 Eco + comparação A/B (15/10/2026)

- **PR #12 (draft):** https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/12
- **Branch:** `preview/eco-diagnostico-v095` baseada em v0.9.4, sem merge na produção ou na branch v0.9.3.
- **Evidência real no PC:** 14 FPS no perfil Lite, p95 105,5–111,1 ms, quadros acima de 33ms 100%, DPR .72, 25 draw calls, 20 texturas, defasagem interna mouse/câmera .2–.4 px; heap JS 9 MB **não** é RAM total.
- **Tese a testar, NÃO conclusão:** custo de fragment shader/bloom/resolução do render principal pode estar limitando FPS. Comparar Lite, Lite sem bloom, Lite sem GLSL e Eco para distinguir causas.
- **Modo Eco:** limite de 500k pixels, 2 recortes reais da ESO em profundidade, nenhum shader GLSL de gás em repouso, sem passes de bloom em repouso; **bloom e viagem preservados durante o clique**. Modo automático pode degradar Lite→Eco; opção manual fica estável para testes.
- **Próximo passo:** validar CI e abrir os quatro comparativos `?debug=1`. Colher números reais do usuário e verificar nitidez/profundidade do Eco antes de alterar padrão ou mesclar.
- **Preservados:** ESO, Nox, raios, Raycaster, estrela, `star-journey.js`, ficha, cenário sem estrelas extras.

## Continuação em andamento — v0.9.4 (15/10/2026)

- **PR #11 (draft):** https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/11
- **Branch:** `preview/diagnostico-fluidez-v094`, partindo da `preview/nebulosa-volume-fluidez-v093` (PR #9), **sem merge ou alterações na `main`**.
- **Objetivo:** diagnóstico no hardware real antes de ajustar novamente parallax, iluminação ou qualidade adaptativa.
- **Entrega:** `performance-panel.js` — painel de FPS/p95/quadros longos/camadas/draw calls/texturas e defasagem interna do mouse, habilitado exclusivamente em `?debug=1`, com cópia do relatório. RAM total **não** medida pelo JavaScript.
- **Próximo passo:** conferir pipeline do PR #11, abrir prévia, coletar diagnóstico no computador do usuário, confirmar fluidez e volume visual. Não aprovar a estética apenas pelo CI.
- Documentação mais completa no README do projeto e na issue #10.

## Estado registrado — 15/10/2026
- Repositório: https://github.com/Kaue-Feltrin/orion-observatorio-3d
- Versão em avaliação: **v0.9.3 — Nebulosa em Volume + Fluidez**, [PR #9](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/9).
- Branch de trabalho: `preview/nebulosa-volume-fluidez-v093`.
- Base do PR #9: `preview/foco-nox-foto-original-v092d`.
- Ao registrar este estado, o PR estava **aberto e em draft, sem merge**.
- Aplicação Vite + Three.js no diretório `orion-observatorio-upload-github-leve/`.
- Verificação funcional: `npm run check`, `npm run build`, `npm run test:browser` com Playwright/Chromium.
- **O visual e a performance da v0.9.3 ainda precisam de aprovação do usuário em seu computador.**

## Decisões imutáveis sem aprovação explícita
1. O **Nox** é o foco visual; preservar a estrela, seus raios luminosos giratórios e a seleção por clique/teclado.
2. Preservar o **JPEG fotográfico ESO/S. Brunier**, sua nitidez e seus créditos. Não remover estrelas da própria foto. A tentativa da v0.9.2c foi rejeitada.
3. Estética espacial cinematográfica **vazia e contida**: pouco ruído, poucas estrelas extras, pouca névoa decorativa e bloom discreto.
4. Manter a animação de viagem em `star-journey.js`, Raycaster, caminho da ficha e acessibilidade, salvo pedido expresso.
5. Desempenho é um requisito: o usuário já relatou quase 4 GB de RAM e atraso no seguimento do mouse em versões anteriores. Testes automatizados **não** equivalem a medições de RAM/FPS no hardware dele.
6. **Nunca fazer merge ou deploy de produção sem autorização explícita do usuário.** Trabalhar em prévias e evitar mexer na `main` durante avaliações.

## O que a v0.9.3 pretende entregar
- Foto ESO original preservada.
- Quatro recortes fotográficos orgânicos transparentes da nebulosa, em profundidades z=-425, -342, -252 e -185, com movimentos diferentes e um véu frontal sutil.
- Dois/três/quatro recortes carregados conforme qualidade lite/equilibrada/alta.
- Câmera com resposta ao mouse mais rápida (~55ms em vez de ~140ms), menos trabalho desnecessário no DOM, bloom em cadência reduzida no repouso e até 60FPS no modo leve **quando o dispositivo suportar**.
- Manutenção da viagem e estrela, sem poluir o cenário com partículas adicionais.

## Próximo passo obrigatório
Avaliar a v0.9.3: profundidade perceptível da nebulosa versus aparência de imagem plana, fluidez do mouse, RAM/FPS no dispositivo do usuário, integridade do Nox, fotografia ESO e viagem. Ajustar **somente na branch de prévia** conforme feedback. Não declarar aprovação visual ou desempenho real sem verificação.

## Protocolo de cada versão
1. **Antes de editar:** consultar issue #10, PR mais recente, branch/base, arquivos envolvidos e testes. Verificar se o estado registrado continua atual.
2. **Implementar:** usar branch de prévia, alterações pequenas e reversíveis; não reintroduzir abordagens já rejeitadas.
3. **Validar:** registrar precisamente quais checks/build/testes passaram; separar testes de navegador de avaliação visual e medições no PC do usuário.
4. **Entregar:** informar links diretos, diferença para a versão anterior, o que foi preservado e o que ainda precisa de avaliação.
5. **Registrar antes de encerrar:** atualizar a issue #10 com versão, branch/PR, commits relevantes, mudanças, testes **de fato executados**, decisões rejeitadas, pendências e próximo passo. Manter o resumo atual em destaque e as versões anteriores em histórico cronológico.
6. **Só aprovar/mesclar:** após feedback expresso do usuário. Nunca converter automaticamente um check verde em aprovação estética.

### Mini-modelo de atualização da issue #10
```md
## [data] — vX.Y.Z — [em desenvolvimento / em avaliação / aprovada]
- PR/branch:
- Objetivo:
- Alterações implementadas:
- Itens preservados:
- Testes executados e resultados:
- Validação visual/FPS/RAM no PC do usuário: [não realizada / resultados]
- Feedback e abordagens rejeitadas:
- Pendências/bloqueios:
- Próxima ação:
- Produção: [preservada / merge autorizado em ...]
```

## Comando para iniciar outro chat
> Continue o Projeto Órion — Observatório 3D. Abra a issue #10, o arquivo CONTINUIDADE.md e o PR mais recente no repositório Kaue-Feltrin/orion-observatorio-3d. Confira o estado real, preserve ESO/Nox/viagem e trabalhe na branch de prévia. Atualize o registro ao terminar cada versão. Não mexa na produção sem minha autorização.

**Privacidade:** nunca gravar tokens, senhas, dados privados ou segredos em issues/PRs públicos.

**Limite importante:** o GitHub não captura automaticamente todo o histórico do chat. O protocolo precisa ser seguido a cada rodada de desenvolvimento; não há garantia de atualizações por conversas futuras sem executar essa etapa.
