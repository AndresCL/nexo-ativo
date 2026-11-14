import type { CSSProperties } from "react";
import type { TipoEfeitoCantosEditorial } from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesEfeitoCantosEditorial {
  readonly tipo?: TipoEfeitoCantosEditorial;
  readonly temaEscuro?: boolean;
  readonly className?: string;
}

interface ConfiguracaoEstiloCanto {
  readonly estiloContainer: CSSProperties;
  readonly posicaoClasse: string;
}

/**
 * Renderiza uma matriz moderna de micropontos (dot matrix) com marcadores técnicos
 * posicionada exclusivamente nas quatro esquinas da composição, acima do vídeo/mídia
 * e abaixo do conteúdo editorial interativo (SRP).
 *
 * Utiliza CSS radial gradients e máscaras WebKit inline nativas com alta densidade
 * e opacidade sólida (60% menos transparente), garantindo nitidez cristalina sobre vídeos.
 */
export function EfeitoCantosEditorial({
  tipo = "nenhum",
  temaEscuro = true,
  className,
}: PropriedadesEfeitoCantosEditorial) {
  if (tipo !== "dots" && tipo !== "grade") {
    return null;
  }

  return (
    <div
      data-testid="efeito-cantos-dots"
      aria-hidden="true"
      className={combinarClasses(
        "pointer-events-none absolute inset-0 z-[2] overflow-hidden select-none",
        className,
      )}
    >
      <MatrizDotsQuatroCantos temaEscuro={temaEscuro} />
    </div>
  );
}

function MatrizDotsQuatroCantos({ temaEscuro }: { readonly temaEscuro: boolean }) {
  // Pontos calibrados com textura translúcida hiper-discreta (20% de opacidade)
  const corPonto = temaEscuro ? "rgba(255, 255, 255, 0.20)" : "rgba(10, 12, 11, 0.18)";

  const cantos: readonly {
    readonly id: string;
    readonly config: ConfiguracaoEstiloCanto;
  }[] = [
    {
      id: "superior-esquerdo",
      config: {
        posicaoClasse: "top-0 left-0",
        estiloContainer: {
          backgroundImage: `radial-gradient(circle, ${corPonto} 1.5px, transparent 1.5px)`,
          backgroundSize: "20px 20px",
          WebkitMaskImage: "radial-gradient(circle at 0% 0%, black 20%, transparent 80%)",
          maskImage: "radial-gradient(circle at 0% 0%, black 20%, transparent 80%)",
        },
      },
    },
    {
      id: "superior-direito",
      config: {
        posicaoClasse: "top-0 right-0",
        estiloContainer: {
          backgroundImage: `radial-gradient(circle, ${corPonto} 1.5px, transparent 1.5px)`,
          backgroundSize: "20px 20px",
          WebkitMaskImage: "radial-gradient(circle at 100% 0%, black 20%, transparent 80%)",
          maskImage: "radial-gradient(circle at 100% 0%, black 20%, transparent 80%)",
        },
      },
    },
    {
      id: "inferior-esquerdo",
      config: {
        posicaoClasse: "bottom-0 left-0",
        estiloContainer: {
          backgroundImage: `radial-gradient(circle, ${corPonto} 1.5px, transparent 1.5px)`,
          backgroundSize: "20px 20px",
          WebkitMaskImage: "radial-gradient(circle at 0% 100%, black 20%, transparent 80%)",
          maskImage: "radial-gradient(circle at 0% 100%, black 20%, transparent 80%)",
        },
      },
    },
    {
      id: "inferior-direito",
      config: {
        posicaoClasse: "bottom-0 right-0",
        estiloContainer: {
          backgroundImage: `radial-gradient(circle, ${corPonto} 1.5px, transparent 1.5px)`,
          backgroundSize: "20px 20px",
          WebkitMaskImage: "radial-gradient(circle at 100% 100%, black 20%, transparent 80%)",
          maskImage: "radial-gradient(circle at 100% 100%, black 20%, transparent 80%)",
        },
      },
    },
  ];

  return (
    <>
      {cantos.map(({ id, config }) => (
        <div
          key={id}
          className={combinarClasses(
            "absolute h-60 w-60 @3xl:h-80 @3xl:w-80",
            config.posicaoClasse,
          )}
        >
          <div className="h-full w-full" style={config.estiloContainer} />
        </div>
      ))}
    </>
  );
}
