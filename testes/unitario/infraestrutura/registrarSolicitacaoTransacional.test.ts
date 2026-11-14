import type { Firestore } from "firebase-admin/firestore";
import { describe, expect, it } from "vitest";
import {
  criarResumoDireitosPlanoInicial,
  type Organizacao,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { executarRegistroSolicitacaoVisitante } from "../../../funcoes/src/casos-de-uso/registrarSolicitacaoVisitanteTransacional";

function criarBancoFirestoreEmMemoria(inicial: Record<string, Record<string, unknown>> = {}) {
  const documentos = new Map<string, Record<string, unknown>>(Object.entries(inicial));

  function criarReferenciaDocumento(caminho: string): Record<string, unknown> {
    const partes = caminho.split("/");
    const id = partes[partes.length - 1] ?? "doc";

    return {
      id,
      path: caminho,
      get: async () => ({
        exists: documentos.has(caminho),
        data: () => documentos.get(caminho),
      }),
      collection: (subcolecao: string) => criarReferenciaColecao(`${caminho}/${subcolecao}`),
    };
  }

  function criarReferenciaColecao(caminhoColecao: string) {
    return {
      doc: (idDoc: string) => criarReferenciaDocumento(`${caminhoColecao}/${idDoc}`),
    };
  }

  const bancoFalso = {
    collection: (nomeColecao: string) => criarReferenciaColecao(nomeColecao),
    runTransaction: async <T>(
      executor: (transacao: {
        get: (ref: { path: string }) => Promise<{
          exists: boolean;
          data: () => Record<string, unknown> | undefined;
        }>;
        set: (ref: { path: string }, dados: Record<string, unknown>) => void;
      }) => Promise<T>,
    ): Promise<T> => {
      const gravacoesPendentes: Array<{ caminho: string; dados: Record<string, unknown> }> = [];
      const transacao = {
        get: async (ref: { path: string }) => ({
          exists: documentos.has(ref.path),
          data: () => documentos.get(ref.path),
        }),
        set: (ref: { path: string }, dados: Record<string, unknown>) => {
          gravacoesPendentes.push({ caminho: ref.path, dados });
        },
      };

      const resultado = await executor(transacao);
      for (const item of gravacoesPendentes) {
        documentos.set(item.caminho, item.dados);
      }
      return resultado;
    },
  };

  return {
    bancoDados: bancoFalso as unknown as Firestore,
    documentos,
  };
}

describe("Caso de Uso Transacional: registrarSolicitacaoVisitante e Anti-Abuso", () => {
  const organizacaoAtiva: Organizacao = {
    id: "org-atelier",
    nome: "Atelier Monte Claro",
    identificadorPublico: "atelier-monte-claro",
    segmentoAtividade: "Fotografia de Arquitetura",
    situacao: "ativa",
    resumoDireitosPlano: criarResumoDireitosPlanoInicial(),
    criadoEmIso: "2026-11-08T10:00:00.000Z",
    atualizadoEmIso: "2026-11-08T10:00:00.000Z",
  };

  const payloadBaseValido = {
    organizacaoId: "org-atelier",
    identificadorPublicoOrganizacao: "atelier-monte-claro",
    microfluxoId: "fluxo-catalogo",
    tituloExperiencia: "Explorar opções e formatos",
    versaoMicrofluxo: 2,
    nomeVisitante: "Clara Mendes",
    telefoneOuWhatsapp: "(21) 99876-5432",
    emailVisitante: "clara@exemplo.com.br",
    produtoId: "prd-atelier-1",
    produtoNome: "Tiragem Fine Art — Casa Monólito I",
    quantidadeComercial: 2,
    respostasRegistradas: [
      {
        etapaId: "etapa-catalogo",
        pergunta: "Escolha o item de seu interesse",
        respostaTexto: "Tiragem Fine Art — Casa Monólito I",
      },
    ],
    demonstrativoComercialCongelado: {
      modalidade: "quantidade_vezes_preco" as const,
      moeda: "BRL" as const,
      linhas: [
        {
          id: "item-quantidade-preco",
          rotulo: "Tiragem Fine Art — Casa Monólito I (2 unid.)",
          quantidade: 2,
          valorUnitarioCentavos: 340000,
          subtotalCentavos: 680000,
        },
      ],
      totalCentavos: 680000,
      resumoFormatado: "R$ 6.800,00",
      versaoMicrofluxo: 2,
      calculadoEmIso: "2026-11-08T15:00:00.000Z",
    },
    chaveIdempotencia: "sol-org-atelier-fluxo-catalogo-21998765432-2026",
  };

  it("deve registrar solicitação com demonstrativo comercial congelado e garantir idempotência em submissões repetidas", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": organizacaoAtiva as unknown as Record<string, unknown>,
    });

    const primeiroEnvio = await executarRegistroSolicitacaoVisitante(bancoDados, payloadBaseValido);
    expect(primeiroEnvio.duplicadaIdempotente).toBe(false);
    expect(primeiroEnvio.solicitacaoId).toBe(payloadBaseValido.chaveIdempotencia);

    const gravada = documentos.get(
      `organizacoes/org-atelier/solicitacoes/${payloadBaseValido.chaveIdempotencia}`,
    );
    expect(gravada?.situacao).toBe("nova");
    expect(gravada?.nomeVisitante).toBe("Clara Mendes");

    // Reenvio idêntico (clique duplo) deve retornar o mesmo protocolo com duplicadaIdempotente = true
    const segundoEnvio = await executarRegistroSolicitacaoVisitante(bancoDados, payloadBaseValido);
    expect(segundoEnvio.duplicadaIdempotente).toBe(true);
    expect(segundoEnvio.solicitacaoId).toBe(primeiroEnvio.solicitacaoId);
  });

  it("deve bloquear submissão automatizada quando o campo honeypot (campoArmadilhaBot) estiver preenchido", async () => {
    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": organizacaoAtiva as unknown as Record<string, unknown>,
    });

    await expect(
      executarRegistroSolicitacaoVisitante(bancoDados, {
        ...payloadBaseValido,
        campoArmadilhaBot: "http://spam-bot.invalid",
      }),
    ).rejects.toThrow(/verificação anti-automação/i);
  });

  it("deve recusar solicitações quando a organização estiver suspensa", async () => {
    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": {
        ...organizacaoAtiva,
        situacao: "suspensa",
      } as unknown as Record<string, unknown>,
    });

    await expect(
      executarRegistroSolicitacaoVisitante(bancoDados, payloadBaseValido),
    ).rejects.toThrow(/não está recebendo solicitações/i);
  });
});
