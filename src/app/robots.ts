import type { MetadataRoute } from "next";
import { construirConfiguracaoRobots } from "@/dominio/servicos/construtorSitemap";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

export default function robots(): MetadataRoute.Robots {
  const { urlBasePublica } = lerConfiguracaoAmbientePublico();
  return construirConfiguracaoRobots(urlBasePublica);
}

