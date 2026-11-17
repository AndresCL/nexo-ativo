"use client";

import { useEffect, useMemo, useState } from "react";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { ExibicaoQrCodeEditorial } from "@/componentes/editorial/ExibicaoQrCodeEditorial";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TransicaoPaginaPainel } from "@/componentes/interface/TransicaoPaginaPainel";

type TipoDestinoQrCode = "vitrine" | "profissional" | "fluxo";

export interface PropriedadesCentralQrCodesPainel {
  readonly identificadorPublico: string;
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly microfluxos: readonly DefinicaoMicrofluxo[];
}

function montarUrlDestinoQrCode(
  baseOrigem: string,
  identificadorPublico: string,
  tipo: TipoDestinoQrCode,
  profissionalSlug: string,
  fluxoId: string,
): { url: string; titulo: string; nomeArquivo: string } {
  const base = `${baseOrigem}/${identificadorPublico}`;
  if (tipo === "profissional" && profissionalSlug) {
    return {
      url: `${base}/equipe/${profissionalSlug}?utm_source=qrcode&utm_content=profissional_${profissionalSlug}`,
      titulo: "QR Code do Profissional",
      nomeArquivo: `qrcode-${identificadorPublico}-${profissionalSlug}`,
    };
  }
  if (tipo === "fluxo" && fluxoId) {
    return {
      url: `${base}?fluxo=${encodeURIComponent(fluxoId)}&utm_source=qrcode&utm_content=fluxo_${encodeURIComponent(fluxoId)}`,
      titulo: "QR Code de Ação na Home",
      nomeArquivo: `qrcode-${identificadorPublico}-fluxo-${fluxoId}`,
    };
  }
  return {
    url: `${base}?utm_source=qrcode&utm_content=vitrine`,
    titulo: "QR Code da Vitrine Principal",
    nomeArquivo: `qrcode-${identificadorPublico}-vitrine`,
  };
}

export function CentralQrCodesPainel({
  identificadorPublico,
  profissionais,
  microfluxos,
}: PropriedadesCentralQrCodesPainel) {
  const profissionaisAtivos = useMemo(
    () => profissionais.filter((p) => p.ativo),
    [profissionais],
  );
  const fluxosAtivos = useMemo(
    () => microfluxos.filter((m) => m.ativo),
    [microfluxos],
  );

  const [tipo, setTipo] = useState<TipoDestinoQrCode>("vitrine");
  const [profissionalSlug, setProfissionalSlug] = useState(
    profissionaisAtivos[0]?.identificadorCartao ?? "",
  );
  const [fluxoId, setFluxoId] = useState(fluxosAtivos[0]?.id ?? "");
  const [baseOrigem, setBaseOrigem] = useState("https://nexoativo.com.br");

  useEffect(() => {
    setBaseOrigem(window.location.origin);
  }, []);

  const { url, titulo, nomeArquivo } = montarUrlDestinoQrCode(
    baseOrigem,
    identificadorPublico,
    tipo,
    profissionalSlug,
    fluxoId,
  );

  return (
    <TransicaoPaginaPainel className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-mineral-500 uppercase">
            Divulgação & Rastreamento · QR Code
          </p>
          <h1 className="mt-1.5 text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Central de QR Codes
          </h1>
          <p className="mt-1 text-xs text-mineral-600">
            Gere QR Codes com rastreamento automático (<code>utm_source=qrcode</code>) para balcão,
            crachás e materiais impressos.
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <CartaoSuperficie className="space-y-5 rounded-2xl border border-marfim-200 bg-white p-6 shadow-xs">
          <div className="space-y-2">
            <label className="text-sm font-medium text-mineral-900">Destino do QR Code</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "vitrine", rotulo: "Vitrine Principal" },
                  { id: "profissional", rotulo: "Profissional" },
                  { id: "fluxo", rotulo: "Fluxo na Home" },
                ] as const
              ).map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => setTipo(opcao.id)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                    tipo === opcao.id
                      ? "border-mineral-950 bg-mineral-950 text-white shadow-xs"
                      : "border-marfim-200 bg-marfim-50/50 text-mineral-700 hover:border-marfim-300 hover:bg-marfim-100/60"
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          {tipo === "profissional" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-mineral-900">Selecione o profissional</label>
              <select
                value={profissionalSlug}
                onChange={(e) => setProfissionalSlug(e.target.value)}
                className="w-full rounded-lg border border-mineral-200 bg-white px-3 py-2 text-sm"
              >
                {profissionaisAtivos.map((p) => (
                  <option key={p.id} value={p.identificadorCartao}>
                    {p.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipo === "fluxo" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-mineral-900">Selecione o fluxo</label>
              <select
                value={fluxoId}
                onChange={(e) => setFluxoId(e.target.value)}
                className="w-full rounded-lg border border-mineral-200 bg-white px-3 py-2 text-sm"
              >
                {fluxosAtivos.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.titulo}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CartaoSuperficie>

        <ExibicaoQrCodeEditorial
          urlDestino={url}
          rotuloIdentificacao={titulo}
          nomeArquivoSvg={nomeArquivo}
        />
      </div>
    </TransicaoPaginaPainel>
  );
}

