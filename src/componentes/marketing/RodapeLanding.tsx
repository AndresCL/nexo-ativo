import Link from "next/link";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";

/**
 * Rodapé institucional da landing page do Nexo Ativo.
 */
export function RodapeLanding() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          <LogoNexoAtivo tamanho="compacto" className="text-mineral-950" />
          <p className="mt-2 text-xs text-neutral-500">
            Microsites comerciais e microfluxos para PMEs e profissionais.
          </p>
        </div>

        <nav aria-label="Links do rodapé" className="flex flex-wrap items-center gap-5 text-xs">
          <a href="#segmentos" className="font-medium text-neutral-600 hover:text-mineral-950">
            Segmentos
          </a>
          <a href="#microfluxos" className="font-medium text-neutral-600 hover:text-mineral-950">
            Microfluxos
          </a>
          <a href="#planos" className="font-medium text-neutral-600 hover:text-mineral-950">
            Planos
          </a>
          <a href="#perguntas" className="font-medium text-neutral-600 hover:text-mineral-950">
            Perguntas
          </a>
          <Link href="/entrar" className="font-medium text-neutral-600 hover:text-mineral-950">
            Entrar
          </Link>
          <Link href="/criar-conta" className="font-semibold text-mineral-950 hover:underline">
            Começar grátis
          </Link>
        </nav>
      </div>
    </footer>
  );
}
