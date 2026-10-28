# V11 — Vermelho preservado e brilho menor

28/10/2026. Ajuste integrado e testado em navegador; avaliação visual do usuário e telefone físico continuam pendentes.

Saturação dos dois vermelhos agora varia de **30% a 100%**, sincronizada no ciclo de 4,8 segundos existente. O vermelho conserva cor no ponto mínimo. O movimento normalizado permanece independente (0–1), mantendo a expansão de 0% até 2%; elevar o piso de saturação não aumenta o tamanho mínimo da imagem.

O brilho de saída dos vermelhos foi reduzido para **75%**, constante durante a pulsação. No shader isso é aplicado após a conversão para o espaço de saída, e no inspetor corresponde a `brightness(.75)`. Não é uma alteração de opacidade: valores .30/.21/.64/.59 continuam iguais. A redução atua no vermelho antes da identidade; a transição preserva a atmosfera neutra existente. Base preta, névoas cinzas, imagens, silhuetas, sigilos, mãos, formulário e navegação permanecem.

O visualizador `camadas.html` usa `saturate(.3) → saturate(1)` com brilho .75 e as duas massas crescendo juntas até escala 1,02. Fora da animação, mantém o mesmo brilho menor. Preferência de movimento reduzido conserva os vermelhos estáticos e escurecidos.

Verificações reais: `npm run check`, unidade afetada e bundle Vite aprovados. Três cenários de navegador aprovados: pulsação/interrupção na identidade, movimento reduzido e toque sem preferência reduzida. Não foram repetidas unidades não afetadas. Inspetor do pacote validado nos dois extremos: filtros, escalas, opacidade constante e comparação da crominância dos pixels renderizados. Captura móvel 390×844 acompanhou dois ciclos em 85 quadros, verificando saturação >=.3 e <=1 e igualdade entre as camadas vermelhas. Fluxo de criação e rascunho passaram sem erros JS/HTTP. Logs/capturas/vídeo reais em `cor-v11-validation/`.

Chrome headless/SwiftShader e toque emulado não equivalem à homologação física. Empacotamento Vite usou os recursos fotográficos locais já preparados; não se anuncia novo download externo como aprovado. PNGs/SVG originais preservados byte a byte. Entrega por ZIP manual; sem Cloudflare/produção, migração, merge ou nova PR. Regras e dados de Fichas não foram alterados.
