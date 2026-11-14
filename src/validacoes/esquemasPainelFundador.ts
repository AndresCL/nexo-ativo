import { z } from "zod";
import type {
  ParametrosAjustarPlanoOrganizacaoFundador,
  ParametrosAlterarSituacaoOrganizacaoFundador,
  ParametrosDefinirPerfilPublicidadeOrganizacaoFundador,
} from "../dominio/fundador/tiposPainelFundador";
import { CODIGOS_PERFIL_PUBLICIDADE } from "../dominio/publicidade/tiposPerfilPublicidade";

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
