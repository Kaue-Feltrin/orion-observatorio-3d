# V26 — Lápis, escrita e orientação do equipamento

29/10/2026. Cópia visual independente, branch `feat/nascimento-marcado`, base V25 `0b60ab997914e68ae7f621546494337aa578d830`. Fichas protegido em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, sem alterações.

## Analisado e implementado

O instrumento anterior tinha altura fixa de 130 px em qualquer tela e seguia uma linha entre letras que apareciam inteiras por opacidade. O lápis agora mede **35% da largura da folha**, com corpo fino, madeira e grafite vetoriais. A ponta percorre trajetórias centrais das letras e a tinta aparece sob esse mesmo percurso. Há levantadas entre traços e deslocamentos sem riscar. Campo e ponta usam o mesmo progresso; rolar a folha corrige a posição pela diferença da rolagem, sem medir layout a cada quadro.

A escrita usa contornos derivados da fonte manual Caveat, sob SIL OFL 1.1. A licença acompanha o atlas e o ZIP em `licenses/Caveat-OFL.txt`. Um gerador offline preparou **156 glifos** com números, pontuação e acentos latinos comuns; o navegador não executa processamento de imagem ou gera letras por IA. Outros caracteres são conservados e recebem revelação progressiva de fallback. Os valores completos continuam no registro, na consulta e no JSON. A apresentação mantém foto, preenchimento, carimbo, conclusão antecipada e movimento reduzido. Redimensionar conclui a apresentação com segurança.

A orientação de equipamento deixa de depender de detalhes recolhidos:

- As categorias I–IV mostram vagas usadas/permitidas e indicação textual de excesso ou indisponibilidade.
- A mochila lista os itens escolhidos, nome/ícone, categoria efetiva e motivo junto de cada conflito. Vermelho é acompanhado por texto e símbolo.
- **Retirar item** corrige a escolha explicitamente; quantidade também pode ser reduzida no catálogo. A patente não muda automaticamente.
- A busca avisa antes da adição quando uma categoria está indisponível ou sua cota foi atingida. Um filtro opcional mostra adições que não ultrapassam os limites atuais. A mochila com erros continua visível mesmo com busca/filtro.
- Continuar e Criar personagem aguardam erros bloqueantes reais do equipamento. A conferência mostra uma chamada para corrigir a mochila. Inventário vazio continua permitido; sobrecarga tolerada continua distinta de exceder o máximo carregável.

Exemplo: Fuzil de assalto, categoria II, com patente Recruta aparece identificado na mochila com a informação de que essa categoria não está disponível. Três pistolas, com cota de duas unidades de categoria I, mostram o excesso de uma unidade. Reduzir a quantidade ou retirar o item remove o conflito. Um tipo revisado de Ferramenta Favorita do Engenheiro continua usando a categoria efetiva do revisor original.

`reviewEquipment` e os 30 arquivos de regras/catálogos não foram alterados. A nova camada explica o resultado e prepara consultas de adição, sem conceder itens, descontos ou patentes. Regras pendentes continuam pendentes. O estado final segue sendo personagem criado **no navegador**, sem autenticação, sincronização de conta ou ativação no Worker. Outros dados, registros e progresso são preservados.

## Testado

Ambiente: Node 24.19.0, Playwright 1.56.1 e binário Google Chrome 156.0.8078.47 com SwiftShader. Dispositivos móveis são emulados, não aparelhos físicos.

- `npm run check`, **26 arquivos unitários** e `npx vite build` aprovados. Assets ESO cacheados; o download externo do comando completo não foi reexecutado. O aviso já existente sobre o tamanho do chunk principal permanece no log.
- **38 cenários distintos de navegador aprovados**, sem retries automáticos: oito novos de equipamento/escrita e 30 regressões. Os logs de rodadas anteriores não são somados como cenários novos; o resumo enumera os 38 casos. Depois da revisão das capturas, os textos de quantidade/categoria foram naturalizados; os cinco cenários de equipamento afetados foram repetidos e aprovados no build final.
- Em 1440×1000, 390×844 e 320×568, conflito de categoria permanece identificado mesmo com filtro/busca, retirada corrige sem mudar patente e Continuar fica bloqueado enquanto houver erro. Teste de quantidade confere três pistolas com cota de duas; unidade confere a redução revisada do Engenheiro.
- Em desktop e mobile, teste compara a ponta com o ponto corrente do traço SVG: erro inferior a 4 px e proporção de 35% da folha. Nome acentuado, escrita normal, apresentação reduzida, consulta e persistência verificados.
- Regressões percorrem decisões completas das três classes, edição/retomada, Perito, rituais, orçamento, idade, comparação de origens, ícones/perícias, quota de armazenamento recusada, recarga durante escrita, JSON, carregamento sem identidade fictícia e sete personagens nas estrelas. Mobile também cobre 568×320.

Na primeira rodada, três falhas eram expectativas dos novos testes: busca por “pistola” encontrava cinco botões e valores CSS de stroke-dashoffset vinham com unidade `px`. Os seletores passaram a nome exato e a leitura a parseFloat. Na rodada seguinte foi reproduzido um problema real: limitar o avanço a 48 ms por quadro tornava a escrita excessivamente longa no renderizador por software. A ponta já seguia o traço, mas não concluía no prazo. A escrita passou a usar o tempo real compartilhado com a tinta, mantendo o controlador de rolagem anterior. Os oito casos e as 30 regressões passaram após esse ajuste. Logs intermediários preservam esses resultados.

Os 1.319 testes do Fichas são evidência da rodada V24, não foram reexecutados nesta rodada. Testes locais não homologam efeitos canônicos pendentes nem desempenho físico do Brave/GTX 1660.

Capturas reais em 1920×951 e 390×844 usam Íris Moreira fictícia, com decisões preparadas para demonstrar a correção do inventário e o recrutamento. Foram conferidas a legibilidade da escrita e a posição do lápis: folha de 820 px e lápis de 287 px. A medição registrou **zero draws WebGL em 500 ms da apresentação** nos dois formatos, sem overflow horizontal, erro JS/HTTP ou requisição de escrita remota.

O ZIP foi servido por HTTP e exercitado em 1440×1000 e 320×568: corrigir categoria, criar, exportar JSON, recarregar e encontrar a estrela aprovados. Zero draws WebGL em 500 ms de recrutamento nos dois formatos; sem erros JS/HTTP ou escrita remota. Os **56 assets nativos rastreados** e os **40 recursos visuais/modelos/fontes do ZIP** permanecem idênticos à V25. A nova licença foi conferida byte a byte.

## Pesquisa, custo e entrega

[Pesquisa e método](escrita-v26-validation/PESQUISA-E-METODO.md) compara Vivus, Signature Pad e o resumo de erros GOV.UK e registra a procedência da Caveat. Conceitos foram adaptados sem instalar/copiar essas bibliotecas. Não há dependência nova em npm. Preparar o atlas novamente requer FontTools/Pillow/NumPy; o app já inclui o resultado e não precisa deles para build ou uso.

O chunk do recrutamento é carregado somente ao iniciar essa etapa; o build mediu aproximadamente 475 kB de JavaScript, 120 kB com gzip, nessa etapa. O chunk inicial e os recursos 3D foram preservados. A medição exata fica no log. Não foi reduzida a qualidade das imagens, modelos, mãos, fontes existentes ou viagens. A cena 3D continua suspensa sob a folha. A memória/VRAM e o FPS físico da GTX 1660 não foram medidos; SwiftShader desta nuvem não é um teste desse computador.

A entrega é `ORION-SITE-V26.zip`, com `index.html` na raiz para upload manual. CRC, SHA, imagens e vídeo reais acompanham a documentação. **Homologação pendente:** avaliação visual do usuário e aparelho físico/Brave. Sem deploy, produção, migração remota, merge ou nova PR.
