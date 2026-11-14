# Composição livre dos microfluxos

A barra principal do editor oferece **Etapa livre**, **Modelos de etapa** e **Finalização**. Pergunta, Formulário e Contato deixam de ser categorias fixas da barra. Os modelos criam composições editáveis com os mesmos elementos da etapa livre.

Cada etapa pode combinar elementos ordenados:

- Texto explicativo, preservando quebras de linha.
- Imagem HTTPS com descrição acessível.
- Campos de texto curto/longo, número, moeda, data, e-mail, telefone, sim/não e seleções.
- Escolhas únicas ou múltiplas, com rótulos, descrições e adicionais comerciais quando permitidos pela política.
- Catálogo de produtos, serviços ou ambos, ligado ao acervo publicado.
- Seleção da equipe publicada.

O editor permite editar, mover e remover os elementos, inclusive os campos provenientes dos passos antigos de contato. O painel ocupa a área do diagrama no celular e pode ser fechado para voltar ao percurso. Os modelos de pergunta, contato, catálogo e equipe são atalhos para composições; não bloqueiam a adição de outros elementos.

## Dados de contato

Contato passa a ser uma finalidade de campo: nome, telefone, e-mail ou mensagem para atendimento. Os rótulos, tipos, obrigatoriedade e posição são editáveis. Para gerar uma solicitação pelo contrato atual, o percurso precisa obter nome e telefone válidos; campos comuns não passam a ser contato apenas por terem nomes parecidos.

O contato é reconstituído no fim do percurso a partir dos campos efetivamente percorridos. Dados de ramos abandonados não são utilizados. Os campos identificados como contato usam os atributos existentes da solicitação, sem duplicá-los no histórico de respostas. A conclusão continua aguardando confirmação do backend quando existe solicitação a registrar.

## Caminhos e compatibilidade

O mesmo motor DAG suporta `etapa_livre` e os tipos históricos. Uma escolha única pode direcionar cada alternativa para outra etapa, seguir o caminho padrão ou encerrar na finalização. A etapa pode conter outros elementos antes e depois dessa escolha. Uma única escolha por etapa define o desvio; escolhas múltiplas coletam preferências e seguem o caminho padrão. O backend continua bloqueando ciclos, destinos inexistentes, identificadores repetidos e configuração ambígua de desvio.

O editor abre seleções, formulários, entradas de texto, catálogo, equipe e coleta de contato existentes como composições editáveis. Ao editar esses passos, preserva seus IDs e destinos. Passos especializados de Pix e recomendação mantêm os controles e a execução especializados existentes. As versões já publicadas e as solicitações históricas não são migradas.

As referências existentes do resumo continuam válidas após a conversão. As opções comerciais preservam os adicionais em centavos e suas associações de recomendação. O demonstrativo continua usando a calculadora compartilhada; a composição não introduz outro cálculo. Cada seleção composta registra seu identificador no mapa de respostas existente, permitindo resumir escolhas de etapas distintas sem substituir a anterior pelo último item selecionado.

A política profissional também se aplica aos elementos compostos. A projeção pública remove campos monetários quando não permitidos, restringe produtos e mantém a sanitização do acervo. Imagens aceitam HTTPS sem credenciais; textos são renderizados como texto, sem HTML executável.

## Finalização

A finalização permanece no mesmo editor e admite texto e imagem ordenáveis, além do título, mensagem, resumo e zero a duas ações já configuráveis. A prévia inclui os conteúdos adicionais. A finalização não coleta novas respostas após confirmar uma solicitação.

## Garage 88 e validação

Os quatro rascunhos guiados atuais foram convertidos com `npm run atualizar:microfluxos-garage88 -- --composicao-livre`. Essa opção converte o estado existente sem recarregar os modelos nem substituir personalizações. O script cria backup antes da gravação e mantém o acervo publicado intacto. A mesma opção com `--validar` verifica a conversão sem gravar.

As suítes cobrem composição mista, reordenação, edição de contato antigo, bifurcações, finalização, registro com confirmação do backend, dados de ramos abandonados, preservação das seleções por etapa, políticas profissionais, publicação versionada e os percursos da Garage 88. A aplicação e as funções passam pela verificação de tipos e as funções são recompiladas para uso no emulador.

Validação local concluída: **376 testes passaram** em 66 arquivos; `npm run verificar-tipos` passou na aplicação e nas funções; lint dos arquivos alterados aprovado; `npm run funcoes:build` recompilou o backend do emulador. A verificação da conversão retornou zero rascunhos pendentes e a exportação dos emuladores foi salva.

A conferência visual automatizada no Chrome ficou pendente: o acesso pela conta de demonstração não concluiu a navegação para o painel. Os testes de componentes verificam os controles e a execução mista, mas não substituem essa conferência visual autenticada. Nenhuma alteração foi salva ou publicada pelo navegador.

## Início, cards e conexões manuais

O diagrama possui um nó visual **Início**, sem criar uma etapa de execução ou alterar o motor. Sua conexão define a referência `etapaInicialId`. Desconectar essa linha deixa a primeira etapa pendente de definição.

Uma experiência nova começa vazia, com somente esse nó no canvas, e fica oculta até ser preparada para publicação. Etapas livres e modelos são adicionados soltos, sem definir a entrada, conectar a última etapa ou criar uma saída automática para etapas fora do percurso. A finalização pode ser aberta pela barra do editor.

Os cards mostram o tipo derivado de sua composição atual (pergunta, formulário, catálogo, equipe, dados para retorno, conteúdo ou composição mista). Quando há origem de modelo registrada, ela também é exibida. Essa origem permanece como informação de criação mesmo após combinar novos elementos.

Cada alternativa de escolha única tem uma saída visual identificada. Arrastar essa saída configura somente o destino daquela alternativa; arrastar o caminho padrão configura a continuação comum. As alternativas podem seguir etapas diferentes, reunir-se em um mesmo destino ou terminar na finalização. As seleções múltiplas coletam várias preferências e continuam pelo caminho padrão. O espaçamento dos cards considera a quantidade de saídas.

Rascunhos podem ser salvos vazios ou com etapas soltas. A validação de esquema e o isolamento da organização continuam ativos no salvamento. A validação completa do DAG permanece obrigatória na publicação, tanto no painel quanto no backend. Não é permitido publicar uma experiência ativa vazia, sem entrada, com ciclos ou etapas inalcançáveis.

Validação desta evolução: **395 testes passaram**, com tipos da aplicação e das funções aprovados; funções recompiladas e lint dos arquivos alterados aprovado.

Conexões tracejadas indicam caminhos herdados ou encerramento implícito do percurso. É possível ligar uma caixa solta à finalização antes de conectá-la ao Início; essa escolha é preservada explicitamente no rascunho.

## Remoção de conexões

Excluir uma conexão registra a saída como explicitamente desconectada. Ela não herda outro caminho nem ganha uma ligação automática à finalização. O conector continua disponível para uma ligação manual, inclusive depois de salvar e reabrir o rascunho. A mesma regra vale para conexões que antes eram apenas inferidas a partir do caminho padrão.

As opções distinguem **Sem conexão definida**, **Caminho padrão da etapa** e um destino explícito. Conectar novamente limpa a marca de desconexão. Apagar uma saída individual preserva os caminhos das outras respostas. Etapas novas também começam com a saída padrão desconectada.

A execução não confirma conclusão nem registra solicitação por uma saída desconectada. A publicação sinaliza conexões pendentes que podem ser utilizadas pelo visitante. Uma pergunta obrigatória com todas as alternativas explicitamente ligadas não precisa utilizar sua saída padrão. Configurações históricas sem as novas marcas mantêm o comportamento anterior até serem editadas.

Validação da correção: **400 testes passaram**; tipos, lint dos arquivos alterados e compilação das funções aprovados. Os testes incluem apagar, salvar/reabrir, manter a saída livre e conectá-la a outro destino.

## Cabeçalho compacto durante a execução

Nos modais e bottom sheets, o título principal e o nome acessível do diálogo passam a ser a pergunta da etapa atual. O nome da experiência aparece em texto menor acima. A linha abaixo reúne o progresso e a instrução: `Passo 6: Usaremos seus dados para retornar sobre esta solicitação.` Quando não há instrução, mostra somente o número do passo.

O cabeçalho deixa de repetir o nome da organização e a descrição geral da experiência. A pergunta não ganha um segundo cabeçalho no corpo. Rótulos de campos e legendas que repetem exatamente essa pergunta ficam visualmente ocultos e continuam disponíveis para leitores de tela. Perguntas diferentes dentro de uma composição mista mantêm seus rótulos.

Validação: 17 testes relacionados passaram; as verificações de tipos e lint dos arquivos alterados foram aprovadas. A troca de etapas atualiza o título e a descrição acessíveis do diálogo.

Cada card de experiência com percurso guiado tem seu próprio botão **Copiar permalink**, independente da seleção do editor. Ele copia o endereço absoluto da rota pública estável com identificador neutro, sem exigir abrir a finalização ou alterar o conteúdo. O link leva à home da vitrine com a experiência publicada aberta no modal ou bottom sheet; ao fechar, o visitante continua na home. Os endereços anteriores em `/experiencias/` redirecionam para essa mesma entrada, preservando os parâmetros de origem; salvar um rascunho não modifica essa versão. A cópia utiliza a notificação compartilhada de sucesso ou falha da área de transferência.
