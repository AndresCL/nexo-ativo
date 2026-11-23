"use client";

import { useState } from "react";
import * as Dialogo from "@radix-ui/react-dialog";
import { CheckCircle2, Clock, Mail, MessageSquare, UserX, XCircle } from "lucide-react";
import { formatarDataCurtaPtBr } from "@/dominio/agenda/calendarioDatas";
import type { AgendamentoAgenda, SituacaoAgendamento } from "@/dominio/agenda/tiposAgenda";
import { montarLinkWhatsapp } from "@/dominio/servicos/numeroWhatsappInternacional";
import { Botao } from "@/componentes/interface/Botao";
import { IconeWhatsapp } from "@/componentes/interface/IconeWhatsapp";

export interface PropriedadesCartaoAgendamentoPainel {
  readonly agendamento: AgendamentoAgenda;
  readonly podeGerenciar: boolean;
  readonly ocupandoId: string | null;
  readonly aoAtualizar: (parametros: {
    readonly agendamentoId: string;
    readonly situacao: SituacaoAgendamento;
    readonly observacoesInternas?: string;
  }) => Promise<void>;
}

const BADGE_SITUACAO: Readonly<
  Record<SituacaoAgendamento, { readonly rotulo: string; readonly classe: string }>
> = {
  confirmado: {
    rotulo: "Confirmado",
    classe: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  concluido: {
    rotulo: "Concluído",
    classe: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  nao_compareceu: {
    rotulo: "Não compareceu",
    classe: "border-amber-200 bg-amber-50 text-amber-900",
  },
  cancelado: {
    rotulo: "Cancelado",
    classe: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export function CartaoAgendamentoPainel({
  agendamento,
  podeGerenciar,
  ocupandoId,
  aoAtualizar,
}: PropriedadesCartaoAgendamentoPainel) {
  const [observacao, setObservacao] = useState(agendamento.observacoesInternas ?? "");
  const [editandoObs, setEditandoObs] = useState(false);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);

  const ocupado = ocupandoId === agendamento.id;
  const badge = BADGE_SITUACAO[agendamento.situacao];

  const linkWhatsapp = agendamento.telefoneOuWhatsapp
    ? montarLinkWhatsapp(
        agendamento.telefoneOuWhatsapp,
        `Olá ${agendamento.nomeVisitante.split(" ")[0]}! Confirmando seu agendamento (${agendamento.codigoConfirmacao}) em ${formatarDataCurtaPtBr(agendamento.dataIso)} às ${agendamento.horarioInicio}.`,
      )
    : null;

  async function salvarObservacao() {
    await aoAtualizar({
      agendamentoId: agendamento.id,
      situacao: agendamento.situacao,
      observacoesInternas: observacao.trim(),
    });
    setEditandoObs(false);
  }

  return (
    <article className="rounded-2xl border border-marfim-200 bg-white p-4 shadow-2xs transition-colors hover:border-marfim-300">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-bold text-mineral-950">
              <Clock className="h-4 w-4 text-mineral-500" aria-hidden="true" />
              {agendamento.horarioInicio} – {agendamento.horarioFim}
            </span>
            <span className="text-xs font-medium text-mineral-500">
              {formatarDataCurtaPtBr(agendamento.dataIso)}
            </span>
            <span className="rounded bg-marfim-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-mineral-700">
              {agendamento.codigoConfirmacao}
            </span>
          </div>

          <h3 className="text-base font-semibold text-mineral-950">
            {agendamento.nomeVisitante}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mineral-600">
            <a
              href={`mailto:${agendamento.emailVisitante}`}
              className="inline-flex items-center gap-1 hover:text-mineral-950 hover:underline"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {agendamento.emailVisitante}
            </a>
            {agendamento.telefoneOuWhatsapp ? (
              <span>{agendamento.telefoneOuWhatsapp}</span>
            ) : null}
          </div>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.classe}`}
        >
          {badge.rotulo}
        </span>
      </div>

      {agendamento.observacoesVisitante ? (
        <div className="mt-3 rounded-xl bg-marfim-50 px-3 py-2 text-xs text-mineral-700">
          <span className="font-semibold text-mineral-800">Nota do visitante: </span>
          {agendamento.observacoesVisitante}
        </div>
      ) : null}

      {editandoObs ? (
        <div className="mt-3 space-y-2 rounded-xl border border-marfim-200 bg-marfim-50/50 p-3">
          <textarea
            rows={2}
            maxLength={1000}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Anotações internas da equipe sobre este atendimento…"
            className="w-full rounded-lg border border-marfim-300 bg-white px-3 py-2 text-xs text-mineral-950 focus:border-mineral-950 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <Botao
              type="button"
              variante="fantasma"
              tamanho="compacto"
              disabled={ocupado}
              onClick={() => {
                setObservacao(agendamento.observacoesInternas ?? "");
                setEditandoObs(false);
              }}
            >
              Cancelar
            </Botao>
            <Botao
              type="button"
              variante="operacional_primario"
              tamanho="compacto"
              disabled={ocupado}
              onClick={() => void salvarObservacao()}
            >
              {ocupado ? "Salvando…" : "Salvar nota"}
            </Botao>
          </div>
        </div>
      ) : agendamento.observacoesInternas ? (
        <p className="mt-2.5 text-xs text-mineral-500">
          <strong className="text-mineral-700">Interno:</strong> {agendamento.observacoesInternas}
        </p>
      ) : null}

      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-marfim-100 pt-3">
        {linkWhatsapp ? (
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100"
          >
            <IconeWhatsapp className="h-3.5 w-3.5" aria-hidden="true" />
            WhatsApp
          </a>
        ) : null}

        {podeGerenciar && agendamento.situacao === "confirmado" ? (
          <>
            <button
              type="button"
              disabled={ocupado}
              onClick={() =>
                void aoAtualizar({ agendamentoId: agendamento.id, situacao: "concluido" })
              }
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-marfim-200 bg-white px-3 text-xs font-medium text-mineral-800 hover:bg-indigo-50 hover:text-indigo-900 disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Concluir
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={() =>
                void aoAtualizar({ agendamentoId: agendamento.id, situacao: "nao_compareceu" })
              }
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-marfim-200 bg-white px-3 text-xs font-medium text-mineral-700 hover:bg-amber-50 hover:text-amber-900 disabled:opacity-40"
            >
              <UserX className="h-3.5 w-3.5" aria-hidden="true" />
              Não compareceu
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => setConfirmandoCancelamento(true)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-marfim-200 bg-white px-3 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-40"
            >
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Cancelar
            </button>
          </>
        ) : null}

        {podeGerenciar ? (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => setEditandoObs((v) => !v)}
            className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-mineral-500 hover:bg-marfim-100 hover:text-mineral-900"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            {agendamento.observacoesInternas ? "Editar nota" : "Nota interna"}
          </button>
        ) : null}
      </div>

      <Dialogo.Root open={confirmandoCancelamento} onOpenChange={setConfirmandoCancelamento}>
        <Dialogo.Portal>
          <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/45" />
          <Dialogo.Content className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-marfim-200 bg-white p-6 shadow-xl">
            <Dialogo.Title className="text-base font-bold text-mineral-950">
              Cancelar agendamento?
            </Dialogo.Title>
            <Dialogo.Description className="mt-2 text-xs leading-relaxed text-mineral-600">
              A reserva de <strong>{agendamento.nomeVisitante}</strong> em{" "}
              <strong>
                {formatarDataCurtaPtBr(agendamento.dataIso)} às {agendamento.horarioInicio}
              </strong>{" "}
              será marcada como cancelada e o horário voltará a ficar disponível na vitrine pública.
            </Dialogo.Description>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialogo.Close asChild>
                <Botao type="button" variante="operacional_secundario" tamanho="compacto">
                  Voltar
                </Botao>
              </Dialogo.Close>
              <Botao
                type="button"
                variante="operacional_primario"
                tamanho="compacto"
                disabled={ocupado}
                onClick={async () => {
                  await aoAtualizar({ agendamentoId: agendamento.id, situacao: "cancelado" });
                  setConfirmandoCancelamento(false);
                }}
                className="bg-rose-700 hover:bg-rose-800"
              >
                {ocupado ? "Cancelando…" : "Confirmar cancelamento"}
              </Botao>
            </div>
          </Dialogo.Content>
        </Dialogo.Portal>
      </Dialogo.Root>
    </article>
  );
}

