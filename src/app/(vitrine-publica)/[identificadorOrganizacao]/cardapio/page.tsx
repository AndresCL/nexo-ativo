import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisualizadorCardapioTelaCheia } from "@/componentes/editorial/cardapio/VisualizadorCardapioTelaCheia";
import { ehIdentificadorPublicoValido } from "@/dominio/objetos-valor/identificadorPublico";
import { listarCardapiosPublicosServidor } from "@/infraestrutura/cardapio/leitorCardapiosServidor";
import { leitorPaginaPublicadaPadrao } from "@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore";

export const dynamic = "force-dynamic";

interface PropriedadesPaginaCardapio {
  readonly params: Promise<{
    identificadorOrganizacao: string;
  }>;
  readonly searchParams: Promise<{
    cardapio?: string;
  }>;
}

export async function generateMetadata({ params }: PropriedadesPaginaCardapio): Promise<Metadata> {
  const { identificadorOrganizacao } = await params;

  if (!ehIdentificadorPublicoValido(identificadorOrganizacao)) {
    return {
      title: "Cardápio não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const pagina =
    await leitorPaginaPublicadaPadrao.buscarPorIdentificadorPublico(identificadorOrganizacao);

  if (!pagina) {
    return {
      title: "Cardápio indisponível",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Cardápio — ${pagina.identidade.nomeExibicao}`,
    description: `Confira o cardápio digital de ${pagina.identidade.nomeExibicao}.`,
  };
}

export default async function PaginaCardapioOrganizacao({
  params,
  searchParams,
}: PropriedadesPaginaCardapio) {
  const { identificadorOrganizacao } = await params;
  const { cardapio: slugInicial } = await searchParams;

  if (!ehIdentificadorPublicoValido(identificadorOrganizacao)) {
    notFound();
  }

  const pagina =
    await leitorPaginaPublicadaPadrao.buscarPorIdentificadorPublico(identificadorOrganizacao);

  if (!pagina) {
    notFound();
  }

  const cardapios = await listarCardapiosPublicosServidor(pagina.organizacaoId);

  return (
    <VisualizadorCardapioTelaCheia
      pagina={pagina}
      cardapios={cardapios}
      slugInicial={slugInicial}
    />
  );
}

