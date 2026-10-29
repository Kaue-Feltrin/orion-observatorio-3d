# V24 — A criação continua na mesma ficha

29/10/2026, São Paulo. Observatório independente, branch `feat/nascimento-marcado`, base `b528d94db72c2548352ed38a0a1aca223141f953`. Referência de regras: Órion Fichas PR179, `f80bbaacc8acb4ad0158d43fb923e2f421e58528`.

## Analisado

O usuário confirmou que habilitar a aceleração por hardware no Brave resolveu a lentidão observada naquele computador. Antes, `brave://gpu` informava Compositing/WebGL por software; depois passou a informar aceleração por hardware. Essa é evidência do computador do usuário, anterior à V24. A máquina de validação continua usando Chrome/SwiftShader, sem acesso à GTX 1660.

O site não pode verificar com certeza uma configuração que o navegador oculta. O nome genérico Brave continua como **desconhecido**. Nomes reconhecidos de software permitem uma orientação direta; FPS baixo sozinho só produz uma sugestão de conferir as configurações. Não há detecção inventada de GPU nem tentativa de ativar opções internas automaticamente.

A diferença entre as cenas também envolve direção de luz, profundidade, materiais e continuidade, além de resolução. O método em `CONTINUIDADE-PLAN-V24.md` mantém uma linguagem recorrente: conhecimento dourado no vínculo → vestígios na névoa da identidade → inscrição durante a materialização da mesa → capítulos da mesma folha. Não houve geração de imagens novas nesta revisão.

## Implementado

- **Orientação gráfica:** seção em Fluidez e ajuda no erro inicial. Endereços específicos para Brave, Chrome, Edge e Firefox; copiar/selecionar como alternativa aos links internos que páginas comuns não podem abrir. Aviso dispensável no Observatório desktop quando aplicável; não cobre os controles da criação nem aparece automaticamente no mobile.
- **Sigilos:** fonte e frase originais, cinco órbitas e 240 glifos preservados. Núcleo e dois halos são rasterizados uma vez em canais de um único atlas RGBA de 2048×1024. O shader lê os três canais numa amostra; dourado aditivo, sem novo desfoque de tela inteira. Na identidade, 48 vestígios instanciados compartilham o atlas, num lote adicional sem bloom.
- **Mãos:** mesmo rig, texturas, poses, UVs e duas superfícies. O fragmento aumenta gradualmente a presença perto das bordas: multiplicador 1–2,5 sobre a opacidade-base 0,38, respeitando a máscara e o fade existentes do braço. Não são duas mãos inteiramente opacas; o objetivo é ancorar a imagem nas bordas.
- **Introdução:** apresentação breve na primeira visita da aba, pulável. Movimento reduzido omite a introdução. A interação só é liberada depois do carregamento/apresentação.
- **Mesa e transições:** seis tábuas caem sobre a cena ainda viva, assentam e recebem o papel. Depois da cobertura, WebGL pausa; ao voltar à identidade, retoma. Origem → classe e todos os capítulos seguintes usam movimento de folha, luz de dobra, inércia temporária e foco de teclado ao terminar. Madeira/papel permanecem como a mesma superfície.
- **Continuação real das decisões:** confirmar a classe libera atributos → idade/vivência → perícias → habilidades/rituais → equipamento → história → conferência. Atributos têm distribuição visual, orçamento e limites; idade abre subescolhas existentes; Combatente escolhe seus treinamentos obrigatórios, Especialista registra Perito e Ocultista escolhe três rituais de 1º círculo. Equipamento tem busca, grupos legíveis, quantidade, configuração quando necessária e limites/carga. Narrativa permanece livre, sem conceder bônus.
- **Rascunho local:** alterações são preservadas na sessão quando permitido. Guardar no navegador e baixar JSON são ações explícitas no final. O Observatório oferece Retomar criação. Etapas visitadas e escolhas são conservadas ao voltar/recarregar. Diminuir Intelecto não apaga perícias: sinaliza o excesso para o jogador resolver.

## Regras e fronteira funcional

Foram reutilizados **30 arquivos exatos** de regras/catálogos puros do checkout protegido, com hashes em `rules-snapshot/provenance.json`. A cópia é carregada sob demanda após a classe; não inclui Worker, D1, usuários, credenciais ou adaptadores de rede. O capítulo seguinte é um chunk separado de cerca de 287 KB antes de gzip, aproximadamente 74 KB comprimidos; não é carregado para visitar apenas o Observatório.

Catálogo: 66 origens, 28 perícias, 219 equipamentos e 135 rituais, dos quais 44 de 1º círculo. **24 das 66 origens** possuem treinamentos mecanicamente verificados nessa base. As demais continuam exploráveis, mas não recebem confirmação mecânica fictícia. Exceções etárias e subescolhas de origem preservam os bloqueios e restrições do motor existente. Isso não é uma auditoria integral dos PDFs ou homologação de todas as regras.

A saída permanece `status: draft`, `officiallyActivated: false`. Valores mostrados são prévias; selecionar equipamento não o concede numa conta, e referências de poderes não viram concessões canônicas. Não há autenticação, ativação oficial, escrita remota, migração ou nova estrela vinculada a uma conta. O JSON local ainda não tem importação pela interface; o arquivo pode ser guardado como cópia das decisões. Não é evolução de personagem de níveis posteriores.

## Falhas encontradas nesta rodada

1. Retomar um Prodígio nos atributos, sem limites etários definidos, bloqueava o acesso à própria etapa que os escolhe. O teste contra o bundle anterior falhou com o botão desabilitado; `prodigy-before.log` registra a reprodução. A escolha dos limites passa a ser validada quando definida; os bloqueios finais permanecem. As etapas visitadas também são preservadas.
2. Um ajuste de estado introduziu uma referência inexistente na conferência. Os três percursos completos e a retomada direta reproduziram a falha; a referência foi removida e a recuperação de transição preserva o índice anterior. Os percursos completos foram repetidos com sucesso. Essa falha era da implementação em andamento, não uma alegação de defeito na V23 entregue.
3. Inspeção visual/computada encontrou o campo de cópia manual reduzido a 20×20 px por uma regra geral dos radios. A regra específica foi corrigida e o teste exige largura útil. Isso não foi resolvido ocultando o fallback.

Uma primeira versão do teste preenchia a idade durante o intervalo em que a folha ainda estava inerte. O teste passou a esperar o foco de conclusão da transição; não foram removidos os controles de interação nem sua validação.

## Testado

- Node **24.19.0**, SQLite **3.53.3**, Chrome **156** via Playwright **1.56.1**, renderização SwiftShader.
- `npm run check` e **24 arquivos unitários** aprovados. Incluem três criações locais consistentes, limites após editar INT, rituais/equipamento inválidos, fonte exata, rascunho sem ativação e classificação conservadora de renderizador.
- **69 cenários distintos de navegador aprovados**, sem retries: 54 regressões existentes de classes, céu/camadas, sigilos, reflow, clique/toque/voltar, introdução de carregamento, mãos/poses, viagem e qualidade/diagnóstico; 15 cenários novos de criação/continuidade. Reexecuções após ajustes não são contadas como cenários adicionais.
- Os três percursos completos atravessam todas as decisões, guardam e baixam JSON real, voltam a atributos/perícias, acusam excesso sem apagar escolhas, recarregam e retomam a história. Testes também cobrem quota negada, texto com marcação sem execução, Prodígio, Profissão/Engenheiro sem concessão de item, ajuda de software, Brave com nome oculto e introdução pulável.
- Mobile simulado em **390×844, 320×568 e 568×320**; sem overflow horizontal nas decisões. É Chrome emulado, não teste em aparelho/Brave físico.
- Shader de opacidade foi compilado e lido em WebGL: centro aproximadamente 0,38 e extremidades aproximadamente 0,95 numa superfície de prova opaca. Os testes anteriores continuam verificando geometria, poses, continuidade e reversão. O atlas real tem halo fora do núcleo, compartilha textura com a atmosfera e mantém os índices dos glifos.
- Checkout protegido: `npm test` passou em **1.319 testes**; `npm run cloudflare:check` passou nas guardas locais. Nenhuma operação remota foi executada. HEAD e árvore rastreada preservados.
- Workflow de validação configurado para Node 24 e todos os arquivos unitários; a execução do GitHub Actions não é alegada como verificada.

`npx vite build` aprovado, com o aviso de tamanho do chunk principal já existente. O download ESO do comando completo `npm run build` não foi reexecutado; são usados assets cacheados verificados. Não se afirma que o acesso externo de download passou.

Capturas reais em 1440×1000, 390×844 e 568×320, com gravação do percurso normal. As capturas de resolução nativa identificam `quality=balanced`, canvas 1440×1000. O vídeo/capturas do percurso completo usam Eco; essa configuração está registrada e não representa um corte novo na qualidade padrão. A captura usa FFmpeg Debian 7.1.5 instalado, com seleção de executável apenas no helper de validação, sem editar dependências.

## Custo e preservação

Os 56 assets nativos rastreados da fonte permanecem idênticos por SHA-256 à base. Os 40 recursos nativos do ZIP (36 imagens/fontes/vetores e quatro modelos) são idênticos ao pacote V23, incluindo os assets ESO cacheados não rastreados. Perfis de pixels, rig, viagens e imagens não foram reduzidos nesta rodada.

A atmosfera acrescenta um lote na identidade; o halo reutiliza uma textura e uma leitura do atlas. Não se adicionou bloom global. Na amostra Eco em 1440×1000, o canvas permaneceu 763×530 (404.390 pixels), com duas superfícies de mãos. Contagens observadas: 22 draws no Observatório, 17 no vínculo e 15 na identidade; variam conforme passes/estado. Texturas e draws não medem RAM/VRAM totais. A conferência pareada com movimento reduzido, mesmo Chrome, Eco e viewport registrou:

| Cena | Draws V23 | Draws V24 | Texturas nas duas versões |
| --- | ---: | ---: | ---: |
| Observatório | 22 | 22 | 13 |
| Vínculo | 16 | 16 | 12 |
| Identidade | 13 | 14 | 15 |

Canvas 763×530, duas superfícies de mãos e quantidade de glifos iguais nas duas versões. A diferença de um lote na identidade corresponde aos vestígios. Esses valores de repouso não devem ser confundidos com a amostra com poses/transições acima. No pacote HTTP, instrumentação dos métodos de desenho constatou **zero draws de WebGL durante 500 ms com o papel ativo**, tanto no desktop como em 320×568; o formulário e o salvamento continuaram funcionando. O chunk de regras não foi solicitado no Observatório e foi carregado ao retomar as decisões.

Não há alegação de novo ganho percentual de FPS nem de teste de desempenho no computador do usuário.

## Entrega e homologação

`ORION-SITE-V24.zip` contém o site estático com `index.html` na raiz, instruções e este relatório. Upload manual no Cloudflare Pages; não requer token para preparar o arquivo. O pacote servido separadamente em HTTP passou em 1440×1000 e 320×568, com salvamento, retomada, leitura do capítulo de regras, ausência de overflow, erros JS, HTTP de erro e requisições de escrita. O fallback de cópia mediu 324×40 e 226×40 px, respectivamente. A verificação do pacote, CRC, hash e capturas ficam em `continuidade-v24-validation/`.

**Implementado:** interface, efeitos e decisões locais descritos acima. **Testado:** regras, percursos locais, regressões Chrome e pacote HTTP. **Homologação pendente:** aprovação artística pelo usuário, comportamento/desempenho desta versão no Brave/GTX 1660, aparelhos físicos e futura integração autenticada com as regras completas.

Instruções de reinício do protótipo foram acrescentadas ao campo `start_skill` do rascunho do ambiente usando `cloud-environment-onboarding:setup`; instalação/rede/secrets anteriores foram preservados. Salvar instruções não publica o ambiente nem comprova restauração em outra tarefa. Nenhuma nova credencial foi necessária para o ZIP.

Órion Fichas continua em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, árvore rastreada limpa. Projeto principal preservado. Sem deploy executado, migração remota, produção, merge ou nova PR. A distribuição do arquivo usa a branch visual previamente autorizada.
