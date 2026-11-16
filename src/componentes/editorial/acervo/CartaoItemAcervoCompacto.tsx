import Image from "next/image";
import { formatarApresentacaoPrecoItem } from "@/dominio/entidades/catalogoConteudo";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { ModoLayoutAcervo } from "./ContainerColecaoAcervo";

export interface ItemCardAcervoCompacto {
  readonly id: string;
  readonly nome: string;
  readonly categoria?: string;
  readonly urlImagem?: string;
  readonly precoCentavos?: number;
  readonly rotuloPrecoOpcional?: string;
  readonly prazoOuDuracao?: string;
}

interface PropriedadesCartaoItemAcervoCompacto {
  readonly item: ItemCardAcervoCompacto;
  readonly indice: number;
  readonly modo: ModoLayoutAcervo;
  readonly aoSelecionar?: (id: string) => void;
}

export function CartaoItemAcervoCompacto({
  item,
  indice,
  modo,
  aoSelecionar,
}: PropriedadesCartaoItemAcervoCompacto) {
  const rotuloPreco = formatarApresentacaoPrecoItem({
    centavos: item.precoCentavos,
    rotuloOpcional: item.rotuloPrecoOpcional,
  });

  return (
    <article
      role="group"
      aria-roledescription={modo === "carrossel" ? "slide" : undefined}
      aria-label={`${item.nome} (${indice + 1})`}
      className={combinarClasses(
        "group flex flex-col justify-between overflow-hidden rounded-2xl border-0 bg-[var(--editorial-superficie)] p-0 text-left shadow-xs transition-all duration-300 hover:shadow-md select-none",
        modo === "carrossel" ? "w-[72%] sm:w-[75%] shrink-0 snap-start" : "w-full",
      )}
    >
      <button
        type="button"
        onClick={() => aoSelecionar?.(item.id)}
        className="flex h-full w-full flex-col text-left focus:outline-hidden cursor-pointer"
      >
        {/* Imagem Proporcional Sangrada (Sem margem superior, esquerda e direita) */}
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-2xl rounded-b-none bg-black/5 dark:bg-white/5">
          {item.urlImagem ? (
            <Image
              src={item.urlImagem}
              alt=""
              fill
              sizes="(max-width: 640px) 70vw, 300px"
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/10 text-xs font-medium text-[var(--editorial-texto-secundario)]">
              Sem foto
            </div>
          )}

          {item.categoria ? (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
              {item.categoria}
            </span>
          ) : null}
        </div>

        {/* Informações Sem Serifa (Moderna) com padding inferior */}
        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug tracking-tight text-[var(--editorial-texto)]">
              {item.nome}
            </h3>
            {item.prazoOuDuracao ? (
              <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[var(--editorial-texto-secundario)]">
                {item.prazoOuDuracao}
              </p>
            ) : null}
          </div>

          <div className="mt-2.5 pt-0.5">
            <span className="text-xs font-bold tracking-tight text-[var(--editorial-destaque)]">
              {rotuloPreco}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

