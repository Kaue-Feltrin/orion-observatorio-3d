# Reprodução e arquivos

Os scripts registram os caminhos absolutos usados nesta nuvem. Chrome local: /workspace/orion-validation-pr179/chrome/root/opt/google/chrome/chrome. Node 24.19.0. Playwright 1.56.1. SwiftShader por software; nenhum ensaio na GTX 1660 física.

Para reproduzir o A/B, extraia ORION-SITE-V20.zip em uma pasta estática servida por HTTP em 127.0.0.1:4301 e ORION-SITE-V21.zip em outra na porta 4302. Execute benchmark-v21.mjs, adaptando imports/caminho do Chrome às dependências locais. Sem outros navegadores medindo desempenho em paralelo. O resultado usa duas repetições por versão, ordem A–B–B–A, seis segundos por etapa após aquecimento. Inspeciona leituras de âncoras, resolução real e desenhos; FPS por RAF, não timer de GPU. Dados brutos incluem contexto e tempos.

benchmark-rejected-single-pass.json é o experimento descartado: menos draw calls, mas FPS menor em software. compositor-parity-isolated.json pertence apenas a esse experimento; pontos aleatórios foram ocultados nos dois lados para isolar o fundo. O compositor final foi revertido byte a byte ao V20.

browser-final.log registra 34 aprovações antes do ajuste adicional da regra mobile da inscrição. midwidth.log registra as duas falhas reproduzidas que motivaram esse ajuste. focused-final.log registra as verificações repetidas após a correção. Não somar reexecuções como se fossem cenários diferentes.

capture-clean-v21.mjs exercita o pacote HTTP com mãos habilitadas em três tamanhos. contrast-clean-v21.mjs mede luminância sob pixels de glifos em estado reduzido/estático, retirando temporariamente só a cor da tinta para capturar o fundo. Capturas de texto transparente/branco são sondas, não estado entregue ao usuário. O contraste local não é auditoria integral WCAG.

preservation.json compara assets com o ZIP V20 e módulos de runtime com seu commit. travelAndHands também compara com a base original do Observatório. Órion Fichas conferido por HEAD/status, sem alterações.

Os logs preservam os resultados reais, com códigos de cor ANSI e espaços finais removidos para leitura no repositório.
