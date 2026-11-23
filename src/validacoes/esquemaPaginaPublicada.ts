import { z } from "zod";
import { CODIGOS_PERFIL_PUBLICIDADE } from "../dominio/publicidade/tiposPerfilPublicidade";
import {
  FAIXAS_INICIO_EXPERIENCIAS,
  POSICOES_CABECALHO_MARCA,
} from "../dominio/editorial/faixaInicioExperiencias";
import { esquemaPosicionamentoEquipeVitrine } from "./esquemaPosicionamentoEquipeVitrine";
import { esquemaLimiteAvataresEquipe } from "./esquemaLimiteAvataresEquipe";
import { esquemaConfiguracaoAgendaVitrine } from "./esquemasAgenda";
import { esquemaConfiguracaoPostVitrine } from "./esquemasMicrofluxo";
import {
  esquemaChamadaEditorial,
  esquemaChamadasEditoriaisAdicionais,
} from "./esquemasChamadasEditoriais";
import { esquemaConfiguracaoAvaliacoesGoogle } from "./esquemasAvaliacoesGoogle";
import { esquemaCustomizacaoTokensEditorial } from "./esquemaCustomizacaoTokens";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";

const esquemaCoordenadasPontoFocal = z.object({
  xPercentual: z.number().min(0).max(100),
  yPercentual: z.number().min(0).max(100),
});

const esquemaMidiaFundoEditorial = z.object({
  tipo: z.enum(["imagem", "video", "degradado"]),
  degradadoOpcional: z
    .object({
      corInicial: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      corFinal: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      direcao: z
        .enum([
          "esquerda_direita",
          "direita_esquerda",
          "cima_baixo",
          "baixo_cima",
          "diagonal_superior_esquerda",
          "diagonal_superior_direita",
          "diagonal_inferior_esquerda",
          "diagonal_inferior_direita",
        ])
        .optional(),
      anguloGraus: z.number().min(0).max(360).optional(),
    })
    .optional(),
  urlPrincipal: z.string(),
  urlMobileOpcional: z.string().min(1).optional(),
  urlPosterVideo: z.string().min(1).optional(),
  textoAlternativo: z.string().max(220),
  pontoFocalDesktop: esquemaCoordenadasPontoFocal,
  pontoFocalMobile: esquemaCoordenadasPontoFocal.optional(),
  intensidadeVeloEscuro: z.enum(["nenhum", "suave", "equilibrado", "intenso"]),
  efeitoCantos: z.enum(["nenhum", "dots", "grade"]).optional(),
  opacidadeDotsCantos: z.number().min(0).max(100).optional(),
  tomDotsCantos: z.enum(["neutro", "destaque", "borda"]).optional(),
});

const esquemaIdentidadeMarcaEditorial = z.object({
  nomeExibicao: z.string().min(2).max(90),
  mostrarNomeExibicao: z.boolean().optional(),
  subtituloCurto: z.string().max(120).optional(),
  mostrarSubtituloCurto: z.boolean().optional(),
  alinhamentoCabecalho: z.enum(["esquerda", "centro", "direita"]).optional(),
  posicaoCabecalho: z.enum(POSICOES_CABECALHO_MARCA).optional(),
  urlLogotipoOpcional: z.string().min(1).optional(),
  formatoBordaLogotipo: z.enum(["natural", "suave", "arredondado", "circulo"]).optional(),
  cidadeEstado: z.string().max(80).optional(),
  urlMapaEnderecoOpcional: z
    .string()
    .trim()
    .max(500)
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "O link do Google Maps deve começar com http:// ou https://",
    )
    .optional()
    .or(z.literal("")),
  registroProfissionalOpcional: z.string().max(50).optional(),
  telefonePrincipalOpcional: z.string().max(40).optional(),
  celularOpcional: z.string().max(40).optional(),
  horarioFuncionamentoOpcional: z.string().max(300).optional(),
});

const esquemaItemAcaoHome = z.object({
  posicionamentoEquipe: esquemaPosicionamentoEquipeVitrine.optional(),
  limiteAvataresEquipe: esquemaLimiteAvataresEquipe,
  modoExibicaoColecao: z.enum(["modal_gaveta", "carrossel", "grade_2_colunas"]).optional(),
  configuracaoCtaAcervo: z
    .object({
      tipoAcao: z.enum(["whatsapp", "microfluxo"]),
      rotuloBotao: z.string().max(50).optional(),
      microfluxoId: z.string().optional(),
    })
    .optional(),
  configuracaoPost: esquemaConfiguracaoPostVitrine.optional(),
  configuracaoAgenda: esquemaConfiguracaoAgendaVitrine.optional(),
  id: z.string().min(1),
  rotulo: z.string().min(1).max(60),
  subtituloDiscreto: z.string().max(90).optional(),
  tituloSecao: z.string().trim().max(100).optional(),
  rotuloCartaoOpcional: z.string().max(60).optional(),
  subtituloCartaoOpcional: z.string().max(90).optional(),
  tipoDestino: z.enum([
    "microfluxo",
    "agenda",
    "publicacao_post",
    "secao_produtos",
    "secao_servicos",
    "secao_portfolio",
    "secao_equipe",
    "secao_videos",
    "link_externo",
    "whatsapp",
    "telefone",
  ]),
  destino: z.string().min(1).max(500),
  destaquePrincipal: z.boolean().optional(),
  animarBordaDestaque: z.boolean().optional(),
  corBrilhoBorda: z.string().optional(),
  icone: z.string().min(1).max(60).optional(),
});

const esquemaLinkRedeSocial = z.object({
  id: z.string().min(1),
  rede: z.enum([
    "instagram",
    "linkedin",
    "youtube",
    "tiktok",
    "facebook",
    "pinterest",
    "behance",
    "whatsapp",
    "site",
  ]),
  url: z.string().min(1).max(500),
  rotuloAcessivel: z.string().max(100).optional(),
});

const esquemaDestaqueObraGaleria = z.object({
  id: z.string().min(1),
  tituloObra: z.string().min(1).max(100),
  serieOuCategoria: z.string().min(1).max(80),
  anoOuLocal: z.string().max(80).optional(),
  urlImagem: z.string().min(1),
  textoAlternativo: z.string().min(1).max(220),
  pontoFocal: esquemaCoordenadasPontoFocal,
  destinoOpcional: z.string().min(1).max(500).optional(),
});

const esquemaMetadadosSeoPublicos = z.object({
  tituloSeo: z.string().max(90).optional(),
  descricaoSeo: z.string().max(200).optional(),
  urlImagemCompartilhamento: z.string().min(1).optional(),
  indexavel: z.boolean().optional(),
});

export const esquemaConteudoPaginaPublicada: z.ZodType<ConteudoPaginaPublicada> = z.object({
  perfilPublicidade: z.enum(CODIGOS_PERFIL_PUBLICIDADE).optional(),
  avaliacoesGoogle: esquemaConfiguracaoAvaliacoesGoogle.optional(),
  organizacaoId: z.string().min(1),
  identificadorPublico: z.string().min(3).max(48),
  publicado: z.boolean(),
  paginaAtiva: z.boolean(),
  versaoPublicada: z.number().int().min(1),
  atualizadoEmIso: z.string().min(1),
  composicaoVisual: z.enum(["imersivo", "retrato_editorial", "galeria_editorial"]),
  espacamentoAcoes: z.enum(["compacto", "medio", "amplo"]).optional(),
  faixaInicioExperiencias: z.enum(FAIXAS_INICIO_EXPERIENCIAS).optional(),
  paletaId: z.enum([
    "noite_mineral",
    "marfim_editorial",
    "argila_quente",
    "floresta_profunda",
    "safira_corporativo",
    "titanio_onix",
    "linho_areia",
    "terracota_nobre",
  ]),
  corPersonalizadaHex: z
    .string()
    .trim()
    .regex(
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
      "Cor personalizada deve estar no formato HEX (#RGB ou #RRGGBB).",
    )
    .optional(),
  customizacaoTokens: esquemaCustomizacaoTokensEditorial.optional(),
  tipografiaId: z.enum([
    "classico_editorial",
    "contemporaneo_minimalista",
    "galeria_arquitetonica",
  ]),
  identidade: esquemaIdentidadeMarcaEditorial,
  chamadaEditorial: esquemaChamadaEditorial.extend({ tituloPrincipal: z.string().min(2).max(180) }),
  chamadasEditoriaisAdicionais: esquemaChamadasEditoriaisAdicionais,
  midiaFundo: esquemaMidiaFundoEditorial,
  acoesPrincipais: z.array(esquemaItemAcaoHome),
  redesSociais: z.array(esquemaLinkRedeSocial).max(9),
  obrasDestaqueGaleria: z.array(esquemaDestaqueObraGaleria).max(8),
  seo: esquemaMetadadosSeoPublicos,
});
