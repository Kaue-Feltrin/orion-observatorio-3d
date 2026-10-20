# Galáxia como céu distante durante a viagem

Correção de 20/10/2026 sobre `03e9f0c`, na branch `codex/maos-rig-mmv` / [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29). O usuário esclareceu que o giro denunciava a galáxia como uma fotografia plana por mudar sua perspectiva; pediu continuar especificamente essa correção.

A viagem passa a usar uma projeção angular da fotografia ESO. A projeção do instante da partida é preservada e o giro aplica um deslocamento uniforme das coordenadas da imagem. A galáxia mantém seu formato e tamanho aparente enquanto a câmera avança, inclusive durante a variação de FOV. As nuvens próximas e os rastros continuam em profundidade real.

- Repouso usa o caminho original do material e a mesma posição/escala da fotografia.
- A troca de projeção preserva os raios/UVs da vista inicial, evitando salto no começo da viagem.
- A mesma malha/material/textura é reutilizada como superfície que cobre a câmera. Uma variante do shader é preparada no repouso; sem textura, superfície, passagem de renderização ou dependência adicionais.
- O avanço da câmera deixa de aproximar a galáxia. Não há ampliação artificial do JPEG/recortes, aumento do far clipping ou limitação do giro para esconder bordas do antigo plano.
- Fora do enquadramento fotografado, o shader revela céu escuro com borda suave, sem repetir ou esticar os pixels das bordas. A fotografia e os créditos não foram alterados.
- Recortes fotográficos distantes cedem ao céu antes do giro; nuvens próximas mantêm posições, escalas e profundidades de mundo e desaparecem ao serem atravessadas. Nenhuma camada do repouso é removida.
- Direção/tempos da viagem, mãos, seleção, uma a três estrelas, identidades, retorno e véu entre páginas preservados. Resize durante a viagem não recalcula os recortes a partir da superfície já ligada à câmera.

## Verificação visual

[Vídeo antes — revisão 03e9f0c](../flight-continuity/after.mp4) · [Vídeo corrigido](after.mp4) · [Dados da gravação](recordings.json)

A gravação anterior é reutilizada diretamente da etapa precedente, sem duplicar o arquivo. Ambos selecionam Estrela III em 1280×720/Eco+ com as mesmas mãos, relógio e entradas reais; página inteira via CDP e navegação efetiva, sem interceptação. Hover/respiração não têm relógio sincronizado. O vídeo novo não contém congelamento ou manipulação do cenário. Sem erros JS/shader; evidência local Chromium/SwiftShader, sem pressupor aceite artístico ou desempenho no dispositivo do usuário.

[Repouso](after-3-stars.webp) · [Hover](after-hover.webp) · [Chegada](after-arrival.webp)

Um teste separado isola o céu e pausa apenas o pan para comparar pixels, enquanto altera giro, posição e FOV da câmera. Diferença média observada de **0,000396/255 por canal**, sem canais mudando mais de 2 níveis: sem deformação, aproximação ou zoom do fundo. Liberando o pan, a diferença média sobe para **31,944/255**, confirmando deslocamento real. O teste tem tolerâncias fixas e também detecta erro de shader. Essa manipulação existe somente no teste isolado, não no vídeo/fluxo normal.

As unidades verificam correspondência da projeção inicial, cobertura de tela em quatro aspectos, pan reversível, ausência de aproximação e reutilização dos mesmos recursos. As antigas asserções de escala/cobertura do plano de mundo foram substituídas por essas verificações e pela comparação de pixels do shader; o fundo deixou de ser um plano de mundo.

**Check/build, quatro suítes unitárias e 26 casos distintos de navegador aprovados em rodadas**, sem retries automáticos. Dois problemas de sincronização dos testes foram corrigidos: contagem mínima de frames substituída por cobertura de fases e clique aguardando primeira pintura; limites de câmera/projeção e prazo de 9 s após clicar preservados. Resultados por rodada e arquivos alterados: [validation.json](validation.json). Contexto cumulativo atualizado na raiz. Main e branch de referência preservadas; criação de personagem e nova adaptação mobile não iniciadas. Próxima ação do usuário: testar o giro para as duas estrelas laterais na nova prévia. Sem instalação, upload ou credencial necessária.
