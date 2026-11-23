"use client";

import { useMemo, useState } from "react";
import { Calendar, Search } from "lucide-react";
import { formatarDataExtensoPtBr } from "@/dominio/agenda/calendarioDatas";
import type { AgendamentoAgenda, SituacaoAgendamento } from "@/dominio/agenda/tiposAgenda";
import { GradeCalendarioMensal } from "@/componentes/agenda/GradeCalendarioMensal";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CartaoAgendamentoPainel } from "./CartaoAgendamentoPainel";

export interface PropriedadesVisaoReservasAgenda {
  readonly agendamentos: readonly AgendamentoAgenda[];
  readonly hojeIso: string;
  readonly podeGerenciar: boolean;
  readonly ocupandoId: string | null;
  readonly aoAtualizarSituacao: (parametros: {
    readonly agendamentoId: string;
    readonly situacao: SituacaoAgendamento;
    readonly observacoesInternas?: string;
  }) => Promise<void>;
}

type FiltroListaReservas = "proximas" | "hoje" | "concluidas" | "canceladas" | "todas";

const CHIPS_FILTRO: readonly { readonly id: FiltroListaReservas; readonly rotulo: string }[] = [
  { id: "proximas", rotulo: "Próximas" },
  { id: "hoje", rotulo: "Hoje" },
  { id: "concluidas", rotulo: "Concluídas" },
  { id: "canceladas", rotulo: "Canceladas" },
  { id: "todas", rotulo: "Todas" },
];

export function VisaoReservasAgenda({
  agendamentos,
  hojeIso,
  podeGerenciar,
  ocupandoId,
  aoAtualizarSituacao,
}: PropriedadesVisaoReservasAgenda) {
  const [anoMes, setAnoMes] = useState(() => hojeIso.slice(0, 7));
  const [dataFiltrada, setDataFiltrada] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroListaReservas>("proximas");
  const [busca, setBusca] = useState("");

  const contagemPorData = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const a of agendamentos) {
      if (a.situacao !== "cancelado") {
        mapa.set(a.dataIso, (mapa.get(a.dataIso) ?? 0) + 1);
      }
    }
    return mapa;
  }, [agendamentos]);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return agendamentos.filter((item) => {
      if (dataFiltrada && item.dataIso !== dataFiltrada) {
        return false;
      }

      if (!dataFiltrada) {
        if (filtro === "proximas" && (item.dataIso < hojeIso || item.situacao !== "confirmado")) {
          return false;
        }
        if (filtro === "hoje" && item.dataIso !== hojeIso) {
          return false;
        }
        if (filtro === "concluidas" && item.situacao !== "concluido") {
          return false;
        }
        if (filtro === "canceladas" && item.situacao !== "cancelado") {
          return false;
        }
      }

      if (termo) {
        const texto = `${item.nomeVisitante} ${item.emailVisitante} ${item.codigoConfirmacao} ${item.telefoneOuWhatsapp ?? ""}`.toLocaleLowerCase("pt-BR");
        if (!texto.includes(termo)) return false;
      }

      return true;
    });
  }, [agendamentos, busca, dataFiltrada, filtro, hojeIso]);

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      <CartaoSuperficie className="h-fit p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-mineral-950">Calendário de reservas</h2>
          {dataFiltrada ? (
            <button
              type="button"
              onClick={() => setDataFiltrada(null)}
              className="text-xs font-semibold text-indigo-700 hover:underline"
            >
              Ver todas
            </button>
          ) : null}
        </div>

        <GradeCalendarioMensal
          anoMes={anoMes}
          dataSelecionada={dataFiltrada}
          hojeIso={hojeIso}
          variante="painel"
          aoAlterarMes={setAnoMes}
          aoSelecionarData={(dataIso) =>
            setDataFiltrada((atual) => (atual === dataIso ? null : dataIso))
          }
          obterEstadoDia={(dataIso, pertenceAoMes) => {
            if (!pertenceAoMes) return { desabilitado: true };
            const qtd = contagemPorData.get(dataIso) ?? 0;
            return {
              disponivel: qtd > 0,
              ...(qtd > 0
                ? { indicadorTexto: `${qtd}`, indicadorDestaque: "indigo" as const }
                : {}),
              ariaDescricao: qtd > 0 ? `${qtd} reservas` : "sem reservas",
            };
          }}
        />
      </CartaoSuperficie>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {CHIPS_FILTRO.map((chip) => {
              const ativo = !dataFiltrada && filtro === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setDataFiltrada(null);
                    setFiltro(chip.id);
                  }}
                  className={combinarClasses(
                    "min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors",
                    ativo
                      ? "border-mineral-950 bg-mineral-950 text-white"
                      : "border-marfim-200 bg-white text-mineral-700 hover:bg-marfim-50",
                  )}
                >
                  {chip.rotulo}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-0 sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mineral-400"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Buscar agendamentos"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome, e-mail ou código…"
              className="min-h-9 w-full rounded-lg border border-marfim-200 bg-white py-1.5 pr-3 pl-9 text-xs text-mineral-950 focus:border-mineral-950 focus:outline-none"
            />
          </div>
        </div>

        {dataFiltrada ? (
          <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs text-indigo-950">
            <span className="capitalize">
              Exibindo reservas de <strong>{formatarDataExtensoPtBr(dataFiltrada)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setDataFiltrada(null)}
              className="font-semibold underline"
            >
              Limpar dia
            </button>
          </div>
        ) : null}

        {listaFiltrada.length === 0 ? (
          <CartaoSuperficie className="flex flex-col items-center gap-2 p-10 text-center">
            <Calendar className="h-6 w-6 text-mineral-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-mineral-900">Nenhuma reserva encontrada</p>
            <p className="max-w-sm text-xs text-mineral-500">
              {dataFiltrada
                ? "Não há agendamentos registrados nesta data."
                : "Assim que visitantes reservarem um horário pela sua vitrine, eles aparecerão aqui."}
            </p>
          </CartaoSuperficie>
        ) : (
          <div className="space-y-3">
            {listaFiltrada.map((agendamento) => (
              <CartaoAgendamentoPainel
                key={agendamento.id}
                agendamento={agendamento}
                podeGerenciar={podeGerenciar}
                ocupandoId={ocupandoId}
                aoAtualizar={aoAtualizarSituacao}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

