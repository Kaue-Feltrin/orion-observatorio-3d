# V3 — Tudo começa pelo sangue

Revisão de 26/10/2026, ainda sujeita à homologação visual do usuário.

## Analisado

O pedido substitui a nebulosa colorida e as figuras com aparência definida por uma origem orgânica vermelha, vínculos dourados surreais e silhuetas pretas. A pesquisa técnica anterior continua em CINEMATIC-RESEARCH.md; esta revisão não acrescenta alegações de uso em jogos comerciais.

## Implementado

- Cenário orgânico vermelho escuro com modulação lenta de luminosidade/UV, paralaxe e frase “Tudo começa pelo sangue.”. A composição do ser surge após a frase; o alvo fica indisponível até concluir essa apresentação. Movimento reduzido apresenta a cena diretamente.
- Três imagens novas, locais e preservadas: câmara orgânica, vazio dessaturado e correntes translúcidas douradas de luz âmbar. O material é uma representação visual surreal em planos, não simulação física volumétrica.
- Silhueta fetal e duas formas humanas em SVG autoral, sem rosto, roupa ou cabelo. A escolha da representação não define a aparência final do personagem. Texturas vetoriais rasterizadas pelo navegador em alta resolução e antialiasing ativado na cena de criação.
- Campo de névoa cinza claro com ruído procedural animado, sem carregar o escudo PNG anterior. A névoa passa atrás da silhueta para preservar o preenchimento preto e sua leitura.
- “Tornar Marcado” tem superfície, contorno e estados de interação. Não aciona gesto das mãos. O ser emite luz durante a antecipação; um único clarão suave cobre a passagem do vermelho ao vazio preto/branco/cinza com tonalidade violeta discreta. Os vínculos se fragmentam; duas silhuetas surgem e se separam.
- Enquadramento do fundo cobre toda a janela preservando proporção e paralaxe, inclusive na tela deitada. Contêiner das opções não rola ao receber foco.
- Seleção com aura gradual, indicação textual e ponto luminoso. Foco do nome sem caixa/contorno externo: sublinhado claro e fundo discreto. A navegação por teclado conserva indicadores de foco.
- Mesma câmera/renderer/loop da cena. Sem dependências novas. Movimento reduzido remove pulsação, deslocamento, voo e clarão.
- A primeira página, sua foto, viagem e módulos de animação das mãos permanecem preservados. A continuação entrega somente o rascunho local já existente.

## Testado

Resultados: `npm run check` aprovado; 15 arquivos unitários aprovados; 22 cenários de criação/navegação aprovados sem retries. Os 8 cenários de criação foram repetidos e aprovados após os ajustes finais de contraste/enquadramento.

Logs e capturas anexados nesta pasta em `blood-validation/`. Validação estática, 15 arquivos unitários, build com assets locais/ESO, Chrome headless com SwiftShader. Cenários de criação cobrem carga das novas imagens, paralaxe, transformação do ambiente, ausência do gesto no botão, silhuetas vetoriais, névoa procedural, foco do nome, gênero/nome/rascunho, teclado, movimento reduzido, toque vertical e horizontal. Regressões cobrem navegação e retorno de 1–3 estrelas, proteção do véu e acesso direto.

O pacote estático final também foi aberto em 1440×900, 390×844 e 844×390, perfil Balanced: cena, transição, seleção, nome e continuação completos, sem erros JS/console/HTTP. Capturas reais foram inspecionadas, inclusive para melhorar o contraste da silhueta fetal com a névoa.

A primeira execução exploratória foi feita enquanto o servidor de desenvolvimento recebia alterações: houve uma expectativa antiga de fragmentação do escudo (agora névoa) e um recarregamento durante o caso móvel. A expectativa foi atualizada para dissolução da névoa e as verificações finais passaram a usar o build estático, sem hot reload. Esses registros exploratórios não são apresentados como regressões do produto.

## Homologado

Homologação visual pelo usuário pendente. Não houve teste em celular físico, avaliação de teclado virtual ou benchmark de GPU física nesta revisão; nenhuma meta de FPS é afirmada. É uma prévia visual 2,5D para upload manual no Pages, sem conta conectada, migração, produção, merge ou nova PR.
