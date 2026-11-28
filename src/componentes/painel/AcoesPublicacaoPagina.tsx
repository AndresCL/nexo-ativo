"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Globe, Save } from "lucide-react";
import type { ControlePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";
import { Botao } from "@/componentes/interface/Botao";

export function AcoesPublicacaoPagina({
  controle,
  identificadorPublico: _identificadorPublico,
  exibirSalvarRascunho = false,
  publicacaoBloqueada = false,
  motivoBloqueioPublicacao,
  orientacao,
  children,
}: {
  readonly controle: ControlePublicacaoPagina;
  readonly identificadorPublico: string;
  readonly exibirSalvarRascunho?: boolean;
  readonly publicacaoBloqueada?: boolean;
  readonly motivoBloqueioPublicacao?: string;
  readonly orientacao?: string;
  readonly children?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {exibirSalvarRascunho ? (
          <Botao
            variante="operacional_secundario"
            tamanho="compacto"
            className="rounded-lg border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100"
            disabled={!controle.podeSalvar}
            carregando={controle.salvando}
            textoCarregando="Salvando..."
            onClick={() => void controle.salvarRascunho()}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Salvar rascunho
          </Botao>
        ) : null}
        <Botao
          tamanho="compacto"
          className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={!controle.podePublicar || publicacaoBloqueada}
          title={publicacaoBloqueada ? motivoBloqueioPublicacao : undefined}
          carregando={controle.publicando}
          textoCarregando={
            controle.salvandoParaPublicar ? "Salvando e publicando..." : "Publicando..."
          }
          onClick={() => void controle.publicarPagina()}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          Publicar página
        </Botao>
      </div>
      {!controle.permitePublicacao && !publicacaoBloqueada ? (
        <p className="text-[11px] leading-relaxed text-amber-800">
          Requer plano ativo para publicar no link oficial.{" "}
          <Link href="/painel/assinatura" className="font-semibold underline hover:text-amber-950">
            Ativar plano Pro →
          </Link>
        </p>
      ) : (
        <>
          {controle.mensagemEstado ? (
            <p aria-live="polite" className="text-[11px] text-mineral-500">
              {controle.mensagemEstado}
            </p>
          ) : orientacao ? (
            <p className="max-w-md text-[11px] leading-relaxed text-mineral-500">{orientacao}</p>
          ) : null}
        </>
      )}
    </div>
  );
}
