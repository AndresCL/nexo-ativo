import Link from "next/link";
import type { ReactNode } from "react";

export default function LayoutAutenticacao({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col justify-between bg-marfim-50 px-6 py-8">
      <header className="mx-auto w-full max-w-md">
        <Link href="/" className="font-editorial text-2xl font-medium text-mineral-950">
          Fluxo
        </Link>
      </header>
      <main className="mx-auto my-10 w-full max-w-md">{children}</main>
      <footer className="mx-auto w-full max-w-md text-xs text-mineral-500">
        Ambiente protegido por isolamento multi-tenant.
      </footer>
    </div>
  );
}
