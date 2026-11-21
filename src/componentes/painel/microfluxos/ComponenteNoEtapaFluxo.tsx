"use client";

import { useEffect, useMemo } from "react";
import { Handle, Position, useUpdateNodeInternals, type Node, type NodeProps } from "@xyflow/react";
import {
  AlertCircle,
  AlertTriangle,
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
  readonly possuiPendencia?: boolean;
}

export type TipoNoFluxo = Node<DadosNoEtapaFluxo, "etapaFluxo">;

function obterIconeEtapa(tipo: TipoEtapaMicrofluxo) {
  switch (tipo) {
    case "selecao_unica":
    case "selecao_multipla":
      return <HelpCircle className="h-4 w-4 text-slate-700" aria-hidden="true" />;
    case "selecao_catalogo":
    case "selecao_produto":
      return <Package className="h-4 w-4 text-amber-800" aria-hidden="true" />;
    case "selecao_servico":
      return <Wrench className="h-4 w-4 text-stone-700" aria-hidden="true" />;
    case "selecao_profissional":
      return <UserCheck className="h-4 w-4 text-stone-700" aria-hidden="true" />;
    case "recomendacao_catalogo":
      return <Sparkles className="h-4 w-4 text-stone-700" aria-hidden="true" />;
    case "etapa_livre":
    case "formulario_dinamico":
      return <FileText className="h-4 w-4 text-slate-700" aria-hidden="true" />;
    case "instrucao_pix_manual":
      return <DollarSign className="h-4 w-4 text-emerald-800" aria-hidden="true" />;
    case "coleta_contato":
    case "conectar_whatsapp":
      return <MessageSquare className="h-4 w-4 text-emerald-800" aria-hidden="true" />;
    default:
      return <HelpCircle className="h-4 w-4 text-stone-600" aria-hidden="true" />;
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
        "relative w-72 rounded-lg border bg-white p-4 transition-all duration-150",
        data.possuiPendencia && !data.selecionado
          ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10 shadow-xs"
          : data.selecionado
            ? "border-stone-900 ring-2 ring-stone-900/15 shadow-sm"
            : "border-stone-200/90 hover:border-stone-400 shadow-xs",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3.5 !w-3.5 !border-2 !border-white !bg-stone-800 transition-transform hover:scale-125"
      />

      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-stone-100 text-[10px] font-semibold text-stone-800">
            {data.indice}
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
            {rotuloTipo}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {data.possuiPendencia ? (
            <span className="inline-flex items-center gap-1 rounded bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-900">
              <AlertTriangle className="h-2.5 w-2.5 text-amber-700" aria-hidden="true" />
              Pendente
            </span>
          ) : null}

          {data.ehInicial ? (
            <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-800">
              <Play className="h-2 w-2 fill-current" aria-hidden="true" />
              Início
            </span>
          ) : null}
        </div>
      </div>

      {data.rotuloModelo ? (
        <p className="mt-2 text-[10px] text-stone-400 font-mono">modelo: {data.rotuloModelo}</p>
      ) : null}
      
      <div className="mt-2 flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0 rounded bg-stone-100 p-1.5 text-stone-700">{icone}</div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-semibold text-stone-900 tracking-tight">{data.titulo}</h4>
          {data.subtituloOpcional ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] text-stone-500 leading-normal">{data.subtituloOpcional}</p>
          ) : null}
        </div>
      </div>

      {!data.saidas?.length && data.quantidadeOpcoes && data.quantidadeOpcoes > 0 ? (
        <div className="mt-2.5 flex items-center gap-1.5 rounded bg-stone-50 px-2 py-1 text-[11px] text-stone-600">
          <CheckCircle2 className="h-3 w-3 text-stone-400" aria-hidden="true" />
          <span>{data.quantidadeOpcoes} opções configuradas</span>
        </div>
      ) : null}

      {data.saidas?.length ? (
        <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-2.5">
          <p className="mb-1 text-[10px] font-medium text-stone-400 uppercase tracking-wider">Saídas por resposta</p>
          {data.saidas.map((saida) => (
            <div
              key={saida.id}
              className={combinarClasses(
                "relative flex min-h-7 items-center rounded px-2 pr-5 text-[11px] transition-colors",
                saida.conectada
                  ? "bg-stone-50 text-stone-700"
                  : "bg-amber-50/70 text-amber-900 border border-amber-200/60",
              )}
            >
              <span className="truncate" title={saida.rotulo}>
                {saida.rotulo}
              </span>
              <Handle
                id={saida.id}
                type="source"
                position={Position.Right}
                title={`Conectar resposta: ${saida.rotulo}`}
                aria-label={`Saída: ${saida.rotulo}`}
                style={{ right: -17, top: "50%" }}
                className={combinarClasses(
                  "!h-3.5 !w-3.5 !border-2 !border-white transition-transform hover:scale-125",
                  saida.conectada ? "!bg-stone-800" : "!bg-amber-600 animate-pulse",
                )}
              />
            </div>
          ))}
        </div>
      ) : null}
      
      <div className="relative mt-3 border-t border-stone-100 pt-2 text-right text-[10px] text-stone-500 font-medium">
        {data.saidas?.length
          ? data.saidas.some((s) => s.destino || s.encerrar)
            ? "Continuar (demais respostas)"
            : "Continuar (todas as respostas)"
          : "Continuar"}
        <Handle
          id="padrao"
          type="source"
          position={Position.Bottom}
          title="Conectar caminho padrão (todas ou demais respostas)"
          aria-label="Saída padrão"
          className="!h-3.5 !w-3.5 !border-2 !border-white !bg-stone-900 transition-transform hover:scale-125"
          style={{ bottom: -21 }}
        />
      </div>
    </div>
  );
}
