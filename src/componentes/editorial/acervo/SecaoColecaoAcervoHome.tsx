import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import { fatiarColecaoParaHome } from "@/dominio/editorial/filtroCatalogoAcervo";
import {
  ContainerColecaoAcervo,
  type ModoLayoutAcervo,
} from "./ContainerColecaoAcervo";
import {
  CartaoItemAcervoCompacto,
  type ItemCardAcervoCompacto,
} from "./CartaoItemAcervoCompacto";
import { CartaoVerMaisAcervo } from "./CartaoVerMaisAcervo";

interface PropriedadesSecaoColecaoAcervoHome {
  readonly tipo: "produtos" | "servicos";
  readonly tituloSecao?: string;
  readonly modo: ModoLayoutAcervo;
  readonly produtos?: readonly ProdutoCatalogo[];
  readonly servicos?: readonly ServicoOrganizacao[];
  readonly aoAbrirGavetaDetalhe?: (tipo: "produtos" | "servicos", itemId?: string) => void;
}

export function SecaoColecaoAcervoHome({
  tipo,
  tituloSecao,
  modo,
  produtos = [],
  servicos = [],
  aoAbrirGavetaDetalhe,
}: PropriedadesSecaoColecaoAcervoHome) {
  const itensAdaptados: readonly ItemCardAcervoCompacto[] = useMemo(() => {
    if (tipo === "produtos") {
      return produtos
        .filter((p) => p.ativo)
        .map((p) => ({
          id: p.id,
          nome: p.nome,
          categoria: p.categoria,
          urlImagem: p.imagens?.[0]?.url || p.urlImagemPrincipal,
          precoCentavos: p.precoCentavos,
          rotuloPrecoOpcional: p.rotuloPrecoOpcional,
        }));
    }

    return servicos
      .filter((s) => s.ativo)
      .map((s) => ({
        id: s.id,
        nome: s.nome,
        categoria: s.categoria,
        urlImagem: s.imagens?.[0]?.url || s.urlImagemOpcional,
        precoCentavos: s.precoBaseCentavos,
        rotuloPrecoOpcional: s.rotuloPrecoOpcional,
        prazoOuDuracao: s.prazoOuDuracao,
      }));
  }, [tipo, produtos, servicos]);

  const { itensVisiveis, quantidadeRestante, total } = useMemo(
    () => fatiarColecaoParaHome(itensAdaptados, modo),
    [itensAdaptados, modo],
  );

  if (itensAdaptados.length === 0) return null;

  const rotuloTipoPlural = tipo === "produtos" ? "produtos" : "serviços";

  return (
    <section className="w-full space-y-2.5" aria-label={tituloSecao || (tipo === "produtos" ? "Produtos" : "Serviços")}>
      {tituloSecao ? (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold tracking-tight text-texto-primario">
            {tituloSecao}
          </h2>
          <button
            type="button"
            onClick={() => aoAbrirGavetaDetalhe?.(tipo)}
            className="text-xs font-medium text-[var(--editorial-texto-secundario)] hover:underline cursor-pointer"
          >
            Ver todos
          </button>
        </div>
      ) : null}

      <ContainerColecaoAcervo
        itens={itensVisiveis}
        modo={modo}
        ariaLabel={tituloSecao || (tipo === "produtos" ? "Lista de produtos" : "Lista de serviços")}
        itemFinal={
          modo === "carrossel" && quantidadeRestante > 0 ? (
            <CartaoVerMaisAcervo
              tipo={tipo}
              quantidadeRestante={quantidadeRestante}
              aoAcionar={() => aoAbrirGavetaDetalhe?.(tipo)}
            />
          ) : undefined
        }
        renderizarItem={(item, indice, modoAtual) => (
          <CartaoItemAcervoCompacto
            key={item.id}
            item={item}
            indice={indice}
            modo={modoAtual}
            aoSelecionar={(id) => aoAbrirGavetaDetalhe?.(tipo, id)}
          />
        )}
      />

      {modo === "grade_2_colunas" && quantidadeRestante > 0 ? (
        <button
          type="button"
          onClick={() => aoAbrirGavetaDetalhe?.(tipo)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--editorial-card-acervo-borda,var(--editorial-borda))] bg-[var(--editorial-card-acervo-fundo,var(--editorial-superficie))] px-4 py-2.5 text-xs font-semibold text-[var(--editorial-card-acervo-texto,var(--editorial-texto))] transition-opacity hover:opacity-85 cursor-pointer"
        >
          <span>
            Ver todos os {total} {rotuloTipoPlural}
          </span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </section>
  );
}

