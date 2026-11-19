import { z } from "zod";
import type {
  ItemRespostaRegistradaSolicitacao,
  SituacaoSolicitacaoComercial,
  SolicitacaoComercial,
} from "@/dominio/entidades/solicitacaoComercial";
import { esquemaDemonstrativoCalculoComercialImutavel } from "./esquemasCalculoComercial";

export const esquemaSituacaoSolicitacaoComercial: z.ZodType<SituacaoSolicitacaoComercial> = z.enum([
  "nova",
  "em_atendimento",
  "proposta_enviada",
  "concluida",
  "desqualificada",
]);

const esquemaItemRespostaRegistrada: z.ZodType<ItemRespostaRegistradaSolicitacao> = z.object({
  etapaId: z.string().min(1).max(80),
  pergunta: z.string().trim().min(1).max(200),
  respostaTexto: z.string().trim().min(1).max(1200),
});

export const esquemaSubmissaoPublicaSolicitacao = z.object({
  organizacaoId: z.string().trim().min(1, "Organização não identificada."),
  identificadorPublicoOrganizacao: z.string().trim().min(2).max(80),
  microfluxoId: z.string().trim().min(1).max(80),
  tituloExperiencia: z.string().trim().min(2).max(140),
  versaoMicrofluxo: z.number().int().min(1).nullable(),
  nomeVisitante: z.string().trim().min(2, "Informe seu nome.").max(120),
  telefoneOuWhatsapp: z.string().trim().min(8, "Informe um telefone ou WhatsApp válido.").max(40),
  emailVisitante: z.string().trim().email("E-mail inválido.").max(160).optional(),
  mensagemAdicional: z.string().trim().max(1000).optional(),
  servicoId: z.string().max(80).optional(),
  servicoNome: z.string().max(140).optional(),
  produtoId: z.string().max(80).optional(),
  produtoNome: z.string().max(140).optional(),
  profissionalId: z.string().max(80).optional(),
  profissionalNome: z.string().max(140).optional(),
  quantidadeComercial: z.number().int().min(1).max(100000).optional(),
  respostasRegistradas: z.array(esquemaItemRespostaRegistrada).max(20),
  demonstrativoComercialCongelado: esquemaDemonstrativoCalculoComercialImutavel
    .nullable()
    .optional(),
  chaveIdempotencia: z.string().trim().min(6).max(120).optional(),
  campoArmadilhaBot: z.string().max(200).optional(),
});

export type DadosSubmissaoPublicaSolicitacao = z.infer<typeof esquemaSubmissaoPublicaSolicitacao>;

export const esquemaSolicitacaoComercial: z.ZodType<SolicitacaoComercial> = z.object({
  id: z.string().min(1),
  organizacaoId: z.string().min(1),
  identificadorPublicoOrganizacao: z.string().min(2).max(80),
  microfluxoId: z.string().min(1),
  tituloExperiencia: z.string().min(2).max(140),
  versaoMicrofluxo: z.number().int().min(1).nullable(),
  nomeVisitante: z.string().min(2).max(120),
  telefoneOuWhatsapp: z.string().min(8).max(40),
  emailVisitante: z.string().max(160).optional(),
  mensagemAdicional: z.string().max(1000).optional(),
  servicoId: z.string().max(80).optional(),
  servicoNome: z.string().max(140).optional(),
  produtoId: z.string().max(80).optional(),
  produtoNome: z.string().max(140).optional(),
  profissionalId: z.string().max(80).optional(),
  profissionalNome: z.string().max(140).optional(),
  quantidadeComercial: z.number().int().min(1).optional(),
  respostasRegistradas: z.array(esquemaItemRespostaRegistrada),
  demonstrativoComercialCongelado: esquemaDemonstrativoCalculoComercialImutavel
    .nullable()
    .optional(),
  situacao: esquemaSituacaoSolicitacaoComercial,
  observacoesInternas: z.string().max(2000).optional(),
  chaveIdempotencia: z.string().min(4).max(120),
  criadoEmIso: z.string().min(1),
  atualizadoEmIso: z.string().min(1),
});
