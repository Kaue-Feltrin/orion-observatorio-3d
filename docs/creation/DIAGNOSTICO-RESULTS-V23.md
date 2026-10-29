# V23 — Amostras de FPS associadas ao perfil correto

28/10/2026 (São Paulo). Base V22 `bc31f2e4564b430d6836721a9770c6db57601818`, Observatório independente, branch `feat/nascimento-marcado`.

## Analisado e reproduzido

O usuário enviou três diagnósticos: automático/Eco a 34 FPS, High a 6 FPS e Eco manual a 6 FPS; os dois Eco tinham canvas 1004×497. O nome do renderizador era apenas Brave. Esses dados motivaram conferir a amostragem antes de concluir que o Eco continuava lento após trocar de perfil. Os relatórios não identificavam revisão/cena nem a idade da amostra, portanto não constituem comparação controlada entre perfis.

Falha reproduzida: `createFrameMonitor.reset()` zerava os acumuladores privados, mas deixava publicados `state.averageMs` e `state.samples` da janela anterior. O diagnóstico montava a linha de modo/canvas a partir do estado atual e a linha de FPS a partir dessa amostra antiga. A troca manual já chamava reset, mas o resultado publicado continuava antigo; as reduções automáticas também não invalidavam a amostra após redimensionar. Além disso, o texto do diagnóstico aberto só era atualizado por ações do usuário, mantendo uma captura estática.

O novo teste foi executado antes do conserto e falhou exatamente em `100 !== null`: a média da janela anterior ainda estava publicada após reset. Resultado preservado em `reproduced.log`. Isso demonstra o erro do código, não que todo travamento percebido no PC fosse causado por ele. Se o Eco permanecesse efetivamente lento depois de uma janela nova, seria uma observação diferente.

## Implementado

- Reset invalida média, contagem, horário e duração publicados. Troca manual, adaptação automática, resize e retomada da aba aguardam uma janela nova em vez de reutilizar o número anterior. O monitor é criado antes do resize inicial; o próprio resize invalida a amostra.
- Diagnóstico exibe **coletando nova amostra**, depois mostra contagem de quadros, duração da janela concluída e sua idade. Identifica protocolo V23 e cena/etapa.
- Texto atualiza a cada segundo somente com o diagnóstico expandido no diálogo aberto. Para ao fechar/recolher e preserva a seleção manual de texto. Copiar consulta os dados atuais. Nada é enviado pela rede.
- O nome genérico Brave é explicitamente apresentado como insuficiente para identificar a GPU física. Não se tenta contornar proteção de privacidade nem deduzir aceleração pela string.

O High informado usa aproximadamente 3,66 vezes os pixels do Eco informado e habilita efeitos adicionais conforme a cena. Isso explica uma diferença de carga, mas os FPS enviados precisam de amostras corretamente associadas ao perfil. Não se conclui uso de software, falha na GTX ou defeito permanente da troca de qualidade só por esses três textos. Foram solicitadas as linhas Compositing, WebGL e WebGL2 de brave://gpu para verificar aceleração no PC.

## Testado e preservado

`npm run check`, **23 arquivos unitários**, **seis cenários Chrome** de preferência, toque móvel, viagem e diagnóstico aprovados. Depois de incluir revisão/cena, os dois cenários de diagnóstico foram repetidos e aprovados; são reexecuções, não oito cenários distintos. Os testes aguardam uma amostra válida, trocam High/Eco e verificam imediatamente o estado pendente, a atualização automática, a identificação genérica, a cópia/seleção manual, a invalidação por resize e a parada das atualizações ao fechar. Não usam uma meta de FPS da GPU para aprovar a interface.

Bundle `npx vite build` aprovado. O download separado ESO do comando completo não foi reexecutado. Os sete assets ESO e demais imagens existentes foram preservados por hash. Pacote estático servido na porta 4304 conferido em 829×927 e 320×568: amostras novas, troca de perfil, cópia, fechamento e ausência de overflow horizontal, erros JS, respostas HTTP de erro ou escrita remota. Mobile simulado; não é Brave/aparelho físico.

Os 36 arquivos nativos de imagens/fontes e 50 módulos de raiz fora das três alterações de runtime continuam iguais à V22. Shaders e ganhos locais da V22, resolução/perfis, efeitos, mãos, câmera, viagem, origens e classes preservados. Apenas a medição e sua interface foram corrigidas; **não há nova alegação de aumento de FPS nesta revisão**.

Órion Fichas permanece em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, árvore rastreada limpa. Sem alteração de dados/contas, regras, D1, migrações, recursos de produção, merge ou PR nova. ZIP manual; nenhuma ação de deploy executada.

**Implementado:** correção do contador e atualização do diagnóstico. **Testado:** resultados locais acima, reprodução anterior e pacote HTTP. **Homologação pendente:** renderer efetivo e desempenho no Brave/GTX 1660. A causa completa da lentidão no PC permanece em análise.
