"use client";

import { useRef, useState } from "react";
import { Pencil } from "lucide-react";

export function TituloExperienciaEditavel({
  valor,
  aoAlterar,
  disabled,
  rotuloCampo = "Texto do botão na vitrine",
  placeholder = "Título da experiência",
  limiteCaracteres,
}: {
  readonly valor: string;
  readonly aoAlterar: (titulo: string) => void;
  readonly disabled: boolean;
  readonly rotuloCampo?: string;
  readonly placeholder?: string;
  readonly limiteCaracteres?: number;
}) {
  const [editando, setEditando] = useState(false);
  const tituloOriginal = useRef(valor);

  if (editando) {
    return (
      <input
        autoFocus
        type="text"
        aria-label={rotuloCampo}
        maxLength={limiteCaracteres}
        value={valor}
        disabled={disabled}
        onChange={(evento) => aoAlterar(evento.target.value)}
        onBlur={() => setEditando(false)}
        onKeyDown={(evento) => {
          if (evento.key === "Escape") aoAlterar(tituloOriginal.current);
          if (evento.key === "Enter" || evento.key === "Escape") {
            evento.preventDefault();
            evento.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        className="min-h-10 w-full rounded-md border border-mineral-700 bg-white px-2.5 text-lg font-bold tracking-tight text-mineral-950 focus:border-mineral-950 focus:outline-none"
      />
    );
  }

  return (
    <div className="flex min-h-10 items-center gap-2">
      <h2 className="min-w-0 text-lg font-bold tracking-tight wrap-anywhere text-mineral-950">
        {valor}
      </h2>
      <button
        type="button"
        aria-label="Editar título da experiência"
        disabled={disabled}
        onClick={() => {
          tituloOriginal.current = valor;
          setEditando(true);
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-mineral-500 hover:bg-marfim-100 hover:text-mineral-950 focus-visible:outline-2 focus-visible:outline-mineral-700 disabled:opacity-40"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
