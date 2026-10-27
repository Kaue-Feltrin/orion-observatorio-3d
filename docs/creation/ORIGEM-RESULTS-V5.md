# V5 — Nova composição da origem

27/10/2026. Reconstrução visual das duas telas após rejeição explícita da V4. Esta versão continua sendo prévia para avaliação do usuário; teste técnico não equivale à aceitação da direção de arte.

## Mudança de direção

A V4 organizava imagens muito planas, figuras de cabeça grande/poses diagonais e correntes com material praticamente uniforme sobre fundos de pouca variação. O funcionamento do rig não corrigia essa composição. Nesta rodada, a reconstrução trata os desenhos, a luz, a escala das figuras, o formulário e a hierarquia da cena em conjunto.

- Folha de estilos da criação reescrita, sem acumular novos overrides sobre V2/V3/V4. Cabeçalho, objeto central, ação, escolhas, nome e retorno têm posições próprias para desktop, retrato e paisagem.
- Três PNGs novos: sombra fetal com contorno/densidade mais naturais, atlas de formas humanas verticais com proporções mais alongadas e névoa de fios finos com alpha verdadeiro. Os arquivos preservam integralmente a saída do gerador; a origem generativa é registrada, sem alegação de arte manual.
- Recortes UV calculados a partir da ocupação de alpha, com margens. Figuras não herdam o espaço vazio de metade do atlas. As duas formas são posicionadas/miradas para o centro e mantêm movimentos discretos com rigs próprios.
- Tons de carvão dos próprios assets usados de forma contida, conservando o núcleo escuro da silhueta. Texturas de cor marcadas como sRGB; alpha não recebe conversão de cor. As almas continuam sem identidade facial ou aparência final definida.
- Campo em camadas dianteira/traseira com textura de névoa, deriva lenta, máscaras diferentes e queda radial até alpha zero. Há também proteção de borda nos planos de imagem. O retângulo de névoa da composição anterior não é reutilizado.
- Elos e fecho mantêm geometria, mas recebem material `MeshStandardMaterial`, roughness/metalness e iluminação quente/fria específicas da criação. Fecho em relevo com bevel e escala menor. Orientação das faixas refeita para circundar o objeto; luz e forma substituem a cor plana dos elos antigos. Não há simulação física de colisões.
- Ambiente procedural com domínio deformado e massas de pigmento em baixa frequência. Vinho/preto no início, cinza/violeta depois, com áreas de luz suave para separar as figuras do fundo. Sem anatomia literal ou moldura branca de nuvens.
- Mãos preservadas, com presença visual reduzida apenas na criação, após a atualização do viewmodel. O material é reajustado a cada quadro, sem acumulação da redução. Os módulos e a primeira página não foram substituídos.
- Nome ganhou rótulo visível, sublinhado de foco e composição própria; checkbox mantém semântica e alvo de toque. Controles de gênero continuam exclusivos. O cabeçalho da segunda etapa orienta a escolha, sem criar uma nova etapa de regras.

## Preservado

Seleção da estrela, viagem e véu do Observatório; clarão e tempos de mudança cromática aprovados; gesto das mãos nas figuras e ausência de gesto no botão Tornar Marcado; fluxo de nome/gênero/rascunho local, teclado e movimento reduzido. Fichas PR179, regras, dados, contas e produção fora do escopo. Nenhuma PR ou merge.

## Verificação e evidência

Resultados locais com Node 24.19.0:

- `npm run check`: aprovado.
- 16 arquivos unitários: aprovados, zero falhas/skips.
- Build completo: aprovado, com assets locais e foto ESO.
- 22 cenários de criação/navegação: aprovados sem retries.
- 8 cenários de criação: repetidos e aprovados no build final.
- Pacote HTTP estático, perfil Balanced, em 1440×900, 390×844, 844×390 e 320×568: fluxo completo aprovado, sem erros JS/console/HTTP; alvos verificados dentro da tela e contêiner sem deslocamento por foco.

Logs e capturas reais em `origem-v5-validation/`. As imagens de revisão são capturas do site em execução, não mockups do gerador. O pacote estático é conferido separadamente do build pelo servidor HTTP local.

A primeira conferência encontrou erro de compilação GLSL por uso de palavra reservada. O identificador foi corrigido e as verificações subsequentes incluem captura de erros do console e renderização efetiva das figuras/campo. Essa ocorrência exploratória não é apresentada como teste aprovado.

A unidade de rig verifica pesos, deformação finita, triângulos sem inversão nas poses amostradas e repouso em movimento reduzido. As verificações do navegador cobrem carregamento/renderização, rigs e camadas, paralaxe, botão sem gesto, transição, nome/gênero/rascunho, teclado, toque e navegação/retorno das estrelas existentes. Refinamentos finais de cor e bordas são conferidos novamente na rodada final de criação.

Chrome headless usa SwiftShader. Não se afirma desempenho de GPU física, FPS garantido ou homologação em celular real. As figuras são imagens articuladas em 2,5D; os corpos não são modelos 3D volumétricos. A continuação ainda entrega apenas o rascunho local já existente.

## Entrega

ZIP estático para upload manual no Cloudflare Pages, index.html na raiz, assets/GLBs/licenças originais necessários e documento de resultados. Assets V1–V4 preservados no repositório, excluídos do pacote quando não utilizados. A entrada do ZIP abre a conta vazia; `/criacao.html?stars=0&herald=new-herald` vai diretamente à origem.

Homologação visual pelo usuário pendente. Sem deploy de produção, integração remota, migração, merge ou nova PR.
