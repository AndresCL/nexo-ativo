import type { ReactNode } from "react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesRenderizadorTextoRicoEditorial {
  readonly texto: string;
  readonly id?: string;
  readonly className?: string;
}

function renderizarSegmentosInline(linha: string, chaveBase: string): ReactNode[] {
  // Suporta **negrito**, *itálico* e [texto](https://url)
  const padraoInline = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
  const partes = linha.split(padraoInline);

  return partes.map((parte, idx) => {
    const chave = `${chaveBase}-${idx}`;
    if (parte.startsWith("**") && parte.endsWith("**") && parte.length > 4) {
      return (
        <strong key={chave} className="font-bold text-[var(--editorial-texto)]">
          {parte.slice(2, -2)}
        </strong>
      );
    }
    if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2) {
      return (
        <em key={chave} className="italic">
          {parte.slice(1, -1)}
        </em>
      );
    }
    const matchLink = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(parte);
    if (matchLink) {
      const [, rotulo, url] = matchLink;
      return (
        <a
          key={chave}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--editorial-texto)] underline decoration-current/40 underline-offset-3 transition hover:opacity-80"
        >
          {rotulo}
        </a>
      );
    }
    return parte;
  });
}

/**
 * Renderiza texto editorial estruturado de forma 100% segura (sem dangerouslySetInnerHTML),
 * suportando subtítulos (###), listas (- ou •), citações (>), **negrito**, *itálico*, links e emojis.
 */
export function RenderizadorTextoRicoEditorial({
  texto,
  id,
  className,
}: PropriedadesRenderizadorTextoRicoEditorial) {
  const linhas = texto.replace(/\r\n/g, "\n").split("\n");
  const elementos: ReactNode[] = [];
  let itensListaAtual: string[] = [];

  function descarregarLista(indiceRef: number) {
    if (itensListaAtual.length === 0) return;
    const itens = [...itensListaAtual];
    itensListaAtual = [];
    elementos.push(
      <ul key={`lista-${indiceRef}`} className="my-2.5 space-y-1.5 pl-5 list-disc">
        {itens.map((item, idx) => (
          <li key={`item-${indiceRef}-${idx}`} className="leading-relaxed">
            {renderizarSegmentosInline(item, `li-${indiceRef}-${idx}`)}
          </li>
        ))}
      </ul>,
    );
  }

  linhas.forEach((linhaBruta, idx) => {
    const linha = linhaBruta.trimEnd();
    const limpa = linha.trim();

    if (!limpa) {
      descarregarLista(idx);
      elementos.push(<div key={`espaco-${idx}`} className="h-2" aria-hidden="true" />);
      return;
    }

    if (/^[-•*]\s+/.test(limpa)) {
      itensListaAtual.push(limpa.replace(/^[-•*]\s+/, ""));
      return;
    }

    descarregarLista(idx);

    if (/^#{1,3}\s+/.test(limpa)) {
      const textoSubtitulo = limpa.replace(/^#{1,3}\s+/, "");
      elementos.push(
        <h4
          key={`h-${idx}`}
          className="mt-3 mb-1 text-base font-bold tracking-tight text-[var(--editorial-texto)] sm:text-lg"
        >
          {renderizarSegmentosInline(textoSubtitulo, `h-${idx}`)}
        </h4>,
      );
      return;
    }

    if (limpa.startsWith("> ")) {
      const textoCitacao = limpa.slice(2);
      elementos.push(
        <blockquote
          key={`q-${idx}`}
          className="my-2.5 border-l-2 border-[var(--editorial-destaque)] bg-[var(--editorial-superficie)]/60 py-2 pr-3 pl-3.5 text-xs italic sm:text-sm rounded-r-lg"
        >
          {renderizarSegmentosInline(textoCitacao, `q-${idx}`)}
        </blockquote>,
      );
      return;
    }

    elementos.push(
      <p key={`p-${idx}`} className="leading-relaxed break-words">
        {renderizarSegmentosInline(linha, `p-${idx}`)}
      </p>,
    );
  });

  descarregarLista(linhas.length);

  return (
    <div
      id={id}
      className={combinarClasses(
        "space-y-1.5 text-sm leading-relaxed text-[var(--editorial-texto-secundario)]",
        className,
      )}
    >
      {elementos}
    </div>
  );
}

