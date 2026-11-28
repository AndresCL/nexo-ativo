"use client";

import {
  OPCOES_EXIBICAO_DESTAQUE_EXPERIENCIA,
  type ValorExibicaoDestaqueExperiencia,
} from "@/dominio/microfluxos/nivelDestaqueVitrine";

export interface PropriedadesSeletorExibicaoDestaqueExperiencia {
  readonly valor: ValorExibicaoDestaqueExperiencia;
  readonly disabled?: boolean;
  readonly aoAlterar: (valor: ValorExibicaoDestaqueExperiencia) => void;
}

/** Seletor unificado de Exibição e Nível de Destaque (Oculta, Padrão, Primário ou Secundário). */
export function SeletorExibicaoDestaqueExperiencia({
  valor,
  disabled = false,
  aoAlterar,
}: PropriedadesSeletorExibicaoDestaqueExperiencia) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[10px] font-semibold tracking-wider text-mineral-500 uppercase">
      <span className="block truncate">Exibição / Destaque</span>
      <select
        aria-label="Exibição e destaque"
        disabled={disabled}
        value={valor}
        onChange={(evento) =>
          aoAlterar(evento.target.value as ValorExibicaoDestaqueExperiencia)
        }
        className="min-h-9 w-full rounded-lg border border-marfim-200 bg-white px-2.5 text-xs font-medium text-mineral-950 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:min-h-8"
      >
        {OPCOES_EXIBICAO_DESTAQUE_EXPERIENCIA.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

