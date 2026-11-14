import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoCatalogoOrganizacaoServidor } from "@/infraestrutura/painel/leitorCatalogoOrganizacaoServidor";
import { GerenciadorPortfolioPainel } from "@/componentes/painel/catalogo/GerenciadorPortfolioPainel";

export default async function PaginaPortfolioPainel() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoAtiva = vinculos[0];

  if (!organizacaoAtiva) {
    redirect("/painel");
  }

  const contexto = await carregarContextoCatalogoOrganizacaoServidor(
    sessao,
    organizacaoAtiva.organizacaoId,
  );

  if (!contexto) {
    redirect("/painel");
  }

  return (
    <GerenciadorPortfolioPainel
      organizacaoId={contexto.organizacao.id}
      identificadorPublico={contexto.organizacao.identificadorPublico}
      projetosIniciais={contexto.projetosPortfolio}
      versaoPublicadaInicial={contexto.versaoPublicadaAtual}
      podeEditarConteudo={contexto.podeEditarConteudo}
      podePublicarPagina={contexto.podePublicarPagina}
    />
  );
}
