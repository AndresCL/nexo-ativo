import { z } from "zod";
import { esquemaPosicionamentoEquipeVitrine } from "./esquemaPosicionamentoEquipeVitrine";
import { esquemaLimiteAvataresEquipe } from "./esquemaLimiteAvataresEquipe";
import type { DefinicaoMicrofluxo, EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { esquemaRegraCalculoComercialMicrofluxo } from "./esquemasCalculoComercial";

const esquemaOpcaoEtapa = z.object({
  desconectada: z.boolean().optional(),
  encerrarPercurso: z.boolean().optional(),
  id: z.string().min(1),
  rotulo: z.string().trim().min(1, "Informe o rótulo da opção.").max(120),
  descricaoCurta: z.string().max(220).optional(),
  valorAdicionalCentavos: z.number().int().min(0).optional(),
  proximaEtapaIdOpcional: z.string().max(80).optional(),
  servicoRecomendadoId: z.string().max(80).optional(),
  produtoRecomendadoId: z.string().max(80).optional(),
  profissionalRecomendadoId: z.string().max(80).optional(),
});

const esquemaConfiguracaoPixManual = z.object({
  chavePix: z.string().trim().min(3, "Informe a chave Pix.").max(160),
  nomeRecebedor: z.string().trim().min(2, "Informe o nome do recebedor.").max(120),
  cidadeRecebedor: z.string().max(80).optional(),
  valorReferenciaTexto: z.string().max(80).optional(),
  instrucaoComprovante: z.string().trim().min(3).max(260),
});

export const esquemaTipoPrimitivoCampo = z.enum([
  "texto_curto",
  "texto_longo",
  "numero",
  "moeda",
  "data",
  "email",
  "telefone",
  "selecao_unica",
  "selecao_multipla",
  "booleano",
]);

export const esquemaCampoUniversalFormulario = z.object({
  id: z.string().min(1),
  rotulo: z.string().trim().min(1, "Informe o rótulo do campo.").max(120),
  tipo: esquemaTipoPrimitivoCampo,
  obrigatorio: z.boolean(),
  placeholder: z.string().max(160).optional(),
  sufixoVisual: z.string().max(30).optional(),
  valorMinimo: z.number().optional(),
  valorMaximo: z.number().optional(),
  opcoesCustomizadas: z.array(z.string().min(1).max(120)).max(20).optional(),
});

const esquemaUrlImagem = z
  .string()
  .url()
  .refine((valor) => {
    const url = new URL(valor);
    return url.protocol === "https:" && !url.username && !url.password;
  }, "Use uma URL https para a imagem.");
export const esquemaBlocoConteudo = z.discriminatedUnion("tipo", [
  z.object({ id: z.string().min(1), tipo: z.literal("texto"), texto: z.string().max(4000) }),
  z.object({
    id: z.string().min(1),
    tipo: z.literal("imagem"),
    url: esquemaUrlImagem,
    textoAlternativo: z.string().trim().min(1).max(220),
  }),
]);
export const esquemaBlocoEtapaLivre = z.union([
  esquemaBlocoConteudo,
  z.object({
    id: z.string().min(1),
    tipo: z.literal("campo"),
    campo: esquemaCampoUniversalFormulario,
    finalidade: z
      .enum(["nomeCompleto", "telefoneOuWhatsapp", "email", "mensagemAdicional"])
      .optional(),
    referenciaResumoLegada: z.boolean().optional(),
  }),
  z.object({
    id: z.string().min(1),
    tipo: z.literal("escolha"),
    rotulo: z.string().trim().min(1).max(160),
    multipla: z.boolean(),
    obrigatorio: z.boolean(),
    opcoes: z.array(esquemaOpcaoEtapa).min(1).max(12),
    referenciaResumoLegada: z.boolean().optional(),
  }),
  z.object({
    id: z.string().min(1),
    tipo: z.literal("catalogo"),
    rotulo: z.string().trim().min(1).max(160),
    fonte: z.enum(["servicos", "produtos", "ambos"]),
    obrigatorio: z.boolean(),
    referenciaResumoLegada: z.boolean().optional(),
  }),
  z.object({
    id: z.string().min(1),
    tipo: z.literal("equipe"),
    rotulo: z.string().trim().min(1).max(160),
    obrigatorio: z.boolean(),
    referenciaResumoLegada: z.boolean().optional(),
  }),
]);

export const esquemaEtapaMicrofluxo: z.ZodType<EtapaMicrofluxo, z.ZodTypeDef, unknown> =
  z.preprocess(
    (entrada: unknown) => {
      if (typeof entrada === "object" && entrada !== null) {
        const etapa = entrada as Record<string, unknown>;
        if (etapa.tipoEtapa === "selecao_produto") {
          return {
            ...etapa,
            tipoEtapa: "selecao_catalogo",
            fonteCatalogo: etapa.fonteCatalogo ?? "produtos",
          };
        }
        if (etapa.tipoEtapa === "selecao_servico") {
          return {
            ...etapa,
            tipoEtapa: "selecao_catalogo",
            fonteCatalogo: etapa.fonteCatalogo ?? "servicos",
          };
        }
      }
      return entrada;
    },
    z.object({
      id: z.string().min(1),
      saidaPadraoDesconectada: z.boolean().optional(),
      finalizacaoExplicita: z.boolean().optional(),
      modeloOrigem: z
        .enum([
          "selecao_unica",
          "selecao_multipla",
          "selecao_catalogo",
          "selecao_profissional",
          "entrada_curta",
          "formulario_dinamico",
          "recomendacao_catalogo",
          "instrucao_pix_manual",
          "coleta_contato",
          "conectar_whatsapp",
          "selecao_produto",
          "selecao_servico",
        ])
        .optional(),
      blocos: z.array(esquemaBlocoEtapaLivre).max(30).optional(),
      tipoEtapa: z.enum([
        "etapa_livre",
        "selecao_unica",
        "selecao_multipla",
        "selecao_catalogo",
        "selecao_profissional",
        "entrada_curta",
        "formulario_dinamico",
        "recomendacao_catalogo",
        "instrucao_pix_manual",
        "coleta_contato",
        "conectar_whatsapp",
        "selecao_produto",
        "selecao_servico",
      ]),
      titulo: z.string().trim().min(2, "Informe o título da etapa.").max(160),
      subtituloOpcional: z.string().max(260).optional(),
      obrigatoria: z.boolean(),
      proximaEtapaPadraoId: z.string().max(80).optional(),
      opcoes: z.array(esquemaOpcaoEtapa).max(12).optional(),
      campos: z.array(esquemaCampoUniversalFormulario).max(20).optional(),
      fonteCatalogo: z.enum(["servicos", "produtos", "ambos"]).optional(),
      placeholderEntrada: z.string().max(180).optional(),
      tituloRecomendacaoPadrao: z.string().max(140).optional(),
      descricaoRecomendacaoPadrao: z.string().max(380).optional(),
      configuracaoPixManual: esquemaConfiguracaoPixManual.optional(),
    }),
  );

const esquemaCampoResumo = z.object({
  etapaId: z.string().min(1).max(80),
  campoId: z.string().min(1).max(80).optional(),
  rotulo: z.string().trim().min(1).max(120).optional(),
});
const rotuloAcao = z.string().trim().min(1).max(80);
const identificadorDestino = z.string().regex(/^[a-zA-Z0-9_-]{1,120}$/, "Destino inválido.");
export const esquemaConclusaoMicrofluxo = z.object({
  blocos: z.array(esquemaBlocoConteudo).max(30).optional(),
  acoes: z
    .array(
      z.discriminatedUnion("tipo", [
        z.object({
          tipo: z.literal("whatsapp"),
          rotulo: rotuloAcao,
          numeroOpcional: z
            .string()
            .regex(/^\+?[0-9 ()-]{8,25}$/, "Informe um telefone válido.")
            .optional(),
        }),
        z.object({
          tipo: z.literal("url_externa"),
          rotulo: rotuloAcao,
          url: z
            .string()
            .trim()
            .max(2000)
            .url()
            .refine((valor) => {
              const url = new URL(valor);
              return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
            }, "Use uma URL http ou https sem credenciais."),
        }),
        z.object({
          tipo: z.literal("microfluxo"),
          rotulo: rotuloAcao,
          microfluxoId: identificadorDestino,
        }),
        z.object({
          tipo: z.literal("perfil_profissional"),
          rotulo: rotuloAcao,
          profissionalId: identificadorDestino,
        }),
        z.object({ tipo: z.literal("home"), rotulo: rotuloAcao }),
      ]),
    )
    .max(2, "A conclusão permite até duas ações."),
  resumo: z.object({
    ativo: z.boolean().default(false),
    campos: z.array(esquemaCampoResumo).max(240),
    incluirDemonstrativo: z.boolean().default(false),
  }),
  camposWhatsapp: z.array(esquemaCampoResumo).max(240).default([]),
});

export const esquemaDefinicaoMicrofluxo: z.ZodType<DefinicaoMicrofluxo, z.ZodTypeDef, unknown> =
  z.object({
    conclusao: esquemaConclusaoMicrofluxo.optional(),
    id: z.string().min(1),
    organizacaoId: z.string().min(1),
    tipoAcao: z
      .enum([
        "microfluxo",
        "link_externo",
        "secao_servicos",
        "secao_portfolio",
        "secao_equipe",
        "whatsapp",
        "telefone",
      ])
      .optional(),
    urlDestinoOpcional: z.string().trim().max(500).optional(),
    ancoraAcionamento: z.string().trim().min(2).max(80).optional(),
    titulo: z.string().trim().min(2, "Informe o título da experiência.").max(120),
    descricaoCurta: z.string().trim().max(280).default(""),
    textoBotaoConclusao: z.string().trim().max(80).default(""),
    mensagemConfirmacaoTitulo: z.string().trim().max(120).default(""),
    mensagemConfirmacaoCorpo: z.string().trim().max(360).default(""),
    etapaInicialId: z.string().default(""),
    etapas: z.array(esquemaEtapaMicrofluxo).max(12).default([]),
    regraCalculoComercial: esquemaRegraCalculoComercialMicrofluxo.optional(),
    ativo: z.boolean().default(false),
    versaoPublicada: z.number().int().min(1).optional(),
    atualizadoEmIso: z.string().min(1),
    ativoNaHome: z.boolean().optional(),
    rotuloBotaoHome: z.string().trim().max(80).optional(),
    subtituloBotaoHome: z.string().trim().max(120).optional(),
    tituloSecao: z.string().trim().max(100).optional(),
    iconeBotaoHome: z.string().min(1).max(60).optional(),
    destaquePrimarioHome: z.boolean().optional(),
    ordemHome: z.number().int().min(0).max(50).optional(),
    posicionamentoEquipe: esquemaPosicionamentoEquipeVitrine.optional(),
    limiteAvataresEquipe: esquemaLimiteAvataresEquipe,
  });
