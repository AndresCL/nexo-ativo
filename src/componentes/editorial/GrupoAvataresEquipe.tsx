"use client";

import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { AvatarProfissional } from "./AvatarProfissional";
import estilos from "./EquipeVitrine.module.css";

export function GrupoAvataresEquipe({
  previa,
  limiteAvatares,
}: {
  readonly previa: PreviaEquipeVitrine;
  readonly limiteAvatares?: number | null;
}) {
  const avatares = previa.avatares.slice(0, limiteAvatares ?? undefined);
  const restantes = Math.max(0, previa.total - avatares.length);

  return (
    <span
      aria-hidden="true"
      className={combinarClasses(
        "flex min-w-0 flex-wrap items-center gap-y-2 pl-3 [&>*]:-ml-3",
        estilos.grupo,
      )}
    >
      {avatares.map((profissional) => (
        <span key={profissional.id} className={estilos.avatar}>
          <span className={estilos.movimento}>
            <AvatarProfissional
              nome={profissional.nomeCompleto}
              urlFoto={profissional.urlFotoPerfil}
              pontoFocal={profissional.pontoFocalFoto}
              tamanho="compacto"
              className={combinarClasses(
                "border-0 bg-[var(--editorial-superficie)] text-[var(--editorial-texto)] [&>span]:text-current",
                estilos.foto,
              )}
            />
          </span>
        </span>
      ))}
      {restantes > 0 ? (
        <span
          className={combinarClasses(
            "relative flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-[var(--editorial-superficie)] px-2 text-xs font-semibold text-[var(--editorial-texto)]",
            estilos.avatar,
          )}
        >
          +{restantes}
        </span>
      ) : null}
    </span>
  );
}
