import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoSolicitacoesOrganizacaoServidor } from "@/infraestrutura/painel/leitorSolicitacoesOrganizacaoServidor";
import { GerenciadorSolicitacoesPainel } from "@/componentes/painel/solicitacoes/GerenciadorSolicitacoesPainel";

export default async function PaginaSolicitacoesPainel() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoAtiva = vinculos[0];

  if (!organizacaoAtiva) {
    redirect("/painel");
  }

  const contexto = await carregarContextoSolicitacoesOrganizacaoServidor(
    sessao,
    organizacaoAtiva.organizacaoId,
  );

  if (!contexto) {
    redirect("/painel");
  }

  return (
    <GerenciadorSolicitacoesPainel
      organizacaoId={contexto.organizacao.id}
      nomeOrganizacao={contexto.organizacao.nome}
      solicitacoesIniciais={contexto.solicitacoes}
      profissionaisAtivos={contexto.profissionais}
      configuracaoEmailInicial={contexto.configuracaoEmail}
      consumoMensalEmailInicial={contexto.consumoMensalEmail}
      identificadorLocalGoogle={contexto.identificadorLocalGoogle}
      podeGerenciarSolicitacoes={contexto.podeGerenciarSolicitacoes}
      podeConfigurarEmail={contexto.podeConfigurarEmail}
    />
  );
}
