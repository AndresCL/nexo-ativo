import { httpsCallable } from "firebase/functions";
import type {
  BriefingImplantacaoFundador,
  ParametrosSalvarBriefingImplantacaoFundador,
} from "@/dominio/fundador/briefingImplantacao";
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
  esquemaSalvarBriefingImplantacaoFundador,
  type ParametrosAtualizarEmailProprietarioFundador,
} from "@/validacoes/esquemasPainelFundador";

export interface PortaBriefingFundadorCliente {
  obterBriefingImplantacao(
    organizacaoId: string,
    sinal?: AbortSignal,
  ): Promise<BriefingImplantacaoFundador | null>;
  salvarBriefingImplantacao(
    parametros: ParametrosSalvarBriefingImplantacaoFundador,
  ): Promise<BriefingImplantacaoFundador | null>;
}

export interface PortaKanbanFundadorCliente {
  alterarEtapaKanbanOrganizacao(
    parametros: ParametrosAlterarEtapaKanbanFundador,
  ): Promise<{ organizacaoId: string; etapaKanban: EtapaKanbanOrganizacaoFundador }>;
  adicionarMensagemKanbanOrganizacao(
    parametros: ParametrosAdicionarMensagemKanbanFundador,
  ): Promise<MensagemKanbanFundador>;
}

export interface PortaOperacoesFundadorCliente
  extends Partial<PortaKanbanFundadorCliente>,
    Partial<PortaBriefingFundadorCliente> {
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
  implements
    PortaOperacoesFundadorCliente,
    PortaKanbanFundadorCliente,
    PortaBriefingFundadorCliente
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

  public async obterBriefingImplantacao(
    organizacaoId: string,
    sinal?: AbortSignal,
  ): Promise<BriefingImplantacaoFundador | null> {
    const query = new URLSearchParams({ organizacaoId }).toString();
    const resposta = await fetch(`/api/fundador/briefing?${query}`, {
      method: "GET",
      signal: sinal,
    });

    if (!resposta.ok) {
      const erroJson = (await resposta.json().catch(() => null)) as { erro?: string } | null;
      throw new Error(erroJson?.erro ?? "Não foi possível carregar o briefing de implantação.");
    }

    const dados = (await resposta.json()) as { briefing: BriefingImplantacaoFundador | null };
    return dados.briefing;
  }

  public async salvarBriefingImplantacao(
    parametros: ParametrosSalvarBriefingImplantacaoFundador,
  ): Promise<BriefingImplantacaoFundador | null> {
    const validado = esquemaSalvarBriefingImplantacaoFundador.parse(parametros);
    const resposta = await fetch("/api/fundador/briefing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validado),
    });

    if (!resposta.ok) {
      const erroJson = (await resposta.json().catch(() => null)) as { erro?: string } | null;
      throw new Error(erroJson?.erro ?? "Não foi possível salvar o briefing de implantação.");
    }

    const dados = (await resposta.json()) as { briefing: BriefingImplantacaoFundador | null };
    return dados.briefing;
  }
}

export const servicoOperacoesFundadorCliente: PortaOperacoesFundadorCliente &
  PortaKanbanFundadorCliente &
  PortaBriefingFundadorCliente = new ServicoOperacoesFundadorCliente();

