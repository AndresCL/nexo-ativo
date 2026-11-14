import { z } from "zod";
import { ehIdentificadorPublicoValido } from "../dominio/objetos-valor/identificadorPublico";

export const esquemaIdentificadorLocalGoogle = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[A-Za-z0-9_-]+$/, "Selecione um estabelecimento válido no Google.");

export const esquemaConfiguracaoAvaliacoesGoogle = z
  .object({
    habilitado: z.boolean(),
    identificadorLocal: esquemaIdentificadorLocalGoogle.optional(),
    modoExibicao: z.enum(["resumo", "carrossel"]),
  })
  .superRefine((dados, contexto) => {
    if (dados.habilitado && !dados.identificadorLocal) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identificadorLocal"],
        message: "Selecione um estabelecimento antes de ativar as avaliações.",
      });
    }
  });

export const esquemaPesquisaEstabelecimentosGoogle = z
  .object({
    organizacaoId: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[^/]+$/),
    consulta: z.string().trim().min(3, "Informe o nome da empresa e a cidade.").max(180),
  })
  .strict();

export const esquemaConsultaAvaliacoesGooglePrevia = z
  .object({
    organizacaoId: esquemaPesquisaEstabelecimentosGoogle.shape.organizacaoId,
    identificadorLocal: esquemaIdentificadorLocalGoogle,
  })
  .strict();

export const esquemaConsultaAvaliacoesGoogleVitrine = z
  .object({
    identificadorPublico: z.string().refine(ehIdentificadorPublicoValido),
  })
  .strict();
