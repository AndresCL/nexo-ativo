import Image from "next/image";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesLogoNexoAtivo {
  readonly exibirTexto?: boolean;
  readonly tamanho?: "compacto" | "padrao" | "amplo";
  readonly className?: string;
}

const TAMANHOS_ICONE = {
  compacto: "h-6 w-6",
  padrao: "h-7 w-7",
  amplo: "h-9 w-9",
} as const;

const TAMANHOS_TEXTO = {
  compacto: "text-lg",
  padrao: "text-xl",
  amplo: "text-2xl",
} as const;

/**
 * Marca visual oficial do Nexo Ativo usando o arquivo exato da logo.
 */
export function LogoNexoAtivo({
  exibirTexto = true,
  tamanho = "padrao",
  className,
}: PropriedadesLogoNexoAtivo) {
  return (
    <span className={combinarClasses("inline-flex items-center gap-2.5 select-none", className)}>
      <Image
        src="/logo-nexo-ativo.png"
        alt={exibirTexto ? "" : "Nexo Ativo"}
        width={36}
        height={36}
        aria-hidden={exibirTexto ? true : undefined}
        className={combinarClasses(
          "shrink-0 rounded-md object-contain mix-blend-multiply",
          TAMANHOS_ICONE[tamanho],
        )}
      />
      {exibirTexto ? (
        <span className={combinarClasses("font-bold tracking-tight", TAMANHOS_TEXTO[tamanho])}>
          Nexo Ativo
        </span>
      ) : null}
    </span>
  );
}
