# CONTEXTO COMPLETO — PROJETO ÓRION · OBSERVATÓRIO 3D

Atualizado em: 17/10/2026
Escopo: **arquivo de contexto cumulativo de toda esta conversa**
Objetivo: permitir retomar o desenvolvimento em outro chat **sem perder histórico, decisões, assets, branches, PRs, testes e próximos passos**.

---

## 1. VISÃO GERAL DO PROJETO

Projeto: **Observatório 3D** do Projeto Órion.

Objetivo visual do módulo principal:
- cena contemplativa espacial;
- Via Láctea / nebulosa como fundo principal;
- estrela/Nox como foco central interativo;
- sensação de primeira pessoa / presença do observador;
- experiência elegante, sutil e performática.

Diretriz recorrente do usuário:
- preservar a estética do Observatório;
- não poluir o centro da composição;
- manter o foco visual na estrela/Nox;
- evitar qualquer coisa com cara de gambiarra, mão torta, dedos deformados ou solução feia.

---

## 2. EVOLUÇÃO DAS MÃOS NO PROJETO

### Fase inicial
O projeto tentou usar mãos 3D/rigadas para criar uma presença em primeira pessoa.

Problemas encontrados:
- modelos feios;
- posições erradas;
- anatomia ruim;
- braços invadindo demais a cena;
- mãos com aparência pouco natural;
- sensação de asset colado / ruim.

### David Fischer — First Person hands rigged
Foi escolhido como principal candidato em uma etapa anterior por ter boa base FPS.

Decisão estratégica anterior:
- usar o modelo do David Fischer como base melhor que os candidatos anteriores;
- manter documentação de licença;
- testar como `hands=fps`.

Problemas práticos depois dos testes:
- deformações visuais ainda insatisfatórias;
- difícil alcançar o visual etéreo/artístico desejado;
- resultado não correspondia ao estilo final aprovado pelo usuário.

### Mudança para 2,5D / overlay / malha
Como o objetivo visual passou a ser mais artístico e menos "mãos FPS realistas", a solução migrou para:
- **composição 2,5D**;
- depois **malha animada** com Two/Three-style plane meshes no pipeline existente;
- assets ilustrativos com transparência;
- movimentos leves controlados.

Isso levou às versões v0.9.18, v0.9.19 e v0.9.20.

---

## 3. LINHA DO TEMPO DAS VERSÕES NESTE CHAT

### v0.9.18
- direção: overlay/2,5D com mãos etéreas;
- objetivo: fugir do 3D feio e manter o estilo aprovado;
- pacote gerado com assets/animação base;
- ainda havia pendência de asset/WebP no repositório.

### v0.9.19
- direção: **malha 2,5D com deformação real de vértices**;
- tecnologia: manter o renderizador da cena e usar malhas subdivididas;
- foco: animar levemente os dedos/regiões com controle de deslocamento;
- branch/prévia de trabalho criada;
- deploy de prévia no Cloudflare e QA com screenshots;
- objetivo: manter o visual, mas dar movimento melhor do que uma imagem rígida.

### v0.9.20
- grande mudança: **separação das duas mãos**;
- mão esquerda e direita passam a ser independentes;
- novos assets femininos translúcidos gerados;
- mão esquerda: enquadrar / moldura;
- mão direita: apontar para a estrela;
- malhas, texturas, opacidade e animações separadas;
- problemas encontrados na primeira publicação:
  - mão direita avançando demais para o centro;
  - mão esquerda pouco presente;
  - composição deixando de parecer "uma mão em cada extremidade".

### Correção conceitual posterior
O usuário redefiniu o comportamento ideal:
- **uma mão em cada extremidade da tela**;
- centro livre;
- mão direita **só deve apontar para a estrela quando houver hover sobre a estrela/Nox**;
- sem hover: mão direita em pose neutra;
- hover: transição suave para pose de apontamento;
- mouse sai da estrela: mão volta suavemente ao neutro.

Essa é a direção correta mais recente.

---

## 4. REPOSITÓRIO, BRANCHES E PRS CITADOS

Repositório principal de trabalho:
- `Kaue-Feltrin/orion-observatorio-3d`

Diretriz importante:
- **não mexer na `main` sem aprovação explícita**;
- trabalhar em branch de prévia;
- usar Cloudflare preview antes de qualquer promoção.

Branches citadas ao longo do chat:
- `preview/fps-hands-david-v0915`
- `preview/ethereal-hands-overlay-v0918`
- `preview/mesh-hands-anim-v0919`
- `preview/independent-feminine-hands-v0920`

PRs citados:
- PR #25 — etapa overlay/2,5D inicial
- PR #26 — malha 2,5D v0.9.19
- PR #27 — mãos femininas independentes v0.9.20

Estado desejado sempre reiterado:
- preview primeiro;
- produção preservada.

---

## 5. DECISÕES VISUAIS CONSOLIDADAS

### O que o usuário aprovou como direção geral
- mãos etéreas / translúcidas;
- azul-violeta / energia cósmica;
- visual bonito, elegante e feminino;
- sem unhas evidentes;
- dedos proporcionais e mais naturais;
- sem deformações bizarras;
- sem parecer mão duplicada;
- uma mão em cada extremidade da tela;
- centro da cena limpo.

### Papel da mão esquerda
- extremidade esquerda;
- gesto sutil;
- mais baixa;
- enquadra a composição;
- não compete com a estrela;
- mais discreta.

### Papel da mão direita
- extremidade direita;
- gesto neutro por padrão;
- quando hover na estrela/Nox: transita para apontamento;
- deve conduzir o olhar sem invadir o centro.

### Regra de composição obrigatória
Se uma das mãos ficar dominante no centro, especialmente a direita, está errado.

---

## 6. REQUISITOS FUNCIONAIS MAIS RECENTES (ATUAIS)

### R1 — Extremidades
Deve haver **uma mão em cada extremidade da tela**.

### R2 — Centro limpo
O centro precisa permanecer livre para a estrela/Nox.

### R3 — Hover contextual
A mão direita **não aponta o tempo todo**.

Ela deve ter dois estados:
- **neutral** (padrão)
- **pointing** (somente quando o mouse passa na estrela/Nox)

### R4 — Transição suave
Ao entrar em hover:
- a mão direita deve transicionar suavemente para apontar.

Ao sair do hover:
- deve voltar suavemente ao neutro.

### R5 — Visual feminino
- mais delicada;
- sem unhas marcadas;
- dedos proporcionais;
- anatomia agradável.

### R6 — Translucidez
- interior translúcido;
- bordas ainda legíveis;
- aparência etérea, não sólida.

### R7 — Performance
- manter-se leve;
- sem quebrar o FPS;
- aproveitar o pipeline já existente.

---

## 7. ASSETS GERADOS / CITADOS NESTE CHAT

### Arte-base anterior aprovada como referência
- `/mnt/data/mãos_etéreas_luminosas_em_moldura.png`

### Assets intermediários gerados ao longo do processo
Vários arquivos de mão foram gerados durante refinamentos sucessivos, inclusive:
- `mão_espectral_de_energia_violeta.png`
- `mão_etérea_azul_violeta_apontando.png`
- `mão_espectral_de_energia_neon.png`
- `mão_espectral_de_energia_azul_violeta.png`
- `mão_etérea_de_energia_luminosa.png`
- `mão_etérea_cósmica_em_azul_e_violeta.png`
- `mão_cósmica_apontando_para_a_luz.png`
- `mão_cósmica_de_energia_luminosa.png`

### Assets preparados para integração (etapa feminina / separada)
Pacote citado e preparado:
- `observatorio_v0920_assets_para_integracao.zip`

Assets preparados:
- `left-hand-ethereal.png`
- `left-hand-ethereal.webp`
- `right-hand-pointing.png`
- `right-hand-pointing.webp`

Observação importante:
- o requisito mais recente pede **também um estado neutro da mão direita**, então o ideal agora é ter:
  - `right-hand-neutral.webp`
  - `right-hand-pointing.webp`

Se não houver ainda o asset neutro, ele precisa ser criado/refinado.

---

## 8. ARQUITETURA TÉCNICA ESCOLHIDA

### Solução vencedora até aqui
**Malha 2,5D com render no pipeline existente**.

Razões:
- mantém o visual da arte melhor do que o rig 3D problemático;
- permite leves deformações e movimentos;
- mais leve que um sistema complexo de rig/armature para esse caso;
- permite controle fino da composição.

### Componentes principais mencionados
Arquivos importantes no projeto:
- `first-person-hands-mesh.js`
- `hands-mesh-motion.js`
- `main.js`
- `tests/hands-mesh.unit.mjs`
- `tests/hands-mesh.spec.js`
- `tests/structure.mjs`

### Estado esperado da arquitetura
- duas mãos independentes;
- duas texturas independentes;
- duas malhas independentes;
- opacidades diferentes;
- posições diferentes;
- comportamentos diferentes;
- estado lógico de hover para a mão direita.

---

## 9. COMPORTAMENTO TÉCNICO ESPERADO DA MÃO DIREITA

### Estado `neutral`
- mão direita na borda direita;
- pose neutra, sem apontar;
- mais contemplativa;
- mantendo a composição lateral.

### Estado `pointing`
- ativado **somente** quando o mouse entra na estrela/Nox;
- indicador aponta para o foco;
- sem cruzar ou dominar o centro;
- permanece ancorada à lateral direita.

### Saída de hover
- quando o mouse sair da estrela;
- blend reverso suave para pose neutra.

### Estado lógico sugerido
Pode existir algo como:
```js
isStarHovered: boolean
```

ou

```js
rightHandMode: 'neutral' | 'pointing'
```

### Implementação visual sugerida
A forma mais limpa é usar **dois assets da mão direita**:
- `right-hand-neutral.webp`
- `right-hand-pointing.webp`

Alternativamente:
- mesma base com blend/interpolação por malha;
- mas visualmente a troca controlada entre duas variantes tende a ficar melhor.

---

## 10. PROBLEMAS REGISTRADOS DURANTE O CHAT

### Problemas de interface / conversa
O chat apresentou vários problemas:
- respostas vazias;
- travamentos;
- lentidão;
- repetições;
- dificuldade de continuidade em conversas muito grandes.

Medida adotada:
- criar **arquivo de contexto a cada resposta relevante**.

### Problemas técnicos do projeto
- mãos 3D feias/anatomicamente ruins;
- deformações exageradas;
- asset único espelhado gerando pouca assimetria;
- posição incorreta da mão direita invadindo o centro;
- mão esquerda visibilidade fraca;
- apontamento constante da mão direita (comportamento incorreto).

---

## 11. TESTES, QA E DEPLOYS CITADOS

### QA e screenshots
Foram citados testes com:
- screenshots em `1755x865`
- screenshots em `1920x951`
- verificação de reduced motion;
- verificação de mãos desligadas (`hands=off`);
- verificação de Nox / navegação.

### Arquivos de capturas citados
- `observatorio_v0920_qa/v0920-feminine-hands-1755x865.png`
- `observatorio_v0920_qa/v0920-feminine-hands-1920x951.png`
- `observatorio_v0920_refinada/v0920-feminine-hands-1755x865.png`
- `observatorio_v0920_refinada_capturas.zip`

### Cloudflare previews citados ao longo do chat
Exemplos mencionados:
- `43db0c92.orion-observatorio-3d.pages.dev`
- `a4d5c80f.orion-observatorio-3d.pages.dev`
- `b4b67383.orion-observatorio-3d.pages.dev`

Esses links serviram como prévias em etapas diferentes. O importante é **não confiar em qualquer uma como final sem validar o comportamento mais recente**.

---

## 12. O QUE O USUÁRIO NÃO QUER

- não quer mão deformada;
- não quer a mesma mão duplicada/espelhada de forma óbvia;
- não quer a mão direita invadindo o centro;
- não quer apontamento permanente;
- não quer soluções feias / improvisadas;
- não quer perder continuidade por causa dos travamentos do chat.

---

## 13. ESTADO CORRETO ATUAL DO ESCOPO

### O que já está conceitualmente definido
1. mãos independentes;
2. uma mão em cada extremidade;
3. centro livre;
4. mão esquerda discreta;
5. mão direita contextual;
6. hover na estrela controla o apontamento;
7. arquivo de contexto deve sempre ser mantido.

### O que falta consolidar na implementação
1. ajustar definitivamente o posicionamento lateral;
2. garantir visibilidade adequada da esquerda;
3. criar/usar **mão direita neutra** como estado padrão;
4. trocar para mão direita apontando **só no hover**;
5. validar transições suaves;
6. reexecutar QA visual e navegação.

---

## 14. PLANO EXATO DA PRÓXIMA ETAPA (RECOMENDADO)

### Etapa A — assets
Garantir estes assets finais:
- `left-hand-ethereal.webp`
- `right-hand-neutral.webp`
- `right-hand-pointing.webp`

### Etapa B — posicionamento
Configurar a composição base:
- esquerda: extremidade esquerda, baixa, sutil;
- direita: extremidade direita, neutra, sem entrar no centro.

### Etapa C — hover state
Implementar:
- `neutral` por padrão;
- `pointing` no hover da estrela/Nox;
- retorno ao neutro ao sair.

### Etapa D — animação
Manter:
- idle suave;
- sway leve;
- transição suave entre estados;
- sem snap.

### Etapa E — QA
Testar:
- composição geral;
- hover na estrela;
- saída do hover;
- Nox clicável;
- screenshots;
- reduced motion;
- desempenho.

---

## 15. CRITÉRIOS DE APROVAÇÃO FINAIS

A versão corrigida só aprova se:
- houver **uma mão em cada extremidade**;
- o centro estiver limpo;
- a mão esquerda estiver visível e equilibrada;
- a mão direita ficar neutra fora do hover;
- a mão direita apontar **somente** no hover da estrela;
- a transição for suave;
- o visual continuar bonito, feminino e translúcido;
- o foco da cena continuar sendo a estrela/Nox.

---

## 16. INSTRUÇÃO PARA O PRÓXIMO CHAT / RETOMADA

Se este projeto for continuado em outro chat, a instrução-base deve ser:

> Continue o desenvolvimento do Observatório 3D a partir do contexto completo deste arquivo. O objetivo atual é corrigir a composição das mãos para que exista uma mão em cada extremidade da tela, mantendo o centro livre. A mão esquerda é sutil e enquadra a cena. A mão direita só aponta para a estrela quando o mouse estiver sobre a estrela/Nox; fora disso, ela permanece em pose neutra na lateral direita. Não mexer na `main` sem aprovação e trabalhar em preview com QA visual.

---

## 17. OBSERVAÇÃO FINAL

Este arquivo foi criado para ser **cumulativo**, reunindo o conteúdo relevante de toda a conversa.

Se continuar em outro chat, este é o arquivo de contexto principal que deve ser enviado primeiro.


---

## 18. COMPLEMENTO — Recomendação de Work / Codex e uso da franquia (17/10/2026)

### Último pedido do usuário
O usuário pediu recomendação sobre continuar o projeto no **modo Work** e qual modelo/força de raciocínio usar para obter qualidade técnica sem consumir todo o limite em um único pedido.

### Recomendação
- **Work · GPT-6.1 Sol · Médio · velocidade Padrão** quando esse modelo estiver disponível.
- Alternativa: **Work · GPT-6 Sol · Médio**.
- **Codex** pode ser mais apropriado para escrever/refatorar código, rodar testes, depurar e trabalhar no repositório GitHub.
- Para tarefas difíceis e pontuais (WebGL e regressões complexas), elevar para **Alto** somente naquela tarefa.
- Modelos **Astra / Pro** são reservados para problemas excepcionais, não para cada alteração cotidiana; Astra pode consumir a franquia mais rápido.
- Não há garantia de número fixo de mensagens/tarefas. Work e Codex compartilham franquia; verificar **Configurações → Uso**, incluindo eventuais limites de cinco horas e semanais.
- Fontes oficiais consultadas:
  - https://help.openai.com/pt-br/articles/20001275-chatgpt-work-and-codex
  - https://help.openai.com/pt-br/articles/20001516-managing-usage-with-gpt-6-astra-in-work-and-codex
  - https://help.openai.com/pt-br/articles/20001354-gpt-6-and-other-models-in-chatgpt

### Como repartir as tarefas
Para evitar solicitações muito longas, cada tarefa deve limitar escopo e conclusão. Exemplo para v0.9.21:
- Reverificar branch exata antes de modificar.
- Alterar apenas posições laterais e gatilho de hover do Nox.
- Testar modo neutro da mão direita sem hover, pointing com hover e retorno após sair.
- Não criar novos assets nem mudar a Via Láctea / Nox / produção fora do escopo.
- Executar QA específico e capturas visuais em 1755×865 e 1920×951.
- Atualizar **este arquivo cumulativo** e parar; não iniciar automaticamente a próxima etapa.

### Estado v0.9.21 ao trocar de chat
- Branch relatada: `preview/star-hover-hands-v0921` no repositório `Kaue-Feltrin/orion-observatorio-3d`.
- Houve criação/preparação local de `right-hand-neutral-v0921.webp`, para que a mão direita fique neutra fora do hover.
- Uma resposta parcial relatou ajustes na branch; **não tratar como evidência definitiva de CI completo, asset publicado ou deploy final** sem verificar os commits, arquivos e status do Cloudflare.
- O usuário quer **uma mão em cada extremidade, centro livre, direita apontando somente ao passar mouse sobre a estrela/Nox, e regressando suavemente à neutralidade ao sair**, sem comprometer a translucidez e o estilo feminino.
- `main` e produção devem permanecer intactas sem aprovação.

### Regra de continuidade
Em **toda resposta relativa ao desenvolvimento do Observatório**, fornecer arquivo Markdown cumulativo atualizado, não apenas resumo da etapa. É recomendável fazer um novo chat Work/Codex a partir deste arquivo e do repositório, em vez de carregar toda a conversa extensa.


---

## 19. COMO MIGRAR O PROJETO PARA CODEX CLOUD — 17/10/2026

### Motivo
O usuário perguntou o que precisa fazer para abrir o projeto Observatório 3D no Codex, após experimentar travamentos neste chat e dúvidas sobre limites de consumo. O contexto cumulativo deve acompanhar a migração.

### Repositório e estado confirmado no GitHub nesta resposta
- **Repositório privado**: `Kaue-Feltrin/orion-observatorio-3d`.
- **Branch existente**: `preview/star-hover-hands-v0921` (verificada por busca de branches na data atual).
- **PR #27**: aberta, branch `preview/independent-feminine-hands-v0920`, último commit confirmado nessa PR `12b32389ca47978b0374471737608e48175675c7`.
- A branch v0.9.21 foi encontrada, mas a publicação e o QA do hover **não foram confirmados** nesta verificação. Não pressupor alteração concluída só com base no histórico do chat.
- Nunca fazer merge na `main` sem aprovação explícita do usuário. Trabalhar com uma nova branch de trabalho se preciso, baseada na v0.9.21, sem apagar commits ou sobrescrever a PR.

### Procedimento Codex Cloud na web
1. Abrir `https://chatgpt.com/codex` e entrar com a mesma conta ChatGPT.
2. Em uma nova tarefa, escolher `Work in > Cloud`, `Select environment > Create environment` (ou Configurações > Codex Cloud > Environments > Create environment).
3. Conectar GitHub quando solicitado e autorizar **somente** o repositório `Kaue-Feltrin/orion-observatorio-3d` conforme as permissões da conta.
4. Selecionar repositório, iniciar a preparação, validar Node.js, npm, Vite e Playwright, revisar configuração e publicar ambiente.
5. Informar diretório de trabalho `orion-observatorio-upload-github-leve`. Comandos básicos são `npm install`, `npm run check`, `npm run build`. Os testes Playwright podem precisar de Chromium; usar os workflows do GitHub se a VM não suportar esse passo.
6. Iniciar tarefa no ambiente publicado; pedir explicitamente para conferir e trabalhar a partir da branch `preview/star-hover-hands-v0921`, sem começar a implementação em `main`.
7. Fornecer este documento ao Codex: anexar se possível; caso a interface não ofereça anexos, inserir o conteúdo no repositório como documentação de contexto e indicar o caminho, ou colar instruções relevantes na primeira tarefa.
8. Solicitar entrega pequena por tarefa, QA focal, commit, e PR para revisão. Verificar deploy de preview pelo Cloudflare Pages após commit. Não criar deploy de produção.

### Primeira tarefa recomendada ao Codex (curta e econômica)
“Leia o contexto do Observatório. Trabalhe somente no repositório `Kaue-Feltrin/orion-observatorio-3d`, partindo da branch `preview/star-hover-hands-v0921`. Antes de editar, identifique o que dessa versão já existe no GitHub. Nesta tarefa, apenas confirme e corrija a lógica de duas mãos nas extremidades, com a mão direita **neutra fora do hover** e **apontando apenas enquanto o mouse está sobre a estrela Nox**, voltando suavemente ao neutro. Não redesenhe assets, não mexa na Via Láctea ou em outros projetos, não faça merge na main e não faça deploy de produção. Rode os testes específicos e, se possível, capture a prévia; registre o commit e entregue um resumo curto dos arquivos alterados. Depois pare.”

### Diretrizes de limite
- Para trabalho rotineiro, preferir modelo disponível de programação com esforço **Médio**; elevar para **Alto** apenas em problemas difíceis de WebGL/integração.
- Work e Codex podem compartilhar franquia ou créditos; conferir Configurações > Uso.
- Cada tarefa em nuvem é isolada. Continuar a mesma tarefa para alterações ainda sem commit; novas tarefas não recuperam alterações não salvas da outra VM. Commitar as mudanças importantes.
- A configuração e recursos do Codex Cloud mudam conforme conta, organização e implantação gradual.

### Referências oficiais verificadas
- https://help.openai.com/pt-br/articles/20001545-using-codex-cloud
- https://developers.openai.com/codex/environments/cloud-environments
- https://help.openai.com/pt-br/articles/11369540-using-codex-with-your-chatgpt-plan

### Regra permanente
Manter a produção da `main` inalterada, não atribuir status de QA sem evidência, preservar código e assets, e disponibilizar um novo arquivo cumulativo de contexto a cada atualização de desenvolvimento.


---

## Etapa atual — abrir Codex no aplicativo Windows (17/10/2026)

O usuário compartilhou uma captura de tela do aplicativo ChatGPT para Windows. A interface exibe no canto superior esquerdo **"ChatGPT ▼"**, e não Codex, portanto a pessoa **ainda está na visualização ChatGPT**. Há uma caixa central com "O que vamos criar?", controles "Escolher projeto", "Este computador", "Acesso completo" e seleção de modelo "GPT-6.1 Sol Alto". Não assumir que essa tela já é o Codex.

### Orientação correta
1. Clicar em **ChatGPT ▼**, no canto superior esquerdo.
2. Escolher **Codex** no menu de visualizações.
3. Só então selecionar o projeto/ambiente: preferir **Codex Cloud** com repositório `Kaue-Feltrin/orion-observatorio-3d`, se o seletor apresentar essa opção. Caso só exista execução local, clonar o repositório para pasta local antes de escolher projeto.
4. No Codex, usar a branch de prévia `preview/star-hover-hands-v0921`, verificar seu estado real, não modificar `main` e escolher raciocínio Médio em tarefas rotineiras.
5. Anexar este arquivo cumulativo, ler e conferir a situação do repositório antes de implementar mudanças. Solicitar uma tarefa curta com commit, testes específicos, resumo e novo checkpoint do contexto.

### Situação técnica a confirmar
A v0.9.21 tem trabalho parcialmente realizado na branch de prévia. Não afirmar que assets neutros, transição hover, QA de navegador ou deploy final estão completos sem verificar no repositório, pois houve interrupções no chat.

Referências oficiais: https://help.openai.com/pt-br/articles/20001275-chatgpt-work-and-codex e https://help.openai.com/pt-br/articles/20001545-using-codex-cloud.


---

## ATUALIZAÇÃO: Codex aberto no aplicativo de Windows (captura mais recente)

Em 17/10/2026, o usuário enviou uma captura confirmando a tela do **Codex** no aplicativo ChatGPT para Windows (e não da visualização ChatGPT). Elementos observados diretamente na captura:
- Seletor superior esquerdo: `Codex`.
- Barra lateral `Projetos`: **Nenhum projeto**.
- Chat novo com a mensagem `O que vamos criar?`.
- Barra do compositor: botão **`Escolher projeto`**, seletor **`Este computador`**, permissões `Acesso completo`, e modelo `GPT-6.1 Sol Alto`.
- Próximo passo orientado: clicar no seletor `Este computador` para descobrir se existe opção `Nuvem/Cloud` habilitada na conta; se houver, escolher a opção de ambiente na nuvem e configurar o repositório `Kaue-Feltrin/orion-observatorio-3d`. Caso não exista Cloud, proceder com repositório local via Git clone e `Escolher projeto` (exige Git e Node e uma pasta local; preferir `Acesso sob aprovação` em vez de `Acesso completo` quando possível). Não presumir que o ambiente Cloud aparece sem verificar.
- O modelo pode ser reduzido de GPT-6.1 Sol Alto para **Médio** quando a tarefa for simples, para equilibrar consumo.
- Não iniciar nenhuma alteração de código enquanto o projeto estiver como `Nenhum projeto`.
- Não mesclar ou publicar na produção (`main`) sem autorização explícita do usuário.

### Fonte oficial sobre ambientes
Help Center: `https://help.openai.com/pt-br/articles/20001545-using-codex-cloud` — ambientes Cloud podem continuar com o PC desligado, depois de criados e publicados no app desktop/web; se o controle Cloud não estiver disponível, conferir plano e workspace.

### Próximo contato
O usuário provavelmente enviará um print do menu que abre em `Este computador`. Orientar com base nas opções efetivamente visíveis e não inventar itens de interface. Manter arquivo de contexto cumulativo de **toda** a conversa a cada resposta de desenvolvimento.


---

# ADENDO CUMULATIVO — CONFIGURAÇÃO COMPLETA DO CODEX (17/10/2026)

## Estado da conversa e pedido atual
O usuário está usando o aplicativo ChatGPT Desktop no Windows, já mudou do perfil ChatGPT para **Codex** e pediu o passo a passo completo para usar o Observatório, sem instruções fragmentadas e sem pedir prints repetidos. Na tela enviada havia: `Nenhum projeto`, `Escolher projeto`, `Este computador`, `GPT-6.1 Sol Alto`, `Acesso completo`.

## Estado do GitHub confirmado nesta consulta
- Repositório privado de trabalho: `Kaue-Feltrin/orion-observatorio-3d`.
- Branch de continuidade **existe**: `preview/star-hover-hands-v0921`.
- PR #27 da versão anterior: `preview/independent-feminine-hands-v0920` aberta, não mesclada em `main`, commit `12b32389ca47978b0374471737608e48175675c7`.
- **Não assumir** que v0.9.21 já está finalizada: Codex deve inspecionar branch, mudanças e assets neutros, verificar hover e testes reais.
- Pasta do projeto web no repo: `orion-observatorio-upload-github-leve`.
- `package.json` nessa branch contém `npm run dev` (Vite local porta 4173), `npm run check`, `npm run build`, `npm run preview` e `npm run test:browser`.
- Dependências: Three.js, Vite, Playwright e sharp; Node `>=20`.

## Rota recomendada: Codex Cloud
1. App Desktop > Codex.
2. Na nova tarefa, onde há `Este computador`, abrir seletor `Work in` > `Cloud / Nuvem` se disponível. Também pode usar `Settings > Codex Cloud > Environments > Create environment`.
3. `Select environment > Create environment`.
4. Conectar/autenticar GitHub se solicitado; permitir acesso especificamente ao repositório `Kaue-Feltrin/orion-observatorio-3d`. Não misturar repositórios `projeto-orion`, `orion-fichas` ou NAVETRAN.
5. `Get started`: deixar Codex detectar e instalar dependências.
6. Orientar setup: entrar em `orion-observatorio-upload-github-leve`, Node >=20, `npm install`, `npm run check`, `npm run build`.
7. Rever setup; publicar **ambiente reutilizável**, não produção do Cloudflare: `Publish`.
8. `Start a new task`; antes de editar, verificar `preview/star-hover-hands-v0921`. Criar nova branch de trabalho derivada, por exemplo `codex/hover-maos-v0921`, se ainda não existir. Não fazer commit nem alterações na `main`.
9. Anexar este arquivo de contexto cumulativo e as referências de arte, se a interface permitir; alternativamente, colocar o Markdown no repositório como documentação por PR separada.
10. Executar primeira tarefa estreita: posicionar mãos nas duas bordas, direita neutra fora do hover, apontar apenas sobre Nox, transição de volta suave; manter a Via Láctea, Nox, UI e produção intactos; testes e screenshots; commit e PR para revisão, sem merge.
11. Conferir testes, mudanças, screenshots e só depois considerar publicação de preview via Cloudflare Pages ligada à branch. Publicação de branch não deve promover para produção.
12. Em tarefas subsequentes, continuar a **mesma conversa/tarefa** para não perder alterações não commitadas. Reutilizar o ambiente publicado.

## Se Cloud não estiver disponível — fluxo local em Windows
Pré-requisitos: Git para Windows, Node.js 20+ e autorização GitHub para clonar o repositório privado.

No PowerShell:
```powershell
git --version
node --version
npm --version
cd "$HOME\Documents"
git clone https://github.com/Kaue-Feltrin/orion-observatorio-3d.git
cd orion-observatorio-3d
git fetch origin
git switch -c codex/hover-maos-v0921 origin/preview/star-hover-hands-v0921
cd orion-observatorio-upload-github-leve
npm install
npm run check
npm run build
npm run dev
```

Se o clone pedir autenticação, usar o gerenciador de credenciais GitHub no navegador; nunca colocar token no prompt do ChatGPT ou no repositório.

Depois do clone, no Desktop Codex > `Escolher projeto` selecionar a pasta raiz `orion-observatorio-3d` (a que contém `.git`) e abrir conversa nesse projeto. Para testar, `http://127.0.0.1:4173` enquanto `npm run dev` estiver rodando no terminal. Para finalizar, revisar alterações, fazer commit/push da branch nova quando autorizado e abrir PR. `git switch -c` pressupõe que a branch local escolhida ainda não existe. Se já existir, usar `git switch codex/hover-maos-v0921` e verificar o estado antes de continuar.

## Seleção do modelo e consumo
- Tela mostrava GPT-6.1 Sol Alto. Recomendar **GPT-6.1 Sol Médio** para tarefas de codificação comuns, se esse nível for selecionável.
- Alto para problemas difíceis e pontuais de shader/WebGL, não todo turno; uma solicitação de escopo pequeno e com critério de parada tende a ser mais controlável que uma revisão geral.
- Ninguém pode garantir consumo exato de limite por tarefa.
- Não usar `Acesso completo` indiscriminadamente quando o modo de aprovação for suficiente, principalmente no modo local.

## Prompt inicial recomendado (para copiar no Codex)

```text
Continue o Projeto Órion · Observatório 3D a partir do repositório
Kaue-Feltrin/orion-observatorio-3d e do contexto completo anexado.

Escopo desta tarefa: finalize somente a v0.9.21.
1. Confira a branch preview/star-hover-hands-v0921 e o estado real dos arquivos.
2. Trabalhe numa branch nova derivada dela, sem alterar a main.
3. Posicione uma mão feminina etérea na extremidade esquerda e outra na extremidade direita; centro livre.
4. A mão direita deve ficar NEUTRA normalmente; APONTAR apenas durante o hover real da estrela/Nox; voltar suavemente ao neutro ao sair. Não adicione apontamento permanente.
5. Preserve assets e demais componentes não mencionados: ESO/Via Láctea, Nox, painel, iluminação e performance.
6. Use o mesmo loop do Three.js, evite bugs e deformações de dedos; reduced motion deve funcionar.
7. Rode npm run check, npm run build e os testes de navegador relevantes (Playwright, se disponível), salve capturas.
8. Informe arquivos alterados, resultados, pendências, commit e link do PR. Não faça merge nem deploy de produção.
9. Atualize o CONTEXTO COMPLETO CUMULATIVO desta conversa ao final.
ENCERRE após concluir esta tarefa; não inicie novas melhorias automaticamente.
```

## Fontes oficiais atuais
- https://help.openai.com/pt-br/articles/20001545-using-codex-cloud
- https://developers.openai.com/codex/environments/cloud-environments (pode redirecionar para ChatGPT Learn)
- https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan
- https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex

## Observação sobre limites de navegador Cloud
O Codex Cloud pode executar comandos e testes automatizados do repositório em seu ambiente, mas as funções de **uso interativo de computador/navegador** do agente não são necessariamente suportadas em todos os ambientes Cloud. Se um teste automatizado Playwright precisar de Chromium ausente, a tarefa deve instalar dependências permitidas ou relatar a limitação sem alegar QA visual realizado.

## Preferência permanente do usuário
Cada resposta sobre desenvolvimento deve entregar **um arquivo Markdown cumulativo contendo todo o contexto principal da conversa** (não apenas mudanças da última etapa), atualizado ao final.


---

# CHECKPOINT CUMULATIVO — v0.9.21 finalizada para revisão (17/10/2026)

Este arquivo preserva integralmente o contexto anexado nesta conversa. As recomendações e estados históricos acima devem ser lidos como histórico; o checkpoint abaixo registra os fatos verificados nesta tarefa.

## Pedido e limite desta etapa

Finalizar exclusivamente as mãos etéreas: uma em cada extremidade, esquerda discreta, direita neutra fora do hover real do Nox, apontamento somente durante esse hover e retorno suave ao sair. Preservar translucidez, anatomia feminina, proporções, centro livre e todo o restante do Observatório. Criar branch derivada da referência, executar check/build/testes, gerar screenshots comparativas, entregar commit/PR e atualizar este contexto. Encerrar sem melhorias adicionais.

## Estado confirmado no GitHub antes de alterar

- Repositório: `Kaue-Feltrin/orion-observatorio-3d`.
- Branch de referência: `preview/star-hover-hands-v0921`.
- HEAD remoto e local conferidos: `2a2c6a06157cc6141d81842f1f8d37dd8c54aaa1`.
- Branch nova criada a partir desse commit: `codex/finalizar-maos-etereas-v0921`.
- Pasta do site: `orion-observatorio-upload-github-leve`.
- Estado inicial rastreado limpo. `node_modules/`, `dist/` e `test-results/` eram saídas locais da preparação, não código novo a enviar.
- A referência já continha `setStarHovered` e um blend, mas a pose neutra usava a imagem esquerda espelhada; o asset neutro citado historicamente não estava no GitHub. Os testes de malha ainda esperavam a pose permanente da v0.9.20.

## Entrega implementada

1. `first-person-hands-mesh.js`: ancoragem em cada borda e no limite inferior, limite horizontal de 28% por plano para preservar o centro em diferentes proporções, esquerda mais discreta e sway reduzido.
2. `public/overlay/right-hand-neutral.webp`: novo asset RGBA 1122×1402, cerca de 104 KiB, produzido com a ferramenta de imagens da OpenAI a partir de `right-hand-pointing.webp`. Indicador relaxado, palma/punho alinhados e material azul-violeta translúcido. Os assets esquerdo e de apontamento anteriores não foram modificados. Não se usa mais a esquerda espelhada como neutra.
3. As poses direitas compartilham geometria e transformação; alpha complementar e blend exponencial suave já existente. Não há novo loop, shader ou renderizador. Dois draws estáveis; três durante o blend; três texturas de mãos. A transparência foi confirmada no canal alpha dos arquivos.
4. `main.js`: Raycaster existente como único gatilho das mãos, sem depender do foco de teclado. Reset em saída da janela, perda de foco, aba oculta e início da viagem.
5. Os testes encontraram uma falha de integração: o update das mãos só ocorria em repouso, impedindo que o fade de viagem fosse executado. A chamada passou a continuar durante a viagem no mesmo loop; o teste confirmou mãos ocultas e hover desligado antes da chegada à ficha.
6. Nenhuma alteração no JPEG ESO, no módulo da viagem, na configuração da câmera, no painel, no bloom ou nos demais componentes. A `main` não recebeu alterações, commits, merge ou deploy desta tarefa.

## Testes e ambiente realmente verificados

- Node instalado: `v24.19.0`; npm `11.9.0`. O `package.json` exige Node ≥20; README/CI recomendam 22. Vite `6.3.5`, Three.js `0.180.0`, Playwright `1.56.1` e sharp `0.34.4`.
- Dependências instaladas sem gerar lockfile (`npm install --package-lock=false --no-audit --no-fund`). Nenhum manifesto ou lockfile foi alterado.
- `npm run check`: aprovado.
- `NODE_USE_ENV_PROXY=1 npm run build`: aprovado, incluindo download e preparação da fotografia original da ESO e recortes. O acesso inicial a `cdn.eso.org` foi negado pelo proxy com HTTP 403; o domínio foi registrado no rascunho do ambiente e o acesso voltou a responder HTTP 200. TLS e integridade dos pacotes foram mantidos.
- O aviso do Vite para chunk acima de 500 KiB permanece; não se alterou empacotamento fora do escopo.
- `node tests/hands-mesh.unit.mjs`: aprovado, deformação limitada e movimento reduzido.
- `node tests/hands-hover.unit.mjs`: aprovado, estado neutro inicial sem flash, entrada/retorno suaves, evolução equivalente em 30/60 Hz, viagem, descarte único da geometria compartilhada, reduced-motion e off.
- Testes relevantes no Chromium do sistema, usando `npm run preview` sobre o build atual: **8/8 aprovados, sem retries, em aproximadamente 1,3 minuto**. A primeira tentativa de teste revelou a integração do fade; depois da correção, a seleção completa foi repetida com sucesso.
- Cobertura dos 4 testes específicos: limites projetados nas bordas; neutra própria; hover real e retorno; visibilidade das poses; transparência; resize em 1755×865, 1920×951 e 390×844; janela/blur/aba; teclado; `hands=off`; movimento reduzido; ocultação das mãos antes da ficha.
- Cobertura das 4 regressões selecionadas: inicialização WebGL sem erros, clique/navegação à ficha, movimento da câmera/paralaxe e seleção via Raycaster do Nox.
- Não foi executada a suíte histórica completa; não há medição de FPS/p95/RAM no hardware do usuário. Chromium/SwiftShader é evidência funcional e visual automatizada, não aceite artístico do usuário.

## Evidências e documentação

- `docs/qa/v0921/README.md`: protocolo, referências oficiais Three.js r180 (sprites e blending), resultados e comparação visual em duas resoluções.
- `docs/qa/v0921/*.webp`: 8 capturas comparativas (antes/depois, neutro/hover, 1755×865 e 1920×951). WebP de documentação qualidade 82, sem redimensionar; PNGs originais preservados nos artefatos da tarefa.
- A comparação anterior foi obtida servindo o módulo de mãos do commit base com imports locais adaptados na mesma cena. A fotografia ESO foi confirmada carregada em todas as capturas finais. A fase da cena animada pode variar, portanto não se alega igualdade pixel a pixel.
- A execução final também produziu PNGs de neutro/hover/retorno em 390×844 e relatório Playwright em `/workspace/.cache/orion/playwright-report`.
- `public/overlay/README.md` atualizado com a procedência e uso dos assets; `CONTINUIDADE.md` atualizado com esta etapa.

## Entrega Git e revisão

- Branch de trabalho: `codex/finalizar-maos-etereas-v0921`.
- Destino do PR: `preview/star-hover-hands-v0921`, sem promoção para `main`.
- Commit de implementação e evidências: `86f251f` (`fix(hands): finalize ethereal edge framing and Nox hover poses`). O fechamento documental fica no commit subsequente desta mesma branch; consulte o HEAD do PR para o hash final.
- PR criado e confirmado: [#28 — v0.9.21: finalizar mãos etéreas nas bordas e hover do Nox](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/28), em draft, destino `preview/star-hover-hands-v0921`. Nenhum merge realizado.
- Publicação do ambiente reutilizável, criação de um PR e deploy do Cloudflare são operações diferentes. Não foi feito merge nem deploy manual de produção.
- A aprovação visual do usuário e eventuais medições no seu dispositivo continuam pendentes. A entrega encerra esta etapa; qualquer evolução adicional depende de novo pedido.


---

## Ajuste de proporção e consulta sobre rig/MMV — 17/10/2026

### Direção visual nova do usuário

O usuário enviou referência 1920×1080 e determinou usar aquela proporção: mãos maiores nos cantos inferiores, esquerda com a silhueta começando perto de 56% da altura, direita perto de 52%, com punhos/antebraços cortados pelas bordas e centro livre. Pediu também saber se é possível animar as imagens com rig, mencionando “MMV”.

- Código mantido na mesma branch de trabalho do PR #28, sem alterar main.
- Enquadramento ajustado em `first-person-hands-mesh.js`: altura do plano esquerdo 56,5%, direito 66%, ancoragem inferior/lateral revista, cap de largura 30%. A margem transparente dos sprites faz a silhueta visível corresponder à referência. Nenhuma imagem foi esticada em um único eixo ou redesenhada nesta revisão.
- Opacidade, materiais, assets e lógica neutro/hover/retorno preservados. Centro protegido entre 30% e 70% da largura pelos testes de projeção.
- Screenshot de produção 1920×1080 inspecionada em neutro, hover e retorno; imagens em `docs/qa/v0921/proporcao-1920x1080-*.webp` e PNGs originais nos artefatos da tarefa.

### Resultado do CI anterior e correção dos testes

O CI `39049543751` do commit `222cbc9` terminou com 72 testes aprovados e 1 falha: o teste que reunia pointerleave, blur e visibilitychange excedeu o orçamento total de 25 segundos no runner. Os valores registrados ainda convergiam para o neutro; a falha foi de tempo global ao acumular os três casos.

Os eventos foram separados em testes independentes, cada um com timeout de 45 segundos e as mesmas verificações. Não foram removidas assertions nem desabilitados testes. Acrescentada a janela 1920×1080 e nomes de captura com largura e altura, evitando colisão com 1920×951.

Validação desta revisão: `npm run check`, build completo com a fotografia ESO original, as duas suítes unitárias e **10/10 testes de navegador sobre o build de produção, sem retries, em 1,7 minuto**, aprovados. Novo CI remoto será disparado com o push; seu resultado não deve ser presumido antes de concluir.

O acesso a preview/logs foi restabelecido. O asset neutro da prévia anterior respondeu HTTP 200 e seu SHA-256 coincidiu com o arquivo local. Isso verifica a prévia antiga, não comprova que o deploy da revisão de proporção já terminou.

### Animação de imagem com rig

É tecnicamente viável manter as imagens em malhas 2D/2,5D e usar ossos/controles para punho, palma e dedos no próprio Three.js, sem outro renderizador. O módulo atual possui deformação suave por campos de influência, não um esqueleto articulado completo.

Recomendação técnica: usar rig com amplitudes pequenas para repouso, pulso e flexão sutil dos dedos, mantendo inicialmente os assets neutro/apontando alinhados para a mudança de gesto. Grandes dobras ou mudanças de perspectiva exigem separar partes em camadas e preparar áreas ocultas; uma única imagem não contém essas partes. Não prometer articulação 3D completa sem essa preparação.

Consultado o exemplo oficial Three.js r180 `webgl_animation_skinning_morph.html` e a implementação de `SkinnedMesh` já instalada. Não foi incorporada uma biblioteca externa nem implementado um novo rig nesta revisão. O usuário confirmou que se refere a dar vida a imagens estáticas, como nos mangás animados/MMVs, sem indicar um programa específico. Essa confirmação orienta a recomendação de rig 2,5D leve; o novo rig ainda não foi implementado.

### O que depende do usuário

- Conferir a captura de proporção atualizada e dizer se o tamanho/enquadramento corresponde à referência.
- MMV já esclarecido pelo usuário: animação de imagem estática no estilo de mangá animado. Não repetir essa pergunta.
- Não há configuração de rede adicional pendente nesta consulta. Não foi feito merge; main e produção permanecem preservadas.


---

## Proporção aprovada e correção do acabamento inferior — 17/10/2026

O usuário aprovou expressamente a proporção: “essa proporção ta boa”, mas identificou um vazamento/contorno visível na parte inferior direita da mão. Essa aprovação se refere à proporção, não autoriza merge ou produção.

- Escalas, ancoragens e assets aprovados mantidos exatamente como no commit `0d09c27`.
- Causa: o desenho do antebraço termina antes da borda da textura. A máscara alpha anterior só chegava a zero no extremo do sprite, deixando visível o fim da arte no interior da tela.
- Correção em `first-person-hands-mesh.js`: ampliada a dissolução suave somente no canto do antebraço, atingindo alpha zero antes do término da imagem. A geometria compartilhada aplica o acabamento às poses neutra e apontando. Palma e dedos mantêm os pesos alpha originais; não se alterou a opacidade base.
- `tests/hands-hover.unit.mjs` agora exige transparência completa na região do corte e preservação do alpha da região superior. Mesma malha, sem shader ou loop novo.
- Check, build completo ESO e duas suítes unitárias aprovados. Validação de navegador desta revisão registrada após a conclusão abaixo.
- Capturas de produção 1920×1080: `docs/qa/v0921/acabamento-1920x1080-neutral.webp` e `acabamento-1920x1080-hover.webp`; PNGs originais em `/workspace/orion-evidence/acabamento/`.
- Mesma branch e PR #28; main preservada. O rig/MMV permanece como possibilidade técnica já discutida, sem implementação nesta correção.
- O que depende do usuário: conferir somente o acabamento inferior na nova captura. Não é necessário repetir a aprovação da proporção nem configurar rede.

Resultado final desta correção: 10/10 testes Playwright sobre o build de produção aprovados, sem retries, em 1,7 minuto, além de check/build e das duas suítes unitárias. CI remoto da revisão depende da execução após o push.
