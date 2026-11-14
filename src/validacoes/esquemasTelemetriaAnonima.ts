import { z } from "zod";

export const esquemasCanalOrigem = z.enum([
  "instagram",
  "cartao_equipe",
  "whatsapp",
  "google",
  "direto",
  "permalink",
]);

export const esquemaRegistroEventoAnonimo = z.object({
  organizacaoId: z.string().min(2),
  tipoEvento: z.enum([
    "visualizacao_vitrine",
    "visualizacao_cartao",
    "clique_acao_home",
    "abertura_microfluxo",
    "conclusao_microfluxo",
    "clique_whatsapp",
    "clique_ligacao",
  ]),
  canalOrigem: esquemasCanalOrigem.optional(),
  cartaoProfissionalId: z.string().max(80).optional(),
  cartaoProfissionalNome: z.string().max(120).optional(),
  acaoHomeId: z.string().max(80).optional(),
  acaoHomeRotulo: z.string().max(120).optional(),
  microfluxoId: z.string().max(80).optional(),
  microfluxoTitulo: z.string().max(120).optional(),
  profissionalId: z.string().max(80).optional(),
  profissionalNome: z.string().max(120).optional(),
  itemCatalogoId: z.string().max(80).optional(),
  itemCatalogoNome: z.string().max(120).optional(),
  etapaId: z.string().max(80).optional(),
});

export type DadosRegistroEventoAnonimo = z.infer<typeof esquemaRegistroEventoAnonimo>;
