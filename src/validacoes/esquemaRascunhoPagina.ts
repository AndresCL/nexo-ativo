import { z } from "zod";
import {
  FAIXAS_INICIO_EXPERIENCIAS,
  POSICOES_CABECALHO_MARCA,
} from "../dominio/editorial/faixaInicioExperiencias";
import {
  esquemaChamadaEditorial,
  esquemaChamadasEditoriaisAdicionais,
} from "./esquemasChamadasEditoriais";
import { esquemaConfiguracaoAvaliacoesGoogle } from "./esquemasAvaliacoesGoogle";
import { esquemaCustomizacaoTokensEditorial } from "./esquemaCustomizacaoTokens";
import type { RascunhoConfiguracaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";

const esquemaPontoFocal = z.object({
  xPercentual: z.number().min(0).max(100),
  yPercentual: z.number().min(0).max(100),
});

export const esquemaRascunhoConfiguracaoPagina: z.ZodType<RascunhoConfiguracaoPagina> = z.object({
  avaliacoesGoogle: esquemaConfiguracaoAvaliacoesGoogle.optional(),
  organizacaoId: z.string().min(1),
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
  identidade: z.object({
    nomeExibicao: z.string().trim().min(2, "Informe o nome de exibição.").max(90),
    mostrarNomeExibicao: z.boolean().optional(),
    subtituloCurto: z.string().max(120).optional(),
    mostrarSubtituloCurto: z.boolean().optional(),
    alinhamentoCabecalho: z.enum(["esquerda", "centro", "direita"]).optional(),
    posicaoCabecalho: z.enum(POSICOES_CABECALHO_MARCA).optional(),
    urlLogotipoOpcional: z.string().max(600).optional(),
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
  }),
  chamadaEditorial: esquemaChamadaEditorial,
  chamadasEditoriaisAdicionais: esquemaChamadasEditoriaisAdicionais,
  midiaFundo: z.object({
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
    urlPrincipal: z.string().trim().max(600),
    urlMobileOpcional: z.string().max(600).optional(),
    urlPosterVideo: z.string().max(600).optional(),
    textoAlternativo: z.string().trim().max(220),
    pontoFocalDesktop: esquemaPontoFocal,
    pontoFocalMobile: esquemaPontoFocal.optional(),
    intensidadeVeloEscuro: z.enum(["nenhum", "suave", "equilibrado", "intenso"]),
    efeitoCantos: z.enum(["nenhum", "dots", "grade"]).optional(),
    opacidadeDotsCantos: z.number().min(0).max(100).optional(),
    tomDotsCantos: z.enum(["neutro", "destaque", "borda"]).optional(),
  }),
  acoesPrincipais: z.array(
    z.object({
      id: z.string().min(1),
      rotulo: z.string().trim().min(1, "Informe o rótulo da ação.").max(60),
      subtituloDiscreto: z.string().max(90).optional(),
      tituloSecao: z.string().trim().max(100).optional(),
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
      destino: z.string().trim().min(1, "Informe o destino da ação.").max(500),
      destaquePrincipal: z.boolean().optional(),
      animarBordaDestaque: z.boolean().optional(),
      corBrilhoBorda: z.string().optional(),
      icone: z.string().min(1).max(60).optional(),
    }),
  ),
  redesSociais: z
    .array(
      z.object({
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
        url: z
          .string()
          .trim()
          .url("Informe uma URL válida começando com https:// ou http://.")
          .max(500),
        rotuloAcessivel: z.string().max(100).optional(),
      }),
    )
    .max(9),
  obrasDestaqueGaleria: z
    .array(
      z.object({
        id: z.string().min(1),
        tituloObra: z.string().trim().min(1, "Informe o título da obra.").max(100),
        serieOuCategoria: z.string().trim().min(1, "Informe a série ou categoria.").max(80),
        anoOuLocal: z.string().max(80).optional(),
        urlImagem: z.string().trim().min(1, "Envie ou informe a imagem da obra.").max(600),
        textoAlternativo: z.string().trim().min(3, "Descreva a obra para acessibilidade.").max(220),
        pontoFocal: esquemaPontoFocal,
        destinoOpcional: z.string().max(500).optional(),
      }),
    )
    .max(8),
  seo: z.object({
    tituloSeo: z.string().max(90).optional(),
    descricaoSeo: z.string().max(200).optional(),
    urlImagemCompartilhamento: z.string().max(600).optional(),
    indexavel: z.boolean().optional(),
  }),
  atualizadoEmIso: z.string().min(1),
});

export const esquemaRequisicaoPublicarPagina = z.object({
  organizacaoId: z.string().min(1, "Identificador da organização é obrigatório."),
});

export type DadosRequisicaoPublicarPagina = z.infer<typeof esquemaRequisicaoPublicarPagina>;
