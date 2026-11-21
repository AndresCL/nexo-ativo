import Image from "next/image";
import type { AvaliacaoGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export function CartaoAvaliacaoGoogle({
  avaliacao,
  compacto = false,
  aoClicar,
}: {
  readonly avaliacao: AvaliacaoGoogle;
  readonly compacto?: boolean;
  readonly aoClicar?: () => void;
}) {
  return (
    <article
      onClick={aoClicar}
      className={combinarClasses(
        "rounded-xl border border-current/20 bg-[var(--editorial-superficie)]/90 text-[var(--editorial-texto)] transition-all",
        compacto
          ? "w-[260px] shrink-0 snap-start p-3 text-left shadow-2xs hover:border-current/40 sm:w-[280px]"
          : "p-4",
        aoClicar && "cursor-pointer",
      )}
    >
      <div className="flex items-center gap-2.5">
        {avaliacao.urlFotoAutor ? (
          <Image
            src={avaliacao.urlFotoAutor}
            alt=""
            width={28}
            height={28}
            unoptimized
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold leading-tight">{avaliacao.autor}</p>
          <div
            aria-label={`${avaliacao.nota} de 5 estrelas`}
            className="mt-1 flex items-center gap-0.5 leading-none"
          >
            <span aria-hidden="true" className="text-amber-500 text-[11px]">
              {"★".repeat(avaliacao.nota)}
            </span>
            <span aria-hidden="true" className="opacity-25 text-[11px]">
              {"☆".repeat(5 - avaliacao.nota)}
            </span>
          </div>
        </div>
        {avaliacao.descricaoData ? (
          <time
            dateTime={avaliacao.publicadaEmIso}
            className="shrink-0 text-[10px] text-[var(--editorial-texto-secundario)]"
          >
            {avaliacao.descricaoData}
          </time>
        ) : null}
      </div>

      {avaliacao.texto ? (
        <p
          className={combinarClasses(
            "mt-2 text-xs leading-relaxed whitespace-pre-wrap break-words",
            compacto ? "line-clamp-3 text-[var(--editorial-texto)]/90" : "text-sm",
          )}
        >
          {avaliacao.texto}
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-[var(--editorial-texto-secundario)]">
          Avaliação sem comentário.
        </p>
      )}

      {!compacto && avaliacao.urlAvaliacao ? (
        <a
          href={avaliacao.urlAvaliacao}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center text-xs underline underline-offset-4"
        >
          Ler no Google
        </a>
      ) : null}
    </article>
  );
}
