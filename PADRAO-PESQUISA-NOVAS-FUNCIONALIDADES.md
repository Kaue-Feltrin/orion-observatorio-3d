# Projeto Órion — Padrão obrigatório para novas funcionalidades

**Instrução do responsável pelo projeto (16/10/2026):**
> Sempre que formos colocar coisas novas no sistema, pesquisar sistemas parecidos que já funcionam.

Essa é uma exigência de trabalho para o Observatório nas próximas etapas, não apenas para o atual modelo de mãos. **Não começar diretamente por uma implementação inventada.** Pesquisar, testar e comparar soluções existentes, então adaptar.

## Processo antes de codificar

1. **Identificar o problema real:** partir da captura/diagnóstico do usuário; descrever o que está errado e qual é o resultado observável esperado. Nunca presumir que um teste de sintaxe aprova um resultado visual.
2. **Pesquisar pelo menos duas implementações comprovadamente funcionais** no mesmo domínio. Dar preferência a documentação oficial, código aberto de aplicações em uso, repositórios com exemplos verificáveis, demonstrações visíveis e material técnico do motor empregado. Informar claramente se é um tutorial, um protótipo ou um sistema de produção.
3. **Comparar os padrões técnicos** (câmera, coordenadas, FOV, enquadramento, ciclo de animação, rig/retarget, renderização, desempenho) e **as limitações**. Não copiar números fora de seu contexto nem assumir que um modelo GLB na pose de importação está pronto para o enquadramento do Observatório.
4. **Auditar licença e procedência de qualquer asset**. Separar estética (direção de arte) de licença, rig disponível, animações, formato, tamanho e disponibilidade de download. Evitar assets de terceiro extraídos de jogos.
5. **Criar plano curto com testes e orçamento** antes da implementação: resultado visual, área protegida do Nox, comparação A/B, movimento reduzido, FPS/p95 e custo de RAM/VRAM **observável**, não inferido.
6. **Implementar numa branch de prévia**, mantendo a produção `main` inalterada, sem merges sem autorização explícita; preservar alternativas antigas.
7. **Validar visualmente com capturas reais no viewport do usuário** e com testes automatizados de posição, além do CI funcional. Para componentes com rig, medir **projeção dos ossos relevantes** (punho, palma, dedos), não só o bounding box da malha ou quantidade de ossos.
8. **Apresentar ao usuário pesquisa, prévia e limitações honestas**, solicitar aprovação visual e métricas reais antes de encerrar. Se o resultado estiver feio ou errado, não o declarar pronto por ter CI verde.
9. **Registrar decisões, fontes, evidências e próximos passos** em `CONTINUIDADE.md` e issue #10.

## Referências iniciais comprovadas para mãos de primeira pessoa

- **IRONLINE / 3d-fps (Three.js)**: https://github.com/cktang88/3d-fps e [FP_FRAMING.md](https://github.com/cktang88/3d-fps/blob/main/docs/FP_FRAMING.md) — projeto web funcional que especifica viewmodel camera independente (vFOV 52°), proporções reais e áreas medidas em screenshots; teste de enquadramento por classe, animação e rig feito em Blender. **Exemplo técnico de funcionamento**, não licença automática para copiar o código ou os modelos.
- **s&box Field Guide / first-person viewmodel**: https://sboxguide.dev/guides/first-person-viewmodel — separação entre vista do mundo e viewmodel preso à câmera, offset local e exclusão da visão de terceiros. Adaptar conceitos, não APIs específicas do motor.
- **Three.js GLTFLoader/SkinnedMesh**: https://threejs.org/docs/#examples/en/loaders/GLTFLoader e https://threejs.org/docs/#api/en/objects/SkinnedMesh — transferência correta da hierarquia de ossos e animação.
- **WRAD ARMS / wriks**: https://github.com/wwwriks/wrad-arms — asset CC0 válido e barato com rig, mas **estética explicitamente retro/PS1**. Isso é tecnicamente compatível, mas incompatível com o acabamento cinematográfico pretendido. Não escolher como arte final só por ter 50 ossos.
- **Rigged FPS Arms / RafaP**: https://sketchfab.com/3d-models/rigged-fps-arms-6b1cde4746774b7893513f84cac7a866 — alternativa CC BY 4.0, 4,8k triângulos e rig, exige baixar/verificar arquivo e atribuição; não incorporar sem verificar a procedência efetiva e captura.

## Caso v0.9.13 — o que deu errado

Captura enviada em 16/10/2026: apenas **dois antebraços rosa enormes em diagonal**, sem mãos legíveis. Causa de processo: o asset foi posicionado a partir do **bounding box do modelo inteiro**, sem calibrar orientação, punhos/palmas/dedos e visibilidade no quadro. Os testes validavam importação/ossos/FPS funcional, **não enquadramento**. A versão foi tecnicamente funcional, mas visualmente reprovada.

**Padrão de correção:** comparar com um FPS funcional, medir a projeção real de punhos e falanges, orientar a pose em câmera local, mover antebraços para abaixo do quadro, garantir as mãos visíveis na área inferior (alvo inicial: palmas em ~75–88% da altura da tela; punhos na borda inferior; centro/Nox livre). **Não trocar tudo por um shader ou aumentar a escala sem diagnóstico.**

Critério de entrega: a composição deve ser legível e equilibrada na janela de referência **1920×951**, além de 1748×864 e mobile; Nox clicável; 60 FPS é meta a medir, não alegação sem teste.

## O que não fazer

- Escolher modelos pelo número de ossos e chamar isso de qualidade visual.
- Usar câmera, pose ou escala de outro motor sem converter unidades e eixos.
- Ajustar enquadramento apenas por tentativa cega, sem captura nem landmarks.
- Aprovar um objeto porque `npm run build` ou `Playwright` terminou verde.
- Alterar a foto ESO, quantidade de estrelas ou qualidade padrão para mascarar erro de viewmodel.
