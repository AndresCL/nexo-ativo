import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  ObservadorDeltaColecao,
  ParametrosObservacaoDeltaOrganizacao,
  PortaObservacaoDeltaColecao,
} from "@/aplicacao/portas/portasReatividade";
import {
  calcularCursorAtualizacaoIso,
  mesclarDeltaColecao,
  useColecaoDeltaTempoReal,
} from "@/ganchos/useColecaoDeltaTempoReal";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import { GerenciadorSolicitacoesPainel } from "@/componentes/painel/solicitacoes/GerenciadorSolicitacoesPainel";

interface ItemExemplo {
  readonly id: string;
  readonly nome: string;
  readonly atualizadoEmIso: string;
}

function criarObservadorControlavel<TItem>() {
  let observadorAtual: ObservadorDeltaColecao<TItem> | null = null;
  let ultimosParametros: ParametrosObservacaoDeltaOrganizacao | null = null;
  const desinscrever = vi.fn();

  const porta: PortaObservacaoDeltaColecao<TItem> = {
    assinarDelta: vi.fn((parametros, observador) => {
      ultimosParametros = parametros;
      observadorAtual = observador;
      return desinscrever;
    }),
  };

  return {
    porta,
    desinscrever,
    obterUltimosParametros: () => ultimosParametros,
    emitirDelta: (itens: readonly TItem[], temEscritasPendentes = false) => {
      observadorAtual?.aoReceberDelta(itens, { temEscritasPendentes });
    },
    emitirErro: (erro: Error) => {
      observadorAtual?.aoErro?.(erro);
    },
  };
}

describe("Reatividade delta em tempo real (useColecaoDeltaTempoReal)", () => {
  it("calcula o maior cursor ISO e mescla deltas preservando ordenação e protegendo escrita local", () => {
    const iniciais: readonly ItemExemplo[] = [
      { id: "1", nome: "Antigo", atualizadoEmIso: "2026-11-20T10:00:00.000Z" },
      { id: "2", nome: "Recente", atualizadoEmIso: "2026-11-22T12:00:00.000Z" },
    ];

    expect(calcularCursorAtualizacaoIso([])).toBeNull();
    expect(calcularCursorAtualizacaoIso(iniciais)).toBe("2026-11-22T12:00:00.000Z");

    const mesclados = mesclarDeltaColecao(
      iniciais,
      [
        { id: "2", nome: "Sobrescrito remoto", atualizadoEmIso: "2026-11-23T09:00:00.000Z" },
        { id: "3", nome: "Novo", atualizadoEmIso: "2026-11-23T10:00:00.000Z" },
      ],
      (a, b) => b.atualizadoEmIso.localeCompare(a.atualizadoEmIso),
      "2",
    );

    expect(mesclados.map((i) => `${i.id}:${i.nome}`)).toEqual([
      "3:Novo",
      "2:Recente",
      "1:Antigo",
    ]);
  });

  it("assina a partir do cursor inicial, notifica apenas itens novos confirmados e desinscreve no unmount", () => {
    const controle = criarObservadorControlavel<ItemExemplo>();
    const aoChegarNovosItens = vi.fn();
    const iniciais: readonly ItemExemplo[] = [
      { id: "a", nome: "Primeiro", atualizadoEmIso: "2026-11-23T10:00:00.000Z" },
    ];

    const { result, unmount } = renderHook(() =>
      useColecaoDeltaTempoReal({
        organizacaoId: "org-1",
        itensIniciais: iniciais,
        observador: controle.porta,
        ordenar: (a, b) => b.atualizadoEmIso.localeCompare(a.atualizadoEmIso),
        aoChegarNovosItens,
      }),
    );

    expect(result.current.estadoConexao).toBe("conectando");
    expect(controle.obterUltimosParametros()).toEqual({
      organizacaoId: "org-1",
      atualizadoAPartirDeIso: "2026-11-23T10:00:00.000Z",
    });

    // Primeiro snapshot traz o próprio item do cursor (>=) — não deve disparar alerta de item novo
    act(() => {
      controle.emitirDelta([iniciais[0]!]);
    });
    expect(result.current.estadoConexao).toBe("ao_vivo");
    expect(aoChegarNovosItens).not.toHaveBeenCalled();

    // Chega item novo de visitante
    const novoItem: ItemExemplo = {
      id: "b",
      nome: "Visitante Novo",
      atualizadoEmIso: "2026-11-23T10:05:00.000Z",
    };
    act(() => {
      controle.emitirDelta([novoItem]);
    });
    expect(result.current.itens).toHaveLength(2);
    expect(result.current.itens[0]?.id).toBe("b");
    expect(aoChegarNovosItens).toHaveBeenCalledTimes(1);
    expect(aoChegarNovosItens).toHaveBeenCalledWith([novoItem]);

    // Erro degrada o estado sem quebrar a lista já exibida
    act(() => {
      controle.emitirErro(new Error("permission-denied"));
    });
    expect(result.current.estadoConexao).toBe("degradado");
    expect(result.current.itens).toHaveLength(2);

    unmount();
    expect(controle.desinscrever).toHaveBeenCalledTimes(1);
  });

  it("atualiza o GerenciadorSolicitacoesPainel em tempo real sem recarregar a página", () => {
    const controle = criarObservadorControlavel<SolicitacaoComercial>();

    const solicitacaoInicial: SolicitacaoComercial = {
      id: "sol-1",
      organizacaoId: "org-1",
      identificadorPublicoOrganizacao: "estudio-alvorada",
      microfluxoId: "fluxo-1",
      tituloExperiencia: "Orçamento",
      versaoMicrofluxo: 1,
      nomeVisitante: "Carlos Silva",
      telefoneOuWhatsapp: "(11) 99999-1111",
      respostasRegistradas: [],
      situacao: "nova",
      chaveIdempotencia: "sol-1",
      criadoEmIso: "2026-11-23T10:00:00.000Z",
      atualizadoEmIso: "2026-11-23T10:00:00.000Z",
    };

    const novaSolicitacao: SolicitacaoComercial = {
      ...solicitacaoInicial,
      id: "sol-2",
      nomeVisitante: "Marina Costa",
      chaveIdempotencia: "sol-2",
      criadoEmIso: "2026-11-23T10:10:00.000Z",
      atualizadoEmIso: "2026-11-23T10:10:00.000Z",
    };

    render(
      <GerenciadorSolicitacoesPainel
        organizacaoId="org-1"
        nomeOrganizacao="Estúdio Alvorada"
        solicitacoesIniciais={[solicitacaoInicial]}
        profissionaisAtivos={[]}
        podeGerenciarSolicitacoes
        servicoSolicitacoes={{ atualizarAndamentoSolicitacao: vi.fn() }}
        observadorSolicitacoes={controle.porta}
      />,
    );

    expect(screen.getByText("Carlos Silva")).toBeInTheDocument();
    expect(screen.queryByText("Marina Costa")).not.toBeInTheDocument();

    act(() => {
      controle.emitirDelta([novaSolicitacao]);
    });

    expect(screen.getByTestId("indicador-tempo-real-ao-vivo")).toBeInTheDocument();
    expect(screen.getByText("Marina Costa")).toBeInTheDocument();
  });
});

