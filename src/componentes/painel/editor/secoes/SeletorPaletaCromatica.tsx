"use client";

import { ChevronDown, Palette } from "lucide-react";
import {
  CATALOGO_PALETAS_EDITORIAIS,
  type CustomizacaoTokensEditorial,
  type IdentificadorPaletaEditorial,
  type ModoFundoEquipeEditorial,
} from "@/dominio/entidades/composicaoEditorial";
import { resolverPaletaEditorialEfetiva } from "@/dominio/entidades/paginaPublicada";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { RascunhoConfiguracaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import type { EstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import { CampoCorElemento } from "./CampoCorElemento";
import { GrupoPersonalizacaoCores } from "./GrupoPersonalizacaoCores";
import { GRUPOS_PERSONALIZACAO_CORES_EDITORIAL } from "./catalogoPersonalizacaoCores";

export interface PropriedadesSeletorPaletaCromatica {
  readonly rascunho: RascunhoConfiguracaoPagina;
  readonly alterarEstiloVisual: EstadoEditorAparencia["alterarEstiloVisual"];
  readonly somenteLeitura?: boolean;
}

export function SeletorPaletaCromatica({
  rascunho,
  alterarEstiloVisual,
  somenteLeitura = false,
}: PropriedadesSeletorPaletaCromatica) {
  const paletaEfetiva = resolverPaletaEditorialEfetiva(
    rascunho.paletaId,
    rascunho.corPersonalizadaHex,
  );
  const tokens = rascunho.customizacaoTokens;
  const possuiTokensPersonalizados = Boolean(tokens && Object.keys(tokens).length > 0);
  const modoFundoEquipeAtual: ModoFundoEquipeEditorial =
    tokens?.modoFundoEquipe ?? "transparente";

  function atualizarModoFundoEquipe(modo: ModoFundoEquipeEditorial) {
    alterarEstiloVisual({
      customizacaoTokens: {
        modoFundoEquipe: modo === "transparente" ? undefined : modo,
      },
    });
  }

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

        {/* Ajuste fino opcional de elementos agrupados por tipo */}
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
                  Personalize elementos por grupo ou restaure para o padrão da paleta ativa.
                </p>
              </div>
              {possuiTokensPersonalizados ? (
                <button
                  type="button"
                  disabled={somenteLeitura}
                  onClick={() => alterarEstiloVisual({ customizacaoTokens: null })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-mineral-700 shadow-2xs hover:bg-slate-50 cursor-pointer disabled:opacity-60"
                >
                  Restaurar padrão
                </button>
              ) : (
                <span className="text-[11px] font-medium text-mineral-400">
                  Padrão ativo
                </span>
              )}
            </div>

            <div className="mt-3 space-y-3">
              {GRUPOS_PERSONALIZACAO_CORES_EDITORIAL.map((grupo) => {
                const ehGrupoEquipe = grupo.id === "equipe";
                const quantidadeCoresGrupo = grupo.campos.filter((campo) =>
                  Boolean(tokens?.[campo.chave]),
                ).length;
                const quantidadePersonalizada =
                  quantidadeCoresGrupo +
                  (ehGrupoEquipe && modoFundoEquipeAtual === "fixo" ? 1 : 0);

                function restaurarGrupo() {
                  const limpeza: Record<string, undefined> = {};
                  for (const campo of grupo.campos) {
                    limpeza[campo.chave] = undefined;
                  }
                  if (ehGrupoEquipe) {
                    limpeza.modoFundoEquipe = undefined;
                  }
                  alterarEstiloVisual({
                    customizacaoTokens: limpeza as CustomizacaoTokensEditorial,
                  });
                }

                const controleExtraEquipe = ehGrupoEquipe ? (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-medium text-mineral-900">
                          Fundo do bloco da equipe
                        </p>
                        <p className="text-[11px] text-mineral-500">
                          No modo fundo fixo, usa automaticamente Botões Secundários (Fundo e
                          Texto).
                        </p>
                      </div>
                      <div
                        role="group"
                        aria-label="Modo de fundo do bloco da equipe"
                        className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]"
                      >
                        {(
                          [
                            { valor: "transparente", rotulo: "Transparente" },
                            { valor: "fixo", rotulo: "Fundo fixo" },
                          ] as const
                        ).map((opcao) => {
                          const selecionado = modoFundoEquipeAtual === opcao.valor;
                          return (
                            <button
                              key={opcao.valor}
                              type="button"
                              disabled={somenteLeitura}
                              aria-pressed={selecionado}
                              onClick={() => atualizarModoFundoEquipe(opcao.valor)}
                              className={combinarClasses(
                                "rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer disabled:opacity-60",
                                selecionado
                                  ? "bg-mineral-950 text-white shadow-2xs"
                                  : "text-mineral-600 hover:text-mineral-950",
                              )}
                            >
                              {opcao.rotulo}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : undefined;

                return (
                  <GrupoPersonalizacaoCores
                    key={grupo.id}
                    titulo={grupo.titulo}
                    descricao={grupo.descricao}
                    quantidadePersonalizada={quantidadePersonalizada}
                    somenteLeitura={somenteLeitura}
                    aoRestaurarGrupo={restaurarGrupo}
                    controleExtra={controleExtraEquipe}
                  >
                    {grupo.campos.map((campo) => {
                      const valorOverride = tokens?.[campo.chave];
                      const valorAtual =
                        valorOverride || campo.obterPadrao(paletaEfetiva, tokens);

                      return (
                        <CampoCorElemento
                          key={campo.chave}
                          rotulo={campo.rotulo}
                          descricao={campo.descricao}
                          valorAtual={valorAtual}
                          personalizado={Boolean(valorOverride)}
                          somenteLeitura={somenteLeitura}
                          aoAlterar={(novaCor) =>
                            alterarEstiloVisual({
                              customizacaoTokens: { [campo.chave]: novaCor },
                            })
                          }
                          aoRestaurar={() =>
                            alterarEstiloVisual({
                              customizacaoTokens: { [campo.chave]: undefined },
                            })
                          }
                        />
                      );
                    })}
                  </GrupoPersonalizacaoCores>
                );
              })}
            </div>
          </div>
        </details>
      </CartaoSuperficie>
    </div>
  );
}
