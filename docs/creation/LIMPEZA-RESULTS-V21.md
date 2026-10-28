# V21 — Texto sobre a cena, sigilos inteiros e trabalho de layout

28/10/2026. Base V20 `b27f6b18be3ebcfa45cbdc95d11b9dd8b82dca85`, branch `feat/nascimento-marcado`. Revisão do Observatório independente; Órion Fichas permanece protegido.

## Analisado e implementado

As manchas eram pseudo-elementos com fundos e blur atrás dos títulos, legendas, formulário e mensagens. Esses elementos foram removidos. O texto fica diretamente sobre a cena; o título mantém apenas uma sombra curta de leitura. Não foi substituído por outra placa escura.

O convite agora é **Despertar**, em tipografia serifada com duas linhas finas, sem retângulo. O convite inteiro responde ao clique/toque. **Tornar Marcado** também perde o painel, preservando o gesto gráfico, a seta, o tamanho de interação e um sublinhado que responde ao hover/foco. Nas representações, seleção e foco usam uma única linha: foi removida a duplicação entre decoração de texto e pseudo-elemento. Campo de nome e comportamento de escolha preservados.

Na roleta, o círculo de conhecimento tinha largura proporcional a um contêiner mais largo que alto. O corte era consequência do diâmetro ultrapassar a altura, não de uma falha na imagem. O diâmetro agora respeita ambas as dimensões, com margem para a fonte; a frase ocupa o caminho circular sem sobrepor a emenda. O recorte que evita transbordamento horizontal em telas pequenas continua ativo. Silhuetas V20 e sua pintura por máscara preta permanecem idênticas.

O desenho das figuras precisava medir quatro âncoras DOM repetidamente, a cada 80 ms. Agora as posições ficam em cache e são recalculadas quando mudam tamanho, rolagem, viewport ou estado da etapa. ResizeObserver e eventos de scroll/resize invalidam o cache; o teste reprojeta a figura até a âncora após rolar. A remoção dos fundos com blur também elimina esses efeitos CSS. Imagens, resolução, perfis de qualidade, pulsação, mãos e bloom não foram reduzidos.

## Experimento descartado, não incluído no site

Foi ensaiada a composição das quatro texturas de névoa/vermelho em um shader. A comparação isolada do fundo, com pontos aleatórios ocultados em ambos os lados e a mesma resolução 1440×900, encontrou diferença máxima de 2/255 por canal no nascimento e 1/255 na identidade. Os desenhos por frame caíram de 14/31 para 10/27 no nascimento e de 11/27 para 9/25 na identidade (alternância da atualização de bloom).

Entretanto, o ensaio sequencial A–B–B–A em **Chrome SwiftShader**, 829×927, qualidade manual balanced, mãos desligadas, movimento ativo, aquecimento de 1,8 s e amostra de 6 s por etapa, apresentou FPS menor: nascimento V20 5,84–6,27 contra experimento 5,14–5,83; identidade V20 8,69–8,98 contra 6,67–7,50. Menos draw calls não comprovou ganho de fluidez. **O compositor experimental foi revertido integralmente.** O arquivo `creation-environment.js` da entrega é idêntico ao V20. JSON do experimento em `benchmark-rejected-single-pass.json`; não é resultado da versão entregue.

Uma primeira execução do harness foi interrompida por resposta HTTP durante a reconstrução de dist e foi descartada da comparação. A comparação completa acima usa duas pastas estáticas fixas. Essa interrupção foi do procedimento de medição, não uma falha reproduzida no fluxo do usuário.

## Testado

- `npm run check` aprovado e **23 arquivos de testes unitários** aprovados. Bundle `npx vite build` concluído; o download externo ESO do comando completo não foi reexecutado. Os sete assets ESO já presentes foram preservados por hash.
- **34 cenários de navegador aprovados** na regressão de criação/roleta: clique/toque/voltar, carregamento, fonte real sem fallback, sigilos, pulsação, entrada na identidade, reflow e rascunho local. A conferência adicional em 568×320 e 640×900 reproduziu um corte restante: uma regra mobile sobrescrevia o limite do círculo. Essa regra foi removida. Depois da correção, **14 cenários focados aprovados** (oito verificações de limpeza/geometria e seis de roleta), cobrindo os dois tamanhos que falharam e repetindo interação/teclado/toque/confirmação. São **36 cenários distintos aprovados** no conjunto das execuções; não houve uma única execução monolítica de 36 casos. O teste mede a caixa real dos glifos transformada para a tela nas rotações 0°, 45°, 90° e 180°, sem depender apenas de uma inspeção de screenshot.
- Cache em repouso, ensaio A–B–B–A final: **128–148 → 0 leituras DOM** por amostra de aproximadamente seis segundos no nascimento; **204–208 → 0** na identidade. Após resize/scroll e mudanças de estado, o teste confirma o realinhamento das figuras.
- A mesma amostra mantém **768.483 pixels**, qualidade balanced, texturas e contagens de desenhos originais: nascimento 14/31 e identidade 11/27. FPS nascimento V20 5,79–6,51 contra V21 5,68–6,18; identidade V20 8,74–9,00 contra V21 8,74–9,00. Há redução comprovada do trabalho de layout; **não há ganho demonstrado de FPS neste ensaio**. O cenário continua limitado pela renderização por software. Dados completos em `benchmark.json`.
- Pacote estático servido na porta 4302: fluxo real de despertar, representação/nome, origem e classe completado em 829×927, 390×844 e 320×568, com **mãos mesh habilitadas**, sem erros JavaScript, respostas HTTP de erro ou requisições de escrita. Capturas são do navegador, sem compor telas externamente.
- Contraste local dos glifos: **24 campos verificados**, 20.043 amostras, mínimo **6,94:1**, nas telas 829×927 e 390×844. Inclui título, Despertar, Tornar Marcado, texto auxiliar, legendas, nome e mensagens. Nenhuma placa de blur foi reintroduzida.

Evidências em `limpeza-v21-validation/`. A comparação de FPS usa páginas sequenciais, sem concorrência de outro navegador; capturas e regressões funcionais posteriores podem rodar em paralelo e não integram a amostra de desempenho.

As medidas de FPS são do renderizador por software da nuvem. Não medem a GTX 1660 do usuário nem equivalem a Brave em um aparelho físico. As verificações de contraste são amostras locais, com movimento reduzido e mãos desligadas, nos pontos de texto capturados; não certificam todas as condições de animação nem conformidade integral de acessibilidade.

## Preservação e homologação

Todas as 36 imagens/fontes nativas do ZIP V20 foram comparadas byte a byte e preservadas. O fundo, as cinco órbitas do feto, a fonte de conhecimento, os arquétipos, as tábuas e a folha mantêm seus arquivos originais. Módulos de qualidade, catálogo, regras, origens e mão/viagem protegidos conferidos por hash. Sem regeneração de imagens nesta revisão.

Órion Fichas: HEAD `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, árvore rastreada limpa. Nenhuma alteração em contas, dados reais, Worker/D1, migrações, produção, merge ou PR nova. Rascunho continua apenas local à aba; a experiência visual não concede benefícios mecânicos nem cria uma ficha remota.

**Implementado:** remoção das manchas/caixas, foco com linha única, círculo de sigilos ajustado e cache de âncoras. **Testado:** resultados e evidências locais descritos acima. **Homologação pendente:** aprovação visual do usuário e medição no Brave/GTX 1660. O ZIP é para upload manual; nenhum deploy foi executado.
