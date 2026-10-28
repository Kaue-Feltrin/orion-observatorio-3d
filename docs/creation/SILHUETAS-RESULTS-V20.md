# V20 — Sombras simples para as três classes

28/10/2026. Revisão visual do Observatório, base V19 `6085556729e1cc3bd8cc0a99db032d1ce256da4c`, branch `feat/nascimento-marcado`. As gravuras da V19 foram rejeitadas pelo usuário: havia figurino e desenho detalhado onde se pediam silhuetas simples. Esta entrega troca a aparência das três classes, mantendo o fluxo existente.

## Implementado

Três contornos anônimos de pessoas em roupas contemporâneas, sem rostos ou desenho interno de figurino. Combatente identificado pela arma baixa e postura firme; Especialista pela lanterna e bolsa; Ocultista pela mão em gesto de ritual. Não há mantos, armaduras, hachuras, texturas ou cores pintadas nos corpos. Não se define a aparência do personagem nem se concede equipamento com essas representações.

Os três PNGs nativos são gerados/editados com image_gen e foram copiados sem edição de pixels. A interface usa somente o alpha como máscara CSS, preenchida com `#070707`; cores e traços RGB internos do PNG não aparecem. Isso fixa o tratamento de sombra simples no código. Não se afirma autoria manual ou ausência de geração por IA: a mudança trata da aparência solicitada. Fontes e hashes em `art-provenance.json`; dimensões 971×1619 para Combatente/Especialista e 1024×1536 para Ocultista. A fonte do Ocultista recebeu uma revisão para remover os contornos internos do livro/torso.

Roleta, giro, resposta ao apontar, movimentos reduzidos, textos, vantagens/limitações, exemplos e confirmação explícita foram preservados. As imagens detalhadas V19 continuam no repositório para histórico, mas são excluídas do pacote V20 e não são carregadas pelo CSS/JS atual.

## Verificado

- `npm run check` e bundle `npx vite build` aprovados. O download separado da fotografia ESO não foi reexecutado; o comando completo de build continua com o limite externo documentado na V19. Imagens anteriores e pipeline de desempenho preservados.
- **Seis cenários de navegador aprovados**, cobrindo exploração/teclado, giro sem confirmar, cancelamento ao voltar, preservação de nome/origem/classe, armazenamento recusado e toque/deslize em 390×844, 320×568 e 568×320. Não se apresenta uma nova execução das 33 verificações da revisão anterior ou dos testes unitários, pois não houve mudança de regras/geometria/qualidade de renderização.
- Prancha de conferência com as três sombras sobre fundo claro, capturada em HTML pelo navegador. `mask-styles.json` registra as três máscaras reais e o preenchimento uniforme `rgb(7, 7, 7)`. A prancha é um estudo de apresentação das imagens, não uma nova página do fluxo.
- Pacote servido por HTTP na porta 4300: capturas desktop/móvel, giro, comparação e confirmação, com nome/origem preservados; nenhum erro JavaScript, resposta HTTP de erro ou requisição de escrita remota. Vídeo `CLASSES-V20.mp4` capturado na aplicação real, recortado a partir da entrada na classe e convertido para H.264. Nenhum frame de tela foi composto para simular funcionalidade.

Capturas, vídeo, logs e procedência em `silhuetas-v20-validation/`. A aprovação de que as formas remetem adequadamente a Ordem Paranormal continua pendente do usuário; não são artes ou símbolos oficiais dos livros.

## Preservação e limites

22 módulos foram comparados com a V19 e permanecem idênticos, incluindo `main.js`, controle/orçamento de qualidade, sigilos, criação, mesh das mãos, viagem, catálogo das classes e todo o fluxo de origens. Mudanças de runtime limitadas às URLs de imagens em `class-carousel.js` e à pintura por máscara em `class-carousel.css`. Provas em `preservation.json`.

Órion Fichas segue em `f80bbaacc8acb4ad0158d43fb923e2f421e58528`, árvore rastreada limpa. Sem alterações no Órion principal, regras, Worker, D1, migrações, produção, merge ou PR nova. ZIP para upload manual; sem deploy.

**Implementado:** as três sombras e sua pintura na roleta. **Testado:** os seis cenários e as capturas locais descritas. **Homologação pendente:** escolha artística do usuário e teste em Brave/GTX 1660/aparelho físico. As correções de fluidez da V19 estão preservadas, sem nova medição de FPS nesta revisão.
