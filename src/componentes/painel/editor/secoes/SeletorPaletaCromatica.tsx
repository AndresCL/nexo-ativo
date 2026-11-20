"use client";

import { ChevronDown, Palette } from "lucide-react";
import {
  CATALOGO_PALETAS_EDITORIAIS,
  type IdentificadorPaletaEditorial,
} from "@/dominio/entidades/composicaoEditorial";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { RascunhoConfiguracaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";

export interface PropriedadesSeletorPaletaCromatica {
  readonly rascunho: RascunhoConfiguracaoPagina;
  readonly alterarEstiloVisual: (atualizacao: Partial<RascunhoConfiguracaoPagina>) => void;
  readonly somenteLeitura?: boolean;
}

export function SeletorPaletaCromatica({
  rascunho,
  alterarEstiloVisual,
  somenteLeitura = false,
}: PropriedadesSeletorPaletaCromatica) {
  return (
    <div className="space-y-2.5">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-100 text-mineral-700">
            <Palette className="h-3 w-3" aria-hidden="true" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-mineral-950">
            Paleta de cores
          </h2>
        </div>
        <p className="text-xs text-mineral-600">
          Combinações refinadas com contraste ideal para leitura em tela.
        </p>
      </div>

      <CartaoSuperficie className="space-y-5 rounded-2xl bg-white p-4 shadow-2xs sm:p-5">
        <div className="grid gap-2.5 sm:grid-cols-2">
        {(Object.keys(CATALOGO_PALETAS_EDITORIAIS) as IdentificadorPaletaEditorial[]).map(
          (codigo) => {
            const paleta = CATALOGO_PALETAS_EDITORIAIS[codigo];
            const ativa = rascunho.paletaId === codigo;
            return (
              <button
                key={codigo}
                type="button"
                disabled={somenteLeitura}
                aria-pressed={ativa}
                onClick={() => alterarEstiloVisual({ paletaId: codigo })}
                className={combinarClasses(
                  "flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer disabled:opacity-60",
                  ativa
                    ? "border-mineral-950 bg-mineral-950 text-white shadow-xs"
                    : "border-neutral-200 bg-white text-mineral-950 hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <div>
                  <p
                    className={combinarClasses(
                      "text-xs font-semibold",
                      ativa ? "text-white" : "text-mineral-950",
                    )}
                  >
                    {paleta.nome}
                  </p>
                  <p
                    className={combinarClasses(
                      "text-[11px]",
                      ativa ? "text-white/70" : "text-mineral-500",
                    )}
                  >
                    {paleta.temaEscuro ? "Visual escuro" : "Visual claro"}
                  </p>
                </div>
                <span className="flex items-center -space-x-1.5" aria-hidden="true">
                  <span
                    style={{ backgroundColor: paleta.corFundoPrincipal }}
                    className="h-5 w-5 rounded-full border border-black/15 shadow-xs"
                  />
                  <span
                    style={{ backgroundColor: paleta.corDestaque }}
                    className="h-5 w-5 rounded-full border border-black/15 shadow-xs"
                  />
                  <span
                    style={{ backgroundColor: paleta.corTextoPrincipal }}
                    className="h-5 w-5 rounded-full border border-black/15 shadow-xs"
                  />
                </span>
              </button>
            );
          },
        )}
      </div>

      {/* Ajuste fino opcional de elementos */}
      <details className="group rounded-xl border border-slate-200 bg-white">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-xs font-semibold text-mineral-700 hover:text-mineral-950">
          Personalizar cores dos elementos
          <ChevronDown
            className="h-4 w-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="border-t border-slate-100 p-4">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs font-semibold text-mineral-950">
                Cores dos elementos
              </h3>
              <p className="text-[11px] text-mineral-500">
                Personalize elementos pontuais ou restaure para o padrão do tema.
              </p>
            </div>
            {rascunho.customizacaoTokens &&
            Object.keys(rascunho.customizacaoTokens).length > 0 ? (
              <button
                type="button"
                disabled={somenteLeitura}
                onClick={() => alterarEstiloVisual({ customizacaoTokens: undefined })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-mineral-700 shadow-2xs hover:bg-slate-50"
              >
                Restaurar padrão
              </button>
            ) : (
              <span className="text-[11px] font-medium text-mineral-400">
                Padrão ativo
              </span>
            )}
          </div>

          <div className="mt-2 divide-y divide-slate-100 text-xs">
            {[
              {
                chave: "corDestaque" as const,
                rotulo: "Destaques e etiquetas",
                descricao: "Sobretítulo, tags e selos de foco",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corDestaque,
              },
              {
                chave: "corTextoPrincipal" as const,
                rotulo: "Título Principal",
                descricao: "Nome da marca e títulos da vitrine",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corTextoPrincipal,
              },
              {
                chave: "corTextoSecundario" as const,
                rotulo: "Subtítulo & Apoio",
                descricao: "Descrições de apoio e legendas",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corTextoSecundario,
              },
              {
                chave: "corFundoPrincipal" as const,
                rotulo: "Fundo Geral",
                descricao: "Base de fundo da vitrine",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corFundoPrincipal,
              },
              {
                chave: "corSuperficie" as const,
                rotulo: "Fundo dos cartões",
                descricao: "Superfície dos blocos e botões de apoio",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corSuperficie,
              },
              {
                chave: "corBorda" as const,
                rotulo: "Bordas & Linhas",
                descricao: "Contornos de cartões e divisores",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corBorda,
              },
              {
                chave: "corCtaFundo" as const,
                rotulo: "Botão principal (Fundo)",
                descricao: "Fundo da ação principal de conversão",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corCtaFundo,
              },
              {
                chave: "corCtaTexto" as const,
                rotulo: "Botão principal (Texto)",
                descricao: "Cor do texto dentro do botão principal",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corCtaTexto,
              },
              {
                chave: "corSecundarioFundo" as const,
                rotulo: "Botões Secundários (Fundo)",
                descricao: "Fundo dos botões de canais secundários",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corSecundarioFundo,
              },
              {
                chave: "corSecundarioTexto" as const,
                rotulo: "Botões Secundários (Texto)",
                descricao: "Texto e ícones dos botões secundários",
                padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corSecundarioTexto,
              },
            ].map((token) => {
              const valorAtual = rascunho.customizacaoTokens?.[token.chave] || token.padrao;

              return (
                <div
                  key={token.chave}
                  className="flex flex-col gap-1.5 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-mineral-900">{token.rotulo}</p>
                    <p className="text-[11px] text-mineral-500">{token.descricao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={`Selecionar cor: ${token.rotulo}`}
                      disabled={somenteLeitura}
                      value={valorAtual.startsWith("#") ? valorAtual : "#ffffff"}
                      onChange={(e) =>
                        alterarEstiloVisual({
                          customizacaoTokens: { [token.chave]: e.target.value },
                        })
                      }
                      className="h-7 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      aria-label={`Código da cor: ${token.rotulo}`}
                      disabled={somenteLeitura}
                      value={valorAtual}
                      onChange={(e) =>
                        alterarEstiloVisual({
                          customizacaoTokens: { [token.chave]: e.target.value },
                        })
                      }
                      className="w-24 rounded border border-slate-300 px-2 py-0.5 font-mono text-[11px] text-mineral-900 focus:border-mineral-950 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </details>
    </CartaoSuperficie>
  </div>
  );
}
