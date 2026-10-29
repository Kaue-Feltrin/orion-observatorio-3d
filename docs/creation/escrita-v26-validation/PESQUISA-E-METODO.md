# V26 — escrita física e orientação do inventário

Base V25 `0b60ab997914e68ae7f621546494337aa578d830`. Investigação limitada à cópia visual, sem editar o Fichas protegido ou suas regras. Problema reproduzível por leitura/captura: instrumento com dimensões fixas, letras inteiras reveladas por opacidade e avisos de equipamento recolhidos.

## Referências consultadas antes de implementar

- [Vivus](https://github.com/maxwellito/vivus): biblioteca funcional de desenho SVG, com demonstrações e animação de paths por stroke-dasharray/stroke-dashoffset. Serve para revelar contornos; animar só a borda do glifo não simula o movimento central da escrita. Foi adotado o princípio de avanço do traço, sem instalar/copiar a biblioteca.
- [Signature Pad](https://github.com/szimek/signature_pad): biblioteca funcional de assinatura em canvas, com demonstração, interpolação de traços e variação da espessura. É entrada livre do usuário, não síntese tipográfica. Foram adaptadas continuidade, levantadas e sincronismo ponta/tinta; não se capturam assinaturas nem se copia código da biblioteca.
- [GOV.UK Frontend Error Summary](https://github.com/alphagov/govuk-frontend/tree/main/packages/govuk-frontend/src/govuk/components/error-summary): componente de sistema em produção que associa resumo e erro no campo. Aplicação aqui: motivo visível no item, indicador textual de categoria, correção explícita e lista da mochila independente da busca. Não depender apenas de vermelho ou de details fechado.
- [Caveat, Google Fonts](https://github.com/google/fonts/tree/main/ofl/caveat): fonte manual existente, copyright 2014 The Caveat Project Authors, SIL OFL 1.1. A fonte foi obtida do upstream; bytes/SHA e consultas HTTP constam em `research-sources.json`. Não há geração de imagem por IA. Não são usados assets extraídos de jogos.

## Alternativas e decisão

Revelar caracteres de uma vez mantém o efeito de digitação; deslizar o lápis em linha reta não acompanha a letra. Animar a borda inteira da letra desenha dois contornos. Foi escolhido um atlas vetorial derivado da Caveat, com contorno da tinta e trajetórias centrais, preparado offline. O gerador usa FontTools/Pillow/NumPy somente na preparação, sem dependência nova em npm ou trabalho de skeletonization no navegador. O contorno final preserva o desenho da fonte. A máscara revela esse contorno sob a ponta; levantadas percorrem os intervalos sem riscar a folha.

O atlas cobre 156 glifos latinos, pontuação, números e acentos comuns. Nomes com outros caracteres não são transliterados ou apagados: o caractere original tem revelação progressiva de fallback e o registro/consulta/JSON conservam seu valor exato. Não se promete caligrafia por traços para todos os alfabetos.

O lápis é vetor de interface desenhado no projeto. Seu comprimento é 35% da largura da folha e largura 1/12 do comprimento; a ponta usa a mesma coordenada e progresso da máscara. Medição de retângulos só no início do campo; durante a escrita usa-se geometria armazenada e diferença de scrollTop. Um único rAF finito controla o campo, sem recriar uma cena 3D, câmera ou rig. Tinta e ponta usam o mesmo relógio real. Um limitador por quadro testado inicialmente prolongava excessivamente a sequência no renderizador por software e foi removido da escrita, preservando o controlador de rolagem. Redimensionar conclui a apresentação de modo seguro; movimento reduzido e Concluir animação exibem a ficha salva, sem escrita. Não há mudança no momento da gravação ou na fronteira de dados locais.

As categorias não são recalculadas por regras novas. `reviewEquipment` original continua sendo a fonte dos limites, contagens, descontos revisados e carga. A orientação não muda patente, categoria ou inventário. Há contadores I–IV, mochila sempre visível mesmo com filtros, motivo textual por item, retirada explícita e filtro opcional de adições que não ultrapassam limites. A mochila pode ficar vazia; sem itens o usuário pode continuar. Erros reais impedem Continuar/Criar e a conferência liga de volta à mochila. Sobrecarga tolerada continua distinta do máximo bloqueante existente.

## Método de validação e evidências

- Checks, unidade do atlas/geometria e auxílio de categoria, além das unidades existentes.
- Chrome desktop, 390×844 e 320×568: excesso visível, retirada e patente preservada; contagem por quantidade, aviso antes da adição e filtro sem ocultar o erro da mochila.
- Ponta do lápis comparada com o ponto corrente da máscara por coordenadas SVG, proporção medida nos dois tamanhos, letra acentuada e movimento reduzido. Percurso normal e consulta do registro já criado.
- Regressão das decisões completas, comparação/idade/perícias/itens e diagnóstico. Capturas/vídeo do navegador, não mockups. Renderer SwiftShader não permite homologar FPS de GPU física.
- Orçamento: atlas baixado só na entrada do recrutamento; nenhuma dependência nova do app, nenhum asset existente reduzido. Registrar tamanho real do bundle e medir draws WebGL durante a apresentação. Não inferir RAM/VRAM, FPS ou p95 de hardware sem medição.

Comandos do app: `npm run check`, `node --test tests/*.unit.mjs`, `npx vite build` (assets ESO cacheados), Playwright com configuração local e Chrome 156.0.8078.47. O download externo do build completo não foi repetido. Não reconstruir dist durante testes. Resultados e limitações finais são registrados em `ESCRITA-RESULTS-V26.md`; testes planejados acima não são automaticamente considerados aprovados.


## Reproduzir capturas e pacote

Na raiz do repositório, com o build servido em 4173:

```sh
node docs/creation/escrita-v26-validation/capture-v26.mjs
python3 docs/creation/escrita-v26-validation/package-v26.py
python3 -m http.server 4307 --bind 127.0.0.1 --directory /workspace/orion-v26-cloudflare-upload
node docs/creation/escrita-v26-validation/package-review-v26.mjs
```

Chrome fica em `/workspace/orion-validation-pr179/chrome/root/opt/google/chrome/chrome`; os helpers são adaptáveis a outro caminho. Playwright usa workers=1, retries=0 e SwiftShader. Novos testes: `tests/equipment-writing-v26.spec.js` (oito). Regressões: `tests/creation-journey.spec.js`, `tests/recruitment-v25.spec.js` e `tests/quality-diagnostic.spec.js` (30). O nome histórico do arquivo V25 não indica que o browser usou o build antigo. Os cinco casos de equipamento foram repetidos após o ajuste textual final (`copy-regression.log`). `test-summary.json` enumera os 38 distintos, sem somar repetições.

`browser.log` preserva a primeira rodada com cinco passes e três falhas de expectativas dos testes. `browser-final.log` preserva a rodada com seis passes e duas falhas de duração. `browser-fixed.log` aprova os oito após corrigir o relógio. `regression.log` aprova as 30 regressões. A consolidação não apaga as falhas intermediárias.

Vídeo é gravação real do browser com fixture preparada, sem acelerar o tempo ou gerar quadros. O helper aponta em memória o adaptador FFmpeg do Playwright para `/usr/bin/ffmpeg`, sem modificar node_modules. Transcodificação com `libx264`, dois threads, preset fast, crf22, yuv420p e faststart; pad mantém dimensões pares. Viewport de 1920×951 é gravado pelo Playwright em 1920×950. Metadados reais em `video-metadata.json`. Mobile é emulado. Não há estimativa de desempenho físico a partir desse vídeo.

`package-validation.json` registra persistência/JSON/recarga/estrela e zero draws durante o papel. `capture-validation.json` registra os tamanhos e erros da captura. `preservation.json` compara recursos anteriores. `artifact.json` identifica ZIP/CRC/SHA; `served-files.json` confere conteúdo JS/CSS/HTML/relatório/licença servido por HTTP contra o ZIP final. Mudanças finais no relatório não alteram o build testado.
