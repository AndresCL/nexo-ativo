import { z } from "zod";
import type {
  DemonstrativoCalculoComercialImutavel,
  LinhaDemonstrativoCalculoComercial,
  RegraCalculoComercialMicrofluxo,
} from "@/dominio/comercial/tiposCalculoComercial";

export const esquemaRegraCalculoComercialMicrofluxo: z.ZodType<RegraCalculoComercialMicrofluxo> =
  z.object({
    modalidade: z.enum([
      "sem_calculo",
      "valor_fixo",
      "base_mais_adicionais",
      "quantidade_vezes_preco",
      "faixa_configurada",
    ]),
    rotuloBase: z.string().max(120).optional(),
    valorBaseCentavos: z.number().int().min(0).optional(),
    minimoFaixaCentavos: z.number().int().min(0).optional(),
    maximoFaixaCentavos: z.number().int().min(0).optional(),
    unidadeQuantidade: z.string().max(40).optional(),
    quantidadeMinima: z.number().int().min(1).max(10000).optional(),
    quantidadeMaxima: z.number().int().min(1).max(100000).optional(),
    observacaoTransparencia: z.string().max(240).optional(),
  });

const esquemaLinhaDemonstrativo: z.ZodType<LinhaDemonstrativoCalculoComercial> = z.object({
  id: z.string().min(1),
  rotulo: z.string().min(1).max(180),
  quantidade: z.number().int().min(1),
  valorUnitarioCentavos: z.number().int().min(0),
  subtotalCentavos: z.number().int().min(0),
});

export const esquemaDemonstrativoCalculoComercialImutavel: z.ZodType<DemonstrativoCalculoComercialImutavel> =
  z.object({
    modalidade: z.enum([
      "valor_fixo",
      "base_mais_adicionais",
      "quantidade_vezes_preco",
      "faixa_configurada",
    ]),
    moeda: z.literal("BRL"),
    linhas: z.array(esquemaLinhaDemonstrativo).min(1),
    totalCentavos: z.number().int().min(0).optional(),
    minimoCentavos: z.number().int().min(0).optional(),
    maximoCentavos: z.number().int().min(0).optional(),
    resumoFormatado: z.string().min(1).max(140),
    observacaoTransparencia: z.string().max(240).optional(),
    versaoMicrofluxo: z.number().int().min(1).nullable(),
    calculadoEmIso: z.string().min(1),
  });
