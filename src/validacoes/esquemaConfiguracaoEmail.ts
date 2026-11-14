import { z } from "zod";
import type {
  ConfiguracaoEmailOrganizacao,
  ConsumoMensalEmailOrganizacao,
} from "../dominio/email/tiposEmailTransacional";

const esquemaEnderecoEmailNormalizado = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um endereço de e-mail válido.")
  .max(160);

/**
 * Esquema Zod para validação e leitura de `organizacoes/{organizacaoId}/configuracoes/email`.
 * Estrito quanto às chaves permitidas para respeitar `!request.resource.data.keys().hasAny(['enviosNoMesAtual'])`.
 */
export const esquemaConfiguracaoEmailOrganizacao: z.ZodType<ConfiguracaoEmailOrganizacao> = z
  .object({
    organizacaoId: z.string().trim().min(2).max(120),
    notificarEquipeNovasSolicitacoes: z.boolean(),
    emailsDestinatariosEquipe: z.array(esquemaEnderecoEmailNormalizado).max(10),
    enviarConfirmacaoVisitante: z.boolean(),
    emailRespostaOpcional: esquemaEnderecoEmailNormalizado.optional(),
    atualizadoEmIso: z.string().min(10),
  })
  .strict()
  .superRefine((dados, contexto) => {
    if (dados.notificarEquipeNovasSolicitacoes && dados.emailsDestinatariosEquipe.length === 0) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emailsDestinatariosEquipe"],
        message:
          "Informe ao menos um e-mail destinatário da equipe quando o alerta automático estiver ativo.",
      });
    }
  });

export const esquemaConsumoMensalEmailOrganizacao: z.ZodType<ConsumoMensalEmailOrganizacao> =
  z.object({
    anoMesIso: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Competência mensal deve seguir o formato AAAA-MM."),
    enviosNoMesAtual: z.number().int().min(0),
    limiteMensalPlano: z.number().int().min(0),
    chavesIdempotenciaProcessadas: z.array(z.string().min(3)).optional(),
    atualizadoEmIso: z.string().min(10),
  });
