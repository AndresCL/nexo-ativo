import { z } from "zod";
import {
  CODIGOS_CATEGORIA_DESPESA_FUNDADOR,
  CODIGOS_CLASSIFICACAO_CUSTO_FUNDADOR,
  type ParametrosAtualizarDespesaFundador,
  type ParametrosCopiarDespesasMesAnterior,
  type ParametrosCriarDespesaFundador,
} from "@/dominio/fundador/tiposDespesasFundador";

const REGEX_ANO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

export const esquemaAnoMesReferencia = z
  .string()
  .trim()
  .regex(REGEX_ANO_MES, "Informe o mês de referência no formato AAAA-MM.");

export const esquemaCriarDespesaFundador: z.ZodType<ParametrosCriarDespesaFundador> = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(2, "Informe um título com pelo menos 2 caracteres.")
      .max(100, "O título pode ter no máximo 100 caracteres."),
    categoria: z.enum(CODIGOS_CATEGORIA_DESPESA_FUNDADOR),
    classificacao: z.enum(CODIGOS_CLASSIFICACAO_CUSTO_FUNDADOR).optional(),
    anoMes: esquemaAnoMesReferencia,
    valorCentavos: z
      .number()
      .int("O valor deve ser informado em centavos inteiros.")
      .min(1, "Informe um valor maior que zero.")
      .max(100_000_000, "Valor acima do limite permitido."),
    valorOriginalUsd: z.number().positive().max(1_000_000).optional(),
    cotacaoDolar: z.number().positive().max(100).optional(),
    recorrente: z.boolean().optional(),
    observacao: z
      .string()
      .trim()
      .max(300, "A observação pode ter no máximo 300 caracteres.")
      .optional(),
  })
  .strict();

export const esquemaAtualizarDespesaFundador: z.ZodType<ParametrosAtualizarDespesaFundador> = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(2, "Informe um título com pelo menos 2 caracteres.")
      .max(100, "O título pode ter no máximo 100 caracteres.")
      .optional(),
    categoria: z.enum(CODIGOS_CATEGORIA_DESPESA_FUNDADOR).optional(),
    classificacao: z.enum(CODIGOS_CLASSIFICACAO_CUSTO_FUNDADOR).optional(),
    anoMes: esquemaAnoMesReferencia.optional(),
    valorCentavos: z
      .number()
      .int("O valor deve ser informado em centavos inteiros.")
      .min(1, "Informe um valor maior que zero.")
      .max(100_000_000, "Valor acima do limite permitido.")
      .optional(),
    valorOriginalUsd: z.number().positive().max(1_000_000).nullable().optional(),
    cotacaoDolar: z.number().positive().max(100).nullable().optional(),
    recorrente: z.boolean().optional(),
    observacao: z
      .string()
      .trim()
      .max(300, "A observação pode ter no máximo 300 caracteres.")
      .nullable()
      .optional(),
  })
  .strict();

export const esquemaCopiarDespesasMesAnterior: z.ZodType<ParametrosCopiarDespesasMesAnterior> = z
  .object({
    anoMesDestino: esquemaAnoMesReferencia,
  })
  .strict();

