"use client";

import type { CSSProperties } from "react";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import { DURACAO_TROCA_EQUIPE_MS, useMovimentoEquipe } from "@/ganchos/usarMovimentoEquipe";
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
  const movimento = useMovimentoEquipe(avatares.length);

  function estiloEntrada(indice: number): CSSProperties {
    return { "--equipe-atraso": `${Math.min(indice, 3) * 80}ms` } as CSSProperties;
  }

  return (
    <span
      aria-hidden="true"
      ref={movimento.referenciaGrupo}
      data-apresentacao-liberada={movimento.apresentacaoLiberada}
      data-entrada-iniciada={movimento.entradaIniciada}
      data-movimento-ativo={movimento.movimentoAtivo}
      className={combinarClasses(
        "flex min-w-0 flex-wrap items-center gap-y-2 pl-3 [&>*]:-ml-3",
        estilos.grupo,
      )}
      style={{ "--equipe-tempo-troca": `${DURACAO_TROCA_EQUIPE_MS}ms` } as CSSProperties}
    >
      {avatares.map((profissional, indice) => (
        <span key={profissional.id} className={estilos.avatar} style={estiloEntrada(indice)}>
          <span
            className={estilos.movimento}
            data-em-movimento={movimento.indiceEmMovimento === indice}
          >
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
          style={estiloEntrada(avatares.length)}
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
