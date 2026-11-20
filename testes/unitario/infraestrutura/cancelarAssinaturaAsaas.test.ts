import type { Firestore } from "firebase-admin/firestore";
import { describe, expect, it, vi } from "vitest";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { RegistroAssinaturaAsaas } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import { executarCancelamentoAssinaturaAsaas } from "../../../funcoes/src/casos-de-uso/cancelarAssinaturaOrganizacaoAsaas";
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
        get: async () => {
          const docs: Array<{ ref: Record<string, unknown>; data: () => Record<string, unknown> }> = [];
          for (const [caminho, dados] of documentos.entries()) {
            if (caminho.startsWith(`${caminhoColecao}/`) && dados[campo] === valor) {
              docs.push({
                ref: criarReferenciaDocumento(caminho),
                data: () => dados,
              });
            }
          }
          return { docs };
        },
      }),
    };
  }

  const batchOperacoes: Array<() => void> = [];

  const bancoFalso = {
    collection: (nomeColecao: string) => criarReferenciaColecao(nomeColecao),
    batch: () => ({
      delete: (ref: { path: string }) => {
        batchOperacoes.push(() => {
          documentos.delete(ref.path);
        });
      },
      update: (ref: { path: string }, dados: Record<string, unknown>) => {
        batchOperacoes.push(() => {
          const anterior = documentos.get(ref.path) || {};
          documentos.set(ref.path, { ...anterior, ...dados });
        });
      },
      set: (ref: { path: string }, dados: Record<string, unknown>, opcoes?: { merge?: boolean }) => {
        batchOperacoes.push(() => {
          if (opcoes?.merge && documentos.has(ref.path)) {
            documentos.set(ref.path, { ...documentos.get(ref.path), ...dados });
          } else {
            documentos.set(ref.path, dados);
          }
        });
      },
      commit: async () => {
        for (const op of batchOperacoes) {
          op();
        }
        batchOperacoes.length = 0;
      },
    }),
  };

  return {
    bancoDados: bancoFalso as unknown as Firestore,
    documentos,
  };
}

describe("Cancelamento de Assinatura Asaas com Administração de Vigência de Datas", () => {
  const usuarioProprietario: UsuarioAutenticado = {
    uid: "usr-proprietario",
    email: "proprietario@studio.com.br",
    nomeExibicao: "Proprietário Studio",
    fotoUrl: null,
    emailVerificado: true,
    provedoresConectados: ["password"],
  };

  const membroProprietario: MembroOrganizacao = {
    usuarioId: "usr-proprietario",
    organizacaoId: "org-studio",
    papel: "proprietario",
    situacao: "ativo",
    adicionadoEmIso: "2026-11-01T10:00:00.000Z",
  };

  const organizacaoPro: Organizacao = {
    id: "org-studio",
    nome: "Studio Aurora",
    identificadorPublico: "studio-aurora",
    segmentoAtividade: "Design",
    situacao: "ativa",
    resumoDireitosPlano: {
      planoCodigo: "pro",
      situacaoAssinatura: "ativa",
      limiteProfissionaisAtivos: 10,
      limiteEnviosEmailMensal: 300,
      permitePublicacaoPublica: true,
    },
    criadoEmIso: "2026-11-01T10:00:00.000Z",
    atualizadoEmIso: "2026-11-01T10:00:00.000Z",
  };

  it("permite ao proprietário cancelar assinatura, remove cobranças pendentes futuras e revoga publicação pública", async () => {
    const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const assinaturaAtiva: RegistroAssinaturaAsaas = {
      id: "org-studio",
      organizacaoId: "org-studio",
      assinaturaAsaasId: "sub-12345",
      planoCodigo: "pro",
      valorMensalCentavos: 8700,
      situacaoAsaas: "ACTIVE",
      situacaoInterna: "ativa",
      proximoVencimentoIso: amanha,
      contratouImplantacaoAssistida: false,
      criadoEmIso: "2026-11-01T10:00:00.000Z",
      atualizadoEmIso: "2026-11-01T10:00:00.000Z",
    };

    const cobrancaFuturaPendente = {
      id: "pay-futura-1",
      organizacaoId: "org-studio",
      cobrancaAsaasId: "pay-futura-1",
      situacao: "PENDING",
      dataVencimentoIso: amanha,
      valorCentavos: 8700,
    };

    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-studio": organizacaoPro as unknown as Record<string, unknown>,
      "organizacoes/org-studio/membros/usr-proprietario": membroProprietario as unknown as Record<string, unknown>,
      "assinaturas/org-studio": assinaturaAtiva as unknown as Record<string, unknown>,
      "organizacoes/org-studio/cobrancasAsaas/pay-futura-1": cobrancaFuturaPendente as unknown as Record<string, unknown>,
    });

    const cancelarAssinaturaMock = vi.fn().mockResolvedValue(undefined);
    const removerCobrancaMock = vi.fn().mockResolvedValue(undefined);
    const provedorAsaasMock: PortaProvedorAsaas = {
      obterOuCriarCliente: vi.fn(),
      criarAssinatura: vi.fn(),
      criarCobrancaAvulsaImplantacao: vi.fn(),
      cancelarAssinatura: cancelarAssinaturaMock,
      removerCobranca: removerCobrancaMock,
    };

    const resultado = await executarCancelamentoAssinaturaAsaas(
      bancoDados,
      usuarioProprietario,
      { organizacaoId: "org-studio" },
      provedorAsaasMock,
    );

    expect(cancelarAssinaturaMock).toHaveBeenCalledWith("sub-12345");
    expect(removerCobrancaMock).toHaveBeenCalledWith("pay-futura-1");
    expect(resultado.situacaoAssinatura).toBe("cancelada");

    // Cobrança futura pendente deve ser removida do banco
    expect(documentos.has("organizacoes/org-studio/cobrancasAsaas/pay-futura-1")).toBe(false);

    const orgAtualizada = documentos.get("organizacoes/org-studio") as unknown as Organizacao;
    expect(orgAtualizada.resumoDireitosPlano.situacaoAssinatura).toBe("cancelada");
    expect(orgAtualizada.resumoDireitosPlano.permitePublicacaoPublica).toBe(false);
    expect(orgAtualizada.resumoDireitosPlano.limiteProfissionaisAtivos).toBe(10);

    const assinaturaAtualizada = documentos.get("assinaturas/org-studio") as unknown as RegistroAssinaturaAsaas;
    expect(assinaturaAtualizada.situacaoInterna).toBe("cancelada");
    expect(assinaturaAtualizada.situacaoAsaas).toBe("INACTIVE");
  });

  it("revoga publicação imediatamente quando assinatura não possuía vencimento futuro pago", async () => {
    const assinaturaPendente: RegistroAssinaturaAsaas = {
      id: "org-studio",
      organizacaoId: "org-studio",
      assinaturaAsaasId: "sub-99999",
      planoCodigo: "pro",
      valorMensalCentavos: 8700,
      situacaoAsaas: "PENDING",
      situacaoInterna: "pendente_contratacao",
      contratouImplantacaoAssistida: false,
      criadoEmIso: "2026-11-01T10:00:00.000Z",
      atualizadoEmIso: "2026-11-01T10:00:00.000Z",
    };

    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-studio": organizacaoPro as unknown as Record<string, unknown>,
      "organizacoes/org-studio/membros/usr-proprietario": membroProprietario as unknown as Record<string, unknown>,
      "assinaturas/org-studio": assinaturaPendente as unknown as Record<string, unknown>,
    });

    const cancelarAssinaturaMock = vi.fn().mockResolvedValue(undefined);
    const provedorAsaasMock: PortaProvedorAsaas = {
      obterOuCriarCliente: vi.fn(),
      criarAssinatura: vi.fn(),
      criarCobrancaAvulsaImplantacao: vi.fn(),
      cancelarAssinatura: cancelarAssinaturaMock,
      removerCobranca: vi.fn(),
    };

    const resultado = await executarCancelamentoAssinaturaAsaas(
      bancoDados,
      usuarioProprietario,
      { organizacaoId: "org-studio" },
      provedorAsaasMock,
    );

    expect(resultado.situacaoAssinatura).toBe("cancelada");
    const orgAtualizada = documentos.get("organizacoes/org-studio") as unknown as Organizacao;
    expect(orgAtualizada.resumoDireitosPlano.situacaoAssinatura).toBe("cancelada");
    expect(orgAtualizada.resumoDireitosPlano.permitePublicacaoPublica).toBe(false);
  });
});

