import Image from "next/image";
import {
  deveIgnorarOtimizadorImagem,
  obterDescritorTipografiaEditorial,
  type IdentidadeMarcaEditorial,
  type IdentificadorTipografiaEditorial,
} from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesCabecalhoMarcaDiscreta {
  readonly identidade: IdentidadeMarcaEditorial;
  readonly tipografiaId: IdentificadorTipografiaEditorial;
  readonly alinharCentroNoMobile?: boolean;
  readonly className?: string;
}

export function CabecalhoMarcaDiscreta({
  identidade,
  tipografiaId,
  alinharCentroNoMobile = true,
  className,
}: PropriedadesCabecalhoMarcaDiscreta) {
  const tipografia = obterDescritorTipografiaEditorial(tipografiaId);

  return (
    <header
      className={combinarClasses(
        "pt-2.5 flex flex-col gap-1.5",
        alinharCentroNoMobile
          ? "w-full items-center justify-center text-center @5xl:flex-row @5xl:items-baseline @5xl:justify-between @5xl:text-left"
          : "items-start text-left @5xl:flex-row @5xl:items-baseline @5xl:justify-between",
        className,
      )}
    >
      <div
        className={combinarClasses(
          "flex items-center",
          alinharCentroNoMobile
            ? "w-full justify-center @5xl:w-auto @5xl:justify-start @5xl:gap-3"
            : "justify-start gap-3",
        )}
      >
        <div
          className={combinarClasses(
            "flex items-center",
            alinharCentroNoMobile
              ? "flex-1 justify-end pr-2.5 sm:pr-3 @5xl:flex-initial @5xl:justify-start @5xl:p-0"
              : "justify-start",
          )}
        >
          {identidade.urlLogotipoOpcional ? (
            <div className="relative flex shrink-0 items-center">
              <Image
                src={identidade.urlLogotipoOpcional}
                alt={`Marca de ${identidade.nomeExibicao}`}
                width={255}
                height={58}
                unoptimized={deveIgnorarOtimizadorImagem(identidade.urlLogotipoOpcional)}
                className="h-8 max-h-10 w-auto max-w-[140px] object-contain sm:h-12 sm:max-h-13 sm:max-w-[255px]"
                priority
              />
            </div>
          ) : null}
        </div>

        {identidade.urlLogotipoOpcional && identidade.nomeExibicao ? (
          <div
            aria-hidden="true"
            className="h-6 w-px bg-current/25 shrink-0 sm:h-7"
          />
        ) : null}

        <div
          className={combinarClasses(
            "flex flex-col text-left",
            alinharCentroNoMobile
              ? "flex-1 justify-center pl-2.5 sm:pl-3 @5xl:flex-initial @5xl:justify-start @5xl:p-0"
              : "justify-start",
          )}
        >
          <p
            className={combinarClasses(
              "text-base leading-tight font-medium text-[var(--editorial-texto)] sm:text-lg @5xl:text-xl",
              tipografia.classeTitulo,
            )}
          >
            {identidade.nomeExibicao}
          </p>
          {identidade.subtituloCurto ? (
            <p className="mt-0.5 text-[10px] font-medium tracking-[0.14em] text-[var(--editorial-texto)]/80 uppercase sm:text-[11px]">
              {identidade.subtituloCurto}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
