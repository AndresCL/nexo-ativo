"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";

/**
 * Fábrica genérica para criar stores Zustand encapsuladas em React Context.
 * Impede o compartilhamento acidental de stores mutáveis entre requisições no servidor (SSR).
 */
export function criarContextoEstadoIsolado<Estado, Inicializacao = undefined>(
  nomeEstado: string,
  criarInstanciaStore: (dadosIniciais?: Inicializacao) => StoreApi<Estado>,
) {
  const Contexto = createContext<StoreApi<Estado> | null>(null);

  interface PropriedadesProvedor {
    readonly children: ReactNode;
    readonly dadosIniciais?: Inicializacao;
  }

  function ProvedorEstado({ children, dadosIniciais }: PropriedadesProvedor) {
    const referenciaStore = useRef<StoreApi<Estado> | null>(null);

    if (referenciaStore.current === null) {
      referenciaStore.current = criarInstanciaStore(dadosIniciais);
    }

    return <Contexto.Provider value={referenciaStore.current}>{children}</Contexto.Provider>;
  }

  function useEstado<Fatia>(seletor: (estado: Estado) => Fatia): Fatia {
    const instancia = useContext(Contexto);

    if (instancia === null) {
      throw new Error(
        `O hook de estado "${nomeEstado}" precisa ser utilizado dentro do seu respectivo ProvedorEstado.`,
      );
    }

    return useStore(instancia, seletor);
  }

  return {
    ProvedorEstado,
    useEstado,
  };
}
