# V10 — Saturação e expansão sincronizadas

28/10/2026. Implementação testada; avaliação artística e telefone físico permanecem pendentes.

As duas massas vermelhas agora compartilham um único valor de pulsação: saturação **0% → 100% → 0%** em ciclo suave de 4,8 segundos. Em 0% ficam cinzas, e em 100% exibem a cor original. A expansão acompanha a saturação, de escala 1 até 1,02, chegando ao pico simultaneamente nas duas camadas. Os pontos de expansão continuam próprios de cada massa. A opacidade dos quatro arquivos fica constante (.30/.21/.64/.59), sem pulsação adicional de brilho ou alpha. As duas névoas cinzas e a base preta permanecem fora do efeito.

`camadas.html` recebe o mesmo intervalo, escala e sincronismo, sem atraso entre os vermelhos. O visualizador usa saturação CSS; o site interpola a cor no shader. Ambos respeitam movimento reduzido. A transição para identidade continua removendo a cor e interrompendo a expansão.

A gravação de teste revelou que o preset antigo passava `reducedMotion=true` para qualquer dispositivo de toque, mesmo sem essa preferência no sistema. Isso mantinha o vermelho estático no celular. Na criação, a pulsação agora respeita a preferência real; a paralaxe por apontador continua desligada no toque. O Observatório original conserva a configuração anterior.

## Verificações reais

- `npm run check` e bundle Vite final aprovados. Recursos fotográficos locais existentes preservados; nenhum novo download externo do build completo é apresentado como aprovado.
- Unidade afetada aprovada: extremos exatos 0/1/0 nos tempos 0/2,4/4,8 segundos, limites, periodicidade e continuidade do ciclo compartilhado. As unidades não afetadas não foram repetidas nesta alteração.
- Quatro cenários de navegador aprovados na liberação: cobertura do carregamento, pulsação/interrupção na identidade, movimento reduzido e toque sem preferência reduzida. Este último verifica animação no celular e paralaxe por apontador desativada.
- Inspetor do pacote: animações fixadas em 0 e 2400 ms confirmam `saturate(0)`/`saturate(1)`, escalas 1/1,02 e igualdade temporal dos dois vermelhos. Capturas de pixels confirmam aumento da crominância; opacidades permanecem constantes.
- Pacote servido por HTTP em Chrome móvel emulado 390×844: coleta de 52 quadros ao longo de dois ciclos confirmou igualdade dos valores das duas massas; amostra mínima 0,001314 e máxima 0,999133. Fluxo de criação, escolha, nome e rascunho passaram sem erros JS/HTTP. Uma primeira coleta revelou o congelamento por preset de toque acima; a validação final foi feita após sua correção.

Logs, comparação de extremos e vídeo real em `saturacao-v10-validation/`. Chrome headless/SwiftShader e celular emulado não equivalem a homologação de desempenho ou teclado virtual em aparelho físico.

Nenhuma imagem foi refeita. Cinco camadas, fonte, feto, silhuetas, regras/dados de Fichas e módulos originais de mãos/seleção/viagem/véu preservados. ZIPs para upload manual/inspeção; sem Cloudflare, produção, migração, merge ou nova PR.
