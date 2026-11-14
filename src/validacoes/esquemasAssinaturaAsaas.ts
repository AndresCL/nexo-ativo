import { z } from "zod";
import type { DadosCadastroFiscalAssinante } from "../dominio/assinaturas/tiposAssinaturaAsaas";

const apenasDigitos = (val: string) => val.replace(/\D/g, "");

export const esquemaDadosCadastroFiscalAssinante: z.ZodType<DadosCadastroFiscalAssinante> =
  z.object({
    nomeOuRazaoSocial: z
      .string()
      .trim()
      .min(3, "Informe a razão social ou nome completo.")
      .max(140),
    cpfOuCnpj: z
      .string()
      .trim()
      .transform(apenasDigitos)
      .refine((val) => val.length === 11 || val.length === 14, {
        message: "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos.",
      }),
    email: z.string().trim().toLowerCase().email("Informe um e-mail válido para cobrança."),
    telefone: z
      .string()
      .trim()
      .transform(apenasDigitos)
      .refine((val) => val.length >= 10 && val.length <= 11, {
        message: "Telefone deve conter DDD e ter 10 ou 11 dígitos.",
      }),
    cep: z
      .string()
      .trim()
      .transform(apenasDigitos)
      .refine((val) => val.length === 0 || val.length === 8, {
        message: "CEP deve conter exatamente 8 dígitos.",
      })
      .optional(),
    enderecoNumero: z.string().trim().max(20).optional(),
  });

export const esquemaSolicitacaoCriarAssinatura = z.object({
  organizacaoId: z.string().min(2),
  planoCodigo: z.enum(["pro", "equipe"]),
  contratarImplantacaoAssistida: z.boolean(),
  dadosFiscais: esquemaDadosCadastroFiscalAssinante,
});

export type DadosSolicitacaoCriarAssinatura = z.infer<typeof esquemaSolicitacaoCriarAssinatura>;

export const esquemaPayloadWebhookAsaas = z.object({
  id: z.string().optional(),
  event: z.string(),
  payment: z
    .object({
      id: z.string(),
      customer: z.string(),
      subscription: z.string().optional(),
      value: z.number(),
      netValue: z.number().optional(),
      status: z.string(),
      billingType: z.string(),
      dueDate: z.string(),
      paymentDate: z.string().optional().nullable(),
      invoiceUrl: z.string().optional(),
      bankSlipUrl: z.string().optional().nullable(),
      externalReference: z.string().optional(), // organizacaoId armazenado aqui
    })
    .optional(),
  subscription: z
    .object({
      id: z.string(),
      customer: z.string(),
      value: z.number(),
      status: z.string(),
      billingType: z.string(),
      nextDueDate: z.string().optional(),
      externalReference: z.string().optional(),
    })
    .optional(),
});

export type PayloadWebhookAsaas = z.infer<typeof esquemaPayloadWebhookAsaas>;
