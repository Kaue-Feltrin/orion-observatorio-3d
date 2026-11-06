# V28 — classe e identidade do status

Base V27 7c58b41fe756bb1a50cf592fb824b67707cda247. Pedido: silhueta central baseada na classe e direção visual reconhecível, próxima do Observatório; a grade e os contornos da V27 foram considerados vazios/genéricos.

## Referências verificadas antes de implementar

1. A roleta existente de classes (`class-carousel.css`, `public/assets/workshop/manifest.json`, entrega V20) é um componente funcional validado nesta conversa: três sombras distintas com arma baixa, lanterna/bolsa e gesto de ritual. Reutilizar os PNGs nativos sem editar pixels ou inventar aparência, equipamento concedido ou gênero. Procedência image_gen histórica permanece explícita; não se atribui autoria manual às imagens existentes.
2. Observatório existente (`main.js`, `index.html`, entregas V22–V24): fotografia ESO, composição em profundidade, foco luminoso e glifos da fonte fornecida. É a primeira tela do próprio projeto, não uma alegação de inspeção de jogo AAA comercial. Adaptar foto/gradientes/luz ao DOM/CSS da ficha, sem introduzir seu renderer WebGL.
3. Estudo AAA recuperado na V27: foco no personagem, detalhes contextuais e leitura de estado. Reaproveitar hierarquia/acessibilidade e dar materialidade ao arquivo, preservando os dados da criação. Estrutura de tabs segue o exemplo APG já consultado; não muda nesta rodada.

## Direção e limites

- Default da classe: Combatente / Especialista / Ocultista. Imagem própria continua preferencial; remoção retorna à sombra daquela classe, inclusive depois de recarregar. Testar os três e o ciclo completo de personalização. Silhueta é representação da classe; não concede arma, item ou ritual.
- Trocar a grade técnica por céu fotográfico, véus escuros de leitura, halo luminoso e inscrições douradas em torno da figura. Contexto cromático por classe não é afinidade paranormal ou regra nova. Inscrição usa a fonte Sigilos de Conhecimento do usuário, sem texto latino piscando antes do carregamento.
- Fortalecer recursos/atributos/título com matéria escura, luz e símbolos; corpo central maior e inteiro, com informação legível ao redor. Evitar transformar cada dado em quadro geométrico. Todas as abas mantêm contexto visual sem sobrepor névoa/estrelas aos textos.
- Foto original ESO/S. Brunier já presente, sem redução/recompressão. Adicionar o crédito também à ficha. Reutilização tem custo de rede da foto (~3,9 MB se não estiver em cache); não alegar custo zero ou melhoria de FPS sem medição. Fonte e três silhuetas também são assets existentes; sem novos modelos ou imagens geradas.
- Efeitos por composição CSS/SVG. Nenhum canvas, loop Three.js ou bloom global. Paralaxe de baixa amplitude só responde a pointermove, agrupada em rAF; repouso sem polling. Movimento reduzido estático e sem alteração dos controles. Rotações apenas transform/opacity, sem animar blur/saturação.
- Preservar recursos/sessão/imagem em IndexedDB, foto própria, JSON, consulta em papel, abas, roteiro de criação, sigilos/feto/mãos do início e os 30 arquivos de regras. Fichas protegido f80bba intacto; sem deploy, migração remota, produção, merge ou PR.

## Verificação

Comparar capturas V27/V28, três classes em 1920×951 e mobile390×844/320×568, corpo sem cortes, fonte aguardada sem flash latino, imagem própria e fallback por classe, recursos/reload/JSON, teclado e abas. Regressões focadas de status, criação e diagnóstico. Unidade do mapa e da inscrição, check/build com assets ESO cacheados. Vídeo real, CRC/SHA e pacote servido por HTTP. Aprovação artística e aparelho físico continuam pendentes. Memória/VRAM/FPS físicos não serão inferidos.


## Reprodução e evidências finais

Node 24.19.0, Playwright 1.56.1, Chrome 156.0.8078.47 em `/workspace/orion-validation-pr179/chrome/root/opt/google/chrome/chrome`. Config local com workers=1, retries=0 e SwiftShader. Check, `node --test tests/*.unit.mjs` e build `npx vite build` com assets ESO cacheados constam nos logs finais. Não reconstruir dist durante testes/capturas.

Browser: status-v27 e status-identity-v28 (21 distintos), criação completa nas três classes e quality-diagnostic (dois): 26. `status-browser.log` preserva a expectativa de paralaxe que disputava reset de preferência (20 passes/uma falha). `motion-final.log` confirma o caso isolado e `status-final.log` aprova os 21 no build com máscara alpha. `test-summary.json` consolida os 26 sem somar repetições. Os 1.319 testes do Fichas são históricos V24, não repetidos aqui.

```sh
node docs/creation/identidade-v28-validation/capture-v28.mjs
python3 docs/creation/identidade-v28-validation/package-v28.py
python3 -m http.server 4309 --bind 127.0.0.1 --directory /workspace/orion-v28-cloudflare-upload
node docs/creation/identidade-v28-validation/package-review-v28.mjs
```

Portas/caminhos são locais desta nuvem. Capturas usam três personagens fictícios gerados pela fixture de decisões, com dados de referência derivados pelo motor existente. Interface e ações são reais; não é um percurso iniciado do zero (esse percurso é coberto pelas três classes). Há captura V27 no mesmo viewport para comparação. Nenhum quadro foi gerado para simular funcionalidade.

FFmpeg é apontado em memória pelo Playwright para `/usr/bin/ffmpeg`, sem editar node_modules. WebM é convertido com libx264, dois threads, preset fast, crf22, yuv420p e faststart, dimensões pares por pad. O viewport 1920×951 é gravado em 1920×950 pelo Playwright; não foi acelerado artificialmente. Metadados reais em video-metadata.json.

Capture-validation registra fonte, enquadramentos, zero canvases, ausência de overflow, erros e requisições. Package-validation cobre ZIP servido, sessão/reload/exportação/papel/estrela. Preservation compara assets/recursos; artifact registra CRC/raiz/SHA. Served-files confere JS/CSS/HTML/relatório com o ZIP final. Documentos finais não alteram o build testado. Dados, blobs e progresso continuam locais ao navegador/domínio. Nenhuma conta/D1/produção foi alterada.
