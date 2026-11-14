import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoCatalogoOrganizacaoServidor } from "@/infraestrutura/painel/leitorCatalogoOrganizacaoServidor";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";
import { GerenciadorEquipePainel } from "@/componentes/painel/catalogo/GerenciadorEquipePainel";

export default async function PaginaEquipePainel() {
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

  const { urlBasePublica } = lerConfiguracaoAmbientePublico();

  return (
    <GerenciadorEquipePainel
      organizacaoId={contexto.organizacao.id}
      identificadorPublico={contexto.organizacao.identificadorPublico}
      urlBasePublica={urlBasePublica}
      resumoDireitosPlano={contexto.organizacao.resumoDireitosPlano}
      profissionaisIniciais={contexto.profissionais}
      versaoPublicadaInicial={contexto.versaoPublicadaAtual}
      podeEditarConteudo={contexto.podeEditarConteudo}
      podePublicarPagina={contexto.podePublicarPagina}
    />
  );
}
