# Órion Fichas — estudo de interface AAA, revisão 01

Data: 26/10/2026. Escopo: arquivos visuais independentes; sem integração, publicação ou alteração do aplicativo.

## O que esta pesquisa demonstra

É uma análise comparativa de padrões conhecidos de interfaces de jogos, aplicada aos problemas observados nas capturas locais da PR179. Não é uma auditoria atualizada de versões específicas desses jogos: não foi possível consultar novas capturas oficiais nesta sessão. As associações abaixo são referências de direção, não alegações de conformidade nem instruções para copiar telas ou ativos.

As fontes normativas W3C foram efetivamente baixadas de seu repositório oficial; cópias consultadas estão em `referencias/`. Os guias Xbox foram tentados, mas a rede respondeu 403. Eles não foram considerados fontes lidas.

## Referências de jogos e aplicação

| Referência conhecida | Padrão útil para estudar | Aplicação ao Órion | Limite |
|---|---|---|---|
| Baldur’s Gate 3 | Ficha como conjunto de escolhas, atributos e detalhes consultáveis | Selecionar uma origem e consultar seus detalhes ao lado | Sem reproduzir ornamentação medieval ou concluir que sua densidade funciona no celular |
| Destiny 2 | Prioridade visual de equipamento e atributos; detalhes contextuais | Inventário com item selecionado e informação concentrada | Não depender de hover, raridade por cor ou espaços vazios de uma interface para controle |
| The Division 2 | Linguagem de equipamento tático e leitura de estado | Recursos com rótulos explícitos; separar estado atual e próximo passo | Sem excesso de laranja, microtexto ou indicadores decorativos |
| Control | Identidade editorial, contraste e sensação de documento institucional | Dossiê paranormal: títulos editoriais e navegação sóbria | Sem copiar logotipos, nomes de órgãos, layouts ou ativos do jogo |

Direção original proposta: **arquivo paranormal tático**. Azul quase preto, superfícies de papel escuro, marfim no texto, dourado nas escolhas e verde em confirmação. Serifa apenas para títulos; sans-serif para leitura e controles. Formas geométricas originais, sem fotografias ou assets externos.

## Problemas observados no Órion atual

1. Criação: título e pergunta de origem repetidos; resumo, avisos e catálogo disputam atenção; duas ações de continuar.
2. Oficina: cabeçalho extenso e duas camadas de navegação tornam a tarefa principal menos evidente.
3. Progressão: instruções técnicas e projeções misturadas à escolha que o jogador precisa fazer.
4. Jogo: recursos são importantes, mas inventário e conferências acumulam detalhes que precisam ser revelados progressivamente.

## Decisões representadas no HTML

- Criação: uma etapa, uma pergunta principal, busca e catálogo, detalhes da seleção e uma única ação de avançar. Nome e estágio ficam no resumo.
- Oficina: navegação por tarefa; detalhes de identidade editáveis; mensagens curtas. Sem fingir persistência no banco.
- Evolução: uma escolha por vez e resumo do próximo passo. Valores e alternativas são fictícios e não especificam regras.
- Jogo: recursos no topo, navegação persistente e detalhes do item selecionado. Botões de recurso usam estado em memória.
- Mobile: leitura em uma coluna, áreas de toque generosas, nenhuma ação exclusiva de hover e sem rolagem horizontal da página.
- A interface identifica o estudo visual e seus dados fictícios. Nenhum texto sugere aprovação de regras, verificação de servidor ou uso de dados reais.

## Critérios de acessibilidade

Fontes consultadas em 26/10/2026:

- [W3C — Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), conteúdo consultado via [repositório oficial](https://raw.githubusercontent.com/w3c/wcag/main/understanding/20/contrast-minimum.html): alvo de 4,5:1 para texto comum e 3:1 para texto grande.
- [W3C — Understanding Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [cópia oficial consultada](https://raw.githubusercontent.com/w3c/wcag/main/understanding/20/keyboard.html): interações disponíveis por teclado, sem ações dependentes exclusivamente de apontador.
- [W3C — Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [cópia oficial consultada](https://raw.githubusercontent.com/w3c/wcag/main/understanding/22/target-size-minimum.html): mínimo WCAG de 24 CSS px, com exceções. O estudo adota 44 px para controles principais como decisão de projeto; isso não é a medida mínima exigida pelo critério citado.

Foco visível, identificação textual de estado, regiões semânticas e respeito a movimento reduzido são critérios adicionais do projeto. Eles não constituem, sozinhos, certificação de acessibilidade.

## Fora do escopo

Regras do jogo, concessões de atributos, aprovação de origens, autenticação, backend, persistência de fichas reais, migrações, produção, merge ou nova PR. Não se pretende substituir os componentes existentes antes da aprovação visual. Dados mostrados no HTML são fictícios e as interações apenas demonstram comportamento de interface.

## Como avaliar

Abrir `estudo-aaa.html` diretamente no navegador. Usar as quatro opções superiores para alternar criação, Oficina, evolução e jogo. Experimentar busca/seleção de origem, teclado, navegação das etapas, edição fictícia e controles de recurso. Comparar estrutura, legibilidade e hierarquia com as capturas da PR179; o HTML representa uma proposta, não a interface atual.

Uma rodada de navegador confirma somente os cenários listados em VALIDACAO.md. A homologação funcional continua sendo tarefa do aplicativo real.
