# V28 — identidade da ficha e sombras por classe

06/11/2026. Observatório independente, branch `feat/nascimento-marcado`, base V27 `7c58b41fe756bb1a50cf592fb824b67707cda247`. Fichas protegido em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, intacto.

## Analisado e implementado

O usuário considerou a V27 vazia e genérica: grade, linhas e contornos não sustentavam a identidade do Observatório. A nova composição usa o céu fotográfico já existente, véus de leitura, halo luminoso, inscrição dourada, constelação estilizada e partículas discretas em torno da figura. Recursos, atributos, navegação, nome e emblema da classe receberam materialidade e luz. Os textos continuam em áreas escuras de leitura; nas abas de consulta o céu fica mais discreto.

A representação padrão agora acompanha a classe:

- **Combatente:** postura firme e arma baixa.
- **Especialista:** lanterna e bolsa de investigação.
- **Ocultista:** gesto de ritual.

São as mesmas sombras V20 usadas na escolha da classe. Nenhum pixel dos PNGs foi editado: a ficha pinta somente o alpha como silhueta escura, preservando vazios e ocultando cores internas. A procedência histórica image_gen continua documentada; não se atribui autoria manual ou ausência de geração por IA aos PNGs existentes. Não foram geradas novas imagens nesta rodada. Emblemas e inscrição são elementos vetoriais de interface escritos no código, sem copiar marcas ou assets de jogos.

Imagem própria tem prioridade e mantém seus pixels/cores. Remover retorna à sombra da classe daquele personagem; recarregar conserva a escolha. Emblema e tons por classe são apresentação, sem representar afinidade paranormal, equipamento recebido ou concessão de poder. Nome, nível, NEX, recursos, atributos e inventário continuam vindo do registro local.

Os sigilos usam a fonte fornecida pelo usuário. A inscrição só fica visível quando a fonte confirma carregamento, evitando letras latinas antes dos símbolos. O círculo tem rotação CSS lenta e partículas por transform/opacity; movimento reduzido fica estático. Paralaxe de baixa amplitude responde a pointermove, agrupada em rAF, sem polling de geometria ou render loop Three.js. Os controles não se deslocam com o cenário. Não se anima blur ou saturação da foto.

A fotografia ESO/S. Brunier original é reutilizada, com crédito também na ficha. Ela tem cerca de 3,9 MB quando não está em cache; as imagens de classe e a fonte são assets adicionais já usados no aplicativo. Não se afirma custo de rede zero, ganho de FPS, RAM/VRAM ou desempenho de GPU física. Capturas mostram zero canvases na ficha; isso não significa ausência de custo de composição CSS/SVG.

## Testado

Node 24.19.0, Playwright 1.56.1 e binário Chrome 156.0.8078.47/SwiftShader. Check, **28 arquivos unitários** e build Vite com assets ESO cacheados aprovados. O download externo do comando completo não foi repetido; o aviso existente de chunk principal permanece no log.

**26 cenários distintos de navegador aprovados**, sem retries automáticos: 14 de status, sete novos de classe/inscrição/movimento, três percursos completos de criação e dois de diagnóstico. A primeira rodada de status teve 20 passes e uma expectativa de paralaxe que disputava o reset legítimo ao trocar a preferência de movimento. O teste foi ajustado para verificar o modo normal numa nova entrada; a rodada final dos 21 passou. Repetições não são somadas como cenários novos.

Cobertura inclui cada sombra correta, fonte atrasada sem flash latino e com recursos utilizáveis, movimento reduzido, limite de paralaxe sem deslocar controles, imagem própria/reload/remoção para as três classes, persistência e isolamento entre personagens, JSON, consulta em papel, abas/busca/teclado, máximos ausentes sem números fictícios, quota recusada e criação nas três classes. O diagnóstico identifica V28. Mobile simulado cobre 390×844, 320×568 e 568×320; desktop inclui 1920×951 e 1440×1000.

A inspeção visual reproduziu diferenças de proporção dos PNGs: um contêiner Grid deixava a altura intrínseca ultrapassar o enquadramento. O corpo foi preso ao quadro com dimensionamento explícito e contain. Também se evitou reatribuir a mesma imagem padrão durante a leitura do IndexedDB, e o tratamento por alpha corrigiu cores internas expostas no PNG de Especialista. As imagens próprias continuam com cor e tamanho originais. Capturas e vídeo finais usam personagens fictícios em páginas reais, sem compor quadros para simular a funcionalidade.

Os 1.319 testes do Fichas são evidência V24, não foram reexecutados nesta rodada. Aparelhos físicos e aprovação artística continuam pendentes.

O ZIP servido por HTTP foi exercitado em 1440×1000 e 320×568: criação, correção de categoria, sombra de Combatente, sigilos nativos carregados, recursos/reload/JSON, consulta em papel e retorno à estrela aprovados. Sem erros JS/HTTP ou escrita remota. Capturas das três classes em 1920×951, 390×844 e 320×568 registram zero canvases e ausência de overflow horizontal. Os **56 assets rastreados anteriores** e os **41 recursos visuais/modelos/fontes do ZIP V27** permanecem byte a byte idênticos.

## Preservação e entrega

Consulta em papel, recursos/sessão, imagem própria, JSON, navegação e roteiro de criação permanecem. Nenhuma alteração nos arquivos de regras/catálogos, Worker ou D1. Os assets anteriores são comparados byte a byte; as sombras, foto, modelos, mãos, fonte e imagens anteriores não tiveram qualidade reduzida. A V27 permanece no histórico e na captura antes-v27.png.

ZIP estático V28 para upload manual no Cloudflare, com index.html na raiz, CRC/SHA e relatório. [Plano e método](identidade-v28-validation/PLANO-E-METODO.md) registra fontes, direção, limitações e reprodução. O pacote servido por HTTP tem validação própria.

**Implementado:** sombra por classe e nova direção visual. **Testado:** resultados locais descritos acima. **Homologação pendente:** avaliação artística do usuário e Brave/GTX 1660/aparelhos reais. Nenhum deploy, migração remota, merge, PR nova ou recurso de produção foi executado/modificado. O projeto principal e o Fichas protegido foram preservados.
