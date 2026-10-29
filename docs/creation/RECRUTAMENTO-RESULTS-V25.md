# V25 — Escolhas mais claras e recrutamento concluído

29/10/2026, São Paulo. Observatório independente, branch `feat/nascimento-marcado`. Base `1aa438782f030861bcc1d21390fca10d2550e65f` (V24). Órion Fichas protegido: `f80bbaacc8acb4ad0158d43fb923e2f421e58528`.

## Analisado e implementado

A comparação exigia abrir detalhes, separar duas origens e encontrar o botão no fim da página. Agora há **Comparar em cada linha**, duas vagas com nomes/ícones e retirada individual, uma ação visível e um quadro de diferenças alinhadas. Passado, competências explicadas, habilidade e fonte aparecem na mesma ordem. A origem pode ser escolhida diretamente nesse quadro. Comparar não confirma uma origem sozinho e não troca filtros ou decisões já tomadas.

A rolagem automática usa um controlador único com aceleração/desaceleração, cancelamento por entrada do usuário e movimento reduzido. O relógio limita o avanço por quadro: atrasos de renderização não pulam a transição inteira. Mudanças de capítulo aguardam a rolagem antes de liberar o foco. Rodinha, toque e teclado têm prioridade sobre o movimento automático.

Idade informa estágio, quantidade exigida, contador, escolhas marcadas e efeitos de referência. Adulto usa seleção única: outra opção substitui a anterior. Maduro/Idoso usam caixas com limite de duas/três escolhas, retirada explícita e filtros Corpo/Mente/Relações. O foco retorna ao controle escolhido. As decisões etárias obrigatórias passam pela checagem de intenção existente; Mestre na Área pode ser concluído após treinar as perícias, sem prender o fluxo antes dessa etapa.

As **28 perícias** têm finalidade e exemplo curto. A busca considera essas explicações. São textos editoriais para orientar escolhas, sem mudar testes, CDs, bônus ou exigências. Os **219 itens** têm pictogramas vetoriais; 58 tipos de desenho são usados, compartilhados por objetos semelhantes. Há distinção entre pistola/fuzil, lanterna, medicamento, mochila, proteção e outros objetos. Ícones também acompanham o equipamento na conferência e na ficha criada. Não foram geradas imagens novas por IA.

## Criar personagem tem resultado persistente

A conferência termina em **Criar personagem**. A ação valida escolhas obrigatórias, verifica a escrita de um registro individual no navegador e apresenta o recrutamento:

1. A nova folha chega à mesa com campos em branco.
2. Uma foto 3×4 de silhueta preta é colocada e presa com fitas.
3. A caneta percorre os campos e revela nome, idade, representação, origem, classe e atributos.
4. O carimbo **RECRUTADO** encerra a apresentação.
5. O jogador abre a ficha, baixa seu JSON ou volta ao Observatório.

A animação pode ser concluída antecipadamente. Movimento reduzido apresenta o resultado pronto. O registro é verificado **antes** da celebração: quota recusada não produz carimbo de sucesso. Recarregar durante a animação abre a ficha existente. Repetir a mesma criação não duplica nem sobrescreve silenciosamente outro registro.

A ficha mostra dados pessoais, atributos, recursos de referência, vivência/desvantagens, Perito quando aplicável, perícias, rituais, equipamento, narrativa e pendências. Personagens concluídos reaparecem como estrelas. O arquivo usa páginas de até três estrelas e mantém os demais registros acessíveis; foi testado com sete personagens. A primeira estrela recebe seus próprios metadados e a chegada local não mostra a identidade Nox durante o carregamento.

## Fronteira dos dados e das regras

Este é um **cadastro concluído na cópia visual, salvo por site e navegador**. Não cria conta online, não ativa ficha oficial e não escreve no D1. Cada personagem usa sua própria chave `orion-character-v1:`. O progresso incompleto fica separado; dados de outros personagens e chaves alheias são preservados. JSON pode ser baixado; importação pela interface ainda não foi implementada. Outro domínio/aparelho não recebe automaticamente esses registros.

O formato do registro concluído é `orion-local-character`, com estado `created` e personagem `created-local`. A flag `officiallyActivated` continua falsa. Não é apenas uma troca de texto do botão: existem registro verificável, consulta após recarga, exportação e ligação com as estrelas.

Os 30 arquivos puros de regras/catálogos permanecem exatos. Há 66 origens exploráveis, 24 com treinamentos mecanicamente verificados nessa referência. Efeitos etários e benefícios ainda não homologados permanecem como pendências e não viram concessões canônicas por causa do carimbo. O registro local pode conservar essas referências após completar as escolhas de entrada. A validação oficial do Worker permanece intacta e fora desta operação.

## Testado e evidências

Ambiente: Node 24.19.0, SQLite embutido, Playwright 1.56.1 e binário Google Chrome **156.0.8078.47** com SwiftShader. Alguns testes usam o user-agent do dispositivo emulado do Playwright; esse texto não identifica a versão física do computador do usuário.

- `npm run check`, **25 arquivos unitários** e `npx vite build` aprovados. O build isolado usa os assets ESO cacheados; o download externo do comando completo não foi reexecutado. O aviso de tamanho do chunk principal permanece registrado.
- **59 cenários distintos de navegador aprovados**, sem retries automáticos. Reexecuções após ajustes estão nos logs e não são somadas como cenários novos. `test-summary.json` consolida o resultado mais recente por identificador.
- Três classes percorrem as decisões completas, voltam a atributos/perícias, conservam narrativa com marcação sem executá-la, acusam orçamento inválido, retomam progresso e terminam em um personagem persistente com JSON real.
- Casos novos verificam foto/escrita/carimbo na ordem, caneta visível, conclusão antecipada, recarga durante a escrita, quota negada sem falso sucesso, escolhas etárias e foco, explicações/busca, ícones, escolha dentro da comparação, progresso intermediário da rolagem e interrupção.
- Desktop e mobile simulado em 390×844, 320×568 e 568×320; comparação, idade, itens e recrutamento sem overflow horizontal. Testados também carregamento local sem Nox e arquivo com sete personagens.
- Capturas e vídeo reais usam Astra fictícia de teste. A captura inicia com escolhas preparadas, realiza comparação, alteração de idade, seleção de item, criação e consulta. Mostra a cópia local desta nuvem, sem afirmar desempenho no Brave/GTX 1660.

O pacote estático foi servido por HTTP e exercitado em 1440×1000 e 320×568: registro persistente, JSON, recarga e estrela registrada aprovados. Foram medidos **zero draws WebGL durante 500 ms do recrutamento** em cada formato. Não houve erro JavaScript, resposta HTTP com falha ou requisição de escrita remota nos percursos capturados. A folha completa também foi fotografada em 1440×1400.

Falhas reproduzidas durante a implementação: uso da propriedade HTML `hidden` numa caneta SVG, que mantinha o atributo presente; primeiro resumo local com metadados Nox por não renderizar a entrada inicial; plural incorreto no contador; movimento automático que pulava seu tempo útil após quadros atrasados. Foram corrigidas com testes. Uma corrida do diagnóstico também foi reproduzida: uma atualização enfileirada podia alterar o texto após fechar. O callback agora verifica se o diálogo e a seção continuam abertos. O teste de percurso normal da roleta ganhou prazo de 60 s nesta máquina de software, mantendo as verificações funcionais; a execução aprovada está no log. Não é uma alegação de latência no PC do usuário.

Nenhuma resolução, imagem, fonte, pose, rig ou viagem foi reduzida nesta rodada. **56 assets nativos rastreados** e os **40 recursos visuais/modelos/fontes distribuídos no ZIP** continuam idênticos à V24. Ícones e objetos novos são vetores de interface. A apresentação acontece no papel com WebGL suspenso; não adiciona uma cena 3D contínua ou um desfoque global.

## Entrega e limites

`ORION-SITE-V25.zip` é o site estático para upload manual, com `index.html` na raiz. O relatório e as instruções acompanham o arquivo. CRC e SHA-256 identificam o pacote; o método de reprodução e as evidências ficam em `recrutamento-v25-validation/`.

**Implementado:** escolhas, registro local e sequência de recrutamento. **Testado:** resultados locais acima e validação do pacote registrada nos arquivos de evidência. **Homologação pendente:** aprovação artística do usuário, aparelhos físicos/Brave com GTX 1660 e futura integração autenticada com regras completas.

O `start_skill` do rascunho de ambiente foi atualizado para descrever o registro local e preservar dados. Scripts/rede/secrets anteriores foram mantidos. Salvar esse rascunho não publica o ambiente nem comprova restauração em outra tarefa.

Órion Fichas segue em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, árvore rastreada limpa. Sem alteração no projeto principal, deploy executado, migração remota, produção, merge ou nova PR. A distribuição continua na branch visual previamente autorizada.
