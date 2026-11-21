import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartaoDigitalProfissionalPublico } from "@/componentes/editorial/CartaoDigitalProfissionalPublico";
import { construirUrlPublicaCartaoProfissional } from "@/dominio/entidades/catalogoConteudo";
import { ehIdentificadorPublicoValido } from "@/dominio/objetos-valor/identificadorPublico";
import { leitorPaginaPublicadaPadrao } from "@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

interface PropriedadesRotaCartaoProfissional {
  readonly params: Promise<{
    identificadorOrganizacao: string;
    identificadorProfissional: string;
  }>;
}

export async function generateMetadata({
  params,
}: PropriedadesRotaCartaoProfissional): Promise<Metadata> {
  const { identificadorOrganizacao, identificadorProfissional } = await params;

  if (
    !ehIdentificadorPublicoValido(identificadorOrganizacao) ||
    !ehIdentificadorPublicoValido(identificadorProfissional)
  ) {
    return {
      title: "Cartão não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const dados = await leitorPaginaPublicadaPadrao.buscarCartaoProfissionalPublico(
    identificadorOrganizacao,
    identificadorProfissional,
  );

  if (!dados) {
    return {
      title: "Cartão digital indisponível",
      robots: { index: false, follow: false },
    };
  }

  const { urlBasePublica } = lerConfiguracaoAmbientePublico();
  const urlCanonica = construirUrlPublicaCartaoProfissional({
    urlBasePublica,
    identificadorOrganizacao,
    identificadorCartao: dados.profissional.identificadorCartao,
  });

  const titulo = `${dados.profissional.nomeCompleto} — ${dados.paginaOrganizacao.identidade.nomeExibicao}`;

  const indexavel =
    dados.paginaOrganizacao.seo.indexavel === true &&
    dados.paginaOrganizacao.publicado &&
    dados.paginaOrganizacao.paginaAtiva;

  return {
    title: { absolute: titulo },
    description: dados.profissional.minibiografia,
    alternates: { canonical: urlCanonica },
    robots: indexavel ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "profile",
      locale: "pt_BR",
      url: urlCanonica,
      title: titulo,
      description: dados.profissional.minibiografia,
    },
  };
}

export default async function PaginaCartaoProfissionalPublico({
  params,
}: PropriedadesRotaCartaoProfissional) {
  const { identificadorOrganizacao, identificadorProfissional } = await params;

  if (
    !ehIdentificadorPublicoValido(identificadorOrganizacao) ||
    !ehIdentificadorPublicoValido(identificadorProfissional)
  ) {
    notFound();
  }

  const dados = await leitorPaginaPublicadaPadrao.buscarCartaoProfissionalPublico(
    identificadorOrganizacao,
    identificadorProfissional,
  );

  if (!dados) {
    notFound();
  }

  const { urlBasePublica } = lerConfiguracaoAmbientePublico();
  const urlPublicaCartao = construirUrlPublicaCartaoProfissional({
    urlBasePublica,
    identificadorOrganizacao,
    identificadorCartao: dados.profissional.identificadorCartao,
  });

  return (
    <CartaoDigitalProfissionalPublico
      paginaOrganizacao={dados.paginaOrganizacao}
      profissional={dados.profissional}
      servicosAtivos={dados.servicosAtivos}
      acervo={dados.acervo}
      urlPublicaCartao={urlPublicaCartao}
    />
  );
}
