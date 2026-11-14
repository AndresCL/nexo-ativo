"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  gerarVariaveisCssPaletaEditorial,
  obterDescritorPaletaEditorial,
  obterDescritorTipografiaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CLASSES_PAINEL_EDITORIAL_RESPONSIVO } from "./estilosPainelEditorial";

interface PropriedadesPainelEditorialPublico {
  readonly aoRetornarFoco?: () => void;
  readonly aberto: boolean;
  readonly aoAlterarAbertura: (aberto: boolean) => void;
  readonly pagina: ConteudoPaginaPublicada;
  readonly titulo: string;
  readonly children: ReactNode;
  readonly referenciaRetornoFoco?: RefObject<HTMLButtonElement | null>;
}

export function PainelEditorialPublico({
  aoRetornarFoco,
  aberto,
  aoAlterarAbertura,
  pagina,
  titulo,
  children,
  referenciaRetornoFoco,
}: PropriedadesPainelEditorialPublico) {
  const paleta = obterDescritorPaletaEditorial(pagina.paletaId);
  const tipografia = obterDescritorTipografiaEditorial(pagina.tipografiaId);
  const variaveisPaleta = gerarVariaveisCssPaletaEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  ) as CSSProperties;

  return (
    <DialogoPrimitivo.Root open={aberto} onOpenChange={aoAlterarAbertura}>
      <DialogoPrimitivo.Portal>
        <DialogoPrimitivo.Overlay
          className={combinarClasses(
            "animacao-overlay-dialogo fixed inset-0 z-40 backdrop-blur-xs",
            pagina.composicaoVisual === "imersivo" ? "bg-black/25" : "bg-black/65",
          )}
        />
        <DialogoPrimitivo.Content
          style={variaveisPaleta}
          onCloseAutoFocus={
            aoRetornarFoco || referenciaRetornoFoco
              ? (evento) => {
                  evento.preventDefault();
                  if (aoRetornarFoco) aoRetornarFoco();
                  else referenciaRetornoFoco?.current?.focus();
                }
              : undefined
          }
          className={combinarClasses(
            CLASSES_PAINEL_EDITORIAL_RESPONSIVO,
            paleta.temaEscuro
              ? "border-white/18 shadow-black/60 ring-1 ring-white/10"
              : "border-black/12 shadow-black/20 ring-1 ring-black/5",
            tipografia.classeCorpo,
          )}
        >
          <div
            className="mx-auto -mt-1 mb-3 h-1.5 w-12 shrink-0 rounded-full bg-current/25 sm:hidden"
            aria-hidden="true"
          />
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-current/12 pb-5 sm:pb-4">
            <div>
              <p className="text-[11px] tracking-[0.2em] text-[var(--editorial-texto-secundario)] uppercase">
                {pagina.identidade.nomeExibicao}
              </p>
              <DialogoPrimitivo.Title
                className={combinarClasses("mt-1 text-2xl sm:text-xl", tipografia.classeTitulo)}
              >
                {titulo}
              </DialogoPrimitivo.Title>
              <DialogoPrimitivo.Description className="sr-only">
                Detalhes editoriais de {titulo} de {pagina.identidade.nomeExibicao}.
              </DialogoPrimitivo.Description>
            </div>
            <DialogoPrimitivo.Close asChild>
              <button
                type="button"
                aria-label="Fechar painel"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-current/20 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogoPrimitivo.Close>
          </div>
          {children}
        </DialogoPrimitivo.Content>
      </DialogoPrimitivo.Portal>
    </DialogoPrimitivo.Root>
  );
}
