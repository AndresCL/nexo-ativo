# Fluxo — Presença Digital Editorial & Microfluxos Comerciais

SaaS brasileiro de presença digital editorial premium combinado com experiências interativas (microfluxos), portfólio, catálogo compartilhado, cartões digitais para equipes e continuidade comercial real.

## Diretrizes Inegociáveis do Repositório

1. **Domínio 100% em Português Brasileiro (pt-BR):** Nomes de entidades, variáveis, funções, componentes próprios, coleções do Firestore, Cloud Functions, validações, testes e documentação seguem rigorosamente `pt-BR` (identificadores sem acentos; textos visíveis com acentuação impecável). Termos em inglês existem apenas onde exigidos pelas ferramentas ou APIs externas, sempre isolados na camada de infraestrutura.
2. **Desenho Orientado a SOLID:** Responsabilidade única por caso de uso (`SRP`), extensão por composição/estratégia (`OCP`), contratos substituíveis (`LSP`), interfaces segregadas por ator (`ISP`) e inversão de dependência frente a provedores externos (`DIP`).
3. **Separação Estrita de Pagamentos:** O **Asaas** cobra exclusivamente os assinantes do próprio SaaS (planos Pro, Equipe e Implantação). O Pix exibido por assinantes aos seus visitantes finais é manual e estático.

## Requisitos de Ambiente

- **Node.js:** `24.x` LTS (declarado em `.nvmrc`).
- **Java Runtime (apenas para Firebase Emulator Suite):** JDK `21+` exigido pelo `firebase-tools 15.x` (localizado em `/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin` neste ambiente macOS).
- **Firebase CLI:** `firebase-tools 15.x` disponível no `PATH`.

## Comandos Principais

```bash
# Instalar dependências (aplicação web e Cloud Functions)
npm install
npm --prefix funcoes install

# Emuladores locais com carregamento e salvamento dos dados
npm run emuladores

# Servidor de desenvolvimento local (em outro terminal)
npm run dev

# Salvar os dados durante os testes, com os emuladores em execução
npm run emuladores:salvar

# Verificação estrita de tipos (Web + Cloud Functions)
npm run verificar-tipos

# Lint e formatação
npm run lint
npm run formatar:verificar

# Suíte de testes unitários e de regras de segurança multi-tenant (Firestore Emulator)
npm run testar
npm run testar:regras

# Compilação de produção (Next.js + Cloud Functions)
npm run funcoes:build
npm run build
```

## Persistência dos Dados Locais

Use `npm run emuladores` para iniciar o projeto local `demo-fluxo`. O comando carrega a exportação de `dados-emulador/` e salva uma nova exportação ao encerrar normalmente com `Ctrl+C`. Aguarde a conclusão do salvamento antes de fechar o terminal. Na primeira execução, se a pasta ainda não existir, os emuladores começam vazios.

A exportação preserva os dados dos serviços emulados que suportam esse recurso, incluindo Firestore, usuários do Authentication e arquivos do Storage. A pasta `dados-emulador/` já está no `.gitignore`.

Execute `npm run emuladores:salvar` para atualizar a exportação enquanto os emuladores estão rodando. Um encerramento forçado pode perder as alterações posteriores ao último salvamento. Se os emuladores foram iniciados pelo comando antigo, salve antes de encerrá-los e use `npm run emuladores` na próxima inicialização para ativar o salvamento na saída.

O carregamento depende de uma exportação existente. Ele não recupera dados perdidos antes do primeiro salvamento nem recria os clientes de teste.

Os testes de regras do Firestore usam o projeto separado `demo-fluxo-regras`, para que a limpeza de dados dos testes preserve o projeto de desenvolvimento `demo-fluxo`.

Para recuperar a base histórica da Garage 88 em um emulador vazio, execute `npm run recuperar:garage88` e depois `npm run emuladores:salvar`. Esse comando exige o projeto local `demo-fluxo`, preserva registros existentes e valida os dados com os esquemas atuais. Ele repõe a vitrine, o rascunho, o acervo, seis ações e o acesso ao painel com a conta local `admin@garage88.com.br` (senha inicial `garage88@123`). Personalizações posteriores e solicitações anteriores dependem de uma exportação salva. Use `npm run recuperar:garage88 -- --validar` para conferir os dados sem gravar no emulador.

## Chamadas editoriais

Em **Painel → Aparência → Identidade e texto**, configure de uma a três chamadas editoriais, cada uma com sobretítulo, título e descrição. A vitrine e a prévia usam o mesmo carrossel: os textos entram suavemente da esquerda para a direita, e os pequenos pontos clicáveis preenchem na mesma direção. O autoplay avança a cada oito segundos e continua após clicar nos pontos ou passar o cursor sobre o texto. A troca pausa com a aba oculta e reinicia ao retornar. A preferência por movimento reduzido desativa os efeitos visuais e mantém a troca automática. A primeira chamada continua sendo a referência para o SEO quando não há metadados personalizados.

Para aplicar as três campanhas da Garage 88 a uma base local já existente, execute `npm run atualizar:chamadas-garage88` e depois `npm run emuladores:salvar`. A atualização altera somente as chamadas e a data do rascunho e da vitrine no emulador `demo-fluxo`. Use `-- --validar` para validar sem gravar.

## Documentação Viva (`docs/`)

- [Avaliações do Google: configuração e operação](docs/avaliacoes-google.md)

- [Visão do Produto](docs/visao-produto.md)
- [Arquitetura e SOLID](docs/arquitetura.md)
- [Modelagem de Dados Firestore](docs/modelagem-dados.md)
- [Segurança e Multi-Tenancy](docs/seguranca.md)
- [Motor de Microfluxos e Cálculos](docs/microfluxos.md)
- [Design System Editorial](docs/design-system.md)
- [Planos e Cobrança (Asaas vs Pix Manual)](docs/planos-e-cobranca.md)
- [Plano de Implementação por Fases](docs/plano-implementacao.md)
- [Critérios de Aceite](docs/criterios-de-aceite.md)
- [Registro de Decisões Arquiteturais (ADR)](docs/registro-decisoes.md)

## Atualização dos percursos da Garage 88

Execute `npm run atualizar:microfluxos-garage88 -- --validar` para revisar e `npm run atualizar:microfluxos-garage88` para atualizar os quatro rascunhos locais com backup prévio. A publicação continua pelo painel. Veja [os percursos e as regras da atualização](docs/fluxos-garage88.md).
