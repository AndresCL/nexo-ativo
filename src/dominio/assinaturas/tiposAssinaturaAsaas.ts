import type {
  CodigoPlanoAssinatura,
  SituacaoResumoAssinatura,
} from "../entidades/autenticacaoEOrganizacao";

export type CicloCobrancaPlano = "mensal" | "anual";

export type FormaPagamentoAsaas = "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";

export type SituacaoCobrancaAsaas =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH_UNDONE"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

export type EventoWebhookAsaas =
  | "PAYMENT_CREATED"
  | "PAYMENT_AWAITING_RISK_ANALYSIS"
  | "PAYMENT_APPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_REPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_UPDATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED"
  | "PAYMENT_ANTICIPATED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_DELETED"
  | "PAYMENT_RESTORED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_PARTIALLY_REFUNDED"
  | "PAYMENT_REFUND_IN_PROGRESS"
  | "PAYMENT_CHARGEBACK_REQUESTED"
  | "PAYMENT_CHARGEBACK_DISPUTE"
  | "PAYMENT_AWAITING_CHARGEBACK_REVERSAL"
  | "PAYMENT_DUNNING_RECEIVED"
  | "PAYMENT_DUNNING_REQUESTED"
  | "PAYMENT_BANK_SLIP_VIEWED"
  | "PAYMENT_CHECKOUT_VIEWED"
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_UPDATED"
  | "SUBSCRIPTION_INACTIVATED"
  | "SUBSCRIPTION_DELETED"
  | "SUBSCRIPTION_SPLIT_DISABLED";

export interface DefinicaoPlanoComercial {
  readonly codigo: CodigoPlanoAssinatura;
  readonly nome: string;
  readonly descricao: string;
  readonly mensalidadeCentavos: number;
  readonly limiteProfissionaisAtivos: number;
  readonly limiteEnviosEmailMensal: number;
  readonly valorImplantacaoAssistidaCentavos?: number;
  readonly destaques: readonly string[];
}

export const CATALOGO_PLANOS_FLUXO: Readonly<
  Record<CodigoPlanoAssinatura, DefinicaoPlanoComercial>
> = {
  avaliacao_inicial: {
    codigo: "avaliacao_inicial",
    nome: "Avaliação Inicial",
    descricao: "Período de boas-vindas para estruturação da presença digital e catálogo.",
    mensalidadeCentavos: 0,
    limiteProfissionaisAtivos: 1,
    limiteEnviosEmailMensal: 50,
    destaques: [
      "Acesso completo ao editor visual e microfluxos",
      "Estruturação de portfólio, serviços e produtos",
      "Disponibilização da prévia privada",
    ],
  },
  pro: {
    codigo: "pro",
    nome: "Pro",
    descricao:
      "Para profissionais autônomos e estúdios que exigem presença digital editorial autoral e conversão de excelência.",
    mensalidadeCentavos: 8700, // R$ 87/mês
    limiteProfissionaisAtivos: 1,
    limiteEnviosEmailMensal: 100,
    valorImplantacaoAssistidaCentavos: 29700, // R$ 297 opcional
    destaques: [
      "Página premium com as 3 composições editoriais",
      "Experiências interativas com motor determinístico",
      "Cálculos comerciais em centavos preservados historicamente",
      "Notificações instantâneas por e-mail com link direto para WhatsApp",
      "1 profissional principal com cartão digital e QR Code",
    ],
  },
  equipe: {
    codigo: "equipe",
    nome: "Equipe",
    descricao:
      "Para escritórios, ateliês e bancas com múltiplos especialistas que demandam presença unificada e cartões individuais.",
    mensalidadeCentavos: 8700, // R$ 87/mês
    limiteProfissionaisAtivos: 5,
    limiteEnviosEmailMensal: 300,
    valorImplantacaoAssistidaCentavos: 59700, // R$ 597 opcional
    destaques: [
      "Todos os recursos inclusos no Plano Pro",
      "Até 5 profissionais ativos com cartões digitais e QR Codes próprios",
      "Catálogo compartilhado e direcionamento de solicitações por especialista",
      "Franquia expandida de e-mails transacionais (300 envios/mês)",
      "Gestão de permissões administrativas por membro da equipe",
    ],
  },
  personalizado: {
    codigo: "personalizado",
    nome: "Personalizado",
    descricao: "Projetos sob medida para bancas, redes e operações com alto volume contratual.",
    mensalidadeCentavos: 0,
    limiteProfissionaisAtivos: 999,
    limiteEnviosEmailMensal: 1000,
    destaques: [
      "Limites flexíveis sob demanda da organização",
      "Onboarding dedicado e consultoria de identidade editorial",
      "Atendimento prioritário pela equipe fundadora",
    ],
  },
};

export interface DadosCadastroFiscalAssinante {
  readonly nomeOuRazaoSocial: string;
  readonly cpfOuCnpj: string;
  readonly email: string;
  readonly telefone: string;
  readonly cep?: string;
  readonly enderecoNumero?: string;
}

export interface RegistroClienteAsaas {
  readonly id: string;
  readonly organizacaoId: string;
  readonly clienteAsaasId: string;
  readonly cpfOuCnpj: string;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

export interface RegistroAssinaturaAsaas {
  readonly id: string;
  readonly organizacaoId: string;
  readonly assinaturaAsaasId: string;
  readonly planoCodigo: CodigoPlanoAssinatura;
  readonly valorMensalCentavos: number;
  readonly situacaoAsaas: string;
  readonly situacaoInterna: SituacaoResumoAssinatura;
  readonly urlFaturaOuCheckout?: string;
  readonly contratouImplantacaoAssistida: boolean;
  readonly valorImplantacaoCentavos?: number;
  readonly proximoVencimentoIso?: string;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

export interface CobrancaHistoricoAsaas {
  readonly id: string;
  readonly organizacaoId: string;
  readonly cobrancaAsaasId: string;
  readonly assinaturaAsaasId?: string;
  readonly valorCentavos: number;
  readonly formaPagamento: FormaPagamentoAsaas;
  readonly situacao: SituacaoCobrancaAsaas;
  readonly dataVencimentoIso: string;
  readonly urlFaturaOuComprovante?: string;
  readonly dataPagamentoIso?: string;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

/**
 * Converte um valor em reais (`97.00`) para centavos inteiros (`9700`).
 */
export function converterReaisParaCentavosInteiros(valorReais: number): number {
  return Math.round(valorReais * 100);
}

/**
 * Determina o estado da assinatura interna a partir de um evento de cobrança Asaas.
 */
export function mapearSituacaoCobrancaParaAssinatura(
  situacaoCobranca: SituacaoCobrancaAsaas,
): SituacaoResumoAssinatura {
  switch (situacaoCobranca) {
    case "CONFIRMED":
    case "RECEIVED":
      return "ativa";
    case "OVERDUE":
    case "DUNNING_REQUESTED":
    case "DUNNING_RECEIVED":
    case "AWAITING_CHARGEBACK_REVERSAL":
    case "CHARGEBACK_DISPUTE":
      return "inadimplente";
    case "REFUNDED":
      return "cancelada";
    case "PENDING":
    default:
      return "pendente_contratacao";
  }
}
