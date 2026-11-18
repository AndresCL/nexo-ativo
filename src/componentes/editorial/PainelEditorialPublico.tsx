"use client";

import type { ReactNode, RefObject } from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import {
  obterDescritorTipografiaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { BottomSheetEditorialBase } from "./BottomSheetEditorialBase";

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
  const tipografia = obterDescritorTipografiaEditorial(pagina.tipografiaId);

  return (
    <BottomSheetEditorialBase
      aberto={aberto}
      aoFechar={() => aoAlterarAbertura(false)}
      pagina={pagina}
      rotuloBotaoFechar="Fechar painel"
      aoRetornarFoco={aoRetornarFoco}
      referenciaRetornoFoco={referenciaRetornoFoco}
      cabecalhoFixo={
        <div className="border-b border-current/12 pr-10 pb-4">
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
      }
      classNameConteudoInterno="pt-2"
    >
      {children}
    </BottomSheetEditorialBase>
  );
}
