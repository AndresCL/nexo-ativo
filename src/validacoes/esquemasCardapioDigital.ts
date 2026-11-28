import { z } from "zod";
import {
  LIMITE_MAXIMO_PAGINAS_CARDAPIO,
  type CardapioOrganizacao,
  type PaginaCardapio,
} from "@/dominio/entidades/cardapioDigital";

export const esquemaPaginaCardapio: z.ZodType<PaginaCardapio> = z.object({
  url: z.string().trim().min(1).max(1000),
  largura: z.number().int().min(1).max(10_000),
  altura: z.number().int().min(1).max(10_000),
  ordem: z.number().int().min(0).max(1000),
  caminhoStorageOpcional: z.string().max(500).optional(),
});

export const esquemaCardapioOrganizacao: z.ZodType<CardapioOrganizacao> = z.object({
  id: z.string().min(1),
  organizacaoId: z.string().min(1),
  slug: z
    .string()
    .trim()
    .min(1, "Informe o identificador do cardápio.")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "O identificador deve conter apenas letras minúsculas, números e hífens."),
  titulo: z
    .string()
    .trim()
    .min(2, "Informe o título do cardápio.")
    .max(80, "O título do cardápio pode ter no máximo 80 caracteres."),
  subtituloOpcional: z
    .string()
    .trim()
    .max(140, "O subtítulo pode ter no máximo 140 caracteres.")
    .optional(),
  urlPdfOriginal: z.string().max(1000).optional(),
  caminhoPdfStorageOpcional: z.string().max(500).optional(),
  paginas: z
    .array(esquemaPaginaCardapio)
    .min(1, "Adicione ao menos uma página ao cardápio.")
    .max(
      LIMITE_MAXIMO_PAGINAS_CARDAPIO,
      `Cada cardápio pode ter no máximo ${LIMITE_MAXIMO_PAGINAS_CARDAPIO} páginas.`,
    ),
  ordemExibicao: z.number().int().min(0).max(10_000),
  ativo: z.boolean(),
  atualizadoEmIso: z.string().min(1),
});

