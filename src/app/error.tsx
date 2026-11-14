"use client";

import { Botao } from "@/componentes/interface/Botao";

export default function PaginaErroRecuperavel({
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-marfim-50 px-6 text-center text-mineral-950">
      <p className="text-xs tracking-[0.2em] text-mineral-500 uppercase">Interrupção temporária</p>
      <h1 className="mt-3 font-editorial text-3xl font-normal sm:text-4xl">
        Não foi possível concluir o carregamento
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-mineral-700">
        Seus dados permanecem preservados. Tente recarregar esta visualização.
      </p>
      <div className="mt-7">
        <Botao variante="operacional_primario" onClick={reset}>
          Tentar novamente
        </Botao>
      </div>
    </main>
  );
}
