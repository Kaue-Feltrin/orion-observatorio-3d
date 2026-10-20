# Observatório: de uma a três estrelas e chegada contínua

Etapa de 20/10/2026, a partir de `bf90906`, na branch `codex/maos-rig-mmv` / [PR #29](https://github.com/Kaue-Feltrin/orion-observatorio-3d/pull/29). Mobile fica para depois; criação de personagens é a próxima etapa e não foi iniciada.

O padrão continua sendo uma Nox. `?stars=2` acrescenta **Estrela II**; `?stars=3`, **Estrela III**. Nomes provisórios foram autorizados pelo usuário. As extras são demonstrações, sem ficha inventada ou dados persistidos. Valores fora do intervalo são limitados a 1–3; valor inválido retorna a uma estrela.

Cada destino tem posição, alvo 3D/teclado, resumo e seleção próprios. Só a estrela escolhida recebe a confirmação. O destino fica travado até a chegada; eventos repetidos não mudam a escolha. A mesma instância de viagem e seus 540 rastros são reutilizados, e as estrelas compartilham mapas. Na amostra Eco+ em perspectiva havia 28 texturas tanto com uma quanto com três estrelas. Não é uma medição de desempenho em equipamento do usuário; draw calls no JSON são amostras isoladas de passes alternados do bloom.

A URL da chegada carrega a identidade escolhida. O retorno mantém a contagem e as opções visuais. Voltar pelo navegador restaura o Observatório utilizável, inclusive se o documento vier do cache de navegação.

## Troca de página

1. No clique, prepara o HTML do destino sem bloquear a viagem se a preparação falhar.
2. Gesto, seleção e viagem continuam com a sobreposição anteriormente aprovada.
3. Ao concluir a viagem, cobre a tela com `#fffaec` por um quadro pintado antes de navegar.
4. O HTML da chegada instala o mesmo véu antes da primeira pintura, sem depender de armazenamento.
5. Nome, título e link de retorno são preenchidos; depois de fontes e dois quadros, o véu revela o destino em 700 ms (160 ms em movimento reduzido).
6. A marca transitória `via=observatory` é removida. Acesso direto funciona sem véu. Existe saída de segurança após sete segundos caso o módulo de chegada não consiga iniciar.

A chegada segue sendo a página temporária existente. Não é a ficha definitiva nem o formulário de criação de personagem.

Ao testar o trajeto lateral, a primeira gravação mostrou as bordas do plano fotográfico. A viagem agora mantém o frustum diante dele, ajusta a distância de recorte e amplia minimamente o plano existente quando os cantos sairiam da fotografia. Mesma imagem, proporção e posição; sem mudança no repouso, nova textura, superfície ou desfoque. Unidade percorre os três destinos em quatro proporções, quadro a quadro, e exige cobertura dos quatro cantos, distância de recorte suficiente e continuidade na partida.

## Evidências

- [Uma estrela antes](before-1-stars.webp), [uma depois](after-1-stars.webp), [duas](after-2-stars.webp), [três](after-3-stars.webp).
- [Resumo antes](before-hover.webp), [resumo da Estrela III](after-hover.webp), [chegada antes](before-arrival.webp), [chegada escolhida](after-arrival.webp).
- [Vídeo antes](before.mp4) e [vídeo depois](after.mp4): página inteira, entradas e relógio reais, timestamps CDP, navegação efetiva sem interceptação. Base extraída com `git archive`, sem trocar de branch. O vídeo anterior usa Nox; o posterior usa Estrela III para mostrar o novo destino lateral.
- [Dados das gravações](recordings.json). Capturas são Chromium/SwiftShader local; respiração e câmera não têm relógio sincronizado. Não presumir aceite artístico ou fluidez em dispositivo real.

Check/build, nove suítes unitárias e 36 casos distintos de navegador aprovados em rodadas, sem retries. As 19 regressões das mãos/atmosfera/toque passaram antes da correção final de cobertura; no build final passaram 18/18 casos de navegação/seleção e 5/5 da cena. Resultados por caso e arquivos modificados estão em [validation.json](validation.json) e nos registros cumulativos da raiz. Main, branch de referência, imagens das mãos, fotografia/créditos ESO e arquivos de atmosfera foram preservados. Alteração do plano fotográfico ocorre somente durante a viagem.

Ação do usuário na entrega: abrir a prévia com três estrelas, passar o cursor entre elas, escolher cada destino e avaliar se a chegada esconde bem a troca de página. Nenhuma instalação, upload ou credencial necessária.
