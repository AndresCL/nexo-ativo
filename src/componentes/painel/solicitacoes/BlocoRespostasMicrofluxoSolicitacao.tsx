"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ClipboardList, Copy, MessageSquareText } from "lucide-react";
import type { ItemRespostaRegistradaSolicitacao } from "@/dominio/entidades/solicitacaoComercial";

export interface PropriedadesBlocoRespostasMicrofluxoSolicitacao {
  readonly respostas: readonly ItemRespostaRegistradaSolicitacao[];
  readonly mensagemAdicional?: string;
}

export function dividirOpcoesResposta(texto: string): readonly string[] {
  const partes = texto
    .split(" · ")
    .map((parte) => parte.trim())
    .filter((parte) => parte.length > 0);
  return partes.length > 1 ? partes : [texto.trim()];
}

export function formatarResumoRespostasParaCopia(
  respostas: readonly ItemRespostaRegistradaSolicitacao[],
  mensagemAdicional?: string,
): string {
  const linhas = respostas.map(
    (resp, indice) => `${indice + 1}. ${resp.pergunta}\n   → ${resp.respostaTexto}`,
  );
  if (mensagemAdicional?.trim()) {
    linhas.push(`Observação complementar:\n   "${mensagemAdicional.trim()}"`);
  }
  return linhas.join("\n\n");
}

export function BlocoRespostasMicrofluxoSolicitacao({
  respostas,
  mensagemAdicional,
}: PropriedadesBlocoRespostasMicrofluxoSolicitacao) {
  const [copiado, setCopiado] = useState(false);
  const temporizadorCopiaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (temporizadorCopiaRef.current) {
        clearTimeout(temporizadorCopiaRef.current);
      }
    };
  }, []);

  if (respostas.length === 0 && !mensagemAdicional?.trim()) {
    return null;
  }

  const totalRespostas = respostas.length;

  async function copiarResumo() {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      const texto = formatarResumoRespostasParaCopia(respostas, mensagemAdicional);
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      if (temporizadorCopiaRef.current) {
        clearTimeout(temporizadorCopiaRef.current);
      }
      temporizadorCopiaRef.current = setTimeout(() => {
        setCopiado(false);
      }, 2200);
    } catch {
      // Silencia erro caso o navegador bloqueie acesso à área de transferência
    }
  }

  return (
    <section
      aria-labelledby="titulo-respostas-microfluxo"
      data-testid="bloco-respostas-microfluxo"
      className="space-y-4 rounded-2xl border border-marfim-200/90 bg-gradient-to-b from-marfim-50/90 to-marfim-50/40 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-marfim-200 bg-white text-mineral-700 shadow-2xs">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                id="titulo-respostas-microfluxo"
                className="text-xs font-bold tracking-wide text-mineral-900 uppercase"
              >
                Respostas do Visitante
              </h3>
              {totalRespostas > 0 ? (
                <span className="inline-flex items-center rounded-full border border-marfim-200 bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-mineral-600">
                  {totalRespostas} {totalRespostas === 1 ? "etapa" : "etapas"}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-mineral-500">
              Escolhas registradas durante o microfluxo na vitrine
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void copiarResumo()}
          aria-label="Copiar resumo das respostas do visitante"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-marfim-300/90 bg-white px-2.5 text-[11px] font-semibold text-mineral-700 shadow-2xs transition hover:border-mineral-400 hover:bg-marfim-50 hover:text-mineral-950 focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          {copiado ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span className="text-emerald-700">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-mineral-500" aria-hidden="true" />
              <span>Copiar resumo</span>
            </>
          )}
        </button>
      </div>

      {respostas.length > 0 ? (
        <dl className="space-y-2.5">
          {respostas.map((resp, indice) => {
            const opcoes = dividirOpcoesResposta(resp.respostaTexto);
            const ehMultiplaEscolha = opcoes.length > 1;
            const numeroEtapa = String(indice + 1).padStart(2, "0");

            return (
              <div
                key={resp.etapaId}
                className="rounded-xl border border-marfim-200/80 bg-white p-3.5 shadow-2xs transition-colors hover:border-marfim-300"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-marfim-100 text-[10px] font-bold tabular-nums text-mineral-600"
                  >
                    {numeroEtapa}
                  </span>

                  <div className="min-w-0 flex-1">
                    <dt className="text-[11px] font-medium leading-snug text-mineral-500">
                      {resp.pergunta}
                    </dt>

                    <dd className="mt-1.5">
                      {ehMultiplaEscolha ? (
                        <ul className="flex flex-wrap gap-1.5">
                          {opcoes.map((opcao) => (
                            <li
                              key={opcao}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-marfim-200 bg-marfim-50/80 px-2.5 py-1 text-xs font-semibold text-mineral-900"
                            >
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-mineral-500"
                                aria-hidden="true"
                              />
                              <span>{opcao}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="block text-sm font-semibold leading-snug text-mineral-950">
                          {resp.respostaTexto}
                        </span>
                      )}
                    </dd>
                  </div>
                </div>
              </div>
            );
          })}
        </dl>
      ) : null}

      {mensagemAdicional?.trim() ? (
        <div className="rounded-xl border border-amber-200/80 border-l-4 border-l-amber-400 bg-amber-50/60 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
            <MessageSquareText className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
            <span>Observação complementar do visitante</span>
          </div>
          <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-mineral-900">
            {mensagemAdicional}
          </p>
        </div>
      ) : null}
    </section>
  );
}

