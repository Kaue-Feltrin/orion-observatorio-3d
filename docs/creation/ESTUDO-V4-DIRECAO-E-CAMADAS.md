> Implementação posterior ao estudo: [V4 — Almas e camadas](ALMAS-RESULTS-V4.md). As declarações de planejamento abaixo registram a etapa anterior; o resultado e as verificações estão no documento de implementação.

# Estudo V4 — sugestão orgânica, silhuetas e profundidade

27/10/2026. Estudo de direção visual e implementação. Não altera a cena nem substitui o ZIP V3. A transição aprovada pelo usuário deve ser preservada.

## Diagnóstico

A comparação entre as imagens enviadas e `creation-cinematic.js` mostra:

- O vermelho usa uma imagem de tecido/anatomia literal. Escurecer esse arquivo não elimina sua leitura visceral; é necessário outro desenho de fundo.
- O segundo fundo contém bordas brancas e numerosos detalhes de alta frequência. O contraste local compete com as figuras e com o formulário. Dessaturar uma imagem não resolve essa competição.
- Os SVGs atuais têm contornos geométricos muito simplificados. As duas figuras compartilham praticamente o mesmo desenho; alterações de ombro não criam poses naturais. Arquivos maiores ou antialiasing não corrigem esse problema de desenho.
- Existem meshes diferentes para feto, campo e corrente. Porém há apenas um campo e uma imagem completa de correntes; os três são posicionados em Z=-42, com ordem de pintura. Não há uma passagem coerente dos vínculos por trás e pela frente do ser. A aparência é de moldura plana.
- O campo é um anel radial de ruído. Os elos dourados têm brilho intenso em grande parte do perímetro. A soma torna o recipiente protagonista.

## Direção visual recomendada

**Primeira cena:** preto e vinho profundo; manchas difusas de pigmento suspenso e sombras translúcidas com comportamento orgânico. Sugestão de sangue por cor, densidade e pulsação. Sem tecido identificável, veias, paredes anatômicas, túnel ou superfície molhada literal. Centro silencioso, com luz suficiente para ler a figura preta. A frase permanece “Tudo começa pelo sangue.”.

**Segunda cena:** vazio preto/cinza com violeta discreto, algumas estrelas isoladas e massas atmosféricas largas de contraste baixo. Eliminar o contorno branco de nuvens e a moldura dramática. A figura deve ser percebida antes do cenário, inclusive numa miniatura.

**Figuras:** silhueta significa contorno humano reconhecível preenchido de preto, não pictograma. O feto precisa de cabeça inclinada, coluna curva, braços recolhidos, pernas dobradas e espaços negativos legíveis entre membros. Sem rosto, detalhes internos ou anatomia explícita. As duas almas precisam de proporção infantil e poses suaves ligeiramente diferentes, sem cabelo/roupa/rosto que determinem aparência. Não indicar gênero por estereótipos de vestido ou musculatura.

A pose deve ser desenhada a partir de referência anatômica ou de um bloqueio 3D posado e renderizado como máscara preta. Aprovar primeiro o contorno isolado em fundo neutro. Um SVG é aceitável quando representa esse contorno; não usar novamente uma construção geométrica improvisada. A escolha nominal de gênero continua nos controles e não deve prometer aparência física definitiva.

## Composição recomendada, do fundo para a frente

| Camada | Conteúdo | Função |
|---|---|---|
| Ambiente distante | Gradientes/pigmento abstrato | Estabelecer cor sem disputar atenção |
| Atmosfera distante | Uma ou duas massas lentas | Profundidade; pouca textura e paralaxe |
| Vínculos traseiros | Trechos dourados independentes | Desaparecer atrás do campo/ser de forma convincente |
| Campo traseiro | Névoa cinza ampla e tênue | Dar contraste à silhueta preta |
| Feto | Máscara própria, preto opaco | Centro de atenção e alvo da interação |
| Campo dianteiro | Faixas incompletas de névoa | Sugerir envolvimento sem cobrir o contorno inteiro |
| Vínculos dianteiros | Trechos que continuam os traseiros | Mostrar percurso, cruzamentos e tensão |
| Fecho | Peça própria, se mantida | Ponto de ruptura, com brilho localizado |
| Resíduos | Poucas partículas próximas | Acento temporário, sem moldura permanente |

Esses elementos devem compartilhar pivô, tamanho de referência e guias de alinhamento. Não gerar frente e verso independentemente sem guias: os elos precisam continuar nos mesmos pontos. Preparar máscaras frente/verso a partir de uma composição comum ou de um modelo simples. Duplicar a imagem inteira em dois planos não cria profundidade.

## Técnica adequada ao projeto

Manter composição 2,5D no Three.js existente, controles HTML acessíveis e o mesmo loop/câmera. Começar com planos com ordem explícita de composição e separação discreta em profundidade. Um recipiente totalmente 3D só é justificável se houver rotação/câmera orbital; a cena atual não exige esse custo.

- Silhuetas: máscaras de alpha de alta qualidade, amostradas como dados sem espaço de cor sRGB. Pintar preto no shader; a visibilidade vem da atmosfera atrás, não de clarear o corpo.
- Correntes: cor sRGB e alpha real, dois ou mais segmentos coerentes, dourado translúcido menos saturado. Brilho apenas em pontos de tensão/fecho; não habilitar bloom indiscriminadamente para toda a corrente.
- Névoa: dois planos diferentes, com escalas/fases de ruído distintas. Traseiro mais amplo, dianteiro descontínuo. Manter o centro e a cabeça legíveis. A névoa deve se dissipar; não quebrar como vidro sólido.
- Transparências: `depthWrite:false` e ordem de pintura explícita para este palco controlado. Conferir interseções; ordenação automática por objeto não resolve todo cruzamento de planos transparentes.
- Movimento: uma flutuação compartilhada mantém o conjunto coeso; deformação e defasagem discretas do campo/vínculos sugerem vida. Evitar peças deslizarem umas em relação às outras a ponto de perder alinhamento.
- Transição: conservar duração, clarão e passagem cromática aprovados. A linha do tempo existente passa a controlar as novas camadas. Vínculos cedem primeiro em poucos pontos; névoa abre/dissipa; feto vira luz; duas formas surgem. Não acrescentar um novo gesto das mãos ao botão.
- Seleção: área clicável estável, aura atrás da forma e legenda legível. A silhueta continua preta. Campo do nome conserva o foco por sublinhado, sem caixa externa.

## Nitidez e custo

Mais pixels não substituem um bom contorno. Testar a máscara no tamanho real de exibição, inclusive 390 px de largura. Usar versões 512/1024 conforme o dispositivo; exportação-mestre pode ser maior, sem servir tudo a todos.

Uma textura RGBA 1024² ocupa aproximadamente 5,33 MiB com mipmaps, independentemente de seu PNG ser pequeno. Em 2048², cerca de 21,33 MiB. Máscara R8 pode reduzir isso a um quarto, mas exige caminho de carga/formato apropriado; PNG cinza carregado pelo TextureLoader comum não garante essa economia. Primeiro simplificar fundos e reaproveitar ruído/texturas; depois medir o que de fato chegou à GPU.

Frente/verso aumentam superfícies transparentes e sobreposição de pixels. No perfil móvel, reduzir camadas atmosféricas decorativas; preservar as oclusões essenciais do feto/campo/correntes. Não prometer FPS antes de medir em aparelho real. Usar um único lote de resíduos e nenhum novo renderer/RAF.

## Ordem prática da próxima implementação

1. Fazer prancha estática com os dois fundos discretos e os três contornos isolados. Avaliar desenho e hierarquia sem animação, mãos ou brilho que escondam defeitos.
2. Montar o feto com campo/correntes frente e verso. Conferir continuidade dos elos, alpha e profundidade com paralaxe muito pequena.
3. Integrar a transição existente. Ajustar apenas o comportamento das novas camadas.
4. Integrar as duas formas ao formulário e conferir desktop, toque, teclado e movimento reduzido.
5. Gerar novo ZIP após inspeção visual e testes; preservar V3 como comparação.

## Critérios de aceite da revisão

- Nenhuma anatomia literal reconhecível no cenário; ele sugere sangue por atmosfera/cor.
- Figura é o primeiro foco numa miniatura e em escala de cinza; fundo não cria bordas mais chamativas.
- Feto reconhecível só pelo contorno e pose; não parece ícone/cartoon. Almas não parecem sinalização de banheiro nem personagens com aparência já escolhida.
- Elos dianteiros/traseiros continuam entre si e envolvem o volume. Névoa tem profundidade sem apagar a cabeça e os membros.
- A transição mantém o resultado que o usuário aprovou.
- Formulário legível, controles dentro da tela e foco sem deslocar a composição.
- Sem retângulos de alpha, halos de recorte ou inconsistência de cor/bloom.
- Capturas/vídeos reais e medições diferenciadas de homologação visual do usuário.

## Referências consultadas

Fontes técnicas oficiais, código/documentação da versão r180, obtidas em 27/10/2026. As regras de direção visual acima são recomendações para este caso, não parâmetros garantidos por essas fontes.

1. [Three.js — Transparency](https://github.com/mrdoob/three.js/blob/r180/manual/en/transparency.html): limites de ordenação, faces transparentes e planos que se cruzam. Sustenta composição controlada e separação frente/verso.
2. [Three.js — Color management](https://github.com/mrdoob/three.js/blob/r180/manual/en/color-management.html): distinguir textura de cor e dados/máscaras; interpretar luz em espaço linear e exibir corretamente.
3. [Three.js — Textures](https://github.com/mrdoob/three.js/blob/r180/manual/en/textures.html): filtros, mipmaps, tamanho e memória. Sustenta dimensionar assets pelo tamanho projetado e medir custo real.
4. [Selective Unreal Bloom, exemplo r180](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_postprocessing_unreal_bloom_selective.html): separar elementos luminosos do restante da cena. Não é referência de direção artística AAA nem prova de desempenho no nosso app.

As URLs diretas de threejs.org e um artigo externo da Valve foram bloqueados pela rede neste ambiente. A documentação Three.js foi consultada pela fonte oficial no GitHub. O artigo bloqueado não foi usado como evidência.

## Estado do trabalho

Analisado: código V3, imagens fornecidas e quatro referências técnicas oficiais. Produzido: este estudo. Implementado nesta rodada: nenhuma mudança na cena. Testes visuais/automatizados de uma V4 e homologação: ainda não executados, pois os novos assets e a composição ainda não foram implementados.


## Complemento — silhuetas de gênero e animação com mesh/rig

Solicitação adicional do usuário: melhorar também as duas silhuetas da escolha de gênero, avaliar animação por mesh/rig como nas mãos e evitar acabamento visual artificial. Referência de qualidade fornecida: DIRETRIZES_MESTRAS_IMAGENS_TEXTOS_PROGRAMACAO.md; aplicam-se aqui os critérios de silhueta/gesto, anatomia, continuidade dos objetos, materiais, artefatos visuais e distinção entre imagem animada e modelo 3D. As instruções de ativação e os exemplos do documento são contexto de trabalho; não constituem pedido de publicar ou alterar outros sistemas.

### O que o projeto já oferece

`first-person-hands-mesh.js` usa planos subdivididos; `hands-image-rig.js` define THREE.Bone, hierarquia, pesos por vértice e deformação de malha. O rig é 2,5D, baseado em uma imagem e seus marcos anatômicos. Esse mecanismo demonstra que a infraestrutura existente suporta articulação, mas os marcos e pesos específicos de dedos não servem diretamente para um corpo.

### Decisão recomendada para o protótipo

Usar rig 2,5D próprio para cada silhueta, com controles de bacia, coluna, pescoço/cabeça, ombros, cotovelos, punhos, quadris, joelhos e tornozelos. Feto e duas formas infantis têm topologias/poses distintas. Compartilhar a infraestrutura de carregamento/animação, não copiar os pesos das mãos.

Primeiro corrigir o desenho das três figuras. Depois construir malha que acompanhe os contornos e as regiões articulares, com pesos normalizados e limites pequenos. Uma grade uniforme sobre uma imagem inteira pode esticar vazios, fundir braços ao tronco e produzir efeito de borracha. Se necessário, separar membros parcialmente ocultos em submalhas compatíveis e ordenar a oclusão. Rig não recupera anatomia que não existe na imagem original.

- Feto: flutuação do conjunto e flexão mínima articulada, sem abrir os membros a ponto de desfazer a posição fetal.
- Duas almas: poses naturais próprias, respiração e balanço discretos; não repetir o mesmo movimento sincronizado nas duas figuras. Evitar poses rígidas de sinalização, alongamento dos membros e deformação elástica do crânio.
- Seleção: breve orientação da cabeça/tronco e acomodação suave da pose; aura contida atrás do corpo. Evitar salto, esticamento ou clarão que substitua a resposta corporal.
- Campo: deformação contínua em camadas, independente do rig corporal.
- Correntes: trajetória e elos coerentes; frente/verso derivados da mesma composição. Para deformações grandes, preferir elos geométricos simples ao estiramento de textura. Não reutilizar rig humano para simular vínculos.
- Movimento reduzido: pose estável e indicação de seleção sem balanço/deslocamento; manter o formulário e o foco acessíveis.

Se a pose precisar girar amplamente ou revelar partes ocultas, o limite do rig de imagem foi atingido: usar modelo 3D com esqueleto e procedência/licença verificadas. Não apresentar deformação de um plano como corpo 3D completo. A transição aprovada continua sendo uma passagem por luz e revelação; não tentar converter um único esqueleto fetal em dois corpos por deformação extrema.

### Evitar acabamento artificial: critérios observáveis

Não usar uma pontuação de “aparência de IA”. Verificar contornos anatômicos, proporções, espaços entre membros, coerência das articulações, continuidade dos elos, ausência de texturas derretidas, halos de alpha, brilho plástico e detalhes decorativos sem função. Manter uma única direção artística e fundos discretos. Não acrescentar ruído ou defeitos para simular autoria humana.

### Validação específica do rig

Inspecionar as três figuras paradas antes dos efeitos e depois em todos os extremos das animações: sem rasgos, inversões visíveis de triângulos, membros fundidos ou perda de volume. Conferir que a pose pode voltar ao repouso, que o alvo HTML não se move com a flutuação e que seleção por teclado/toque conserva a mesma resposta funcional. Registrar contagem de ossos, vértices, texturas e superfícies por perfil, além de custo por quadro em cenário identificado. Integração no loop existente, sem outro RAF, sem modificar as mãos aprovadas.

Estado deste complemento: análise do rig existente e proposta registradas; novos desenhos, malhas e rigs corporais ainda não produzidos/integrados/testados.
