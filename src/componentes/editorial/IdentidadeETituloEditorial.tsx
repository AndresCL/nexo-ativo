import Image from "next/image";
import {
  deveIgnorarOtimizadorImagem,
  obterDescritorTipografiaEditorial,
  type FormatoBordaLogotipo,
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

export function obterClasseBordaLogotipo(formato?: FormatoBordaLogotipo): string {
  switch (formato) {
    case "suave":
      return "rounded-lg overflow-hidden";
    case "arredondado":
      return "rounded-2xl overflow-hidden";
    case "circulo":
      return "rounded-full aspect-square object-cover overflow-hidden";
    case "natural":
    default:
      return "";
  }
}

export function CabecalhoMarcaDiscreta({
  identidade,
  tipografiaId,
  alinharCentroNoMobile = true,
  className,
}: PropriedadesCabecalhoMarcaDiscreta) {
  const tipografia = obterDescritorTipografiaEditorial(tipografiaId);

  const exibirNome = (identidade.mostrarNomeExibicao ?? true) && Boolean(identidade.nomeExibicao);
  const exibirSubtitulo =
    (identidade.mostrarSubtituloCurto ?? true) && Boolean(identidade.subtituloCurto);
  const alinhamento = identidade.alinhamentoCabecalho;

  const classeAlinhamentoContainer =
    alinhamento === "centro"
      ? "w-full justify-center text-center"
      : alinhamento === "direita"
        ? "w-full justify-end text-right"
        : alinhamento === "esquerda"
          ? "w-full justify-start text-left"
          : alinharCentroNoMobile
            ? "w-full justify-center @5xl:w-auto @5xl:justify-start @5xl:gap-3"
            : "justify-start gap-3";

  return (
    <header
      className={combinarClasses(
        "min-h-[8.5rem] py-10 flex flex-col justify-center gap-1.5",
        alinhamento
          ? "w-full"
          : alinharCentroNoMobile
            ? "w-full items-center justify-center text-center @5xl:flex-row @5xl:items-center @5xl:justify-between @5xl:text-left"
            : "items-start text-left @5xl:flex-row @5xl:items-center @5xl:justify-between",
        className,
      )}
    >
      <div className={combinarClasses("flex items-center gap-3", classeAlinhamentoContainer)}>
        {identidade.urlLogotipoOpcional ? (
          identidade.formatoBordaLogotipo === "circulo" ? (
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full overflow-hidden shadow-sm">
              <Image
                src={identidade.urlLogotipoOpcional}
                alt={`Marca de ${identidade.nomeExibicao}`}
                fill
                sizes="(max-width: 640px) 48px, 56px"
                unoptimized={deveIgnorarOtimizadorImagem(identidade.urlLogotipoOpcional)}
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div
              className={combinarClasses(
                "relative flex shrink-0 items-center justify-center",
                obterClasseBordaLogotipo(identidade.formatoBordaLogotipo),
              )}
            >
              <Image
                src={identidade.urlLogotipoOpcional}
                alt={`Marca de ${identidade.nomeExibicao}`}
                width={255}
                height={58}
                unoptimized={deveIgnorarOtimizadorImagem(identidade.urlLogotipoOpcional)}
                className="h-12 max-h-14 w-auto max-w-[140px] object-contain sm:h-12 sm:max-h-14 sm:max-w-[255px]"
                priority
              />
            </div>
          )
        ) : null}

        {identidade.urlLogotipoOpcional && (exibirNome || exibirSubtitulo) ? (
          <div
            aria-hidden="true"
            className="h-6 w-px bg-current/25 shrink-0 sm:h-7"
          />
        ) : null}

        {exibirNome || exibirSubtitulo ? (
          <div className="flex flex-col justify-center text-left">
            {exibirNome ? (
              <p
                className={combinarClasses(
                  "text-base leading-tight font-medium text-[var(--editorial-texto)] sm:text-lg @5xl:text-xl",
                  tipografia.classeTitulo,
                )}
              >
                {identidade.nomeExibicao}
              </p>
            ) : null}
            {exibirSubtitulo ? (
              <p className="mt-0.5 text-[10px] font-medium tracking-[0.14em] text-[var(--editorial-texto)]/80 uppercase sm:text-[11px]">
                {identidade.subtituloCurto}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
