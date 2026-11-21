import Link from "next/link";
import type { ReactNode } from "react";
import { ScriptGoogleAnalytics } from "@/componentes/analytics/ScriptGoogleAnalytics";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";

export default function LayoutAutenticacao({ children }: { readonly children: ReactNode }) {
  return (
    <div className="fundo-painel flex min-h-dvh flex-col justify-between px-6 py-8 text-mineral-950 antialiased">
      <header className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-block text-mineral-950 transition-opacity hover:opacity-85">
          <LogoNexoAtivo tamanho="padrao" />
        </Link>
      </header>
      <main className="mx-auto my-10 w-full max-w-md">{children}</main>
      <footer className="mx-auto w-full max-w-md text-xs text-mineral-500">
        Ambiente protegido por isolamento multi-tenant.
      </footer>
      <ScriptGoogleAnalytics />
    </div>
  );
}
