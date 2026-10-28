# V7 — Corpo opaco, cinco faixas e novas silhuetas

28/10/2026. Revisão visual solicitada pelo usuário. Prévia estática para avaliação; aprovação artística e homologação em aparelho físico continuam pendentes.

## Analisado e corrigido

- A textura fetal anterior continha bordas e interior com alpha variável. Além disso, o corpo não participava do passe seletivo de bloom, permitindo que o brilho dos glifos traseiros fosse recomposto por cima dele. O material agora transforma o núcleo da cobertura em opaco, mantém antialias apenas no contorno e preenche o interior de preto puro. O mesmo corpo participa do passe de bloom como oclusor; somente a carga da transição o ilumina.
- As duas faixas foram ampliadas para cinco, com inclinações, raios e velocidades distintos. A frase exata “Acorrentado pela realidade”, na fonte original fornecida, se repete duas vezes por faixa: 240 glifos lógicos. A geometria instanciada e o atlas continuam compartilhados entre as duas passagens dianteira/traseira. Atlas ampliado de 1024×512 para 2048×1024, com margens e escala tipográfica uniforme.
- Substituída a imagem das escolhas por duas silhuetas pretas em poses diferentes de flutuação, sem detalhes internos, cabelo, expressão ou material de pele. Recortes UV e posições das articulações foram ajustados à nova arte; permanecem três rigs de 16 juntas em 2,5D, e não modelos humanos completos em 3D.
- Nova pintura em vinho/carvão, com menos poeira dourada e centro reservado para a figura. A fonte horizontal continua nativa em 1672×941; não se anuncia 4K nem se amplia um PNG para simular detalhe. Foi adicionada uma pintura própria em retrato, 1024×1536, para evitar esticar a horizontal no celular. O shader calcula o enquadramento pela proporção real da imagem e troca a pintura ao girar a tela, preservando o mesmo objeto de textura e o formulário. Deriva, paralaxe e passagem para cinza/violeta permanecem.
- A resolução automática da criação passa a preservar até 1,25 pixel por pixel CSS, limitada a 2,2 milhões de pixels e ao DPR nativo. O perfil escolhido explicitamente por `quality` mantém seu orçamento anterior, inclusive Eco. O orçamento do Observatório original permanece intacto. Isso corrige a perda de nitidez que a adaptação automática provocava na tela inteira; não é promessa de FPS em GPU física.

## Preservado

Sem campo de força, elos físicos ou cadeado. “Tornar Marcado” continua sem gesto de clique das mãos. Mantidos viagem, véu, transição, exclusividade das opções, nome, movimento reduzido, continuação e rascunho local. Os quatro módulos originais de mãos/seleção/viagem/véu comparados à origem permanecem idênticos. Órion Fichas continua em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, com árvore rastreada limpa; regras, dados e serviços remotos não foram alterados.

## Verificações reais

- Node 24.19.0. `npm run check`: aprovado.
- 17 arquivos de testes unitários: aprovados, zero falhas e zero skips. Incluem geometria das cinco faixas e três esqueletos com pesos normalizados, movimento finito sem inversão de triângulos e repouso em movimento reduzido.
- 26 regressões de navegação/seleção/toque: aprovadas. Incluem destinos 1–3, retorno, véu, confirmações, arrasto e mão existente.
- 11 cenários finais de criação: aprovados. Incluem fonte real, cinco faixas, ausência de campo, transição sem gesto, teclado, movimento reduzido, exclusividade, rascunho e alvos móveis. A regressão de opacidade captura o navegador com bloom ativo, esconde os glifos dianteiros e exige que um bloco de pixels no núcleo do corpo permaneça preto (máximo 2/255). Outra regressão gira retrato → paisagem → retrato, verifica imagem/proporção corretas e preservação de nome/escolha.
- Pacote estático final servido por HTTP, sem erros de JS/console/HTTP nos quatro tamanhos: 1440×900, 390×844, 844×390 e 320×568. Verificados cena, transição, nome, escolha, seta, rascunho e scroll zero nos contêineres. Perfil automático com DPR 1 em desktop e 1,25 nas emulações de telefone com DPR nativo 2. Capturas e vídeo correspondem a esse pacote, não a mockups.
- Compilação Vite final: aprovada. `npm run build` completo foi tentado e falhou no download externo da fotografia ESO: `fetch failed`; a tentativa independente com curl recebeu 403. Não foi removida essa verificação nem alterado o script de preparação. O pacote usa a fotografia e os recortes locais já preparados na V6, preservados byte a byte; esses recursos carregaram no navegador. A compilação local com Vite não é apresentada como sucesso do download externo.

Logs, capturas e vídeo real do pacote ficam em `sigilos-v7-validation/`. Chrome headless usa SwiftShader. Emulação de toque e captura de navegador não equivalem à homologação do teclado virtual, GPU ou desempenho de um telefone real. A aparência das novas silhuetas e do fundo depende da avaliação do usuário.

## Entrega e origem

ZIP de upload manual no Cloudflare Pages, com `index.html` na raiz, assets locais e a fonte fornecida incluída sem alteração. As três novas pinturas/silhuetas são saídas de image_gen, preservadas em seus arquivos nativos; composição, cobertura e animação são aplicadas pelo renderer. A fonte enviada não continha licença separada; não se atribui licença fictícia. Arquivos antigos permanecem no repositório e os assets de criação inativos são retirados apenas do ZIP.

Sem deploy no Cloudflare, merge, PR nova, migração, criação remota de ficha ou alteração de produção.
