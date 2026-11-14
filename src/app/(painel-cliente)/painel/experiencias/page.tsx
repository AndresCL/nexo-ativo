import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoCatalogoOrganizacaoServidor } from "@/infraestrutura/painel/leitorCatalogoOrganizacaoServidor";
import { GerenciadorExperienciasPainel } from "@/componentes/painel/catalogo/GerenciadorExperienciasPainel";

export default async function PaginaExperienciasPainel() {
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
    <GerenciadorExperienciasPainel
      organizacaoId={contexto.organizacao.id}
      identificadorPublico={contexto.organizacao.identificadorPublico}
      microfluxosIniciais={contexto.microfluxos}
      profissionais={contexto.profissionais}
      quantidadeProfissionaisAtivos={contexto.profissionais.filter((p) => p.ativo).length}
      versaoPublicadaInicial={contexto.versaoPublicadaAtual}
      podeEditarConteudo={contexto.podeEditarConteudo}
      podePublicarPagina={contexto.podePublicarPagina}
    />
  );
}
