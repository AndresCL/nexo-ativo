"use client";

import { createStore } from "zustand/vanilla";
import { LIMITE_MAXIMO_CHAMADAS_EDITORIAIS } from "@/dominio/entidades/chamadasEditoriais";
import type { ConfiguracaoAvaliacoesGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import type {
  ChamadaPrincipalEditorial,
  CoordenadasPontoFocal,
  CustomizacaoTokensEditorial,
  DestaqueObraGaleria,
  IdentidadeMarcaEditorial,
  IdentificadorPaletaEditorial,
  IdentificadorTipografiaEditorial,
  LinkRedeSocial,
  MetadadosSeoPublicos,
  MidiaFundoEditorial,
  TipoComposicaoEditorial,
} from "@/dominio/entidades/paginaPublicada";
import {
  criarRascunhoConfiguracaoPaginaPadrao,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { criarContextoEstadoIsolado } from "./criarContextoEstadoIsolado";

export type AbaEditorAparencia = "estilo" | "identidade" | "midia" | "acoes" | "galeria_seo";

export interface DadosIniciaisEditorAparencia {
  readonly rascunhoInicial: RascunhoConfiguracaoPagina;
  readonly versaoPublicadaInicial: number | null;
  readonly ultimoPublicadoEmIsoInicial: string | null;
}

export interface EstadoEditorAparencia {
  atualizarAvaliacoesGoogle: (configuracao: ConfiguracaoAvaliacoesGoogle) => void;
  readonly rascunho: RascunhoConfiguracaoPagina;
  readonly abaAtiva: AbaEditorAparencia;
  readonly possuiAlteracoesNaoSalvas: boolean;
  readonly versaoPublicadaAtual: number | null;
  readonly ultimoPublicadoEmIso: string | null;
  readonly ultimoSalvoEmIso: string | null;
  definirAbaAtiva: (aba: AbaEditorAparencia) => void;
  alterarEstiloVisual: (parcial: {
    readonly composicaoVisual?: TipoComposicaoEditorial;
    readonly paletaId?: IdentificadorPaletaEditorial;
    readonly corPersonalizadaHex?: string;
    readonly customizacaoTokens?: CustomizacaoTokensEditorial | null;
    readonly tipografiaId?: IdentificadorTipografiaEditorial;
  }) => void;
  atualizarIdentidade: (parcial: Partial<IdentidadeMarcaEditorial>) => void;
  atualizarChamadaEditorial: (
    parcial: Partial<ChamadaPrincipalEditorial>,
    indice?: number,
  ) => void;
  adicionarChamadaEditorial: () => void;
  removerChamadaEditorial: (indice: number) => void;
  atualizarMidiaFundo: (parcial: Partial<MidiaFundoEditorial>) => void;
  definirPontoFocalMidia: (
    dispositivo: "desktop" | "mobile",
    coordenadas: CoordenadasPontoFocal | undefined,
  ) => void;
  adicionarRedeSocial: () => void;
  atualizarRedeSocial: (redeId: string, parcial: Partial<LinkRedeSocial>) => void;
  removerRedeSocial: (redeId: string) => void;
  adicionarObraGaleria: () => void;
  atualizarObraGaleria: (obraId: string, parcial: Partial<DestaqueObraGaleria>) => void;
  removerObraGaleria: (obraId: string) => void;
  atualizarSeo: (parcial: Partial<MetadadosSeoPublicos>) => void;
  marcarRascunhoSalvo: (salvoEmIso: string) => void;
  registrarNovaPublicacao: (versaoPublicada: number, publicadoEmIso: string) => void;
}

function gerarIdentificadorCurto(prefixo: string): string {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function limitarPercentual(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 50;
  }
  return Math.min(100, Math.max(0, Math.round(valor)));
}

function criarStoreEditorAparencia(dadosIniciais?: DadosIniciaisEditorAparencia) {
  const rascunhoBase =
    dadosIniciais?.rascunhoInicial ??
    criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-local",
      nomeOrganizacao: "Minha Presença Digital",
    });

  return createStore<EstadoEditorAparencia>()((set) => ({
    rascunho: rascunhoBase,
    abaAtiva: "estilo",
    possuiAlteracoesNaoSalvas: false,
    versaoPublicadaAtual: dadosIniciais?.versaoPublicadaInicial ?? null,
    ultimoPublicadoEmIso: dadosIniciais?.ultimoPublicadoEmIsoInicial ?? null,
    ultimoSalvoEmIso: rascunhoBase.atualizadoEmIso,

    atualizarAvaliacoesGoogle: (avaliacoesGoogle) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: { ...estado.rascunho, avaliacoesGoogle },
      })),

    definirAbaAtiva: (aba) => set({ abaAtiva: aba }),

    alterarEstiloVisual: (parcial) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          ...(parcial.composicaoVisual ? { composicaoVisual: parcial.composicaoVisual } : {}),
          ...(parcial.paletaId ? { paletaId: parcial.paletaId } : {}),
          ...(parcial.corPersonalizadaHex !== undefined
            ? { corPersonalizadaHex: parcial.corPersonalizadaHex || undefined }
            : {}),
          ...(parcial.customizacaoTokens !== undefined
            ? {
              customizacaoTokens:
                parcial.customizacaoTokens === null
                  ? undefined
                  : {
                    ...(estado.rascunho.customizacaoTokens ?? {}),
                    ...parcial.customizacaoTokens,
                  },
            }
            : {}),
          ...(parcial.tipografiaId ? { tipografiaId: parcial.tipografiaId } : {}),
        },
      })),

    atualizarIdentidade: (parcial) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          identidade: {
            ...estado.rascunho.identidade,
            ...parcial,
          },
        },
      })),

    atualizarChamadaEditorial: (parcial, indice = 0) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          ...(indice === 0
            ? { chamadaEditorial: { ...estado.rascunho.chamadaEditorial, ...parcial } }
            : {
                chamadasEditoriaisAdicionais: (
                  estado.rascunho.chamadasEditoriaisAdicionais ?? []
                ).map((chamada, posicao) =>
                  posicao === indice - 1 ? { ...chamada, ...parcial } : chamada,
                ),
              }),
        },
      })),

    adicionarChamadaEditorial: () =>
      set((estado) => {
        const adicionais = estado.rascunho.chamadasEditoriaisAdicionais ?? [];
        if (adicionais.length >= LIMITE_MAXIMO_CHAMADAS_EDITORIAIS - 1) return estado;
        return {
          possuiAlteracoesNaoSalvas: true,
          rascunho: {
            ...estado.rascunho,
            chamadasEditoriaisAdicionais: [...adicionais, { tituloPrincipal: "" }],
          },
        };
      }),

    removerChamadaEditorial: (indice) =>
      set((estado) => {
        const chamadas = [
          estado.rascunho.chamadaEditorial,
          ...(estado.rascunho.chamadasEditoriaisAdicionais ?? []),
        ];
        if (chamadas.length <= 1 || !chamadas[indice]) return estado;
        const restantes = chamadas.filter((_, posicao) => posicao !== indice);
        return {
          possuiAlteracoesNaoSalvas: true,
          rascunho: {
            ...estado.rascunho,
            chamadaEditorial: restantes[0]!,
            chamadasEditoriaisAdicionais: restantes.slice(1),
          },
        };
      }),

    atualizarMidiaFundo: (parcial) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          midiaFundo: {
            ...estado.rascunho.midiaFundo,
            ...parcial,
          },
        },
      })),

    definirPontoFocalMidia: (dispositivo, coordenadas) =>
      set((estado) => {
        if (dispositivo === "desktop") {
          const seguras: CoordenadasPontoFocal = coordenadas
            ? {
              xPercentual: limitarPercentual(coordenadas.xPercentual),
              yPercentual: limitarPercentual(coordenadas.yPercentual),
            }
            : { xPercentual: 50, yPercentual: 50 };

          return {
            possuiAlteracoesNaoSalvas: true,
            rascunho: {
              ...estado.rascunho,
              midiaFundo: {
                ...estado.rascunho.midiaFundo,
                pontoFocalDesktop: seguras,
              },
            },
          };
        }

        const midiaSemMobile = { ...estado.rascunho.midiaFundo };
        if (!coordenadas) {
          delete (midiaSemMobile as { pontoFocalMobile?: CoordenadasPontoFocal }).pontoFocalMobile;
          return {
            possuiAlteracoesNaoSalvas: true,
            rascunho: {
              ...estado.rascunho,
              midiaFundo: midiaSemMobile,
            },
          };
        }

        return {
          possuiAlteracoesNaoSalvas: true,
          rascunho: {
            ...estado.rascunho,
            midiaFundo: {
              ...estado.rascunho.midiaFundo,
              pontoFocalMobile: {
                xPercentual: limitarPercentual(coordenadas.xPercentual),
                yPercentual: limitarPercentual(coordenadas.yPercentual),
              },
            },
          },
        };
      }),

    adicionarRedeSocial: () =>
      set((estado) => {
        if (estado.rascunho.redesSociais.length >= 9) {
          return estado;
        }

        const novaRede: LinkRedeSocial = {
          id: gerarIdentificadorCurto("rede"),
          rede: "instagram",
          url: "https://instagram.com/sua-marca",
          rotuloAcessivel: "Instagram oficial",
        };

        return {
          possuiAlteracoesNaoSalvas: true,
          rascunho: {
            ...estado.rascunho,
            redesSociais: [...estado.rascunho.redesSociais, novaRede],
          },
        };
      }),

    atualizarRedeSocial: (redeId, parcial) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          redesSociais: estado.rascunho.redesSociais.map((item) =>
            item.id === redeId ? { ...item, ...parcial } : item,
          ),
        },
      })),

    removerRedeSocial: (redeId) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          redesSociais: estado.rascunho.redesSociais.filter((item) => item.id !== redeId),
        },
      })),

    adicionarObraGaleria: () =>
      set((estado) => {
        if (estado.rascunho.obrasDestaqueGaleria.length >= 8) {
          return estado;
        }

        const numeroSequencial = estado.rascunho.obrasDestaqueGaleria.length + 1;
        const novaObra: DestaqueObraGaleria = {
          id: gerarIdentificadorCurto("obra"),
          tituloObra: `Projeto Autoral ${numeroSequencial}`,
          serieOuCategoria: "Série Selecionada",
          anoOuLocal: "Brasil",
          urlImagem: "/midias-demonstracao/galeria-obra-monolito.svg",
          textoAlternativo: `Fotografia do Projeto Autoral ${numeroSequencial}`,
          pontoFocal: { xPercentual: 50, yPercentual: 50 },
        };

        return {
          possuiAlteracoesNaoSalvas: true,
          rascunho: {
            ...estado.rascunho,
            obrasDestaqueGaleria: [...estado.rascunho.obrasDestaqueGaleria, novaObra],
          },
        };
      }),

    atualizarObraGaleria: (obraId, parcial) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          obrasDestaqueGaleria: estado.rascunho.obrasDestaqueGaleria.map((obra) =>
            obra.id === obraId ? { ...obra, ...parcial } : obra,
          ),
        },
      })),

    removerObraGaleria: (obraId) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          obrasDestaqueGaleria: estado.rascunho.obrasDestaqueGaleria.filter(
            (obra) => obra.id !== obraId,
          ),
        },
      })),

    atualizarSeo: (parcial) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: true,
        rascunho: {
          ...estado.rascunho,
          seo: {
            ...estado.rascunho.seo,
            ...parcial,
          },
        },
      })),

    marcarRascunhoSalvo: (salvoEmIso) =>
      set((estado) => ({
        possuiAlteracoesNaoSalvas: false,
        ultimoSalvoEmIso: salvoEmIso,
        rascunho: {
          ...estado.rascunho,
          atualizadoEmIso: salvoEmIso,
        },
      })),

    registrarNovaPublicacao: (versaoPublicada, publicadoEmIso) =>
      set({
        possuiAlteracoesNaoSalvas: false,
        versaoPublicadaAtual: versaoPublicada,
        ultimoPublicadoEmIso: publicadoEmIso,
        ultimoSalvoEmIso: publicadoEmIso,
      }),
  }));
}

const contextoEditorAparencia = criarContextoEstadoIsolado<
  EstadoEditorAparencia,
  DadosIniciaisEditorAparencia
>("EstadoEditorAparencia", criarStoreEditorAparencia);

export const ProvedorEstadoEditorAparencia = contextoEditorAparencia.ProvedorEstado;
export const useEstadoEditorAparencia = contextoEditorAparencia.useEstado;
