import type { ResumoDireitosPlano } from "../entidades/autenticacaoEOrganizacao";

export type NivelAlertaAssinatura = "nenhum" | "carencia" | "inadimplente" | "bloqueado";

export interface PermissaoAcessoAssinatura {
  readonly podeEditarPainel: boolean;
  readonly vitrinePublicaAtiva: boolean;
  readonly nivelAlerta: NivelAlertaAssinatura;
  readonly diasInadimplencia: number;
}

const DIAS_CARENCIA_PADRAO = 5;
const DIAS_TOLERANCIA_VITRINE_INADIMPLENTE = 15;
const MILISSEGUNDOS_POR_DIA = 86_400_000;

function calcularDiasDesde(dataIso: string | undefined, agora: Date): number {
  if (!dataIso) return 0;
  const inicio = Date.parse(dataIso);
  if (Number.isNaN(inicio)) return 0;
  const diferenca = agora.getTime() - inicio;
  return Math.max(0, Math.floor(diferenca / MILISSEGUNDOS_POR_DIA));
}

/**
 * Avalia de forma pura as permissões de edição no painel e visibilidade da vitrine pública
 * a partir do estado da assinatura e do tempo decorrido desde o início da inadimplência.
 */
export function avaliarPermissaoAcessoAssinatura(
  resumo: ResumoDireitosPlano,
  agora: Date = new Date(),
): PermissaoAcessoAssinatura {
  const { situacaoAssinatura, inadimplenteDesde } = resumo;
  const diasInadimplencia = calcularDiasDesde(inadimplenteDesde, agora);

  if (situacaoAssinatura === "ativa") {
    return {
      podeEditarPainel: true,
      vitrinePublicaAtiva: true,
      nivelAlerta: "nenhum",
      diasInadimplencia: 0,
    };
  }

  if (situacaoAssinatura === "em_carencia") {
    return {
      podeEditarPainel: true,
      vitrinePublicaAtiva: true,
      nivelAlerta: "carencia",
      diasInadimplencia,
    };
  }

  if (situacaoAssinatura === "inadimplente") {
    if (diasInadimplencia <= DIAS_CARENCIA_PADRAO) {
      return {
        podeEditarPainel: true,
        vitrinePublicaAtiva: true,
        nivelAlerta: "carencia",
        diasInadimplencia,
      };
    }

    if (diasInadimplencia <= DIAS_TOLERANCIA_VITRINE_INADIMPLENTE) {
      return {
        podeEditarPainel: false,
        vitrinePublicaAtiva: true,
        nivelAlerta: "inadimplente",
        diasInadimplencia,
      };
    }

    return {
      podeEditarPainel: false,
      vitrinePublicaAtiva: false,
      nivelAlerta: "bloqueado",
      diasInadimplencia,
    };
  }

  // pendente_contratacao, suspensa ou cancelada
  return {
    podeEditarPainel: false,
    vitrinePublicaAtiva: false,
    nivelAlerta: "bloqueado",
    diasInadimplencia,
  };
}

