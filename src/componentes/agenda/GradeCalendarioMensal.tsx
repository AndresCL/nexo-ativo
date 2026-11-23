"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatarTituloMesPtBr,
  gerarMatrizMensalCalendario,
  ROTULOS_DIAS_SEMANA_CALENDARIO,
} from "@/dominio/agenda/calendarioDatas";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface EstadoDiaCalendario {
  readonly disponivel?: boolean;
  readonly desabilitado?: boolean;
  readonly indicadorTexto?: string;
  readonly indicadorDestaque?: "verde" | "indigo" | "neutro";
  readonly ariaDescricao?: string;
}

export interface PropriedadesGradeCalendarioMensal {
  readonly anoMes: string;
  readonly dataSelecionada?: string | null;
  readonly hojeIso: string;
  readonly variante?: "painel" | "editorial_claro" | "editorial_escuro";
  readonly podeVoltarMes?: boolean;
  readonly podeAvancarMes?: boolean;
  readonly aoAlterarMes: (novoAnoMes: string) => void;
  readonly aoSelecionarData: (dataIso: string) => void;
  readonly obterEstadoDia: (dataIso: string, pertenceAoMes: boolean) => EstadoDiaCalendario;
  readonly className?: string;
}

import { adicionarMesesAnoMes } from "@/dominio/agenda/calendarioDatas";

/**
 * Calendário mensal acessível (alvos >= 44x44px) compartilhado entre o Painel Admin
 * e a Vitrine Pública Editorial.
 */
export function GradeCalendarioMensal({
  anoMes,
  dataSelecionada,
  hojeIso,
  variante = "painel",
  podeVoltarMes = true,
  podeAvancarMes = true,
  aoAlterarMes,
  aoSelecionarData,
  obterEstadoDia,
  className,
}: PropriedadesGradeCalendarioMensal) {
  const celulas = gerarMatrizMensalCalendario(anoMes);
  const ehEditorialEscuro = variante === "editorial_escuro";
  const ehEditorialClaro = variante === "editorial_claro";
  const ehEditorial = ehEditorialEscuro || ehEditorialClaro;

  const classeBotaoNav = combinarClasses(
    "flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-30",
    ehEditorialEscuro
      ? "border-white/15 bg-white/5 text-white hover:bg-white/12"
      : ehEditorialClaro
        ? "border-black/12 bg-black/[0.03] text-current hover:bg-black/[0.07]"
        : "border-marfim-200 bg-white text-mineral-800 hover:bg-marfim-50",
  );

  return (
    <div className={combinarClasses("select-none", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Mês anterior"
          disabled={!podeVoltarMes}
          onClick={() => aoAlterarMes(adicionarMesesAnoMes(anoMes, -1))}
          className={classeBotaoNav}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <p
          aria-live="polite"
          className={combinarClasses(
            "text-sm font-semibold capitalize tracking-tight",
            ehEditorial ? "text-current" : "text-mineral-950",
          )}
        >
          {formatarTituloMesPtBr(anoMes)}
        </p>

        <button
          type="button"
          aria-label="Próximo mês"
          disabled={!podeAvancarMes}
          onClick={() => aoAlterarMes(adicionarMesesAnoMes(anoMes, 1))}
          className={classeBotaoNav}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
        {ROTULOS_DIAS_SEMANA_CALENDARIO.map((rotulo) => (
          <div
            key={rotulo}
            className={combinarClasses(
              "py-1 text-[11px] font-medium uppercase tracking-wider",
              ehEditorialEscuro
                ? "text-white/55"
                : ehEditorialClaro
                  ? "text-black/50"
                  : "text-mineral-500",
            )}
          >
            {rotulo}
          </div>
        ))}
      </div>

      <div role="grid" aria-label={`Calendário de ${formatarTituloMesPtBr(anoMes)}`} className="grid grid-cols-7 gap-1">
        {celulas.map((celula) => {
          const estado = obterEstadoDia(celula.dataIso, celula.pertenceAoMes);
          const selecionada = dataSelecionada === celula.dataIso;
          const ehHoje = hojeIso === celula.dataIso;
          const desabilitada = !celula.pertenceAoMes || Boolean(estado.desabilitado);

          const classeCelula = combinarClasses(
            "relative flex min-h-11 w-full flex-col items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2",
            !celula.pertenceAoMes && "pointer-events-none opacity-0",
            celula.pertenceAoMes &&
              desabilitada &&
              (ehEditorialEscuro
                ? "cursor-not-allowed text-white/25"
                : ehEditorialClaro
                  ? "cursor-not-allowed text-black/25"
                  : "cursor-not-allowed text-mineral-300"),
            celula.pertenceAoMes &&
              !desabilitada &&
              !selecionada &&
              (ehEditorialEscuro
                ? estado.disponivel
                  ? "cursor-pointer bg-white/10 text-white hover:bg-white/18"
                  : "cursor-pointer text-white/75 hover:bg-white/10"
                : ehEditorialClaro
                  ? estado.disponivel
                    ? "cursor-pointer bg-black/[0.06] text-current hover:bg-black/[0.11]"
                    : "cursor-pointer text-current/80 hover:bg-black/[0.05]"
                  : estado.disponivel
                    ? "cursor-pointer border border-emerald-200 bg-emerald-50/80 text-emerald-950 hover:bg-emerald-100/80"
                    : "cursor-pointer border border-transparent text-mineral-700 hover:bg-marfim-100"),
            selecionada &&
              (ehEditorialEscuro
                ? "cursor-pointer bg-white text-mineral-950 font-semibold shadow-sm"
                : ehEditorialClaro
                  ? "cursor-pointer bg-mineral-950 text-white font-semibold shadow-sm"
                  : "cursor-pointer border border-mineral-950 bg-mineral-950 text-white font-semibold shadow-xs"),
            ehHoje &&
              !selecionada &&
              celula.pertenceAoMes &&
              (ehEditorialEscuro
                ? "ring-1 ring-white/45"
                : ehEditorialClaro
                  ? "ring-1 ring-black/35"
                  : "ring-1 ring-mineral-400"),
          );

          return (
            <button
              key={celula.dataIso}
              type="button"
              disabled={desabilitada}
              aria-pressed={selecionada}
              aria-label={
                estado.ariaDescricao
                  ? `${celula.dataIso}, ${estado.ariaDescricao}`
                  : celula.dataIso
              }
              onClick={() => aoSelecionarData(celula.dataIso)}
              className={classeCelula}
            >
              <span className="leading-none">{celula.dia}</span>

              {celula.pertenceAoMes && estado.indicadorTexto ? (
                <span
                  className={combinarClasses(
                    "mt-0.5 text-[9px] font-semibold leading-none",
                    selecionada
                      ? ehEditorialEscuro
                        ? "text-mineral-700"
                        : "text-white/85"
                      : estado.indicadorDestaque === "verde"
                        ? "text-emerald-700"
                        : estado.indicadorDestaque === "indigo"
                          ? "text-indigo-700"
                          : ehEditorialEscuro
                            ? "text-white/70"
                            : "text-mineral-500",
                  )}
                >
                  {estado.indicadorTexto}
                </span>
              ) : celula.pertenceAoMes && estado.disponivel && !desabilitada ? (
                <span
                  aria-hidden="true"
                  className={combinarClasses(
                    "mt-1 h-1 w-1 rounded-full",
                    selecionada
                      ? ehEditorialEscuro
                        ? "bg-mineral-950"
                        : "bg-white"
                      : ehEditorialEscuro
                        ? "bg-white/80"
                        : ehEditorialClaro
                          ? "bg-mineral-900/70"
                          : "bg-emerald-600",
                  )}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

