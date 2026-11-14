"use client";

import { Copy, Download } from "lucide-react";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import { gerarSvgQrCode } from "@/dominio/servicos/geradorQrCodeSvg";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesExibicaoQrCodeEditorial {
  readonly urlDestino: string;
  readonly rotuloIdentificacao: string;
  readonly nomeArquivoSvg?: string;
  readonly className?: string;
}

export function ExibicaoQrCodeEditorial({
  urlDestino,
  rotuloIdentificacao,
  nomeArquivoSvg = "cartao-digital-qrcode",
  className,
}: PropriedadesExibicaoQrCodeEditorial) {
  const svgBruto = gerarSvgQrCode(urlDestino, {
    tituloAcessivel: `QR Code para ${rotuloIdentificacao}`,
  });
  const dataUriSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgBruto)}`;

  return (
    <div
      className={combinarClasses(
        "flex flex-col items-center gap-4 rounded-lg border border-marfim-300/70 bg-white p-5 text-center text-mineral-950 shadow-sm",
        className,
      )}
    >
      <div className="rounded-md border border-marfim-200 bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUriSvg}
          alt={`QR Code de acesso a ${rotuloIdentificacao}`}
          width={176}
          height={176}
          className="h-44 w-44"
        />
      </div>

      <p className="max-w-xs break-all text-xs text-mineral-600">{urlDestino}</p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => void copiarTextoComAviso(urlDestino)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-marfim-300 bg-marfim-50 px-3.5 py-2 text-xs font-medium text-mineral-900 transition-colors hover:bg-marfim-200/70"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Copiar link</span>
        </button>

        <a
          href={dataUriSvg}
          download={`${nomeArquivoSvg}.svg`}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-mineral-950 px-3.5 py-2 text-xs font-medium text-marfim-50 transition-colors hover:bg-mineral-800"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Baixar SVG</span>
        </a>
      </div>
    </div>
  );
}
