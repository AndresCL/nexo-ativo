# Motor Compartilhado de Microfluxos e Cálculos Comerciais

## Cinco Experiências, Um Único Motor

Os tipos **Descobrir**, **Explorar**, **Planejar**, **Solicitar** e **Conectar** executam sobre o mesmo motor determinístico baseado em Grafo Acíclico Dirigido (DAG) versionado:

- **Descobrir:** Perguntas intencionais e condicionais que recomendam serviços/produtos reais ativos (com resultado alternativo obrigatório).
- **Explorar:** Navegação imediata por catálogo ou portfólio com filtros opcionais, sem exigir perguntas prévias.
- **Planejar:** Construção de checklist ou plano personalizado conforme objetivo e preferências.
- **Solicitar:** Coleta apenas de informações faltantes e contato autorizado, registrando pedido real somente após confirmação do backend.
- **Conectar:** Direcionamento explícito ao profissional ou unidade vinculada ao serviço selecionado.

## Continuidade de Contexto

Ao iniciar um microfluxo a partir de um serviço, produto, projeto ou cartão digital profissional (incluindo QR Code), o `ContextoOrigemMicrofluxo` hidrata automaticamente o estado inicial e salta perguntas redundantes.

## Cálculos Comerciais Determinísticos

Suporte a quatro modalidades seguras em centavos inteiros (`ValorMonetarioCentavos`):

1. Valor fixo.
2. Valor base mais adicionais selecionados.
3. Quantidade multiplicada por preço unitário.
4. Preço por faixa configurada.

Todo valor exibido explicita sua natureza comercial: `estimativa`, `preco_informado` ou `proposta_sujeita_aprovacao`.

## Edição e Publicação no Painel

Em **Experiências Interativas**, a seleção de um cartão abre seu editor. O campo **Exibição** reúne as opções **Oculta**, **Visível** e **Em destaque**, com apenas um destaque por organização. A exclusão fica no menu de três pontos.

As setas de ordenação ficam visíveis em todos os cartões, sem exigir seleção; o destaque permanece na primeira posição. O seletor compacto de ícone fica à esquerda do título. O lápis abre a edição do nome: Enter encerra a edição, Escape cancela a mudança e **Salvar rascunho** persiste o novo título junto às demais alterações.

**Salvar rascunho** grava todas as experiências alteradas e as exclusões pendentes em um único lote. **Publicar alterações** salva esse mesmo rascunho antes de atualizar a vitrine; uma falha no salvamento interrompe a publicação e mantém as alterações na tela. O histórico das versões publicadas é preservado ao excluir uma experiência, inclusive a última.

A grade exibe quatro cartões por linha em notebooks a partir de 1280 px, cinco a partir de 1600 px e seis a partir de 1920 px, com duas colunas em tablets e uma em celulares. A publicação é a única ação principal da tela.

A ação **Abrir Gaveta de Equipe (#equipe)** aparece na vitrine com **título livre**, subtítulo opcional e avatares sobrepostos sem borda. O campo **Limite de avatares (opcional)** define quantos integrantes aparecem; vazio mostra todos. Com um limite preenchido, o contador `+N` mostra a quantidade restante. Apagar um limite salvo volta a exibir todos os integrantes. A ordem é estável para a mesma organização e equipe; fotos ausentes ou com falha usam iniciais. Equipes maiores quebram em linhas para caber na tela. O conjunto inteiro abre a equipe: painel inferior no celular e lateral em telas maiores.

Essa ação oferece **Posição no desktop** (no lugar definido na lista ou abaixo do texto do hero) e **Posição no celular** (no lugar definido na lista ou acima do primeiro botão). A posição padrão preserva a ordem da lista. Mover o convite não muda a ordenação salva nem o destaque da experiência. A prévia de aparência usa as experiências e a equipe salvas no rascunho; a vitrine usa o acervo publicado. Sem integrantes ativos publicados, o convite é ocultado; links diretos para `#equipe` continuam funcionando.

A conclusão é configurada dentro do editor visual: clique em **Finalização** na barra de ferramentas ou na caixa final do diagrama. O painel lateral reúne o texto do botão final, título, mensagem, resumo e zero a duas ações de continuação. No celular, esse painel ocupa a área do diagrama e pode ser fechado para voltar ao percurso.

O editor usa [etapas livres](etapas-livres.md), com elementos ordenáveis de texto, imagem, campos, escolhas, catálogo e equipe. Contato é uma finalidade atribuída aos campos. Os modelos ficam no menu **Modelos de etapa** e geram composições editáveis.
