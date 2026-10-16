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

## v0.9.3 — Nebulosa em Volume + câmera mais fluida

- Preserva integralmente **o mesmo JPEG ESO** usado na v0.9.2d: não suprime estrelas nem altera nitidez, enquadramento ou créditos.
- Gera **4 recortes orgânicos transparentes derivados da mesma foto** durante o build (WebP RGBA de no máximo 800 px por textura; pixels de estrelas filtrados somente nos recortes, não na foto).
- Reposiciona esses recortes em **z = -425, -342, -252, -185**. O reenquadramento os alinha à foto na posição inicial; movimentos independentes e profundidades reais causam paralaxe e uma leve sensação de massas respirando.
- O véu frontal existente é mantido; não adiciona partículas ao céu vazio da cena nem luz excessiva.
- Carrega sob demanda só os fragmentos visíveis: 2 no modo leve, 3 no equilibrado, 4 em alta qualidade. A v0.9.3 **não adiciona shader pesado de tela inteira**.
- A suavização do mouse sai do filtro exponencial lento (~140 ms) para um ~55 ms, mantendo interpolação independente da taxa de quadros.
- Evita a leitura síncrona de `card.offsetHeight` no loop e escreve posições de CSS/HTML só se realmente mudam.
- Modo leve passa a permitir **até 60 FPS** (em vez de forçar 30) com limite ainda menor de pixels. Bloom atualiza a meia frequência em repouso; imagem principal, câmera e interação seguem em todo quadro.
- **Não modifica `star-journey.js`**, nem o caminho da ficha, o comportamento da estrela, o Raycaster e a viagem já aprovada.
- Testes Playwright novos verificam alinhamento de planos, assets, movimento orgânico, resposta da mira, qualidade adaptativa e seleção/viagem.

Os testes de funcionamento não são um benchmark real de RAM/FPS em hardware do usuário.

## v0.9.4 — Diagnóstico de Fluidez (prévia isolada)

A v0.9.3 permanece como base. Esta versão **não altera a composição visual, a fotografia ESO, as estrelas, o Nox, a viagem nem a produção**.

Acesse a prévia com `?debug=1` para abrir o painel local "Diagnóstico de fluidez" no painel de ajustes. Ele atualiza a cada ~1 segundo e mostra:
- FPS médio e p95 de duração de quadros (~4 segundos), além da proporção acima de 33,3 ms;
- perfil adaptativo, DPR, número de camadas GLSL e massas fotográficas;
- draw calls por quadro e contagem de texturas GPU;
- diferença entre o alvo do ponteiro e a posição suavizada da câmera em pixels estimados (não é latência ponta a ponta);
- heap JavaScript, **apenas se disponível**, que não mede a RAM total da aba nem VRAM.

Use **Copiar diagnóstico** e cole o texto no chat. Não é enviado automaticamente a lugar nenhum. Caso o navegador impeça a cópia, aparece uma caixa para seleção manual.

Para observar RAM total no Chrome do Windows, abra o gerenciador de tarefas interno com **Shift+Esc**. Compare também o perfil `?debug=1&quality=lite` e a qualidade padrão. A janela de diagnóstico e o módulo de métricas são instanciados apenas em modo debug; em `/` não aparece UI adicional.

A frequência de quadros do Chromium headless com SwiftShader (CI) não é referência para FPS do PC do usuário. O deploy atual deve ser avaliado visualmente antes de qualquer merge.

## v0.9.5 — Eco + testes comparativos de GPU (prévia)

**Motivo:** diagnóstico coletado no PC do usuário em 15/10/2026, resolução 1920×951, `quality=lite`, DPR ~0,72: **14 FPS médios; p95 de 105,5–111,1 ms; 100% dos quadros acima de 33 ms; 25 draw calls; 20 texturas GPU; diferença interna mouse/câmera de 0,2–0,4 px**. Essas métricas não permitem atribuir a culpa exclusivamente à GPU; justificam experimentos separados.

A versão não edita o JPEG ESO, o Nox, os raios giratórios, o `star-journey.js`, a viagem, a ficha ou as 146 estrelas procedurais. O modo padrão mantém a estética anterior até que medições justifiquem um ajuste.

**Modo Eco experimental:** `?debug=1&quality=eco`
- Limita a 500 mil pixels por quadro (DPR máximo 0,53) e conserva **2 recortes fotográficos posicionados em profundidades reais**.
- Desativa o gás procedural GLSL e **todos os passes de bloom em repouso**, mas mantém sprites do Nox, fotografia original e movimento das massas. Durante a viagem, o bloom volta para preservar o clarão.
- O perfil automático pode cair de Lite para Eco após dois intervalos lentos, em vez de continuar preso em Lite mesmo a ~14 FPS. Selecionar uma qualidade explicitamente na URL impede essa mudança durante a comparação.

**Comparação controlada no painel de debug:** quatro links abrem variantes mantendo o resto da composição:
1. `?debug=1&quality=lite` — referência v0.9.4.
2. `?debug=1&quality=lite&effects=no-bloom` — isola bloom em repouso, mantém gás.
3. `?debug=1&quality=lite&effects=no-gas` — isola gás GLSL, mantém bloom.
4. `?debug=1&quality=eco` — reduz pixels, remove os dois efeitos pesados em repouso.

Copiar diagnóstico de cada opção e comparar FPS/p95 e aparência. Resultado do Chromium/SwiftShader no CI **não representa GPU do computador do usuário**; mudanças só serão mescladas após avaliação real. Medir RAM total separadamente com Shift+Esc no Chrome.

**Registro central:** https://github.com/Kaue-Feltrin/orion-observatorio-3d/issues/10

## v0.9.6 — Eco+ intermediário / comparação de nitidez (prévia)

Em 15/10/2026, o usuário mediu **Lite 20 FPS (p95 72,2 ms), Lite sem bloom 17 FPS (72,3 ms), Lite sem gás 23 FPS (50,1 ms) e Eco 33 FPS (38,9 ms)**. A redução de resolução e a remoção de gás/efeitos foram concomitantes no Eco, então não é possível concluir qual delas foi determinante, nem afirmar que o bloom "piora" ou "melhora" o desempenho isoladamente.

Novo perfil **Eco+**: `?debug=1&quality=eco-plus` usa DPR máximo 0,60, orçamento máximo de 670 mil pixels, preserva duas massas fotográficas reais em Z e **mantém o bloom seletivo de repouso**, sem GLSL de gás. `?debug=1&quality=eco-plus&effects=no-bloom` desativa apenas o bloom e preserva o restante. A escala intermediária busca melhor nitidez que Eco (0,53) e menos custo que Lite (0,75); **qualidade e FPS reais continuam dependendo do dispositivo**.

No painel de debug, comparar na mesma resolução de janela e com tempo semelhante:
- Lite original: `?debug=1&quality=lite`
- Lite sem gás: `?debug=1&quality=lite&effects=no-gas`
- Eco+ (gás off, bloom on): `?debug=1&quality=eco-plus`
- Eco+ sem bloom: `?debug=1&quality=eco-plus&effects=no-bloom`
- Eco básico: `?debug=1&quality=eco`

Deixar cada teste estabilizar, copiar pelo menos duas medições e observar também nitidez da ESO, percepção de volume e luminosidade do Nox. O perfil automático passa gradualmente Lite → Eco+ → Eco em lentidão prolongada, mas a escolha manual via URL permanece constante durante comparações. Nenhum dado é enviado automaticamente; o histórico e o estado de aprovação estão na [issue #10](https://github.com/Kaue-Feltrin/orion-observatorio-3d/issues/10). Não publicar em produção sem aprovação explícita.

## v0.9.7 — Profundidade orgânica sem custo adicional de renderização (prévia)

Referência aprovada para preservar: **Eco+ com bloom** da v0.9.6 (medido no PC do usuário em 16/10/2026: 60 FPS, p95 16,8 ms, 0% de quadros acima de 33 ms, 1920×951, DPR 0,60, 656.640 pixels, 2 recortes, 0 gás GLSL). O modo Eco+ sem bloom deu os mesmos 60 FPS e o usuário preferiu manter o brilho extra. A meta é preservar essa fluidez, **não alegar que a v0.9.7 também atinge 60 FPS antes de medir no PC**.

**Implementação:** os planos já existentes de recortes orgânicos da foto ESO respondem ao movimento suavizado da câmera com uma leve inércia independente. O véu próximo recebe mais deslocamento do que a nuvem distante; ambos preservam seus valores z reais. Uma respiração de escala abaixo de 0,4% soma uma sensação de vida sem parecer oscilação de imagem inteira. Reduções de movimento do sistema desativam o efeito adicional.

**Custos e preservações:** 0 novas texturas, 0 novos materiais, 0 meshes, 0 shaders e 0 passes extras de bloom. Não modifica o JPEG ESO/S. Brunier, as 146 estrelas, o brilho/espículas do Nox, a interação, `star-journey.js` ou a estética da interface. Apenas atualiza posição e escala de recortes já desenhados pela GPU.

**Comparação visual na mesma prévia:**
- `?debug=1&quality=eco-plus` — Eco+ com profundidade orgânica ligada.
- `?debug=1&quality=eco-plus&depthMotion=off` — Eco+ com a paralaxe adicional desligada, preservando a respiração e o bloom anteriores.

Comparar ao mover o mouse para esquerda/direita e observar a diferença de profundidade. Copiar o FPS/p95 de ambos e avaliar se há movimento artificial ou brilho excessivo. **Não mesclar em produção até aprovação explícita.**

Registro central: https://github.com/Kaue-Feltrin/orion-observatorio-3d/issues/10

## v0.9.8 — Paralaxe mais responsiva sem aumentar a carga gráfica

O usuário testou v0.9.7 e observou que **ainda havia pouco movimento responsivo da nebulosa**. A nova prévia resolve especificamente essa percepção, sem alterar a fotografia integral ESO ou o brilho aprovado do Nox.

- A nuvem central passa de 1,7 para **5,2 unidades** de deslocamento lateral; o véu próximo passa de 5,0 para **16,5 unidades**, tornando a diferença entre os planos em Z mais visível ao atravessar a tela com o mouse.
- O alvo é agora a posição **direta do cursor**, e não a câmera já suavizada. A interpolação do véu foi acelerada de 4,2/s (~240ms) para **14/s (~70ms)**. A câmera mantém seu smoothing próprio.
- Movimentos verticais proporcionais (nuvem central: 2,1; véu próximo: 6,2) ajudam a perceber profundidade sem mover a imagem panorâmica de base.
- Em `?debug=1`, o slider **Paralaxe da nebulosa** permite calibrar intensidade de 0,45× a 1,60× instantaneamente. O valor padrão é 1,0× sobre amplitudes já reforçadas. Continua possível usar `?depthMotion=off` para comparar.
- Nenhuma nova textura, material, shader, luz, estrela, mesh ou pass de renderização. Preservar `quality=eco-plus`, bloom, foto ESO e `star-journey.js`.

**Teste no PC:** abrir `?debug=1&quality=eco-plus`, comparar com `?debug=1&quality=eco-plus&depthMotion=off`, testar movimento horizontal e vertical com o slider, verificar FPS/p95 e se os recortes parecem orgânicos, não peças soltas. A v0.9.6 Eco+ com bloom chegou a 60 FPS/p95 16,8ms no PC do usuário; isso **não garante** o desempenho desta nova revisão. Não mesclar sem aprovação visual e explícita.

## v0.9.9 — Véu fotográfico próximo / profundidade em primeiro plano (prévia)

Feedback em 16/10/2026: a v0.9.8 finalmente acompanha bem o mouse, mas o usuário ainda percebe ausência de **camadas próximas da câmera** e pergunta se **as mãos** poderiam resolver.

**Decisão de composição:** mãos em primeira pessoa, quando o projeto tiver um modelo/asset definido e aprovado, podem ser uma âncora fortíssima de profundidade; **não substituem** nuvens em planos físicos distintos. Esta etapa não inventa mãos ou elementos novos. Testa primeiro um terceiro recorte fotográfico da **mesma fotografia ESO**.

Em `?quality=eco-plus`, reutiliza o recorte ESO `03` já disponível no build, posicionado em **Z = −75** (em vez de −252) com apenas **38% da opacidade original** (aprox. 0,072), mantendo `02` em Z = −342 e `04` em Z = −185. A projeção inicial recalcula tamanho/posição para preservar alinhamento com a foto principal; o deslocamento do cursor cria paralaxe muito mais pronunciada devido à proximidade. A ordem das camadas transparentes agora é calculada pelo Z efetivo: o véu frontal deve ser composto depois do plano Z = −185. Não há shader, gás GLSL ou estrela adicional; **há um recorte e textura adicionais ativos** no Eco+, portanto pode haver pequeno custo adicional de GPU/VRAM. Não alegar 60 FPS sem dados reais.

**Comparar no mesmo PC:** `?debug=1&quality=eco-plus` com 3 recortes, contra `?debug=1&quality=eco-plus&foreground=off` com os 2 recortes de antes; bloom aprovado mantido nos dois. Verificar se o véu parece uma massa de nebulosa com profundidade ou um objeto transparente deslizando, além de FPS/p95 e RAM total no Chrome (Shift+Esc). `?depthMotion=off` continua testando a inércia, separadamente.

**Mãos:** não foram criadas nem incluídas nesta revisão. Se forem adicionadas posteriormente, considerar hierarquia frontal, oclusão, animação, sensibilidade a movimento reduzido e orçamento gráfico; testar com o usuário antes de fixar a estética.

A produção `main` continua intacta.

## v0.9.10 — Prova de conceito de mãos etéreas em primeira pessoa (prévia)

**Estudo técnico integral:** [ESTUDO-MAOS-PRIMEIRA-PESSOA-v0910.md](../ESTUDO-MAOS-PRIMEIRA-PESSOA-v0910.md).

Após a v0.9.9, o usuário validou 60 FPS com três recortes de nebulosa e pediu estudar e testar mãos em primeira pessoa para presença e escala. O protótipo usa duas silhuetas abertas discretas nas bordas inferiores, desenhadas em Canvas 2D uma vez e exibidas como **duas superfícies transparentes que compartilham uma textura**. A cor/pose são placeholders, não assets finais.

- `?debug=1&quality=eco-plus&hands=on`: mãos visíveis (desktop é o padrão nesta **prévia**).
- `?debug=1&quality=eco-plus&hands=off`: mesmas nebulosas, brilho, câmera e viagem, sem mãos.
- Em telas de toque, mãos ficam desligadas por padrão; `hands=on` serve para testar.
- A câmera contém as mãos como filhos, sem pós-processamento de bloom, sombra, novo shader, glTF ou ossos; a viagem as oculta. `prefers-reduced-motion` as mantém estáticas.
- O painel registra estado e quantidade de superfícies. Custo estimado no repouso: 2 draw calls e 1 textura; só o PC do usuário poderá verificar FPS/p95 e RAM total.
- Nenhuma mudança na foto original ESO/S. Brunier, seus créditos, no Nox, nas 146 estrelas procedurais ou nos 3 recortes já aprovados no Eco+.

Não tratar como direção de arte definitiva nem mesclar em produção sem aprovação explícita.
