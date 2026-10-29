# V24 — Continuidade visual e decisões da criação

29/10/2026, São Paulo. Base Observatório `b528d94db72c2548352ed38a0a1aca223141f953`, branch `feat/nascimento-marcado`. Pedido adicional: depois da classe, continuar os atributos, perícias, equipamento, história e demais decisões da criação. O destino não é uma página de revisão prematura.

## Método e limites

1. Preservar a referência Órion Fichas em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, sem editar sua árvore rastreada. Consultar os módulos puros de regras e usar uma cópia exata com proveniência SHA-256; nenhuma cópia de Worker, banco, credencial ou usuário.
2. Usar os contratos existentes para atributos, idade, treinamentos, rituais e inventário. Manter bloqueios de origens/idade ainda incompletos. A saída é um rascunho local, sem ativação autenticada ou concessão numa conta.
3. Separar carregamento, apresentação e interação. A primeira visita mostra introdução curta pulável; movimento reduzido a omite. Nas mudanças de capítulo, conteúdo fica temporariamente inerte, foco só retorna ao fim e as escolhas não desaparecem.
4. Reusar a linguagem dos sigilos: brilho dourado no vínculo, vestígios na névoa da identidade e inscrição breve durante a chegada à mesa. Da origem em diante, manter a mesma madeira, luz e papel. Movimentos com duração, direção e assentamento coerentes substituem cortes bruscos.
5. Fazer o halo no atlas existente, empacotando núcleo e dois níveis de desfoque em canais diferentes, amostrados juntos. A atmosfera usa 48 instâncias num único lote, compartilha textura e não aciona bloom global. As mãos mantêm imagens, rig e poses; apenas a opacidade espacial cresce perto das bordas.
6. Testar regras e navegação com entradas válidas/inválidas, mudanças retroativas, recarga, download, quota negada e tamanhos móveis. Inspecionar capturas reais e registrar contagens de desenho/pixels. Chrome em SwiftShader é validação local, não teste da GTX 1660 do usuário.

## Conexão entre telas

A diferença percebida não depende apenas da resolução. O Observatório estabelece profundidade, luz volumétrica e movimento contínuo; as escolhas tendem a perder essa relação quando viram painéis independentes. Nesta rodada a solução é continuidade de luz, símbolos, direção e superfície: chegada luminosa → vínculo dourado → resquícios na névoa → mesa materializando → capítulos da mesma ficha.

Próximos refinamentos visuais possíveis, após esta entrega: uma direção de luz idêntica para mãos e cena, profundidade mais consistente nas silhuetas e som contextual opcional. Esses são propostas, não recursos apresentados como implementados. Não há áudio novo nem reconstrução dos modelos nesta rodada.

## Aceleração gráfica

As linhas `brave://gpu` enviadas primeiro indicavam software; depois passaram a informar aceleração por hardware e o usuário confirmou melhora. Essa evidência resolve a causa observada naquele computador. O site só pode reconhecer nomes de renderizadores que o navegador exponha. Nome genérico Brave e FPS baixo não comprovam aceleração desativada. Orientação deve explicar essa incerteza, oferecer endereços para copiar e nunca prometer ativar configurações do navegador automaticamente.
