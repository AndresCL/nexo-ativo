import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoCatalogoOrganizacaoServidor } from "@/infraestrutura/painel/leitorCatalogoOrganizacaoServidor";
import { GerenciadorCatalogoPainel } from "@/componentes/painel/catalogo/GerenciadorCatalogoPainel";

export default async function PaginaCatalogoPainel() {
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
    <GerenciadorCatalogoPainel
      organizacaoId={contexto.organizacao.id}
      identificadorPublico={contexto.organizacao.identificadorPublico}
      produtosIniciais={contexto.produtos}
      versaoPublicadaInicial={contexto.versaoPublicadaAtual}
      podeEditarConteudo={contexto.podeEditarConteudo}
      podePublicarPagina={contexto.podePublicarPagina}
    />
  );
}
