# Design System Editorial

## Princípios Visuais

- **Apresentação autoral, nunca página corporativa longa:** Sem cabeçalhos gigantes, menus horizontais extensos ou grades genéricas de botões coloridos.
- **Home Desktop:** Mídia em toda a viewport, marca discreta no topo, poucas ações alinhadas à direita e redes sociais sutis.
- **Home Mobile:** Mídia preenchendo a tela com respeito a `safe-area-inset`, opções empilhadas e centralizadas horizontalmente (regra exclusiva da Home mobile, não imposta às etapas internas dos microfluxos) e alvos de toque mínimos de 44px.

## As Três Composições Aprovadas

1. **Imersivo:** Fotografia ou vídeo protagonista em fundo integral.
2. **Retrato Editorial:** Profissional em destaque com preservação do enquadramento facial via `PontoFocalMidia`.
3. **Galeria Editorial:** Curadoria visual inspirada em exposições para obras, projetos e séries.

_(O antigo estilo Institucional independente foi descartado por sobreposição com o Imersivo.)_

## Acessibilidade e Movimento

- Conformidade orientada a **WCAG 2.2 AA** (contraste controlado, foco visível, rótulos e alertas sem depender exclusivamente de cor).
- Fontes variáveis auto-hospedadas (`Cormorant Variable` e `Plus Jakarta Sans Variable`) garantindo consistência visual, privacidade LGPD e compilação offline.
- Respeito integral a `prefers-reduced-motion` em animações (`TransicaoEditorial`) e vídeos de fundo.
