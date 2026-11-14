# Conclusões e entradas diretas dos microfluxos

## Auditoria e reutilização

A análise anterior às alterações localizou os contratos em `tiposMicrofluxo.ts` e `esquemasMicrofluxo.ts`, o motor DAG em `motorExecucaoMicrofluxo.ts` e sua validação em `validadorGrafoMicrofluxo.ts`. A conclusão é um estado do executor, alcançado quando não existe próxima etapa; não foi criado outro tipo de nó ou construtor.

O executor já persistia solicitações com contato antes de mostrar confirmação, pela porta `PortaSubmissaoSolicitacaoVisitante`. A gravação ocorre na transação de `registrarSolicitacaoVisitanteTransacional.ts`, com chave idempotente e notificação posterior. As respostas históricas já usam `extrairRespostasLegiveisMicrofluxo`. A chave existente utiliza janelas de dez minutos. Não foi criado armazenamento de respostas paralelo.

Foram reutilizados `ContextoOrigemMicrofluxo`, seleção do profissional, `rastreadorSessaoOrigem`, eventos de telemetria, `montarLinkWhatsapp`, demonstrativo comercial congelado em centavos, políticas de publicidade e leitor de `paginasPublicadas/*Publicados`. A publicação já valida permissões e planos, separa rascunho de acervo público e grava versões imutáveis. A auditoria também identificou atalhos de seleção profissional e conexão WhatsApp que saltavam a conclusão normal; esses atalhos agora seguem o mesmo avanço do motor.

## Contrato e comportamento

`DefinicaoMicrofluxo.conclusao` é opcional. Sua ausência mantém o resumo e as ações de conclusão legados. Uma configuração presente possui:

- `acoes`: zero, uma ou duas ações. A primeira é a principal; a segunda tem menor destaque. Uma lista vazia não gera botões de continuação. O controle de fechar o diálogo permanece disponível.
- `resumo`: ativação, seleção ordenada de campos, rótulos e inclusão opcional do demonstrativo congelado.
- `camposWhatsapp`: seleção independente, vazia por padrão. Mostrar uma resposta na conclusão não autoriza enviá-la ao WhatsApp.

Os tipos de ação são WhatsApp, URL externa HTTP/HTTPS, outra experiência, perfil profissional e home. O telefone explícito prevalece; sem ele, o executor reutiliza o profissional selecionado e a resolução da equipe. O WhatsApp usa `wa.me` com mensagem, sem cópia manual.

A projeção das respostas percorre o caminho atual do DAG, omite ramos abandonados e valores ausentes, preserva zero, booleanos e múltiplas escolhas, e respeita as restrições financeiras da política. Não recalcula o demonstrativo. A persistência histórica também deixa de incluir respostas de ramos abandonados.

A conclusão, a confirmação de registro com protocolo e o clique no WhatsApp são tratados separadamente. O avanço para a conclusão não exige abrir destino externo. Falhas de registro mantêm a etapa para nova tentativa; um bloqueio síncrono impede requisições concorrentes por clique duplo. Experiências sem contato usam texto informativo por padrão. O editor orienta o assinante a não prometer retorno sem coleta de contato.

## Editor e validação

`EditorConclusaoMicrofluxo` é aberto no painel lateral do editor visual ao selecionar a caixa **Finalização** no diagrama ou o botão **Finalização** na barra de ferramentas. Reúne o texto do botão que encerra o percurso, título, mensagem, remoção de todas as ações, campos do resumo, autorização independente para WhatsApp e prévia ilustrativa em largura de celular ou desktop. A prévia indica respostas ilustrativas; a vitrine mantém o tema editorial publicado.

A caixa de finalização é uma projeção visual do estado terminal existente e não integra as etapas persistidas. As saídas que encerram o percurso são ligadas visualmente a ela. Conectar uma etapa a essa caixa remove a próxima etapa padrão, mantendo a semântica atual do motor; o identificador visual nunca é salvo como destino. A finalização não possui saída nem pode ser excluída.

O esquema Zod limita as ações e valida rótulos, telefones, URLs e identificadores. A publicação valida destinos internos contra o mesmo acervo ativo da organização, referências de campos e ciclos entre experiências antes de gravar a versão. URLs do mesmo endereço base público são recusadas como externas, exigindo os tipos de destino internos. A projeção pública também não renderiza ações com destino indisponível.

## Entrada direta

A rota `/{organizacao}/experiencias/{id}` usa o ID estável existente, sem introduzir slug ou migração. Ela consulta somente o pacote publicado pelo leitor compartilhado, valida organização e experiência, aplica as políticas existentes e abre o mesmo executor sobre a mesma vitrine. Rascunhos e experiências removidas ou inativas não ficam disponíveis. A leitura pública agora exige organização ativa, além de página e identificador públicos disponíveis.

O painel permite copiar o link e informa que ele abre a versão publicada. Os parâmetros existentes de origem continuam no mecanismo de atribuição de sessão. O contexto profissional recebido é resolvido somente contra profissionais ativos do acervo. A navegação entre experiências leva apenas esse identificador, sem respostas ou contato na URL. Não há nova estrutura de analytics.

## Validação e limites

Testes adicionados cobrem contratos com zero a duas ações, resumo, ramos abandonados, restrições financeiras, confirmação assíncrona, clique duplo, separação da mensagem de WhatsApp, navegação direta, preservação profissional, isolamento entre organizações, acervo publicado e publicação imutável. Os testes existentes de falha no envio, cálculos, regras profissionais e compatibilidade continuam sendo executados.

A idempotência temporal de dez minutos e o cache público de até 120 segundos em produção foram preservados. Não há restauração de respostas após atualizar a página. A prévia do editor é ilustrativa; não representa uma execução com respostas reais. Nenhuma publicação ou implantação foi feita por esta alteração.

Resultados da validação local: `npm run testar` passou com 338 testes em 62 arquivos; `npm run verificar-tipos` passou na aplicação e nas Cloud Functions. `npm run lint` falhou em dois pontos preexistentes fora dos arquivos alterados: o nome do hook em `ProvedorPoliticaPublicidade.tsx` e a anotação de tipo por `import()` em `DesempenhoEquipePainel.test.tsx`. Há ainda um aviso preexistente de imagem em `PainelDesempenhoPrincipal.tsx`.

Arquivos de implementação alterados: contratos e esquemas de microfluxo; novo serviço de domínio `conclusaoMicrofluxo.ts`; executor e vitrine pública; novo `EditorConclusaoMicrofluxo.tsx` e sua integração no gerenciador e na página do painel; nova rota de experiência pública; leitor público; validação sintática do identificador de atribuição; e validação de destinos na publicação transacional. Foram adicionadas suítes de domínio, componentes, rota e leitura pública, e estendidos os testes da publicação transacional.

Validação da integração ao editor visual: 28 testes relacionados passaram; lint dos arquivos alterados e verificação de tipos aprovados.
