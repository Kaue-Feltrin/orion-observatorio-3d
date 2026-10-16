# Observatório v0.9.16 — validação de custo das mãos FPS no computador real

## Objetivo

Quantificar a diferença de custo **com o modelo David Fischer** e **sem mãos**, mantendo o mesmo universo, bloom, DPR e recortes, para decidir se a prévia v0.9.15 poderá ser aprovada. A pose natural continua **intacta**. Não afeta a produção `main`.

## Pesquisa de soluções existentes

1. [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame): o callback acompanha o ritmo do navegador; a taxa varia conforme monitor e visibilidade, e pode pausar em segundo plano. Já temos um único loop `tick` no Observatório, logo reutilizamos suas amostras, **sem adicionar um segundo loop**.
2. [Chrome / web.dev — Towards an animation smoothness metric](https://web.dev/articles/smoothness): FPS amostrado por rAF é indicador útil, mas não mede todos os quadros efetivamente apresentados pela GPU e um segundo loop de coleta pode alterar desempenho. Métricas de p95 e long frames são necessárias para perceber engasgos.
3. [MDN — Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API): impede benchmarking com aba oculta, pois o navegador pode reduzir ou pausar frames.

## Como utilizar

Abra a **prévia desta branch** com:
- `?debug=1&quality=eco-plus&hands=fps&fpsStyle=natural`
- Com o mesmo monitor, resolução, escala e outras abas ociosas, aguarde ao menos 10 segundos.
- No painel **Comparação A/B · mãos FPS**, clique **Registrar amostra atual**.
- Clique **Testar sem mãos FPS**. Aguarde novamente ao menos 10 s, mantendo a mesma janela.
- Clique **Registrar amostra atual**. O painel compara FPS médio, p95, draw calls e texturas. 
- Clique **Copiar diagnóstico** para obter as duas amostras e o delta. Envie os dados para avaliação.
- Repita a sequência (limpando as duas amostras) para distinguir variação aleatória de custo real. Se necessário, faça um segundo par invertendo a ordem.

## Regras implementadas

- Captura apenas por clique explícito; **zero telemetria para servidor**.
- Usa o `performancePanel.snapshot()` existente, amostrado do loop `tick`; não cria nova animação nem mede GPU diretamente.
- Guarda os dois resultados em **sessionStorage**, apenas na aba atual, para sobreviver ao reload ao alternar `hands=fps|off`.
- Rejeita amostras com menos de 10 segundos do carregamento ou 30 quadros, qualidade diferente de `eco-plus`, aba oculta, erro/carregamento pendente do modelo ou modalidade incorreta.
- **Não calcula delta** se resolução, DPR, pixels, qualidade, camadas ou opções relevantes da cena forem diferentes.
- Indicador `FPS` em navegador não equivale a FPS realmente apresentado pela GPU. A memória JavaScript não mede RAM total nem VRAM. Use o Chrome `Shift+Esc` para observar memória da aba como apoio.
- O relatório pode ser copiado; falha de clipboard permanece coberta pelo fallback existente.
- Não mexer na geometria/pose, na ESO/S. Brunier, no Nox, bloom, número de estrelas, viagem ou produção.

## Arquivos

- `hands-benchmark.js`: controle A/B, persistência da sessão, validação de assinatura da cena e relatório.
- `performance-panel.js`: integra o controle ao painel do modo `debug=1` e inclui o resultado no botão de cópia existente.
- `tests/hands-benchmark.spec.js`: testa delta, incompatibilidade de cena, alternância e limpeza com navegador real, sem rodar um segundo loop de renderização.

## Critérios de saída

CI geral + teste visual do painel e de navegação FPS/off. Após isso, **medir no PC do usuário** e conferir o aspecto real da pose antes de aprovar a v0.9.15. Não promover `main` automaticamente.
