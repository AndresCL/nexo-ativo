import { describe, expect, it } from "vitest";
import {
  CATALOGO_PLANOS_FLUXO,
  converterReaisParaCentavosInteiros,
  mapearSituacaoCobrancaParaAssinatura,
} from "@/dominio/assinaturas/tiposAssinaturaAsaas";

describe("Domínio de Assinaturas e Cobrança Asaas", () => {
  it("deve conter catálogo de planos comerciais com valores e regras corretas em centavos", () => {
    const planoPro = CATALOGO_PLANOS_FLUXO.pro;
    const planoEmpresarial = CATALOGO_PLANOS_FLUXO.personalizado;

    expect(planoPro.mensalidadeCentavos).toBe(8700); // R$ 87/mês
    expect(planoPro.limiteProfissionaisAtivos).toBe(10);
    expect(planoPro.limiteEnviosEmailMensal).toBe(300);
    expect(planoPro.valorImplantacaoAssistidaCentavos).toBe(29700); // R$ 297

    expect(planoEmpresarial.nome).toBe("Empresarial");
    expect(planoEmpresarial.mensalidadeCentavos).toBe(0);
    expect(planoEmpresarial.limiteProfissionaisAtivos).toBe(999);
    expect(planoEmpresarial.limiteEnviosEmailMensal).toBe(1000);
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
