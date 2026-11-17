import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import { exigirSessaoFundadorServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { BotaoEncerrarSessao } from "@/componentes/autenticacao/BotaoEncerrarSessao";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";
import { TransicaoPaginaPainel } from "@/componentes/interface/TransicaoPaginaPainel";

export const metadata: Metadata = {
  title: "Painel Fundador",
};

export default async function LayoutPainelFundador({ children }: { readonly children: ReactNode }) {
  const fundador = await exigirSessaoFundadorServidor();

  return (
    <div className="fundo-painel flex min-h-dvh flex-col lg:flex-row">
      <header className="fundo-menu-painel flex items-center justify-between border-b border-slate-200/60 px-4 py-3 lg:hidden">
        <div>
          <Link href="/fundador" className="text-mineral-950">
            <LogoNexoAtivo tamanho="compacto" />
          </Link>
          <p className="text-xs text-mineral-500">Painel Fundador</p>
        </div>
        <div className="w-36">
          <BotaoEncerrarSessao />
        </div>
      </header>

      <aside className="fundo-menu-painel hidden w-64 shrink-0 flex-col justify-between gap-4 border-r border-slate-200/60 p-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:overflow-y-auto lg:overscroll-contain">
        <div className="flex flex-col gap-8">
          <div>
            <Link href="/fundador" className="inline-block text-mineral-950">
              <LogoNexoAtivo tamanho="padrao" />
            </Link>
            <p className="mt-0.5 truncate text-xs font-medium text-mineral-700">
              Governança da Plataforma
            </p>
          </div>

          <nav aria-label="Navegação do painel fundador" className="flex flex-col gap-1">
            <Link
              href="/fundador"
              aria-current="page"
              className="flex min-h-10 items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors duration-200"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Painel Fundador</span>
            </Link>
            <Link
              href="/painel"
              className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-mineral-600 transition-colors duration-200 hover:bg-indigo-50/50 hover:text-indigo-700"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span>Painel do Assinante</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-200/60 pt-4">
          {fundador.email ? (
            <p className="mb-2 truncate px-3 text-xs text-mineral-500">{fundador.email}</p>
          ) : null}
          <BotaoEncerrarSessao />
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <TransicaoPaginaPainel>{children}</TransicaoPaginaPainel>
      </main>
    </div>
  );
}
