# V9 — Cinco camadas e atmosfera pulsante

28/10/2026. Estudo integrado e testado em navegador; direção artística e aparelho físico aguardam avaliação do usuário.

## Arquivos e composição

1. `black-base-v9.svg`: preto sólido, 1536×1024. Na cena WebGL a fundação é renderizada por material preto independente.
2. `gray-far-v9.png`: névoa cinza distante, alpha próprio, opacidade de composição .30.
3. `gray-near-v9.png`: outra forma de névoa cinza, alpha próprio, opacidade .21.
4. `red-left-v9.png`: massa vermelha inferior esquerda, alpha próprio, opacidade .64.
5. `red-right-v9.png`: massa vermelha superior direita diferente, alpha próprio, opacidade .59.

Os quatro PNGs têm 1536×1024, transparência real e bordas graduais; alpha mínimo 0, máximos 249/250/254/254. Não são quatro cópias da imagem completa. São reconstruções por image_gen orientadas pela referência atmosférica; não se afirma extração pixel a pixel da imagem original. Os arquivos gerados foram preservados sem edição de pixels. A base SVG é uma definição vetorial de cor sólida.

As cinco camadas ficam presentes também no perfil Eco. Os quatro planos transparentes têm profundidades e deslocamentos independentes e suaves, reaproveitando câmera, loop e renderer. Vermelhos pulsam em ciclo lento de 4,8 segundos, com fases diferentes, variação limitada de intensidade e expansão discreta. Cinzas não pulsam. A transição retira a cor, congela a pulsação e mantém a composição cinza/preto/violeta. Movimento reduzido usa valores constantes. Não há campo de força nem órgãos literais.

`camadas.html` permite ligar/desligar cada arquivo, baixar individualmente e experimentar a pulsação em CSS. Pode abrir localmente, sem servidor. Essa demonstração é um inspetor de arte; o shader do site aplica a pulsação e o enquadramento da cena real.

## Continuação dos ajustes anteriores

O carregamento inicial agora tem cobertura escura e apresentação própria. O marco `presentationReady` só libera a entrada após fundo, mãos e arte de criação estarem prontos e dois quadros do navegador. `sceneReady` continua sendo o marco técnico de inicialização, preservando seu contrato. Falhas de recurso exibem o aviso existente com opção de tentar novamente. O véu branco original de viagem foi preservado e continua acima da apresentação inicial.

As duas silhuetas foram substituídas por representações jovens, inteiramente pretas, com contornos diferentes e vestimentas simples indicadas apenas pela borda. Menino com tronco reto e camiseta/bermuda, menina com túnica e leggings, sem detalhes internos de rosto ou corpo. UV e coordenadas dos rigs de 16 juntas foram ajustados. Permanecem imagens animadas em 2,5D, não modelos humanos completos. Fonte de sigilos, feto, dourado, retorno e formulário da V8 foram preservados.

## Verificações reais

- Node 24.19.0. `npm run check` aprovado; bundle Vite aprovado com recursos ESO locais já preparados. Não se anuncia aprovação de novo download externo do build completo, bloqueado anteriormente por 403.
- 18 arquivos de testes unitários aprovados, zero falhas/skips. A unidade nova verifica quatro arquivos diferentes, pulsação contínua/limitada/periódica e fases distintas; unidades de rig verificam pesos e ausência de triângulos invertidos.
- Rodada de 20 cenários: 18 passaram e dois falharam. Um teste de hit-test verificava o retorno antes do novo marco de apresentação; foi corrigido para aguardar `presentationReady`, mantendo a asserção de clique real. A execução seguinte dos seis cenários de interação passou. A outra falha ocorreu no encerramento da gravação do Playwright por `ENOENT`, causado pela colisão de diretórios de artefatos entre duas execuções; a repetição de toque 390×844, com diretório de saída isolado, passou (16,4 s).
- Os demais cenários passaram: fonte real atrasada, corpo opaco com bloom, giro da tela, retorno, identidade exclusiva, nome/rascunho, teclado e movimento reduzido. Os testes novos confirmaram a cobertura durante atraso do fundo e a disponibilidade das mãos antes da liberação, pulsação só dos vermelhos e sua interrupção na identidade/movimento reduzido.
- Pacote HTTP final exercitado em 1440×900, 390×844, 844×390 e 320×568, perfil automático: sem erros de JS/console/HTTP, sem scroll nos contêineres, controles dentro da tela e rascunho correto. Inspetor também validado: cinco arquivos carregam, checkboxes ocultam/reexibem cada camada, botão de pulsação funciona sem erro de JavaScript.

Logs, capturas e gravação real em `camadas-v9-validation/`. Chrome headless/SwiftShader e toque emulado não equivalem à homologação de GPU, teclado virtual ou telefone físico. Aparência e intensidade da pulsação aguardam avaliação visual.

## Entrega e preservação

ZIP somente de camadas inclui os cinco arquivos, `camadas.html` e instruções. ZIP do site tem entrada na raiz, fonte e assets locais; envio manual ao Cloudflare. Sem deploy, merge, PR nova, migração ou alteração de produção. Órion Fichas, regras e dados permanecem fora do escopo. Os módulos originais de mãos, seleção, viagem e véu não foram modificados.
