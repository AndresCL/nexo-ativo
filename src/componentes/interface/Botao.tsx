import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { LoaderCircle } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export type VarianteBotao =
  | "editorial_principal"
  | "editorial_contorno"
  | "operacional_primario"
  | "operacional_secundario"
  | "fantasma";

export type TamanhoBotao = "padrao" | "amplo" | "compacto";

export interface PropriedadesBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variante?: VarianteBotao;
  readonly tamanho?: TamanhoBotao;
  readonly carregando?: boolean;
  readonly textoCarregando?: string;
  readonly comoFilho?: boolean;
}

const CLASSES_POR_VARIANTE: Record<VarianteBotao, string> = {
  editorial_principal:
    "bg-marfim-100 text-mineral-950 hover:bg-marfim-50 focus-visible:outline-marfim-100 border border-transparent",
  editorial_contorno:
    "bg-mineral-950/35 text-marfim-100 border border-marfim-100/35 backdrop-blur-xs hover:bg-marfim-100/12 hover:border-marfim-100/65 focus-visible:outline-marfim-100",
  operacional_primario:
    "bg-mineral-950 text-marfim-50 hover:bg-mineral-800 border border-transparent",
  operacional_secundario:
    "bg-marfim-50 text-mineral-950 border border-marfim-300 hover:bg-marfim-200/70",
  fantasma: "bg-transparent text-mineral-800 hover:bg-marfim-200/60 border border-transparent",
};

const CLASSES_POR_TAMANHO: Record<TamanhoBotao, string> = {
  compacto: "min-h-10 px-3.5 py-2 text-sm",
  padrao: "min-h-11 px-5 py-2.5 text-sm",
  amplo: "min-h-12 px-6 py-3 text-base",
};

export const Botao = forwardRef<HTMLButtonElement, PropriedadesBotao>(function Botao(
  {
    className,
    variante = "operacional_primario",
    tamanho = "padrao",
    carregando = false,
    textoCarregando,
    comoFilho = false,
    disabled,
    children,
    type = "button",
    ...propriedadesRestantes
  },
  referencia,
) {
  const estaDesabilitado = Boolean(disabled || carregando);
  const Componente = comoFilho ? Slot : "button";

  const classesCombinadas = combinarClasses(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-wide transition-colors duration-200",
    "disabled:pointer-events-none disabled:opacity-55 cursor-pointer",
    CLASSES_POR_VARIANTE[variante],
    CLASSES_POR_TAMANHO[tamanho],
    className,
  );

  if (comoFilho) {
    return (
      <Componente ref={referencia} className={classesCombinadas} {...propriedadesRestantes}>
        {children}
      </Componente>
    );
  }

  return (
    <button
      ref={referencia}
      type={type}
      disabled={estaDesabilitado}
      aria-busy={carregando || undefined}
      className={classesCombinadas}
      {...propriedadesRestantes}
    >
      {carregando ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{textoCarregando ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});
