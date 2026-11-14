"use client";

import {
  obterChamadasEditoriais,
  type ConjuntoChamadasEditoriais,
} from "@/dominio/entidades/chamadasEditoriais";
import { useRotacaoChamadasEditoriais } from "@/ganchos/usarRotacaoChamadasEditoriais";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  BlocoTituloEditorial,
  type PropriedadesBlocoTituloEditorial,
} from "./BlocoTituloEditorial";
import { IndicadoresChamadasEditoriais } from "./IndicadoresChamadasEditoriais";
import estilos from "./CarrosselChamadasEditoriais.module.css";

interface PropriedadesCarrosselChamadasEditoriais extends Omit<
  PropriedadesBlocoTituloEditorial,
  "chamada" | "nivelTitulo"
> {
  readonly conjunto: ConjuntoChamadasEditoriais;
}

export function CarrosselChamadasEditoriais({
  conjunto,
  className,
  ...propriedadesTitulo
}: PropriedadesCarrosselChamadasEditoriais) {
  const chamadas = obterChamadasEditoriais(conjunto);
  const rotacao = useRotacaoChamadasEditoriais(chamadas.length);

  if (chamadas.length === 1) {
    return (
      <BlocoTituloEditorial chamada={chamadas[0]!} className={className} {...propriedadesTitulo} />
    );
  }

  return (
    <section
      aria-label="Chamadas editoriais"
      aria-roledescription="carrossel"
      className={className}
      onKeyDown={(evento) => {
        if (evento.key === "ArrowRight" || evento.key === "ArrowLeft") {
          evento.preventDefault();
          rotacao.selecionarChamada(rotacao.indiceAtivo + (evento.key === "ArrowRight" ? 1 : -1));
        }
      }}
    >
      <div className="grid" aria-live={rotacao.rotacaoAtiva ? "off" : "polite"} aria-atomic="true">
        {chamadas.map((chamada, indice) => (
          <div
            key={indice}
            role="group"
            aria-roledescription="slide"
            aria-label={`${indice + 1} de ${chamadas.length}`}
            aria-hidden={indice !== rotacao.indiceAtivo}
            className={combinarClasses(
              "col-start-1 row-start-1",
              indice === rotacao.indiceAtivo
                ? estilos.entrada
                : "hidden pointer-events-none @5xl:block @5xl:invisible",
            )}
          >
            <BlocoTituloEditorial
              chamada={chamada}
              nivelTitulo={indice === rotacao.indiceAtivo ? "h1" : "h2"}
              {...propriedadesTitulo}
            />
          </div>
        ))}
      </div>
      <IndicadoresChamadasEditoriais
        chamadas={chamadas}
        rotacao={rotacao}
        alinharCentroNoMobile={propriedadesTitulo.alinharCentroNoMobile}
      />
    </section>
  );
}
