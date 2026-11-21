/**
 * Entidades canônicas de identidade, multi-tenancy, permissões e auditoria.
 * Todo dado privado pertence a uma Organizacao, inclusive para profissionais individuais.
 */

import type { CodigoPerfilPublicidade } from "../publicidade/tiposPerfilPublicidade";

export type PapelPlataforma = "fundador";

export type PapelOrganizacao = "proprietario" | "administrador" | "membro";

export type SituacaoMembroOrganizacao = "ativo" | "convidado" | "revogado";

export type SituacaoOrganizacao = "ativa" | "suspensa" | "encerrada";

export type CodigoPlanoAssinatura = "avaliacao_inicial" | "pro" | "equipe" | "personalizado";

export type SituacaoResumoAssinatura =
  "pendente_contratacao" | "ativa" | "em_carencia" | "inadimplente" | "suspensa" | "cancelada";

export interface ClaimsPlataforma {
  readonly papelPlataforma?: PapelPlataforma;
}

export interface UsuarioAutenticado {
  readonly uid: string;
  readonly email: string | null;
  readonly nomeExibicao: string | null;
  readonly fotoUrl: string | null;
  readonly emailVerificado: boolean;
  readonly papelPlataforma?: PapelPlataforma;
  readonly provedoresConectados: readonly string[];
}

export interface ResumoDireitosPlano {
  readonly planoCodigo: CodigoPlanoAssinatura;
  readonly situacaoAssinatura: SituacaoResumoAssinatura;
  readonly limiteProfissionaisAtivos: number;
  readonly limiteEnviosEmailMensal: number;
  readonly permitePublicacaoPublica: boolean;
  readonly inadimplenteDesde?: string;
  readonly canceladaEmIso?: string;
  readonly vigenciaAteIso?: string;
}

export interface Organizacao {
  readonly id: string;
  readonly nome: string;
  readonly identificadorPublico: string;
  readonly segmentoAtividade: string;
  /** Definido somente pelo fundador; ausente equivale ao perfil padrão. */
  readonly perfilPublicidade?: CodigoPerfilPublicidade;
  readonly situacao: SituacaoOrganizacao;
  readonly resumoDireitosPlano: ResumoDireitosPlano;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

export interface MembroOrganizacao {
  readonly usuarioId: string;
  readonly organizacaoId: string;
  readonly papel: PapelOrganizacao;
  readonly situacao: SituacaoMembroOrganizacao;
  readonly adicionadoEmIso: string;
}

export interface VinculoOrganizacaoUsuario {
  readonly organizacaoId: string;
  readonly nomeOrganizacao: string;
  readonly identificadorPublico: string;
  readonly papel: PapelOrganizacao;
  readonly situacao: SituacaoMembroOrganizacao;
}

export interface RegistroAuditoria {
  readonly id: string;
  readonly acao: string;
  readonly atorUsuarioId: string;
  readonly organizacaoAlvoId?: string;
  readonly usuarioAlvoId?: string;
  readonly detalhes: Readonly<Record<string, string | number | boolean>>;
  readonly criadoEmIso: string;
}

export function criarResumoDireitosPlanoInicial(): ResumoDireitosPlano {
  return {
    planoCodigo: "avaliacao_inicial",
    situacaoAssinatura: "pendente_contratacao",
    limiteProfissionaisAtivos: 1,
    limiteEnviosEmailMensal: 500,
    permitePublicacaoPublica: false,
  };
}
