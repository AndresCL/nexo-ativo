// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAutoSalvamentoBriefing } from "@/componentes/fundador/hooks/useAutoSalvamentoBriefing";
import type { BriefingImplantacaoFundador } from "@/dominio/fundador/briefingImplantacao";
import type { PortaBriefingFundadorCliente } from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";

function criarBriefingSalvo(
  sobreportes: Partial<BriefingImplantacaoFundador> = {},
): BriefingImplantacaoFundador {
  return {
    organizacaoId: "org-1",
    sobreNegocio: "",
    conteudoEServicos: "",
    experienciasEAcoes: "",
    identidadeVisualEMateriais: "",
    pendenciasEProximosPassos: "",
    previsaoEntregaData: null,
    criadoEmIso: "2026-11-26T12:00:00.000Z",
    atualizadoEmIso: "2026-11-26T12:05:00.000Z",
    atualizadoPor: "uid-fundador",
    ...sobreportes,
  };
}

describe("useAutoSalvamentoBriefing", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("não cria documento vazio quando o briefing não existe e nada relevante foi digitado", async () => {
    const servico: PortaBriefingFundadorCliente = {
      obterBriefingImplantacao: vi.fn().mockResolvedValue(null),
      salvarBriefingImplantacao: vi.fn().mockResolvedValue(null),
    };

    const { result } = renderHook(() =>
      useAutoSalvamentoBriefing({
        organizacaoId: "org-1",
        servico,
        atrasoDebounceMs: 50,
      }),
    );

    await waitFor(() => expect(result.current.carregandoInicial).toBe(false));

    act(() => {
      result.current.atualizarCampo("sobreNegocio", "   ");
    });

    const ok = await act(async () => result.current.salvarAgora());
    expect(ok).toBe(true);
    expect(servico.salvarBriefingImplantacao).not.toHaveBeenCalled();
  });

  it("salva com debounce único após digitação contínua e permite flush imediato", async () => {
    const servico: PortaBriefingFundadorCliente = {
      obterBriefingImplantacao: vi.fn().mockResolvedValue(null),
      salvarBriefingImplantacao: vi.fn().mockImplementation(async (params) =>
        criarBriefingSalvo({
          sobreNegocio: params.sobreNegocio,
          atualizadoEmIso: "2026-11-26T13:00:00.000Z",
        }),
      ),
    };

    const { result } = renderHook(() =>
      useAutoSalvamentoBriefing({
        organizacaoId: "org-1",
        servico,
        atrasoDebounceMs: 500,
      }),
    );

    await waitFor(() => expect(result.current.carregandoInicial).toBe(false));

    act(() => {
      result.current.atualizarCampo("sobreNegocio", "Primeira linha");
      result.current.atualizarCampo("sobreNegocio", "Primeira linha\nSegunda linha");
    });

    expect(result.current.estadoSalvamento).toBe("pendente");

    const salvo = await act(async () => result.current.salvarAgora());
    expect(salvo).toBe(true);
    expect(servico.salvarBriefingImplantacao).toHaveBeenCalledTimes(1);
    expect(servico.salvarBriefingImplantacao).toHaveBeenCalledWith(
      expect.objectContaining({
        organizacaoId: "org-1",
        sobreNegocio: "Primeira linha\nSegunda linha",
      }),
    );
    expect(result.current.estadoSalvamento).toBe("salvo");
    expect(result.current.atualizadoEmIso).toBe("2026-11-26T13:00:00.000Z");
  });

  it("preserva o conteúdo digitado e sinaliza erro quando a persistência falha", async () => {
    const servico: PortaBriefingFundadorCliente = {
      obterBriefingImplantacao: vi.fn().mockResolvedValue(null),
      salvarBriefingImplantacao: vi.fn().mockRejectedValue(new Error("Falha de rede")),
    };

    const { result } = renderHook(() =>
      useAutoSalvamentoBriefing({
        organizacaoId: "org-1",
        servico,
        atrasoDebounceMs: 50,
      }),
    );

    await waitFor(() => expect(result.current.carregandoInicial).toBe(false));

    act(() => {
      result.current.atualizarCampo("conteudoEServicos", "Consultoria estratégica");
    });

    const salvo = await act(async () => result.current.salvarAgora());
    expect(salvo).toBe(false);
    expect(result.current.estadoSalvamento).toBe("erro");
    expect(result.current.mensagemErroSalvamento).toBe("Falha de rede");
    expect(result.current.dados.conteudoEServicos).toBe("Consultoria estratégica");
  });
});

