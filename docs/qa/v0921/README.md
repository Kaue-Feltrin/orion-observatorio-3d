# v0.9.21 — mãos etéreas nas extremidades

Base conferida por `git ls-remote`: `preview/star-hover-hands-v0921`, commit `2a2c6a06157cc6141d81842f1f8d37dd8c54aaa1`. Trabalho em `codex/finalizar-maos-etereas-v0921`, com PR destinado à branch de referência.

## Resultado

- A esquerda enquadra discretamente a borda esquerda; a direita permanece na borda direita. A largura de cada plano é limitada a 30% do viewport, preservando o centro também em janelas estreitas.
- A direita possui um asset neutro próprio, com indicador relaxado e palma/punho alinhados ao asset de apontamento. Os dois assets anteriores foram preservados.
- Somente o Raycaster existente do Nox ativa o apontamento. Saída do hover, saída da janela, perda de foco, aba oculta e viagem encerram esse estado. Foco por teclado não ativa o gesto.
- Blend exponencial existente, sem novo loop ou shader. As poses da direita compartilham a mesma geometria e transformação. Dois draws estáveis; três apenas no blend. A terceira textura tem cerca de 104 KiB em disco; a contagem de texturas das mãos passa de dois para três. FPS/RAM no dispositivo do usuário não foram medidos.
- O update das mãos passou a continuar durante a viagem: antes o método `beginTravel` iniciava o fade, mas o loop não o executava fora do repouso.
- Fotografia ESO, Nox, bloom, câmera, painel, viagem e assets de fundo não foram redesenhados nem reconfigurados.

## Comparação visual

### Acabamento inferior após aprovação da proporção

O usuário aprovou o tamanho e identificou o contorno do antebraço aparecendo no canto inferior direito. A arte termina antes da borda da textura; a máscara anterior ainda deixava alpha nesse corte. Ampliada apenas a dissolução do antebraço nesse canto, com transparência completa antes do término da imagem. Escala, ancoragem, opacidades base, assets e gesto foram preservados. A máscara da geometria é compartilhada pelo neutro e apontamento; palma e dedos mantêm seu alpha original.

[Repouso com acabamento](acabamento-1920x1080-neutral.webp) · [Hover com acabamento](acabamento-1920x1080-hover.webp).

O teste unitário exige alpha zero na região do corte e alpha unitário na região superior da geometria (palma/dedos). As capturas e o teste de enquadramento usam a mesma proporção aprovada.

### Ajuste pela referência do usuário (1920×1080)

Após a primeira entrega, o usuário forneceu uma imagem com mãos maiores, recortadas nas bordas inferiores. O enquadramento foi ajustado mantendo as proporções originais de cada textura: esquerda com altura de plano 56,5% e direita 66% da janela, com a margem transparente da imagem preservada. A silhueta começa aproximadamente em 56% da altura à esquerda e 52% à direita em repouso, conforme a referência. O gesto de apontamento continua exclusivo do hover. Não se alteraram os assets nem a opacidade.

[Repouso atualizado](proporcao-1920x1080-neutral.webp) · [Hover atualizado](proporcao-1920x1080-hover.webp) · [Retorno](proporcao-1920x1080-returned.webp).

### Histórico: comparação da primeira entrega

Capturas reais de Chromium/SwiftShader, qualidade `eco-plus`, no tamanho indicado. Imagens do mesmo Observatório, com a fotografia ESO efetivamente carregada. A comparação anterior usa o módulo de mãos do commit base, servido com os imports locais adaptados, sem alterar o arquivo rastreado. A cena animada e sua fase variam entre capturas; estas imagens avaliam enquadramento e poses, não igualdade pixel a pixel.

| Janela | Antes: repouso | Depois: repouso | Antes: hover | Depois: hover |
| --- | --- | --- | --- | --- |
| 1755×865 | [Imagem](before-1755x865-neutral.webp) | [Imagem](after-1755x865-neutral.webp) | [Imagem](before-1755x865-hover.webp) | [Imagem](after-1755x865-hover.webp) |
| 1920×951 | [Imagem](before-1920x951-neutral.webp) | [Imagem](after-1920x951-neutral.webp) | [Imagem](before-1920x951-hover.webp) | [Imagem](after-1920x951-hover.webp) |

WebP de documentação com qualidade 82, sem redimensionamento, para limitar o tamanho do repositório. PNGs originais e capturas de retorno ao neutro foram preservados nos artefatos da tarefa. Os testes também capturam repouso, hover e retorno em 390×844, com as mãos explicitamente habilitadas; o padrão para dispositivos de toque continua desabilitado.

## Referências técnicas e escolha

- [Three.js r180 — sprites](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_sprites.html): exemplo oficial com sprites nos cantos, preservação da proporção da imagem e atualização em resize. Adaptou-se o princípio de ancoragem, mantendo a câmera existente em vez de introduzir uma segunda câmera.
- [Three.js r180 — blending](https://github.com/mrdoob/three.js/blob/r180/examples/webgl_materials_blending.html): exemplo oficial com texturas transparentes e materiais básicos. Mantiveram-se os materiais locais, alpha complementar e descarte de superfícies invisíveis; não se adicionou pós-processamento.
- `first-person-hands-overlay.js` já fornecia uma alternativa com composição DOM. Permanece disponível, mas a correção mantém a malha atual e sua deformação limitada para preservar a direção visual aprovada.
- `MathUtils.damp` do Three.js documenta a mesma interpolação exponencial independente da frequência usada pelo blend. O teste unitário compara a evolução em 30 e 60 Hz.

## Validação

Resultado após o ajuste de proporção: `check` e build aprovados, duas suítes unitárias aprovadas e **10/10 testes Playwright aprovados em 1,7 minuto, sem retries**, usando o build de produção. Acrescentada a janela de referência 1920×1080. O CI remoto anterior terminou com 72 aprovados e uma falha de tempo limite: três saídas de hover compartilhavam 25 segundos. Os casos foram separados por evento, mantendo as mesmas verificações; cada caso possui orçamento próprio de 45 segundos. O próximo CI remoto deve validar essa revisão; não se alega que já concluiu.

No diretório `orion-observatorio-upload-github-leve`:

```sh
npm run check
NODE_USE_ENV_PROXY=1 npm run build
node tests/hands-mesh.unit.mjs
node tests/hands-hover.unit.mjs
```

`NODE_USE_ENV_PROXY=1` usa o proxy do ambiente no Node 24 instalado; a dependência declarada do projeto permanece Node ≥20. O build baixa a imagem original de `cdn.eso.org` com TLS validado. A falha inicial de rede HTTP 403 foi resolvida pela configuração do ambiente. O aviso do Vite para o chunk acima de 500 KiB permanece; não foi ampliado o escopo para alterar o empacotamento.

Teste de navegador executado sobre `dist/`, com `npm run preview` iniciado pelo Playwright, um worker e sem retries. A configuração externa de onboarding apenas seleciona o Chromium instalado e o diretório de relatórios, preservando as flags WebGL do projeto:

```sh
XDG_CONFIG_HOME=/workspace/.cache/orion/chromium-config CI=1 npm run test:browser -- \
  tests/hands-mesh.spec.js tests/observatorio.spec.js \
  --grep 'v0.9.21|observatório 3D inicializa|clique na estrela|estrela distante aponta no mundo|mouse move cambia' \
  --config /workspace/.cloud-setup/orion/playwright.config.mjs --workers=1 --retries=0
```

O teste de composição projeta os limites das malhas na câmera e exige que o centro entre 30% e 70% da largura fique livre. Verifica assets independentes, transparência, hover real, retorno, descarte de superfícies invisíveis, saída da janela/foco/aba, teclado, `hands=off`, movimento reduzido e ocultação antes da chegada à ficha. As capturas incluem largura e altura no nome para não sobrescrever 1920×1080 com 1920×951. As regressões selecionadas verificam inicialização, câmera/paralaxe, clique/viagem e Raycaster do Nox. A suíte histórica completa não foi executada localmente nesta revisão; o desempenho em GPU física não foi medido.

Aceite artístico pelo usuário, FPS/RAM no seu equipamento e qualquer promoção para produção continuam pendentes. Esta entrega não autoriza merge nem deploy na `main`.
