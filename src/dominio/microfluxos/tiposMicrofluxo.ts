import type { ConfiguracaoAgendaVitrine } from "../agenda/tiposAgenda";
import type { RegraCalculoComercialMicrofluxo } from "../comercial/tiposCalculoComercial";
import type { PosicionamentoEquipeVitrine } from "../editorial/posicionamentoEquipeVitrine";
import type { MidiaItemCatalogo } from "../entidades/catalogoConteudo";
import type { AnimacaoDestaque } from "./animacaoDestaque";

export type AncoraPadraoMicrofluxo = string;

export interface ContextoOrigemMicrofluxo {
  readonly servicoPreSelecionadoId?: string;
  readonly produtoPreSelecionadoId?: string;
  readonly projetoPreSelecionadoId?: string;
  readonly profissionalPreSelecionadoId?: string;
}

export interface OpcaoEtapaMicrofluxo {
  readonly desconectada?: boolean;
  readonly encerrarPercurso?: boolean;
  readonly id: string;
  readonly rotulo: string;
  readonly descricaoCurta?: string;
  readonly valorAdicionalCentavos?: number;
  readonly proximaEtapaIdOpcional?: string;
  readonly servicoRecomendadoId?: string;
  readonly produtoRecomendadoId?: string;
  readonly profissionalRecomendadoId?: string;
}

export interface ConfiguracaoPixManualInformada {
  readonly chavePix: string;
  readonly nomeRecebedor: string;
  readonly cidadeRecebedor?: string;
  readonly valorReferenciaTexto?: string;
  readonly instrucaoComprovante: string;
}

export type TipoPrimitivoCampo =
  | "texto_curto"
  | "texto_longo"
  | "numero"
  | "moeda"
  | "data"
  | "email"
  | "telefone"
  | "selecao_unica"
  | "selecao_multipla"
  | "booleano";

export interface CampoUniversalFormulario {
  readonly id: string;
  readonly rotulo: string;
  readonly tipo: TipoPrimitivoCampo;
  readonly obrigatorio: boolean;
  readonly placeholder?: string;
  readonly sufixoVisual?: string;
  readonly valorMinimo?: number;
  readonly valorMaximo?: number;
  readonly opcoesCustomizadas?: readonly string[];
}

export type FinalidadeCampoContato =
  "nomeCompleto" | "telefoneOuWhatsapp" | "email" | "mensagemAdicional";

export type BlocoEtapaLivre =
  | { readonly id: string; readonly tipo: "texto"; readonly texto: string }
  | {
      readonly id: string;
      readonly tipo: "imagem";
      readonly url: string;
      readonly textoAlternativo: string;
    }
  | {
      readonly id: string;
      readonly tipo: "campo";
      readonly campo: CampoUniversalFormulario;
      readonly finalidade?: FinalidadeCampoContato;
      readonly referenciaResumoLegada?: boolean;
    }
  | {
      readonly id: string;
      readonly tipo: "escolha";
      readonly rotulo: string;
      readonly multipla: boolean;
      readonly obrigatorio: boolean;
      readonly opcoes: readonly OpcaoEtapaMicrofluxo[];
      readonly referenciaResumoLegada?: boolean;
    }
  | {
      readonly id: string;
      readonly tipo: "catalogo";
      readonly rotulo: string;
      readonly fonte: "servicos" | "produtos" | "ambos";
      readonly obrigatorio: boolean;
      readonly referenciaResumoLegada?: boolean;
    }
  | {
      readonly id: string;
      readonly tipo: "equipe";
      readonly rotulo: string;
      readonly obrigatorio: boolean;
      readonly referenciaResumoLegada?: boolean;
    };

export type TipoEtapaMicrofluxo =
  | "etapa_livre"
  | "selecao_unica"
  | "selecao_multipla"
  | "selecao_catalogo"
  | "selecao_profissional"
  | "entrada_curta"
  | "formulario_dinamico"
  | "recomendacao_catalogo"
  | "instrucao_pix_manual"
  | "coleta_contato"
  | "conectar_whatsapp"
  | "selecao_produto"
  | "selecao_servico";

export interface PosicaoCanvasEtapa {
  readonly x: number;
  readonly y: number;
}

export interface EtapaMicrofluxo {
  readonly saidaPadraoDesconectada?: boolean;
  readonly finalizacaoExplicita?: boolean;
  readonly modeloOrigem?: Exclude<TipoEtapaMicrofluxo, "etapa_livre">;
  readonly blocos?: readonly BlocoEtapaLivre[];
  readonly id: string;
  readonly tipoEtapa: TipoEtapaMicrofluxo;
  readonly titulo: string;
  readonly subtituloOpcional?: string;
  readonly obrigatoria: boolean;
  readonly proximaEtapaPadraoId?: string;
  readonly opcoes?: readonly OpcaoEtapaMicrofluxo[];
  readonly campos?: readonly CampoUniversalFormulario[];
  readonly fonteCatalogo?: "servicos" | "produtos" | "ambos";
  readonly placeholderEntrada?: string;
  readonly tituloRecomendacaoPadrao?: string;
  readonly descricaoRecomendacaoPadrao?: string;
  readonly configuracaoPixManual?: ConfiguracaoPixManualInformada;
  readonly posicaoCanvas?: PosicaoCanvasEtapa;
}

export type TipoAcaoVitrine =
  | "microfluxo"
  | "agenda"
  | "publicacao_post"
  | "link_externo"
  | "secao_produtos"
  | "secao_servicos"
  | "secao_portfolio"
  | "secao_equipe"
  | "secao_videos"
  | "whatsapp"
  | "telefone";

export type TipoAcaoCtaPostVitrine =
  | "nenhum"
  | "whatsapp"
  | "microfluxo"
  | "link_externo"
  | "telefone";

export interface ConfiguracaoCtaPostVitrine {
  readonly tipoAcao: TipoAcaoCtaPostVitrine;
  readonly rotuloBotao?: string;
  readonly microfluxoId?: string;
  readonly destinoOpcional?: string;
}

export interface ConfiguracaoPostVitrine {
  readonly tituloPost?: string;
  readonly dataTexto?: string;
  readonly corpoTexto: string;
  readonly imagens?: readonly MidiaItemCatalogo[];
  readonly cta: ConfiguracaoCtaPostVitrine;
}

export type AcaoConclusaoMicrofluxo =
  | { readonly tipo: "whatsapp"; readonly rotulo: string; readonly numeroOpcional?: string }
  | { readonly tipo: "url_externa"; readonly rotulo: string; readonly url: string }
  | { readonly tipo: "microfluxo"; readonly rotulo: string; readonly microfluxoId: string }
  | {
      readonly tipo: "perfil_profissional";
      readonly rotulo: string;
      readonly profissionalId: string;
    }
  | { readonly tipo: "home"; readonly rotulo: string };

export interface CampoResumoConclusao {
  readonly etapaId: string;
  readonly campoId?: string;
  readonly rotulo?: string;
}

export interface ConfiguracaoConclusaoMicrofluxo {
  readonly blocos?: readonly Extract<BlocoEtapaLivre, { tipo: "texto" | "imagem" }>[];
  /** A primeira ação é a principal. Uma lista vazia produz conclusão sem botões. */
  readonly acoes: readonly AcaoConclusaoMicrofluxo[];
  readonly resumo: {
    readonly ativo: boolean;
    readonly campos: readonly CampoResumoConclusao[];
    readonly incluirDemonstrativo: boolean;
  };
  /** Lista independente do resumo; vazia por padrão para não enviar dados pessoais. */
  readonly camposWhatsapp: readonly CampoResumoConclusao[];
}

export interface DefinicaoMicrofluxo {
  /** Ausente mantém a apresentação das versões anteriores. */
  readonly conclusao?: ConfiguracaoConclusaoMicrofluxo;
  readonly posicionamentoEquipe?: PosicionamentoEquipeVitrine;
  readonly limiteAvataresEquipe?: number | null;
  readonly modoExibicaoColecao?: "modal_gaveta" | "carrossel" | "grade_2_colunas";
  readonly configuracaoCtaAcervo?: {
    readonly tipoAcao: "whatsapp" | "microfluxo";
    readonly rotuloBotao?: string;
    readonly microfluxoId?: string;
  };
  readonly configuracaoPost?: ConfiguracaoPostVitrine;
  readonly configuracaoAgenda?: ConfiguracaoAgendaVitrine;
  readonly id: string;
  readonly organizacaoId: string;
  readonly tipoAcao?: TipoAcaoVitrine;
  readonly urlDestinoOpcional?: string;
  readonly ancoraAcionamento?: string;
  readonly titulo: string;
  readonly descricaoCurta: string;
  readonly textoBotaoConclusao: string;
  readonly mensagemConfirmacaoTitulo: string;
  readonly mensagemConfirmacaoCorpo: string;
  readonly etapaInicialId: string;
  readonly etapas: readonly EtapaMicrofluxo[];
  readonly regraCalculoComercial?: RegraCalculoComercialMicrofluxo;
  readonly ativo: boolean;
  readonly versaoPublicada?: number;
  readonly atualizadoEmIso: string;

  // Ponto de entrada na vitrine (Botão da Home)
  readonly ativoNaHome?: boolean;
  readonly rotuloBotaoHome?: string;
  readonly subtituloBotaoHome?: string;
  /** Título do modal/bottom sheet das ações de seção. */
  readonly tituloSecao?: string;
  readonly iconeBotaoHome?: string;
  readonly destaquePrimarioHome?: boolean;
  readonly animarBordaDestaque?: boolean;
  readonly animacaoDestaque?: AnimacaoDestaque;
  readonly corBrilhoBorda?: string;
  readonly ordemHome?: number;
}

export interface VersaoPublicadaMicrofluxo {
  readonly versao: number;
  readonly microfluxoId: string;
  readonly organizacaoId: string;
  readonly publicadoEmIso: string;
  readonly definicaoImutavel: DefinicaoMicrofluxo;
}
