import { httpsCallable } from "firebase/functions";
import type {
  EtapaKanbanOrganizacaoFundador,
  MensagemKanbanFundador,
  ParametrosAdicionarMensagemKanbanFundador,
  ParametrosAjustarPlanoOrganizacaoFundador,
  ParametrosAlterarEtapaKanbanFundador,
  ParametrosAlterarSituacaoOrganizacaoFundador,
  ParametrosCriarOrganizacaoPeloFundador,
  ParametrosDefinirPerfilPublicidadeOrganizacaoFundador,
  ResultadoCriarOrganizacaoPeloFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";
import {
  esquemaAdicionarMensagemKanbanFundador,
  esquemaAlterarEtapaKanbanFundador,
  esquemaAtualizarEmailProprietarioFundador,
  type ParametrosAtualizarEmailProprietarioFundador,
} from "@/validacoes/esquemasPainelFundador";

export interface PortaKanbanFundadorCliente {
  alterarEtapaKanbanOrganizacao(
    parametros: ParametrosAlterarEtapaKanbanFundador,
  ): Promise<{ organizacaoId: string; etapaKanban: EtapaKanbanOrganizacaoFundador }>;
  adicionarMensagemKanbanOrganizacao(
    parametros: ParametrosAdicionarMensagemKanbanFundador,
  ): Promise<MensagemKanbanFundador>;
}

export interface PortaOperacoesFundadorCliente extends Partial<PortaKanbanFundadorCliente> {
  alterarSituacaoOrganizacao(
    parametros: ParametrosAlterarSituacaoOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string; novaSituacao: string }>;
  ajustarPlanoOrganizacao(
    parametros: ParametrosAjustarPlanoOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string }>;
  definirPerfilPublicidadeOrganizacao(
    parametros: ParametrosDefinirPerfilPublicidadeOrganizacaoFundador,
  ): Promise<{ atualizado: boolean; organizacaoId: string; novoPerfil: string }>;
  criarOrganizacaoManual?(
    parametros: ParametrosCriarOrganizacaoPeloFundador,
  ): Promise<ResultadoCriarOrganizacaoPeloFundador>;
  atualizarEmailProprietarioOrganizacao?(
    parametros: ParametrosAtualizarEmailProprietarioFundador,
  ): Promise<{
    atualizado: boolean;
    modo: "sem_alteracao" | "email_atualizado" | "titularidade_transferida";
    organizacaoId: string;
    uidProprietario: string;
    novoEmail: string;
  }>;
}

export class ServicoOperacoesFundadorCliente
  implements PortaOperacoesFundadorCliente, PortaKanbanFundadorCliente
{
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

  public async criarOrganizacaoManual(
    parametros: ParametrosCriarOrganizacaoPeloFundador,
  ): Promise<ResultadoCriarOrganizacaoPeloFundador> {
    const { funcoesRemotas } = obterServicosClienteFirebase();
    const chamada = httpsCallable<
      ParametrosCriarOrganizacaoPeloFundador,
      ResultadoCriarOrganizacaoPeloFundador
    >(funcoesRemotas, "criarOrganizacaoFundador");

    const resposta = await chamada(parametros);
    return resposta.data;
  }

  public async alterarEtapaKanbanOrganizacao(
    parametros: ParametrosAlterarEtapaKanbanFundador,
  ): Promise<{ organizacaoId: string; etapaKanban: EtapaKanbanOrganizacaoFundador }> {
    const validado = esquemaAlterarEtapaKanbanFundador.parse(parametros);
    const resposta = await fetch("/api/fundador/acompanhamento", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validado),
    });

    if (!resposta.ok) {
      const erroJson = (await resposta.json().catch(() => null)) as { erro?: string } | null;
      throw new Error(erroJson?.erro ?? "Não foi possível salvar a etapa do Kanban.");
    }

    return {
      organizacaoId: validado.organizacaoId,
      etapaKanban: validado.etapaKanban,
    };
  }

  public async adicionarMensagemKanbanOrganizacao(
    parametros: ParametrosAdicionarMensagemKanbanFundador,
  ): Promise<MensagemKanbanFundador> {
    const validado = esquemaAdicionarMensagemKanbanFundador.parse(parametros);
    const resposta = await fetch("/api/fundador/acompanhamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validado),
    });

    if (!resposta.ok) {
      const erroJson = (await resposta.json().catch(() => null)) as { erro?: string } | null;
      throw new Error(erroJson?.erro ?? "Não foi possível salvar a mensagem.");
    }

    const dados = (await resposta.json()) as { mensagem: MensagemKanbanFundador };
    return dados.mensagem;
  }

  public async atualizarEmailProprietarioOrganizacao(
    parametros: ParametrosAtualizarEmailProprietarioFundador,
  ): Promise<{
    atualizado: boolean;
    modo: "sem_alteracao" | "email_atualizado" | "titularidade_transferida";
    organizacaoId: string;
    uidProprietario: string;
    novoEmail: string;
  }> {
    const validado = esquemaAtualizarEmailProprietarioFundador.parse(parametros);
    const resposta = await fetch("/api/fundador/email-proprietario", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validado),
    });

    if (!resposta.ok) {
      const erroJson = (await resposta.json().catch(() => null)) as { erro?: string } | null;
      throw new Error(erroJson?.erro ?? "Não foi possível atualizar o e-mail do proprietário.");
    }

    return (await resposta.json()) as {
      atualizado: boolean;
      modo: "sem_alteracao" | "email_atualizado" | "titularidade_transferida";
      organizacaoId: string;
      uidProprietario: string;
      novoEmail: string;
    };
  }
}

export const servicoOperacoesFundadorCliente: PortaOperacoesFundadorCliente &
  PortaKanbanFundadorCliente = new ServicoOperacoesFundadorCliente();

