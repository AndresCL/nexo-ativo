import Link from "next/link";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";

/**
 * Rodapé institucional da landing page do Nexo Ativo.
 */
export function RodapeLanding() {
  return (
    <footer className="border-t border-marfim-200/80 bg-marfim-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center sm:px-10">
        <div>
          <LogoNexoAtivo tamanho="compacto" className="text-mineral-950" />
          <p className="mt-2 text-xs text-mineral-500">
            Presença digital e microfluxos comerciais interativos.
          </p>
        </div>

        <nav aria-label="Links do rodapé" className="flex flex-wrap items-center gap-5 text-xs">
          <Link href="/entrar" className="font-medium text-mineral-600 hover:text-mineral-950">
            Entrar
          </Link>
          <Link
            href="/criar-conta"
            className="font-medium text-mineral-600 hover:text-mineral-950"
          >
            Criar conta
          </Link>
          <a href="#planos" className="font-medium text-mineral-600 hover:text-mineral-950">
            Planos
          </a>
        </nav>
      </div>
    </footer>
  );
}

