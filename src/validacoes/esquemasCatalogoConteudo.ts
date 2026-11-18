import { z } from "zod";
import type {
  ProdutoCatalogo,
  ProfissionalEquipe,
  ProjetoPortfolio,
  ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";

const esquemaCoordenadasPontoFocal = z.object({
  xPercentual: z.number().min(0).max(100),
  yPercentual: z.number().min(0).max(100),
});

export const esquemaMidiaItemCatalogo = z.object({
  url: z.string().trim().min(1).max(600),
  textoAlternativo: z.string().max(220).optional(),
  pontoFocal: esquemaCoordenadasPontoFocal.optional(),
});

export const esquemaServicoOrganizacao: z.ZodType<ServicoOrganizacao> = z.object({
  id: z.string().min(1),
  organizacaoId: z.string().min(1),
  nome: z.string().trim().min(2, "Informe o nome do serviço.").max(110),
  resumo: z.string().trim().min(4, "Descreva brevemente o serviço.").max(420),
  categoria: z.string().trim().min(2, "Informe a categoria.").max(80),
  precoBaseCentavos: z.number().int().min(0).max(999_999_999).optional(),
  rotuloPrecoOpcional: z.string().max(60).optional(),
  prazoOuDuracao: z.string().max(80).optional(),
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
  nome: z.string().trim().min(2, "Informe o nome do produto ou item.").max(110),
  resumo: z.string().trim().min(4, "Descreva brevemente o item.").max(420),
  categoria: z.string().trim().min(2, "Informe a categoria.").max(80),
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
  titulo: z.string().trim().min(2, "Informe o título do projeto.").max(120),
  categoriaOuSerie: z.string().trim().min(2, "Informe a categoria ou série.").max(90),
  anoOuLocal: z.string().max(80).optional(),
  resumoEditorial: z.string().trim().min(4, "Adicione um resumo sobre o projeto.").max(600),
  urlImagemCapa: z.string().trim().min(1, "Envie ou selecione a fotografia de capa.").max(600),
  textoAlternativoCapa: z
    .string()
    .trim()
    .min(3, "Descreva a fotografia de capa para acessibilidade.")
    .max(220),
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
  nomeCompleto: z.string().trim().min(2, "Informe o nome do profissional.").max(100),
  cargoOuEspecialidade: z.string().trim().min(2, "Informe a função ou especialidade.").max(100),
  registroProfissionalOpcional: z.string().max(60).optional(),
  minibiografia: z.string().trim().min(4, "Escreva uma breve apresentação.").max(500),
  urlFotoPerfil: z.string().max(600).optional(),
  pontoFocalFoto: esquemaCoordenadasPontoFocal,
  emailContatoOpcional: z.string().email("Informe um e-mail válido.").max(120).optional(),
  whatsappOpcional: z.string().max(40).optional(),
  linkedinOpcional: z.string().url("Informe uma URL válida.").max(300).optional(),
  instagramOpcional: z.string().url("Informe uma URL válida.").max(300).optional(),
  aceitaSolicitacoesDiretas: z.boolean(),
  ordemExibicao: z.number().int().min(0).max(10_000),
  ativo: z.boolean(),
  atualizadoEmIso: z.string().min(1),
});
