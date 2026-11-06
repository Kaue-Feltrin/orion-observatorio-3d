# Validação do estudo visual

Google Chrome 156.0.8078.47, Playwright 1.56.1. HTML aberto por file://, sem servidor.

- Desktop: 1440 × 1000; mobile: 390 × 844.
- Quatro telas renderizadas em cada viewport, sem rolagem horizontal de página.
- Primeira rodada: filtro textual (incluindo vazio sem resultados), filtro de categoria, seleção de origem por Enter e restauração de foco, navegação de etapa, edição de nome, navegação da Oficina, escolha/confirmação/reinício da evolução fictícia, inventário e recursos +/− passaram nos dois tamanhos.
- Zero erros de JavaScript e zero requisições HTTP externas na primeira rodada. Resultado em validacao.json.
- Após refinamentos de tipografia, símbolo decorativo, área de toque e campo de nome obrigatório: quatro telas/capturas novamente verificadas nos dois tamanhos; rejeição de nome vazio confirmada.
- O Chromium do sistema bloqueou file:// por política administrativa numa tentativa da segunda rodada. A rodada foi executada com sucesso no Google Chrome indicado acima, que já havia executado a primeira. Esse bloqueio é do ambiente de teste, não uma falha reproduzida do HTML.

Limites: não é homologação de acessibilidade, regras, OAuth ou persistência real. Parte das seções é identificada como área reservada; nenhuma delas é apresentada como funcionalidade completa. Os arquivos são locais e não foram hospedados nem exportados como anexos nesta sessão.
