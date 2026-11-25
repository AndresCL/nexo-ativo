"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { BotaoEncerrarSessao } from "@/componentes/autenticacao/BotaoEncerrarSessao";

export interface PropriedadesMenuRodapeUsuario {
  readonly nomeUsuario?: string | null;
  readonly emailUsuario?: string | null;
  readonly urlLogotipoOrganizacao?: string | null;
  readonly aoClicarLink?: () => void;
  readonly contraido?: boolean;
}

export function MenuRodapeUsuario({
  nomeUsuario,
  emailUsuario,
  urlLogotipoOrganizacao,
  aoClicarLink,
  contraido = false,
}: PropriedadesMenuRodapeUsuario) {
  const [erroImagem, setErroImagem] = useState(false);
  const referenciaImagem = useRef<HTMLImageElement | null>(null);
  const mostrarLogo = Boolean(urlLogotipoOrganizacao) && !erroImagem;
  const rotuloConta = nomeUsuario?.trim() || "Minha conta";

  useEffect(() => {
    setErroImagem(false);
  }, [urlLogotipoOrganizacao]);

  useEffect(() => {
    const img = referenciaImagem.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setErroImagem(true);
    }
  }, [urlLogotipoOrganizacao]);

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <Link
        href="/painel/conta"
        onClick={aoClicarLink}
        title={emailUsuario ? `${rotuloConta} (${emailUsuario})` : rotuloConta}
        aria-label={contraido ? rotuloConta : undefined}
        className="group flex min-h-10 items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-mineral-600 transition-colors hover:bg-mineral-100/80 hover:text-mineral-950"
      >
        <span className="flex w-5 shrink-0 items-center justify-center text-mineral-950">
          {mostrarLogo ? (
            <img
              ref={referenciaImagem}
              src={urlLogotipoOrganizacao!}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onError={() => setErroImagem(true)}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
        <div
          className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${contraido ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          aria-hidden={contraido}
        >
          <p className="truncate text-xs font-semibold text-mineral-900 group-hover:text-indigo-950">
            {rotuloConta}
          </p>
          {emailUsuario ? (
            <p className="truncate text-[11px] text-mineral-500">{emailUsuario}</p>
          ) : null}
        </div>
      </Link>

      <div
        className={`overflow-hidden pt-0.5 whitespace-nowrap transition-opacity duration-150 ${contraido ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        aria-hidden={contraido}
      >
        <BotaoEncerrarSessao />
      </div>
    </div>
  );
}

