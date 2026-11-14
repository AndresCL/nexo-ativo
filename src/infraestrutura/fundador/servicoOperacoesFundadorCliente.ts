import { httpsCallable } from "firebase/functions";
import type {
  ParametrosAjustarPlanoOrganizacaoFundador,
  ParametrosAlterarSituacaoOrganizacaoFundador,
  ParametrosDefinirPerfilPublicidadeOrganizacaoFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";

export interface PortaOperacoesFundadorCliente {
  alterarSituacaoOrganizacao(
    parametros: ParametrosAlterarSituacaoOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string; novaSituacao: string }>;
  ajustarPlanoOrganizacao(
    parametros: ParametrosAjustarPlanoOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string }>;
  definirPerfilPublicidadeOrganizacao(
    parametros: ParametrosDefinirPerfilPublicidadeOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string; novoPerfil: string }>;
}

export class ServicoOperacoesFundadorCliente implements PortaOperacoesFundadorCliente {
  public async alterarSituacaoOrganizacao(
    parametros: ParametrosAlterarSituacaoOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string; novaSituacao: string }> {
    const { funcoesRemotas } = obterServicosClienteFirebase();
    const chamada = httpsCallable<
      ParametrosAlterarSituacaoOrganizacaoFundador,
      { atualizado: boolean; organizacaoId: string; novaSituacao: string }
    >(funcoesRemotas, "alterarSituacaoOrganizacaoFundador");

    const resposta = await chamada(parametros);
    return resposta.data;
  }

  public async ajustarPlanoOrganizacao(
    parametros: ParametrosAjustarPlanoOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string }> {
    const { funcoesRemotas } = obterServicosClienteFirebase();
    const chamada = httpsCallable<
      ParametrosAjustarPlanoOrganizacaoFundador,
      { atualizado: boolean; organizacaoId: string }
    >(funcoesRemotas, "ajustarPlanoOrganizacaoFundador");

    const resposta = await chamada(parametros);
    return resposta.data;
  }

  public async definirPerfilPublicidadeOrganizacao(
    parametros: ParametrosDefinirPerfilPublicidadeOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string; novoPerfil: string }> {
    const { funcoesRemotas } = obterServicosClienteFirebase();
    const chamada = httpsCallable<
      ParametrosDefinirPerfilPublicidadeOrganizacaoFundador,
      { atualizado: boolean; organizacaoId: string; novoPerfil: string }
    >(funcoesRemotas, "definirPerfilPublicidadeOrganizacaoFundador");

    const resposta = await chamada(parametros);
    return resposta.data;
  }
}

export const servicoOperacoesFundadorCliente: PortaOperacoesFundadorCliente =
  new ServicoOperacoesFundadorCliente();
