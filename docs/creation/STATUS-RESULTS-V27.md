# V27 — Ficha de status com personagem em corpo inteiro

06/11/2026. Observatório independente, branch `feat/nascimento-marcado`, base V26 `c02557b9a95cf01b8e91a400cf93cb3d7dfe51d2`. Fonte Fichas protegida `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, intacta.

## Implementado

A consulta do personagem criado agora abre uma interface de status: corpo inteiro ao centro, Vida/Sanidade/Esforço à esquerda, atributos e identidade à direita. Cabeçalho com nome/origem/classe, nível e NEX separados; navegação persistente e linguagem do estudo original de arquivo paranormal tático. A silhueta provisória é um SVG original, sem rosto, identidade ou gênero presumidos. Ela não é um modelo 3D ou rig.

O jogador pode usar uma imagem própria de corpo inteiro (PNG/JPEG/WebP, até 6 MiB/16 MP). A imagem original é preservada como blob, sem edição ou upload remoto, em IndexedDB individual por personagem. Object-fit contain mantém a imagem inteira. Ao trocar, a nova imagem é decodificada antes da confirmação visual; ao remover, somente aquela arte é retirada. A imagem não faz parte do JSON exportado e não sincroniza entre domínios/aparelhos.

Abas implementadas consultam os dados reais do registro local:

- Visão geral com recursos, atributos, identidade e atalhos por contagem.
- Perícias treinadas, atributo, finalidade, exemplo e busca.
- Habilidades registradas e referências da classe/origem, vivência e marcas do tempo. Referência visual não concede habilidade ou efeito.
- Rituais registrados com nome, elemento e círculo; sem gasto automático.
- Inventário com ícones, seleção e detalhes de catálogo. Categoria é identificada como de catálogo, sem presumir desconto ou que todo item está equipado.
- História, profissão e textos do personagem, escapados como conteúdo, sem executar marcação.

Nas demais abas, o corpo cede espaço ao conteúdo; os recursos continuam disponíveis. Teclado segue tabs com ativação manual, setas/Home/End e foco visível. A lista de personagens abre em diálogo nativo, com retorno de foco; imagem/recursos continuam separados entre registros.

Os botões ±1 ajustam somente recursos locais da sessão, de zero ao máximo de referência já salvo. Esses valores ficam em `orion-session-v1:<id>`, sem modificar atributos, máximos, nível, NEX, inventário, grants ou o personagem original. Escrita é verificada e erros são anunciados sem sucesso fictício. Web Locks serializa operações quando disponível; armazenamento local não é substituto do controle de concorrência do Worker. Valores ausentes permanecem `—`, com controles indisponíveis. Não foram inventadas regras para morte, temporários ou condições.

O JSON conserva o formato do personagem e acrescenta `sessionState` separado. A ficha anterior continua acessível em **Ficha em papel**, `view=paper`, com retorno para o status. Criação, recrutamento, Observatório e dados existentes foram preservados. Oficina de edição e Evolução ainda não foram implementadas nesta interface; são próximas etapas do planejamento, não botões simulados.

## Analisado e pesquisa

[Plano e pesquisa](status-v27-validation/PLANO-E-PESQUISA.md) recupera o estudo AAA e compara a estrutura de ficha Foundry PF2e com o exemplo funcional de tabs W3C APG. Fontes efetivamente lidas e tentativas 403/404 estão em research-sources.json; nenhum template indisponível é apresentado como inspecionado. Conceitos foram adaptados sem copiar código, logos, regras ou assets. Nenhuma nova imagem foi gerada por IA.

A ficha usa DOM/CSS/SVG, sem WebGL ou loop 3D. A figura padrão tem 2.525 bytes. A animação de entrada é finita e desativada em movimento reduzido. Não houve nova dependência npm ou redução dos assets originais. Os tamanhos reais do build estão no log; não há alegação de RAM/VRAM ou FPS de GPU física.

## Testado

Node 24.19.0, Playwright 1.56.1, Chrome 156.0.8078.47/SwiftShader. Check, **27 arquivos unitários** e build Vite com assets ESO cacheados aprovados. O download externo do comando completo não foi reexecutado; o aviso existente de chunk principal continua no log.

**52 cenários distintos de navegador aprovados**, sem retries automáticos: 14 novos de status e 38 de criação/recrutamento/equipamento/diagnóstico. A rodada inicial das 38 regressões passou em 35; os três percursos completos procuravam a história no conteúdo da antiga página única. Foram adaptados para abrir a aba História e repetidos, mantendo a checagem do texto e de marcação não executada. Os três passaram; a rodada final de 17 também aprovou os 14 de status. Repetições não são somadas como cenários novos.

Cobertura: três classes, consulta das seções, visão geral e inventário em 1920×951, 1440×1000, 390×844, 320×568 e 568×320; ausência de overflow horizontal; teclado/foco/busca; referência ausente sem recursos fictícios; ajustes/reload/exportação; quota negada sem falso sucesso; imagem válida, recarga, rejeição de arquivo inválido e remoção; isolamento de imagem/recursos entre dois personagens; retorno ao papel e Observatório. Unidade também verifica limites, dados corrompidos preservados e ausência de mutação do registro.

Os 1.319 testes do Fichas pertencem à rodada V24, não foram reexecutados nesta rodada. Não confundir testes de Chrome/mobile emulado com homologação de hardware físico.

A conferência visual encontrou duas falhas: uma regra de especificidade fazia os recursos empilharem no mobile, empurrando o corpo abaixo da primeira área visível; e a troca de imagem anunciava a gravação antes de finalizar a exibição. A grade mobile e a espera por decode foram corrigidas, com verificações adicionais. Os primeiros testes automatizados não haviam detectado essas duas questões visuais.

Capturas e vídeo reais em 1920×951, 390×844 e 320×568 usam Íris Moreira fictícia com escolhas preparadas. A figura está inteira no seu enquadramento, com rolagem da página em viewports menores; não há recorte por cover. O número de canvases observado na ficha é **zero**, sem erro JS/HTTP ou requisição de escrita remota nos percursos capturados. O módulo da ficha mede 24,31 kB de JS (8,46 kB gzip) e 22,96 kB de CSS (5,45 kB gzip) no build, incluindo a consulta anterior.

O ZIP foi servido por HTTP e exercitado em 1440×1000 e 320×568: criação, categoria corrigida, status com corpo inteiro, ajuste/reload de recursos, exportação com sessão, retorno ao papel e estrela registrados aprovados. Zero draws WebGL durante o recrutamento e nenhum canvas na ficha de status. **56 assets anteriores rastreados** e **40 recursos visuais/modelos/fontes anteriores do ZIP** permanecem idênticos à V26; o novo SVG é adicional.

## Entrega e limites

ZIP estático para upload manual no Cloudflare, com index.html na raiz, imagens/vídeo reais e relatório. Arte de corpo inteiro da demonstração personalizada reutiliza o combatente-v20.png já existente, como arquivo escolhido pela fixture fictícia Íris Moreira; não é a aparência padrão imposta ao jogador.

A ficha permanece local ao site/navegador. Não implementa conta online, D1, ativação oficial, importação JSON ou backup da imagem. Pendências de regras continuam registradas. Homologação artística e Brave/GTX 1660/aparelhos físicos permanecem pendentes. Sem deploy, produção, migração remota, merge ou nova PR; o projeto principal e o Fichas protegido foram preservados.
