# Nascimento do Marcado — plano e referências

Base: `a45c8d6d89c5be4892fa049ed755218fad3fb006`, branch original `codex/maos-rig-mmv`, correspondente ao ZIP do usuário. Branch de implementação local: `feat/nascimento-marcado`.

## Contrato visual narrado pelo usuário

Conta vazia: uma estrela central convidando ao clique. Mesma confirmação das mãos, viagem, clarão e véu existentes. Na chegada: silhueta fetal etérea, campo de luz, correntes e cadeado. Clicar na silhueta revela “Tornar Marcado”. A ação rompe a luz, correntes e cadeado em conjunto; a figura se divide em menino/menina. Fragmentos cintilam nas bordas. Nome e “Não definir gênero”; as três opções são exclusivas. A seta circular surge depois da escolha. Nome válido é necessário para continuar. A próxima etapa de criação não foi especificada e não será inventada.

## Pesquisa antes da implementação

Duas demonstrações oficiais funcionais do Three.js r180 foram consultadas via código em 26/10/2026:

1. [Animation keyframes](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_animation_keyframes.html): demonstração técnica com AnimationMixer, atualização por delta no loop e animação de asset glTF. Adequado para personagens com rig, mas exige modelo/animação/licença próprios. Não importar um bebê/modelo de jogo para este estudo.
2. [Custom attributes particles](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_buffergeometry_custom_attributes_particles.html): demonstração técnica de partículas em BufferGeometry com atributos e shader. Útil para grande população; não adicionar outro renderizador ou milhares de partículas ao Observatório para alguns fragmentos de borda.

Comparação/adaptação: manter os módulos de câmera, viagem, véu, rig e gesto existentes; usar o seu loop para o gesto da criação. Silhuetas vetoriais originais e fragmentos limitados em CSS/WAAPI para o primeiro corte visual. Não são modelos anatômicos finais nem motion capture. Assets existentes mantêm créditos/licenças. Os vetores novos são autorais, sem ativos extraídos de jogos.

## Orçamento e verificação

- Zero renderizadores/loops RAF novos. Zero dependências/modelos/texturas de terceiros adicionais. No máximo 16 fragmentos decorativos; duas silhuetas de criança; reutilizar as duas mãos/rig existentes.
- Não alterar perfis de resolução, foto ESO, star-journey.js, star-selection.js, page-transition.js ou parâmetros de viagem para mascarar custo.
- Estados e validação com unidades; navegador com zero/uma/três estrelas, viagem efetiva, clique/teclado/toque, ruptura completa, exclusividade de gênero, nome vazio, continuação única, mobile retrato/paisagem e movimento reduzido.
- Capturas 1920×951 e 390×844/844×390. Registrar métricas observadas; não prometer 60 FPS em GPU real com medidas de SwiftShader. Memória GPU: registrar contadores do renderizador, não estimar VRAM em bytes.
- A navegação padrão histórica e a chegada de Nox continuam disponíveis. `?stars=0` representa conta vazia na prévia; nenhuma conta real existe neste repositório.

Bloqueio pré-existente: `npm run build` depende de `cdn.eso.org`; download recusado pela política de rede desta sessão. Não substituir a foto nem desativar a verificação. Domínio adicional salvo no rascunho do ambiente; isso não aplica nem publica configuração.
