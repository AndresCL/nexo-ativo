"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";

export interface PropriedadesBotaoCopiarRelatorioIA {
  readonly gerarTexto: () => string;
  readonly descricaoEscopo: string;
}

export function BotaoCopiarRelatorioIA({
  gerarTexto,
  descricaoEscopo,
}: PropriedadesBotaoCopiarRelatorioIA) {
  const [copiado, setCopiado] = useState(false);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (temporizadorRef.current) {
        clearTimeout(temporizadorRef.current);
      }
    };
  }, []);

  async function copiarRelatorio() {
    const texto = gerarTexto();

    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      if (temporizadorRef.current) {
        clearTimeout(temporizadorRef.current);
      }
      temporizadorRef.current = setTimeout(() => setCopiado(false), 2500);
      notificar.sucesso(
        `Relatório copiado (sem dados pessoais · ${descricaoEscopo}) — pronto para colar na sua IA.`,
      );
    } catch {
      notificar.erro(
        "Não foi possível copiar automaticamente. Verifique a permissão da área de transferência do navegador.",
      );
    }
  }

  return (
    <button
      type="button"
      onClick={copiarRelatorio}
      title="Copia todos os dados, funis, canais, QR Codes e equipe deste recorte em Markdown para colar em uma IA (zero dados pessoais)."
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-marfim-300 bg-white px-3.5 py-2 text-xs font-semibold text-mineral-900 shadow-xs transition-all hover:border-marfim-400 hover:bg-marfim-50"
    >
      {copiado ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <span className="text-emerald-700">Copiado!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 text-mineral-600" aria-hidden="true" />
          <span>Copiar para IA</span>
        </>
      )}
    </button>
  );
}

