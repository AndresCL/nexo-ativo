import type {
  CodigoPlanoAssinatura,
  RegistroAuditoria,
  SituacaoOrganizacao,
  SituacaoResumoAssinatura,
} from "../entidades/autenticacaoEOrganizacao";
import type { CodigoPerfilPublicidade } from "../publicidade/tiposPerfilPublicidade";

export interface MetricasOperacionaisFundador {
  readonly totalOrganizacoes: number;
  readonly organizacoesAtivas: number;
  readonly organizacoesSuspensas: number;
  readonly assinaturasAtivas: number;
  readonly assinaturasInadimplentes: number;
  readonly assinaturasCanceladas: number;
  readonly receitaMensalRecorrenteCentavos: number; // MRR em centavos inteiros
  readonly totalSolicitacoesComerciais: number;
}

export interface ItemVisaoGeralOrganizacaoFundador {
  readonly id: string;
  readonly nome: string;
  readonly identificadorPublico: string;
  readonly segmentoAtividade: string;
  readonly perfilPublicidade: CodigoPerfilPublicidade;
  readonly situacao: SituacaoOrganizacao;
  readonly planoCodigo: CodigoPlanoAssinatura;
  readonly situacaoAssinatura: SituacaoResumoAssinatura;
  readonly totalMembros: number;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

export interface ParametrosAlterarSituacaoOrganizacaoFundador {
  readonly organizacaoId: string;
  readonly novaSituacao: SituacaoOrganizacao;
  readonly justificativa: string;
}

export interface ParametrosDefinirPerfilPublicidadeOrganizacaoFundador {
  readonly organizacaoId: string;
  readonly novoPerfil: CodigoPerfilPublicidade;
  readonly justificativa: string;
}

export interface ParametrosAjustarPlanoOrganizacaoFundador {
  readonly organizacaoId: string;
  readonly novoPlanoCodigo: CodigoPlanoAssinatura;
  readonly novaSituacaoAssinatura: SituacaoResumoAssinatura;
  readonly limiteProfissionaisAtivos?: number;
  readonly limiteEnviosEmailMensal?: number;
  readonly permitePublicacaoPublica?: boolean;
  readonly justificativa: string;
}

export type { RegistroAuditoria };
