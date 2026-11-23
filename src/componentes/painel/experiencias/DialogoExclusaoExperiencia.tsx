"use client";

import * as Dialogo from "@radix-ui/react-dialog";
import { useRef, type RefObject } from "react";
import { Trash2, X } from "lucide-react";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { Botao } from "@/componentes/interface/Botao";

export interface PropriedadesDialogoExclusaoExperiencia {
  readonly fluxoParaExcluir: DefinicaoMicrofluxo | undefined;
  readonly podeAlterar: boolean;
  readonly referenciaRetornoFoco?: RefObject<HTMLButtonElement | null>;
  readonly aoFechar: () => void;
  readonly aoConfirmar: () => void;
}

export function DialogoExclusaoExperiencia({
  fluxoParaExcluir,
  podeAlterar,
  referenciaRetornoFoco,
  aoFechar,
  aoConfirmar,
}: PropriedadesDialogoExclusaoExperiencia) {
  const botaoCancelarExclusao = useRef<HTMLButtonElement>(null);

  return (
    <Dialogo.Root
      open={fluxoParaExcluir !== undefined}
      onOpenChange={(aberto) => {
        if (!aberto) aoFechar();
      }}
    >
      <Dialogo.Portal>
        <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/30 backdrop-blur-sm" />
        <Dialogo.Content
          role="alertdialog"
          onOpenAutoFocus={(evento) => {
            evento.preventDefault();
            botaoCancelarExclusao.current?.focus();
          }}
          onCloseAutoFocus={(evento) => {
            evento.preventDefault();
            referenciaRetornoFoco?.current?.focus();
          }}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-marfim-200 bg-white p-5 shadow-xl sm:p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <Dialogo.Close
              aria-label="Fechar confirmação"
              className="rounded-lg p-1.5 text-mineral-500 hover:bg-marfim-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialogo.Close>
          </div>
          <Dialogo.Title className="text-lg font-semibold tracking-tight text-mineral-950">
            Excluir experiência?
          </Dialogo.Title>
          <Dialogo.Description className="mt-2 break-words text-sm leading-relaxed text-mineral-600">
            A experiência “{fluxoParaExcluir?.titulo}” será removida desta edição. Salvar o rascunho
            mantém a exclusão no painel. Para removê-la da página pública, clique em “Publicar
            página”.
          </Dialogo.Description>
          <p className="mt-3 text-xs leading-relaxed text-mineral-500">
            Se recarregar a página sem salvar ou publicar, a experiência continuará no rascunho.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-marfim-100 pt-4">
            <Dialogo.Close asChild>
              <Botao
                ref={botaoCancelarExclusao}
                variante="operacional_secundario"
                tamanho="compacto"
                className="rounded-lg border-marfim-200 bg-white hover:bg-marfim-50"
              >
                Cancelar
              </Botao>
            </Dialogo.Close>
            <Botao
              tamanho="compacto"
              className="rounded-lg bg-red-600 text-white hover:bg-red-700"
              disabled={!podeAlterar}
              onClick={aoConfirmar}
            >
              Excluir experiência
            </Botao>
          </div>
        </Dialogo.Content>
      </Dialogo.Portal>
    </Dialogo.Root>
  );
}

