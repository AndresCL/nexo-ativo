import type {
  CodigoPlanoAssinatura,
  OrigemAssinatura,
  RegistroAuditoria,
  SituacaoOrganizacao,
  SituacaoResumoAssinatura,
} from "../entidades/autenticacaoEOrganizacao";
import type { CodigoPerfilPublicidade } from "../publicidade/tiposPerfilPublicidade";

export const CODIGOS_ETAPA_KANBAN_FUNDADOR = [
  "onboarding",
  "atencao",
  "ativo",
  "inativo",
] as const;

export type EtapaKanbanOrganizacaoFundador = (typeof CODIGOS_ETAPA_KANBAN_FUNDADOR)[number];

export const DESCRITORES_ETAPA_KANBAN_FUNDADOR: Readonly<
  Record<
    EtapaKanbanOrganizacaoFundador,
    {
      readonly rotulo: string;
      readonly descricao: string;
    }
  >
> = {
  onboarding: {
    rotulo: "Em onboarding",
    descricao: "Implantação e configuração inicial da vitrine",
  },
  atencao: {
    rotulo: "Em negociação",
    descricao: "Acompanhamento comercial, proposta ou renovação",
  },
  ativo: {
    rotulo: "Ativo",
    descricao: "Cliente operando regularmente na plataforma",
  },
  inativo: {
    rotulo: "Churn",
    descricao: "Conta pausada, cancelada ou encerrada",
  },
};

export interface MensagemKanbanFundador {
  readonly id: string;
  readonly texto: string;
  readonly autorEmail?: string;
  readonly criadoEmIso: string;
}

export interface AcompanhamentoOrganizacaoFundador {
  readonly organizacaoId: string;
  readonly etapaKanban: EtapaKanbanOrganizacaoFundador;
  readonly mensagens: readonly MensagemKanbanFundador[];
  readonly atualizadoEmIso: string;
}

export interface PontoHistoricoMrrMensal {
  readonly anoMes: string; // formato YYYY-MM
  readonly rotuloMes: string; // ex: "nov/26"
  readonly mrrLiquidoCentavos: number;
  readonly mrrBrutoCentavos: number;
  readonly taxasAsaasCentavos: number;
  readonly quantidadeCobrancas: number;
  readonly mesAtual: boolean;
}

export interface MetricasOperacionaisFundador {
  readonly totalOrganizacoes: number;
  readonly organizacoesAtivas: number;
  readonly organizacoesSuspensas: number;
  readonly assinaturasAtivas: number;
  readonly assinaturasInadimplentes: number;
  readonly assinaturasCanceladas: number;
  readonly receitaMensalRecorrenteCentavos: number; // MRR bruto em centavos inteiros
  readonly receitaMensalRecorrenteLiquidaCentavos?: number; // MRR líquido (pós-taxas Asaas) em centavos
  readonly taxasAsaasMensaisCentavos?: number; // Diferença bruto - líquido em centavos
  readonly historicoMrrMensal?: readonly PontoHistoricoMrrMensal[];
  readonly totalSolicitacoesComerciais: number;
  readonly totalEmailsEnviadosMesAtual?: number;
  readonly emailsSolicitacoesMesAtual?: number;
  readonly emailsAutenticacaoMesAtual?: number;
  readonly anoMesReferenciaEmail?: string;
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
  readonly origemAssinatura?: OrigemAssinatura;
  readonly limiteProfissionaisAtivos?: number;
  readonly limiteEnviosEmailMensal?: number;
  readonly emailsEnviadosMesAtual?: number;
  readonly totalMembros: number;
  readonly etapaKanban?: EtapaKanbanOrganizacaoFundador;
  readonly mensagensKanban?: readonly MensagemKanbanFundador[];
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

export interface ParametrosAlterarEtapaKanbanFundador {
  readonly organizacaoId: string;
  readonly etapaKanban: EtapaKanbanOrganizacaoFundador;
}

export interface ParametrosAdicionarMensagemKanbanFundador {
  readonly organizacaoId: string;
  readonly texto: string;
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

export interface ParametrosCriarOrganizacaoPeloFundador {
  readonly nome: string;
  readonly identificadorPublico: string;
  readonly segmentoAtividade: string;
  readonly emailProprietario: string;
  readonly nomeProprietario: string;
  readonly senhaInicialOpcional?: string;
  readonly planoCodigo: CodigoPlanoAssinatura;
  readonly perfilPublicidade?: CodigoPerfilPublicidade;
  readonly vincularFundadorComoAdministrador?: boolean;
}

export interface ResultadoCriarOrganizacaoPeloFundador {
  readonly organizacao: ItemVisaoGeralOrganizacaoFundador;
  readonly uidProprietario: string;
}

export type { RegistroAuditoria };
