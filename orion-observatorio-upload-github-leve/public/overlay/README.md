# Mãos etéreas · v0.9.21

O modo padrão `hands=mesh` usa três texturas RGBA locais, em 1122×1402:

- `left-hand-ethereal.webp`: enquadramento discreto à esquerda, preservado.
- `right-hand-pointing.webp`: apontamento à direita, preservado.
- `right-hand-neutral.webp`: nova pose relaxada da direita, sem indicador estendido. Gerada com a ferramenta de imagens da OpenAI a partir do asset de apontamento existente, mantendo palma, punho, dimensões e transparência; exportada como WebP (qualidade 92, alpha 100). Não é a mão esquerda espelhada.

As duas poses direitas compartilham geometria e enquadramento. Somente o hover real do Nox ativa a transição; saída, perda de foco, aba oculta e viagem encerram o apontamento. Há dois draws em repouso e no apontamento, três apenas durante o blend. O modo `hands=off` não solicita essas imagens.

`orion-hands-frame.webp` continua disponível para o modo anterior `hands=overlay`. Nenhum asset anterior foi substituído. Aprovação visual e medições de FPS/RAM no dispositivo do usuário permanecem separadas dos testes automatizados; não promover a produção sem autorização.
