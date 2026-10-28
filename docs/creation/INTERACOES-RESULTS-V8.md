# V8 — Voltar, brilho, profundidade e convites de interação

28/10/2026. Implementado no estudo visual do Observatório, na branch de prévia. Avaliação artística e homologação em aparelho físico continuam pendentes.

## Falha reproduzida e correções

A seta tinha URL válida, mas `elementFromPoint` atingia `.creation-stage`, que cobria todo o painel e interceptava o clique. Uma tentativa real do Playwright falhou por interceptação. A correção eleva o link na hierarquia de composição; o destino e os módulos de viagem originais permanecem. Testes novos exercitam clique e toque tanto na etapa fetal quanto na identidade e confirmam a volta à estrela de criação.

Os sigilos receberam emissão dourada mais intensa, com variação luminosa discreta e bloom seletivo nos perfis que o habilitam. Eco conserva os glifos dourados sem ativar um passe de bloom adicional. As cinco faixas, frase, fonte fornecida e oclusão do corpo permanecem.

O feto e as duas formas recebem contorno externo dourado calculado a partir da cobertura da própria imagem; o núcleo permanece preto e opaco. O contorno intensifica ao apontar/focar e ao selecionar uma forma. Não foi adicionado campo de força. Um convite visível “Clique para despertar”/“Toque para despertar” acompanha a etapa inicial; as escolhas têm rótulos com aparência de botão, “Selecionar” e “✓ Selecionado”. Teclado e movimento reduzido preservados.

## Camadas e paralaxe

A cena mantém uma fundação distante pintada, uma camada de tinta à esquerda, outra à direita e névoa procedural periférica mais próxima. As duas camadas laterais usam máscaras diferentes sobre a textura original compartilhada, sem duplicar arquivos nem apresentar cópias integrais do fundo. A névoa usa ruído e transparência próprios. São quatro componentes no perfil Balanced e três nos perfis Eco/Lite, que omitem a névoa próxima. As pinturas horizontal e vertical da V7 são preservadas, com troca ao girar a tela.

As camadas têm deslocamentos e interpolação próprios, com amplitudes menores. O deslocamento da base passou de .014/.010 para .004/.003, e a resposta suavizada de ganho 5 para 2,4. Na criação, translação/inclinação da câmera passaram a 35% da amplitude anterior, com resposta mais lenta. Os valores do Observatório original seguem os anteriores.

A inspeção de 320×568 encontrou sobreposição dos novos rótulos de seleção com o nome. Nesse tamanho o quadro das figuras e os botões ficam mais compactos. Um teste exige separação entre os botões e o rótulo do campo; não basta estarem dentro da tela.

## Verificações reais

- Node 24.19.0, `npm run check` aprovado e 17 arquivos de testes unitários aprovados, zero falhas/skips.
- 16 cenários de navegador aprovados, incluindo retorno real nas duas etapas por clique/toque, destaque ao apontar, confirmação visual da escolha, oclusão com bloom, rotação, transição, teclado, movimento reduzido e navegação da estrela vazia.
- Após o ajuste compacto: um cenário específico aprovado (8,5 s) e nova verificação HTTP/captura em 320×568 sem erros, sobreposição dos rótulos ou scroll.
- Bundle Vite final aprovado, usando a fotografia ESO local já preparada. O download externo do build completo não foi revalidado nem apresentado como aprovado; a limitação 403 registrada na V7 permanece separada do empacotamento local.
- Pacote servido por HTTP exercitado em 1440×900, 390×844, 844×390 e 320×568: sem erros de JS/console/HTTP, controles dentro do quadro, scroll zero e rascunho local correto. Após o ajuste compacto há verificação adicional específica de 320×568.

Capturas e vídeo são do navegador executando o pacote estático, em `interacoes-v8-validation/`. Chrome headless/SwiftShader e toque emulado não comprovam FPS em GPU física nem funcionamento do teclado virtual de telefone real.

## Escopo preservado

Sem alterações no Órion principal, nas regras/dados de Fichas, nem nos módulos originais de seleção, viagem, véu e mesh das mãos. Preservados formulário, fonte, silhuetas e rascunho local. Sem migração, PR nova, merge ou deploy de produção/Cloudflare. ZIP para envio manual, com `index.html` na raiz e todos os recursos usados locais. A direção visual depende da avaliação do usuário.
