import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";

/**
 * Cabeçalho minimalista da landing page do Nexo Ativo.
 */
export function CabecalhoLanding() {
  return (
    <header className="border-b border-marfim-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-mineral-950 transition-opacity hover:opacity-80">
          <LogoNexoAtivo tamanho="padrao" />
        </Link>

        <div className="flex items-center gap-2.5">
          <Botao variante="fantasma" tamanho="compacto" comoFilho>
            <Link href="/entrar">Entrar</Link>
          </Botao>
          <Botao variante="operacional_primario" tamanho="compacto" comoFilho>
            <Link href="/criar-conta">
              Criar conta
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Botao>
        </div>
      </div>
    </header>
  );
}
