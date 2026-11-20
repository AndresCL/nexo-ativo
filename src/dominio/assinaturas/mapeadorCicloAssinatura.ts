import type {
  Organizacao,
} from "../entidades/autenticacaoEOrganizacao";
import type { RegistroAssinaturaAsaas } from "./tiposAssinaturaAsaas";

export type TipoEstadoCiclo =
  | "ativa_regular"
  | "reativacao_pendente"
  | "aguardando_primeiro_pagamento"
  | "cancelada_com_acesso"
  | "encerrada_sem_acesso"
  | "inadimplente"
  | "em_carencia"
  | "suspensa"
  | "avaliacao_inicial";

export interface EstadoCicloAssinatura {
  readonly tipo: TipoEstadoCiclo;
  readonly rotuloBadge: string;
  readonly classeBadge: string;
  readonly urlCheckout?: string | null;
  readonly vigenciaAteIso?: string;
  readonly podeGerarNovaAssinatura: boolean;
}

function formatarDataSimples(dataIso: string): string {
  return dataIso.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, "$3/$2/$1");
}

export function determinarEstadoCicloAssinatura(
  organizacao: Organizacao,
  assinatura: RegistroAssinaturaAsaas | null,
  opcoes?: {
    checkoutRecemCriado?: boolean;
    urlCheckoutRecemCriado?: string | null;
  },
): EstadoCicloAssinatura {
  const situacao = organizacao.resumoDireitosPlano.situacaoAssinatura;
  const planoCodigo = organizacao.resumoDireitosPlano.planoCodigo;

  const vigenciaAteIso =
    organizacao.resumoDireitosPlano.vigenciaAteIso ??
    assinatura?.vigenciaAteIso;

  const hoje = new Date().toISOString().slice(0, 10);
  const temVigenciaRestante = Boolean(
    vigenciaAteIso && vigenciaAteIso.slice(0, 10) >= hoje,
  );

  const urlCheckout =
    opcoes?.urlCheckoutRecemCriado ||
    assinatura?.urlFaturaOuCheckout ||
    null;

  const temFaturaPendente = Boolean(
    (opcoes?.checkoutRecemCriado ||
      assinatura?.situacaoInterna === "pendente_contratacao" ||
      assinatura?.situacaoAsaas === "PENDING") &&
      urlCheckout,
  );

  if (situacao === "inadimplente") {
    return {
      tipo: "inadimplente",
      rotuloBadge: "Inadimplente",
      classeBadge: "bg-red-50 text-red-800 border-red-200",
      podeGerarNovaAssinatura: false,
    };
  }

  if (situacao === "em_carencia") {
    return {
      tipo: "em_carencia",
      rotuloBadge: "Em Carência (7 dias)",
      classeBadge: "bg-sky-50 text-sky-800 border-sky-200",
      podeGerarNovaAssinatura: false,
    };
  }

  if (situacao === "suspensa") {
    return {
      tipo: "suspensa",
      rotuloBadge: "Suspensa",
      classeBadge: "bg-amber-50 text-amber-800 border-amber-200",
      podeGerarNovaAssinatura: true,
    };
  }

  // Ativa e Regular (quando não acabou de gerar um novo checkout de alteração)
  if (situacao === "ativa" && !opcoes?.checkoutRecemCriado) {
    if (planoCodigo === "avaliacao_inicial") {
      return {
        tipo: "avaliacao_inicial",
        rotuloBadge: "Avaliação Inicial",
        classeBadge: "bg-slate-100 text-mineral-700 border-slate-200",
        podeGerarNovaAssinatura: true,
      };
    }

    return {
      tipo: "ativa_regular",
      rotuloBadge: "Ativa e Regular",
      classeBadge: "bg-emerald-50 text-emerald-800 border-emerald-200",
      ...(vigenciaAteIso ? { vigenciaAteIso } : {}),
      podeGerarNovaAssinatura: false,
    };
  }

  // Se há uma fatura pendente para contratação ou reativação
  if (temFaturaPendente) {
    const eraCanceladaComAcesso =
      temVigenciaRestante &&
      (situacao === "cancelada" ||
        Boolean(organizacao.resumoDireitosPlano.canceladaEmIso) ||
        Boolean(assinatura?.canceladaEmIso));

    if (eraCanceladaComAcesso) {
      return {
        tipo: "reativacao_pendente",
        rotuloBadge: "Reativação · Aguardando Pagamento",
        classeBadge: "bg-amber-50 text-amber-800 border-amber-200",
        urlCheckout,
        ...(vigenciaAteIso ? { vigenciaAteIso } : {}),
        podeGerarNovaAssinatura: false,
      };
    }

    return {
      tipo: "aguardando_primeiro_pagamento",
      rotuloBadge: "Fatura Gerada · Aguardando Pagamento",
      classeBadge: "bg-amber-50 text-amber-800 border-amber-200",
      urlCheckout,
      podeGerarNovaAssinatura: false,
    };
  }

  // Cancelada
  if (situacao === "cancelada") {
    if (temVigenciaRestante && vigenciaAteIso) {
      return {
        tipo: "cancelada_com_acesso",
        rotuloBadge: "Cancelada (Acesso ativo)",
        classeBadge: "bg-amber-50 text-amber-900 border-amber-300",
        vigenciaAteIso,
        podeGerarNovaAssinatura: true,
      };
    }

    return {
      tipo: "encerrada_sem_acesso",
      rotuloBadge: "Encerrada",
      classeBadge: "bg-slate-100 text-mineral-700 border-slate-200",
      podeGerarNovaAssinatura: true,
    };
  }

  if (planoCodigo === "avaliacao_inicial" || (!assinatura && !temFaturaPendente)) {
    return {
      tipo: "avaliacao_inicial",
      rotuloBadge: "Avaliação Inicial",
      classeBadge: "bg-slate-100 text-mineral-700 border-slate-200",
      podeGerarNovaAssinatura: true,
    };
  }

  return {
    tipo: "aguardando_primeiro_pagamento",
    rotuloBadge: "Aguardando Pagamento",
    classeBadge: "bg-sky-50 text-sky-800 border-sky-200",
    urlCheckout,
    podeGerarNovaAssinatura: false,
  };
}
