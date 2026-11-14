import Link from "next/link";
import { Botao } from "@/componentes/interface/Botao";

export default function PaginaVitrineNaoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-mineral-950 px-6 text-center text-marfim-100">
      <p className="text-xs tracking-[0.22em] text-mineral-300 uppercase">
        Endereço não localizado
      </p>
      <h1 className="mt-3 max-w-lg font-editorial text-4xl font-light text-marfim-50 sm:text-5xl">
        Esta presença editorial ainda não foi publicada ou não está disponível.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-mineral-300">
        Verifique se o endereço foi digitado corretamente ou volte à página inicial da plataforma.
      </p>
      <div className="mt-8">
        <Botao variante="editorial_contorno" comoFilho>
          <Link href="/">Conhecer o Fluxo</Link>
        </Botao>
      </div>
    </main>
  );
}
