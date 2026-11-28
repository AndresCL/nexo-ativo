import type { NivelDestaqueVitrine } from "@/dominio/microfluxos/nivelDestaqueVitrine";

export interface EstiloNivelDestaqueVitrine {
  readonly container: string;
  readonly icone: string;
}

/**
 * Mapa centralizado de estilos por nível de destaque (OCP).
 * - `primario`: botão pílula principal com superfície CTA da paleta.
 * - `secundario`: botão pílula secundário com borda/acento da cor CTA sobre superfície contrastada.
 * - `terciario`: card padrão (100% em linha inteira; 50% via CardAcaoVitrineCompacto).
 */
export const ESTILOS_NIVEL_DESTAQUE_VITRINE: Readonly<
  Record<NivelDestaqueVitrine, EstiloNivelDestaqueVitrine>
> = {
  primario: {
    container:
      "h-12 min-h-12 py-2 rounded-full border border-[var(--editorial-cta-borda,transparent)] bg-[var(--editorial-cta-fundo)] text-[var(--editorial-cta-texto)] shadow-lg shadow-black/20 hover:opacity-95 justify-center",
    icone: "rounded-full bg-white/15 text-current",
  },
  secundario: {
    container:
      "h-12 min-h-12 py-2 rounded-full border border-[var(--editorial-destaque-secundario-borda)] bg-[var(--editorial-destaque-secundario-fundo)] text-[var(--editorial-destaque-secundario-texto)] shadow-md backdrop-blur-md hover:opacity-95 justify-center",
    icone:
      "rounded-full bg-[color-mix(in_srgb,var(--editorial-destaque-secundario-borda)_22%,transparent)] text-current",
  },
  terciario: {
    container:
      "min-h-13 py-3 rounded-xl bg-[var(--editorial-secundario-fundo)] text-[var(--editorial-secundario-texto)] shadow-md backdrop-blur-md",
    icone: "bg-black/5 text-current dark:bg-white/10",
  },
};
