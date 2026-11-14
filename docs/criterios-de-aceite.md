# Critérios de Aceite por Fase

## Regras Globais para Avanço de Fase

Nenhuma fase avança caso existam erros de compilação TypeScript (`strict`), falhas de lint, testes obrigatórios reprovados ou identificadores próprios de domínio fora do padrão em português brasileiro.

## Fase 1 — Fundação Técnica

- Aplicação Next.js App Router e pacote `funcoes/` compilam sem erros em TypeScript `strict`.
- ESLint e Prettier aprovados sem pendências.
- Objetos de valor fundacionais (`ValorMonetarioCentavos`, `IdentificadorPublico`, `PontoFocalMidia`), isolamento de estado Zustand SSR-safe e componentes acessíveis aprovados na suíte real do Vitest.
- Build de produção (`npm run build` e `npm run funcoes:build`) concluindo sem erros.
- Regras iniciais do Firestore e Storage configuradas em negação total por padrão até os testes de isolamento da Fase 2.
