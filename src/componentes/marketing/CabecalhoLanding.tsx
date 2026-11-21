import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";

const ITENS_NAVEGACAO = [
  { rotulo: "Segmentos", href: "#segmentos" },
  { rotulo: "Microfluxos", href: "#microfluxos" },
  { rotulo: "Recursos", href: "#recursos" },
  { rotulo: "Planos", href: "#planos" },
] as const;

/**
 * Cabeçalho fixo minimalista da landing page do Nexo Ativo.
 */
export function CabecalhoLanding() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          className="text-mineral-950 transition-opacity hover:opacity-80"
          aria-label="Nexo Ativo — Página inicial"
        >
          <LogoNexoAtivo tamanho="padrao" />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-7 text-sm font-medium text-neutral-600 md:flex"
        >
          {ITENS_NAVEGACAO.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-mineral-950"
            >
              {item.rotulo}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <Botao
            variante="fantasma"
            tamanho="compacto"
            className="text-neutral-700 hover:bg-neutral-100 hover:text-mineral-950"
            comoFilho
          >
            <Link href="/entrar">Entrar</Link>
          </Botao>
          <Botao
            variante="operacional_primario"
            tamanho="compacto"
            className="bg-mineral-950 text-white hover:bg-mineral-800"
            comoFilho
          >
            <Link href="/criar-conta">
              Começar grátis
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Botao>
        </div>
      </div>
    </header>
  );
}
