"use client";

import { Botao } from "@/componentes/interface/Botao";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";

export default function PaginaErroRecuperavel({
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-mineral-900">
      <div className="mb-6">
        <LogoNexoAtivo tamanho="compacto" />
      </div>
      <p className="text-xs tracking-[0.2em] text-mineral-500 uppercase">
        Interrupção temporária
      </p>
      <h1 className="mt-3 max-w-lg font-sans text-3xl font-semibold tracking-tight text-mineral-900 sm:text-4xl">
        Não foi possível concluir o carregamento
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-mineral-600">
        Seus dados permanecem preservados. Tente recarregar esta visualização.
      </p>
      <div className="mt-7">
        <Botao
          variante="primario"
          className="bg-mineral-950 text-white hover:bg-mineral-900"
          onClick={reset}
        >
          Tentar novamente
        </Botao>
      </div>
    </main>
  );
}
