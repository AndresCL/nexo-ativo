"use client";

import { useRef, useState } from "react";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import { construirUrlLocalGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import type {
  OrigemConsultaAvaliacoesGoogle,
  PortaAvaliacoesGoogleCliente,
} from "@/aplicacao/portas/portasAvaliacoesGoogle";
import { useAvaliacoesGoogle } from "@/ganchos/usarAvaliacoesGoogle";
import { PainelEditorialPublico } from "../PainelEditorialPublico";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CartaoAvaliacaoGoogle } from "./CartaoAvaliacaoGoogle";
import { CarrosselAvaliacoesGoogle } from "./CarrosselAvaliacoesGoogle";

export function BlocoAvaliacoesGoogle({
  pagina,
  previa = false,
  servico,
  className,
}: {
  readonly pagina: ConteudoPaginaPublicada;
  readonly previa?: boolean;
  readonly servico?: PortaAvaliacoesGoogleCliente;
  readonly className?: string;
}) {
  const configuracao = pagina.avaliacoesGoogle;
  const identificadorLocal = configuracao?.habilitado ? configuracao.identificadorLocal : undefined;
  const origem: OrigemConsultaAvaliacoesGoogle | undefined = !identificadorLocal
    ? undefined
    : previa
      ? { tipo: "previa", organizacaoId: pagina.organizacaoId, identificadorLocal }
      : { tipo: "publicada", identificadorPublico: pagina.identificadorPublico };

  const { dados, erro, carregando } = useAvaliacoesGoogle(origem, servico);
  const [aberto, alterarAbertura] = useState(false);
  const referenciaBotao = useRef<HTMLButtonElement>(null);

  if (!identificadorLocal || (dados?.totalAvaliacoes === 0 && !previa)) return null;
  const url = dados?.urlGoogleMaps ?? construirUrlLocalGoogle(identificadorLocal);

  const avaliacoesOrdenadas = dados?.avaliacoes
    ? [...dados.avaliacoes].sort((a, b) => {
        const dataA = a.publicadaEmIso ? new Date(a.publicadaEmIso).getTime() : 0;
        const dataB = b.publicadaEmIso ? new Date(b.publicadaEmIso).getTime() : 0;
        return dataB - dataA;
      })
    : [];

  return (
    <div
      className={combinarClasses("w-full max-w-xl text-left", className)}
      aria-busy={carregando}
    >
      {carregando ? (
        <p role="status" className="text-xs text-[var(--editorial-texto-secundario)]">
          Consultando avaliações…
        </p>
      ) : null}

      {erro && (
        <div className="text-xs">
          {previa ? <p role="alert">{erro}</p> : null}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Ver avaliações no Google
          </a>
        </div>
      )}

      {dados && dados.totalAvaliacoes > 0 ? (
        <>
          {configuracao?.modoExibicao === "carrossel" ? (
            /* Modo 2: Apenas a faixa de mini-cards horizontais */
            <CarrosselAvaliacoesGoogle
              key={identificadorLocal}
              avaliacoes={avaliacoesOrdenadas}
              aoSelecionar={() => alterarAbertura(true)}
            />
          ) : (
            /* Modo 1: Apenas o Pill Compacto de Avaliações */
            <button
              ref={referenciaBotao}
              type="button"
              onClick={() => alterarAbertura(true)}
              aria-haspopup="dialog"
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-current/20 bg-[var(--editorial-superficie)]/90 px-3.5 py-1.5 text-xs text-[var(--editorial-texto)] shadow-2xs backdrop-blur-xs transition-colors hover:border-current/40"
            >
              {dados.notaMedia !== undefined ? (
                <span
                  aria-label={`${dados.notaMedia.toLocaleString("pt-BR")} de 5 estrelas`}
                  className="font-semibold text-amber-500"
                >
                  ★ {dados.notaMedia.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                </span>
              ) : null}
              <span>
                · {dados.totalAvaliacoes.toLocaleString("pt-BR")}{" "}
                {dados.totalAvaliacoes === 1 ? "avaliação" : "avaliações"} no Google
              </span>
              <span className="font-medium underline underline-offset-2 opacity-80">
                Ver avaliações
              </span>
            </button>
          )}

          {/* Botão invisível de compatibilidade acessível quando em modo carrossel */}
          {configuracao?.modoExibicao === "carrossel" ? (
            <button
              ref={referenciaBotao}
              type="button"
              onClick={() => alterarAbertura(true)}
              aria-haspopup="dialog"
              className="sr-only"
            >
              {dados.notaMedia !== undefined ? (
                <span aria-label={`${dados.notaMedia.toLocaleString("pt-BR")} de 5 estrelas`}>
                  ★ {dados.notaMedia.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                </span>
              ) : null}
              <span>
                · {dados.totalAvaliacoes.toLocaleString("pt-BR")}{" "}
                {dados.totalAvaliacoes === 1 ? "avaliação" : "avaliações"} no Google
              </span>
            </button>
          ) : null}

          {/* Bottom Sheet com os depoimentos completos */}
          <PainelEditorialPublico
            pagina={pagina}
            titulo="Avaliações no Google"
            aberto={aberto}
            aoAlterarAbertura={alterarAbertura}
            referenciaRetornoFoco={referenciaBotao}
          >
            <div className="mt-4 space-y-3">
              {avaliacoesOrdenadas.map((avaliacao) => (
                <CartaoAvaliacaoGoogle key={avaliacao.id} avaliacao={avaliacao} />
              ))}

              <div className="pt-2 text-center">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-current/20 px-4 text-xs font-semibold underline-offset-4 hover:underline"
                >
                  Ver todas no Google
                </a>
              </div>
            </div>
          </PainelEditorialPublico>
        </>
      ) : null}
    </div>
  );
}
