# V27 — ficha de status com corpo inteiro

Base V26 c02557b9a95cf01b8e91a400cf93cb3d7dfe51d2. Pedido: materializar a Visão geral do estudo AAA, com o personagem em corpo inteiro no centro. Fonte histórica: estudo 01 de 26/10/2026, recuperado em `estudo-aaa-recuperado/PESQUISA.md` e `estudo-aaa.html`. A validação histórica foi preservada separadamente e não é contada como teste V27. Arquivo paranormal tático: azul quase preto, marfim, dourado e confirmação verde, informação em camadas.

## Referências realmente consultadas

- Foundry PF2e, template público da ficha de personagem: navegação por tarefas, sidebar e conteúdo da ficha separados. Implementação de aplicativo em uso; não executada aqui. Adaptar princípios, sem copiar layout, código, regras, logotipo ou assets. URL e hash em research-sources.json.
- W3C ARIA APG, exemplo funcional Tabs with Manual Activation: tabs com foco por setas/Home/End e ativação explícita. Demonstração normativa, não jogo comercial. HTML foi consultado pelo GitHub oficial porque a página W3C respondeu 403. Usar sem depender de hover.
- O README DnD5e foi lido; o template tentado retornou 404 e a API de árvore 403. Não contar como ficha inspecionada. BG3, Destiny 2, The Division 2 e Control permanecem referências de direção do estudo histórico, não evidência de inspeção de versões atuais.

## Implementação proposta

- Nova ficha de status por padrão para um registro local existente. Cabeçalho compacto; abas reais de visão geral, perícias, habilidades, rituais, inventário e história. Corpo inteiro central com diagrama de enquadramento e fundo discreto; recursos de sessão à esquerda, atributos e identidade à direita.
- Silhueta vetorial original, neutra e provisória, sem aparência/gênero presumidos. Upload opcional de PNG/JPEG/WebP de corpo inteiro, guardado como blob em IndexedDB exclusivo por personagem, sem editar a imagem ou enviá-la. A arte permanece inteira com object-fit contain; limite de 6 MiB/16 MP.
- Recursos de sessão locais separados do registro original; máximos somente das referências já salvas. Ajuste explícito ±1, persistência verificada, limites e falha de storage visíveis. Ausência de máximo não produz número fictício. Não altera regras, nível, grants, máximos ou ativação. Sem novas condições, poderes ou equipamentos concedidos.
- Inventário com ícones/lista e detalhe selecionado; perícias com explicação/busca; história e subescolhas existentes continuam consultáveis. Habilidades só mostram o que consta no registro, com status de referência quando necessário. Não afirmar Oficina/Evolução implementadas nesta rodada.
- Preservar a ficha em papel em `view=paper`, o recrutamento, a criação, o Observatório e todos os registros existentes. Exportar ficha com estado da sessão separado, se houver. Nada de conta online/D1/remoto.

## Orçamento e validação

Sem nova dependência npm, fonte, modelo 3D ou render loop WebGL nesta tela. Figura SVG inferior a 10 kB; animação CSS discreta e finita na entrada, desativada em movimento reduzido. Upload usa blob original, sem conversão/renderização pesada contínua. Nenhuma redução de assets anteriores. FPS/RAM/VRAM de GPU física não serão inferidos de SwiftShader.

Testar três classes, dados antigos sem recursos, consulta de todas as seções, seleção de itens, busca, teclado, ajuste/reload de recursos, quota recusada, arte/reload/remoção e isolamento entre personagens, exportação e retorno ao Observatório. Viewports 1920×951, 1440×1000, 390×844 e 320×568/paisagem. Capturas reais e vídeo; conferir figura inteira sem cortes. Homologação artística e aparelho físico permanecem pendentes. Não publicar, migrar, abrir PR ou tocar o Fichas protegido.

## Reprodução e evidências

Node 24.19.0; Chrome 156.0.8078.47 em `/workspace/orion-validation-pr179/chrome/root/opt/google/chrome/chrome`; Playwright 1.56.1, workers=1, retries=0, flags SwiftShader. `npm run check`, `node --test tests/*.unit.mjs` e `npx vite build` (assets ESO cacheados) estão registrados em check-final/unit-final/build-final.log. Não reconstruir dist durante os testes.

`tests/status-v27.spec.js` tem 14 cenários novos. Regressões: creation-journey, recruitment-v25, equipment-writing-v26 e quality-diagnostic (38). O nome histórico dos arquivos não indica build antigo. A rodada `regression.log` conserva três falhas de expectativa da consulta antiga (história na página única) e 35 passes. As três criações foram repetidas após navegar à aba História, junto com os 14 casos de status; `final-browser.log` tem 17 passes. `test-summary.json` consolida 52 distintos, sem somar repetições. Os testes anteriores do Fichas não foram reexecutados nesta rodada.

Auxiliares, a partir da raiz do repo:

```sh
node docs/creation/status-v27-validation/capture-v27.mjs
python3 docs/creation/status-v27-validation/package-v27.py
python3 -m http.server 4308 --bind 127.0.0.1 --directory /workspace/orion-v27-cloudflare-upload
node docs/creation/status-v27-validation/package-review-v27.mjs
```

Os caminhos/portas são desta nuvem, adaptáveis; não são links públicos para o usuário. Captura usa escolhas fictícias preparadas, navega pelo app real e grava o browser. Não é um percurso da criação iniciado do zero; esse percurso é coberto pelas três classes. O FFmpeg do Playwright é apontado em memória para `/usr/bin/ffmpeg`, sem editar node_modules. Transcodificação: libx264, dois threads, preset fast, crf22, yuv420p, faststart e pad para dimensões pares. O viewport 1920×951 é gravado pelo Playwright em 1920×950; não foi acelerado artificialmente. Arte personalizada do vídeo usa o PNG de classe V20 como escolha de teste, nunca como aparência padrão inferida.

`capture-validation.json` registra enquadramentos, ausência de canvases, erros e requisições. `package-validation.json` registra o ZIP servido, sessão/reload/JSON/papel/estrela e draws do recrutamento. `preservation.json` compara 56 assets existentes e 40 recursos do ZIP anterior e registra o SVG adicional. `served-files.json` compara os arquivos servidos ao ZIP final; artifact.json identifica CRC/SHA/raiz. Licenças/fontes anteriores continuam distribuídas. Memória/VRAM/FPS físicos não foram medidos, e revisão artística segue pendente.
