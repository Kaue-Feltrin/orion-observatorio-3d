# V19 — Identidade de gravura, movimento e redução real da carga

28/10/2026. Revisão do protótipo do Observatório, base V18 `d8151b721653ca0c0cff28b7bda75ac76c7efd84`, branch `feat/nascimento-marcado`. O relato é de baixo FPS no Brave de um PC com GTX 1660, com comportamento melhor no PC do trabalho, além de silhuetas genéricas, pouca resposta visual e uma letra piscando na cena do feto. Não houve acesso ao Brave ou à GPU desse usuário. As verificações abaixo são locais em Chrome headless/SwiftShader e toque emulado.

## Visual implementado

A direção anterior — colete/arma longa, técnico com caderno e figura de manto/livro — foi substituída por três gravuras de investigação paranormal. Combatente em postura de defesa com antebraço enfaixado e lâmina baixa; Especialista inclinado sobre uma pista, mapa e lanterna; Ocultista suspenso com mão aberta e papéis. Rostos permanecem sem traços. Preto, cortes de marfim e pequenos vínculos vermelhos relacionam as figuras ao papel e ao nascimento, sem definir a aparência real do personagem. As figuras e seus objetos são representações editoriais, não itens concedidos ou requisitos das classes.

São três PNGs independentes, nativos 1024×1536 com alpha, gerados/editados com image_gen e publicados sem edição de pixels. Dois atlas intermediários não respeitaram os gutters e foram descartados da entrega; a separação em arquivos removeu a necessidade de recortar colunas. Procedência, tamanho e hashes em `art-provenance.json` e no manifesto do workshop. Não são artes manuais ou assets oficiais dos livros. A avaliação de identidade/qualidade continua sendo do usuário.

Na roleta, a figura em destaque recebe um movimento discreto por função; a do Ocultista flutua 5 px, as outras têm variações pequenas de postura geral. O apontar desloca a camada em até 2,5 px horizontalmente. O texto entra em sequência e uma inscrição tênue com a fonte de conhecimento fornecida gira lentamente. As figuras continuam sendo imagens 2.5D, sem rig de ossos ou animação anatômica nova. Nenhuma escolha é feita pelo movimento: giro/nav apenas exploram e confirmar continua obrigatório. Movimento reduzido desliga as animações novas. O renderer WebGL permanece suspenso sob a folha.

Origem, nome, representação, retorno, comparação e as bases das classes permanecem iguais à V18. Madeira, papel e organização de origens anteriormente aprovados foram preservados.

## Desempenho: falha reproduzida e correção

Na criação, `pixelRatioForViewport` tinha uma exceção que mantinha até 2,2 milhões de pixels no automático, ignorando o teto dos perfis mais leves. Na amostra 1440×900, o monitor mudou de balanced para lite e eco-plus, mas o canvas continuou em **1.296.000 pixels** em todas as seis observações anteriores. Isso foi reproduzido na aplicação, não apenas inferido do código.

A criação agora usa o mesmo orçamento de pixels do perfil que o Observatório. No ensaio posterior, o canvas caiu de 1.296.000 para 729.000, 466.560 e **363.951 pixels** ao chegar ao Eco. O MSAA também deixou de ser imposto à criação nos perfis normais; contornos de alpha e filtragem das imagens continuam. Antialias do contexto é uma escolha da inicialização, não algo trocado ao vivo. O monitor observa janelas de 2,4 s com pelo menos 12 quadros; reage a uma janela muito lenta ou duas moderadamente lentas. Carregamento, viagem e retomada de aba não viram amostras de degradação, e movimento reduzido não bloqueia mais o ajuste da qualidade.

`performance-before.json` e `performance-after.json` guardam as seis observações de cada execução. No software renderer, o indicador da aba ficou perto de 3 FPS antes e terminou perto de 10 FPS depois. Essas execuções únicas, com resoluções diferentes e janelas pequenas, **não são benchmark repetido, resultado da GTX 1660 ou garantia de fluidez no Brave**. A evidência direta é a redução real de pixels e o funcionamento do fallback. Não foi identificada a causa específica da diferença entre os dois computadores.

Foi incluído **Fluidez**, disponível no Observatório e no feto/identidade: Automático, Mais fluidez e Mais detalhe. A mudança é aplicada ao vivo e salva somente a preferência nesse navegador; uma qualidade explícita na URL tem prioridade. Não reinicia nome/origem/classe nem recarrega a cena. O controle fica oculto sob o papel e durante a viagem, não cobre Sair ou Voltar. A área opcional Diagnóstico informa o renderizador WebGL disponível, qualidade, pixels e FPS recente da aba; Copiar diagnóstico só usa a área de transferência após ação do usuário. Não há envio de telemetria. Esse diagnóstico permite verificar posteriormente se o Brave está usando a GTX 1660 ou um renderizador por software, sem presumir o resultado.

## Sigilo piscando: limite da reprodução

O índice do glifo chegava ao fragment shader por uma variável interpolada e passava diretamente por `mod`/`floor`. Pequenas imprecisões perto de 0 e 8 podiam selecionar outra célula. O índice agora é quantizado com `floor(vCell+.5)` antes de calcular a célula.

Foi feito um ensaio WebGL com o fragment shader real, 12 índices válidos e perturbações controladas de ±0,000002, usando uma textura de referência que isola o alpha da célula esperada. A V18 acertou **34/36**, com dois acessos incorretos; a V19 acertou **36/36**. Todos os 12 caracteres usados constam no cmap da fonte fornecida; fonte, frase, 240 glifos, cinco órbitas, brilho e libertação foram preservados. Resultados completos em `sigil-atlas-boundary.json` e teste em `tests/sigil-atlas.spec.js`.

Esse ensaio reproduz uma falha numérica concreta de amostragem. **Não é uma gravação da letra piscando no Brave do usuário** e não comprova que toda cintilação relatada vinha desse defeito. A correção ainda precisa de confirmação nesse navegador.

## Testes e evidências

- Node 24.19.0; `npm run check` aprovado e bundle `npx vite build` aprovado. O passo separado que baixa a fotografia ESO não foi reexecutado nesta revisão: a falha externa da V18 está documentada no relatório anterior. Os sete recursos ESO usados aqui têm hash igual ao ZIP V18. Não se declara o comando completo `npm run build` aprovado nesta revisão.
- **23 arquivos unitários aprovados**, sem falhas/skips na rodada final. A primeira execução teve 22 sucessos e uma falha no novo ensaio do monitor: o helper simulava só 2,8 s e exigia resultado de duas janelas de 2,4 s. O horizonte de simulação foi corrigido; não se relaxou o comportamento do aplicativo para aprovar o teste.
- **33 cenários Chrome distintos aprovados**: rodada inicial de 24, oito regressões e rodada final de quatro controles de qualidade (três reexecuções e um cenário novo). Cobrem seis de classes, seis da criação cinematográfica, seis de interação/retorno, três de leitura/guia e três do controle de qualidade; depois três viagens em profundidade, quatro de madeira/pictogramas e o teste WebGL do atlas. Incluem desktop, toque 390×844/320×568 e janela horizontal 568×320. Nenhuma dessas três rodadas teve falhas. O cenário adicional confere que o ajuste sai da interação durante a viagem e o destino continua correto.
- Mudança ao vivo de resolução, preferência entre páginas, prioridade da URL, retorno ao automático, foco/Escape, diagnóstico disponível, toque e ausência de sobreposição com Sair/Voltar verificados. Giro não confirma classe, retorno preserva escolhas e recusa de armazenamento continua sem falso sucesso.
- Contraste sob glifos amostrado em **30 combinações** desktop/móvel, incluindo o marcador e o nome de classe ativo agora avermelhados. Mínimo observado **4,85:1**. As inscrições são decorativas e têm `aria-hidden`; não substituem texto legível. Amostra local com movimento/transições desativados apenas na medição, não certificação WCAG completa.
- Pacote estático servido em HTTP local: capturas de desktop/móvel, navegação, comparação e confirmação; zero erros JavaScript, respostas HTTP de erro e escritas remotas no ensaio. A captura afirma a URL real do pacote antes de registrar o resultado. Capturas de leitura aguardam as animações finitas terminarem; o vídeo registra o movimento real, sem compor frames de telas estáticas.

Evidências em `identidade-v19-validation/`: telas, `CLASSES-V19.mp4`, logs, parâmetros e resultados. O MP4 é recortado a partir da entrada na classe e convertido para H.264; é uma gravação real do pacote. A primeira inspeção foi feita no servidor de preview; a entrega documentada usa a captura posterior do pacote servido na porta 4299. Não se afirma teste em Brave, telefone físico, GTX 1660 ou GPU dedicada nesta máquina.

## Integridade e homologação

Dezoito módulos essenciais foram comparados com a V18 e permanecem idênticos, incluindo criação/rig/fundo, regras de apresentação, origens e integração do fluxo. Os quatro módulos originais de seleção, viagem, véu e mesh das mãos continuam idênticos ao baseline `a45c8d6d89c5be4892fa049ed755218fad3fb006`. Trinta imagens históricas da criação foram preservadas. Alterações de runtime limitadas ao orçamento/controle de qualidade em `main.js`, amostragem em `creation-sigils.js` e apresentação das classes. Provas em `preservation.json`.

Órion Fichas segue no HEAD `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, árvore rastreada limpa. Sem alterações no Órion principal, motor de regras, Worker, D1, migrações ou recursos de produção. Sem merge, PR nova ou deploy. ZIP para upload manual.

**Implementado:** direção das gravuras, movimentos e controles/correções descritos. **Testado:** os ensaios locais acima. **Homologação pendente:** aparência menos genérica segundo o usuário, desempenho e letra piscando no Brave do PC com GTX 1660, além de aparelho móvel real. O fluxo continua um protótipo de apresentação e rascunho local, sem concessão automática de recursos ou contas reais.
