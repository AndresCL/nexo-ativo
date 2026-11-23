"use client";

import { Calendar, Clock, Pencil } from "lucide-react";
import { formatarDataCurtaPtBr } from "@/dominio/agenda/calendarioDatas";
import type { SlotHorarioDisponivel } from "@/dominio/agenda/tiposAgenda";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface DadosFormularioVisitanteAgenda {
  readonly nomeVisitante: string;
  readonly emailVisitante: string;
  readonly telefoneOuWhatsapp: string;
  readonly observacoesVisitante: string;
  readonly campoArmadilhaBot: string;
}

export interface PropriedadesPassoDadosVisitanteAgenda {
  readonly dataIso: string;
  readonly slot: SlotHorarioDisponivel;
  readonly duracaoSlotMinutos: number;
  readonly exigirTelefone: boolean;
  readonly exibirCampoObservacoes: boolean;
  readonly dados: DadosFormularioVisitanteAgenda;
  readonly erroEnvio: string | null;
  readonly enviando: boolean;
  readonly temaEscuro: boolean;
  readonly aoAlterarCampo: <K extends keyof DadosFormularioVisitanteAgenda>(
    campo: K,
    valor: DadosFormularioVisitanteAgenda[K],
  ) => void;
  readonly aoVoltarParaDataHorario: () => void;
}

export function PassoDadosVisitanteAgenda({
  dataIso,
  slot,
  duracaoSlotMinutos,
  exigirTelefone,
  exibirCampoObservacoes,
  dados,
  erroEnvio,
  enviando,
  temaEscuro,
  aoAlterarCampo,
  aoVoltarParaDataHorario,
}: PropriedadesPassoDadosVisitanteAgenda) {
  const classeInput = combinarClasses(
    "min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none",
    temaEscuro
      ? "border-white/18 bg-white/[0.06] text-white placeholder:text-white/40 focus:border-white/60"
      : "border-black/15 bg-black/[0.02] text-current placeholder:text-black/40 focus:border-mineral-950",
  );

  const classeLabel = "block text-xs font-medium text-[var(--editorial-texto-secundario)]";

  return (
    <div className="space-y-4">
      <div
        className={combinarClasses(
          "flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-3",
          temaEscuro ? "border-white/14 bg-white/[0.05]" : "border-black/10 bg-black/[0.03]",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {formatarDataCurtaPtBr(dataIso)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--editorial-texto-secundario)]">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {slot.horarioInicio} – {slot.horarioFim} ({duracaoSlotMinutos} min)
          </span>
        </div>

        <button
          type="button"
          disabled={enviando}
          onClick={aoVoltarParaDataHorario}
          className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold underline-offset-2 hover:underline"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Alterar
        </button>
      </div>

      {erroEnvio ? (
        <div
          role="alert"
          className={combinarClasses(
            "rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed",
            temaEscuro
              ? "border-rose-400/35 bg-rose-500/15 text-rose-100"
              : "border-rose-200 bg-rose-50 text-rose-900",
          )}
        >
          {erroEnvio}
        </div>
      ) : null}

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <label htmlFor="agenda-nome-visitante" className={classeLabel}>
            Nome completo *
          </label>
          <input
            id="agenda-nome-visitante"
            type="text"
            required
            autoComplete="name"
            disabled={enviando}
            value={dados.nomeVisitante}
            onChange={(e) => aoAlterarCampo("nomeVisitante", e.target.value)}
            placeholder="Como podemos chamar você?"
            className={classeInput}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="agenda-email-visitante" className={classeLabel}>
            E-mail para confirmação *
          </label>
          <input
            id="agenda-email-visitante"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            disabled={enviando}
            value={dados.emailVisitante}
            onChange={(e) => aoAlterarCampo("emailVisitante", e.target.value)}
            placeholder="voce@exemplo.com"
            className={classeInput}
          />
          <p className="text-[11px] text-[var(--editorial-texto-secundario)]">
            Enviaremos a confirmação da reserva para este e-mail.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="agenda-telefone-visitante" className={classeLabel}>
            WhatsApp / Telefone {exigirTelefone ? "*" : "(opcional)"}
          </label>
          <input
            id="agenda-telefone-visitante"
            type="tel"
            inputMode="tel"
            required={exigirTelefone}
            autoComplete="tel"
            disabled={enviando}
            value={dados.telefoneOuWhatsapp}
            onChange={(e) => aoAlterarCampo("telefoneOuWhatsapp", e.target.value)}
            placeholder="(11) 99999-9999"
            className={classeInput}
          />
        </div>

        {exibirCampoObservacoes ? (
          <div className="space-y-1.5">
            <label htmlFor="agenda-observacoes-visitante" className={classeLabel}>
              Observações (opcional)
            </label>
            <textarea
              id="agenda-observacoes-visitante"
              rows={2}
              maxLength={600}
              disabled={enviando}
              value={dados.observacoesVisitante}
              onChange={(e) => aoAlterarCampo("observacoesVisitante", e.target.value)}
              placeholder="Alguma informação importante para o atendimento?"
              className={combinarClasses(classeInput, "min-h-20 resize-none")}
            />
          </div>
        ) : null}

        {/* Honeypot anti-bot invisível */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="agenda-website-empresa">Website</label>
          <input
            id="agenda-website-empresa"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={dados.campoArmadilhaBot}
            onChange={(e) => aoAlterarCampo("campoArmadilhaBot", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

