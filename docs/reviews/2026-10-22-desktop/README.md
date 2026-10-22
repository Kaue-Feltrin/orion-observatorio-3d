# Revisão de fechamento desktop e preparação mobile — 22/10/2026

Versão auditada: `427c42070b6df5e5a6f64412456747676b145419`, branch `codex/maos-rig-mmv`, [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29). Pedido do usuário: verificar pendências reais antes de considerar o design encerrado e planejar o mobile. Nenhuma alteração de implementação ou arte nesta revisão.

## Resultado

A composição aprovada pode ser encerrada visualmente. A revisão encontrou **uma pendência de consolidação do desktop**: o gesto aprovado das mãos só aparece com `handsMotion=perspective`. Sem esse parâmetro, `main.js:149` seleciona `mesh` no desktop. O acesso normal ainda mostra o modo anterior, com troca de poses, em vez do rig aprovado de uma imagem contínua. A escolha foi mantida como prévia nas etapas anteriores; não foi promovida automaticamente durante esta auditoria.

Comparação controlada: mesmo viewport 1280×720, `stars=3`, `quality=eco-plus`, posição do mouse e hover na Nox; apenas `handsMotion` difere. Respiração em relógio real, não sincronizada entre páginas.

- [Desktop padrão — gesto anterior](default-hover.webp): `animation=mesh`, zero rigs, três texturas de mãos.
- [Desktop aprovado — perspectiva](approved-hover.webp): `animation=perspective`, dois rigs, duas texturas de mãos.

A correção recomendada antes de consolidar o desktop é tornar o modo aprovado o padrão do acesso normal, mantendo um parâmetro explícito para a comparação antiga. A auditoria não alterou esse padrão, parâmetros, main ou produção. Não é necessário redesenhar assets ou acrescentar efeitos.

## O que já foi validado

- [CI completo da versão auditada](https://github.com/Kaue-Feltrin/orion-observatorio-3d/actions/runs/39465583412): SUCCESS, incluindo estrutura, unidades, build e suíte WebGL. Cloudflare também SUCCESS.
- Check/build locais novos aprovados. Cinco testes adicionais de navegação passaram sem falhas ou retries: uma estrela/retorno, terceiro destino/retorno, véu entre documentos com módulo atrasado, reduced-motion/destino inválido e voltar pelo navegador. [Resultados por caso](validation.json).
- Comparação dos dois modos sem erros JavaScript ou erro de carga das mãos. Falha simulada de criação de contexto WebGL exibe aviso e botão de tentar novamente: [captura](webgl-fallback.webp).
- Emulação móvel 390×844: gesto em perspectiva já é padrão, perfil automático `lite`, seleção da Estrela II abre resumo e botão de confirmação; sem transbordamento horizontal. [Captura](mobile-summary.webp) e [estado observado](inspection.json).

Não foram reproduzidos outros defeitos impeditivos nesses cenários. Isso não substitui validação em aparelhos reais, Safari/iOS ou redes móveis lentas.

## Pendências funcionais previstas, fora do fechamento visual

- `ficha.html:13` é explicitamente uma chegada temporária; ficha definitiva e criação de personagem ainda não existem.
- `herald-catalog.js:1–15` fornece Nox e duas estrelas de demonstração por parâmetro de prévia. Ainda não representa personagens persistidos de uma conta.
- `main.js:105`: Sair informa que não existe conta conectada. Autenticação/sessão e persistência ficam para a etapa funcional correspondente.

Esses pontos são limitações conhecidas do protótipo, não regressões da galáxia/mãos. Não precisam ser implementados para começar a adaptação mobile; devem continuar registrados para a criação de personagem e a integração futura.

## Próxima etapa recomendada

1. Consolidar o gesto aprovado como padrão desktop.
2. Adaptar a composição mobile para uma a três estrelas, resumo e confirmação explícita; refinar enquadramento das mãos para preservar centro e controles. Arrastar para explorar e tocar para abrir resumo já funcionam como base.
3. Validar retrato/paisagem, áreas seguras, retomada da aba, rede lenta e desempenho em Android e Safari/iPhone reais. Qualidade adaptativa existe, mas não foi medida em dispositivo físico nesta revisão.
4. Retomar criação de personagem/ficha e persistência na etapa funcional, sem misturá-las ao acabamento mobile.

Nenhuma melhoria estética adicional é necessária por evidência desta revisão. Main/referência preservadas. O usuário não precisa instalar ou enviar nada agora; a etapa de hardware real exigirá comparação no aparelho disponível.
