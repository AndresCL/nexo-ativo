import { useMemo } from "react";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import {
  ContainerColecaoAcervo,
  type ModoLayoutAcervo,
} from "./ContainerColecaoAcervo";
import {
  CartaoItemAcervoCompacto,
  type ItemCardAcervoCompacto,
} from "./CartaoItemAcervoCompacto";

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

  if (itensAdaptados.length === 0) return null;

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
            className="text-xs font-medium text-[var(--editorial-destaque)] hover:underline"
          >
            Ver todos
          </button>
        </div>
      ) : null}

      <ContainerColecaoAcervo
        itens={itensAdaptados}
        modo={modo}
        ariaLabel={tituloSecao || (tipo === "produtos" ? "Lista de produtos" : "Lista de serviços")}
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
    </section>
  );
}

