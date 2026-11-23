"use client";

import {
  LISTA_TAMANHOS_CABECALHO_MARCA,
  resolverTamanhoCabecalhoMarca,
  type TamanhoCabecalhoMarca,
} from "@/dominio/editorial/tamanhoCabecalhoMarca";

export interface PropriedadesSeletorTamanhoCabecalhoMarca {
  readonly valorAtual?: TamanhoCabecalhoMarca;
  readonly aoSelecionar: (tamanho: TamanhoCabecalhoMarca) => void;
  readonly desabilitado?: boolean;
}

export function SeletorTamanhoCabecalhoMarca({
  valorAtual,
  aoSelecionar,
  desabilitado = false,
}: PropriedadesSeletorTamanhoCabecalhoMarca) {
  const tamanhoResolvido = resolverTamanhoCabecalhoMarca(valorAtual);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-mineral-800">
        Tamanho da marca na vitrine
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LISTA_TAMANHOS_CABECALHO_MARCA.map((opcao) => {
          const ativo = tamanhoResolvido === opcao.codigo;
          return (
            <button
              key={opcao.codigo}
              type="button"
              disabled={desabilitado}
              aria-pressed={ativo}
              onClick={() => aoSelecionar(opcao.codigo)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                ativo
                  ? "border-mineral-950 bg-mineral-950 text-white"
                  : "border-marfim-300 bg-white text-mineral-700 hover:bg-marfim-50"
              }`}
            >
              {opcao.nome}
            </button>
          );
        })}
      </div>
    </div>
  );
}

