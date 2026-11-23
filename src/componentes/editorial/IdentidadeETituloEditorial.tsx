import Image from "next/image";
import {
  deveIgnorarOtimizadorImagem,
  obterDescritorTipografiaEditorial,
  type FormatoBordaLogotipo,
  type IdentidadeMarcaEditorial,
  type IdentificadorTipografiaEditorial,
} from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { obterEscalaVisualCabecalhoMarca } from "./escalaCabecalhoMarca";

export interface PropriedadesCabecalhoMarcaDiscreta {
  readonly identidade: IdentidadeMarcaEditorial;
  readonly tipografiaId: IdentificadorTipografiaEditorial;
  readonly alinharCentroNoMobile?: boolean;
  readonly varianteEspacamento?: "faixa_topo" | "slot_experiencias";
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
  varianteEspacamento = "faixa_topo",
  className,
}: PropriedadesCabecalhoMarcaDiscreta) {
  const tipografia = obterDescritorTipografiaEditorial(tipografiaId);

  const exibirNome = (identidade.mostrarNomeExibicao ?? true) && Boolean(identidade.nomeExibicao);
  const exibirSubtitulo =
    (identidade.mostrarSubtituloCurto ?? true) && Boolean(identidade.subtituloCurto);
  const exibirTexto = exibirNome || exibirSubtitulo;
  const alinhamento = identidade.alinhamentoCabecalho;
  const ehSlotExperiencias = varianteEspacamento === "slot_experiencias";
  const escala = obterEscalaVisualCabecalhoMarca(identidade.tamanhoCabecalho);

  const classeAlinhamentoContainer =
    alinhamento === "centro"
      ? "w-full justify-center text-center"
      : alinhamento === "direita"
        ? "w-full justify-end text-right"
        : alinhamento === "esquerda"
          ? "w-full justify-start text-left"
          : ehSlotExperiencias
            ? "w-full justify-center @5xl:justify-end"
            : alinharCentroNoMobile
              ? "w-full justify-center @5xl:w-auto @5xl:justify-start"
              : "justify-start";

  return (
    <header
      data-variante-cabecalho={varianteEspacamento}
      data-tamanho-cabecalho={escala.codigo}
      className={combinarClasses(
        ehSlotExperiencias
          ? "pt-1 pb-4 flex flex-col justify-center gap-1.5"
          : "min-h-[8.5rem] py-10 flex flex-col justify-center gap-1.5",
        alinhamento
          ? "w-full"
          : ehSlotExperiencias
            ? "w-full items-center text-center @5xl:items-end @5xl:text-right"
            : alinharCentroNoMobile
              ? "w-full items-center justify-center text-center @5xl:flex-row @5xl:items-center @5xl:justify-between @5xl:text-left"
              : "items-start text-left @5xl:flex-row @5xl:items-center @5xl:justify-between",
        className,
      )}
    >
      <div
        className={combinarClasses(
          "flex max-w-full items-center",
          escala.classeGapContainer,
          classeAlinhamentoContainer,
        )}
      >
        {identidade.urlLogotipoOpcional ? (
          identidade.formatoBordaLogotipo === "circulo" ? (
            <div
              className={combinarClasses(
                "relative shrink-0 overflow-hidden rounded-full shadow-sm",
                escala.classeLogoCirculo,
              )}
            >
              <Image
                src={identidade.urlLogotipoOpcional}
                alt={`Marca de ${identidade.nomeExibicao}`}
                fill
                sizes={escala.sizesLogoCirculo}
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
                width={escala.larguraImagemLivre}
                height={escala.alturaImagemLivre}
                unoptimized={deveIgnorarOtimizadorImagem(identidade.urlLogotipoOpcional)}
                className={
                  exibirTexto ? escala.classeLogoLivreComTexto : escala.classeLogoLivreSemTexto
                }
                priority
              />
            </div>
          )
        ) : null}

        {identidade.urlLogotipoOpcional && exibirTexto ? (
          <div
            aria-hidden="true"
            className={combinarClasses(
              "w-px shrink-0 bg-[var(--editorial-logo-titulo)]/25",
              escala.classeDivisor,
            )}
          />
        ) : null}

        {exibirTexto ? (
          <div className="flex min-w-0 flex-col justify-center text-left">
            {exibirNome ? (
              <p
                className={combinarClasses(
                  "leading-tight font-medium break-words text-[var(--editorial-logo-titulo)]",
                  escala.classeTitulo,
                  tipografia.classeTitulo,
                )}
              >
                {identidade.nomeExibicao}
              </p>
            ) : null}
            {exibirSubtitulo ? (
              <p
                className={combinarClasses(
                  "mt-0.5 font-medium break-words tracking-[0.14em] text-[var(--editorial-logo-subtitulo)] uppercase",
                  escala.classeSubtitulo,
                )}
              >
                {identidade.subtituloCurto}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
