"use client";

import { createStore } from "zustand/vanilla";
import { criarContextoEstadoIsolado } from "./criarContextoEstadoIsolado";

export type ModoDispositivoPrevia = "desktop" | "mobile";

export interface EstadoInterfacePainel {
  readonly menuLateralAbertoMobile: boolean;
  readonly modoDispositivoPrevia: ModoDispositivoPrevia;
  alternarMenuLateralMobile: () => void;
  fecharMenuLateralMobile: () => void;
  alterarModoDispositivoPrevia: (modo: ModoDispositivoPrevia) => void;
}

export interface DadosIniciaisInterfacePainel {
  readonly modoDispositivoPreviaInicial?: ModoDispositivoPrevia;
}

function criarStoreInterfacePainel(dadosIniciais?: DadosIniciaisInterfacePainel) {
  return createStore<EstadoInterfacePainel>()((set) => ({
    menuLateralAbertoMobile: false,
    modoDispositivoPrevia: dadosIniciais?.modoDispositivoPreviaInicial ?? "desktop",
    alternarMenuLateralMobile: () =>
      set((estadoAtual) => ({
        menuLateralAbertoMobile: !estadoAtual.menuLateralAbertoMobile,
      })),
    fecharMenuLateralMobile: () => set({ menuLateralAbertoMobile: false }),
    alterarModoDispositivoPrevia: (modo) => set({ modoDispositivoPrevia: modo }),
  }));
}

const contextoInterfacePainel = criarContextoEstadoIsolado<
  EstadoInterfacePainel,
  DadosIniciaisInterfacePainel
>("EstadoInterfacePainel", criarStoreInterfacePainel);

export const ProvedorEstadoInterfacePainel = contextoInterfacePainel.ProvedorEstado;
export const useEstadoInterfacePainel = contextoInterfacePainel.useEstado;
