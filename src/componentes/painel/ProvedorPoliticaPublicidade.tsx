"use client";

import { createContext, useContext, type ReactNode } from "react";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import type {
  CodigoPerfilPublicidade,
  PoliticaPublicidade,
} from "@/dominio/publicidade/tiposPerfilPublicidade";

const ContextoPoliticaPublicidade = createContext<PoliticaPublicidade>(
  obterPoliticaPublicidade("padrao"),
);

export function ProvedorPoliticaPublicidade({
  codigoPerfil,
  children,
}: {
  readonly codigoPerfil: CodigoPerfilPublicidade | undefined;
  readonly children: ReactNode;
}) {
  return (
    <ContextoPoliticaPublicidade.Provider value={obterPoliticaPublicidade(codigoPerfil)}>
      {children}
    </ContextoPoliticaPublicidade.Provider>
  );
}

/** Fora do provedor (ex.: testes isolados), aplica o perfil padrão sem restrições. */
export function usarPoliticaPublicidade(): PoliticaPublicidade {
  return useContext(ContextoPoliticaPublicidade);
}
