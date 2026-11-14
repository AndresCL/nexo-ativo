import type { ConfiguracaoEmailOrganizacao } from "@/dominio/email/tiposEmailTransacional";
import type { SituacaoSolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import type { DadosSubmissaoPublicaSolicitacao } from "@/validacoes/esquemaSolicitacaoComercial";

export interface ResultadoSubmissaoSolicitacaoVisitante {
  readonly solicitacaoId: string;
  readonly duplicadaIdempotente: boolean;
}

export interface PortaSubmissaoSolicitacaoVisitante {
  enviarSolicitacaoVisitante(
    dados: DadosSubmissaoPublicaSolicitacao,
  ): Promise<ResultadoSubmissaoSolicitacaoVisitante>;
}

export interface ParametrosAtualizacaoAndamentoSolicitacao {
  readonly organizacaoId: string;
  readonly solicitacaoId: string;
  readonly situacao: SituacaoSolicitacaoComercial;
  readonly observacoesInternas?: string;
  readonly profissionalId?: string;
}

export interface PortaGerenciamentoSolicitacoesPainel {
  atualizarAndamentoSolicitacao(
    parametros: ParametrosAtualizacaoAndamentoSolicitacao,
  ): Promise<void>;
  salvarConfiguracaoEmailOrganizacao?(configuracao: ConfiguracaoEmailOrganizacao): Promise<void>;
}
