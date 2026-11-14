import type { ReactNode } from "react";
import { exigirSessaoFundadorServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { BotaoEncerrarSessao } from "@/componentes/autenticacao/BotaoEncerrarSessao";

export default async function LayoutPainelFundador({ children }: { readonly children: ReactNode }) {
  const fundador = await exigirSessaoFundadorServidor();

  return (
    <div className="min-h-dvh bg-marfim-100 text-mineral-950">
      <header className="border-b border-marfim-300 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <span className="text-xl font-bold tracking-tight">Fluxo · Painel Fundador</span>
            <p className="text-xs text-mineral-500">
              Autenticado como fundador ({fundador.email ?? fundador.uid})
            </p>
          </div>
          <div className="w-40">
            <BotaoEncerrarSessao />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
