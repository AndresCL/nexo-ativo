import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VitrinePublicaInterativa } from "@/componentes/editorial/VitrinePublicaInterativa";
import { ehIdentificadorPublicoValido } from "@/dominio/objetos-valor/identificadorPublico";
import {
  construirResumoMetadadosSeo,
  serializarJsonLdSeguro,
} from "@/dominio/servicos/construtorDadosEstruturadosSeo";
import { leitorPaginaPublicadaPadrao } from "@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

export const dynamic = "force-dynamic";

interface PropriedadesPaginaVitrine {
  readonly params: Promise<{
    identificadorOrganizacao: string;
  }>;
}

export async function generateMetadata({ params }: PropriedadesPaginaVitrine): Promise<Metadata> {
  const { identificadorOrganizacao } = await params;

  if (!ehIdentificadorPublicoValido(identificadorOrganizacao)) {
    return {
      title: "Página não encontrada",
      robots: { index: false, follow: false },
    };
  }

  const pagina =
    await leitorPaginaPublicadaPadrao.buscarPorIdentificadorPublico(identificadorOrganizacao);

  if (!pagina) {
    return {
      title: "Presença digital não disponível",
      robots: { index: false, follow: false },
    };
  }

  const { urlBasePublica } = lerConfiguracaoAmbientePublico();
  const seo = construirResumoMetadadosSeo(pagina, urlBasePublica);

  return {
    title: {
      absolute: seo.titulo,
    },
    description: seo.descricao,
    alternates: {
      canonical: seo.urlCanonica,
    },
    robots: seo.indexavel ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: seo.urlCanonica,
      siteName: pagina.identidade.nomeExibicao,
      title: seo.titulo,
      description: seo.descricao,
      images: [
        {
          url: seo.urlImagemCompartilhamento,
          width: 1200,
          height: 630,
          alt: pagina.identidade.nomeExibicao,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.titulo,
      description: seo.descricao,
      images: [seo.urlImagemCompartilhamento],
    },
  };
}

export default async function PaginaVitrineOrganizacao({ params }: PropriedadesPaginaVitrine) {
  const { identificadorOrganizacao } = await params;

  if (!ehIdentificadorPublicoValido(identificadorOrganizacao)) {
    notFound();
  }

  const pacoteVitrine =
    await leitorPaginaPublicadaPadrao.buscarVitrineCompletaPorIdentificador(
      identificadorOrganizacao,
    );

  if (!pacoteVitrine) {
    notFound();
  }

  const { pagina, acervo } = pacoteVitrine;
  const { urlBasePublica } = lerConfiguracaoAmbientePublico();
  const jsonLdSeguro = serializarJsonLdSeguro(pagina, urlBasePublica);

  return (
    <main>
      {pagina.identidade.urlLogotipoOpcional ? (
        <link
          rel="preload"
          as="image"
          href={pagina.identidade.urlLogotipoOpcional}
          fetchPriority="high"
        />
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro }} />
      <VitrinePublicaInterativa pagina={pagina} acervo={acervo} />
    </main>
  );
}
