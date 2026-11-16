import Link from "next/link";
import { Botao } from "@/componentes/interface/Botao";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";

export default function PaginaVitrineNaoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-mineral-900">
      <div className="mb-6">
        <LogoNexoAtivo tamanho="compacto" />
      </div>
      <p className="text-xs tracking-[0.22em] text-mineral-500 uppercase">
        Endereço não localizado
      </p>
      <h1 className="mt-3 max-w-lg font-sans text-3xl font-semibold tracking-tight text-mineral-900 sm:text-4xl">
        Esta presença editorial ainda não foi publicada ou não está disponível.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-mineral-600">
        Verifique se o endereço foi digitado corretamente ou volte à página inicial da plataforma.
      </p>
      <div className="mt-8">
        <Botao
          variante="primario"
          className="bg-mineral-950 text-white hover:bg-mineral-900"
          comoFilho
        >
          <Link href="/">Conhecer o Nexo Ativo</Link>
        </Botao>
      </div>
    </main>
  );
}
