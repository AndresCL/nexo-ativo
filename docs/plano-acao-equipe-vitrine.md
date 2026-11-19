# Plano: ação de equipe com título livre e avatares

Status: implementado localmente, com título livre, amostra de avatares, posição por dispositivo e prévia integrada. O texto abaixo registra as decisões e a distribuição das responsabilidades da implementação.

A ação `secao_equipe` / `#equipe` exibe o título livre configurado, subtítulo opcional e avatares sobrepostos sem borda. O limite é opcional: vazio mostra todos; preenchido, acrescenta o contador dos membros restantes. Todo o conjunto abre a gaveta existente. O painel já oferece foto ou iniciais em `AvatarProfissional` e apresentação inferior/lateral em `PainelEditorialPublico`.

## Crítica da abordagem inicial

1. **Aleatoriedade por sessão custa mais do que parece.** `Math.random()` no render, inclusive em inicializadores de estado, pode produzir resultados diferentes no servidor e no navegador. Sortear depois da montagem pode trocar as fotos à vista do visitante. Proposta para a primeira entrega: seleção pseudoaleatória determinística, usando organização e conjunto de IDs ativos. A mesma equipe produz a mesma amostra em todas as composições e na prévia; a seleção pode mudar quando a composição da equipe mudar. Isso oferece variedade sem rotação entre visitas. Rotação por visita exigiria uma semente compartilhada entre servidor e cliente e uma decisão sobre o cache da vitrine.
2. **Avatares podem sugerir contatos individuais.** Um título explícito e uma seta discreta indicam que o conjunto abre a equipe completa. Haverá um único controle de teclado; as fotos não terão ações individuais nem serão anunciadas como uma sequência de botões.
3. **O título já está modelado, mas a edição tem uma inconsistência.** O painel altera `titulo` e `rotuloBotaoHome` juntos; a lista de experiências e a vitrine priorizam o rótulo, enquanto o editor mostra apenas `titulo`. Para a ação de equipe, o editor deve mostrar `rotuloBotaoHome || titulo` e continuar salvando ambos. O campo será identificado como “Título na vitrine”. O esquema já limita o rótulo a 80 caracteres; a edição precisa respeitar esse limite.
4. **Uma apresentação leve ainda precisa de contraste e alvo de toque.** Remover o fundo pesado exige validar leitura sobre fotos e vídeos. Usar tokens da paleta, área de toque mínima de 48px e foco visível. O destaque continua representado por ordem e ênfase tipográfica, com tratamento discreto.
5. **A prévia atual não tem os dados necessários.** `EditorGuiadoAparencia` recebe somente a configuração da página. Não recebe profissionais nem resolve as ações das experiências com `resolverAcoesVitrineComMicrofluxos`, como faz a vitrine. Acrescentar somente avatares no site deixaria a prévia incompleta.
6. **Reutilização precisa preservar responsabilidades.** A seleção pertence a uma função pura; sobreposição e contador pertencem ao grupo de avatares; semântica e acionamento pertencem à ação. A navegação só escolhe a apresentação. A gaveta e o cartão individual continuam com suas responsabilidades atuais.

## Comportamento definido

- Título: texto livre já configurado na experiência, inclusive “Converse com nossa equipe”, “Equipe disponível” ou “Entre em contato conosco”. Não substituir títulos existentes por uma frase fixa.
- Subtítulo: aproveitar `subtituloBotaoHome`, opcional, com quebra de linha natural.
- Composição: título acima dos avatares, com subtítulo quando preenchido; fotos de 40px, sem borda e com sobreposição discreta. O limite opcional é configurado por ação; sem limite, todos aparecem. O grupo quebra em linhas e respeita o alinhamento da navegação em cada tamanho de contêiner.
- Contador: `max(0, totalAtivos - quantidadeExibida)`. Aparece somente quando positivo; com limite de três, quatro pessoas geram três avatares e `+1`.
- Foto ausente: iniciais pelo componente existente. Não dar preferência a membros com foto. Queda de carregamento de uma URL deve oferecer o mesmo fallback.
- Uma pessoa: um avatar, com o mesmo título livre. O contador aparece apenas quando o limite preenchido deixa integrantes fora do grupo.
- Equipe conhecida e vazia: ocultar o convite na vitrine. Links diretos `#equipe` continuam abrindo o estado vazio já existente na gaveta.
- Dados de equipe não fornecidos em um consumidor legado: manter a ação textual atual. Ausência de dados e equipe vazia são estados diferentes.
- Por padrão, a ação ocupa sua posição original na navegação. A posição pode ser escolhida separadamente para desktop e mobile, conforme a seção a seguir. Filtrar ações de equipe vazia antes de calcular a apresentação das ações visíveis, evitando contêineres vazios.
- Clique em título, fotos ou contador: uma chamada ao manipulador atual, preservando `clique_acao_home` e a abertura da seção `equipe`.
- Abertura: reutilizar o bottom sheet abaixo de `sm` e o painel lateral a partir de `sm`, conforme o componente atual.
- Acessibilidade: título como nome do controle, descrição da quantidade de integrantes e `aria-haspopup="dialog"` no botão que efetivamente abre a gaveta. Fotos decorativas no contexto desse controle. Escape, foco dentro do diálogo e retorno ao acionador ao fechar. Ao avançar da gaveta para um perfil ou microfluxo, preservar o foco do destino em vez de devolvê-lo ao convite.
- “Equipe disponível” é texto editorial livre. A funcionalidade não calcula presença online nem acrescenta indicadores de disponibilidade.
- O título livre é o convite na vitrine. O cabeçalho da gaveta continua “Nossa Equipe”.

## Limite opcional de avatares

O campo “Limite de avatares (opcional)” aceita inteiros positivos. Sem valor, todos os integrantes ativos aparecem, em linhas quando necessário. A seleção conserva uma ordem estável; cada ação aplica seu próprio limite sobre a lista de dados visuais. O grupo e o contador não têm borda.

`limiteAvataresEquipe` é opcional em `DefinicaoMicrofluxo` e `ItemAcaoHome`. O esquema compartilhado `esquemaLimiteAvataresEquipe.ts` aceita inteiro positivo ou `null`. O painel grava `null` ao apagar um limite, permitindo limpar o valor também nas escritas com merge; `null` e ausência significam mostrar todos. O resolvedor transporta o campo para a ação, e o ciclo de publicação o mantém no histórico. A leitura da prévia fornece os dados visuais de todos os integrantes para permitir limites diferentes por ação.

Essa atualização foi validada com 70 testes direcionados, verificação de tipos, lint e compilação das funções. Outros 36 cenários no navegador cobriram limites e ausência de limite, até 20 integrantes, três composições e larguras de 320px, 390px e 1440px; não houve borda nem transbordamento horizontal.

## Posição do bloco por dispositivo

A posição faz parte da configuração da ação de equipe. O título e a ação continuam os mesmos em todas as posições. A configuração terá duas escolhas independentes:

| Dispositivo | Opções                                                            | Padrão para ações existentes  |
| ----------- | ----------------------------------------------------------------- | ----------------------------- |
| Desktop     | Na posição da lista de ações; na coluna lateral da apresentação.  | Na posição da lista de ações. |
| Mobile      | Na posição da lista de ações; acima do primeiro botão.            | Na posição da lista de ações. |

**Avaliação visual:** na coluna lateral no desktop, a equipe acompanha a apresentação da marca e libera espaço na coluna de ações. Na lista, acompanha as demais opções comerciais e respeita sua ordem. No mobile, acima do primeiro botão aumenta a exposição da equipe e também acrescenta altura antes da ação principal; manter a posição da lista preserva a prioridade comercial definida no painel. As opções ficam explícitas, sem reposicionamento automático baseado no texto do título.

A posição lateral no desktop fica logo após o complemento de avaliações, dentro da apresentação principal. Não será uma seção abaixo de toda a primeira tela. No Retrato, precede a barra de redes sociais. Na Galeria, fica ao lado da obra em exposição, e não ao final da imagem. No mobile, “acima do primeiro botão” corresponde ao início da região de ações, após o complemento de avaliações quando presente.

Regras de distribuição:

- Guardar `posicionamentoEquipe?: { desktop?: "lista_acoes" | "abaixo_hero"; mobile?: "lista_acoes" | "antes_acoes" }` em `DefinicaoMicrofluxo` e `ItemAcaoHome`, com tipo compartilhado e campos opcionais.
- Resolver cada dispositivo ausente para `lista_acoes`. Publicações antigas mantêm sua posição. Configuração de equipe não se aplica aos outros tipos de ação.
- Posicionamento é independente de `destaquePrimarioHome`: mover o bloco não altera a ordem salva nem promove outra experiência a destaque. Ao retornar à lista, a ação reaparece no lugar definido por sua ordenação.
- Renderizar o convite no local selecionado, com somente uma ocorrência visível e acessível por tamanho de contêiner. Quando o bloco estiver fora da lista, ele deixa de ocupar uma linha nela naquele tamanho.
- O breakpoint acompanha as container queries existentes da composição (`@5xl`), inclusive na prévia de 390px dentro de uma janela desktop. O breakpoint da gaveta permanece próprio (`sm`).
- Resolver visibilidade com CSS e dados estáveis, preservando SSR. Caso a composição exija pontos de montagem separados, usar visibilidade complementar e identificadores próprios, sem dois controles acessíveis ao mesmo tempo. Não usar `window.innerWidth` durante o render para escolher a posição.
- O bloco anterior às ações participa da mesma região visual de navegação. O bloco na coluna lateral fica alinhado à área complementar da composição. A regra deve funcionar também quando equipe for a única ação.
- Clique em qualquer posição mantém o ID da ação e a telemetria existente. Ao fechar a gaveta depois de redimensionar a tela, devolver foco ao acionador atualmente visível ou a um destino de foco válido da vitrine.
- Equipe conhecida e vazia não deixa espaçadores em nenhum local. Dados de equipe ausentes mantêm a ação textual de compatibilidade na lista.
- Os seletores “Posição no desktop” e “Posição no celular” aparecem somente para `secao_equipe` no painel. A prévia usa os mesmos valores e o mesmo componente visual da vitrine.

## Arquivos novos

Além dos arquivos abaixo, criar `src/dominio/editorial/posicionamentoEquipeVitrine.ts` para o contrato e a resolução pura das posições, e `src/validacoes/esquemaPosicionamentoEquipeVitrine.ts` para compartilhar os enums opcionais entre os dois esquemas persistidos. As composições e a navegação consomem a mesma resolução.

| Arquivo                                                    | Responsabilidade                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/dominio/editorial/previaEquipeVitrine.ts`             | Definir o resumo de apresentação: filtrar ativos, deduplicar por ID e ordenar em cópia, de forma estável. Retornar total e somente ID, nome, foto e ponto focal de todos os integrantes. O grupo visual aplica o limite opcional da ação.      |
| `src/componentes/editorial/GrupoAvataresEquipe.tsx`        | Renderizar sobreposição e `+N`, reutilizando `AvatarProfissional`. Conteúdo visual sem manipulação de abertura ou consulta de dados.                                                                                                           |
| `src/componentes/editorial/AcaoEquipeVitrine.tsx`          | Exibir título livre, subtítulo e grupo. Um botão quando há manipulador de abertura; link `#equipe` no modo de navegação por URL. Receber resumo, ação e tratamento de destaque. Encaminhar o elemento acionador para permitir retorno de foco. |
| `src/infraestrutura/painel/leitorPreviaVitrineServidor.ts` | Carregar somente profissionais e experiências para a prévia autenticada, com os esquemas existentes. Chamada após obter o contexto autorizado da organização na página de aparência. Devolver a amostra visual e as experiências ativas.       |

## Arquivos existentes: apresentação e interação

| Arquivo                                                    | Mudança planejada                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/componentes/editorial/NavegacaoAcoesHome.tsx`         | Receber `previaEquipe` opcional e escolher `AcaoEquipeVitrine` para tipo `secao_equipe` ou destino `#equipe`. Usar `identificarSecaoPorHash` existente para reconhecer o hash. Preservar rótulo, ordem e manipulador. Omitir equipe conhecida e vazia antes do mapeamento.                  |
| `src/componentes/editorial/ComposicaoImersiva.tsx`         | Acrescentar `previaEquipe` ao contrato compartilhado e encaminhá-lo à navegação. Ajustar o tipo do callback para receber opcionalmente o botão acionador.                                                                                                                                   |
| `src/componentes/editorial/ComposicaoRetratoEditorial.tsx` | Encaminhar a mesma propriedade, sem implementar seleção ou renderização própria de avatares.                                                                                                                                                                                                |
| `src/componentes/editorial/ComposicaoGaleriaEditorial.tsx` | Encaminhar a mesma propriedade, preservando a composição atual.                                                                                                                                                                                                                             |
| `src/componentes/editorial/VitrinePublicaInterativa.tsx`   | Construir a amostra a partir de `acervo.profissionais` publicados e do ID da organização; passá-la ao renderizador. Guardar o botão que acionou a gaveta e encaminhar sua referência, liberando-a em transições para perfil ou microfluxo. Reutilizar `aoAcionarItemHome` e sua telemetria. |
| `src/componentes/editorial/GavetaEditorialPublica.tsx`     | Acrescentar a referência opcional do botão de retorno e repassá-la a `PainelEditorialPublico`, que já suporta esse comportamento.                                                                                                                                                           |
| `src/componentes/editorial/AvatarProfissional.tsx`         | Acrescentar fallback de erro de imagem para iniciais, com estado reiniciado quando a URL mudar. Permitir texto/fundo por tokens no grupo, preservando os padrões dos demais usos.                                                                                                           |

`RenderizadorComposicaoEditorial` já encaminha todas as propriedades; seu comportamento atual atende à mudança. O contrato permanece no arquivo existente nesta entrega, evitando uma extração estrutural que não é necessária à funcionalidade.

Com o posicionamento configurável, as três composições também ganham um ponto para o convite na coluna lateral no desktop. A navegação resolve as alternativas “na lista” e “antes das ações” usando as mesmas regras responsivas. O componente `AcaoEquipeVitrine` atende aos diferentes locais; apenas alinhamento e espaçamento dependem do local. A distribuição deve ficar em funções/componentes pequenos, sem repetir as regras de posição nas três composições.

O grupo poderá ser envolvido por um contêiner com `aria-hidden="true"` dentro da ação. Isso permite reutilizar o avatar sem ampliar sua API de acessibilidade apenas para este caso.

## Arquivos existentes: edição e prévia

| Arquivo                                                             | Mudança planejada                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/componentes/painel/catalogo/TituloExperienciaEditavel.tsx`     | Aceitar rótulo acessível, placeholder e limite opcionais, preservando o comportamento padrão e Enter/Escape. A ação de equipe usa “Título na vitrine” e limite de 80 caracteres.                                                                                                                                                                                                               |
| `src/componentes/painel/catalogo/GerenciadorExperienciasPainel.tsx` | Para equipe, mostrar o rótulo efetivo na edição; continuar sincronizando os dois campos existentes. Adaptar o texto do subtítulo para o convite. Ocultar o seletor de ícone nessa ação, preservando seu valor caso o tipo seja trocado depois. Exibir explicação curta sobre título, avatares e abertura da equipe. Receber a quantidade de profissionais ativos para orientar o estado vazio. |
| `src/app/(painel-cliente)/painel/experiencias/page.tsx`             | Passar a quantidade de profissionais ativos que já consta no contexto de catálogo; não requer outra consulta.                                                                                                                                                                                                                                                                                  |
| `src/app/(painel-cliente)/painel/aparencia/page.tsx`                | Após autorizar o contexto existente, carregar os dados específicos da prévia e passá-los ao editor. Evitar carregar serviços, produtos e portfólio apenas para este recurso.                                                                                                                                                                                                                   |
| `src/componentes/painel/editor/EditorGuiadoAparencia.tsx`           | Receber resumo da equipe e experiências. Aplicar `resolverAcoesVitrineComMicrofluxos` à página de prévia e encaminhar o resumo ao alternador. A prévia usa dados salvos do rascunho; a vitrine usa os publicados.                                                                                                                                                                              |
| `src/componentes/editorial/AlternadorPreviaDispositivo.tsx`         | Receber e encaminhar o resumo para o renderizador, preservando o callback informativo já usado na prévia. Alternar dispositivo/composição não muda a seleção dos avatares.                                                                                                                                                                                                                     |

A página pública continua lendo o acervo publicado. O leitor novo atende apenas ao painel autenticado. O resolvedor existente continua sendo a fonte das ações; não haverá uma segunda regra para converter experiências em convites.

O painel de experiências acrescenta os dois seletores de posição para equipe. A prévia de aparência recebe a configuração pela resolução normal das ações e muda o local do convite conforme a largura do contêiner.

## Arquivos existentes: persistência da posição

| Arquivo                                               | Mudança planejada                                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/dominio/microfluxos/tiposMicrofluxo.ts`          | Acrescentar o objeto opcional `posicionamentoEquipe` a `DefinicaoMicrofluxo`, usando o contrato compartilhado.                                               |
| `src/dominio/entidades/paginaPublicada.ts`            | Acrescentar o mesmo objeto opcional a `ItemAcaoHome`. Em `resolverAcoesVitrineComMicrofluxos`, transportá-lo das experiências de equipe às ações resolvidas. |
| `src/validacoes/esquemasMicrofluxo.ts`                | Validar e preservar o objeto opcional ao salvar rascunho e publicar.                                                                                         |
| `src/validacoes/esquemaPaginaPublicada.ts`            | Validar e preservar o objeto opcional em ações configuradas diretamente na página.                                                                           |
| `src/dominio/entidades/rascunhoConfiguracaoPagina.ts` | Conferir e preservar o objeto opcional na hidratação das ações e na conversão do rascunho para conteúdo publicado.                                           |

O backend já importa os esquemas compartilhados e publica as definições das experiências. Verificar que a projeção e o histórico preservam o campo, com teste de integração do ciclo salvar/publicar/ler; ajustar um mapeamento explícito se ele descartar a configuração. Não é necessário alterar as posições das ações existentes no banco.

## Ordem de implementação

1. Implementar os contratos de posição, validação e propagação pelo resolvedor, junto do resumo e da seleção; estabelecer padrões compatíveis e casos de borda.
2. Implementar grupo e ação; integrar à navegação e às três composições.
3. Integrar a vitrine e o retorno de foco da gaveta; verificar os demais acionamentos.
4. Ajustar a edição do título, os seletores de posição e os textos do painel; preservar salvar rascunho e publicar.
5. Alimentar a prévia de aparência com profissionais e experiências e reutilizar o mesmo resumo visual.
6. Executar os testes direcionados e revisar a apresentação responsiva e as paletas.

## Validação prevista

| Arquivo de teste                                                            | Cobertura relevante                                                                                                                                                               |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `testes/unitario/dominio/previaEquipeVitrine.test.ts` (novo)                | Amostra estável com a mesma equipe, inclusive com entrada reordenada; apenas ativos, sem duplicatas, sem mutar a entrada; totais de 0, 1, 3 e vários integrantes.                 |
| `testes/unitario/componentes/AcaoEquipeVitrine.test.tsx` (novo)             | Título arbitrário e subtítulo; contador correto; um controle e uma chamada ao acionador; iniciais para foto ausente ou com erro; link funcional quando não há callback.           |
| `testes/unitario/componentes/CatalogoVitrineECartao.test.tsx`               | Clique nos avatares abre a equipe; Escape fecha e devolve foco; perfil individual continua abrindo pela gaveta; equipe vazia é omitida e o hash direto conserva seu estado vazio. |
| `testes/unitario/componentes/ComposicoesEditoriais.test.tsx`                | Mesmo convite nas três composições; seleção preservada ao alternar o dispositivo da prévia; consumidor sem resumo conserva a ação textual.                                        |
| `testes/unitario/componentes/GerenciadorExperienciasPainel.test.tsx`        | Editar título livre, inclusive quando título e rótulo antigos diferem; Enter/Escape; salvar os campos sincronizados; exibição contextual e estado de equipe vazia.                |
| `testes/unitario/componentes/EditorAparencia.test.tsx`                      | Prévia mostra a ação resolvida das experiências e a amostra recebida; não se limita às ações da configuração de aparência.                                                        |
| `testes/unitario/infraestrutura/leitorPreviaVitrineServidor.test.ts` (novo) | Leitura limitada à organização recebida do contexto autorizado, validação dos documentos, descarte de inativos/inválidos e coleções vazias.                                       |

Revisão visual em contêiner de 390px, tela estreita de 320px e desktop, nas três composições e paletas claras/escuras; título longo e quebra de linha; foco e toque; contador com equipes maiores. Reutilizar as transições existentes e respeitar movimento reduzido.

Cobrir as quatro combinações de posição desktop/mobile nas três composições, inclusive ação única e equipe vazia. Verificar a sequência visual e a de teclado, a ausência de duplicação acessível, a preservação do lugar original ao voltar à lista e o retorno de foco após redimensionar a tela com a gaveta aberta. Validar também o campo no esquema, a hidratação, o resolvedor e sua preservação no ciclo salvar/publicar/ler. A prévia mobile deve mostrar o posicionamento de mobile mesmo aberta em uma janela desktop.

Validação executada: testes direcionados de domínio, componentes, leitura e publicação; `npm run verificar-tipos`; lint dos arquivos alterados e `npm run funcoes:build`. No navegador, 24 cenários de posição cobriram as três composições, as quatro combinações desktop/mobile e os dois tamanhos de tela. Também foram verificados Escape, retorno de foco após redimensionamento, equipe vazia, hash direto, prévia mobile em janela desktop e capturas com paletas clara/escura.

A implementação acrescentou `BlocoEquipeAposHero.tsx`, `ConfiguracaoEquipeVitrine.tsx` e `restaurarFocoAcaoVitrine.ts` para manter distribuição, edição e foco em módulos pequenos. A gaveta repassa um callback de retorno de foco ao painel compartilhado; isso permite encontrar o acionador visível mesmo quando a posição mudou ao redimensionar a tela.

## Compatibilidade e limites da entrega

O armazenamento atual já contém os dados de conteúdo necessários: `titulo`, `rotuloBotaoHome`, `subtituloBotaoHome` e profissionais. A posição por dispositivo acrescenta um objeto opcional aos esquemas existentes, com ausência equivalente à posição na lista, sem migração obrigatória de documentos. O mesmo título livre aparece em qualquer posição independentemente da amostra de fotos.

A amostra é uma chamada visual para a lista completa e não altera a ordem editorial dos membros dentro da gaveta. A contextualização comercial do cartão profissional permanece no fluxo próprio. A mudança visual é automática para ações de equipe, sem acrescentar um seletor de estilos à configuração.
