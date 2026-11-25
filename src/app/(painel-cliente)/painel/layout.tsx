import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ProvedorEstadoInterfacePainel } from "@/estados/estadoInterfacePainel";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { EstruturaNavegacaoPainel } from "@/componentes/painel/EstruturaNavegacaoPainel";
import { ProvedorPoliticaPublicidade } from "@/componentes/painel/ProvedorPoliticaPublicidade";
import { carregarPerfilPublicidadeOrganizacaoServidor } from "@/infraestrutura/painel/leitorPerfilPublicidadeServidor";
import { carregarLogotipoOrganizacaoServidor } from "@/infraestrutura/painel/leitorLogotipoOrganizacaoServidor";
import { contarSolicitacoesNovasOrganizacaoServidor } from "@/infraestrutura/painel/leitorSolicitacoesOrganizacaoServidor";
import { contarAgendamentosConfirmadosOrganizacaoServidor } from "@/infraestrutura/painel/leitorAgendaOrganizacaoServidor";
import { ChatCrisp } from "@/componentes/interface/ChatCrisp";

export async function generateMetadata(): Promise<Metadata> {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoPrincipal = vinculos[0];

  const totalSolicitacoesNovas = organizacaoPrincipal
    ? await contarSolicitacoesNovasOrganizacaoServidor(organizacaoPrincipal.organizacaoId)
    : 0;

  return {
    title: totalSolicitacoesNovas > 0 ? `(${totalSolicitacoesNovas}) Painel` : "Painel",
    robots: { index: false, follow: false },
  };
}

export default async function LayoutPainelCliente({ children }: { readonly children: ReactNode }) {
  const sessao = await exigirSessaoAutenticadaServidor();

  if (!sessao.emailVerificado && !verificarPrivilegioFundador(sessao)) {
    redirect("/verificar-email");
  }

  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoPrincipal = vinculos[0];

  const [
    totalSolicitacoesNovas,
    totalAgendamentosConfirmados,
    perfilPublicidade,
    urlLogotipoOrganizacao,
  ] = organizacaoPrincipal
    ? await Promise.all([
        contarSolicitacoesNovasOrganizacaoServidor(organizacaoPrincipal.organizacaoId),
        contarAgendamentosConfirmadosOrganizacaoServidor(organizacaoPrincipal.organizacaoId),
        carregarPerfilPublicidadeOrganizacaoServidor(organizacaoPrincipal.organizacaoId),
        carregarLogotipoOrganizacaoServidor(organizacaoPrincipal.organizacaoId),
      ])
    : [0, 0, "padrao" as const, null];

  return (
    <ProvedorEstadoInterfacePainel>
      <ProvedorPoliticaPublicidade codigoPerfil={perfilPublicidade}>
        <EstruturaNavegacaoPainel
          nomeOrganizacaoAtiva={organizacaoPrincipal?.nomeOrganizacao}
          nomeUsuario={sessao.nomeExibicao}
          emailUsuario={sessao.email}
          urlLogotipoOrganizacao={urlLogotipoOrganizacao}
          totalSolicitacoesNovas={totalSolicitacoesNovas}
          totalAgendamentosConfirmados={totalAgendamentosConfirmados}
          ehFundador={verificarPrivilegioFundador(sessao)}
        >
          {children}
        </EstruturaNavegacaoPainel>
        <ChatCrisp
          emailUsuario={sessao.email}
          nomeUsuario={organizacaoPrincipal?.nomeOrganizacao ?? sessao.nomeExibicao ?? null}
        />
      </ProvedorPoliticaPublicidade>
    </ProvedorEstadoInterfacePainel>
  );
}
