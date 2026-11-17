import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";
import { TransicaoEditorial } from "@/componentes/interface/TransicaoEditorial";

export default function PaginaApresentacaoInicial() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <TransicaoEditorial className="flex max-w-md flex-col items-center gap-6">
        <LogoNexoAtivo tamanho="amplo" />
        <p className="text-base leading-relaxed text-mineral-600 sm:text-lg">
          Estamos preparando algo especial. Em breve estaremos no ar.
        </p>
      </TransicaoEditorial>
    </main>
  );
}

