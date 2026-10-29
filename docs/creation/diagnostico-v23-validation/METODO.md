# Reprodução

Node 24.19.0 e Chrome/SwiftShader local, sem GPU física. `node tests/render-quality.unit.mjs` reproduziu a falha no código V22 antes do patch; reproduced.log mantém a falha real. Unitários finais: `node --test tests/*.unit.mjs` (23 arquivos).

Navegador: `npx playwright test tests/quality-diagnostic.spec.js tests/quality-control.spec.js --config=playwright.local.config.js`. Seis cenários; dois repetidos após a inclusão das linhas de revisão/cena. O foco é a origem e atualização da amostra, não o valor de FPS da nuvem. O mock do nome genérico Brave ocorre somente no teste.

capture-diagnostic-v23.mjs usa o pacote HTTP fixo na porta 4304; adapte caminhos absolutos de Chrome, dependências e saída para reproduzir. As capturas são do navegador, sem edição de pixels. package-validation.json contém apenas as amostras do navegador de teste desta nuvem, não o relatório privado completo do usuário.

preservation.json compara arte com o ZIP V22, módulos de runtime com a base e HEAD/status do checkout protegido. Cores ANSI e espaços finais foram removidos dos logs para leitura. Não há nova medição de ganho de renderização nesta revisão.
