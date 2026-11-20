import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoAssinaturaOrganizacaoServidor } from "@/infraestrutura/painel/leitorAssinaturaOrganizacaoServidor";
import { GerenciadorAssinaturaPainel } from "@/componentes/painel/assinatura/GerenciadorAssinaturaPainel";

export default async function PaginaAssinaturaPainel() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoAtiva = vinculos[0];

  if (!organizacaoAtiva) {
    redirect("/painel");
  }

  const contexto = await carregarContextoAssinaturaOrganizacaoServidor(
    sessao,
    organizacaoAtiva.organizacaoId,
  );

  if (!contexto) {
    redirect("/painel");
  }

  return (
    <GerenciadorAssinaturaPainel
      organizacao={contexto.organizacao}
      assinaturaAtual={contexto.assinatura}
      cobrancas={contexto.cobrancas}
      podeGerenciarAssinatura={contexto.podeGerenciarAssinatura}
      emailUsuario={sessao.email}
    />
  );
}
