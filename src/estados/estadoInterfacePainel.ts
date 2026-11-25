"use client";

import { createStore } from "zustand/vanilla";
import { criarContextoEstadoIsolado } from "./criarContextoEstadoIsolado";

export type ModoDispositivoPrevia = "desktop" | "mobile";

export const CHAVE_MENU_LATERAL_CONTRAIDO = "nexo_menu_lateral_contraido_desktop";

export interface EstadoInterfacePainel {
  readonly menuLateralAbertoMobile: boolean;
  readonly menuLateralContraidoDesktop: boolean;
  readonly modoDispositivoPrevia: ModoDispositivoPrevia;
  alternarMenuLateralMobile: () => void;
  fecharMenuLateralMobile: () => void;
  alternarMenuLateralDesktop: () => void;
  definirMenuLateralContraidoDesktop: (contraido: boolean) => void;
  alterarModoDispositivoPrevia: (modo: ModoDispositivoPrevia) => void;
}

export interface DadosIniciaisInterfacePainel {
  readonly modoDispositivoPreviaInicial?: ModoDispositivoPrevia;
}

function salvarPreferenciaMenuDesktop(contraido: boolean) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHAVE_MENU_LATERAL_CONTRAIDO, contraido ? "1" : "0");
    }
  } catch {
    // Ignora falhas de armazenamento em ambientes restritos
  }
}

function criarStoreInterfacePainel(dadosIniciais?: DadosIniciaisInterfacePainel) {
  return createStore<EstadoInterfacePainel>()((set) => ({
    menuLateralAbertoMobile: false,
    menuLateralContraidoDesktop: false,
    modoDispositivoPrevia: dadosIniciais?.modoDispositivoPreviaInicial ?? "desktop",
    alternarMenuLateralMobile: () =>
      set((estadoAtual) => ({
        menuLateralAbertoMobile: !estadoAtual.menuLateralAbertoMobile,
      })),
    fecharMenuLateralMobile: () => set({ menuLateralAbertoMobile: false }),
    alternarMenuLateralDesktop: () =>
      set((estadoAtual) => {
        const proximo = !estadoAtual.menuLateralContraidoDesktop;
        salvarPreferenciaMenuDesktop(proximo);
        return { menuLateralContraidoDesktop: proximo };
      }),
    definirMenuLateralContraidoDesktop: (contraido) =>
      set({ menuLateralContraidoDesktop: contraido }),
    alterarModoDispositivoPrevia: (modo) => set({ modoDispositivoPrevia: modo }),
  }));
}

const contextoInterfacePainel = criarContextoEstadoIsolado<
  EstadoInterfacePainel,
  DadosIniciaisInterfacePainel
>("EstadoInterfacePainel", criarStoreInterfacePainel);

export const ProvedorEstadoInterfacePainel = contextoInterfacePainel.ProvedorEstado;
export const useEstadoInterfacePainel = contextoInterfacePainel.useEstado;
