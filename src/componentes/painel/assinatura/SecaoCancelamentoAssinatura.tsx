"use client";

import * as Dialogo from "@radix-ui/react-dialog";
import { useState } from "react";
import { X } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";

export interface PropriedadesSecaoCancelamentoAssinatura {
  readonly vigenciaAteIso?: string;
  readonly cancelando?: boolean;
  readonly aoConfirmarCancelamento: () => Promise<void>;
}

function formatarData(dataIso: string): string {
  return dataIso.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, "$3/$2/$1");
}

export function SecaoCancelamentoAssinatura({
  vigenciaAteIso,
  cancelando: cancelandoProp,
  aoConfirmarCancelamento,
}: PropriedadesSecaoCancelamentoAssinatura) {
  const [modalAberto, setModalAberto] = useState(false);
  const [termoDigitado, setTermoDigitado] = useState("");
  const [cancelandoInterno, setCancelandoInterno] = useState(false);
  const cancelando = cancelandoProp ?? cancelandoInterno;

  async function executarCancelamento() {
    setCancelandoInterno(true);
    try {
      await aoConfirmarCancelamento();
      setModalAberto(false);
      setTermoDigitado("");
    } finally {
      setCancelandoInterno(false);
    }
  }

  return (
    <>
      <section
        aria-labelledby="titulo-cancelamento"
        className="rounded-2xl border border-marfim-200/80 bg-white p-5 shadow-2xs sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="titulo-cancelamento" className="text-sm font-semibold text-mineral-950">
              Cancelar assinatura
            </h2>
            <p className="mt-1 text-xs text-mineral-500">
              Encerre a renovação automática. Seu plano permanecerá ativo até{" "}
              {vigenciaAteIso ? formatarData(vigenciaAteIso) : "o fim do ciclo pago"}.
            </p>
          </div>
          <Botao
            type="button"
            variante="operacional_secundario"
            tamanho="compacto"
            onClick={() => {
              setTermoDigitado("");
              setModalAberto(true);
            }}
            className="shrink-0 border-marfim-200 text-mineral-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Cancelar assinatura
          </Botao>
        </div>
      </section>

      <Dialogo.Root
        open={modalAberto}
        onOpenChange={(aberto) => {
          if (!cancelando) {
            setModalAberto(aberto);
            if (!aberto) setTermoDigitado("");
          }
        }}
      >
        <Dialogo.Portal>
          <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/30 backdrop-blur-sm" />
          <Dialogo.Content
            role="alertdialog"
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-marfim-200 bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 border-b border-marfim-100 pb-3">
              <Dialogo.Title className="text-base font-semibold tracking-tight text-mineral-950">
                Deseja cancelar sua assinatura?
              </Dialogo.Title>
              <Dialogo.Close
                aria-label="Fechar diálogo de cancelamento"
                disabled={cancelando}
                className="rounded-lg p-1 text-mineral-400 hover:bg-marfim-50 hover:text-mineral-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Dialogo.Close>
            </div>

            <Dialogo.Description className="mt-3 text-xs leading-relaxed text-mineral-600">
              Novas faturas recorrentes não serão geradas. Seu acesso aos recursos do Plano Pro continuará garantido até{" "}
              <strong className="font-semibold text-mineral-950">
                {vigenciaAteIso ? formatarData(vigenciaAteIso) : "o término do ciclo atual"}
              </strong>.
            </Dialogo.Description>

            <div className="mt-4 space-y-1.5 rounded-xl border border-marfim-200/80 bg-marfim-50/40 p-3.5">
              <label
                htmlFor="input-confirmar-eliminar"
                className="block text-xs font-medium text-mineral-700"
              >
                Para confirmar, digite{" "}
                <code className="rounded border border-marfim-200 bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold text-mineral-900">
                  eliminar
                </code>{" "}
                abaixo:
              </label>
              <input
                id="input-confirmar-eliminar"
                type="text"
                autoComplete="off"
                placeholder="eliminar"
                value={termoDigitado}
                onChange={(e) => setTermoDigitado(e.target.value)}
                className="w-full min-h-10 rounded-lg border border-marfim-300 bg-white px-3 py-2 text-xs font-medium text-mineral-950 placeholder:text-mineral-400 focus:border-mineral-950 focus:outline-none"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 border-t border-marfim-100 pt-4">
              <Botao
                type="button"
                variante="operacional_secundario"
                tamanho="compacto"
                disabled={cancelando}
                onClick={() => {
                  setModalAberto(false);
                  setTermoDigitado("");
                }}
                className="rounded-lg border-marfim-200 bg-white hover:bg-marfim-50"
              >
                Manter assinatura
              </Botao>
              <Botao
                type="button"
                tamanho="compacto"
                disabled={
                  cancelando || termoDigitado.trim().toLowerCase() !== "eliminar"
                }
                onClick={executarCancelamento}
                className="rounded-lg bg-mineral-950 text-white hover:bg-mineral-900 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {cancelando ? "Cancelando..." : "Confirmar cancelamento"}
              </Botao>
            </div>
          </Dialogo.Content>
        </Dialogo.Portal>
      </Dialogo.Root>
    </>
  );
}
