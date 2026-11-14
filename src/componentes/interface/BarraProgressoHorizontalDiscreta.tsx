import type { CSSProperties } from "react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesBarraProgressoHorizontal {
  readonly corDestaqueClasse?: string;
  readonly className?: string;
  readonly variante?: "topo" | "em_linha";
}

const ESTILO_MASCARA_DEGRADE: CSSProperties = {
  maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
};

const ESTILO_GRADIENTE_PADRAO: CSSProperties = {
  background:
    "linear-gradient(to right, transparent 0%, var(--editorial-destaque, #c8b28a) 25%, var(--editorial-destaque, #c8b28a) 75%, transparent 100%)",
};

/**
 * Loader horizontal infinito ultra discreto (2px) para transições e carregamento de dados.
 * Suporta exibição fixa no topo da janela ou em linha (incorporada abaixo de logotipos/elementos).
 * Apresenta extremos em degradê suave, atingindo a cor primária plena no núcleo central.
 */
export function BarraProgressoHorizontalDiscreta({
  corDestaqueClasse,
  className,
  variante = "topo",
}: PropriedadesBarraProgressoHorizontal) {
  const classeBase =
    variante === "topo"
      ? "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 w-full overflow-hidden bg-white/10 backdrop-blur-xs"
      : "pointer-events-none relative h-0.5 w-28 overflow-hidden rounded-full bg-white/10";

  return (
    <div
      role="progressbar"
      aria-label="Carregando conteúdo"
      aria-valuemin={0}
      aria-valuemax={100}
      style={ESTILO_MASCARA_DEGRADE}
      className={combinarClasses(classeBase, className)}
    >
      <div
        style={corDestaqueClasse ? undefined : ESTILO_GRADIENTE_PADRAO}
        className={combinarClasses(
          "animacao-progresso-horizontal h-full w-2/3 rounded-full shadow-xs",
          corDestaqueClasse,
        )}
      />
    </div>
  );
}
