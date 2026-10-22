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


---

## Protótipo MMV/rig 2,5D autorizado — 17/10/2026

### Pedido e ponto de partida

Após pedir “continue”, o usuário confirmou explicitamente: **“Avançar para animação MMV/rig 2,5D”**. O estilo MMV significa animar imagens estáticas, como nos mangás animados. A proporção e o enquadramento já foram aprovados; não repetir essa aprovação nem redesenhar os assets.

Antes de iniciar, foram conferidos o HEAD remoto `8811a40dc347e13e46dd075fbc9bbd13dcd0c25e`, o PR #28 e seus checks: **CI completo e Cloudflare Pages aprovados** para o acabamento da v0.9.21. Branch nova criada a partir desse commit: `codex/maos-rig-mmv`. O PR desta etapa tem como base `codex/finalizar-maos-etereas-v0921`, mantendo separadas a entrega aprovada e a experiência de rig. Main permanece preservada.

### Pesquisa e escolha

- Exemplo oficial Three.js r180 `docs/api/en/objects/SkinnedMesh.html`: índices/pesos, Bone, Skeleton e bind aplicáveis a uma malha plana texturizada. MIT, dependência já presente.
- Exemplo oficial Spine 4.2 `spine-ts/spine-webgl/example/index.html` e licença dos runtimes: referência funcional de animação 2D por esqueleto/attachments; demanda runtime/autoria/licença específicos. Nenhum código, runtime ou asset Spine foi incorporado.
- Escolha: skinning nativo do Three.js no mesmo renderizador/câmera/loop, com amplitudes pequenas. Não tentar inventar partes ocultas ou fechar completamente os dedos de uma imagem única.

### Implementação do protótipo

- Ativação por `?hands=mesh&handsMotion=rig` (opcional, para revisão). Sem `handsMotion=rig`, permanece a deformação anterior das mãos aprovadas. `quality=eco-plus` reproduz as capturas; `debug=1` expõe somente diagnósticos.
- Novo `hands-image-rig.js`: três SkinnedMesh para esquerda, direita neutra e direita apontando. Nove controles por pose: punho, palma, dois para indicador, dois para polegar e um para cada outro dedo. Total de 27 controles, 21 de dedos nas três representações.
- Pesos e pivôs próprios por pose, especialmente no indicador neutro versus apontamento. Punho e palma direitos alinhados no blend. Quatro influências normalizadas por vértice; pesos calculados apenas na construção.
- A GPU aplica os ossos; buffers de vértices permanecem estáticos. O update normal apenas altera os controles. Medição completa dos vértices ocorre sob solicitação de diagnóstico/testes.
- Sem novos assets de imagem, dependências, renderizadores, resolução ou subdivisões. Mantidos materiais básicos, transparência, máscara inferior e proporção aprovada.
- Hover real do Raycaster continua sendo o único gatilho do apontamento. Idle do rig não transforma o neutro em apontamento. Reduced-motion mantém ângulos exatamente zero. Hands=off não carrega sprites nem aloca skeletons. Skeletons, texturas de ossos e geometrias são descartados ao encerrar.

### Validação e evidências

- `npm run check`: aprovado.
- Build completo, incluindo download original da ESO, com `NODE_USE_ENV_PROXY=1 npm run build`: aprovado.
- Três suítes unitárias aprovadas: `hands-image-rig.unit.mjs`, `hands-hover.unit.mjs`, `hands-mesh.unit.mjs`.
- Nova suíte unitária percorre 24 amostras temporais por pose, verificando pesos, índices, articulação real de palma/cinco dedos, deslocamento abaixo de 1,2% nas amostras, ausência de inversão/estiramento excessivo dos triângulos, buffers estáticos, reduced-motion, integração de câmera, hover/viagem/off e descarte.
- **9/9 testes Playwright aprovados, sem retries, em 2,4 minutos**, sobre o build de produção com Chromium/SwiftShader. São 3 testes do rig e 6 regressões das mãos aprovadas. Cobre 1920×1080, 1920×951 e 390×844, landmarks projetados, shader, hover/retorno/viagem, off, opt-in e reduced-motion.
- Uma tentativa inicial encontrou apenas erro numérico de aproximadamente 1,05e-6 no limite de imagem parada após transformação mundial com pesos Float32. Mantida a exigência de ângulos exatamente zero; tolerância espacial subpixel passou a 1e-5. Depois, a seleção inteira foi repetida e passou.
- Workflow `validar-observatorio.yml` inclui a nova suíte unitária; a suíte de navegador completa já seleciona o novo arquivo automaticamente. CI remoto da nova branch ainda precisa concluir depois do push.
- Capturas de 1920×1080 em repouso A/B, hover e retorno em `docs/rig-mmv/`. PNGs e vídeo originais em `/workspace/orion-evidence/mmv/`.
- Vídeo `docs/rig-mmv/rig-mmv.mp4`: repouso → hover → retorno, capturado do canvas WebGL em resolução nativa Eco+, sem HUD/vinheta CSS. Usar a prévia interativa para avaliar a composição completa.
- `docs/rig-mmv/README.md` registra pesquisa, operação, testes, limites e referências. `metrics.json` registra a comparação A/B e landmarks da última amostra em 390×844.

### Orçamento observado

- Renderer: 24 texturas no modo anterior, 27 no rig após passar pelas duas poses. As três extras são texturas de ossos, não novas imagens.
- Dados de ossos: 1024 bytes por skeleton, 3072 bytes no total. Não equivale à memória total do driver/GPU.
- Arrays de geometria: 234120 bytes no total, incluindo atributos/índices; direita neutra usa pesos próprios. Não se aumentaram as subdivisões.
- Duas superfícies estáveis e três durante o blend; 3552 triângulos estáveis, como na base.
- Chunk principal aproximadamente 687,36 kB, antes 683,49 kB; aviso de 500 kB já existia. Sem alegação de FPS/p95/RAM em hardware do usuário.

### Ação do usuário e limites da entrega

O que depende do usuário agora é avaliar **naturalidade e intensidade do movimento** no vídeo/prévia: se punho e dedos parecem delicados, se precisa de mais/menos movimento e se a navegação fica fluida no seu computador. A proporção já está aprovada. Não há segredo novo nem configuração de rede obrigatória para assistir ao artefato local.

O rig continua opcional até revisão artística. Não foi autorizado merge, alteração de main ou deploy de produção. Encerrar este protótipo após entregar evidências e PR; gestos maiores, dedos fechando ou novos assets não fazem parte desta etapa.


## 17/10/2026 — revisão MMV solicitada: intensidade e gesto real

Feedback literal do usuário: “funcionou mas eu acho que as animações ficaram sutis demais, quase n da pra ver e ainda não tem a animação apontando somente um fade”. Continuidade na mesma branch `codex/maos-rig-mmv`, PR #29, baseada no acabamento aprovado `8811a40`. Estado remoto conferido antes de editar: HEAD `884bd5d26df7560729582d05f602c269365616e9`, CI geral e Cloudflare aprovados. Main preservada; sem merge ou publicação em produção.

Alterações: repouso do punho com amplitude 4×, palma/dedos 3×, ciclos um pouco mais rápidos. Proporção, posição, máscara inferior, texturas e translucidez aprovadas preservadas. O hover real do Raycaster agora controla as duas articulações do indicador em ambas as representações direitas. A neutra começa a estender antes da mudança de textura; a apontando termina de estender depois dela. Mistura das imagens concentrada em 25%–75% do gesto; não foi eliminada, mas já não substitui o movimento dos ossos. Mola criticamente amortecida suaviza entrada, saída e reversões. Reduced-motion preserva imagens estáticas e resposta imediata. Modo anterior sem `handsMotion=rig` preservado.

Pesos do indicador ajustados para evitar dobras/inversões durante amplitudes maiores. Sem novos assets de imagem, subdivisões, dependências, câmera, loop ou mudanças no restante do Observatório. Pesquisa nativa Three.js/Spine documentada em `docs/rig-mmv/README.md`; nenhuma biblioteca Spine incorporada.

Validação unitária: repouso limitado a 3,5% da imagem e pico acima de 2%; gesto abaixo de 12%; 21 progressos por pose direita sem inversão; dedo sobe por geometria; primeiros 100ms do hover articulam com opacidade neutra constante, sem imagem apontando visível; retorno recupera a posição; reversões e equivalência 30/60Hz. Check, build e três suítes unitárias aprovados. Resultados de navegador e evidências da revisão registrados na documentação do rig ao concluir.

Próxima ação do usuário: abrir a nova prévia com `?quality=eco-plus&hands=mesh&handsMotion=rig`, observar mãos em repouso por alguns segundos, passar e retirar o cursor do Nox e avaliar se intensidade/gesto ficaram naturais. Nenhuma configuração adicional necessária. Não repetir aprovação da proporção nem iniciar melhorias adicionais. Não promover o rig a padrão nem fazer merge sem autorização explícita.

Resultado final local desta revisão: **9/9 testes Playwright aprovados, sem retries, em 2,3 minutos** sobre o build de produção. Capturas desktop e celular e comparação de recursos atualizadas em `docs/rig-mmv/`. Check/build e três suítes unitárias aprovados. Vídeo atualizado inclui repouso, hover e retorno. CI remoto da revisão conferido após o push; não confundir o sucesso do commit anterior com o novo.


### Ajuste visual dentro desta revisão

A inspeção do vídeo encontrou contorno duplo do indicador no trecho de mistura. Foi acrescentado um morph corretivo nativo de Three.js: a malha aproxima os contornos das poses antes de misturar as imagens. Correspondências por coluna medidas a partir das bordas alpha das imagens existentes; remapeamento vertical monotônico. Ossos mantêm o repouso; morph anima a grande extensão do indicador na GPU. Buffers de posições e morph calculados uma única vez, apenas coeficientes mudam por frame. Consultado o exemplo oficial r180 `webgl_morphtargets.html`. Não foram redesenhados assets. A mistura das texturas ainda existe no meio do gesto e deve ser descrita honestamente como acabamento, não como animação eliminada.

Testes do gesto ampliados para 21 progressos em cinco instantes por pose direita; limite geométrico 18% da imagem, com triângulos positivos/área limitada. Reduced-motion congela tanto ossos quanto morph. O custo adicional passa de três para cinco texturas no renderer: três de ossos e duas de dados de morph. Nenhuma imagem adicional. Medidas e resultados da última execução estão no README/metrics da documentação do rig. Avaliação visual e FPS/RAM reais continuam dependentes do equipamento do usuário.

Validação final após morph: **9/9 testes de navegador aprovados em 2,3 minutos**, sem retries. Após refinar as correspondências a partir do alpha real das imagens, novo build e **3/3 testes do rig repetidos com sucesso**, sem retries. As seis regressões de mãos padrão já passaram e não dependem do mapeamento do rig. Check e três suítes unitárias aprovados. Vídeo final de 20,5 segundos e frame intermediário inspecionados, capturas e métricas finais atualizadas. Renderer A/B final 24→29 texturas; 25752 bytes adicionais de arrays de morph, sem novas imagens. Main e branch de referência remotas reconferidas intactas. O usuário deve avaliar intensidade/naturalidade na prévia; nenhuma outra ação de configuração necessária.


## 17/10/2026 — autorização de poses intermediárias com perspectiva

O usuário perguntou sobre mais imagens intermediárias e depois pediu mais profundidade/perspectiva no apontamento. Foi proposta uma avaliação com três poses intermediárias, pequena mudança de perspectiva, anatomia feminina/transparência e proporção aprovadas preservadas. O usuário autorizou: “faça dessa forma”. Nenhuma imagem ou configuração precisa ser fornecida por ele.

Antes de editar: branch/PR remotos conferidos, `codex/maos-rig-mmv`, PR #29, HEAD `c3dce97e8f26c4040ec4bc132a29ab038642ebda`; CI completo do commit anterior concluiu SUCCESS, assim como Cloudflare. Base do PR continua `codex/finalizar-maos-etereas-v0921`. Não alterar main nem produção. Pesquisa comparou exemplos oficiais de Three.js (morph animado) e PixiJS AnimatedSprite; links/comparação em `docs/rig-mmv/perspective/README.md`. Não adicionar PixiJS ou outro renderer.

Implementação desta etapa: modo opcional `handsMotion=perspective` com cinco poses direitas: neutra existente, três intermediárias geradas e final gerada com perspectiva. São quatro assets novos com alpha verdadeiro, mantendo os originais intactos. Uma primeira tentativa da pose intermediária do meio ficou parecida demais com a primeira e foi substituída; não usar essa tentativa como arte final. Registro de origem, dimensões, alpha e bytes em `docs/rig-mmv/perspective/assets.json`.

O hover real do Raycaster controla a mesma mola amortecida; saída/reversão percorrem os mesmos quadros para trás. Mistura só de vizinhos, no máximo duas representações direitas visíveis. Contornos do indicador medidos a partir do alpha guiam morphs de correspondência para reduzir dedos duplicados no blend. Pequeno morph Z de até 0,14 unidade no espaço da mão simula alcançar para dentro da cena; punho/saída inferior e borda vazia voltada ao centro ancorados. Ossos mantêm o repouso. Buffers calculados só na construção, coeficientes de morph atualizados na GPU; sem reescrever vértices em CPU por frame, nova câmera, novo loop ou dependência. É 2,5D com perspectivas desenhadas, não uma mão 3D completa vista por qualquer ângulo.

Modo anterior `handsMotion=rig` e modo padrão preservados. Reduced-motion usa apenas extremos estáticos, sem ossos/morph em movimento. Off não baixa imagens nem aloca rigs. Arte nova 896×1120, WebP qualidade 92/alpha 100, total 311174 bytes. Novas poses não alteram a proporção aprovada. Custos observados de geometria/renderer e evidências serão registrados ao concluir; não alegar FPS/RAM no PC do usuário por testes headless.

Check/build e quatro suítes unitárias passaram. Testes unitários cobrem pesos de quadros normalizados/vizinhos, correspondências monotônicas/inversas, participação das três intermediárias, profundidade efetiva de ponta vs punho, retorno/reversão, buffers estáticos, reduced/off/viagem e descarte completo. Validação de navegador e vídeo/capturas em andamento, resultados finais na documentação desta etapa.


### Resultado local final da perspectiva

Check, build e quatro suítes unitárias aprovados. **12/12 testes Playwright aprovados, sem retries, em 3,4 minutos**, cobrindo nove regressões anteriores e três casos novos. Após ampliar o teste de recursos, **1/1 caso repetido e aprovado em 20,3 s**, sem retries: comparação na mesma janela mediu rig 29 → perspectiva 38 texturas. Nenhum teste foi desabilitado. Uma asserção inicial diferenciava -0 de +0 no Z ancorado; corrigida para equivalência numérica a zero, mantendo a exigência de âncora.

Evidências finais: `docs/rig-mmv/perspective/` tem galeria das cinco artes, capturas reais 1920×1080/1920×951/390×844, três intermediários do canvas, vídeo de 32,9 s com hover/retorno/interrupção, métricas e procedência. O vídeo foi inspecionado e demonstra a sequência com corpo/punho ancorados; não mede FPS no dispositivo real. A gravação observou todos os quadros com peso máximo acima de 98%, máximo três superfícies, alcance Z até ~0,14.

Recursos observados: 38 texturas no renderer após todas as poses; seis imagens, seis skeletons, cinco texturas de morph. Arrays base de geometria 502176 bytes, morphs 193140 bytes, dados das texturas de ossos 6144 bytes. Não equiparar esses buffers a VRAM ou RAM totais. Build principal ~691,63 kB. Sem dependência/câmera/loop novos. Main e branch de referência remotas reconferidas intactas antes da entrega.

Ação do usuário: abrir a nova prévia com `?quality=eco-plus&hands=mesh&handsMotion=perspective`, observar/retirar o cursor do Nox e avaliar se o giro, a profundidade e a transição ficaram naturais. Comparação anterior disponível em `handsMotion=rig`. Nenhum arquivo/configuração extra necessário. Não repetir aprovação da proporção, promover a padrão, mesclar main ou iniciar outra melhoria sem autorização. PR e commit desta entrega registrados na cópia integral anexada.


## 18/10/2026 — correção dos fades, principalmente dos três dedos recolhidos

Feedback do usuário: “os fades não estão bem transicionados principalmente os outros 3 dedos que não estão apontando”. Estado conferido antes de alterar: branch `codex/maos-rig-mmv`, PR #29, HEAD remoto `95566fe0844e7b2e10c72da87c29256542c9fb98`; Cloudflare SUCCESS, CI geral ainda em execução naquele momento. Não alterar main ou outras cenas/projetos.

Diagnóstico: a correspondência anterior ajustava o indicador; as cinco artes têm posições/oclusões diferentes do médio/anelar/mínimo e continuavam misturando essas silhuetas. Só mudar a curva do fade não resolve a falta de correspondência.

Correção: corpo da mão (palma, polegar e três dedos recolhidos) renderizado uma única vez a partir da textura neutra existente, com opacidade estável durante hover e animação pelo rig/depth. Os quadros intermediários/final recebem recorte de indicador via máscara UV no shader. O corpo recebe a máscara complementar; não recebe morphs XY que trocam o contorno do indicador. O indicador continua com os cinco quadros, correspondências e alcance de profundidade. Nenhum WebP foi redesenhado/regenerado. Mesmo enquadramento, transparência, recorte inferior, câmera, loop, Raycaster e modos anteriores. Preservar redução de movimento, off, retorno e viagem.

Referências do ajuste: fragmento alpha oficial Three.js r180 e Sprite/AnimatedSprite oficiais PixiJS 8.6.6; links e comparação em `docs/rig-mmv/fingers/README.md`. Adaptado ao renderer existente; sem bibliotecas/loops novos, modelos/assets de terceiros ou novo download de imagem.

O custo visualmente necessário é uma superfície corporal extra (três estáveis/quatro na passagem), um skeleton e dados de morph adicionais. A imagem corporal é compartilhada com a neutra já carregada, sem duplicar textura de imagem. Descarte verificado com imagens deduplicadas, para não descartar duas vezes o recurso compartilhado. Medidas finais e testes de navegador registrados ao concluir.

Check/build e quatro suítes unitárias passaram. Novas verificações exigem corpo com mesma textura/opacidade durante todo o gesto e as regiões dos três dedos fora dos quadros misturados. Vídeo e quadros reais inspecionados: dedos recolhidos mantêm uma única silhueta. Regresso de navegador ainda em andamento ao registrar. O teste de imagem/anatomia não é aprovado apenas por CI verde; pedir avaliação visual ao usuário na nova prévia. Não promover/mesclar main ou iniciar etapa adicional sem autorização.


### Resultado local final da correção dos dedos

Check/build e quatro suítes unitárias aprovados. **12/12 testes de navegador aprovados, sem retries, em 4,0 minutos**. Regiões dos três dedos/palma/polegar excluídas dos quadros misturados; corpo com mesma textura/opacidade durante a sequência; todos os quadros do indicador, profundidade, centro protegido em desktop/celular, shader, retorno/viagem/reduced/off e modos anteriores verificados.

Vídeo corrigido de 32 s e quadros reais inspecionados em `docs/rig-mmv/fingers/`. Registro da gravação: 172 amostras, alpha corporal mínimo/máximo 0,46/0,46 e uma única identidade de textura. Indicador mantém todas as poses; os três dedos recolhidos deixam de alternar entre as diferentes oclusões das artes. Não declarar aparência/performance aprovada sem avaliação do usuário.

Recursos A/B no mesmo viewport: rig anterior 29 → perspectiva corrigida 40 texturas (antes 38). Uma superfície e um skeleton/morph corporais extras, sem imagem nova. Três superfícies estáveis/quatro em passagem; 63 controles em sete representações. Arrays base 591528 bytes, morphs 231768 bytes, dados de texturas de ossos 7168 bytes. Esses valores não são RAM/VRAM total nem FPS físico. Main e branch de referência remotas reconferidas intactas.

Entrega segue no PR #29 e na branch `codex/maos-rig-mmv`, sem merge ou produção. Próxima ação do usuário: abrir a prévia atualizada, passar/retirar o cursor do Nox e avaliar especificamente a continuidade dos três dedos recolhidos. Nenhum upload, credencial ou configuração adicional necessário. Não iniciar melhorias extras.


---

## 18/10/2026 — reparo da anatomia após recorte rejeitado

- Usuário relatou “tudo quebrado” e forneceu captura. A revisão `41071db` foi visualmente rejeitada: a junção artificial do indicador sobre a mão neutra rompeu o contorno. Os testes anteriores não cobriam adequadamente a anatomia durante as passagens.
- `handsMotion=perspective` passa a uma imagem íntegra da direita, uma superfície contínua e quatro contornos geométricos intermediários/final + profundidade. Sem shader de recorte, camada corporal ou crossfade. Demais dedos/palma preservados na mesma textura; corrigido calombo na raiz do indicador. Assets existentes preservados, intermediários antigos sem download nesse modo. Proporção/acabamento inferior mantidos.
- 18 controles/duas imagens/duas superfícies durante todo o gesto. Reduced-motion estático, off sem alocação, mesmos hover/retorno/câmera/cena. CI passa a um worker para evitar concorrência de cenas SwiftShader; quatro falhas anteriores eram timeouts, não prova da correção visual.
- Ver [evidências e limites](docs/rig-mmv/continuous/README.md). Mesma branch/PR #29, sem alterar main ou branch de referência. Nenhuma nova configuração/upload/credencial necessária do usuário; após entrega, conferir apenas naturalidade/continuidade do gesto na nova prévia.

A implementação desta rodada mantém o desenho neutro dos três dedos recolhidos durante o apontar, com o rig de repouso existente; ela não reproduz as oclusões diferentes das artes geradas. O gesto do indicador usa deformação real da malha e alcance Z, eliminando a mudança de transparência que produzia silhuetas sobrepostas. O histórico anterior foi preservado integralmente, mas suas declarações de correção de anatomia são substituídas pelo registro desta rejeição e pela nova evidência.

### Resultado local do reparo de anatomia

Check/build, quatro suítes unitárias e **13/13 testes Playwright aprovados, sem retries, em 4,1 minutos**. Teste adicional captura nove posições, incluindo os meios entre os contornos; elas foram inspecionadas ampliadas. A mesma mão não alterna imagens, opacidade ou recortes. Testes exigem duas superfícies durante o gesto, ausência de inversão em 41 progressos/quatro instantes, profundidade/hover/retorno/viagem, centro livre em desktop/celular e reduced/off/descarte. Área relativa dos triângulos 0,5375–2,1464. Isso não equivale à aprovação artística pelo usuário.

Recursos observados: rig anterior 29→perspectiva 26 texturas na mesma janela; a tentativa rejeitada tinha 40. Dois rigs/18 controles, duas imagens, duas superfícies/3552 triângulos constantes. Arrays base 144768 bytes, morphs 64380 bytes, dados dos skeletons 2048 bytes. Nenhum redesenho de asset; imagens intermediárias antigas mantidas como histórico, sem download na perspectiva atual. Sem alegar FPS/RAM no equipamento do usuário.

Arquivos alterados: first-person-hands-mesh.js, hands-image-rig.js, hands-perspective-motion.js; hands-index-layer.js removido. Testes hands-perspective.spec.js e hands-perspective.unit.mjs atualizados, CI com um worker em playwright.config.js. Documentação e comparações em docs/rig-mmv/continuous/, referências históricas marcadas como rejeitadas/superadas. Vídeo atual de hover/retorno/interrupção acompanha as capturas. CI remoto desta rodada a conferir após push.

Ação do usuário na entrega: abrir a nova prévia e avaliar continuidade/naturalidade ao passar e retirar o cursor do Nox. Nenhuma configuração, credencial ou upload necessário. Não repetir aprovação de proporção; não fazer merge/main ou iniciar outra melhoria.


---

## 18/10/2026 — quinas no indicador e nos três dedos (ambos confirmados)

- Base remota `29a571d` conferida com CI e Cloudflare aprovados. Usuário ainda observou aspecto quebrado e confirmou ambos: indicador e três dedos dobrados.
- Curvas monotônicas C1 no indicador, base/palma ancoradas e faixa de influência reduzida. Grade direita 72×72 só na perspectiva, concentrada em todos os dedos. Arte própria já apontando refinada por ImageGen para manter o indicador estendido sem vinco e arredondar articulações/pontas dos três dedos; a malha dobra a imagem inteira até o repouso, com mesmo canvas/alpha/registro. Imagens/modos anteriores mantidos.
- Mesma imagem íntegra durante o gesto, sem shader de recorte ou fades. Proporção, saída inferior, hover/retorno, profundidade, Nox/ESO/câmera/cena preservados. Ver [documentação e evidências](docs/rig-mmv/smooth/README.md). Mesma branch/PR #29, sem main/merge.
- Ação do usuário após entrega: avaliar ambos os contornos na nova prévia ao passar/retirar o cursor do Nox. Sem nova configuração/upload necessário. Não iniciar melhorias adicionais.


A autorização original permite redesenhar assets quando necessário para melhorar qualidade. Nesta rodada a inspeção mostrou dobras angulosas na imagem original dos três dedos; por isso foi criada uma nova variante para a perspectiva, sem substituir os assets dos outros modos. Procedência, hashes e conversão documentados. O usuário confirmou “Ambos” à pergunta sobre indicador/três dedos; não repetir essa pergunta.

### Resultado final local dos contornos de ambos os grupos de dedos

A imagem usada na perspectiva é `public/overlay/right-hand-pointing-smooth.webp`, derivada por ImageGen do asset próprio, com os três dedos recolhidos arredondados e o indicador já desenhado estendido. O rig dobra a imagem inteira até o repouso; o apontamento final preserva a arte estendida, sem esticar um vinco desenhado dobrado. As imagens anteriores não foram substituídas. A variante neutra intermediária de autoria não é carregada nem publicada na pasta do site.

Curvas monotônicas C1, raiz/palma ancoradas e faixa restrita junto ao indicador. Um ponto da articulação do médio ainda se movia aproximadamente 1,82 pixel; o ajuste final exclui esse ponto e as pontas dos três dedos do morph, com regressão unitária específica. Grade 72×72 apenas na direita/perspectiva, com 56 faixas em v=0,38–0,85. Perfil/ponta do indicador ajustados à nova imagem. Proporção/ancoragem, máscara inferior, alpha, profundidade, hover/retorno, Nox/ESO/câmera/viagem mantidos.

Check/build e quatro suítes unitárias aprovados. 13/13 casos de navegador passaram sem retries, em 3,8 min. Após o ajuste final da articulação do médio, os 4/4 casos da perspectiva foram repetidos e passaram, sem retries, em 1,9 min; nove regressões anteriores não usam essa função e já haviam passado. Imagem real validada em 1122×1402 com alpha não opaco. Amostra de 41 progressos/quatro instantes sem inversões, área relativa 0,1811–1,6173, sem relaxar os limites anteriores. Capturas finais de nove posições, antes/depois, desktop/celular e vídeo em docs/rig-mmv/smooth/.

A/B real: rig anterior 29 → perspectiva 26 texturas, igual à rodada anterior. Duas imagens, dois rigs/18 controles, duas superfícies/11904 triângulos (antes 3552). Arrays base 501312 bytes, morphs 319740 bytes, dados de skeleton 2048 bytes. Não representam RAM/VRAM totais ou FPS físico. Nenhuma dependência ou renderer/loop novo.

Arquivos de código: first-person-hands-mesh.js, hands-image-rig.js e hands-perspective-motion.js. Testes hands-perspective.unit.mjs e hands-perspective.spec.js, novo asset e documentação/evidências/contexto. Procedência, hashes, variante de referência e conversão sem resize/crop em docs/rig-mmv/smooth/asset.json. Mesma branch/PR #29. CI remoto desta rodada a conferir após push. Não afirmar aceite artístico; usuário deve conferir indicador e três dedos na nova prévia. Sem configuração/upload/credenciais necessários; não alterar main nem começar outra etapa.


---

## 18/10/2026 — ponta do indicador achatada no repouso

- Base remota `0fd3f62` conferida antes de alterar, Cloudflare aprovado e CI geral ainda em execução. Usuário apontou somente a ponta com aspecto quebrado.
- O morph reduzia o trecho x=150 de 69 para 22 pixels de espessura (~32%), por usar o contorno da ponta antiga sobre a falange da imagem atual. Contorno local recalibrado para preservar a espessura; arco de repouso ajustado para acomodá-la. Apontamento final e demais dedos preservados. Sem redesenhar assets.
- Regressão mede alpha real em quatro colunas da ponta/falange e exige espessura entre 90–110% em cinco estágios, além dos testes anteriores sem limites relaxados. Código apenas em hands-perspective-motion.js e seu teste unitário. Ver [evidências e resultado](docs/rig-mmv/fingertip/README.md).
- Mesmo PR #29/branch, sem main/merge. Ação do usuário ao receber prévia: conferir a ponta parada e ao entrar/sair do hover do Nox. Sem nova configuração/upload necessário. Encerrar esta etapa sem melhorias adicionais.

### Resultado local da correção da ponta

Check/build, quatro suítes unitárias e 4/4 casos de navegador da perspectiva aprovados, sem retries, em 1,8 min. Nove posições e antes/depois inspecionados: ponta arredondada no repouso e espessura preservada nos intermediários; desenho do apontamento final mantido. Regressão lê alpha real do WebP em quatro colunas e exige 90–110% da espessura em cinco estágios (x=150 passou de ~32% para 100%). Área relativa dos triângulos 0,1141–1,7117 em 41 progressos/quatro instantes, sem relaxar os limites anteriores. Incluídos hover real/retorno, viagem, shader, reduced/off, descarte e enquadramento/landmarks em desktop/celular. Os modos anteriores não usam o contorno alterado e suas regressões já haviam passado na etapa anterior.

Evidências em docs/rig-mmv/fingertip/: comparison.webp, poses.webp, capturas e metrics.json. Sem vídeo novo para esta alteração localizada; imagens e recursos preservados (26 texturas, duas imagens, 18 controles, duas superfícies/11904 triângulos). Código apenas em hands-perspective-motion.js, regressão em tests/hands-perspective.unit.mjs, mais documentação/contexto. Nenhum asset alterado. Mesma branch/PR #29; CI remoto do novo commit a conferir após push. Ação do usuário: avaliar a ponta no repouso e ao entrar/sair do hover na nova prévia. Sem configurar/upload/credenciais; não alterar main nem iniciar outra etapa.


---

## 19/10/2026 — clique da mão e seleção luminosa da Nox

- Usuário aprovou a revisão `62eff3a` (“ficou ótimo”). CI completo e Cloudflare dessa base conferidos como aprovados. Pediu explicitamente uma nova animação da mão ao clicar na estrela e um efeito de seleção; esse é o novo escopo autorizado, sem autorização de merge/produção.
- Confirmação de 840 ms antes da viagem existente: a direita avança em Z, faz uma pressão do indicador e retorna. Usa a mesma imagem íntegra e contorno anatômico aprovados, sem fades, recortes ou redesenho. Esquerda, proporção, acabamento inferior e centro livre mantidos.
- Duas ondas de luz com bordas suaves acompanham a Nox em 3D; brilho local, sem textura/dependência/loop novos. Uma geometria compartilhada e dois materiais alocados apenas no primeiro clique; duas superfícies/1536 triângulos e até quatro chamadas (material de dupla face) durante o efeito. Viagem original só começa após a confirmação; cliques repetidos são ignorados.
- Raycaster, teclado, dois toques no celular e hands=off atendidos. Foco de toque não pula a etapa de descrição. Reduced-motion usa confirmação estática de 160 ms, sem avanço/pressão/expansão; depois segue a viagem acessível anterior. Relógio da confirmação independente do limite de delta da física; teto próprio de 100 ms evita pular fases após pausas longas. Reduced-motion garante ao menos um quadro estático. Pausa com aba oculta.
- Código: main.js, first-person-hands-mesh.js, novo star-selection.js; novas suítes tests/star-selection.unit.mjs e tests/star-selection.spec.js e unidade incluída no CI. star-journey.js, assets, contorno aprovado, ESO/créditos preservados. Evidências e limites em [docs/rig-mmv/selection/](docs/rig-mmv/selection/README.md).
- Check/build e cinco suítes unitárias aprovados. 13/13 regressões de mãos passaram; após os ajustes de foco/relógio e proteção de quadros lentos, 6/6 casos da seleção passaram sem retries em 1,0 min. A captura foi repetida separadamente (1/1 em 23,8 s), usando passos pequenos no relógio congelado para respeitar o limite do controlador; seis poses de 25/50/75% verificadas em desktop/celular. Os testes exigem pressão/depth reais, mesma textura/opacidade/superfícies, centro livre, clique único, chegada à ficha, toque/teclado/reduced/off. Unidade cobre também pausa de 1 s e confirmação estática com primeiro quadro lento. Vídeo real de 6,45 s (hover, clique e viagem) e oito capturas comparativas em docs/rig-mmv/selection/. CI remoto do novo commit a conferir após push. Nenhuma aprovação artística da seleção nova presumida.
- Mesmo PR #29 e branch codex/maos-rig-mmv; main e referência preservadas. Próxima ação do usuário na entrega: clicar na Nox na nova prévia e avaliar gesto/luz. Nenhum upload, credencial ou configuração necessário. Encerrar após esta etapa, sem melhorias adicionais.


---

## 19/10/2026 — estudo de mesh/rig e refinamento pequeno

- Pedido explícito: estudar esse tipo de animação por mesh/rig e melhorar um pouco a mão e a seleção da estrela. Base GitHub conferida `058cd21`, Cloudflare aprovado, CI completo ainda em execução ao iniciar. Mesma branch codex/maos-rig-mmv/PR #29, sem main/merge.
- Estudo de referências primárias Three.js r180 (SkinnedMesh e forceSinglePass), timelines de bones/deform do Spine 4.2 e guia de easing/sincronização do Tween.js. Fontes, revisões e decisões em [docs/rig-mmv/study/](docs/rig-mmv/study/README.md). Nenhuma biblioteca/código/asset dessas referências foi incorporado.
- Curvas C2 com velocidade/aceleração nulas nas bordas; pequeno recuo preparatório (-0,012 Z), avanço/pressão anteriores e assentamento do punho depois do indicador (+0,007 rad). Na perspectiva, dedos se acomodam até 18% da amplitude e recebem onda lenta com peso de até 16% durante o apontamento. Neutra/esquerda/modos anteriores mantêm movimento original.
- Seleção: segunda onda começa aos 30% e acompanha a pressão; expansão desacelera e brilho acentua o contato, com opacidades um pouco menores. Mesmo raio máximo 54, geometria e duas superfícies. Anéis planos usam forceSinglePass, uma passagem por superfície. Sem textura, dependência ou loop novos.
- Cinco suítes unitárias, check/build e 10/10 casos de navegador aprovados sem retries em 2,8 min. Cobertos gesto, hover/retorno, mesma imagem/alpha, anatomia sem inversões, profundidade, centro livre, toque/teclado/reduced/off, navegação real e descarte. Testes novos verificam preparação antes do avanço, assentamento depois da pressão e energia dos dedos reduzida ao apontar; nenhum limite anatômico relaxado. Área relativa da malha permanece 0,1141668645–1,7116198024 na amostra anterior.
- Doze capturas (antes e cinco fases em desktop/celular), gráfico das curvas, comparação com 058cd21 e vídeo real de 6,96 s acompanham o estudo. Evidência local Chromium/SwiftShader; não é aceite artístico ou medição de FPS/RAM no equipamento do usuário. CI remoto da nova revisão a conferir após push.
- Código: star-selection.js, first-person-hands-mesh.js e hands-image-rig.js; testes da seleção, documentação/contexto. Assets, pesos, grid, contorno aprovado, ESO/créditos, câmera e star-journey.js preservados.
- Ação do usuário após entrega: abrir a nova prévia, passar/retirar o cursor e clicar na Nox para avaliar o refinamento leve. Sem upload, credenciais ou configuração adicional. Encerrar após esta etapa.


---

## 19/10/2026 — equilíbrio das mãos e apontamento contido

- Feedback: direita menos transparente, mãos desalinhadas nos dois eixos, esquerda sem acompanhar o hover e apontamento exagerado/esticado. Base `823e0d0` conferida no GitHub antes de alterar. Mesma branch `codex/maos-rig-mmv`/PR #29; sem main/merge.
- Enquadramento compartilhado: alpha 0,38, altura-base 0,565, margem lateral −0,030 espelhada e ancoragem inferior −0,020. Direita reduzida à escala da esquerda, preservando proporção da imagem e limite de 30% por lateral. Poses anatômicas próprias mantidas; nenhuma imagem redesenhada.
- Perspectiva limita apontar a 60% da sequência e profundidade efetiva a 0,042 (antes 0,14). Avanço do clique 0,045 (antes 0,09), pressão/rotação menores. Contorno, ponta arredondada, pesos e grade aprovados preservados; nenhuma inversão/limite anatômico relaxado.
- Esquerda acompanha o hover com pequena elevação/aproximação e movimento real de punho/palma. Mesmo progresso suave de entrada/retorno; reduced-motion congela a esquerda e remove profundidade. `hoverBlend` registra entrada completa; `rightBlend`, pose efetiva contida. Seleção luminosa e viagem mantidas.
- Check/build e seis suítes unitárias aprovados. **19/19 casos de navegador** (mesh, rig, perspectiva e seleção) sem retries em 5,3 min; **2/2 regressões da navegação padrão** sem retries em 26,9 s. Unidade nova `tests/hands-balance.unit.mjs` incluída no CI, cobrindo igualdade de frame/alpha em três enquadramentos, acompanhamento/retorno sem escala e limites de pose/depth. Anatomia matemática completa permanece testada, inclusive poses não usadas pelo hover contido.
- Antes/depois, repouso/hover/retorno em desktop/celular, fases do clique e vídeo real de 16,63 s sem erros em [docs/rig-mmv/balance/](docs/rig-mmv/balance/README.md). Evidência local Chromium/SwiftShader; não é aceite artístico nem medição de hardware do usuário.
- CI da base `823e0d0`: FAILURE em Testar WebGL, causa ainda desconhecida. Usuário forneceu resumo do run `39247654033`/artefato `12184518033`; sem erro específico. Download de logs/artefato bloqueado neste ambiente. Avisos de Node/Ubuntu não identificam a causa. CI da nova revisão a conferir após push; resultados locais não substituem o CI completo.
- Código: first-person-hands-mesh.js, hands-image-rig.js e hands-perspective-motion.js; regressões/CI e documentação/contexto. Assets, câmera, fotografia/créditos ESO, Nox, ondas de seleção e star-journey.js preservados.
- Ação do usuário na entrega: abrir a nova prévia, observar repouso, passar/retirar o cursor da Nox e clicar; avaliar transparência, alinhamento e naturalidade do gesto. Nenhum upload, instalação ou credencial necessário. Encerrar após esta etapa.


---

## 19/10/2026 — esquerda fecha no hover, entradas laterais e atmosfera em profundidade

- Novo feedback: acompanhamento esquerdo imperceptível, pedido de fechar um pouco os dedos quando a direita aponta, braços nascendo em bordas diferentes e mais camadas de paralaxe. Escopo ampliado explicitamente à atmosfera. Base GitHub `67e0491` conferida antes de alterar; CI completo e Cloudflare dessa base aprovados durante a etapa. Mesma branch `codex/maos-rig-mmv`/PR #29, sem main/merge.
- Esquerda: flexão real de indicador/falange, médio, anelar e mínimo; oposição leve do polegar, guiadas pela mola do hover. Abertura indicador–polegar cai ~21% no ensaio congelado. Entrada/retorno suaves, mesma imagem/alpha, sem fades de poses. Reduced-motion mantém ossos estáticos. Prévia usa `hands=mesh&handsMotion=perspective`; rig alternativo também fecha a esquerda. Modo mesh antigo permanece para comparação.
- Alinhamento óptico: esquerda rotacionada −0,20 rad e deslocada mais 1,2% da largura para a lateral. Novo acabamento do antebraço esquerdo em v=0,09–0,30; direita e sua máscara preservadas. Escala/proporção/altura-base e alpha 0,38 mantidos. Unidade agora mede alpha real dos WebPs multiplicado pelo acabamento de vértice e projetado pelas malhas nas duas bordas, sem confundir retângulo transparente com silhueta. Verifica três enquadramentos e evita o canto inferior em desktop.
- Fechamento amostrado em 41 progressos/quatro instantes, área relativa esquerda 0,25749–1,57560, sem inversões; limites 0,10–4,0 mantidos. Direita continua contida a 60%, depth máximo 0,042 e clique/seleção anteriores preservados.
- Duas camadas ESO adicionais: bruma esquerda em Z=−130/alpha 0,10 e filamento próximo direito em Z=−42/alpha 0,055, com paralaxe/drift/respiração distintos. Eco+/balanced ficam com cinco massas; high, seis. Eco/lite e Eco+ foreground=off mantêm duas e não baixam assets novos. Reduced-motion congela as camadas. Ordenação pela profundidade física; fotografia principal/créditos e Nox preservados.
- Recortes gerados no build existente: ~97 + 96 KiB, 800×395 e 800×400. Duas superfícies/quatro triângulos, duas texturas adicionais nos perfis que as usam, forceSinglePass por nova superfície. Perspectiva local passa de 26 para 28 texturas GPU. Nenhuma dependência, shader ou loop novo; mãos não redesenhadas. Sem medição de FPS/RAM no hardware do usuário.
- Check/build e sete suítes unitárias aprovados. **18/18 regressões da cena/qualidade** aprovadas; **22 casos distintos das mãos/seleção** aprovados no build final, incluindo os três casos de enquadramento repetidos após atualizar as asserções do retângulo transparente (3/3 em 2,6 min). A rodada de 22 passou 21; o único erro restante era a medida do canto transparente do rig antigo, resolvida ao separar envelope e alpha real. Sem retries automáticos, sem limites anatômicos relaxados. Total: **40 casos distintos aprovados**; não corresponde a uma execução única de 40 testes.
- Evidências locais Chromium/SwiftShader em [docs/rig-mmv/closure-atmosphere/](docs/rig-mmv/closure-atmosphere/README.md): repouso/hover/retorno em desktop/celular, fases do clique, paralaxe, antes/depois, comparação ampliada da esquerda e vídeo real de 16,18 s sem erros. Não presumir aceite artístico; CI remoto da nova revisão a conferir após push.
- Código: first-person-hands-mesh.js, hands-image-rig.js, nebula-depth-specs.js e nebula-volume.js; comentários de contagem em main.js e preparação de assets. Unidade de volume nova no CI, auxiliar de silhueta e regressões de fechamento/paralaxe. Contagens de planos atualizadas nos testes anteriores; margens do retângulo transparente adaptadas à rotação óptica, sem relaxar anatomia ou proteção do centro.
- Ação do usuário: abrir nova prévia, passar/retirar cursor da Nox para observar esquerda fechar/reabrir, mover cursor lateralmente para avaliar camadas e clicar para conferir seleção/viagem. Nenhuma instalação, upload ou credencial necessária. Encerrar após esta etapa.


---

## 20/10/2026 — seleção astral mais marcante e gesto natural da direita

- Pedido exclusivo: melhorar a animação de escolher a estrela, com efeito mais extravagante na Nox e gesto mais natural na mão. Continuação autorizada em 20/10. Base GitHub `f7f1627` conferida antes de alterar; mesma branch `codex/maos-rig-mmv`/PR #29. Main/referência preservadas, sem merge.
- Confirmação nominal passa de 840 para 1120 ms. A Nox reúne luz, abre coroa com doze raios no contato e dispersa dezoito fragmentos; duas fitas 3D giram em sentidos opostos. Ondas anteriores maiores/mais intensas e glows existentes sincronizados. Efeito ancorado na estrela, somente durante seleção, sem partículas novas no repouso ou alteração da fotografia/atmosfera/câmera/viagem.
- Direita faz recuo/preparação, sobe em arco, avança 0,052 em Z (antes 0,045) e inclina discretamente o punho em X/Y. Polegar e três dedos recolhidos se acomodam no contato; oscilação de repouso reduzida durante pressão. Indicador pressiona/solta antes do assentamento. Mesma imagem/alpha 0,38, sem fades de poses na perspectiva, máximo de apontar 0,60 e contorno aprovado mantidos. Esquerda, alinhamento, acabamento inferior e camadas anteriores preservados.
- Seis superfícies/2936 triângulos no efeito (antes duas/1536), quatro geometrias únicas e seis materiais, todos de uma passagem. Alocação só no primeiro clique e descarte idempotente. Zero textura/dependência/shader/loop novo. Reduced-motion mantém confirmação estática de 160 ms com duas ondas, sem coroa/fita/fragmentos alocados e sem movimento da mão.
- Check/build e sete suítes unitárias aprovados. Nova anatomia amostra 21 estágios/três instantes com morph e acomodação dos ossos: área relativa 0,3939347–1,3745913, sem inversões; limites anteriores 0,10–4,0 mantidos. Unidades verificam carga tardia, descarte de todos os recursos, geometria limitada, sincronização, ausência de textura, retorno sem rotação residual, quadros lentos e 30/60/120 Hz.
- **15 casos distintos de navegador aprovados**: cinco fluxos da seleção, quatro da perspectiva, três de fechamento/alinhamento/atmosfera, uma captura por fases e dois smokes da navegação padrão. Rodada principal: 12 aprovados e erro no coletor de métricas da captura; após corrigir a referência do coletor, 1/1 captura passou em 32,8 s, sem mudança no app para resolver esse erro. Dois smokes passaram em 21,7 s. Sem retries automáticos. Cobertos clique único, teclado, toque, reduced/off, mesma imagem/opacidade/centro livre, ondas/coroa/fita/fragmentos, anatomia, chegada real à ficha e recursos.
- Doze capturas de antes e 8/25/50/75/92% em desktop/celular, antes/depois e detalhe ampliado em [docs/rig-mmv/astral-selection/](docs/rig-mmv/astral-selection/README.md). Clock congelado só nas capturas por fase; fluxos funcionais com entradas e tempo reais. Vídeo real de 7,36 s sem erros, com hover/clique/viagem e sem congelar o relógio. A gravação intercepta só a navegação final com 204 para exportar canvas; os testes verificam chegada real à ficha. Evidência local Chromium/SwiftShader, sem medição de FPS/RAM no hardware do usuário e sem presumir aceite artístico.
- CI completo da base f7f1627 terminou FAILURE em Testar WebGL. Anotações informam saída 1 sem nome/causa do teste; logs externos ficaram bloqueados no ambiente em rodadas anteriores. Avisos de Node/Ubuntu não identificam a falha. CI completo da revisão nova a conferir após push; resultado local não substitui CI remoto.
- Código: star-selection.js, first-person-hands-mesh.js, hands-image-rig.js e main.js; regressões da seleção e contexto/documentação. Nenhum asset de mão, arquivo de atmosfera ou star-journey.js alterado. Próxima ação do usuário: abrir a nova prévia e clicar na Nox, avaliando gesto e efeito luminoso; sem instalação, upload ou credencial. Encerrar após esta etapa.


---

## 20/10/2026 — continuidade do gesto e Observatório adaptado ao toque

- Usuário autorizou integrar hover, gesto, seleção e viagem e pediu adaptação própria para celular. Base remota `9db7fc4` conferida antes de alterar; mesma branch `codex/maos-rig-mmv`/PR #29, sem main/merge ou outros repositórios.
- Foco de câmera/luz e difração amortecidos. Teclado acompanha o gesto; sair da janela/aba devolve foco ao repouso. Punho da direita acompanha discretamente a projeção da Nox, sem estender o indicador. Arte, alpha 0,38, limite de apontar 0,60, anatomia e fechamento esquerdo preservados.
- Viagem inicia aos 78% da confirmação (aproximadamente 874 ms). Cauda luminosa e assentamento continuam pelos últimos 246 ms. Posição/orientação/FOV e quatro glows partem de seus valores reais; mãos mantêm a articulação ao se retirarem com fade quintic de 380 ms. Trajetória, destino, clarão e quantidade de rastros anteriores mantidos.
- Toque: arrastar para explorar, tocar na Nox para abrir resumo e botão explícito para atravessar. Segundo toque na estrela não confirma. Arrasto iniciado no astro, captura transferida do filho ao observatório, movimento final agrupado pelo navegador, cancelamento/segundo dedo e retorno ao toque seguinte tratados sem seleção acidental.
- Painel inferior em retrato e lateral em paisagem, áreas seguras, rolagem interna, alvos de 44/48 px, foco/Escape/fechar/toque fora e `inert` quando escondido. Resumo móvel omite campos sem valor. Estrela descoberta. Base real 844×390 tinha cartão terminando em y=432, fora da tela; texto anterior ainda pedia clique.
- Mãos em perspectiva passam a aparecer por padrão no toque, com largura limitada a 27% por lateral no retrato; sobem juntas durante a escolha para acompanhar o painel. Mesmo alpha/imagens. `hands=off` não baixa imagens. Qualidade automática móvel continua lite com fallbacks; overrides manuais respeitados. Sem novo asset, dependência, shader ou loop; custo móvel agora inclui as duas imagens/malhas já existentes da perspectiva.
- Reduced-motion mantém exploração/corpo das mãos estáticos, sem elevação/retirada geométrica ou partida antecipada; confirmação estática de 160 ms e viagem acessível anterior preservadas. Clique repetido, teclado e navegação real verificados.
- Check/build e oito suítes unitárias aprovados. **97 casos distintos de navegador aprovados**: rodada completa passou 95/97 em 16 min; os dois testes corrigidos passaram 2/2 em 14,4 s. Corrigidas contagem obsoleta de atmosfera (três para cinco, mantendo perfil manual balanced estável) e espera fixa de 240 ms do rig legado (agora exige mudança real do quaternion e quadros reais em reduced-motion). Nenhum limite anatômico relaxado ou rig legado alterado. Após ajuste exclusivo de HTML/CSS da chegada, seis casos móveis repetidos passaram 6/6 em 52,4 s, com enquadramento da chegada em três viewports e reduced-motion. Sem retries automáticos; não corresponde a uma única execução verde de 97.
- A chegada temporária teve somente ajustes responsivos/áreas seguras e respeito a reduced-motion: antes, cartão de 304 px terminava em x=328 no viewport de 320; agora mede 272 px e termina em x=296. Conteúdo/destino preservados.
- Evidências locais em [docs/rig-mmv/touch-continuity/](docs/rig-mmv/touch-continuity/README.md): comparação com base extraída por git archive, sem trocar a branch; mesmos viewports/entrada de toque, respiração não sincronizada. Seis capturas de toque, quatro da base, doze poses isoladas e uma chegada pequena; duas comparações; vídeos reais de desktop (6,84 s) e toque (7,64 s), página inteira via CDP/timestamps reais, sem interceptar navegação, sem erros e com sobreposição gesto/luz/viagem confirmada. Produção local Chromium/SwiftShader com emulação de toque; teste em aparelho real ainda necessário, sem presumir fluidez/aceite artístico.
- CI completo da base 9db7fc4 terminou FAILURE em Testar WebGL; anotações informam saída 1, sem teste/causa. Os dois defeitos de testes acima foram identificados localmente; as anotações remotas não indicam o teste específico. Avisos de Node/Ubuntu não explicam a falha. CI da revisão nova a conferir após publicar.
- Código: main.js, touch-navigation.js, index.html, styles.css, first-person-hands-mesh.js, star-selection.js, star-journey.js e cinematic-star.js; somente layout/acessibilidade em ficha.html. Unidade de continuidade adicionada ao CI, regressões de seleção/foco/toque e contexto atualizados. Fotografia ESO, arquivos de atmosfera e assets de mãos intactos. Ficha continua tela temporária de chegada, sem ampliar esta etapa para a ficha definitiva.
- Ação do usuário: abrir nova prévia no desktop e no celular real; no celular, arrastar, tocar na Nox, confirmar pelo botão e girar a tela. Sem instalação, upload, sensor ou credencial necessários. Encerrar após esta etapa.


---

## 20/10/2026 — mecânica de uma a três estrelas e chegada contínua

- Usuário adiou a próxima adaptação mobile, priorizou uma a três estrelas e pediu esconder a troca entre Observatório e destino dentro da viagem. Criação de personagem fica para a próxima etapa; não iniciada. Nomes provisórios das estrelas extras autorizados expressamente.
- Base real `bf90906405cdba10f27fc787f2d9f2fa125d503a` conferida no GitHub antes das alterações. Mesma branch `codex/maos-rig-mmv` e PR #29, destino `codex/finalizar-maos-etereas-v0921`. CI completo da base `39421980005` terminou SUCCESS; Cloudflare da base também aprovado. Nenhuma alteração/merge na main, na referência `preview/star-hover-hands-v0921` ou em outro repositório.
- Catálogo separado em `herald-catalog.js`: Nox única por padrão; `?stars=2` acrescenta Estrela II e `?stars=3`, Estrela III, identificadas como demonstrações. Limite 1–3 e fallback para uma em valor inválido. Sem personagens novos persistidos, backend, conta ou ficha inventada. A criação futura substituirá as entradas de demonstração.
- Layout espacial para uma, duas ou três estrelas, cada uma com alvo real via Raycaster, botão de teclado, dados/resumo próprios e seleção localizada. Só o alvo confirmado recebe o efeito. Destino travado durante confirmação/viagem e clique repetido não muda escolha. Uma instância de viagem/540 rastros; mapas dos glows e da difração compartilhados. Amostra local Eco+ mantém 28 texturas com uma e três estrelas; draw calls do JSON são instantâneos e não um benchmark comparável, pois o bloom alterna passes.
- Viagem recebe destino/grupo/glows escolhidos e mantém a sobreposição gesto/luz anterior. Estrelas restantes somem suavemente na partida. A chegada recebe `herald` e opções visuais; nome/título/link de retorno refletem a escolha. Retorno preserva contagem/opções; voltar pelo navegador restaura uma cena utilizável, tratando restauração via bfcache.
- `page-transition.js`: preparação oportunista do HTML no clique, sem bloquear a navegação se falhar. Ao terminar a viagem, véu `#fffaec` cobre um quadro pintado antes de trocar o documento. Bootstrap inline da chegada instala o mesmo véu antes da primeira pintura; `arrival.js` preenche os dados e revela após fontes/dois quadros, 700 ms normal/160 ms reduced-motion. Remove `via=observatory` da URL. Sem dependência de sessionStorage para a transição; acesso direto permanece utilizável e há saída de segurança após sete segundos se o módulo falhar. Ficha continua a chegada temporária existente.
- Gravação inicial revelou bordas do plano fotográfico nos destinos laterais. Corrigidos cobertura dos quatro cantos do frustum e recorte distante da câmera durante a curva. Só durante a viagem, amplia minimamente o plano existente, sem trocar textura/aspecto/posição ou adicionar superfícies, e mantém o frustum voltado para o plano. Foto em repouso, ESO/créditos, mãos/alpha/anatomia, atmosfera e funcionalidades de toque preservados. Unidade reproduziu o problema de recorte antes da correção e exige cobertura/recorte suficientes em três destinos, quatro proporções e todos os quadros amostrados.
- Evidências em [docs/mechanics/constellation-navigation/](docs/mechanics/constellation-navigation/README.md): uma/duas/três estrelas, resumos e chegada, oito capturas e dois vídeos da página inteira com relógio/entradas reais, timestamps CDP e navegação efetiva sem interceptação. Base extraída por git archive sem trocar de branch. Vídeo anterior seleciona Nox; final seleciona Estrela III e já inclui a correção de bordas/recorte. Sem erros JS/shader nas gravações. Chromium/SwiftShader local; não presumir aceite visual ou desempenho no equipamento do usuário.
- Check/build aprovados. Nove suítes unitárias aprovadas; nova unidade `tests/herald-navigation.unit.mjs` adicionada ao CI. As 19 regressões de mãos/seleção/atmosfera/toque passaram antes da última correção de cobertura/recorte. No build final, 18/18 casos de navegação/seleção e 5/5 regressões da cena aprovados. Total de **36 casos distintos aprovados em rodadas**, sem retries; não equivale a uma execução única de 36. Cobertos seis caminhos de 1/2/3 estrelas, mouse/teclado/toque, clique repetido, destinos/retorno, bfcache, limites/resize, reduced/off, falha da preparação e módulo de chegada atrasado. Resultados por caso e arquivos alterados em `docs/mechanics/constellation-navigation/validation.json`.
- Arquivos de implementação: main.js, herald-catalog.js, page-transition.js, arrival.js, index.html, ficha.html, star-journey.js e cinematic-star.js. `touch-navigation.js` apenas generaliza a detecção de alvos para todas as estrelas; sem novo trabalho de adaptação mobile. Testes, CI, evidências e contexto atualizados. Nenhuma imagem de mão, asset original, arquivo de atmosfera ou dependência alterado.
- Ação do usuário após a entrega: abrir a prévia com três estrelas, testar hover/escolha de cada uma e retorno, avaliar se a troca de página ficou bem escondida. Sem instalação, upload ou credencial. Encerrar esta etapa; criação de personagem é o próximo trabalho.


---

## 20/10/2026 — curva e ambiente coerentes na viagem lateral

- Usuário aprovou a mecânica de uma a três estrelas, mas observou movimento estranho do ambiente 3D e dos outros destinos ao girar a câmera. Escopo exclusivo: naturalizar essa viagem. Base `6c7972d22d55d540347528b49abf4f21fa80a6e5` conferida no GitHub antes de alterar; mesma branch `codex/maos-rig-mmv`/PR #29. CI completo dessa base `39427021272` terminou SUCCESS durante a etapa.
- Diagnóstico: endpoint na vertical da estrela fazia o olhar desfazer parte da curva; oscilação lateral agravava a sensação. Cobertura do JPEG aumentava/diminuía sem acompanhar seus recortes em profundidade, e outros destinos sumiam durante essa rotação. Opacidade da atmosfera era recalculada desde valores da inicialização, podendo saltar no primeiro quadro.
- Destinos restantes dissipam em 160 ms antes de girar, guiados pelo relógio da viagem via `companionOpacity`. Posições de mundo não mudam. Câmera conclui a orientação aos 700 ms e avança pela linha de mira inicial, com direção estável e curva quintic, sem serpentina ou contra-curva. Endpoint preserva Z=estrela+53 e a mesma folga de segurança, agora colinear à aproximação em X/Y.
- Duração normal 2550 ms (antes 2150), com avanço de ~1850 ms preservado. Expansão extra de FOV reduzida de 11° para 4°, entrada/saída suaves. Rastros só aparecem após começar o avanço, com as mesmas 540 linhas. Reduced-motion mantém 850 ms e zero rastros; sem nova adaptação mobile.
- Cobertura do panorama e far clipping não contraem durante a viagem. Recortes fotográficos acompanham a cobertura com âncoras por profundidade, sem alterar Z ou destruir a paralaxe. Névoa/gás capturados no estado real de partida e fade normalizado para não saltar no primeiro quadro. Mesmo mapa/arquivos da ESO, sem blur, superfícies ou texturas novas; repouso preservado. Mãos, seleção astral, identidades/contagem, chegada temporária e véu entre documentos mantidos.
- Check/build e três suítes unitárias relevantes aprovados: `journey-motion`, `herald-navigation` e `selection-handoff`. Nova unidade adicionada ao CI: 30/60/120 Hz, três destinos e duas proporções, direção sem reversão, percurso colinear, dissipação antes da curva, cobertura sem contra-zoom, recortes alinhados e atmosfera contínua. Unidade anterior de quatro proporções percorre a duração completa nova; chegada exige colinearidade e folga em Z em vez do endpoint lateral antigo. Dois novos casos de navegador verificam a viagem real aos destinos esquerdo/direito. No build final, **20/20 casos de navegação/seleção e 3/3 regressões da cena aprovados**, sem falhas ou retries. Total de 23 casos distintos em duas rodadas. Resultados por caso e arquivos alterados em `docs/mechanics/flight-continuity/validation.json`.
- Seis capturas e vídeos reais antes/depois em [docs/mechanics/flight-continuity/](docs/mechanics/flight-continuity/README.md), ambos escolhendo Estrela III no mesmo viewport/perfil, com relógio/entradas reais, página inteira via CDP e navegação efetiva sem interceptação. Base extraída por git archive sem trocar a branch. Sem erros JS/shader; não presumir aceite visual ou desempenho no hardware do usuário.
- Código: `star-journey.js` e uma linha de sincronização do fade em `main.js`; unidades/regressões, CI, evidências e contexto. Nenhuma alteração em main/referência/outros repositórios, imagens das mãos ou assets originais. Criação de personagem e nova adaptação mobile não iniciadas. Próxima ação do usuário: testar as duas estrelas laterais na nova prévia; sem instalação, upload ou credencial.


---

## 20/10/2026 — projeção da galáxia como céu distante

- Usuário esclareceu o problema restante: a galáxia denunciava ser uma imagem plana porque mudava de perspectiva quando a câmera girava, e pediu continuar especificamente esse ajuste. Base `03e9f0c02f8897c84c9866caadf331cdf58c772a` confirmada na branch/PR #29; mesma `codex/maos-rig-mmv`, sem main/merge/outro projeto.
- Nova projeção de céu em `distant-sky.js`, ativa somente durante a viagem. Captura raios/UVs da vista de partida e conserva essa projeção, deslocando a imagem uniformemente por ângulo de giro. A galáxia mantém formato e tamanho aparente com rotação, translação e FOV da viagem; não há aproximação de um plano de mundo. O repouso usa o trecho original do MeshBasicMaterial e a mesma fotografia/enquadramento.
- Reutiliza malha, material e textura existentes; variante de shader preparada já no repouso, sem textura, superfície, passagem ou dependência nova. Fotografia ESO e créditos intactos. Borda fora do enquadramento fotografado cede suavemente a céu escuro, sem repetir/esticar o recorte ou criar um panorama 360°.
- Removidos ampliação artificial da foto/recortes, aumento do far clipping e limite de yaw para esconder o antigo plano. Nuvens próximas conservam posições/escalas/Z e profundidade real; recortes distantes da foto se dissipam antes do giro. Resize ativo não recalcula o volume a partir da superfície presa à câmera. Céu mantém alpha 1 durante todo o percurso, independente da posição local da superfície.
- Preservados tempos, direção e folga de viagem, dissipação dos outros destinos, mãos, seleção astral, uma a três estrelas/identidades, teclado/toque/reduced/off e véu entre documentos. Sem nova adaptação mobile ou criação de personagem.
- Check/build e quatro suítes unitárias relevantes aprovados: `distant-sky`, `journey-motion`, `herald-navigation` e `selection-handoff`. Unidade nova no CI verifica projeção inicial idêntica, invariância a posição/FOV, cobertura em quatro aspectos (incluindo 1920×458), reversibilidade do pan e mesmos recursos. Asserções antigas da escala/cobertura de plano foram substituídas por invariância de projeção e teste de pixels; limites de curva/colinearidade continuam.
- Teste WebGL isolado altera giro/posição/FOV com pan pausado: diferença média 0,000396/255 por canal, nenhum canal >2 níveis; liberando pan, média 31,944/255. Comprova ausência de deformação/zoom e deslocamento efetivo, além de compilação sem erros. Congelamento/manipulação só nesse teste, não na gravação normal. **26 casos distintos de navegador aprovados em rodadas**, sem retries automáticos: um do shader/pixels, 20 de navegação/seleção e cinco da cena. Rodadas iniciais tiveram duas falhas de sincronização dos testes: contagem mínima de frames (8 em vez de >15) substituída por cobertura de fases; smoke agora aguarda dois quadros reais antes de clicar, mantendo o prazo de 9 s. Após correções, laterais passaram 2/2 e clique 1/1; nenhuma alteração da aplicação para esses ajustes, nem relaxamento de câmera/projeção/anatomia. Resultados por caso e arquivos em `docs/mechanics/distant-sky/validation.json`.
- Três capturas e vídeo real novo em [docs/mechanics/distant-sky/](docs/mechanics/distant-sky/README.md), com Estrela III/1280×720/Eco+, página inteira via CDP, relógio/entradas reais e navegação efetiva sem interceptação, sem erros JS/shader. Comparação reutiliza o vídeo final da base 03e9f0c em `flight-continuity/after.mp4`, sem duplicar binário. Evidência local Chromium/SwiftShader; não pressupor desempenho ou aceite visual no dispositivo do usuário.
- CI completo da base 03e9f0c/run `39430167116` terminou FAILURE em Testar WebGL. Estrutura/unidades/build aprovados; anotações mostram apenas saída 1, sem teste/causa. Download de logs externos já estava bloqueado pela rede em etapas anteriores e não foi contornado/repetido. Avisos de Node/Ubuntu não identificam a causa. Conferir CI da nova revisão após publicar; resultados locais não substituem o CI completo.
- Código: `distant-sky.js`, `main.js`, `star-journey.js`; unidades/regressões, CI, evidências e contexto. Próxima ação do usuário na entrega: abrir a nova prévia e observar a galáxia ao escolher as duas estrelas laterais. Sem instalação, upload ou credencial. Encerrar esta correção; criação de personagem continua para a próxima etapa.

---

## 20/10/2026 — movimento e profundidade da galáxia restaurados

- Usuário avaliou a projeção distante de `6915ce5`: a galáxia pareceu estática e a viagem perdeu sensação de movimento; preferiu a forma anterior. Escopo desta etapa: restaurar essa sensação, sem nova experiência visual. Base `6915ce5005af038f437929c0efce94a98aff4620` confirmada no GitHub/PR #29 antes de alterar; mesma branch `codex/maos-rig-mmv`.
- `main.js` e `star-journey.js` restaurados byte a byte à revisão `03e9f0c02f8897c84c9866caadf331cdf58c772a`, com comparação automatizada de conteúdo e hashes na evidência. Fotografia e recortes voltam às posições no mundo 3D e respondem ao avanço da câmera. Cobertura do panorama e far clipping acompanham o percurso sem contração; recortes acompanham a cobertura conservando profundidade. A perspectiva do fundo da versão anterior também retorna, escolha expressamente preferida pelo usuário após testar o céu distante.
- Mantidos curva suave/avanço colinear, duração de 2550 ms, dissipação das outras estrelas antes do giro, mãos/seleção, catálogo de uma a três estrelas, identidades, retorno e véu entre documentos. Sem novo asset, dependência, ajuste mobile ou criação de personagem.
- Removidos módulo `distant-sky.js`, unidade/teste WebGL exclusivos e chamada da unidade no CI. Restauradas unidades de cobertura/curva do ambiente em movimento e asserção da cobertura no navegador. Mantidas as correções de sincronização da etapa anterior: cobertura de fases em vez de FPS mínimo e dois quadros reais antes do clique do smoke. Histórico/evidências do experimento distante preservados.
- `npm run check`, `NODE_USE_ENV_PROXY=1 npm run build` e três suítes unitárias relevantes aprovados: `journey-motion`, `herald-navigation` e `selection-handoff`. **21 casos distintos de navegador aprovados**, sem falhas ou retries: 20 de navegação/seleção e um smoke de clique com configuração padrão. Cobrem os três destinos, ida/retorno, viagens laterais, seleção, teclado, toque, reduced-motion, mãos desligadas e continuidade entre documentos. Resultados por caso e arquivos em `docs/mechanics/restored-motion/validation.json`.
- Nova gravação real e três capturas em [docs/mechanics/restored-motion/](docs/mechanics/restored-motion/README.md). Comparação liga o vídeo do céu distante à restauração atual e à referência original, sem duplicar binários históricos. Estrela III/1280×720/Eco+, relógio/entradas reais, página inteira via CDP e navegação efetiva; sem manipulação do relógio ou interceptação. Validação local Chromium/SwiftShader, sem presumir desempenho ou aceite visual no dispositivo do usuário.
- CI completo da base `6915ce5` ainda estava em execução durante a validação local; consultar nova revisão após publicar, sem equiparar testes locais ao CI completo. A rede deste ambiente já bloqueou acesso direto às prévias pages.dev e downloads externos de logs; não repetir nem contornar esses bloqueios. Publicação será conferida pelo check da Cloudflare, com validação visual local.
- Main `61067167aa6752ff505013a91ba450fe87739812` e referência `preview/star-hover-hands-v0921` / `2a2c6a06157cc6141d81842f1f8d37dd8c54aaa1` conferidas e preservadas. Sem merge/outro repositório. Próxima ação do usuário: abrir a nova prévia e comparar a sensação de avanço escolhendo as duas estrelas laterais. Sem instalação, upload ou credencial necessária. Encerrar após esta correção.

---

## 20/10/2026 — galáxia sem perspectiva de parede e viagem em profundidade

- Usuário esclareceu que a fotografia parecia uma parede ao olhar para estrelas laterais e autorizou resolver com céu panorâmico separado das camadas próximas. Base real `64b196b28277557316f93eb11a662915cbc091f5` confirmada no GitHub/PR #29 antes de alterar. Mesma branch `codex/maos-rig-mmv`, sem main/merge/outro repositório.
- Reutilizada a projeção panorâmica local de `distant-sky.js`: captura a vista inicial, conserva sua perspectiva e aplica deslocamento uniforme conforme o ângulo do olhar. Translação da câmera/FOV não aproximam, inclinam ou comprimem a fotografia. Malha, material e textura reutilizados, sem salto na partida ou mudança no repouso. Recorte ESO original não é panorama 360°; borda externa cede a céu escuro, sem repetir/esticar pixels ou inventar outro asset. Shader preparado no repouso, sem nova passagem/superfície/textura.
- A tentativa distante anterior (`6915ce5`) esvaziava a viagem porque dissipava recortes fotográficos distantes antes do giro. Nesta revisão, todos os recortes habilitados pelo perfil permanecem em profundidade. Centros e escalas fixos no mundo; crescimento na tela vem da aproximação real. Nuvens mascaradas acompanham suavemente a orientação do olhar durante o alinhamento, evitando aparência de placas inclinadas.
- Presença das nuvens cresce gradualmente até 2,4× no avanço, sem salto no início; reduced-motion conserva ganho 1. Dissipação usa profundidade na direção da visão entre 55 e 6 unidades antes do olho, prolongando presença próxima e apagando a camada antes de atravessá-la. Mesmo gás/recortes/540 rastros/perfis; nenhum asset, dependência ou superfície adicional. Removidos expansão artificial da fotografia/recortes, aumento de far e limite de yaw que escondiam as bordas do plano.
- Mantidos curva suave, duração normal 2550 ms/reduced 850, avanço colinear, saída das outras estrelas antes do giro, mãos/seleção, catálogo de uma a três estrelas, identidades, retorno e véu entre documentos. Resize ativo não recalcula volume a partir da fotografia ligada à câmera. Nenhuma nova adaptação mobile ou criação de personagem.
- `npm run check`, `NODE_USE_ENV_PROXY=1 npm run build` e quatro suítes unitárias relevantes aprovados: `distant-sky`, `journey-motion`, `herald-navigation` e `selection-handoff`. Asserções de cobertura de plano substituídas por cobertura/projeção do céu; limites de curva, continuidade e folga preservados. Unidade percorre 30/60/120 Hz, três destinos e múltiplos aspectos, exigindo nuvens presentes durante o avanço, sem salto/alteração de escala/centro no mundo. Unidade do céu no CI.
- **25 casos distintos de navegador aprovados**, sem falhas ou retries: quatro de renderização/profundidade, 20 de navegação/seleção e um smoke de clique com configuração padrão. Teste de pixels isola céu e pausa somente pan enquanto modifica giro/posição/FOV; diferença média 0,000228/255 por canal, nenhum canal >2 níveis. Liberando pan, média 31,938/255. Manipulação/congelamento apenas no teste isolado, não no produto ou vídeos.
- Três novos casos percorrem a viagem real aos três destinos e verificam nuvens visíveis crescendo mais de 1,7×, sem mudar centros/escalas de mundo, orientadas ao olhar e apagadas depois de ultrapassadas. Crescimento máximo observado nos passes visíveis: 2,73× no centro, 9,65× à esquerda e 2,62× à direita; métricas de projeção, não desempenho. Resultados por caso/arquivos em `docs/mechanics/panoramic-flight/validation.json`.
- Dois vídeos reais e seis capturas em [docs/mechanics/panoramic-flight/](docs/mechanics/panoramic-flight/README.md), escolhendo Estrela III e Estrela II, 1280×720/Eco+, página inteira via CDP, entradas/relógio reais e navegação efetiva sem interceptação. Sem erros JS/shader. Comparação liga diretamente os vídeos históricos `restored-motion` e `distant-sky`, sem duplicar binários. Amostras mantêm 28 texturas; draw calls instantâneos não são benchmark por alternância do bloom. Evidência local Chromium/SwiftShader, sem presumir desempenho ou aceite visual no dispositivo do usuário.
- CI completo da base `64b196b` ainda em execução durante a implementação; consultar a nova revisão após publicar. Rede já bloqueou acesso direto pages.dev e downloads externos de logs; não repetir/contornar bloqueios. Publicação conferida pelo check Cloudflare e validação visual no build local; resultados locais não substituem CI completo.
- Main `61067167aa6752ff505013a91ba450fe87739812` e referência `preview/star-hover-hands-v0921` / `2a2c6a06157cc6141d81842f1f8d37dd8c54aaa1` conferidas e preservadas. Próxima ação do usuário: testar as duas estrelas laterais e comparar perspectiva da galáxia e sensação de avanço. Sem instalação, upload ou credencial necessária. Encerrar após esta correção.

---

## 20/10/2026 — aproximação gradual da galáxia na viagem

- Usuário pediu aproximar um pouco o fundo porque a sensação de movimento ainda estava fraca. Base `c2c6b951945b978b036ac3bf6fdfecdf2976050a` confirmada no GitHub/PR #29 antes de alterar; mesma branch `codex/maos-rig-mmv`.
- `distant-sky.js` acrescenta zoom uniforme no espaço da tela, centrado na direção de chegada e limitado por `SKY_APPROACH_ZOOM=1.22`. `star-journey.js` alimenta o efeito com a fração real de deslocamento da câmera (`distancePhase`), já suavizada. Fundo cresce até 22%, apenas após 700 ms de alinhamento; não contrai antes da chegada. Panorama mantém o deslocamento angular e a perspectiva capturada, sem retornar ao plano inclinado no mundo. Reduced-motion mantém aproximação adicional zero.
- Repouso, fotografia/recortes, nuvens, mãos, seleção, duração/curva da câmera, destinos e transição entre páginas preservados. Mesmo shader/malha/material/textura; sem assets, superfícies, passagens ou dependências novas. Chave da variante do shader atualizada; preparada no repouso.
- `npm run check`, `NODE_USE_ENV_PROXY=1 npm run build` e duas suítes unitárias relevantes aprovados: `distant-sky` e `journey-motion`. Incluem cobertura em quatro aspectos, correspondência da projeção inicial, zoom uniforme, limites e ausência de aproximação adicional em reduced-motion; curva/continuidade/profundidade anteriores mantidas.
- **Sete casos distintos de navegador aprovados**, sem falhas ou retries: shader/pixels, três destinos reais com crescimento monotônico entre 1 e 1,22 e sem zoom no alinhamento, duas regressões da curva lateral e smoke de chegada com configuração padrão. Teste isolado compara o zoom renderizado a um recorte central ampliado: diferença média 2,743/255 por canal, contra 17,690/255 da imagem sem zoom; evidencia ampliação uniforme. Giro com pan pausado permanece sem deformação: média 0,000226/255, nenhum canal >2 níveis. Congelamento só no teste isolado, não no produto/vídeo.
- Nova gravação real e três capturas em [docs/mechanics/sky-approach/](docs/mechanics/sky-approach/README.md), Estrela III/1280×720/Eco+, página inteira via CDP, relógio/entradas reais e navegação efetiva, sem interceptação ou erros JS/shader. Comparação reutiliza o vídeo da base em `panoramic-flight/right.mp4`, sem duplicar binário. Resultados por caso/hashes/arquivos em `validation.json`. Evidência local Chromium/SwiftShader; não presumir desempenho ou aceite visual no dispositivo do usuário.
- Publicação será conferida pelo check Cloudflare e CI completo consultado após o push. Rede deste ambiente já bloqueou acesso direto pages.dev/downloads externos de logs; não repetir nem contornar. Testes locais não substituem CI completo.
- Main e referência preservadas, sem merge/outro repositório. Criação de personagem e nova adaptação mobile não iniciadas. Próxima ação do usuário: escolher uma estrela lateral na nova prévia e comparar a aproximação do fundo. Nenhuma instalação, upload ou credencial necessária; encerrar este ajuste.

---

## 20/10/2026 — mais aproximação do fundo: 22% para 32%

- Usuário pediu “um pouco mais de zoom”. Base real `055f3dc23271916a521b5e0d733e3ec0b7c00a7c` confirmada no GitHub/PR #29 antes de alterar; mesma branch `codex/maos-rig-mmv`.
- Única alteração da aplicação: `SKY_APPROACH_ZOOM` de `1.22` para `1.32` em `distant-sky.js`. Mantidos ritmo, início após alinhamento, proporção do panorama, repouso/reduced-motion, nuvens, mãos, destinos e transição. Testes existentes atualizados para o novo limite, sem teste adicional para a troca de constante.
- `npm run check`, `NODE_USE_ENV_PROXY=1 npm run build`, duas suítes unitárias (`distant-sky`, `journey-motion`) e quatro casos de navegador aprovados sem falhas ou retries: renderização/pixels e três destinos reais. Crescimento monotônico até 32%, sem zoom no alinhamento; limites de curva/profundidade e reduced-motion preservados.
- Capturas comparativas em `docs/mechanics/sky-zoom32/`: céu isolado na mesma pose/pan, reproduzindo o ganho anterior de 22% e o atual de 32%. Relógio pausado apenas para essa comparação técnica; viagens dos três destinos usam navegação/relógio reais. Evidência local Chromium/SwiftShader, sem pressupor desempenho ou aceite visual no dispositivo do usuário. Resultados e hashes em `validation.json`; vídeo real anterior reutilizado por link.
- Contexto e PR atualizados. Publicação conferida por check Cloudflare após o push; consultar CI completo da nova revisão sem equipará-lo aos resultados locais. Acesso direto pages.dev já bloqueado pela rede deste ambiente; não repetir/contornar.
- Main/referência preservadas, sem merge/outro repositório, novo asset de produto, criação de personagem ou adaptação mobile. Próxima ação do usuário: escolher uma estrela na nova prévia e avaliar a intensidade. Nenhuma instalação necessária; encerrar este ajuste.

---

## 22/10/2026 — revisão do fechamento desktop antes do mobile

- Usuário aprovou o design e pediu verificar se ainda existe pendência antes de planejar mobile. Base `427c42070b6df5e5a6f64412456747676b145419` confirmada no GitHub/PR #29, mesma branch `codex/maos-rig-mmv`. Auditoria sem alteração de implementação ou arte.
- CI completo da versão auditada `39465583412` terminou SUCCESS, incluindo estrutura/unidades/build/WebGL. Cloudflare SUCCESS. Novos check/build locais e cinco testes de navegação aprovados sem falhas/retries: uma estrela, destino III, véu/módulo atrasado, reduced-motion/destino inválido e voltar pelo navegador. Não repetir o estado antigo “CI em execução” como conclusão desta revisão.
- Pendência de consolidação confirmada: `main.js:149` mantém `animation=mesh` como padrão desktop; `handsMotion=perspective` ativa o gesto aprovado. Comparação controlada 1280×720/Eco+/três estrelas: modo padrão com zero rigs/três texturas de mãos; modo aprovado com dois rigs/duas texturas. Sem erros JS/carga. Recomendado tornar o aprovado padrão antes de consolidar desktop, preservando comparação legada explícita; não promovido automaticamente nesta auditoria.
- Sem outro defeito impeditivo reproduzido nos cenários revisados. Falha simulada de contexto WebGL exibe aviso/tentar novamente. Emulação 390×844 já usa toque/perspectiva/lite, resumo da Estrela II e confirmação explícita, sem overflow horizontal. Sem medição em aparelho real ou Safari/iOS; não presumir desempenho.
- Ficha/chegada temporária (`ficha.html`), catálogo por parâmetros com estrelas de demonstração (`herald-catalog.js`) e Sair sem conta (`main.js:105`) continuam limitações funcionais previstas. Criação de personagem, ficha definitiva, autenticação e persistência não foram iniciadas e não bloqueiam planejar mobile.
- Relatório, capturas comparativas, inspeções e validação por caso em `docs/reviews/2026-10-22-desktop/`. Nenhum novo efeito ou redesenho recomendado. Próximo: consolidar padrão desktop, adaptar composição/controles/uma a três estrelas e validar Android/iPhone reais; depois retomar criação de personagem na etapa funcional.
- Main/referência preservadas, sem merge/outro repositório. Usuário não precisa preparar nada agora; testes físicos posteriores dependem do aparelho disponível. Encerrar a auditoria sem iniciar implementação mobile ou alterar automaticamente o padrão.

---

## 22/10/2026 — protótipo mobile guiado, retrato e paisagem

- Usuário aprovou a ideia de uma estrela em destaque, exigiu uso em pé/deitado e pediu indicações visuais de deslize. Base `40b98b5cb820c2d31c92ab8a44487b657c13e484` conferida no GitHub/PR #29 antes de alterar; CI completo/Cloudflare dessa base SUCCESS. Mesma branch `codex/maos-rig-mmv`, sem main/merge/outro repositório.
- `mobile-constellation.js`: coleção móvel guiada por índice, com transição no loop existente, uma estrela em destaque, nome/posição, setas de 44 px, marcadores acessíveis e “Deslize para mudar de estrela”. Símbolo ↔ convida ao swipe por três ciclos; reduced-motion sem animação. Limites nas extremidades, sem rotação circular. Com uma estrela, controles/convite de swipe ocultos.
- Swipe horizontal troca foco; movimentos curtos/verticais/cancelados e gestos no resumo não confirmam nem trocam por engano. Toque abre resumo, segundo toque não viaja, botão Entrar no universo confirma. Alvo aguarda assentar durante a troca; seleção bloqueia mudança de destino. Teclado/setas/marcadores preservam alternativas ao gesto.
- Retrato usa estrela acima do resumo inferior; paisagem leva estrela à esquerda e resumo à direita. Rotação conserva estrela/resumo. Disposição da constelação guiada com pequeno deslocamento da câmera; sem exploração livre por arrasto no toque. Desktop preservado.
- Mãos móveis passam a aparecer gradualmente só na confirmação e se retiram na viagem; mesmos assets/rig. Escolha/resumo têm zero superfícies de mãos desenhadas, com as duas texturas existentes carregadas. Reduced-motion mantém navegação instantânea e estática. Zoom de 32%, qualidade adaptativa, glows/viagem/identidades/retorno/véu anteriores preservados. Sem textura/superfície 3D/dependência nova ou RAF adicional.
- `npm run check`, `NODE_USE_ENV_PROXY=1 npm run build` e cinco suítes unitárias aprovados: `mobile-constellation`, `herald-navigation`, `selection-handoff`, `hands-balance`, `journey-motion`. Unidade nova no CI projeta layout em quatro aspectos para 1–3 destinos. Unidade de continuidade inicialmente esperava mãos visíveis no hover móvel; atualizada para a regra nova e para exercitar desktop/toque, preservando limites de câmera/luz/pose/retirada; aplicação não alterada para contornar essa expectativa.
- **32 casos distintos de navegador aprovados em rodadas**, sem retries automáticos: seis do guia e 26 de navegação/seleção/toque. Cobertos retrato/paisagem/rotação/320 px, contagens 1–3, swipe/setas/marcadores/teclado, cancelamento/vertical/resumo, destino bloqueado, confirmação, reduced/off, identidades/retorno, desktop e véu entre documentos. Resultados por caso/hashes/arquivos em `docs/mobile/guided-constellation/validation.json`.
- Conferência final de 568×320 detectou disputa entre resumo e Sair; painel horizontal passou a reservar espaço para o cabeçalho. Nova asserção encontrou confirmação 1 px fora da borda: rodapé sticky ajustado, sem relaxar limites. Rodada móvel adicional passou 11/12 antes do ajuste; após a correção, 4/4 cenários afetados passaram (duas viagens guiadas, rotação/320 px e encaixe do toque). Captura/limites finais da paisagem pequena adicionados; vídeos/capturas refeitos no build final.
- Dois vídeos reais e 13 capturas em `docs/mobile/guided-constellation/`, 390×844 e 844×390/Eco+, página inteira via CDP, entradas/relógio reais e navegação efetiva sem interceptação. Exploram estrelas II/III e chegam à Estrela II, sem erros JS/shader. Comparação liga a captura da auditoria anterior (perfil automático) sem duplicação; não é comparação de desempenho. Evidência local Chromium/SwiftShader/emulação, sem teste físico Android/Safari/iPhone.
- Contexto e PR atualizados. Confirmar publicação via check Cloudflare e consultar CI completo novo após push; resultados locais não substituem CI. Acesso direto pages.dev já bloqueado pela rede deste ambiente: não repetir/contornar.
- Main/referência preservadas. Consolidação do gesto desktop como padrão continua pendência separada da auditoria; não promovida nesta tarefa mobile. Criação de personagem, conta/persistência e ficha definitiva não iniciadas. Próxima ação do usuário: abrir prévia no celular, deslizar entre três estrelas e confirmar uma em pé/deitado. Sem instalação/upload necessário; encerrar o protótipo após publicar.
