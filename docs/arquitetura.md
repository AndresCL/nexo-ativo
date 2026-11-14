# Arquitetura do Sistema

## Visão Geral

Monólito modular construído sobre **Next.js App Router** (hospedado no **Firebase App Hosting**) e **Firebase Cloud Functions v2** (`southamerica-east1`), tendo o **Cloud Firestore** como fonte única de verdade persistente.

## Interfaces do Sistema

1. **Vitrine Pública (`src/app/(vitrine-publica)`):** Renderização SSR/ISR otimizada para SEO e compartilhamento social, lendo exclusivamente projeções publicadas (`paginasPublicadas`).
2. **Painel do Assinante (`src/app/(painel-cliente)`):** Área autenticada, intuitiva e livre de jargões técnicos para configuração de aparência, catálogo, equipe, microfluxos, solicitações e assinatura.
3. **Painel Fundador (`src/app/(painel-fundador)`):** Área operacional restrita ao proprietário da plataforma via Custom Claim `papelPlataforma: "fundador"`.
4. **Backend Compartilhado (`funcoes/`):** Cloud Functions v2 responsáveis por operações privilegiadas, publicação validada, registro seguro de solicitações, webhooks do Asaas e envios pelo Resend.

## Princípios SOLID Aplicados

- **SRP:** Casos de uso granulares em `src/aplicacao/casos-de-uso/`, separados de componentes visuais e adaptadores externos.
- **OCP:** Composições editoriais (`imersivo`, `retrato_editorial`, `galeria_editorial`), modalidades de cálculo comercial e etapas do motor de microfluxos extensíveis por contratos padronizados.
- **LSP:** Hierarquia consistente de `ErroDominio` e repositórios substituíveis entre ambiente real e testes.
- **ISP:** Portas de leitura pública estritamente segregadas das portas de escrita de rascunho e administração financeira.
- **DIP:** Domínio e aplicação dependem de interfaces em português; SDKs externos (`firebase`, `resend`, HTTP Asaas) residem em `infraestrutura/` e `funcoes/src/adaptadores/`.

## Empacotamento Compartilhado (`tsup`)

As Cloud Functions em `funcoes/` importam diretamente objetos de valor, regras de domínio e esquemas Zod de `src/dominio/` e `src/validacoes/`, sendo empacotadas em `funcoes/dist/index.js` via `tsup` antes do deploy para garantir compatibilidade integral com o Google Cloud Build sem duplicação de código.

## Notificações da interface

`CentralNotificacoes` é montada uma única vez no layout raiz. As telas chamam `notificar.sucesso(mensagem)`, `notificar.erro(mensagem)`, `notificar.informacao(mensagem)` ou `notificar.aviso(mensagem)`, de `src/componentes/interface/notificacoes/notificar.ts`, sem manter estados locais de toast. A cópia de links e chaves usa `copiarTextoComAviso` da mesma pasta.

Os avisos flutuam no centro superior da tela, com fundos verde para sucesso, vermelho para erro, azul para informação e amarelo para aviso. Persistem durante a navegação e têm fechamento manual. São exibidas até três mensagens, sem duplicar conteúdo do mesmo tipo. Sucessos e informações duram seis segundos; erros e avisos, dez segundos. A contagem pausa enquanto há ponteiro ou foco no aviso. A região acessível permanece montada para anunciar novas mensagens, inclusive com diálogos abertos.

Erros de campo, validação de etapas, progresso de upload, estados de carregamento e telas de conclusão permanecem junto ao conteúdo. Novas operações devem reutilizar a central, sem adicionar banners de sucesso ou erro às páginas.
