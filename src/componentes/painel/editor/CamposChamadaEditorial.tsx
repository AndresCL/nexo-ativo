"use client";

import { useId } from "react";
import { Trash2 } from "lucide-react";
import type { ChamadaPrincipalEditorial } from "@/dominio/entidades/chamadasEditoriais";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { Botao } from "@/componentes/interface/Botao";

interface PropriedadesCamposChamadaEditorial {
  readonly chamada: ChamadaPrincipalEditorial;
  readonly indice: number;
  readonly somenteLeitura: boolean;
  readonly microfluxos?: readonly DefinicaoMicrofluxo[];
  readonly aoAtualizar: (parcial: Partial<ChamadaPrincipalEditorial>) => void;
  readonly aoRemover?: () => void;
}

export function CamposChamadaEditorial({
  chamada,
  indice,
  somenteLeitura,
  microfluxos = [],
  aoAtualizar,
  aoRemover,
}: PropriedadesCamposChamadaEditorial) {
  const identificadorDescricao = useId();
  const identificadorFluxo = useId();

  const fluxosDisponiveis = microfluxos.filter(
    (m) => m.ativo && (!m.tipoAcao || m.tipoAcao === "microfluxo"),
  );

  return (
    <fieldset
      disabled={somenteLeitura}
      className="min-w-0 space-y-4 rounded-lg border border-marfim-300 p-4"
    >
      <legend className="px-1 text-sm font-semibold text-mineral-950">Chamada {indice + 1}</legend>
      {aoRemover ? (
        <div className="flex justify-end">
          <Botao
            type="button"
            variante="fantasma"
            tamanho="compacto"
            onClick={aoRemover}
            aria-label={`Remover chamada ${indice + 1}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remover
          </Botao>
        </div>
      ) : null}
      <CampoFormulario
        rotulo="Sobretítulo discreto (opcional)"
        maxLength={90}
        value={chamada.sobretituloOpcional ?? ""}
        onChange={(evento) => aoAtualizar({ sobretituloOpcional: evento.target.value })}
        placeholder="Ex.: Campanha de lançamento"
      />
      <CampoFormulario
        rotulo="Título editorial principal"
        required
        minLength={4}
        maxLength={180}
        value={chamada.tituloPrincipal}
        onChange={(evento) => aoAtualizar({ tituloPrincipal: evento.target.value })}
        placeholder="A mensagem principal desta chamada."
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={identificadorDescricao} className="text-sm font-medium text-mineral-900">
          Descrição curta de apoio (opcional)
        </label>
        <textarea
          id={identificadorDescricao}
          rows={3}
          maxLength={320}
          value={chamada.descricaoCurta ?? ""}
          onChange={(evento) => aoAtualizar({ descricaoCurta: evento.target.value })}
          placeholder="Detalhes que complementam o título."
          className="w-full rounded-md border border-marfim-300 bg-white px-3.5 py-2.5 text-sm text-mineral-950 placeholder:text-mineral-500 focus:border-mineral-950 focus:outline-none disabled:opacity-60"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoFormulario
          rotulo="Texto do botão CTA (opcional)"
          maxLength={60}
          value={chamada.rotuloCta ?? ""}
          onChange={(evento) => aoAtualizar({ rotuloCta: evento.target.value })}
          placeholder="Ex.: Agendar visita"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={identificadorFluxo} className="text-sm font-medium text-mineral-900">
            Fluxo de destino (opcional)
          </label>
          <select
            id={identificadorFluxo}
            value={chamada.fluxoId ?? ""}
            onChange={(evento) => aoAtualizar({ fluxoId: evento.target.value || undefined })}
            disabled={somenteLeitura}
            className="w-full rounded-md border border-marfim-300 bg-white px-3.5 py-2.5 text-sm text-mineral-950 placeholder:text-mineral-500 focus:border-mineral-950 focus:outline-none disabled:opacity-60"
          >
            <option value="">Nenhum fluxo selecionado</option>
            {fluxosDisponiveis.map((fluxo) => (
              <option key={fluxo.id} value={fluxo.id}>
                {fluxo.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}
