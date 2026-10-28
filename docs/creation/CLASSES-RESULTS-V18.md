# V18 — Três classes em uma roleta sobre papel

28/10/2026. Implementação no protótipo estático do Observatório, branch `feat/nascimento-marcado`. Base V17: `9b991c1f58ac1aa5a6ee9dc13ef1ceb974a418d0`. Implementado e testado em Chrome; aprovação artística e telefone físico ainda pendentes.

## Implementado

Confirmar a origem libera **Continuar para classe**. A folha passa a apresentar três silhuetas: Combatente com colete/arma, Especialista com bolsa/caderno/lanterna e Ocultista com manto/livro. São ilustrações de função, com rostos sem traços; objetos e roupas não são aparência obrigatória nem equipamento concedido ao personagem.

A roleta traz a classe em destaque para a frente, com escala e profundidade. Pode ser explorada por setas, nomes, clique nas figuras, teclado e deslize horizontal. **Girar roleta** faz um giro com parada variável apenas para explorar; nunca confirma uma classe. O usuário mantém a decisão por **Escolher esta classe**. Movimento reduzido pula a órbita animada.

À direita, ou abaixo no telefone, aparecem a diferença principal, dois pontos fortes, duas limitações e um exemplo fictício curto de personagem. Não são histórias obrigatórias ou transcrições dos livros. A comparação de números fica fechada inicialmente para evitar repetir o problema de excesso de texto. A tabela explicita PV/PE/SAN, os valores-base e as escolhas livres de perícias + INT; atributos, origem e outras escolhas podem alterar os totais.

A confirmação grava apenas `classCode` e `step: class` no rascunho da aba. Preserva nome, representação e origem. Retornar às origens/identidade e entrar novamente preserva a classe confirmada. Se houver falha de armazenamento, não anuncia sucesso. Não há cálculo de recursos, concessão de perícias/rituais/itens ou etapa de atributos implementada nesta entrega.

## Conteúdo analisado e procedência

As três classes e bases foram conferidas por leitura e comparação automatizada com `public/rules-core/index.mjs` e `public/creator-guidance.js` do Órion Fichas em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`. Bases: Combatente 20/2/12, Especialista 16/3/16, Ocultista 12/4/20 (PV/PE/SAN); escolhas livres 1/7/3 + INT, além dos treinamentos fixos. Hashes e paridade em `classes-v18-validation/source-audit.json`. As diferenças editoriais descrevem tendências e custos; não criam proibições de combate ou de paranormal para outras classes. Não foi feita nova conferência integral dos PDFs.

O atlas `classes-v18.png` foi gerado com image_gen nesta conversa, em PNG RGBA nativo 1536×1024, sem edição dos pixels. Três colunas iguais são exibidas por CSS. O arquivo original e o arquivo publicado têm o mesmo hash, registrado no manifesto. O movimento é feito com planos 2.5D e Web Animations API; as novas figuras não possuem rig de ossos. As mãos e seu mesh existente permanecem preservados. Não se atribui autoria manual às figuras geradas.

## Testado e evidências reais

- Node 24.19.0; **22 arquivos unitários passaram**, sem falhas/skips. Incluem catálogo, índice cíclico, geometria orbital, confirmação imutável e ausência de concessões no rascunho.
- `npm run check` passou. **Bundle `npx vite build` passou**, usando os recursos ESO já presentes. O comando completo `npm run build` foi tentado e falhou ao baixar a fotografia da ESO (fetch; o teste HTTP separado recebeu 403 do proxy). Repetir com suporte a proxy não resolveu. Nenhum recurso foi substituído para contornar essa falha: os sete arquivos ESO usados no pacote têm hash idêntico ao ZIP V17. Não se declara o comando completo de build aprovado. O script externo foi preservado por estar fora do escopo.
- **19 cenários de navegador passaram na rodada final**: seis de classes, seis do papel/origens, quatro de materiais/pictogramas e três de leitura/guia. Janelas incluem 1440×1000, 1855×711, 390×844, 320×568 e 568×320. Conferidos teclado, ciclo das três opções, toque/deslize seguido de botões, giro sem confirmar, cancelamento do giro ao voltar, retorno com escolhas preservadas, recusa de armazenamento, filtros/guia/comparação e cobertura fixa da madeira.
- Falha reproduzida antes da correção: a primeira rodada teve 13 sucessos e três falhas móveis; após arrastar, o toque de confirmação nem sempre produzia o evento click no Chrome emulado. Ajustes de touch-action/estado e a tentativa de usar o mesmo canal CDP não bastaram, com três falhas em cada tentativa. A correção reconhece um toque deliberado por pointerup, rejeita arraste/cancelamento e elimina o click compatível duplicado, mantendo mouse/teclado. Os três testes móveis passaram após a correção e voltaram a passar na rodada final. Logs anteriores permanecem como evidência, sem serem apresentados como aprovados.
- Contraste amostrado sob glifos em **26 combinações de texto/janela**, desktop e móvel. Fundos e glifos medidos por capturas com cores temporariamente mascaradas; transições/movimento desativados apenas no ensaio. Mínimo observado **4,82:1**. Resultado local, não certificação WCAG completa.
- Pacote extraído servido por HTTP local, com capturas reais e vídeo: giro, exploração das três classes, comparação e confirmação; no toque móvel, leitura e confirmação. Nenhum erro JavaScript, resposta HTTP de erro ou requisição de escrita remota no ensaio. `validation.json` registra rascunho final e resultados. O vídeo MP4 é uma gravação real recortada a partir da entrada na classe e convertida para H.264; não é animação montada com capturas.

Capturas desktop das três classes, comparação e confirmação; duas capturas móveis; vídeo `CLASSES-V18.mp4`; logs, contraste e provas de preservação em `classes-v18-validation/`. Testes automatizados em `tests/class-carousel.spec.js` e `tests/class-carousel.unit.mjs`.

## Preservação e limites de homologação

Seleção de estrelas, viagem, véu/transição e mesh das mãos continuam byte a byte idênticos ao original `a45c8d6d89c5be4892fa049ed755218fad3fb006`. `main.js`, estado/camadas de criação, CSS do papel, catálogo, descoberta, pictogramas e exemplos de origens não foram alterados em relação à V17. A integração nova está em `origin-workshop.js` e `herald-creation.js`, com módulos/arte/testes novos para classes. Provas em `preservation.json`.

Órion Fichas permanece no HEAD esperado, árvore rastreada limpa. Sem alterações no Órion principal, Worker, D1, migrações, recursos de produção, merge ou PR nova. Entrega em ZIP para upload manual; sem deploy Cloudflare.

**Testado por automação:** fluxos e condições descritos nos ensaios. **Homologação ainda pendente pelo usuário:** qualidade artística, compreensão por jogadores novos e uso/desempenho em telefone físico. Chrome headless/SwiftShader e toque emulado não validam GPU ou teclado virtual reais. A experiência continua um protótipo de apresentação com rascunho local; recarregar reinicia a cena.
