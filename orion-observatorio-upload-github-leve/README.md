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
