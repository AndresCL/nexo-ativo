"use client";

import type { ChamadaPrincipalEditorial } from "@/dominio/entidades/chamadasEditoriais";
import {
  INTERVALO_ROTACAO_CHAMADAS_MS,
  type useRotacaoChamadasEditoriais,
} from "@/ganchos/usarRotacaoChamadasEditoriais";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import estilos from "./IndicadoresChamadasEditoriais.module.css";

interface PropriedadesIndicadoresChamadasEditoriais {
  readonly chamadas: readonly ChamadaPrincipalEditorial[];
  readonly rotacao: ReturnType<typeof useRotacaoChamadasEditoriais>;
  readonly alinharCentroNoMobile?: boolean;
}

export function IndicadoresChamadasEditoriais({
  chamadas,
  rotacao,
  alinharCentroNoMobile = true,
}: PropriedadesIndicadoresChamadasEditoriais) {
  const temDescricao = Boolean(chamadas[rotacao.indiceAtivo]?.descricaoCurta);

  return (
    <div
      className={combinarClasses(
        "flex items-center",
        temDescricao ? "@5xl:mt-5" : "mt-2 @5xl:mt-5",
        alinharCentroNoMobile && "justify-center @5xl:justify-start",
      )}
    >
      {chamadas.map((chamada, indice) => (
        <button
          key={indice}
          type="button"
          aria-label={`Exibir chamada ${indice + 1}: ${chamada.sobretituloOpcional || chamada.tituloPrincipal}`}
          aria-pressed={indice === rotacao.indiceAtivo}
          className="group inline-flex h-10 w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-destaque)]"
          onClick={() => rotacao.selecionarChamada(indice)}
        >
          <span
            aria-hidden="true"
            className={combinarClasses(
              estilos.ponto,
              indice === rotacao.indiceAtivo && estilos.ativo,
            )}
          >
            {indice === rotacao.indiceAtivo ? (
              <span
                key={`${rotacao.ciclo}-${chamadas.length}`}
                className={estilos.preenchimento}
                style={{
                  animationDuration: `${INTERVALO_ROTACAO_CHAMADAS_MS}ms`,
                  animationPlayState: rotacao.rotacaoAtiva ? "running" : "paused",
                }}
              />
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
