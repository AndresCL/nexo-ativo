import { describe, expect, it } from "vitest";
import {
  CATALOGO_PLANOS_FLUXO,
  converterReaisParaCentavosInteiros,
  mapearSituacaoCobrancaParaAssinatura,
} from "@/dominio/assinaturas/tiposAssinaturaAsaas";

describe("Domínio de Assinaturas e Cobrança Asaas", () => {
  it("deve conter catálogo de planos comerciais com valores e regras corretas em centavos", () => {
    const planoPro = CATALOGO_PLANOS_FLUXO.pro;
    const planoEquipe = CATALOGO_PLANOS_FLUXO.equipe;

    expect(planoPro.mensalidadeCentavos).toBe(9700); // R$ 97/mês
    expect(planoPro.limiteProfissionaisAtivos).toBe(1);
    expect(planoPro.limiteEnviosEmailMensal).toBe(100);
    expect(planoPro.valorImplantacaoAssistidaCentavos).toBe(29700); // R$ 297

    expect(planoEquipe.mensalidadeCentavos).toBe(19700); // R$ 197/mês
    expect(planoEquipe.limiteProfissionaisAtivos).toBe(5);
    expect(planoEquipe.limiteEnviosEmailMensal).toBe(300);
    expect(planoEquipe.valorImplantacaoAssistidaCentavos).toBe(59700); // R$ 597
  });

  it("deve converter valores decimais em reais para centavos inteiros determinísticos", () => {
    expect(converterReaisParaCentavosInteiros(97)).toBe(9700);
    expect(converterReaisParaCentavosInteiros(197)).toBe(19700);
    expect(converterReaisParaCentavosInteiros(297.5)).toBe(29750);
  });

  it("deve mapear os status de cobrança do Asaas para as situações internas da organização", () => {
    expect(mapearSituacaoCobrancaParaAssinatura("CONFIRMED")).toBe("ativa");
    expect(mapearSituacaoCobrancaParaAssinatura("RECEIVED")).toBe("ativa");
    expect(mapearSituacaoCobrancaParaAssinatura("OVERDUE")).toBe("inadimplente");
    expect(mapearSituacaoCobrancaParaAssinatura("REFUNDED")).toBe("cancelada");
    expect(mapearSituacaoCobrancaParaAssinatura("PENDING")).toBe("pendente_contratacao");
  });
});
