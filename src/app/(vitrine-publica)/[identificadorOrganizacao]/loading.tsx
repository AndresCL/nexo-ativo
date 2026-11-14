"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TelaCarregamentoEditorial } from "@/componentes/editorial/TelaCarregamentoEditorial";

interface DadosMarcaCache {
  readonly urlLogotipo?: string | null;
  readonly nomeCliente?: string;
}

function recuperarMarcaArmazenada(segmento?: string): DadosMarcaCache | null {
  if (typeof window === "undefined" || !segmento) return null;
  try {
    const dados =
      localStorage.getItem(`fluxo_marca_${segmento}`) ??
      sessionStorage.getItem(`fluxo_marca_${segmento}`);
    return dados ? (JSON.parse(dados) as DadosMarcaCache) : null;
  } catch {
    return null;
  }
}

export default function CarregandoVitrinePublica() {
  const pathname = usePathname();
  const segmento = pathname?.split("/").filter(Boolean)[0];
  const [marca, setMarca] = useState<DadosMarcaCache | null>(() =>
    recuperarMarcaArmazenada(segmento),
  );

  useEffect(() => {
    if (segmento) {
      const encontrada = recuperarMarcaArmazenada(segmento);
      if (encontrada) {
        setMarca(encontrada);
      }
    }
  }, [segmento]);

  return (
    <TelaCarregamentoEditorial urlLogotipo={marca?.urlLogotipo} nomeCliente={marca?.nomeCliente} />
  );
}
