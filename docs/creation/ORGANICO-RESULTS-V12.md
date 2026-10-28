# V12 — Membranas orgânicas no fundo vermelho

28/10/2026. Produzido, integrado e conferido em navegador. Aprovação visual e homologação em aparelho físico pendentes.

## Analisado

A composição anterior usava cristas fractais, filamentos iluminados e textura volumétrica sem uma superfície contínua. Esses elementos remetiam a nebulosa, nuvem ou rocha, em desacordo com o interior orgânico solicitado. Foram relidas as partes pertinentes de `DIRETRIZES_MESTRAS_IMAGENS_TEXTOS_PROGRAMACAO.md`, reenviado pelo usuário: material/iluminação, continuidade, hierarquia visual, artefatos gerativos e distinção entre produzido, integrado, testado e homologado. O documento orientou a revisão artística; não foi usado como autorização para ações fora do pedido.

## Implementado e preservado

Duas novas imagens transparentes substituem apenas os vermelhos: `red-left-v12.png` e `red-right-v12.png`. Dobras largas conectadas, membranas finas entre os volumes, vasos discretos acompanhando as superfícies, sombras de contato e luz transmitida compõem o material. A direção passou a ser tecido vivo, com reflexo úmido, sem órgãos identificáveis, feridas ou sangue espalhado. O centro permanece vazio para feto, sigilos e texto.

Os reflexos dos arquivos isolados são fortes; a integração mantém o brilho reduzido da V11. A inspeção foi feita também na cena, não apenas na arte isolada. O acabamento ainda é uma interpretação gerada e pode precisar de ajuste artístico; não se afirma autoria humana, ausência de origem em IA ou aprovação do usuário.

Cada arquivo tem 1536×1024 e alpha de 0 a 254. PNGs nativos de image_gen, copiados sem edição de pixels. As cinco camadas continuam independentes: base preta, duas névoas cinzas e dois vermelhos. Foram preservados os três primeiros arquivos, a saturação 30–100%, brilho 75%, expansão de até 2%, ciclo de 4,8 segundos, sincronismo, paralaxe suave, interrupção na identidade e preferência por movimento reduzido. Feto, figuras, fonte, mãos, botões, nome e rascunho não mudaram. O inspetor troca os arquivos e descreve os vermelhos como membranas.

## Verificações reais e pendências

- Metadados, alpha e hashes das duas artes conferidos. Dimensões iguais às anteriores e transparência válida. As três camadas preservadas foram comparadas byte a byte na entrega.
- Sintaxe de `main.js`, configuração Vite e `creation-environment.js`: aprovada. Unidade afetada de ambiente: aprovada. Bundle Vite local: aprovado com recursos fotográficos já preparados; sem alegar novo download externo do build completo.
- `npm run check` **não passou**: a asserção estática `mouse responde rapidamente` em `tests/structure.mjs:101` espera a expressão antiga com fator 18 incondicional. O código atual já usa fator 4 na criação e 18 no Observatório desde a revisão de sensibilidade anterior. Nem `main.js` nem esse teste foram modificados nesta revisão; é uma incompatibilidade pré-existente da checagem, registrada sem desativá-la nem alterar a navegação fora do escopo. O log contém o erro real; não é apresentado como aprovação completa.
- Pacote estático HTTP no Chrome: quatro imagens do inspetor carregam com alpha; extremos de saturação 30/100%, brilho 75%, escalas 1/1,02 e opacidades constantes conferidos. Comparação dos pixels confirmou a mudança de crominância.
- Capturas reais da cena e da identidade em 1440×900 revisadas. Em 390×844 com toque emulado, dois ciclos e 81 quadros confirmaram sincronismo e valores preservados; escolha, nome e rascunho passaram sem erros JS/HTTP. A verificação não equivale a medir desempenho de GPU física. A lógica de animação não mudou; não foram repetidas todas as regressões anteriores nesta troca de arte.

Logs, capturas, hashes e gravação em `organico-v12-validation/`. A avaliação do aspecto carnal, intensidade dos reflexos e aparência gerada continua com o usuário. A falha da checagem estrutural deve ser tratada em revisão própria antes de anunciar a suite completa como aprovada.

## Entrega

ZIP do site para upload manual e ZIP das cinco camadas com visualizador. Recursos antigos preservados no repositório; excluídos somente do pacote ativo quando não usados. Sem Cloudflare/produção, merge, migração ou nova PR. Órion principal, Fichas e dados/regras fora do escopo.
