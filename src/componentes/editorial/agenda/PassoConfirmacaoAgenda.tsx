"use client";

import { CalendarPlus, CheckCircle2, Copy, Mail } from "lucide-react";
import type { ResultadoSubmissaoAgendamentoVisitante } from "@/aplicacao/portas/portasAgenda";
import {
  formatarDataExtensoPtBr,
  formatarRotuloFusoHorario,
} from "@/dominio/agenda/calendarioDatas";
import { gerarConteudoArquivoIcs } from "@/dominio/agenda/geradorArquivoIcs";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesPassoConfirmacaoAgenda {
  readonly resultado: ResultadoSubmissaoAgendamentoVisitante;
  readonly nomeOrganizacao: string;
  readonly emailVisitante: string;
  readonly tituloConfirmacao: string;
  readonly corpoConfirmacao: string;
  readonly temaEscuro: boolean;
}

export function PassoConfirmacaoAgenda({
  resultado,
  nomeOrganizacao,
  emailVisitante,
  tituloConfirmacao,
  corpoConfirmacao,
  temaEscuro,
}: PropriedadesPassoConfirmacaoAgenda) {
  function baixarEventoCalendario() {
    const conteudo = gerarConteudoArquivoIcs({
      uid: resultado.agendamentoId,
      titulo: `Agendamento · ${nomeOrganizacao}`,
      descricao: `Código de confirmação: ${resultado.codigoConfirmacao}`,
      dataIso: resultado.dataIso,
      horarioInicio: resultado.horarioInicio,
      horarioFim: resultado.horarioFim,
      fusoHorario: resultado.fusoHorario,
    });

    const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agendamento-${resultado.codigoConfirmacao.toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 py-2 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-semibold tracking-tight">{tituloConfirmacao}</h3>
        <p className="text-sm text-[var(--editorial-texto-secundario)]">{corpoConfirmacao}</p>
      </div>

      <div
        className={combinarClasses(
          "space-y-2.5 rounded-2xl border p-4 text-left text-sm",
          temaEscuro ? "border-white/12 bg-white/[0.04]" : "border-black/10 bg-black/[0.02]",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-current/10 pb-2.5">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--editorial-texto-secundario)]">
              Código de confirmação
            </p>
            <p className="font-mono text-base font-bold tracking-wider">
              {resultado.codigoConfirmacao}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              void copiarTextoComAviso(
                resultado.codigoConfirmacao,
                "Código de confirmação copiado.",
              )
            }
            className={combinarClasses(
              "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-medium",
              temaEscuro
                ? "border-white/20 hover:bg-white/10"
                : "border-black/15 hover:bg-black/5",
            )}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copiar
          </button>
        </div>

        <div className="space-y-1 text-xs">
          <p className="font-semibold capitalize">{formatarDataExtensoPtBr(resultado.dataIso)}</p>
          <p className="text-[var(--editorial-texto-secundario)]">
            {resultado.horarioInicio} – {resultado.horarioFim} ({resultado.duracaoMinutos} min ·{" "}
            {formatarRotuloFusoHorario(resultado.fusoHorario)})
          </p>
        </div>
      </div>

      <div
        className={combinarClasses(
          "flex items-start gap-2.5 rounded-xl border p-3 text-left text-xs leading-relaxed",
          temaEscuro ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.02]",
        )}
      >
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--editorial-texto-secundario)]" aria-hidden="true" />
        <p className="text-[var(--editorial-texto-secundario)]">
          {resultado.emailConfirmacaoEnviado ? (
            <>
              Enviamos a confirmação com todos os detalhes para{" "}
              <strong className="text-[var(--editorial-texto)]">{emailVisitante}</strong>.
            </>
          ) : (
            <>
              Sua reserva está confirmada! Guarde o código{" "}
              <strong className="text-[var(--editorial-texto)]">{resultado.codigoConfirmacao}</strong>{" "}
              (não foi possível entregar o e-mail de confirmação neste momento).
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={baixarEventoCalendario}
        className={combinarClasses(
          "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors",
          temaEscuro
            ? "border-white/20 bg-white/[0.06] text-white hover:bg-white/12"
            : "border-black/15 bg-black/[0.03] text-current hover:bg-black/[0.07]",
        )}
      >
        <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        Adicionar ao meu calendário (.ics)
      </button>
    </div>
  );
}

