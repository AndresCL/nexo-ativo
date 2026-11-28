"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, CalendarOff, Clock } from "lucide-react";
import {
  formatarDataCurtaPtBr,
  formatarRotuloFusoHorario,
} from "@/dominio/agenda/calendarioDatas";
import type {
  DisponibilidadeDiaPublico,
  SlotHorarioDisponivel,
} from "@/dominio/agenda/tiposAgenda";
import { GradeCalendarioMensal } from "@/componentes/agenda/GradeCalendarioMensal";
import { BarraProgressoHorizontalDiscreta } from "@/componentes/interface/BarraProgressoHorizontalDiscreta";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesPassoSelecaoDataHorario {
  readonly anoMes: string;
  readonly hojeIso: string;
  readonly carregando: boolean;
  readonly erroCarregamento: string | null;
  readonly agendaAtiva: boolean;
  readonly fusoHorario: string;
  readonly duracaoSlotMinutos: number;
  readonly diasDisponiveis: readonly DisponibilidadeDiaPublico[];
  readonly proximoDiaDisponivelOpcional?: string;
  readonly dataSelecionada: string | null;
  readonly horarioSelecionado: SlotHorarioDisponivel | null;
  readonly temaEscuro: boolean;
  readonly podeVoltarMes: boolean;
  readonly aoAlterarMes: (novoAnoMes: string) => void;
  readonly aoSelecionarData: (dataIso: string) => void;
  readonly aoSelecionarHorario: (slot: SlotHorarioDisponivel) => void;
  readonly aoTentarNovamente: () => void;
}

const ROTULOS_PERIODO: Readonly<Record<SlotHorarioDisponivel["periodo"], string>> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export function PassoSelecaoDataHorario({
  anoMes,
  hojeIso,
  carregando,
  erroCarregamento,
  agendaAtiva,
  fusoHorario,
  duracaoSlotMinutos,
  diasDisponiveis,
  proximoDiaDisponivelOpcional,
  dataSelecionada,
  horarioSelecionado,
  temaEscuro,
  podeVoltarMes,
  aoAlterarMes,
  aoSelecionarData,
  aoSelecionarHorario,
  aoTentarNovamente,
}: PropriedadesPassoSelecaoDataHorario) {
  const mapaDias = new Map(diasDisponiveis.map((d) => [d.dataIso, d]));
  const diaAtual = dataSelecionada ? mapaDias.get(dataSelecionada) : undefined;
  const [visualizacao, setVisualizacao] = useState<"calendario" | "horarios">(() =>
    horarioSelecionado && diaAtual ? "horarios" : "calendario",
  );

  const exibirHorarios =
    visualizacao === "horarios" && !carregando && !erroCarregamento && Boolean(diaAtual);

  function selecionarDiaEAbrirHorarios(dataIso: string) {
    aoSelecionarData(dataIso);
    setVisualizacao("horarios");
  }

  function alterarMesNoCalendario(novoAnoMes: string) {
    setVisualizacao("calendario");
    aoAlterarMes(novoAnoMes);
  }

  const periodosAgrupados: Array<{
    readonly periodo: SlotHorarioDisponivel["periodo"];
    readonly slots: readonly SlotHorarioDisponivel[];
  }> = [];

  if (diaAtual) {
    for (const periodo of ["manha", "tarde", "noite"] as const) {
      const lista = diaAtual.slots.filter((s) => s.periodo === periodo);
      if (lista.length > 0) {
        periodosAgrupados.push({ periodo, slots: lista });
      }
    }
  }

  if (exibirHorarios && diaAtual) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setVisualizacao("calendario")}
            className={combinarClasses(
              "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
              temaEscuro
                ? "border-white/15 bg-white/[0.06] text-white hover:bg-white/12"
                : "border-black/12 bg-black/[0.03] text-current hover:bg-black/[0.07]",
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Alterar data</span>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--editorial-texto-secundario)]">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {duracaoSlotMinutos} min · {formatarRotuloFusoHorario(fusoHorario)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--editorial-texto-secundario)]" aria-hidden="true" />
          <h3 className="text-sm font-semibold">
            Horários em {formatarDataCurtaPtBr(diaAtual.dataIso)}
          </h3>
        </div>

        <div className="space-y-3.5">
          {periodosAgrupados.map(({ periodo, slots }) => (
            <div key={periodo} className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--editorial-texto-secundario)]">
                {ROTULOS_PERIODO[periodo]}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const selecionado = horarioSelecionado?.horarioInicio === slot.horarioInicio;
                  return (
                    <button
                      key={slot.horarioInicio}
                      type="button"
                      aria-pressed={selecionado}
                      onClick={() => aoSelecionarHorario(slot)}
                      className={combinarClasses(
                        "flex min-h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2",
                        selecionado
                          ? "border-[var(--editorial-cta-fundo)] bg-[var(--editorial-cta-fundo)] font-semibold text-[var(--editorial-cta-texto)] shadow-sm"
                          : temaEscuro
                            ? "border-white/15 bg-white/[0.04] text-white hover:border-white/35 hover:bg-white/10"
                            : "border-black/12 bg-black/[0.02] text-current hover:border-black/30 hover:bg-black/[0.06]",
                      )}
                    >
                      {slot.horarioInicio}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className={combinarClasses(
          "rounded-2xl border p-3.5 transition-opacity duration-200 sm:p-4",
          temaEscuro ? "border-white/12 bg-white/[0.04]" : "border-black/10 bg-black/[0.02]",
          carregando && diasDisponiveis.length === 0 && "pointer-events-none opacity-60 animate-pulse",
        )}
      >
        <GradeCalendarioMensal
          anoMes={anoMes}
          dataSelecionada={dataSelecionada}
          hojeIso={hojeIso}
          variante={temaEscuro ? "editorial_escuro" : "editorial_claro"}
          podeVoltarMes={podeVoltarMes}
          aoAlterarMes={alterarMesNoCalendario}
          aoSelecionarData={selecionarDiaEAbrirHorarios}
          obterEstadoDia={(dataIso, pertenceAoMes) => {
            if (!pertenceAoMes) return { desabilitado: true };
            const disponivel = mapaDias.has(dataIso);
            return {
              disponivel,
              desabilitado: !disponivel,
              ariaDescricao: disponivel ? "horários disponíveis" : "sem horários disponíveis",
            };
          }}
        />
      </div>

      {carregando ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <BarraProgressoHorizontalDiscreta variante="em_linha" />
          <p className="text-xs text-[var(--editorial-texto-secundario)]">
            Buscando horários disponíveis…
          </p>
        </div>
      ) : erroCarregamento ? (
        <div
          className={combinarClasses(
            "rounded-2xl border p-4 text-center text-sm",
            temaEscuro
              ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
              : "border-rose-200 bg-rose-50 text-rose-900",
          )}
        >
          <p>{erroCarregamento}</p>
          <button
            type="button"
            onClick={aoTentarNovamente}
            className="mt-3 min-h-10 rounded-full border border-current/25 px-4 text-xs font-semibold"
          >
            Tentar novamente
          </button>
        </div>
      ) : !agendaAtiva || diasDisponiveis.length === 0 ? (
        <div
          className={combinarClasses(
            "flex flex-col items-center gap-2 rounded-2xl border border-dashed p-6 text-center",
            temaEscuro ? "border-white/15 bg-white/[0.03]" : "border-black/15 bg-black/[0.02]",
          )}
        >
          <CalendarOff
            className="h-5 w-5 text-[var(--editorial-texto-secundario)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">Nenhum horário disponível neste mês</p>
          <p className="text-xs text-[var(--editorial-texto-secundario)]">
            {proximoDiaDisponivelOpcional
              ? `Próxima data livre em ${formatarDataCurtaPtBr(proximoDiaDisponivelOpcional)}.`
              : "Tente avançar para o próximo mês ou entre em contato diretamente."}
          </p>
          {proximoDiaDisponivelOpcional && !proximoDiaDisponivelOpcional.startsWith(`${anoMes}-`) ? (
            <button
              type="button"
              onClick={() => alterarMesNoCalendario(proximoDiaDisponivelOpcional.slice(0, 7))}
              className="mt-2 min-h-10 rounded-full bg-[var(--editorial-cta-fundo)] px-4 text-xs font-semibold text-[var(--editorial-cta-texto)] transition-opacity hover:opacity-90"
            >
              Ir para {formatarDataCurtaPtBr(proximoDiaDisponivelOpcional)}
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-center text-xs text-[var(--editorial-texto-secundario)]">
          Toque em um dia disponível para ver os horários.
        </p>
      )}
    </div>
  );
}

