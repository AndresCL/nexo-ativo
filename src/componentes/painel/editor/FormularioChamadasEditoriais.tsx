"use client";

import { AvisosPublicidade } from "@/componentes/painel/AvisosPublicidade";
import { Plus } from "lucide-react";
import {
  LIMITE_MAXIMO_CHAMADAS_EDITORIAIS,
  obterChamadasEditoriais,
} from "@/dominio/entidades/chamadasEditoriais";
import { useEstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { Botao } from "@/componentes/interface/Botao";
import { CamposChamadaEditorial } from "./CamposChamadaEditorial";

export function FormularioChamadasEditoriais({
  somenteLeitura = false,
  microfluxos = [],
}: {
  readonly somenteLeitura?: boolean;
  readonly microfluxos?: readonly DefinicaoMicrofluxo[];
}) {
  const rascunho = useEstadoEditorAparencia((estado) => estado.rascunho);
  const atualizar = useEstadoEditorAparencia((estado) => estado.atualizarChamadaEditorial);
  const adicionar = useEstadoEditorAparencia((estado) => estado.adicionarChamadaEditorial);
  const remover = useEstadoEditorAparencia((estado) => estado.removerChamadaEditorial);
  const chamadas = obterChamadasEditoriais(rascunho);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-mineral-950">Chamadas editoriais</h2>
          <p className="mt-0.5 text-xs text-mineral-600">
            Adicione até três mensagens para alternar na abertura da vitrine. A primeira também
            orienta o SEO.
          </p>
        </div>
        <span
          className="shrink-0 text-xs text-mineral-600"
          aria-label={`${chamadas.length} de ${LIMITE_MAXIMO_CHAMADAS_EDITORIAIS} chamadas`}
        >
          {chamadas.length}/{LIMITE_MAXIMO_CHAMADAS_EDITORIAIS}
        </span>
      </div>
      <AvisosPublicidade areas={["texto_livre"]} />
      {chamadas.map((chamada, indice) => (
        <CamposChamadaEditorial
          key={indice}
          chamada={chamada}
          indice={indice}
          somenteLeitura={somenteLeitura}
          microfluxos={microfluxos}
          aoAtualizar={(parcial) => atualizar(parcial, indice)}
          aoRemover={chamadas.length > 1 ? () => remover(indice) : undefined}
        />
      ))}
      <Botao
        type="button"
        variante="operacional_secundario"
        tamanho="compacto"
        onClick={adicionar}
        disabled={somenteLeitura || chamadas.length >= LIMITE_MAXIMO_CHAMADAS_EDITORIAIS}
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar chamada
      </Botao>
    </div>
  );
}
