import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProvedorEstadoInterfacePainel } from "@/estados/estadoInterfacePainel";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { EstruturaNavegacaoPainel } from "@/componentes/painel/EstruturaNavegacaoPainel";
import { ProvedorPoliticaPublicidade } from "@/componentes/painel/ProvedorPoliticaPublicidade";
import { carregarPerfilPublicidadeOrganizacaoServidor } from "@/infraestrutura/painel/leitorPerfilPublicidadeServidor";
import { contarSolicitacoesNovasOrganizacaoServidor } from "@/infraestrutura/painel/leitorSolicitacoesOrganizacaoServidor";
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
  };
}

export default async function LayoutPainelCliente({ children }: { readonly children: ReactNode }) {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoPrincipal = vinculos[0];

  const totalSolicitacoesNovas = organizacaoPrincipal
    ? await contarSolicitacoesNovasOrganizacaoServidor(organizacaoPrincipal.organizacaoId)
    : 0;

  const perfilPublicidade = organizacaoPrincipal
    ? await carregarPerfilPublicidadeOrganizacaoServidor(organizacaoPrincipal.organizacaoId)
    : "padrao";

  return (
    <ProvedorEstadoInterfacePainel>
      <ProvedorPoliticaPublicidade codigoPerfil={perfilPublicidade}>
        <EstruturaNavegacaoPainel
          nomeOrganizacaoAtiva={organizacaoPrincipal?.nomeOrganizacao}
          emailUsuario={sessao.email}
          totalSolicitacoesNovas={totalSolicitacoesNovas}
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
