import type { HTMLAttributes, ReactNode } from "react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesCartaoSuperficie extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly preenchimento?: "compacto" | "padrao" | "amplo";
}

const CLASSES_PREENCHIMENTO = {
  compacto: "p-4",
  padrao: "p-6",
  amplo: "p-8",
} as const;

export function CartaoSuperficie({
  children,
  preenchimento = "padrao",
  className,
  ...propriedadesRestantes
}: PropriedadesCartaoSuperficie) {
  return (
    <div
      className={combinarClasses(
        "rounded-xl border border-marfim-200 bg-white shadow-2xs",
        CLASSES_PREENCHIMENTO[preenchimento],
        className,
      )}
      {...propriedadesRestantes}
    >
      {children}
    </div>
  );
}
