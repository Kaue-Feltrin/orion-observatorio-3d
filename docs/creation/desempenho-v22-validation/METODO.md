# Procedimento de medição

Chrome instalado em /workspace/orion-validation-pr179/chrome/root/opt/google/chrome/chrome; Node 24.19.0, Playwright 1.56.1, Three.js 0.180.0. Scripts registram os caminhos absolutos usados na nuvem; adapte imports, destino e caminho do Chrome para reproduzir em outra máquina.

Extraia o ZIP V21 em uma pasta HTTP fixa na porta 4302 e V22 em outra na 4303. benchmark-final-v22.mjs executa A–B–B–A sequencialmente, com mãos originais, movimento ligado, qualidade balanced manual, canvas 829×927. Aquecimento de 1,8 s + seis segundos por etapa, duas repetições de cada versão, sem outros navegadores medindo em paralelo. Não há queries de tempo no benchmark final. São 12 amostras em três etapas, não 12 dispositivos. Amostras por software não equivalem à GTX física.

GPU-profile usa queries EXT_disjoint_timer_query_webgl2 por draw e medições JS das chamadas update. Os dados são intrusivos, com extensão disponível e GPU_DISJOINT_EXT falso; servem para localizar o custo. Timer fornecido pelo driver SwiftShader por software, sem GPU física. Não comparar FPS dessa instrumentação com o benchmark final sem instrumentação.

shader-experiment avalia V21 com alterações de shader em runtime, separando silhueta, UV e combinação, nos dois sentidos. flat-planes isola forceSinglePass apenas nos planos transparentes de quatro vértices. Esses ensaios são exploratórios e não substituem a comparação final dos dois bundles.

parity-final troca apenas os shaders na mesma cena viva, com referência V21 congelada, rigs/câmera estáticos e uniformes controlados. Os seis cenários em três tamanhos incluem dissolução, carga, hover/seleção, transição e âncoras retrato. Os dois arquivos em reference-v21 são cópias exatas da base c4bacd1 e ficam fora do pacote do site. No script original os mesmos arquivos estavam em /workspace/scratch/*-before-v22.js. Capturas são do navegador; Sharp somente lê pixels para calcular diferenças, não edita as imagens da aplicação.

Regressão: criação cinematográfica, carregamento, voltar/clique/toque, céu distante, três destinos de viagem e controle de qualidade. Scripts finais de comparação visual/captura e testes funcionais podem rodar em paralelo; não integram a coleta isolada de FPS.

preservation.json lista os arquivos de arte iguais ao ZIP V21, módulos fora do escopo idênticos à base e HEAD/status do checkout protegido do Fichas. Logs mantêm resultados reais, com cores ANSI/espaços finais removidos para leitura. Não há dados de contas ou tokens nestes registros.
