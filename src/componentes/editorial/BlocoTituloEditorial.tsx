import {
  obterDescritorTipografiaEditorial,
  type ChamadaPrincipalEditorial,
  type IdentificadorTipografiaEditorial,
  type ItemAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { ManipuladorAcaoHome } from "./AcaoEquipeVitrine";

export interface PropriedadesBlocoTituloEditorial {
  readonly nivelTitulo?: "h1" | "h2";
  readonly chamada: ChamadaPrincipalEditorial;
  readonly tipografiaId: IdentificadorTipografiaEditorial;
  readonly alinharCentroNoMobile?: boolean;
  readonly escala?: "ampla" | "compacta";
  readonly aoAcionarItem?: ManipuladorAcaoHome;
  readonly className?: string;
}

export function BlocoTituloEditorial({
  chamada,
  nivelTitulo: Titulo = "h1",
  tipografiaId,
  alinharCentroNoMobile = true,
  escala = "ampla",
  aoAcionarItem,
  className,
}: PropriedadesBlocoTituloEditorial) {
  const tipografia = obterDescritorTipografiaEditorial(tipografiaId);

  const temCta = Boolean(chamada.rotuloCta && chamada.fluxoId);

  function tratarCliqueCta(evento: React.MouseEvent<HTMLButtonElement>) {
    if (!aoAcionarItem || !chamada.rotuloCta || !chamada.fluxoId) return;
    const acaoSintetica: ItemAcaoHome = {
      id: `hero-cta-${chamada.fluxoId.replace(/^#/, "")}`,
      rotulo: chamada.rotuloCta,
      tipoDestino: "microfluxo",
      destino: `#${chamada.fluxoId.replace(/^#/, "")}`,
      destaquePrincipal: true,
    };
    aoAcionarItem(acaoSintetica, evento.currentTarget);
  }

  return (
    <div
      className={combinarClasses(
        "flex max-w-2xl flex-col",
        alinharCentroNoMobile
          ? "mx-auto items-center text-center @5xl:mx-0 @5xl:items-start @5xl:text-left"
          : "items-start text-left",
        className,
      )}
    >
      {chamada.sobretituloOpcional ? (
        <p className="text-[11px] tracking-[0.22em] text-[var(--editorial-destaque)] uppercase">
          {chamada.sobretituloOpcional}
        </p>
      ) : null}

      <Titulo
        className={combinarClasses(
          "mt-3 text-balance text-[var(--editorial-texto)] [text-shadow:_0_2px_12px_rgba(0,0,0,0.7)]",
          escala === "ampla"
            ? "text-3xl leading-[1.08] @3xl:text-4xl @5xl:text-[3.35rem]"
            : "text-2xl leading-[1.12] @3xl:text-3xl @5xl:text-[2.65rem]",
          tipografia.classeTitulo,
        )}
      >
        {chamada.tituloPrincipal}
      </Titulo>

      {chamada.descricaoCurta ? (
        <p
          className={combinarClasses(
            "mt-4 max-w-lg text-sm leading-relaxed text-[var(--editorial-texto-secundario)] @5xl:text-[0.95rem]",
            tipografia.classeCorpo,
          )}
        >
          {chamada.descricaoCurta}
        </p>
      ) : null}

      {temCta ? (
        <div className="mt-5 flex items-center">
          <button
            type="button"
            data-testid="hero-cta"
            onClick={tratarCliqueCta}
            className="inline-flex items-center justify-center rounded-full border border-[var(--editorial-destaque)]/40 bg-[var(--editorial-destaque)]/15 px-5 py-2.5 text-xs font-medium tracking-wide text-[var(--editorial-texto)] backdrop-blur-md transition-all duration-300 hover:border-[var(--editorial-destaque)] hover:bg-[var(--editorial-destaque)] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-destaque)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-fundo)] sm:text-sm"
          >
            <span>{chamada.rotuloCta}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
