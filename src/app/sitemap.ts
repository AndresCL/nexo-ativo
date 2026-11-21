import type { MetadataRoute } from "next";
import { construirEntradasSitemapArtigos } from "@/dominio/conteudo/artigosEditoriais";
import { construirEntradasSitemap } from "@/dominio/servicos/construtorSitemap";
import { listarArtigosEditoriais } from "@/infraestrutura/conteudo/catalogoArtigos";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

export default function sitemap(): MetadataRoute.Sitemap {
  const { urlBasePublica } = lerConfiguracaoAmbientePublico();
  const rotasArtigos = construirEntradasSitemapArtigos(listarArtigosEditoriais());
  return construirEntradasSitemap(urlBasePublica, rotasArtigos);
}

