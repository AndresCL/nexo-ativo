import Link from "next/link";
import { Botao } from "@/componentes/interface/Botao";

export default function PaginaNaoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-mineral-950 px-6 text-center text-marfim-100">
      <p className="text-xs tracking-[0.22em] text-mineral-300 uppercase">Página indisponível</p>
      <h1 className="mt-3 font-editorial text-4xl font-light sm:text-5xl">
        Não encontramos este endereço
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-mineral-300">
        Verifique se o link foi digitado corretamente ou volte para a apresentação inicial.
      </p>
      <div className="mt-8">
        <Botao variante="editorial_principal" comoFilho>
          <Link href="/">Voltar ao início</Link>
        </Botao>
      </div>
    </main>
  );
}
