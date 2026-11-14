"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Sparkles, Star, Trash2 } from "lucide-react";
import type { MidiaItemCatalogo } from "@/dominio/entidades/catalogoConteudo";
import { deveIgnorarOtimizadorImagem } from "@/dominio/entidades/paginaPublicada";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import { Botao } from "@/componentes/interface/Botao";
import { CampoUploadMidiaStorage } from "@/componentes/painel/editor/CampoUploadMidiaStorage";
import { SeletorPontoFocalMidia } from "@/componentes/painel/editor/SeletorPontoFocalMidia";

const IMAGENS_TESTE_PADRAO: readonly MidiaItemCatalogo[] = [
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    textoAlternativo: "Ambiente principal iluminado com acabamento contemporâneo",
    pontoFocal: { xPercentual: 50, yPercentual: 50 },
  },
  {
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    textoAlternativo: "Detalhe arquitetônico e integração de espaços",
    pontoFocal: { xPercentual: 50, yPercentual: 50 },
  },
  {
    url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    textoAlternativo: "Vista complementar com mobiliário e materiais naturais",
    pontoFocal: { xPercentual: 50, yPercentual: 50 },
  },
];

export interface PropriedadesEditorListaImagensCatalogo {
  readonly organizacaoId: string;
  readonly rotulo: string;
  readonly imagens: readonly MidiaItemCatalogo[];
  readonly aoAlterarImagens: (imagens: readonly MidiaItemCatalogo[]) => void;
  readonly servicoUpload: ServicoCatalogoConteudoPorta;
  readonly desabilitado?: boolean;
  readonly obrigatorio?: boolean;
  readonly tituloFallback?: string;
}

/**
 * Editor reutilizável para gerenciar múltiplas imagens de serviços e portfólio.
 */
export function EditorListaImagensCatalogo({
  organizacaoId,
  rotulo,
  imagens,
  aoAlterarImagens,
  servicoUpload,
  desabilitado = false,
  obrigatorio = false,
  tituloFallback = "Imagem do catálogo",
}: PropriedadesEditorListaImagensCatalogo) {
  const [urlNovaImagem, setUrlNovaImagem] = useState("");
  const imagemPrincipal = imagens[0];

  const adicionarImagem = (url: string) => {
    const limpa = url.trim();
    if (!limpa) return;
    if (imagens.some((item) => item.url === limpa)) {
      setUrlNovaImagem("");
      return;
    }
    aoAlterarImagens([
      ...imagens,
      {
        url: limpa,
        pontoFocal: { xPercentual: 50, yPercentual: 50 },
      },
    ]);
    setUrlNovaImagem("");
  };

  const removerImagem = (indice: number) => {
    aoAlterarImagens(imagens.filter((_, idx) => idx !== indice));
  };

  const definirComoPrincipal = (indice: number) => {
    if (indice <= 0 || indice >= imagens.length) return;
    const escolhida = imagens[indice];
    if (!escolhida) return;
    const restantes = imagens.filter((_, idx) => idx !== indice);
    aoAlterarImagens([escolhida, ...restantes]);
  };

  const adicionarImagensTeste = () => {
    const existentes = new Set(imagens.map((i) => i.url));
    const novas = IMAGENS_TESTE_PADRAO.filter((i) => !existentes.has(i.url));
    if (novas.length === 0) return;
    aoAlterarImagens([...imagens, ...novas].slice(0, 12));
  };

  return (
    <div className="space-y-3 rounded-xl border border-marfim-200 bg-marfim-50/50 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-mineral-800">
          {rotulo} ({imagens.length}/12)
          {obrigatorio ? <span className="ml-1 text-red-600">*</span> : null}
        </span>
        <Botao
          type="button"
          variante="operacional_secundario"
          tamanho="compacto"
          disabled={desabilitado || imagens.length >= 12}
          onClick={adicionarImagensTeste}
          className="text-[11px]"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Adicionar imagens de teste
        </Botao>
      </div>

      <CampoUploadMidiaStorage
        organizacaoId={organizacaoId}
        rotulo="Adicionar foto"
        categoria="imagem"
        desabilitado={desabilitado || imagens.length >= 12}
        valorUrl={urlNovaImagem}
        servicoUpload={servicoUpload}
        aoAlterarUrl={(novaUrl) => {
          setUrlNovaImagem(novaUrl);
          if (novaUrl.trim()) {
            adicionarImagem(novaUrl);
          }
        }}
      />

      {imagens.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {imagens.map((item, idx) => (
            <div
              key={`${item.url}-${idx}`}
              className="group relative overflow-hidden rounded-lg border border-marfim-200 bg-white"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={item.url}
                  alt={item.textoAlternativo || `${tituloFallback} ${idx + 1}`}
                  fill
                  sizes="120px"
                  unoptimized={deveIgnorarOtimizadorImagem(item.url)}
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                <button
                  type="button"
                  disabled={desabilitado || idx === 0}
                  onClick={() => definirComoPrincipal(idx)}
                  title={idx === 0 ? "Imagem principal" : "Definir como principal"}
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium text-mineral-700 disabled:opacity-50"
                >
                  <Star
                    className={`h-3 w-3 ${idx === 0 ? "fill-amber-400 text-amber-500" : ""}`}
                    aria-hidden="true"
                  />
                  {idx === 0 ? "Principal" : "Capa"}
                </button>
                <button
                  type="button"
                  disabled={desabilitado}
                  onClick={() => removerImagem(idx)}
                  aria-label={`Remover imagem ${idx + 1}`}
                  className="rounded p-0.5 text-mineral-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {imagemPrincipal ? (
        <details className="group overflow-hidden rounded-xl border border-marfim-200 bg-white">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-semibold text-mineral-700">
            Ajustar enquadramento da imagem principal
            <ChevronDown
              className="h-4 w-4 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="border-t border-marfim-100 p-3">
            <SeletorPontoFocalMidia
              urlImagemVisualizacao={imagemPrincipal.url}
              textoAlternativo={imagemPrincipal.textoAlternativo || tituloFallback}
              pontoFocalDesktop={imagemPrincipal.pontoFocal ?? { xPercentual: 50, yPercentual: 50 }}
              desabilitado={desabilitado}
              aoAlterarPontoFocal={(_disp, coord) => {
                if (!coord) return;
                const atualizada: MidiaItemCatalogo = {
                  ...imagemPrincipal,
                  pontoFocal: coord,
                };
                aoAlterarImagens([atualizada, ...imagens.slice(1)]);
              }}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}
