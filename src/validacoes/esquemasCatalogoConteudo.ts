import { z } from "zod";
import type {
  ProdutoCatalogo,
  ProfissionalEquipe,
  ProjetoPortfolio,
  ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";

export const LIMITE_CARACTERES_RESUMO_CATALOGO = 1000;

const esquemaCoordenadasPontoFocal = z.object({
  xPercentual: z.number().min(0).max(100),
  yPercentual: z.number().min(0).max(100),
});

export const esquemaMidiaItemCatalogo = z.object({
  url: z.string().trim().min(1).max(600),
  textoAlternativo: z
    .string()
    .max(220, "A descrição alternativa pode ter no máximo 220 caracteres.")
    .optional(),
  pontoFocal: esquemaCoordenadasPontoFocal.optional(),
});

export const esquemaServicoOrganizacao: z.ZodType<ServicoOrganizacao> = z.object({
  id: z.string().min(1),
  organizacaoId: z.string().min(1),
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do serviço.")
    .max(110, "O nome do serviço pode ter no máximo 110 caracteres."),
  resumo: z
    .string()
    .trim()
    .min(4, "Descreva brevemente o serviço.")
    .max(
      LIMITE_CARACTERES_RESUMO_CATALOGO,
      `O resumo editorial pode ter no máximo ${LIMITE_CARACTERES_RESUMO_CATALOGO} caracteres.`,
    ),
  categoria: z
    .string()
    .trim()
    .min(2, "Informe a categoria.")
    .max(80, "A categoria pode ter no máximo 80 caracteres."),
  precoBaseCentavos: z.number().int().min(0).max(999_999_999).optional(),
  rotuloPrecoOpcional: z
    .string()
    .max(60, "O rótulo de preço pode ter no máximo 60 caracteres.")
    .optional(),
  prazoOuDuracao: z
    .string()
    .max(80, "O prazo ou duração pode ter no máximo 80 caracteres.")
    .optional(),
  urlImagemOpcional: z.string().max(600).optional(),
  pontoFocalImagem: esquemaCoordenadasPontoFocal.optional(),
  imagens: z.array(esquemaMidiaItemCatalogo).max(12).optional(),
  ordemExibicao: z.number().int().min(0).max(10_000),
  ativo: z.boolean(),
  atualizadoEmIso: z.string().min(1),
});

export const esquemaProdutoCatalogo: z.ZodType<ProdutoCatalogo> = z.object({
  id: z.string().min(1),
  organizacaoId: z.string().min(1),
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do produto ou item.")
    .max(110, "O nome do produto pode ter no máximo 110 caracteres."),
  resumo: z
    .string()
    .trim()
    .min(4, "Descreva brevemente o item.")
    .max(
      LIMITE_CARACTERES_RESUMO_CATALOGO,
      `A descrição editorial pode ter no máximo ${LIMITE_CARACTERES_RESUMO_CATALOGO} caracteres.`,
    ),
  categoria: z
    .string()
    .trim()
    .min(2, "Informe a categoria.")
    .max(80, "A categoria pode ter no máximo 80 caracteres."),
  precoCentavos: z.number().int().min(0).max(999_999_999).optional(),
  disponibilidade: z.enum(["disponivel", "sob_encomenda", "esgotado"]),
  especificacoesCurtas: z.array(z.string().trim().min(1).max(100)).max(8),
  urlImagemPrincipal: z.string().max(600).optional(),
  textoAlternativoImagem: z.string().max(220).optional(),
  pontoFocalImagem: esquemaCoordenadasPontoFocal.optional(),
  imagens: z.array(esquemaMidiaItemCatalogo).max(12).optional(),
  ordemExibicao: z.number().int().min(0).max(10_000),
  ativo: z.boolean(),
  atualizadoEmIso: z.string().min(1),
});

export const esquemaProjetoPortfolio: z.ZodType<ProjetoPortfolio> = z.object({
  id: z.string().min(1),
  organizacaoId: z.string().min(1),
  titulo: z
    .string()
    .trim()
    .min(2, "Informe o título do projeto.")
    .max(120, "O título do projeto pode ter no máximo 120 caracteres."),
  categoriaOuSerie: z
    .string()
    .trim()
    .min(2, "Informe a categoria ou série.")
    .max(90, "A categoria ou série pode ter no máximo 90 caracteres."),
  anoOuLocal: z
    .string()
    .max(80, "O ano ou local pode ter no máximo 80 caracteres.")
    .optional(),
  resumoEditorial: z
    .string()
    .trim()
    .min(4, "Adicione um resumo sobre o projeto.")
    .max(
      LIMITE_CARACTERES_RESUMO_CATALOGO,
      `O resumo editorial pode ter no máximo ${LIMITE_CARACTERES_RESUMO_CATALOGO} caracteres.`,
    ),
  urlImagemCapa: z.string().trim().min(1, "Envie ou selecione a fotografia de capa.").max(600),
  textoAlternativoCapa: z
    .string()
    .trim()
    .min(3, "Descreva a fotografia de capa para acessibilidade.")
    .max(220, "A descrição da imagem pode ter no máximo 220 caracteres."),
  pontoFocalCapa: esquemaCoordenadasPontoFocal,
  imagens: z.array(esquemaMidiaItemCatalogo).max(12).optional(),
  destaqueVitrine: z.boolean(),
  ordemExibicao: z.number().int().min(0).max(10_000),
  ativo: z.boolean(),
  atualizadoEmIso: z.string().min(1),
});

export const esquemaProfissionalEquipe: z.ZodType<ProfissionalEquipe> = z.object({
  id: z.string().min(1),
  organizacaoId: z.string().min(1),
  identificadorCartao: z.string().trim().min(3).max(48),
  nomeCompleto: z
    .string()
    .trim()
    .min(2, "Informe o nome do profissional.")
    .max(100, "O nome pode ter no máximo 100 caracteres."),
  cargoOuEspecialidade: z
    .string()
    .trim()
    .min(2, "Informe a função ou especialidade.")
    .max(100, "A função ou especialidade pode ter no máximo 100 caracteres."),
  registroProfissionalOpcional: z
    .string()
    .max(60, "O registro profissional pode ter no máximo 60 caracteres.")
    .optional(),
  minibiografia: z
    .string()
    .trim()
    .min(4, "Escreva uma breve apresentação.")
    .max(500, "A minibiografia pode ter no máximo 500 caracteres."),
  urlFotoPerfil: z.string().max(600).optional(),
  pontoFocalFoto: esquemaCoordenadasPontoFocal,
  emailContatoOpcional: z.string().email("Informe um e-mail válido.").max(120).optional(),
  whatsappOpcional: z.string().max(40).optional(),
  linkedinOpcional: z.string().url("Informe uma URL válida.").max(300).optional(),
  instagramOpcional: z.string().url("Informe uma URL válida.").max(300).optional(),
  aceitaSolicitacoesDiretas: z.boolean(),
  exibirAcoesVitrineNoCartao: z.boolean().optional(),
  ordemExibicao: z.number().int().min(0).max(10_000),
  ativo: z.boolean(),
  atualizadoEmIso: z.string().min(1),
});
