import type { Firestore } from "firebase-admin/firestore";
import { describe, expect, it } from "vitest";
import {
  criarResumoDireitosPlanoInicial,
  type Organizacao,
  type UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { executarCriacaoAssinaturaAsaas } from "../../../funcoes/src/casos-de-uso/criarAssinaturaOrganizacaoAsaas";
import { executarProcessamentoWebhookAsaasTransacional } from "../../../funcoes/src/casos-de-uso/processarWebhookAsaasTransacional";
import type { PortaProvedorAsaas } from "../../../funcoes/src/asaas/adaptadorAsaasCliente";

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
      where: (campo: string, _op: string, valor: unknown) => ({
        limit: () => ({
          get: async () => {
            const docs: Array<{ data: () => Record<string, unknown> }> = [];
            for (const [caminho, dados] of documentos.entries()) {
              if (caminho.startsWith(`${caminhoColecao}/`) && dados[campo] === valor) {
                docs.push({ data: () => dados });
              }
            }
            return {
              empty: docs.length === 0,
              docs,
            };
          },
        }),
      }),
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
        set: (
          ref: { path: string },
          dados: Record<string, unknown>,
          opcoes?: { merge?: boolean },
        ) => void;
        update: (ref: { path: string }, dados: Record<string, unknown>) => void;
      }) => Promise<T>,
    ): Promise<T> => {
      const transacao = {
        get: async (ref: { path: string }) => ({
          exists: documentos.has(ref.path),
          data: () => documentos.get(ref.path),
        }),
        set: (
          ref: { path: string },
          dados: Record<string, unknown>,
          opcoes?: { merge?: boolean },
        ) => {
          if (opcoes?.merge && documentos.has(ref.path)) {
            documentos.set(ref.path, { ...documentos.get(ref.path), ...dados });
          } else {
            documentos.set(ref.path, dados);
          }
        },
        update: (ref: { path: string }, dados: Record<string, unknown>) => {
          const anterior = documentos.get(ref.path) || {};
          documentos.set(ref.path, { ...anterior, ...dados });
        },
      };

      return executor(transacao);
    },
  };

  return {
    bancoDados: bancoFalso as unknown as Firestore,
    documentos,
  };
}

describe("Integração Asaas: Criação de Assinatura e Webhooks Idempotentes", () => {
  const usuarioProprietario: UsuarioAutenticado = {
    uid: "usr-proprietario",
    email: "proprietario@atelier.com.br",
    nomeExibicao: "Proprietário Atelier",
    fotoUrl: null,
    emailVerificado: true,
    provedoresConectados: ["password"],
  };

  const organizacaoInicial: Organizacao = {
    id: "org-atelier",
    nome: "Atelier Monte Claro",
    identificadorPublico: "atelier-monte-claro",
    segmentoAtividade: "Fotografia Fine Art",
    situacao: "ativa",
    resumoDireitosPlano: criarResumoDireitosPlanoInicial(),
    criadoEmIso: "2026-11-08T10:00:00.000Z",
    atualizadoEmIso: "2026-11-08T10:00:00.000Z",
  };

  const vinculoProprietario = {
    usuarioId: "usr-proprietario",
    organizacaoId: "org-atelier",
    papel: "proprietario",
    situacao: "ativo",
    adicionadoEmIso: "2026-11-08T10:00:00.000Z",
  };

  it("deve criar assinatura recorrente e cobrança avulsa de implantação com persistência atômica", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": organizacaoInicial as unknown as Record<string, unknown>,
      "organizacoes/org-atelier/membros/usr-proprietario": vinculoProprietario,
    });

    const provedorAsaasFalso: PortaProvedorAsaas = {
      obterOuCriarCliente: async () => "cus_mock_123",
      criarAssinatura: async () => ({
        assinaturaAsaasId: "sub_mock_123",
        urlFaturaOuCheckout: "https://sandbox.asaas.com/i/sub123",
        proximoVencimento: "2026-12-08",
        situacao: "ACTIVE",
      }),
      criarCobrancaAvulsaImplantacao: async () => ({
        cobrancaAsaasId: "pay_implantacao_123",
        urlFaturaOuCheckout: "https://sandbox.asaas.com/i/imp123",
        situacao: "PENDING",
      }),
    };

    const resultado = await executarCriacaoAssinaturaAsaas(
      bancoDados,
      usuarioProprietario,
      {
        organizacaoId: "org-atelier",
        planoCodigo: "pro",
        contratarImplantacaoAssistida: true,
        dadosFiscais: {
          nomeOuRazaoSocial: "Atelier Monte Claro Ltda",
          cpfOuCnpj: "12345678000199",
          email: "financeiro@atelier.com.br",
          telefone: "11988887777",
        },
      },
      provedorAsaasFalso,
    );

    expect(resultado.assinaturaId).toBe("sub_mock_123");
    expect(resultado.urlCheckoutOuFatura).toBe("https://sandbox.asaas.com/i/sub123");
    expect(resultado.urlFaturaImplantacao).toBe("https://sandbox.asaas.com/i/imp123");

    const assinaturaSalva = documentos.get("assinaturas/org-atelier");
    expect(assinaturaSalva?.planoCodigo).toBe("pro");
    expect(assinaturaSalva?.contratouImplantacaoAssistida).toBe(true);
    expect(assinaturaSalva?.valorImplantacaoCentavos).toBe(29700);
  });

  it("deve processar webhook PAYMENT_CONFIRMED ativando os direitos do plano em dia e garantindo idempotência", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": organizacaoInicial as unknown as Record<string, unknown>,
      "assinaturas/org-atelier": {
        id: "org-atelier",
        organizacaoId: "org-atelier",
        assinaturaAsaasId: "sub_mock_123",
        planoCodigo: "pro",
        situacaoInterna: "pendente",
      },
    });

    const payloadWebhook = {
      id: "evt_pagamento_confirmado_1",
      event: "PAYMENT_CONFIRMED",
      payment: {
        id: "pay_001",
        customer: "cus_mock_123",
        subscription: "sub_mock_123",
        value: 97.0,
        status: "CONFIRMED",
        billingType: "PIX",
        dueDate: "2026-11-10",
        paymentDate: "2026-11-08",
        invoiceUrl: "https://sandbox.asaas.com/i/pay_001",
        externalReference: "org-atelier",
      },
    };

    const primeiroProcessamento = await executarProcessamentoWebhookAsaasTransacional(
      bancoDados,
      payloadWebhook,
    );

    expect(primeiroProcessamento.processado).toBe(true);
    expect(primeiroProcessamento.duplicado).toBe(false);
    expect(primeiroProcessamento.situacaoAssinaturaAtualizada).toBe("ativa");

    const orgAtualizada = documentos.get("organizacoes/org-atelier") as unknown as Organizacao;
    expect(orgAtualizada.resumoDireitosPlano.situacaoAssinatura).toBe("ativa");
    expect(orgAtualizada.resumoDireitosPlano.permitePublicacaoPublica).toBe(true);

    const cobrancaSalva = documentos.get("organizacoes/org-atelier/cobrancasAsaas/pay_001");
    expect(cobrancaSalva?.valorCentavos).toBe(9700);
    expect(cobrancaSalva?.situacao).toBe("CONFIRMED");

    // Reenvio idêntico do webhook deve ser ignorado pela chave de idempotência
    const segundoProcessamento = await executarProcessamentoWebhookAsaasTransacional(
      bancoDados,
      payloadWebhook,
    );

    expect(segundoProcessamento.processado).toBe(true);
    expect(segundoProcessamento.duplicado).toBe(true);
  });

  it("deve alterar a situação para inadimplente quando o evento for PAYMENT_OVERDUE", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": {
        ...organizacaoInicial,
        resumoDireitosPlano: {
          ...organizacaoInicial.resumoDireitosPlano,
          situacaoAssinatura: "ativa",
        },
      } as unknown as Record<string, unknown>,
    });

    const payloadOverdue = {
      id: "evt_overdue_1",
      event: "PAYMENT_OVERDUE",
      payment: {
        id: "pay_vencido_1",
        customer: "cus_mock_123",
        value: 97.0,
        status: "OVERDUE",
        billingType: "BOLETO",
        dueDate: "2026-11-01",
        externalReference: "org-atelier",
      },
    };

    const resultado = await executarProcessamentoWebhookAsaasTransacional(
      bancoDados,
      payloadOverdue,
    );

    expect(resultado.processado).toBe(true);
    expect(resultado.situacaoAssinaturaAtualizada).toBe("inadimplente");

    const orgAtualizada = documentos.get("organizacoes/org-atelier") as unknown as Organizacao;
    expect(orgAtualizada.resumoDireitosPlano.situacaoAssinatura).toBe("inadimplente");
    expect(orgAtualizada.resumoDireitosPlano.permitePublicacaoPublica).toBe(false);
  });
});
