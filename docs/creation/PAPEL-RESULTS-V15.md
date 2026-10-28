# V15 — Do nascimento cósmico à ficha física

28/10/2026. Implementação no protótipo do Observatório, na branch `feat/nascimento-marcado`. A V14 permanece como início aprovado. Esta nova etapa foi implementada e exercitada em Chrome; avaliação artística do movimento e homologação em aparelho físico continuam pendentes.

## Direção e fluxo implementados

A experiência deixa a névoa depois que o jogador confirma nome e representação. Seis tábuas caem e assentam em sequência; em seguida uma folha de papel chega sobre a madeira. Os controles aparecem somente após a folha assentar. O início cósmico continua representando o nascimento; o papel passa a organizar a história e as escolhas.

A madeira usa um PNG nativo de 1536×1024 gerado nesta conversa, com veios horizontais e acabamento fosco. Cada tábua tem enquadramento próprio, junta e sombra. Papel, grão, linhas e tipografia são HTML/CSS/SVG, sem imagem de ficha rasterizada: texto e controles continuam selecionáveis e acessíveis. A queda usa planos e Web Animations API, não física rígida, mesh de madeira ou simulação de colisões.

A textura é preparada a partir de Tornar Marcado para evitar aguardar o download depois do preenchimento do nome. Enquanto o papel cobre a cena, o RAF existente permanece agendado, mas o trabalho do renderer da criação é suspenso. Ao voltar, o relógio já está atualizado e a mesma identidade reaparece. Movimento reduzido remove a queda e usa uma dissolução curta.

## Descoberta de origens

- Catálogo de referência preservado do Órion Fichas PR179: **66 origens**, sendo 25 do Livro Base, 19 de Sobrevivendo ao Horror, 20 do Suplemento Órion e duas de Arquivos Secretos #7. Snapshot de catálogo de 16/10/2026; não é alegação de cobertura integral do Manual Consolidado.
- Busca normalizada por nome, perícia, habilidade, ideia de história e alguns termos de entrada comuns, como médico/computador. Acentos e pontuação não precisam ser reproduzidos. Os termos digitados se combinam por AND.
- Oito interesses, associados às perícias do catálogo. Filtro de interesse é único; livro, perícia e busca se combinam com ele. Esses grupos são navegação editorial, não classes oficiais, pré-requisitos ou indicação de melhor build.
- Caminho “Me ajude a escolher”, com perguntas sobre o passado imaginado, e filtros de livro/perícia recolhidos inicialmente. Quantidade de resultados, limpeza dos filtros e estado vazio explícitos.
- Detalhes com ideia de história, perícias associadas, nome da habilidade, livro e avisos de profissão/perícia variável quando presentes nos metadados. Ideias de história foram redigidas para a interface; não são citações ou descrições integrais dos livros.
- Comparação de duas origens em diálogo acessível, com fechamento por Escape. Ler, filtrar ou comparar não confirma uma origem.
- “Escolher esta origem” atualiza somente o rascunho local de sessão. O retorno preserva nome, representação e origem escolhida nesta experiência. Falha de armazenamento é informada sem fingir confirmação. Não há concessão automática de habilidade, treinamento, atributo ou benefício.

Não foram reextraídos os PDFs nem declarados como conferidos novamente neste incremento. Os nomes e metadados vêm do catálogo existente, com proveniência e hash registrados. A hierarquia já documentada no Órion Fichas — Manual Consolidado acima das fontes complementares — não foi alterada. A aplicação de textos completos, conflitos e efeitos pertence à conferência mecânica posterior.

## Verificações e resultados reais

- Node 24.19.0. `npm run check` e bundle Vite aprovados. **19 arquivos unitários** aprovados, zero falhas/skips, incluindo busca com acentos/aliases, filtros combinados, quatro fontes, imutabilidade e ausência de chamadas remotas no módulo da folha.
- Na primeira rodada unitária, 18 arquivos passaram e um falhou: Criminoso e Desocupado não tinham grupo de interesse. Adicionado grupo de discrição e incorporada Atualidades ao grupo de investigação/conhecimento. Nova rodada: 19 aprovados.
- Primeira rodada de navegador: 16 cenários aprovados. Após preparação antecipada do material e ajustes de apresentação: **17 cenários aprovados**, incluindo os seis novos da folha, cinco cenários de reflow, cinco do fluxo anterior e a regressão V14 de névoa/foco.
- Seis cenários da folha reexecutados depois do ajuste final de contraste: seis aprovados, zero falhas, conforme `paper-release-6.txt`. Cobrem confirmação explícita, armazenamento local, retorno/reabertura, fonte Arquivos Secretos, combinação vazia de filtros, guia, comparação/Escape, nome tratado como texto, armazenamento recusado e janelas de 390×844, 320×568 e 568×320.
- Pacote estático exercitado por HTTP, com vídeo Balanced em 1440×1000 e capturas móveis em 390×844. Conferida a sequência de estados tábuas → papel → escolhas e congelamento do tempo do shader da figura enquanto a folha cobre a cena. Sem erros JavaScript, respostas HTTP de erro ou requisições de escrita no ensaio. Esse congelamento verifica a suspensão implementada, sem anunciar medição de FPS/GPU de hardware real.
- Contraste medido sob glifos em 1440×1000 e 390×844. O primeiro método não estabilizava as transições de cor globais; os valores desse ensaio foram descartados. Com transições explicitamente desativadas apenas no ensaio, apareceram duas insuficiências reproduzidas: legenda editorial com cerca de 3,86:1 e perícias da lista chegando a 4,49:1 no móvel. Cores escurecidas; legenda ampliada de 10 para 11 px e rótulos de detalhes de 9 para 10 px. Mínimo final de 4,86:1 entre os textos amostrados; legenda acima de 5,07:1 e perícias da lista acima de 5,21:1. Valores finais e amostragem em `contrast-glyphs.json`. Trata-se de amostragem local, não certificação WCAG completa.

Logs, capturas, vídeo e JSONs em `papel-v15-validation/`. As capturas e o vídeo do pacote final mostram funcionamento real em navegador; não são composições desenhadas separadamente.

## Integridade e limites

Os quatro módulos originais de seleção, viagem, véu e mãos continuam idênticos à origem `a45c8d6d89c5be4892fa049ed755218fad3fb006`. Os módulos de arte/camadas/rig, CSS da criação e imagens da V14 continuam idênticos ao commit `a591a0a960eada3bcb3a9d46e3cce716c5d6f72c`. A integração acrescenta a folha na continuação e uma pausa limitada à criação no loop existente.

Órion Fichas permanece no HEAD `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, com árvore rastreada limpa. Nenhum código de Worker, regra, banco, migração ou recurso do Órion principal foi alterado. Sem produção, deploy Cloudflare, merge ou PR nova. ZIP estático para upload manual; fontes e livros integrais não foram redistribuídos no pacote.

Ao recarregar, a cena inicial continua reiniciando como antes; retomada automática ainda não foi implementada. A próxima etapa mecânica depois da origem continua fora desta entrega. Catálogo exposto não equivale a origem elegível/homologada para qualquer personagem. Testes headless/SwiftShader, toque emulado e preferências de movimento reduzido não substituem homologação de GPU, teclado virtual e navegador em telefone físico.
