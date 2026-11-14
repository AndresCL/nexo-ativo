import Image from "next/image";
import type { AvaliacaoGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export function CartaoAvaliacaoGoogle({
  avaliacao,
  compacto = false,
}: {
  readonly avaliacao: AvaliacaoGoogle;
  readonly compacto?: boolean;
}) {
  return (
    <article className="min-w-0 rounded-xl border border-current/20 bg-[var(--editorial-superficie)]/90 p-4 text-[var(--editorial-texto)]">
      <div className="flex items-center gap-3">
        {avaliacao.urlFotoAutor ? (
          <Image
            src={avaliacao.urlFotoAutor}
            alt=""
            width={32}
            height={32}
            unoptimized
            referrerPolicy="no-referrer"
            className="h-8 w-8 rounded-full"
          />
        ) : null}
        <div className="min-w-0">
          {avaliacao.urlAutor ? (
            <a
              href={avaliacao.urlAutor}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {avaliacao.autor}
            </a>
          ) : (
            <p className="text-sm font-medium">{avaliacao.autor}</p>
          )}
          <p className="text-xs" aria-label={`${avaliacao.nota} de 5 estrelas`}>
            <span aria-hidden="true">
              {"★".repeat(avaliacao.nota)}
              {"☆".repeat(5 - avaliacao.nota)}
            </span>
          </p>
        </div>
        {avaliacao.descricaoData ? (
          <time
            dateTime={avaliacao.publicadaEmIso}
            className="ml-auto text-xs text-[var(--editorial-texto-secundario)]"
          >
            {avaliacao.descricaoData}
          </time>
        ) : null}
      </div>
      {avaliacao.texto ? (
        <p
          className={combinarClasses(
            "mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed",
            compacto && "line-clamp-3",
          )}
        >
          {avaliacao.texto}
        </p>
      ) : (
        <p className="mt-3 text-xs text-[var(--editorial-texto-secundario)]">
          Avaliação sem comentário.
        </p>
      )}
      {avaliacao.urlAvaliacao ? (
        <a
          href={avaliacao.urlAvaliacao}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center text-xs underline underline-offset-4"
        >
          Ler no Google
        </a>
      ) : null}
    </article>
  );
}
