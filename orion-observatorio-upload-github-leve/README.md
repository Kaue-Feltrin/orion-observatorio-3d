# Projeto Órion · Observatório da Constelação

Landing 3D do Observatório. Projeto independente do site principal Projeto Órion.

## Rodar no Windows

1. Instale Node.js 22 ou superior.
2. Execute `npm install` na pasta do projeto.
3. Execute `npm run dev`.
4. Abra <http://127.0.0.1:4173/>.

> O Three.js é empacotado localmente pelo Vite: **não há dependência de CDN no navegador**.

## Comandos

- `npm run dev`: servidor de desenvolvimento com atualização automática.
- `npm run check`: verifica sintaxe, integridade das texturas e estrutura de arquivos.
- `npm run build`: compila a pasta `dist/` para produção.
- `npm run preview`: serve o build para testes.
- `npm run test:browser`: executa os testes com Playwright (necessário instalar Chromium com `npx playwright install chromium`).

## Cloudflare Pages (Git)

1. Crie um repositório vazio no GitHub: `orion-observatorio-3d`.
2. Envie estes arquivos para o repositório usando `PUBLICAR_GITHUB.bat` (requer Git instalado).
3. No Cloudflare, entre em **Workers & Pages → Create → Pages → Connect to Git** (o texto exato pode variar).
4. Selecione **somente** o repositório `orion-observatorio-3d`.
5. Configurações de build:
   - branch de produção: `main`
   - comando: `npm run build`
   - diretório de saída: `dist`
   - versão Node.js: **22** (definir variável `NODE_VERSION=22` se solicitado)
6. Confirme o deploy e abra a URL `.pages.dev` atribuída pelo Cloudflare.

Não é necessário configurar D1, Workers, R2, variáveis secretas, autenticação ou domínio customizado nesta etapa.

## Segurança

Nunca publique tokens no repositório. A integração GitHub/Cloudflare é feita via tela de autorização do Cloudflare. O script de publicação usa as credenciais já gerenciadas pelo Git ou Git Credential Manager do Windows.

## Arquitetura

- `startup.js`: carregamento monitorado, com mensagem de erro.
- `main.js`: câmera/Three.js, cena, estrela e viagem.
- `styles.css`: HUD.
- `public/assets`: imagens de execução publicadas no Cloudflare.
- `ficha.html`: destino temporário do salto.
- `.github/workflows`: checagem de build e navegador a cada push.
- `tests`: verificação estática e testes reais com Playwright.

## Escopo do pacote

Esta é a **base técnica da v0.8 existente**, agora preparada para deploy contínuo. Não muda deliberadamente o visual: a próxima fase substitui as texturas e trabalha a coreografia da viagem. Os masters grandes não entram no deploy para reduzir o peso do repositório.

## Upload inicial sem Git instalado

Este pacote reduz texturas de imagem, sem `.git`, sem masters e sem dependências.

1. Abra https://github.com/Kaue-Feltrin/orion-observatorio-3d
2. Clique em `uploading an existing file` se o repositório estiver vazio.
3. Extraia este pacote, entre na pasta e envie **os arquivos e pastas dentro dela**, não o ZIP.
4. Confirme em `Commit changes`.

## Nova nebulosa fotográfica (branch de testes)

A nebulosa usa a fotografia de céu inteiro da **ESO/S. Brunier** (GigaGalaxy Zoom).
A textura é baixada e recortada automaticamente durante o build, que interrompe em caso de falha para impedir publicação com arquivos ausentes.
Crédito completo visível na interface. Licença **Creative Commons Attribution 4.0**: https://www.eso.org/public/images/eso0932a/.
Adaptações: recorte do centro da Via Láctea, ajuste de luminosidade, saturação e balanço de cores.
A câmera e a coreografia 3D não foram modificadas nesta etapa.

## v0.8.1 · Camera rig tridimensional

A fotografia ESO permanece inalterada. O rig Three.js agora separa movimento lateral/vertical de yaw, pitch e roll. Há poeira adicional (200 pontos, z de −56 a −6), com opacidade discreta; o fundo distante responde muito menos ao deslocamento da câmera que as partículas próximas.

**Amplitudes com `depth=1`:** lateral ±6,8 unidades; vertical ±4,35; yaw ±0,068 radianos; pitch ±0,052; roll ±0,011. Além disso: respiração lenta ±0,25 e aproximação em hover de 0,9. Use `?debug=1` para ajustar a intensidade sem alterar código.

Quando a estrela é selecionada, `scene.attach(camera)` preserva a transformação global antes da coreografia do hiperespaço, que continua intacta.

## v0.8.2 — Nebulosa Viva (prévia)

- Cinco planos GLSL de gás transparente posicionados à frente da fotografia ESO em z=−225, −195, −169, −112 e −73.
- Turbulência suave em fBm, sem mover UVs da foto. Gás com opacidade baixa e bordas naturais.
- Bloom seletivo real: EffectComposer + UnrealBloomPass somente nos emissores da estrela (layer 1); foto renderizada nítida à parte.
- Controles em `?debug=1`: densidade, fluxo e bloom, além de perspectiva.
- A câmera 3D e a coreografia do hiperespaço foram preservadas.

## v0.9 — Estrela Viva + Viagem Real

A estrela passa a ser um astro distante em z=−470, integrado à fotografia ESO reposicionada para z=−540. Uma sprite invisível na camada 2 permite selecionar a estrela por raycasting, com a mesma acessibilidade por HTML/teclado.

A animação nova está isolada em `star-journey.js`. Primeiro concentra o olhar, depois percorre fisicamente as profundidades das nuvens gasosas (a câmera vai de z~26 a z=−417, sempre a mais de 50 unidades da estrela), gerando streaks de partículas que passam pela câmera e suavizando as camadas já atravessadas. Durante o voo, o núcleo mantém um tamanho angular quase constante, e o halo só se expande no final, antes do véu de luz ocupar toda a tela. A fotografia ESO não recebe blur.

`?debug=1` disponibiliza `__orionStarDebug` para testes. A versão de produção da main permanece preservada.

## v0.9.1 — Respiração Cósmica (prévia separada)

Esta versão parte da **v0.9 já validada no Chromium** — nunca substituir o projeto por um ZIP da v0.8.

- Fotografia original ESO inalterada: posição, textura, nitidez e opacidade.
- Camadas GLSL de gás com variação independente de brilho (~3–5%, períodos distintos).
- Camadas frontais transparentes respiram de modo independente sem mover a imagem de fundo.
- Estrelas comuns têm duas oscilações por ponto, velocidades, fases e amplitudes aleatórias na GPU.
- Estrela principal mantém seu núcleo e seus halos, com pulso lento, microcintilação e um farol etéreo suave a cada ~8,5 s.
- Hover continua chamativo, sem anel de interface.
- Câmera, profundidades, bloom e o módulo star-journey.js são preservados da v0.9.
- Preferência do sistema por reduzir movimento desativa os novos pulsos.
- `?debug=1` expõe `window.__orionRespirationDebug` para inspeção.

A publicação de prévia ocorre automaticamente ao enviar alterações para a branch `preview/respiracao-cosmica-v091`.

## v0.9.1.1 — Correção de desempenho (prévia de emergência)

A v0.9.1 apresentou travamentos e consumo de memória relatado de quase 4 GB em um navegador real. Ainda não foi possível medir o consumo real de RAM/GPU nesse dispositivo; os fatores abaixo foram identificados por inspeção do código e são mitigados nesta prévia:

- Limite de DPR e de pixels: padrão máximo de 2,2 milhões de pixels em vez de 2× DPR indiscriminado; `?quality=lite` reduz a aproximadamente 1,15 milhão.
- Bloom isolado em ~34% da largura/altura em vez de 55%; na qualidade leve, 26%.
- 3 planos GLSL ativos no modo equilibrado; 2 em lite; até 5 em `?quality=high`.
- Ruído fBm reduzido de 5 para 3 oitavas por chamada, mantendo camadas gasosas vivas.
- O fundo `farCloud`, oculto atrás da fotografia ESO totalmente opaca, deixa de fazer draw call.
- Renderização limitada a 30 FPS estáveis no modo leve; em segundo plano a renderização fica suspensa.
- Se a média por dois intervalos de 3s ultrapassar 32 ms/quadro, cai um nível de qualidade automaticamente.
- `?debug=1` mostra dados via `window.__orionPerformance` (modo, DPR, máximo de pixels, camadas GLSL, chamadas, texturas), **não** o uso real de RAM/VRAM.
- Nenhuma alteração na fotografia ESO, na câmera, na estrela/click ou em `star-journey.js`.

Teste comparativo: `/?quality=lite`, `/?quality=high`; deixe padrão para qualidade automática.

## v0.9.2 — Clean Cinematic (prévia isolada)

Composição reequilibrada **por subtração**, preservando a fotografia ESO original, a posição física da estrela, a câmera de paralaxe e o módulo `star-journey.js` da v0.9.

- Estrelas reduzidas de 4.120 para **1.010** (−75,5%). Fundo 720, meio 205, primeiro plano 65 e 20 motes diante da câmera.
- Pontos menos brilhantes e menores; textura astronômica mantida mas levemente escurecida **somente pelo material 3D**, sem editar a imagem de origem.
- Nuvens frontais, poeira, densidade GLSL e bloom de repouso mais contidos; duas camadas de gás no perfil equilibrado e uma no leve.
- Novo `cinematic-star.js`: diffraction spikes rasterizados uma única vez em CanvasTexture (512×512), duas camadas translúcidas com rotação em GPU, pulso e resposta ao hover; são raios de luz gradativos e finos, não uma estrela desenhada.
- Estrela segue selecionável por Raycaster, sem alteração da coreografia da viagem.
- `prefers-reduced-motion` desativa a rotação dos raios.
- O orçamento de memória/renderização e modo adaptativo da v0.9.1.1 continuam ativos.

Para validar a interação, abrir `?debug=1`; `window.__orionCinematicDebug` expõe as sprites e as geometrias de pontos.

## v0.9.2b — Sparse Void (apenas prévia)

Solicitado mais silêncio cósmico: apenas **146 estrelas 3D** (110 distantes, 28 médias, 8 próximas; 0 partículas diante da câmera), contra 1.010 na v0.9.2. Menores e mais discretas, cintilação reduzida. Nenhuma pode nascer dentro da elipse de exclusão projetada em torno do Nox (raios aproximados de 51% da meia-largura e 42% da meia-altura da tela). A área livre se mantém entre as profundidades iniciais.

O fundo estelar com pontinhos pré-impressos e a camada PNG de poeira também são ocultados, eliminando a fonte de ruído **que não obedecia à contagem de partículas procedural**. A fotografia ESO permanece sem qualquer edição de bytes; só a iluminação do material 3D é reduzida para `(.43,.46,.53)`, preservando sua opacidade. As nuvens gasosas sutis e a estrela principal com seus diffraction spikes giratórios continuam funcionando.

**Intocados:** `star-journey.js`, câmera, Raycaster, halo de chegada, limites adaptativos de qualidade, link da ficha, créditos ESO. O teste Playwright mede a contagem de pontos, ausência de partículas no centro e visibilidade das imagens de poeira, além da viagem.

## v0.9.2d — fotografia restaurada e foco no Nox (prévia)

A v0.9.2c tentou remover estrelas do JPEG astronômico; o usuário rejeitou o resultado e pediu para **desfazer e adicionar só um filtro para dar destaque à estrela principal**.

Esta branch parte da **v0.9.2b**, anterior à alteração. O script de preparação da ESO permanece o mesmo (sem mediana, máscara de recorte ou apagamento de estrelas). Nada é gerado por IA e não houve substituição da fotografia por ilustração. Adicionamos unicamente uma vinheta suave e um leve ganho de luz local em CSS, que acompanham o ponto projetado 3D do Nox através de duas variáveis CSS atualizadas apenas quando necessário.

Todos os arquivos da câmera, shaders, bloom, viagem e partículas continuam como na v0.9.2b. O Nox mantém os dois diffraction spikes giratórios. Evitar merge sem avaliação visual pelo usuário. Build e testes incluem verificação negativa para processamento de remoção estelar.
