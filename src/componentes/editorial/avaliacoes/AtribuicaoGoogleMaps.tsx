import type { AtribuicaoAvaliacoesGoogle } from "@/dominio/entidades/avaliacoesGoogle";

export function AtribuicaoGoogleMaps({
  url,
  atribuicoes = [],
}: {
  readonly url?: string;
  readonly atribuicoes?: readonly AtribuicaoAvaliacoesGoogle[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-xs">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline-offset-4 hover:underline"
        >
          Google Maps
        </a>
      ) : (
        <span className="font-semibold">Google Maps</span>
      )}
      {atribuicoes.map((atribuicao, indice) =>
        atribuicao.url ? (
          <a
            key={`${atribuicao.nome}-${indice}`}
            href={atribuicao.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {atribuicao.nome}
          </a>
        ) : (
          <span key={`${atribuicao.nome}-${indice}`}>{atribuicao.nome}</span>
        ),
      )}
    </div>
  );
}
