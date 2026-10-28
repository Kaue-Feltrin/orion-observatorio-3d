# V17 — Menos texto, exemplos de passado e guia explícito

28/10/2026. Revisão do protótipo físico da V16, em `feat/nascimento-marcado`. Implementada e verificada em Chrome. Qualidade artística e uso em telefone físico ainda dependem de avaliação do usuário.

## Leitura e conteúdo

A lista apresenta somente ícone e nome. O painel aberto começa pelo nome e por um exemplo curto de passado, seguido das perícias e do nome da habilidade. Contexto e fonte ficam recolhidos em “Ver contexto e fonte”. A necessidade de especialidade de Profissão continua visível; perícia variável continua indicada junto às perícias. A informação foi redistribuída, sem apagar metadados ou esconder escolhas necessárias.

Foram escritos **66 exemplos fictícios**, um por origem do catálogo existente. São sugestões simples para imaginar o personagem, não citações dos livros, benefícios, pré-requisitos ou histórias obrigatórias. Exemplo de Agente de Saúde: “Você cuidava de pacientes no plantão noturno de um hospital.” Os exemplos também aparecem na comparação e entram na busca por ideia, sem alterar o catálogo canônico.

Texto maior e entrelinhas ampliadas, com mais distância entre os blocos. Rótulos repetidos e os treinamentos duplicados em todas as linhas da lista saíram da leitura inicial. Na amostra da mesma origem, em desktop 1440×1000, o painel inicialmente expandido passou de **49 para 31 palavras**; sua linha na lista passou de cinco para três palavras. Método e textos exatos em `reading-comparison.json`. Essa amostra não mede compreensão nem representa uma porcentagem geral de todas as origens.

## Guia e retorno visível

“Me ajude a escolher” abre oito opções com pictogramas e nomes curtos; a lista e as ferramentas de busca ficam recolhidas nesse momento. Ao escolher um interesse:

1. O guia limpa busca/livro/perícia anteriores para começar por esse interesse.
2. Fecha as opções e mostra um aviso com marca de confirmação, **Filtro aplicado**, nome do interesse e quantidade de origens.
3. Leva a rolagem ao aviso e o foco de teclado ao título dos resultados.
4. Oferece “Trocar interesse” e “Limpar filtros”. Ao reabrir, o interesse atual está marcado.

A prévia de origem anteriormente aberta é limpa para não deixar um detalhe que contradiz a nova lista. Uma origem já confirmada no rascunho permanece preservada: usar o guia nunca confirma, troca ou apaga a decisão gravada. Abrir uma nova origem continua exigindo confirmação explícita para alterar o rascunho.

O aviso também identifica combinações de busca, livro e perícia quando usados na exploração direta. Seu fundo recebeu um gradiente opaco para estabilizar o contraste, após a primeira amostragem de repinturas do fundo translúcido não atingir 4,5:1 na contagem.

## Verificações reais

- Node 24.19.0. `npm run check` e bundle Vite aprovados.
- **21 arquivos unitários aprovados**, zero falhas/skips. Incluem cobertura dos 66 exemplos, tamanho curto, pesquisa pelos textos, catálogo e pictogramas preservados e ausência de concessões remotas.
- **13 cenários de navegador aprovados** após implementar a nova organização e o guia. Cobrem feedback aplicado, foco, troca e limpeza, remoção de filtros antigos, exemplo visível, contexto recolhido, aviso de Profissão, nome como texto, armazenamento recusado, comparação/Escape, retorno/reabertura e confirmação. Permanecem os três testes de madeira e os testes de ícones da V16. Janelas: 1855×711, 1440×1000, 390×844, 320×568 e 568×320.
- Após o ajuste de contraste do aviso, **três cenários de leitura/guia reexecutados e aprovados**. As rodadas anteriores de 13 cenários também foram aprovadas; não houve falha funcional nesses ensaios.
- Amostragem de contraste sob glifos em 30 combinações de texto/janela, 1440×1000 e 390×844, com transições desativadas apenas no ensaio. Ver `contrast-before.json`, `contrast-glyphs.json` e os logs para valores observados. O primeiro ensaio da contagem não passou; não é apresentado como aprovado. O ensaio final inclui o aviso do guia, os exemplos, as perícias, o contexto expansível e a ação de escolha, com mínimo de **5,13:1** entre os textos amostrados. É amostragem local, não certificação WCAG completa.
- Pacote estático servido por HTTP: capturas e vídeo reais de desktop e toque móvel emulado. Conferidos guia → filtro aplicado → exemplo, preservação da origem já confirmada ao usar o guia, rascunho, madeira após rolar e suspensão do shader da criação sob a folha. Nenhum erro JavaScript, resposta HTTP de erro ou requisição de escrita remota no ensaio.

Evidências em `leitura-v17-validation/`. O vídeo registra a aplicação real; não é uma composição de telas. Chrome headless/SwiftShader e toque emulado não homologam teclado virtual, desempenho de GPU ou navegador de telefone físico.

## Integridade e limites

`main.js`, `herald-creation.js`, catálogo, pictogramas, CSS/camadas/rig da criação e sigilos permanecem idênticos à V16 (`c6f10afdb10d4f6e8fbd18059bf6cf4d1595bfe6`). Mantidos os quatro módulos originais de seleção, viagem, véu e mesh das mãos. A textura de madeira e as demais imagens não foram regeneradas.

Órion Fichas continua em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, com árvore rastreada limpa. Alterados somente apresentação/descoberta de origens, textos editoriais, manifesto e testes/documentação. Sem mudanças em regras, Worker, D1, migrações, Órion principal, produção, merge ou PR nova. ZIP para upload manual; sem deploy Cloudflare.

Persistem os limites do protótipo: rascunho local, reinício da cena ao recarregar, ausência da próxima etapa mecânica e de concessão automática de benefícios. Os exemplos não certificam elegibilidade mecânica de nenhuma origem. Não foi declarada nova conferência integral dos livros.
