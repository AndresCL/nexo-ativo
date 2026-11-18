import { z } from "zod";
import {
  CODIGOS_ETAPA_KANBAN_FUNDADOR,
  type ParametrosAdicionarMensagemKanbanFundador,
  type ParametrosAjustarPlanoOrganizacaoFundador,
  type ParametrosAlterarEtapaKanbanFundador,
  type ParametrosAlterarSituacaoOrganizacaoFundador,
  type ParametrosCriarOrganizacaoPeloFundador,
  type ParametrosDefinirPerfilPublicidadeOrganizacaoFundador,
} from "../dominio/fundador/tiposPainelFundador";
import { CODIGOS_PERFIL_PUBLICIDADE } from "../dominio/publicidade/tiposPerfilPublicidade";
import { esquemaIdentificadorPublico } from "./esquemasComuns";

export const esquemaAlterarEtapaKanbanFundador: z.ZodType<ParametrosAlterarEtapaKanbanFundador> =
  z.object({
    organizacaoId: z.string().trim().min(2, "Informe a organização alvo."),
    etapaKanban: z.enum(CODIGOS_ETAPA_KANBAN_FUNDADOR),
  });

export const esquemaAdicionarMensagemKanbanFundador: z.ZodType<ParametrosAdicionarMensagemKanbanFundador> =
  z.object({
    organizacaoId: z.string().trim().min(2, "Informe a organização alvo."),
    texto: z
      .string()
      .trim()
      .min(1, "Digite uma mensagem para registrar.")
      .max(1000, "A mensagem pode ter no máximo 1000 caracteres."),
  });


export const esquemaAlterarSituacaoOrganizacaoFundador: z.ZodType<ParametrosAlterarSituacaoOrganizacaoFundador> =
  z.object({
    organizacaoId: z.string().min(2, "Informe a organização alvo."),
    novaSituacao: z.enum(["ativa", "suspensa", "encerrada"]),
    justificativa: z.string().trim().min(5, "Informe uma justificativa para auditoria.").max(280),
  });

export const esquemaAjustarPlanoOrganizacaoFundador: z.ZodType<ParametrosAjustarPlanoOrganizacaoFundador> =
  z.object({
    organizacaoId: z.string().min(2, "Informe a organização alvo."),
    novoPlanoCodigo: z.enum(["avaliacao_inicial", "pro", "equipe", "personalizado"]),
    novaSituacaoAssinatura: z.enum([
      "pendente_contratacao",
      "ativa",
      "em_carencia",
      "inadimplente",
      "cancelada",
    ]),
    limiteProfissionaisAtivos: z.number().int().min(1).max(9999).optional(),
    limiteEnviosEmailMensal: z.number().int().min(0).max(50000).optional(),
    permitePublicacaoPublica: z.boolean().optional(),
    justificativa: z.string().trim().min(5, "Informe uma justificativa para auditoria.").max(280),
  });

export const esquemaDefinirPerfilPublicidadeOrganizacaoFundador: z.ZodType<ParametrosDefinirPerfilPublicidadeOrganizacaoFundador> =
  z.object({
    organizacaoId: z.string().min(2, "Informe a organização alvo."),
    novoPerfil: z.enum(CODIGOS_PERFIL_PUBLICIDADE),
    justificativa: z.string().trim().min(5, "Informe uma justificativa para auditoria.").max(280),
  });

export const esquemaCriarOrganizacaoPeloFundador: z.ZodType<ParametrosCriarOrganizacaoPeloFundador> =
  z.object({
    nome: z
      .string()
      .trim()
      .min(2, "Informe o nome da organização com pelo menos 2 caracteres.")
      .max(80, "O nome da organização pode ter no máximo 80 caracteres."),
    identificadorPublico: esquemaIdentificadorPublico,
    segmentoAtividade: z
      .string()
      .trim()
      .min(2, "Informe o segmento de atuação.")
      .max(60, "O segmento pode ter no máximo 60 caracteres."),
    emailProprietario: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
    nomeProprietario: z
      .string()
      .trim()
      .min(2, "Informe o nome do proprietário.")
      .max(80, "O nome pode ter no máximo 80 caracteres."),
    senhaInicialOpcional: z
      .string()
      .min(8, "A senha inicial deve ter pelo menos 8 caracteres.")
      .max(72)
      .optional(),
    planoCodigo: z.enum(["avaliacao_inicial", "pro", "personalizado"]),
    perfilPublicidade: z.enum(CODIGOS_PERFIL_PUBLICIDADE).optional(),
    vincularFundadorComoAdministrador: z.boolean().optional(),
  });
