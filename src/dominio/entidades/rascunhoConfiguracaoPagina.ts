import { ErroValidacaoDominio } from "../erros/errosDominio";
import type { CodigoPerfilPublicidade } from "../publicidade/tiposPerfilPublicidade";
import {
  LIMITE_MAXIMO_CHAMADAS_EDITORIAIS,
  hidratarChamadasEditoriaisAdicionais,
  type ConjuntoChamadasEditoriais,
} from "./chamadasEditoriais";
import {
  hidratarConfiguracaoAvaliacoesGoogle,
  type ConfiguracaoAvaliacoesGoogle,
} from "./avaliacoesGoogle";
import {
  type ConteudoPaginaPublicada,
  type CustomizacaoTokensEditorial,
  type DestaqueObraGaleria,
  type EspacamentoAcoesHome,
  type IdentidadeMarcaEditorial,
  type IdentificadorPaletaEditorial,
  type IdentificadorTipografiaEditorial,
  type ItemAcaoHome,
  type LinkRedeSocial,
  type MetadadosSeoPublicos,
  type MidiaFundoEditorial,
  type TipoComposicaoEditorial,
} from "./paginaPublicada";

export const TAMANHO_MAXIMO_IMAGEM_BYTES = 8 * 1024 * 1024; // 8 MiB (alinhado com storage.rules)
export const TAMANHO_MAXIMO_VIDEO_BYTES = 25 * 1024 * 1024; // 25 MiB (alinhado com storage.rules)

export const TIPOS_MIME_IMAGEM_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const TIPOS_MIME_VIDEO_PERMITIDOS = ["video/mp4", "video/webm"] as const;

export interface RascunhoConfiguracaoPagina extends ConjuntoChamadasEditoriais {
  readonly avaliacoesGoogle?: ConfiguracaoAvaliacoesGoogle;
  readonly organizacaoId: string;
  readonly composicaoVisual: TipoComposicaoEditorial;
  readonly espacamentoAcoes?: EspacamentoAcoesHome;
  readonly paletaId: IdentificadorPaletaEditorial;
  readonly corPersonalizadaHex?: string;
  readonly customizacaoTokens?: CustomizacaoTokensEditorial;
  readonly tipografiaId: IdentificadorTipografiaEditorial;
  readonly identidade: IdentidadeMarcaEditorial;
  readonly midiaFundo: MidiaFundoEditorial;
  readonly acoesPrincipais: readonly ItemAcaoHome[];
  readonly redesSociais: readonly LinkRedeSocial[];
  readonly obrasDestaqueGaleria: readonly DestaqueObraGaleria[];
  readonly seo: MetadadosSeoPublicos;
  readonly atualizadoEmIso: string;
}

export interface HistoricoPublicacaoPagina {
  readonly versao: number;
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly publicadoPorUsuarioId: string;
  readonly publicadoEmIso: string;
  readonly conteudoPublicado: ConteudoPaginaPublicada;
}

export interface PendenciaPublicacaoPagina {
  readonly codigo:
    | "NOME_EXIBICAO_CURTO"
    | "TITULO_EDITORIAL_CURTO"
    | "LIMITE_CHAMADAS_EDITORIAIS_EXCEDIDO"
    | "MIDIA_PRINCIPAL_AUSENTE"
    | "TEXTO_ALTERNATIVO_AUSENTE"
    | "POSTER_VIDEO_OBRIGATORIO"
    | "ESTABELECIMENTO_GOOGLE_AUSENTE"
    | "EMAIL_NAO_VERIFICADO";
  readonly mensagem: string;
}

export function criarRascunhoConfiguracaoPaginaPadrao(parametros: {
  readonly organizacaoId: string;
  readonly nomeOrganizacao: string;
  readonly agoraIso?: string;
}): RascunhoConfiguracaoPagina {
  const agoraIso = parametros.agoraIso ?? new Date().toISOString();
  const nomeLimpo = parametros.nomeOrganizacao.trim() || "Minha Presença Digital";

  return {
    organizacaoId: parametros.organizacaoId,
    composicaoVisual: "imersivo",
    paletaId: "noite_mineral",
    tipografiaId: "classico_editorial",
    identidade: {
      nomeExibicao: nomeLimpo,
    },
    chamadaEditorial: {
      sobretituloOpcional: "Apresentação Autoral",
      tituloPrincipal: `${nomeLimpo} — atendimento sob medida e condução personalizada.`,
      descricaoCurta:
        "Conheça nossa atuação e utilize os acessos principais para iniciar seu atendimento.",
    },
    midiaFundo: {
      tipo: "imagem",
      urlPrincipal: "/midias-demonstracao/imersivo-arquitetura-luz.svg",
      textoAlternativo: `Imagem de apresentação editorial de ${nomeLimpo}`,
      pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
      pontoFocalMobile: { xPercentual: 50, yPercentual: 40 },
      intensidadeVeloEscuro: "equilibrado",
      efeitoCantos: "nenhum",
    },
    acoesPrincipais: [],
    redesSociais: [],
    obrasDestaqueGaleria: [],
    seo: {
      indexavel: false,
    },
    atualizadoEmIso: agoraIso,
  };
}

function ehObjetoSimples(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/**
 * Hidrata de forma segura qualquer documento `configuracaoPagina/rascunho`,
 * mantendo compatibilidade retroativa com rascunhos iniciais criados na Fase 2.
 */
export function hidratarRascunhoConfiguracaoPagina(
  dadosBrutos: Record<string, unknown> | null | undefined,
  fallback: {
    readonly organizacaoId: string;
    readonly nomeOrganizacao: string;
  },
): RascunhoConfiguracaoPagina {
  const padrao = criarRascunhoConfiguracaoPaginaPadrao(fallback);
  if (!dadosBrutos) {
    return padrao;
  }

  const composicaoVisual: TipoComposicaoEditorial =
    dadosBrutos.composicaoVisual === "imersivo" ||
    dadosBrutos.composicaoVisual === "retrato_editorial" ||
    dadosBrutos.composicaoVisual === "galeria_editorial"
      ? dadosBrutos.composicaoVisual
      : padrao.composicaoVisual;

  const paletaId: IdentificadorPaletaEditorial =
    dadosBrutos.paletaId === "noite_mineral" ||
    dadosBrutos.paletaId === "marfim_editorial" ||
    dadosBrutos.paletaId === "argila_quente" ||
    dadosBrutos.paletaId === "floresta_profunda" ||
    dadosBrutos.paletaId === "safira_corporativo" ||
    dadosBrutos.paletaId === "titanio_onix" ||
    dadosBrutos.paletaId === "linho_areia" ||
    dadosBrutos.paletaId === "terracota_nobre"
      ? dadosBrutos.paletaId
      : padrao.paletaId;

  const corPersonalizadaHex =
    typeof dadosBrutos.corPersonalizadaHex === "string" &&
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(dadosBrutos.corPersonalizadaHex.trim())
      ? dadosBrutos.corPersonalizadaHex.trim()
      : undefined;

  const customizacaoTokens = ehObjetoSimples(dadosBrutos.customizacaoTokens)
    ? (dadosBrutos.customizacaoTokens as CustomizacaoTokensEditorial)
    : undefined;

  const tipografiaId: IdentificadorTipografiaEditorial =
    dadosBrutos.tipografiaId === "classico_editorial" ||
    dadosBrutos.tipografiaId === "contemporaneo_minimalista" ||
    dadosBrutos.tipografiaId === "galeria_arquitetonica"
      ? dadosBrutos.tipografiaId
      : padrao.tipografiaId;

  const identidadeBruta = ehObjetoSimples(dadosBrutos.identidade) ? dadosBrutos.identidade : {};
  const nomeExibicao =
    typeof identidadeBruta.nomeExibicao === "string" && identidadeBruta.nomeExibicao.trim()
      ? identidadeBruta.nomeExibicao
      : padrao.identidade.nomeExibicao;

  const chamadaBruta = ehObjetoSimples(dadosBrutos.chamadaEditorial)
    ? dadosBrutos.chamadaEditorial
    : {};
  const tituloLegado =
    typeof dadosBrutos.tituloEditorial === "string" && dadosBrutos.tituloEditorial.trim()
      ? dadosBrutos.tituloEditorial
      : undefined;
  const descricaoLegada =
    typeof dadosBrutos.descricaoEditorial === "string" && dadosBrutos.descricaoEditorial.trim()
      ? dadosBrutos.descricaoEditorial
      : undefined;

  const midiaBruta = ehObjetoSimples(dadosBrutos.midiaFundo) ? dadosBrutos.midiaFundo : {};
  const pontoDesktopBruto = ehObjetoSimples(midiaBruta.pontoFocalDesktop)
    ? midiaBruta.pontoFocalDesktop
    : {};
  const pontoMobileBruto = ehObjetoSimples(midiaBruta.pontoFocalMobile)
    ? midiaBruta.pontoFocalMobile
    : null;

  const seoBruto = ehObjetoSimples(dadosBrutos.seo) ? dadosBrutos.seo : {};

  const espacamentoAcoes =
    dadosBrutos.espacamentoAcoes === "compacto" ||
    dadosBrutos.espacamentoAcoes === "medio" ||
    dadosBrutos.espacamentoAcoes === "amplo"
      ? dadosBrutos.espacamentoAcoes
      : padrao.espacamentoAcoes;

  return {
    organizacaoId: fallback.organizacaoId,
    composicaoVisual,
    ...(espacamentoAcoes ? { espacamentoAcoes } : {}),
    paletaId,
    ...(corPersonalizadaHex ? { corPersonalizadaHex } : {}),
    ...(customizacaoTokens ? { customizacaoTokens } : {}),
    tipografiaId,
    identidade: {
      nomeExibicao,
      ...(typeof identidadeBruta.mostrarNomeExibicao === "boolean"
        ? { mostrarNomeExibicao: identidadeBruta.mostrarNomeExibicao }
        : {}),
      ...(typeof identidadeBruta.subtituloCurto === "string" && identidadeBruta.subtituloCurto
        ? { subtituloCurto: identidadeBruta.subtituloCurto }
        : {}),
      ...(typeof identidadeBruta.mostrarSubtituloCurto === "boolean"
        ? { mostrarSubtituloCurto: identidadeBruta.mostrarSubtituloCurto }
        : {}),
      ...(identidadeBruta.alinhamentoCabecalho === "esquerda" ||
      identidadeBruta.alinhamentoCabecalho === "centro" ||
      identidadeBruta.alinhamentoCabecalho === "direita"
        ? { alinhamentoCabecalho: identidadeBruta.alinhamentoCabecalho }
        : {}),
      ...(typeof identidadeBruta.urlLogotipoOpcional === "string" &&
      identidadeBruta.urlLogotipoOpcional
        ? { urlLogotipoOpcional: identidadeBruta.urlLogotipoOpcional }
        : {}),
      ...(typeof identidadeBruta.cidadeEstado === "string" && identidadeBruta.cidadeEstado
        ? { cidadeEstado: identidadeBruta.cidadeEstado }
        : {}),
      ...(typeof identidadeBruta.urlMapaEnderecoOpcional === "string" &&
      identidadeBruta.urlMapaEnderecoOpcional
        ? { urlMapaEnderecoOpcional: identidadeBruta.urlMapaEnderecoOpcional }
        : {}),
      ...(typeof identidadeBruta.registroProfissionalOpcional === "string" &&
      identidadeBruta.registroProfissionalOpcional
        ? { registroProfissionalOpcional: identidadeBruta.registroProfissionalOpcional }
        : {}),
      ...(typeof identidadeBruta.telefonePrincipalOpcional === "string" &&
      identidadeBruta.telefonePrincipalOpcional
        ? { telefonePrincipalOpcional: identidadeBruta.telefonePrincipalOpcional }
        : {}),
      ...(typeof identidadeBruta.celularOpcional === "string" && identidadeBruta.celularOpcional
        ? { celularOpcional: identidadeBruta.celularOpcional }
        : {}),
      ...(typeof identidadeBruta.horarioFuncionamentoOpcional === "string" &&
      identidadeBruta.horarioFuncionamentoOpcional
        ? { horarioFuncionamentoOpcional: identidadeBruta.horarioFuncionamentoOpcional }
        : {}),
    },
    chamadaEditorial: {
      ...(typeof chamadaBruta.sobretituloOpcional === "string"
        ? { sobretituloOpcional: chamadaBruta.sobretituloOpcional }
        : padrao.chamadaEditorial.sobretituloOpcional
          ? { sobretituloOpcional: padrao.chamadaEditorial.sobretituloOpcional }
          : {}),
      tituloPrincipal:
        typeof chamadaBruta.tituloPrincipal === "string" && chamadaBruta.tituloPrincipal.trim()
          ? chamadaBruta.tituloPrincipal
          : (tituloLegado ?? padrao.chamadaEditorial.tituloPrincipal),
      ...(typeof chamadaBruta.descricaoCurta === "string"
        ? { descricaoCurta: chamadaBruta.descricaoCurta }
        : descricaoLegada
          ? { descricaoCurta: descricaoLegada }
          : padrao.chamadaEditorial.descricaoCurta
            ? { descricaoCurta: padrao.chamadaEditorial.descricaoCurta }
            : {}),
      ...(typeof chamadaBruta.rotuloCta === "string" && chamadaBruta.rotuloCta.trim()
        ? { rotuloCta: chamadaBruta.rotuloCta.trim() }
        : padrao.chamadaEditorial.rotuloCta
          ? { rotuloCta: padrao.chamadaEditorial.rotuloCta }
          : {}),
      ...(typeof chamadaBruta.fluxoId === "string" && chamadaBruta.fluxoId.trim()
        ? { fluxoId: chamadaBruta.fluxoId.trim().replace(/^#/, "") }
        : typeof (chamadaBruta as Record<string, unknown>).destinoFluxo === "string" &&
            typeof (chamadaBruta as Record<string, unknown>).destinoFluxo === "string" &&
            ((chamadaBruta as Record<string, unknown>).destinoFluxo as string).trim()
          ? { fluxoId: ((chamadaBruta as Record<string, unknown>).destinoFluxo as string).trim().replace(/^#/, "") }
          : padrao.chamadaEditorial.fluxoId
            ? { fluxoId: padrao.chamadaEditorial.fluxoId }
            : {}),
    },
    chamadasEditoriaisAdicionais: hidratarChamadasEditoriaisAdicionais(
      dadosBrutos.chamadasEditoriaisAdicionais,
    ),
    midiaFundo: {
      tipo:
        midiaBruta.tipo === "degradado"
          ? "degradado"
          : midiaBruta.tipo === "video"
            ? "video"
            : "imagem",
      urlPrincipal:
        typeof midiaBruta.urlPrincipal === "string" && midiaBruta.urlPrincipal.trim()
          ? midiaBruta.urlPrincipal
          : padrao.midiaFundo.urlPrincipal,
      ...(typeof midiaBruta.urlMobileOpcional === "string" && midiaBruta.urlMobileOpcional
        ? { urlMobileOpcional: midiaBruta.urlMobileOpcional }
        : {}),
      ...(typeof midiaBruta.urlPosterVideo === "string" && midiaBruta.urlPosterVideo
        ? { urlPosterVideo: midiaBruta.urlPosterVideo }
        : {}),
      ...(midiaBruta.degradadoOpcional && typeof midiaBruta.degradadoOpcional === "object"
        ? {
            degradadoOpcional: {
              corInicial: String((midiaBruta.degradadoOpcional as Record<string, unknown>).corInicial || "#0f172a"),
              corFinal: String((midiaBruta.degradadoOpcional as Record<string, unknown>).corFinal || "#312e81"),
              anguloGraus:
                typeof (midiaBruta.degradadoOpcional as Record<string, unknown>).anguloGraus === "number"
                  ? Number((midiaBruta.degradadoOpcional as Record<string, unknown>).anguloGraus)
                  : 135,
            },
          }
        : {}),
      textoAlternativo:
        typeof midiaBruta.textoAlternativo === "string" && midiaBruta.textoAlternativo.trim()
          ? midiaBruta.textoAlternativo
          : padrao.midiaFundo.textoAlternativo,
      pontoFocalDesktop: {
        xPercentual:
          typeof pontoDesktopBruto.xPercentual === "number" ? pontoDesktopBruto.xPercentual : 50,
        yPercentual:
          typeof pontoDesktopBruto.yPercentual === "number" ? pontoDesktopBruto.yPercentual : 50,
      },
      ...(pontoMobileBruto &&
      typeof pontoMobileBruto.xPercentual === "number" &&
      typeof pontoMobileBruto.yPercentual === "number"
        ? {
            pontoFocalMobile: {
              xPercentual: pontoMobileBruto.xPercentual,
              yPercentual: pontoMobileBruto.yPercentual,
            },
          }
        : {}),
      intensidadeVeloEscuro:
        midiaBruta.intensidadeVeloEscuro === "nenhum" ||
        midiaBruta.intensidadeVeloEscuro === "suave" ||
        midiaBruta.intensidadeVeloEscuro === "equilibrado" ||
        midiaBruta.intensidadeVeloEscuro === "intenso"
          ? midiaBruta.intensidadeVeloEscuro
          : "equilibrado",
      efeitoCantos:
        midiaBruta.efeitoCantos === "dots" || midiaBruta.efeitoCantos === "grade"
          ? midiaBruta.efeitoCantos
          : "nenhum",
      ...(typeof midiaBruta.opacidadeDotsCantos === "number"
        ? { opacidadeDotsCantos: Math.max(0, Math.min(100, midiaBruta.opacidadeDotsCantos)) }
        : {}),
    },
    ...(dadosBrutos.avaliacoesGoogle !== undefined
      ? { avaliacoesGoogle: hidratarConfiguracaoAvaliacoesGoogle(dadosBrutos.avaliacoesGoogle) }
      : {}),
    acoesPrincipais: Array.isArray(dadosBrutos.acoesPrincipais)
      ? (dadosBrutos.acoesPrincipais as ItemAcaoHome[])
      : padrao.acoesPrincipais,
    redesSociais: Array.isArray(dadosBrutos.redesSociais)
      ? (dadosBrutos.redesSociais as LinkRedeSocial[])
      : [],
    obrasDestaqueGaleria: Array.isArray(dadosBrutos.obrasDestaqueGaleria)
      ? (dadosBrutos.obrasDestaqueGaleria as DestaqueObraGaleria[])
      : [],
    seo: {
      ...(typeof seoBruto.tituloSeo === "string" && seoBruto.tituloSeo
        ? { tituloSeo: seoBruto.tituloSeo }
        : {}),
      ...(typeof seoBruto.descricaoSeo === "string" && seoBruto.descricaoSeo
        ? { descricaoSeo: seoBruto.descricaoSeo }
        : {}),
      ...(typeof seoBruto.urlImagemCompartilhamento === "string" &&
      seoBruto.urlImagemCompartilhamento
        ? { urlImagemCompartilhamento: seoBruto.urlImagemCompartilhamento }
        : {}),
      indexavel: typeof seoBruto.indexavel === "boolean" ? seoBruto.indexavel : false,
    },
    atualizadoEmIso:
      typeof dadosBrutos.atualizadoEmIso === "string"
        ? dadosBrutos.atualizadoEmIso
        : padrao.atualizadoEmIso,
  };
}

/**
 * Projeta o rascunho em edição na estrutura exata da página publicada para prévia ao vivo
 * e geração da nova versão publicada.
 */
export function converterRascunhoParaConteudoPublicado(
  rascunho: RascunhoConfiguracaoPagina,
  opcoes: {
    readonly identificadorPublico: string;
    readonly versaoPublicada: number;
    readonly publicadoEmIso?: string;
    readonly perfilPublicidade?: CodigoPerfilPublicidade;
  },
): ConteudoPaginaPublicada {
  return {
    ...(opcoes.perfilPublicidade && opcoes.perfilPublicidade !== "padrao"
      ? { perfilPublicidade: opcoes.perfilPublicidade }
      : {}),
    organizacaoId: rascunho.organizacaoId,
    identificadorPublico: opcoes.identificadorPublico,
    publicado: true,
    paginaAtiva: true,
    versaoPublicada: opcoes.versaoPublicada,
    atualizadoEmIso: opcoes.publicadoEmIso ?? rascunho.atualizadoEmIso,
    composicaoVisual: rascunho.composicaoVisual,
    ...(rascunho.espacamentoAcoes ? { espacamentoAcoes: rascunho.espacamentoAcoes } : {}),
    paletaId: rascunho.paletaId,
    ...(rascunho.corPersonalizadaHex ? { corPersonalizadaHex: rascunho.corPersonalizadaHex } : {}),
    ...(rascunho.customizacaoTokens ? { customizacaoTokens: rascunho.customizacaoTokens } : {}),
    tipografiaId: rascunho.tipografiaId,
    identidade: rascunho.identidade,
    chamadaEditorial: rascunho.chamadaEditorial,
    ...(rascunho.chamadasEditoriaisAdicionais
      ? { chamadasEditoriaisAdicionais: rascunho.chamadasEditoriaisAdicionais }
      : {}),
    midiaFundo: rascunho.midiaFundo,
    ...(rascunho.avaliacoesGoogle ? { avaliacoesGoogle: rascunho.avaliacoesGoogle } : {}),
    acoesPrincipais: rascunho.acoesPrincipais,
    redesSociais: rascunho.redesSociais,
    obrasDestaqueGaleria: rascunho.obrasDestaqueGaleria,
    seo: rascunho.seo,
  };
}

export function avaliarProntidaoPublicacaoPagina(
  rascunho: RascunhoConfiguracaoPagina,
  contexto: { readonly emailVerificado: boolean },
): readonly PendenciaPublicacaoPagina[] {
  const pendencias: PendenciaPublicacaoPagina[] = [];

  if (
    rascunho.avaliacoesGoogle?.habilitado &&
    !rascunho.avaliacoesGoogle.identificadorLocal?.trim()
  ) {
    pendencias.push({
      codigo: "ESTABELECIMENTO_GOOGLE_AUSENTE",
      mensagem: "Selecione o estabelecimento para exibir as avaliações do Google.",
    });
  }

  if (rascunho.identidade.nomeExibicao.trim().length < 2) {
    pendencias.push({
      codigo: "NOME_EXIBICAO_CURTO",
      mensagem: "Informe o nome de exibição da sua marca ou atuação profissional.",
    });
  }

  const chamadas = [rascunho.chamadaEditorial, ...(rascunho.chamadasEditoriaisAdicionais ?? [])];
  if (chamadas.length > LIMITE_MAXIMO_CHAMADAS_EDITORIAIS) {
    pendencias.push({
      codigo: "LIMITE_CHAMADAS_EDITORIAIS_EXCEDIDO",
      mensagem: `Utilize no máximo ${LIMITE_MAXIMO_CHAMADAS_EDITORIAIS} chamadas editoriais.`,
    });
  }
  chamadas.forEach((chamada, indice) => {
    if (chamada.tituloPrincipal.trim().length < 4) {
      pendencias.push({
        codigo: "TITULO_EDITORIAL_CURTO",
        mensagem: `Defina o título da chamada ${indice + 1} com pelo menos 4 caracteres.`,
      });
    }
  });

  if (rascunho.midiaFundo.tipo !== "degradado" && !rascunho.midiaFundo.urlPrincipal.trim()) {
    pendencias.push({
      codigo: "MIDIA_PRINCIPAL_AUSENTE",
      mensagem: "Selecione ou envie uma fotografia ou vídeo principal de fundo.",
    });
  }

  if (rascunho.midiaFundo.tipo !== "degradado" && rascunho.midiaFundo.textoAlternativo.trim().length < 3) {
    pendencias.push({
      codigo: "TEXTO_ALTERNATIVO_AUSENTE",
      mensagem: "Descreva brevemente a mídia principal para acessibilidade (texto alternativo).",
    });
  }

  if (rascunho.midiaFundo.tipo === "video" && !rascunho.midiaFundo.urlPosterVideo?.trim()) {
    pendencias.push({
      codigo: "POSTER_VIDEO_OBRIGATORIO",
      mensagem:
        "Ao utilizar vídeo de fundo, envie ou defina uma imagem estática de capa (poster) obrigatória.",
    });
  }

  if (!contexto.emailVerificado) {
    pendencias.push({
      codigo: "EMAIL_NAO_VERIFICADO",
      mensagem: "Confirme seu endereço de e-mail antes de publicar sua página.",
    });
  }

  return pendencias;
}

export function exigirProntidaoConteudoParaPublicacao(rascunho: RascunhoConfiguracaoPagina): void {
  const pendenciasConteudo = avaliarProntidaoPublicacaoPagina(rascunho, {
    emailVerificado: true,
  });

  const primeiraPendencia = pendenciasConteudo[0];
  if (primeiraPendencia) {
    throw new ErroValidacaoDominio(primeiraPendencia.mensagem, primeiraPendencia.codigo);
  }
}

export function validarArquivoMidiaEditorial(
  arquivo: {
    readonly nome: string;
    readonly tamanhoBytes: number;
    readonly tipoMime: string;
  },
  categoriaEsperada: "imagem" | "video",
): void {
  if (categoriaEsperada === "imagem") {
    const tipoPermitido = (TIPOS_MIME_IMAGEM_PERMITIDOS as readonly string[]).includes(
      arquivo.tipoMime,
    );
    if (!tipoPermitido) {
      throw new ErroValidacaoDominio(
        "Formato de imagem inválido. Utilize arquivos WebP, AVIF, JPEG ou PNG.",
        "FORMATO_IMAGEM_INVALIDO",
      );
    }

    if (arquivo.tamanhoBytes <= 0 || arquivo.tamanhoBytes > TAMANHO_MAXIMO_IMAGEM_BYTES) {
      throw new ErroValidacaoDominio(
        "A imagem deve ter no máximo 8 MB para garantir carregamento rápido.",
        "TAMANHO_IMAGEM_EXCEDIDO",
      );
    }
    return;
  }

  const videoPermitido = (TIPOS_MIME_VIDEO_PERMITIDOS as readonly string[]).includes(
    arquivo.tipoMime,
  );
  if (!videoPermitido) {
    throw new ErroValidacaoDominio(
      "Formato de vídeo inválido. Utilize arquivos MP4 ou WebM silenciosos.",
      "FORMATO_VIDEO_INVALIDO",
    );
  }

  if (arquivo.tamanhoBytes <= 0 || arquivo.tamanhoBytes > TAMANHO_MAXIMO_VIDEO_BYTES) {
    throw new ErroValidacaoDominio(
      "O vídeo de fundo deve ter no máximo 25 MB.",
      "TAMANHO_VIDEO_EXCEDIDO",
    );
  }
}

/**
 * Remove recursivamente chaves com `undefined` para evitar rejeição de serialização no Firestore.
 */
export function removerCamposIndefinidosParaFirestore<T>(valor: T): T {
  if (Array.isArray(valor)) {
    return valor.map((item) => removerCamposIndefinidosParaFirestore(item)) as unknown as T;
  }

  if (ehObjetoSimples(valor)) {
    const resultado: Record<string, unknown> = {};
    for (const [chave, subvalor] of Object.entries(valor)) {
      if (subvalor !== undefined) {
        resultado[chave] = removerCamposIndefinidosParaFirestore(subvalor);
      }
    }
    return resultado as T;
  }

  return valor;
}
