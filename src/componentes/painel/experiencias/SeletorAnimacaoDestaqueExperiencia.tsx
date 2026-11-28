"use client";

import {
  OPCOES_ANIMACAO_DESTAQUE,
  type AnimacaoDestaque,
} from "@/dominio/microfluxos/animacaoDestaque";

export interface PropriedadesSeletorAnimacaoDestaqueExperiencia {
  readonly valor: AnimacaoDestaque;
  readonly disabled?: boolean;
  readonly aoAlterar: (valor: AnimacaoDestaque) => void;
}

/** Seletor de animação para experiências em destaque primário. */
export function SeletorAnimacaoDestaqueExperiencia({
  valor,
  disabled = false,
  aoAlterar,
}: PropriedadesSeletorAnimacaoDestaqueExperiencia) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[10px] font-semibold tracking-wider text-mineral-500 uppercase">
      <span className="block truncate">Animação</span>
      <select
        aria-label="Animação do destaque"
        disabled={disabled}
        value={valor}
        onChange={(evento) => aoAlterar(evento.target.value as AnimacaoDestaque)}
        className="min-h-9 w-full rounded-lg border border-marfim-200 bg-white px-2.5 text-xs font-medium text-mineral-950 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:min-h-8"
      >
        {OPCOES_ANIMACAO_DESTAQUE.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

