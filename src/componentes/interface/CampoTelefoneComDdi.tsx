"use client";

import { useEffect, useId, useState } from "react";
import {
  DDI_PADRAO,
  OPCOES_DDI_PAISES,
  comporNumeroComDdi,
  obterDdiPadraoPorLocale,
  separarDdiENumero,
} from "@/dominio/servicos/numeroWhatsappInternacional";

export interface PropriedadesCampoTelefoneComDdi {
  readonly rotulo: string;
  /** Valor armazenado no formato "+DDI número" (ou legado sem "+"). Vazio = sem número. */
  readonly value: string;
  readonly onChange: (valor: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
}

/**
 * Campo de telefone com seletor de DDI. O DDI inicial vem do número já salvo;
 * sem número, usa o locale do navegador (fallback: Brasil, 55).
 */
export function CampoTelefoneComDdi({
  rotulo,
  value,
  onChange,
  disabled,
  placeholder = "11 99999-9999",
}: PropriedadesCampoTelefoneComDdi) {
  const identificador = useId();
  const separado = separarDdiENumero(value);
  const [ddiLocal, setDdiLocal] = useState<string>(DDI_PADRAO);

  useEffect(() => {
    setDdiLocal(obterDdiPadraoPorLocale(navigator.language));
  }, []);

  const ddiAtual = separado.ddi ?? ddiLocal;
  const numeroNacional = separado.ddi ? separado.numeroNacional : separado.numeroNacional;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${identificador}-numero`} className="text-sm font-medium text-mineral-900">
        {rotulo}
      </label>
      <div className="flex min-h-11 items-center rounded-md border border-marfim-300 bg-white transition-colors focus-within:border-mineral-950">
        <select
          aria-label={`${rotulo} — código do país (DDI)`}
          value={ddiAtual}
          disabled={disabled}
          onChange={(e) => {
            setDdiLocal(e.target.value);
            onChange(comporNumeroComDdi(e.target.value, numeroNacional));
          }}
          className="h-full max-w-[9rem] rounded-l-md border-r border-marfim-200 bg-marfim-100/70 px-2 py-2.5 text-sm text-mineral-700 focus:outline-none"
        >
          {OPCOES_DDI_PAISES.map((opcao) => (
            <option key={opcao.regiao} value={opcao.ddi}>
              {opcao.regiao} +{opcao.ddi}
            </option>
          ))}
        </select>
        <input
          id={`${identificador}-numero`}
          type="tel"
          inputMode="tel"
          disabled={disabled}
          value={numeroNacional}
          placeholder={placeholder}
          onChange={(e) => onChange(comporNumeroComDdi(ddiAtual, e.target.value))}
          className="w-full bg-transparent px-3.5 py-2.5 text-sm text-mineral-950 placeholder:text-mineral-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

