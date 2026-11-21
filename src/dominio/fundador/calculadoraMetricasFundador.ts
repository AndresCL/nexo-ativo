import { CATALOGO_PLANOS_FLUXO } from "../assinaturas/tiposAssinaturaAsaas";
import type {
  CodigoPlanoAssinatura,
  OrigemAssinatura,
  SituacaoOrganizacao,
  SituacaoResumoAssinatura,
} from "../entidades/autenticacaoEOrganizacao";

/**
 * Projeção agnóstica de gateway representando uma assinatura recorrente ativa e pagante.
 */
export interface AssinaturaRecorrenteAtiva {
  readonly organizacaoId: string;
  readonly valorMensalCentavos: number;
}

export interface ResumoOrganizacaoParaMetricas {
  readonly id: string;
  readonly situacao: SituacaoOrganizacao;
  readonly planoCodigo?: CodigoPlanoAssinatura;
  readonly situacaoAssinatura?: SituacaoResumoAssinatura;
  readonly origemAssinatura?: OrigemAssinatura;
}

export interface ResultadoMetricasAssinaturaFundador {
  readonly totalOrganizacoes: number;
  readonly organizacoesAtivas: number;
  readonly organizacoesSuspensas: number;
  readonly assinaturasAtivas: number;
  readonly assinaturasInadimplentes: number;
  readonly assinaturasCanceladas: number;
  readonly receitaMensalRecorrenteCentavos: number;
}

/**
 * Resolve a origem efetiva da assinatura considerando compatibilidade com documentos legados:
 * se não há assinatura recorrente ativa registrada, uma situação "ativa" é tratada como cortesia.
 */
export function resolverOrigemAssinaturaEfetiva(
  organizacao: Pick<ResumoOrganizacaoParaMetricas, "situacaoAssinatura" | "origemAssinatura">,
  assinaturaAtiva: AssinaturaRecorrenteAtiva | undefined,
): OrigemAssinatura | undefined {
  if (organizacao.origemAssinatura === "cortesia") {
    return "cortesia";
  }

  if (assinaturaAtiva) {
    return "gateway";
  }

  if (organizacao.situacaoAssinatura === "ativa") {
    return "cortesia";
  }

  return organizacao.origemAssinatura;
}

export function formatarRotuloSituacaoAssinatura(
  situacaoAssinatura: SituacaoResumoAssinatura,
  origemAssinatura?: OrigemAssinatura,
): string {
  if (situacaoAssinatura === "ativa" && origemAssinatura === "cortesia") {
    return "ativa (cortesia)";
  }
  return situacaoAssinatura;
}

/**
 * Calcula métricas operacionais e MRR da plataforma.
 * Apenas organizações ativas com assinatura recorrente ativa (não cortesia) entram no MRR e em assinaturasAtivas.
 */
export function calcularMetricasAssinaturaFundador(
  organizacoes: readonly ResumoOrganizacaoParaMetricas[],
  assinaturasAtivasPorOrg: ReadonlyMap<string, AssinaturaRecorrenteAtiva>,
): ResultadoMetricasAssinaturaFundador {
  let totalOrganizacoes = 0;
  let organizacoesAtivas = 0;
  let organizacoesSuspensas = 0;
  let assinaturasAtivas = 0;
  let assinaturasInadimplentes = 0;
  let assinaturasCanceladas = 0;
  let receitaMensalRecorrenteCentavos = 0;

  for (const org of organizacoes) {
    totalOrganizacoes += 1;

    if (org.situacao === "ativa") {
      organizacoesAtivas += 1;
    } else if (org.situacao === "suspensa") {
      organizacoesSuspensas += 1;
    }

    const assinaturaAtiva = assinaturasAtivasPorOrg.get(org.id);
    const origemEfetiva = resolverOrigemAssinaturaEfetiva(org, assinaturaAtiva);

    if (
      org.situacao === "ativa" &&
      org.situacaoAssinatura === "ativa" &&
      origemEfetiva === "gateway" &&
      assinaturaAtiva
    ) {
      assinaturasAtivas += 1;

      const valorAssinatura =
        Number.isFinite(assinaturaAtiva.valorMensalCentavos) &&
        assinaturaAtiva.valorMensalCentavos > 0
          ? Math.round(assinaturaAtiva.valorMensalCentavos)
          : org.planoCodigo
            ? (CATALOGO_PLANOS_FLUXO[org.planoCodigo]?.mensalidadeCentavos ?? 0)
            : 0;

      receitaMensalRecorrenteCentavos += valorAssinatura;
    } else if (org.situacaoAssinatura === "inadimplente") {
      assinaturasInadimplentes += 1;
    } else if (org.situacaoAssinatura === "cancelada") {
      assinaturasCanceladas += 1;
    }
  }

  return {
    totalOrganizacoes,
    organizacoesAtivas,
    organizacoesSuspensas,
    assinaturasAtivas,
    assinaturasInadimplentes,
    assinaturasCanceladas,
    receitaMensalRecorrenteCentavos,
  };
}

