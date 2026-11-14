import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import * as LabelPrimitivo from "@radix-ui/react-label";
import { AlertCircle } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesCampoFormulario extends InputHTMLAttributes<HTMLInputElement> {
  readonly rotulo: string;
  readonly textoAuxiliar?: string;
  readonly mensagemErro?: string;
  readonly prefixoFixo?: string;
  readonly sufixoElemento?: ReactNode;
}

/**
 * Campo de formulário acessível seguindo WCAG 2.2 AA:
 * associa rótulo explícito, descrição auxiliar, indicador de erro não dependente apenas de cor
 * e atributos ARIA adequados para tecnologias assistivas.
 */
export const CampoFormulario = forwardRef<HTMLInputElement, PropriedadesCampoFormulario>(
  function CampoFormulario(
    {
      id,
      rotulo,
      textoAuxiliar,
      mensagemErro,
      prefixoFixo,
      sufixoElemento,
      className,
      required,
      ...propriedadesEntrada
    },
    referencia,
  ) {
    const identificadorGerado = useId();
    const identificadorCampo = id ?? `campo-${identificadorGerado}`;
    const identificadorAuxiliar = `${identificadorCampo}-auxiliar`;
    const identificadorErro = `${identificadorCampo}-erro`;

    const descricoesAssociadas = [
      textoAuxiliar ? identificadorAuxiliar : null,
      mensagemErro ? identificadorErro : null,
    ]
      .filter(Boolean)
      .join(" ");

    const possuiErro = Boolean(mensagemErro);

    return (
      <div className="flex flex-col gap-1.5">
        <LabelPrimitivo.Root
          htmlFor={identificadorCampo}
          className="text-sm font-medium text-mineral-900"
        >
          {rotulo}
          {required ? (
            <span className="ml-1 text-destaque-terraco" aria-hidden="true">
              *
            </span>
          ) : null}
        </LabelPrimitivo.Root>

        <div
          className={combinarClasses(
            "flex min-h-11 items-center rounded-md border bg-white transition-colors",
            possuiErro
              ? "border-alerta-erro focus-within:ring-2 focus-within:ring-alerta-erro/25"
              : "border-marfim-300 focus-within:border-mineral-950",
          )}
        >
          {prefixoFixo ? (
            <span className="select-none border-r border-marfim-200 bg-marfim-100/70 px-3 py-2.5 text-sm text-mineral-500">
              {prefixoFixo}
            </span>
          ) : null}

          <input
            ref={referencia}
            id={identificadorCampo}
            required={required}
            aria-invalid={possuiErro}
            aria-describedby={descricoesAssociadas || undefined}
            className={combinarClasses(
              "w-full bg-transparent px-3.5 py-2.5 text-sm text-mineral-950 placeholder:text-mineral-500 focus:outline-none",
              className,
            )}
            {...propriedadesEntrada}
          />

          {sufixoElemento ? <div className="flex items-center pr-3">{sufixoElemento}</div> : null}
        </div>

        {textoAuxiliar ? (
          <p id={identificadorAuxiliar} className="text-xs text-mineral-500">
            {textoAuxiliar}
          </p>
        ) : null}

        {mensagemErro ? (
          <p
            id={identificadorErro}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-alerta-erro"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{mensagemErro}</span>
          </p>
        ) : null}
      </div>
    );
  },
);
