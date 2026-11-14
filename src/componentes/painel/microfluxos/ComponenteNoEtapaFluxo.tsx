"use client";

import { useEffect, useMemo } from "react";
import { Handle, Position, useUpdateNodeInternals, type Node, type NodeProps } from "@xyflow/react";
import {
  CheckCircle2,
  DollarSign,
  FileText,
  HelpCircle,
  MessageSquare,
  Package,
  Play,
  Sparkles,
  UserCheck,
  Wrench,
} from "lucide-react";
import type { SaidaOpcaoEditor } from "./estruturaEditorFluxo";
import type { TipoEtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface DadosNoEtapaFluxo extends Record<string, unknown> {
  readonly id: string;
  readonly indice: number;
  readonly tipoEtapa: TipoEtapaMicrofluxo;
  readonly rotuloTipo?: string;
  readonly rotuloModelo?: string;
  readonly saidas?: readonly SaidaOpcaoEditor[];
  readonly titulo: string;
  readonly subtituloOpcional?: string;
  readonly ehInicial: boolean;
  readonly selecionado: boolean;
  readonly quantidadeOpcoes?: number;
  readonly quantidadeCampos?: number;
}

export type TipoNoFluxo = Node<DadosNoEtapaFluxo, "etapaFluxo">;

function obterIconeEtapa(tipo: TipoEtapaMicrofluxo) {
  switch (tipo) {
    case "selecao_unica":
    case "selecao_multipla":
      return <HelpCircle className="h-4 w-4 text-amber-700" aria-hidden="true" />;
    case "selecao_catalogo":
    case "selecao_produto":
      return <Package className="h-4 w-4 text-indigo-700" aria-hidden="true" />;
    case "selecao_servico":
      return <Wrench className="h-4 w-4 text-amber-700" aria-hidden="true" />;
    case "selecao_profissional":
      return <UserCheck className="h-4 w-4 text-purple-700" aria-hidden="true" />;
    case "recomendacao_catalogo":
      return <Sparkles className="h-4 w-4 text-emerald-700" aria-hidden="true" />;
    case "etapa_livre":
    case "formulario_dinamico":
      return <FileText className="h-4 w-4 text-sky-700" aria-hidden="true" />;
    case "instrucao_pix_manual":
      return <DollarSign className="h-4 w-4 text-emerald-800" aria-hidden="true" />;
    case "coleta_contato":
    case "conectar_whatsapp":
      return <MessageSquare className="h-4 w-4 text-emerald-700" aria-hidden="true" />;
    default:
      return <HelpCircle className="h-4 w-4 text-mineral-700" aria-hidden="true" />;
  }
}

function obterRotuloTipoEtapa(tipo: TipoEtapaMicrofluxo): string {
  switch (tipo) {
    case "selecao_unica":
      return "Pergunta de Escolha Única";
    case "selecao_multipla":
      return "Múltipla Escolha";
    case "selecao_catalogo":
    case "selecao_produto":
      return "Catálogo";
    case "selecao_servico":
      return "Serviços";
    case "selecao_profissional":
      return "Escolha do Especialista";
    case "recomendacao_catalogo":
      return "Recomendação Inteligente";
    case "etapa_livre":
    case "formulario_dinamico":
      return "Etapa livre";
    case "instrucao_pix_manual":
      return "Sinal via Pix Direto";
    case "coleta_contato":
      return "Dados do Cliente (Lead)";
    case "conectar_whatsapp":
      return "Conexão WhatsApp Comercial";
    case "entrada_curta":
      return "Campo de Texto";
    default:
      return "Etapa Interativa";
  }
}

export function ComponenteNoEtapaFluxo({ id, data }: NodeProps<TipoNoFluxo>) {
  const atualizarPortas = useUpdateNodeInternals();
  useEffect(() => {
    atualizarPortas(id);
  }, [id, data.saidas, atualizarPortas]);
  const icone = useMemo(
    () =>
      obterIconeEtapa(
        data.rotuloTipo === "Catálogo"
          ? "selecao_catalogo"
          : data.rotuloTipo === "Equipe"
            ? "selecao_profissional"
            : data.rotuloTipo === "Dados para retorno"
              ? "coleta_contato"
              : data.rotuloTipo?.includes("escolha")
                ? "selecao_unica"
                : data.tipoEtapa,
      ),
    [data.tipoEtapa, data.rotuloTipo],
  );
  const rotuloTipo = data.rotuloTipo ?? obterRotuloTipoEtapa(data.tipoEtapa);

  return (
    <div
      className={combinarClasses(
        "relative w-72 rounded-xl border bg-white p-4 shadow-sm transition-all",
        data.selecionado
          ? "border-mineral-950 ring-2 ring-mineral-950/20 shadow-md"
          : "border-marfim-300 hover:border-mineral-700",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-4 !w-4 !border-2 !border-white !bg-mineral-700"
      />

      <div className="flex items-center justify-between gap-2 border-b border-marfim-200 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-marfim-200 text-[11px] font-semibold text-mineral-950">
            {data.indice}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-mineral-600 uppercase">
            {rotuloTipo}
          </span>
        </div>

        {data.ehInicial ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            <Play className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
            Entrada
          </span>
        ) : null}
      </div>

      {data.rotuloModelo ? (
        <p className="mt-2 text-[10px] text-mineral-500">Modelo: {data.rotuloModelo}</p>
      ) : null}
      <div className="mt-2.5 flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0 rounded-md bg-marfim-100 p-1.5">{icone}</div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-mineral-950">{data.titulo}</h4>
          {data.subtituloOpcional ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-mineral-600">{data.subtituloOpcional}</p>
          ) : null}
        </div>
      </div>

      {!data.saidas?.length && data.quantidadeOpcoes && data.quantidadeOpcoes > 0 ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-md bg-marfim-50 px-2.5 py-1 text-[11px] text-mineral-700">
          <CheckCircle2 className="h-3 w-3 text-mineral-500" aria-hidden="true" />
          <span>{data.quantidadeOpcoes} opções configuradas</span>
        </div>
      ) : null}

      {data.quantidadeCampos && data.quantidadeCampos > 0 ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-[11px] text-sky-800">
          <FileText className="h-3 w-3 text-sky-600" aria-hidden="true" />
          <span>
            {data.quantidadeCampos} {data.tipoEtapa === "etapa_livre" ? "elementos" : "campos"}{" "}
            configurados
          </span>
        </div>
      ) : null}

      {data.saidas?.length ? (
        <div className="mt-3 space-y-1.5 border-t border-marfim-200 pt-2">
          <p className="mb-1 text-[10px] font-medium text-mineral-500">Saídas por resposta</p>
          {data.saidas.map((saida) => (
            <div
              key={saida.id}
              className="relative flex min-h-8 items-center rounded bg-marfim-50 px-2 pr-4"
            >
              <span className="truncate text-[11px] text-mineral-800" title={saida.rotulo}>
                {saida.rotulo}
              </span>
              <Handle
                id={saida.id}
                type="source"
                position={Position.Right}
                title={`Conectar resposta: ${saida.rotulo}`}
                aria-label={`Saída: ${saida.rotulo}`}
                style={{ right: -18, top: "50%" }}
                className="!h-4 !w-4 !border-2 !border-white !bg-amber-700"
              />
            </div>
          ))}
        </div>
      ) : null}
      <div className="relative mt-3 border-t border-marfim-200 pt-2 text-right text-[10px] text-mineral-500">
        {data.saidas?.length ? "Caminho padrão" : "Continuar"}
        <Handle
          id="padrao"
          type="source"
          position={Position.Bottom}
          title="Conectar caminho padrão"
          aria-label="Saída padrão"
          className="!h-4 !w-4 !border-2 !border-white !bg-mineral-950"
          style={{ bottom: -22 }}
        />
      </div>
    </div>
  );
}
