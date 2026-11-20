import { describe, expect, it } from "vitest";
import { determinarEstadoCicloAssinatura } from "@/dominio/assinaturas/mapeadorCicloAssinatura";
import type { Organizacao } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { RegistroAssinaturaAsaas } from "@/dominio/assinaturas/tiposAssinaturaAsaas";

describe("mapeadorCicloAssinatura (Fonte Única da Verdade do Ciclo)", () => {
  const orgBase: Organizacao = {
    id: "org-1",
    nome: "Studio Teste",
    identificadorPublico: "studio-teste",
    segmentoAtividade: "Design",
    situacao: "ativa",
    resumoDireitosPlano: {
      planoCodigo: "pro",
      situacaoAssinatura: "ativa",
      limiteProfissionaisAtivos: 10,
      limiteEnviosEmailMensal: 300,
      permitePublicacaoPublica: true,
    },
    criadoEmIso: "2026-11-01T00:00:00Z",
    atualizadoEmIso: "2026-11-01T00:00:00Z",
  };

  const assinaturaBase: RegistroAssinaturaAsaas = {
    id: "org-1",
    organizacaoId: "org-1",
    assinaturaAsaasId: "sub-1",
    planoCodigo: "pro",
    valorMensalCentavos: 8700,
    situacaoAsaas: "ACTIVE",
    situacaoInterna: "ativa",
    proximoVencimentoIso: "2099-12-20",
    criadoEmIso: "2026-11-01T00:00:00Z",
    atualizadoEmIso: "2026-11-01T00:00:00Z",
  };

  it("mapeia como ativa_regular quando assinatura está ativa", () => {
    const estado = determinarEstadoCicloAssinatura(orgBase, assinaturaBase);
    expect(estado.tipo).toBe("ativa_regular");
    expect(estado.rotuloBadge).toBe("Ativa e Regular");
    expect(estado.podeGerarNovaAssinatura).toBe(false);
  });

  it("mapeia como cancelada_com_acesso quando cancelada mas com vigência restante", () => {
    const orgCancelada: Organizacao = {
      ...orgBase,
      resumoDireitosPlano: {
        ...orgBase.resumoDireitosPlano,
        situacaoAssinatura: "cancelada",
        vigenciaAteIso: "2099-12-20",
      },
    };
    const estado = determinarEstadoCicloAssinatura(orgCancelada, {
      ...assinaturaBase,
      situacaoInterna: "cancelada",
      situacaoAsaas: "INACTIVE",
    });
    expect(estado.tipo).toBe("cancelada_com_acesso");
    expect(estado.rotuloBadge).toBe("Cancelada (Acesso ativo)");
    expect(estado.vigenciaAteIso).toBe("2099-12-20");
    expect(estado.podeGerarNovaAssinatura).toBe(true);
  });

  it("mapeia como reativacao_pendente quando cancelada mas há nova fatura gerada aguardando pagamento", () => {
    const orgCancelada: Organizacao = {
      ...orgBase,
      resumoDireitosPlano: {
        ...orgBase.resumoDireitosPlano,
        situacaoAssinatura: "cancelada",
        canceladaEmIso: "2026-11-19T00:00:00Z",
        vigenciaAteIso: "2099-12-20",
      },
    };
    const assinaturaReativando: RegistroAssinaturaAsaas = {
      ...assinaturaBase,
      assinaturaAsaasId: "sub-nova-2",
      situacaoInterna: "pendente_contratacao",
      situacaoAsaas: "PENDING",
      urlFaturaOuCheckout: "https://sandbox.asaas.com/i/reativacao",
    };

    const estado = determinarEstadoCicloAssinatura(orgCancelada, assinaturaReativando);
    expect(estado.tipo).toBe("reativacao_pendente");
    expect(estado.rotuloBadge).toBe("Reativação · Aguardando Pagamento");
    expect(estado.urlCheckout).toBe("https://sandbox.asaas.com/i/reativacao");
    expect(estado.podeGerarNovaAssinatura).toBe(false);
  });

  it("mapeia como aguardando_primeiro_pagamento durante onboarding", () => {
    const orgNova: Organizacao = {
      ...orgBase,
      resumoDireitosPlano: {
        ...orgBase.resumoDireitosPlano,
        situacaoAssinatura: "pendente_contratacao",
      },
    };
    const assinaturaNova: RegistroAssinaturaAsaas = {
      ...assinaturaBase,
      situacaoInterna: "pendente_contratacao",
      situacaoAsaas: "PENDING",
      urlFaturaOuCheckout: "https://sandbox.asaas.com/i/onboarding",
    };

    const estado = determinarEstadoCicloAssinatura(orgNova, assinaturaNova);
    expect(estado.tipo).toBe("aguardando_primeiro_pagamento");
    expect(estado.rotuloBadge).toContain("Aguardando Pagamento");
    expect(estado.podeGerarNovaAssinatura).toBe(false);
  });
});

