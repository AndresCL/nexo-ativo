import type { AcervoPublicoVitrine } from "@/dominio/entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";

export const ORGANIZACAO_THE_CAKE_DREAMS_ID = "org-the-cake-dreams";
export const IDENTIFICADOR_PUBLICO_THE_CAKE_DREAMS = "thecakedreams";
export const EMAIL_ADMIN_THE_CAKE_DREAMS = "contato@thecakedreams.com.br";
export const WHATSAPP_THE_CAKE_DREAMS_NUMERO = "+55 22 99895-6040";
export const URL_WHATSAPP_ENCOMENDAS_THE_CAKE_DREAMS =
  "https://api.whatsapp.com/message/6BA6YYUFNOHRC1?autoload=1&app_absent=0";
export const URL_MAPS_THE_CAKE_DREAMS = "https://maps.app.goo.gl/5A3fYhoDGwdSaDEf7";
export const URL_IFOOD_BUZIOS_THE_CAKE_DREAMS =
  "https://www.ifood.com.br/delivery/armacao-dos-buzios-rj/the-cake-dreams---confeitaria-artesanal-centro/b6d8a22a-f599-4dac-b132-4428ccd052db";
export const URL_IFOOD_CABO_FRIO_THE_CAKE_DREAMS =
  "https://www.ifood.com.br/delivery/cabo-frio-rj/the-cake-dreams---shopping-park-lagos-parque-burle/6a099fa5-0797-485d-bb87-ae9ad625d664";

export const CARDAPIO_NATAL_2026_ID = "cardapio-natal-2026";
export const CARDAPIO_NATAL_2026_SLUG = "natal-2026";

const ATUALIZADO_EM_ISO = "2026-11-27T15:52:00.000Z";
const COR_PRIMARIA_THE_CAKE_DREAMS = "#f2d2d5";

const ACAO_ENCOMENDAS_WHATSAPP: DefinicaoMicrofluxo = {
  id: "acao-encomendas-whatsapp",
  organizacaoId: ORGANIZACAO_THE_CAKE_DREAMS_ID,
  tipoAcao: "link_externo",
  urlDestinoOpcional: URL_WHATSAPP_ENCOMENDAS_THE_CAKE_DREAMS,
  titulo: "Fazer Encomenda no WhatsApp",
  rotuloBotaoHome: "Fazer Encomenda no WhatsApp",
  subtituloBotaoHome: "Pedidos, encomendas de Natal e atendimento direto",
  iconeBotaoHome: "message-circle",
  destaquePrimarioHome: true,
  nivelDestaqueHome: "primario",
  animarBordaDestaque: true,
  animacaoDestaque: "brilho_interior",
  corBrilhoBorda: COR_PRIMARIA_THE_CAKE_DREAMS,
  larguraCardHome: "inteiro",
  ordemHome: 0,
  ativo: true,
  ativoNaHome: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  descricaoCurta: "",
  textoBotaoConclusao: "",
  mensagemConfirmacaoTitulo: "",
  mensagemConfirmacaoCorpo: "",
  etapaInicialId: "",
  etapas: [],
};

const ACAO_CARDAPIO_NATAL: DefinicaoMicrofluxo = {
  id: "acao-cardapio-natal-2026",
  organizacaoId: ORGANIZACAO_THE_CAKE_DREAMS_ID,
  tipoAcao: "cardapio",
  titulo: "Cardápio de Natal 2026",
  rotuloBotaoHome: "Cardápio de Natal 2026",
  subtituloBotaoHome: "Encomendas abertas · Veja todas as opções",
  iconeBotaoHome: "book-open",
  nivelDestaqueHome: "secundario",
  larguraCardHome: "inteiro",
  ordemHome: 1,
  ativo: true,
  ativoNaHome: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  descricaoCurta: "",
  textoBotaoConclusao: "",
  mensagemConfirmacaoTitulo: "",
  mensagemConfirmacaoCorpo: "",
  etapaInicialId: "",
  etapas: [],
};

const ACAO_IFOOD_BUZIOS: DefinicaoMicrofluxo = {
  id: "acao-ifood-buzios",
  organizacaoId: ORGANIZACAO_THE_CAKE_DREAMS_ID,
  tipoAcao: "link_externo",
  urlDestinoOpcional: URL_IFOOD_BUZIOS_THE_CAKE_DREAMS,
  titulo: "iFood · Búzios",
  rotuloBotaoHome: "iFood · Búzios",
  subtituloBotaoHome: "Delivery Centro",
  iconeBotaoHome: "shopping-bag",
  nivelDestaqueHome: "terciario",
  larguraCardHome: "metade",
  ordemHome: 2,
  ativo: true,
  ativoNaHome: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  descricaoCurta: "",
  textoBotaoConclusao: "",
  mensagemConfirmacaoTitulo: "",
  mensagemConfirmacaoCorpo: "",
  etapaInicialId: "",
  etapas: [],
};

const ACAO_IFOOD_CABO_FRIO: DefinicaoMicrofluxo = {
  id: "acao-ifood-cabo-frio",
  organizacaoId: ORGANIZACAO_THE_CAKE_DREAMS_ID,
  tipoAcao: "link_externo",
  urlDestinoOpcional: URL_IFOOD_CABO_FRIO_THE_CAKE_DREAMS,
  titulo: "iFood · Cabo Frio",
  rotuloBotaoHome: "iFood · Cabo Frio",
  subtituloBotaoHome: "Shopping Park Lagos",
  iconeBotaoHome: "shopping-bag",
  nivelDestaqueHome: "terciario",
  larguraCardHome: "metade",
  ordemHome: 3,
  ativo: true,
  ativoNaHome: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  descricaoCurta: "",
  textoBotaoConclusao: "",
  mensagemConfirmacaoTitulo: "",
  mensagemConfirmacaoCorpo: "",
  etapaInicialId: "",
  etapas: [],
};

export const VITRINE_THE_CAKE_DREAMS: ConteudoPaginaPublicada = {
  organizacaoId: ORGANIZACAO_THE_CAKE_DREAMS_ID,
  identificadorPublico: IDENTIFICADOR_PUBLICO_THE_CAKE_DREAMS,
  publicado: true,
  paginaAtiva: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  composicaoVisual: "imersivo",
  paletaId: "noite_mineral",
  corPersonalizadaHex: COR_PRIMARIA_THE_CAKE_DREAMS,
  tipografiaId: "contemporaneo_minimalista",
  identidade: {
    nomeExibicao: "The Cake Dreams",
    subtituloCurto: "Confeitaria artesanal em Búzios e Cabo Frio",
    formatoBordaLogotipo: "circulo",
    cidadeEstado: "Shopping Park Lagos · Cabo Frio & Búzios · RJ",
    urlMapaEnderecoOpcional: URL_MAPS_THE_CAKE_DREAMS,
    celularOpcional: WHATSAPP_THE_CAKE_DREAMS_NUMERO,
  },
  chamadaEditorial: {
    sobretituloOpcional: "Natal 2026 · Encomendas Abertas",
    tituloPrincipal: "Confeitaria artesanal para celebrar momentos inesquecíveis.",
    descricaoCurta:
      "Bolos, sobremesas e presentes artesanais feitos com carinho em Búzios e no Shopping Park Lagos, em Cabo Frio.",
  },
  chamadasEditoriaisAdicionais: [],
  midiaFundo: {
    tipo: "video",
    urlPrincipal: "",
    textoAlternativo: "Vídeo de apresentação dos doces e bolos artesanais da The Cake Dreams.",
    pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
    pontoFocalMobile: { xPercentual: 50, yPercentual: 50 },
    intensidadeVeloEscuro: "intenso",
  },
  acoesPrincipais: [
    {
      id: ACAO_ENCOMENDAS_WHATSAPP.id,
      rotulo: ACAO_ENCOMENDAS_WHATSAPP.rotuloBotaoHome!,
      subtituloDiscreto: ACAO_ENCOMENDAS_WHATSAPP.subtituloBotaoHome,
      tipoDestino: "link_externo",
      destino: URL_WHATSAPP_ENCOMENDAS_THE_CAKE_DREAMS,
      destaquePrincipal: true,
      nivelDestaque: "primario",
      animarBordaDestaque: true,
      animacaoDestaque: "brilho_interior",
      corBrilhoBorda: COR_PRIMARIA_THE_CAKE_DREAMS,
      larguraCard: "inteiro",
      icone: "message-circle",
    },
    {
      id: ACAO_CARDAPIO_NATAL.id,
      rotulo: ACAO_CARDAPIO_NATAL.rotuloBotaoHome!,
      subtituloDiscreto: ACAO_CARDAPIO_NATAL.subtituloBotaoHome,
      tipoDestino: "cardapio",
      destino: "#cardapio",
      nivelDestaque: "secundario",
      larguraCard: "inteiro",
      icone: "book-open",
    },
    {
      id: ACAO_IFOOD_BUZIOS.id,
      rotulo: ACAO_IFOOD_BUZIOS.rotuloBotaoHome!,
      subtituloDiscreto: ACAO_IFOOD_BUZIOS.subtituloBotaoHome,
      tipoDestino: "link_externo",
      destino: URL_IFOOD_BUZIOS_THE_CAKE_DREAMS,
      nivelDestaque: "terciario",
      larguraCard: "metade",
      icone: "shopping-bag",
    },
    {
      id: ACAO_IFOOD_CABO_FRIO.id,
      rotulo: ACAO_IFOOD_CABO_FRIO.rotuloBotaoHome!,
      subtituloDiscreto: ACAO_IFOOD_CABO_FRIO.subtituloBotaoHome,
      tipoDestino: "link_externo",
      destino: URL_IFOOD_CABO_FRIO_THE_CAKE_DREAMS,
      nivelDestaque: "terciario",
      larguraCard: "metade",
      icone: "shopping-bag",
    },
  ],
  redesSociais: [
    {
      id: "rede-ig-the-cake-dreams",
      rede: "instagram",
      url: "https://www.instagram.com/thecakedreams/",
      rotuloAcessivel: "Instagram oficial The Cake Dreams",
    },
    {
      id: "rede-whatsapp-the-cake-dreams",
      rede: "whatsapp",
      url: URL_WHATSAPP_ENCOMENDAS_THE_CAKE_DREAMS,
      rotuloAcessivel: "WhatsApp oficial The Cake Dreams",
    },
  ],
  obrasDestaqueGaleria: [],
  seo: {
    tituloSeo: "The Cake Dreams — Confeitaria Artesanal em Búzios e Cabo Frio",
    descricaoSeo:
      "Confeitaria artesanal em Búzios e Cabo Frio (Shopping Park Lagos). Cardápio de Natal 2026 com encomendas abertas e delivery pelo iFood.",
    indexavel: true,
  },
};

export const ACERVO_THE_CAKE_DREAMS: AcervoPublicoVitrine = {
  servicos: [],
  produtos: [],
  projetosPortfolio: [],
  profissionais: [],
  microfluxos: [
    ACAO_ENCOMENDAS_WHATSAPP,
    ACAO_CARDAPIO_NATAL,
    ACAO_IFOOD_BUZIOS,
    ACAO_IFOOD_CABO_FRIO,
  ],
  videos: [],
};
