import Link from "next/link";
import { Botao } from "@/componentes/interface/Botao";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";

export default function PaginaVitrineNaoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-mineral-900">
      <div className="mb-6">
        <LogoNexoAtivo tamanho="compacto" />
      </div>
      <h1 className="font-sans text-2xl font-semibold tracking-tight text-mineral-950 sm:text-3xl">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-sm text-sm text-mineral-500">
        Esta presença digital ainda não está disponível ou o link é inválido.
      </p>
      <div className="mt-6">
        <Botao
          variante="operacional_primario"
          className="bg-mineral-950 text-white hover:bg-mineral-900"
          comoFilho
        >
          <Link href="/">Voltar ao início</Link>
        </Botao>
      </div>
    </main>
  );
}
