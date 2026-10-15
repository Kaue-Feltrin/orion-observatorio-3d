# Continuidade do Observatório 3D

Este é o ponto de entrada do desenvolvimento quando o histórico do chat do ChatGPT ficar grande ou for necessário abrir uma conversa nova.

**Fonte de verdade:** o código e o histórico dos PRs do GitHub. Para decisões criativas, problemas e próximos passos, consultar a [issue permanente #10](https://github.com/Kaue-Feltrin/orion-observatorio-3d/issues/10). **Não presumir que este arquivo ou o chat substitui a inspeção do repositório.**

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
