# V13 — Reflow, contraste e hierarquia visual

28/10/2026. Alterações implementadas e verificadas em navegador, a partir do relatório completo da V12 e suas evidências. Avaliação artística e homologação em telefone físico continuam pendentes.

## Aplicação do relatório

| Achado da V12 | Mudança / estado na V13 |
| --- | --- |
| F01: controles sobrepostos recebiam cliques errados | Formulário reorganizado em Grid, com áreas próprias para figuras, campos, ação e status. Legendas passaram a fazer parte do botão, e os planos das figuras usam âncoras próprias. Seta saiu do posicionamento fixo e tem uma coluna reservada. Reflow e rolagem interna em áreas curtas. Cinco regressões cobrem borda do botão, borda do campo e destinatário do clique. |
| F02: contraste baixo e textos minúsculos | Títulos e formulário com fundos de contraste estável; rótulo de nome e status em 12 px, subtítulo em 13–14 px e legenda auxiliar de seleção em 11 px. As mesmas medições locais por glifos ficaram acima de 12:1 nos textos auxiliares analisados. |
| F03: checagem estrutural antiga falhava | Asserção literal de fator 18 substituída por avaliação da resposta da câmera nos dois contextos, a 30/60/120 Hz, incluindo movimento reduzido. Comportamento do aplicativo não foi alterado para fazer o teste passar. `npm run check` aprovado. |
| Direção de arte / hierarquia | Mantidos fundo orgânico e figuras; sigilos um pouco menores e menos intensos, ainda dourados luminosos em cinco faixas. Contorno das almas e do feto ajustado na mesma linguagem. O vermelho conserva brilho 75% também ao virar cinza, reduzindo a competição do fundo na identidade. |
| F04: retomada e próxima etapa | Não alteradas nesta revisão visual. Continua um rascunho local; a etapa seguinte e retomada não foram implementadas nem disfarçadas. |
| F05: custo de entrada do Observatório | Não alterado nesta revisão. Não se anuncia otimização de transferência ou de GPU. |

O título da etapa de identidade agora é um heading real. O nome da etapa aparece no topo, há indicação textual junto à seta e o foco de teclado permanece visível. O campo de nome conserva o foco por linha inferior, sem introduzir um contorno retangular sobre a ilustração.

A mudança usa o mesmo renderer, câmera e animação de viagem. Não foram gerados novos assets ou acrescentados painéis de configuração ao fluxo. Os fundos de legibilidade têm propósito funcional e substituem o texto solto sobre áreas variáveis da membrana.

## Método e resultados reais

- Método reaplicado do review: inspeção geométrica, comparação de destinos de clique, medição de contraste sob os glifos e capturas reais do navegador. Para geometria, foram examinados 1440×900, 390×844, 844×390, 568×320, 320×568, 390×430 e 320×256. A primeira medição encontrou zero interseções entre os controles avaliados. As regressões finais exercitaram cinco desses cenários e o fluxo existente cobre os dois tamanhos restantes.
- `npm run check`: aprovado. 18 arquivos unitários: aprovados, zero falhas/skips. Bundle Vite final: aprovado com recursos fotográficos locais já preparados. Não se anuncia novo download externo do build completo como aprovado.
- Rodada de 26 cenários de navegador: 25 aprovados e uma falha `ERR_HTTP_RESPONSE_CODE_FAILURE` no `page.goto`, enquanto o diretório do preview era reconstruído. O trace identificou falha de navegação HTTP, antes da lógica do cenário. Com build estabilizado, os quatro cenários de carregamento/pulsação foram reexecutados e passaram. Não se apresenta a rodada inicial como 26/26.
- Os cinco testes novos de reflow passaram: 1440×900, 390×430, 568×320, 320×568 e 320×256. Nenhuma interseção dos retângulos de legendas/nome/checkbox/seta; clique na borda do textbox foca o campo sem gravar o rascunho; clique na borda da opção seleciona a opção correta; continuar grava o rascunho esperado. Rolagem interna é aceita como comportamento intencional, mantendo o contêiner raiz parado.
- Medição refinada Balanced, com movimento reduzido para estabilizar os fundos: em 1440×900, subtítulo passou de aproximadamente 3,52:1 para 12,47:1 e nome de 4,07:1 para 13,15:1. Em 390×844, os mesmos textos mediram aproximadamente 12,62:1 e 13,38:1. Foram examinados também título, opção sem gênero e status. Isso é amostragem local, não certificação WCAG completa.
- Pacote HTTP final: capturas reais da criação e identidade em 1440×900, e gravação em 390×844 com toque emulado. Conferidos saturação 30–100%, brilho 75%, sincronismo em dois ciclos, cinco camadas, escolha, nome e rascunho; sem erros JS/HTTP na verificação. Preferência por movimento reduzido, teclado, retorno e fonte real permanecem cobertos nos cenários automatizados.

Logs, capturas, medições de antes/depois e gravação em `visual-v13-validation/`. As capturas com `balanced` ou `1440-` são para avaliar arte; capturas geométricas usam Eco e não são medição da qualidade visual padrão.

## Preservação e limites

Cinco arquivos de fundo, saturação 30–100%, brilho vermelho 75%, expansão sincronizada até 2% e período de 4,8 s preservados. Alterada somente a apresentação dessa atmosfera na etapa cinza, conservando o escurecimento em vez de voltar a brilho pleno. Fonte de sigilos, feto e figuras preservados byte a byte. Não houve regeneração de aparência, alteração de regra, atribuição de origem humana aos assets ou promessa de qualidade AAA.

Os quatro módulos originais de seleção, viagem, véu e mesh das mãos continuam idênticos à origem. Órion Fichas permanece em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, com árvore rastreada limpa. Sem alterações no Órion principal, backend, dados remotos, merge, PR nova ou deploy de produção/Cloudflare. Entrega estática para upload manual.

Chrome headless/SwiftShader e janelas curtas simuladas não equivalem à homologação de teclado virtual, navegador móvel ou GPU em telefone físico. Não foram medidos FPS de hardware real. Persistência remota, recuperação do rascunho e próxima etapa continuam fora desta entrega visual; avaliação do acabamento e do grau de imersão depende do usuário.
