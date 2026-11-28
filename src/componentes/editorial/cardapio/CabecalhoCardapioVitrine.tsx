"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, MessageCircle } from "lucide-react";

interface PropriedadesCabecalhoCardapioVitrine {
  readonly hrefVoltar: string;
  readonly nomeMarca: string;
  readonly urlLogotipo?: string;
  readonly urlPdfDownload?: string;
  readonly urlWhatsapp?: string;
}

export function CabecalhoCardapioVitrine({
  hrefVoltar,
  nomeMarca,
  urlLogotipo,
  urlPdfDownload,
  urlWhatsapp,
}: PropriedadesCabecalhoCardapioVitrine) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--editorial-borda)] bg-[var(--editorial-fundo)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href={hrefVoltar}
            aria-label="Voltar para a vitrine"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] text-[var(--editorial-texto)] transition-colors hover:opacity-85"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            {urlLogotipo ? (
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-[var(--editorial-borda)] bg-white/10">
                <Image
                  src={urlLogotipo}
                  alt={nomeMarca}
                  fill
                  sizes="28px"
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : null}
            <span className="truncate text-sm font-semibold tracking-tight text-[var(--editorial-texto)]">
              {nomeMarca}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {urlWhatsapp ? (
            <a
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] px-3 text-xs font-medium text-[var(--editorial-texto)] transition-colors hover:opacity-85"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          ) : null}

          {urlPdfDownload ? (
            <a
              href={urlPdfDownload}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label="Baixar PDF do cardápio"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--editorial-destaque)] px-3 text-xs font-semibold text-[var(--editorial-texto-sobre-destaque)] transition-opacity hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>PDF</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}

