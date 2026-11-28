import type { AcervoPublicoVitrine, ProdutoCatalogo } from "@/dominio/entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import {
  converterEtapaParaLivre,
  criarEtapaDadosRetorno,
} from "@/dominio/microfluxos/composicaoEtapaLivre";
import { listarCamposResumoConclusao } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import type {
  DefinicaoMicrofluxo,
  EtapaMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";

export const ORGANIZACAO_LAGOS_RACING_ID = "org-lagos-racing-bike-shop";
export const IDENTIFICADOR_PUBLICO_LAGOS_RACING = "lagosracing";
export const EMAIL_ADMIN_LAGOS_RACING = "contato@lagosracingbikeshop.com.br";
export const WHATSAPP_LAGOS_RACING_NUMERO = "+55 22 98822-9609";
export const WHATSAPP_LAGOS_RACING_DIGITOS = "5522988229609";
export const URL_WHATSAPP_LAGOS_RACING = "https://wa.me/5522988229609";
export const URL_MAPS_LAGOS_RACING = "https://maps.app.goo.gl/wCQhvhpBgB3FAdjBA";

export const PRODUTO_STUMPJUMPER_ID = "prod-lagos-specialized-stumpjumper-l";
export const PRODUTO_CAPACETE_LAZER_ID = "prod-lagos-capacete-lazer-lupo-finch";
export const PRODUTO_STREET_GO_S12_ID = "prod-lagos-street-go-s12-eletrica";

const ATUALIZADO_EM_ISO = "2026-11-26T13:45:00.000Z";

function criarEtapaEscolhaUnica(
  id: string,
  titulo: string,
  opcoes: readonly {
    readonly id: string;
    readonly rotulo: string;
    readonly descricaoCurta?: string;
    readonly proximaEtapaIdOpcional: string;
  }[],
  subtituloOpcional?: string,
): EtapaMicrofluxo {
  return converterEtapaParaLivre({
    id,
    titulo,
    ...(subtituloOpcional ? { subtituloOpcional } : {}),
    tipoEtapa: "selecao_unica",
    obrigatoria: true,
    opcoes: opcoes.map((opcao) => ({
      id: opcao.id,
      rotulo: opcao.rotulo,
      ...(opcao.descricaoCurta ? { descricaoCurta: opcao.descricaoCurta } : {}),
      proximaEtapaIdOpcional: opcao.proximaEtapaIdOpcional,
    })),
  });
}

function anexarConclusaoWhatsappPadrao(
  fluxoSemConclusao: DefinicaoMicrofluxo,
  rotuloBotaoWhatsapp: string,
): DefinicaoMicrofluxo {
  const campos = listarCamposResumoConclusao(fluxoSemConclusao).filter(
    (item) => item.etapaId !== "etapa-contato",
  );

  return {
    ...fluxoSemConclusao,
    conclusao: {
      acoes: [
        {
          tipo: "whatsapp",
          rotulo: rotuloBotaoWhatsapp,
          numeroOpcional: WHATSAPP_LAGOS_RACING_NUMERO,
        },
        {
          tipo: "home",
          rotulo: "Voltar ao início",
        },
      ],
      resumo: {
        ativo: true,
        campos,
        incluirDemonstrativo: false,
      },
      camposWhatsapp: campos,
    },
  };
}

const FLUXO_AGENDAR_REVISAO: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-agendar-revisao",
    organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-agendar-revisao",
    titulo: "Agendar Revisão de Bike",
    rotuloBotaoHome: "Agendar Revisão de Bike",
    subtituloBotaoHome: "Manutenção Básica, Média ou Geral · Mecânica Especializada",
    iconeBotaoHome: "wrench",
    destaquePrimarioHome: true,
    animarBordaDestaque: true,
    corBrilhoBorda: "#22C55E",
    ordemHome: 0,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Escolha o nível de manutenção ideal para manter sua bike segura, regulada e pronta para o próximo pedal.",
    textoBotaoConclusao: "Solicitar agendamento",
    mensagemConfirmacaoTitulo: "Revisão encaminhada!",
    mensagemConfirmacaoCorpo:
      "Recebemos sua solicitação na oficina Lagos Racing. Clique abaixo para abrir o WhatsApp com o resumo pronto e confirmar o melhor horário.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-nivel-revisao",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-nivel-revisao",
        "Qual revisão sua bike precisa?",
        [
          {
            id: "revisao-basica",
            rotulo: "Revisão Básica",
            descricaoCurta: "Limpeza, lubrificação e regulagem essencial para o pedal",
            proximaEtapaIdOpcional: "etapa-urgencia-revisao",
          },
          {
            id: "revisao-media",
            rotulo: "Revisão Média",
            descricaoCurta: "Regulagem completa de câmbio, freios e inspeção geral",
            proximaEtapaIdOpcional: "etapa-urgencia-revisao",
          },
          {
            id: "revisao-geral",
            rotulo: "Revisão Geral",
            descricaoCurta: "Desmontagem, lubrificação completa e alto padrão técnico",
            proximaEtapaIdOpcional: "etapa-urgencia-revisao",
          },
          {
            id: "revisao-avaliacao",
            rotulo: "Quero avaliação da oficina",
            descricaoCurta: "Não sei qual escolher — preciso de recomendação técnica",
            proximaEtapaIdOpcional: "etapa-urgencia-revisao",
          },
        ],
        "Três opções de manutenção pensadas para o seu ritmo de pedal.",
      ),
      criarEtapaEscolhaUnica(
        "etapa-urgencia-revisao",
        "Para quando você precisa da bike?",
        [
          {
            id: "urgencia-fim-de-semana",
            rotulo: "Para este fim de semana",
            descricaoCurta: "Prioridade para o próximo pedal",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "urgencia-esta-semana",
            rotulo: "Durante esta semana",
            descricaoCurta: "Agendamento flexível na oficina",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "urgencia-orcamento",
            rotulo: "Quero orçamento primeiro",
            descricaoCurta: "Sem pressa — quero alinhar valores e prazos",
            proximaEtapaIdOpcional: "etapa-contato",
          },
        ],
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Agendar no WhatsApp",
);

const FLUXO_ESCOLHER_BIKE: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-escolher-bike",
    organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-escolher-bike",
    titulo: "Escolher Bike Nova ou Seminova",
    rotuloBotaoHome: "Escolher Bike Nova ou Seminova",
    subtituloBotaoHome: "Revenda OGGI · Seminovas revisadas · Bikes elétricas",
    iconeBotaoHome: "bike",
    ordemHome: 2,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Conte em 2 toques o que você procura para indicarmos os modelos certos disponíveis na loja.",
    textoBotaoConclusao: "Consultar modelos",
    mensagemConfirmacaoTitulo: "Consulta enviada!",
    mensagemConfirmacaoCorpo:
      "Nossa equipe recebeu seu perfil de pedal. Abra o WhatsApp abaixo com o resumo pronto para receber fotos e condições.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-tipo-bike",
    etapas: [
      criarEtapaEscolhaUnica("etapa-tipo-bike", "O que você procura hoje?", [
        {
          id: "bike-nova-oggi",
          rotulo: "Bike nova (Revenda OGGI)",
          descricaoCurta: "Modelos novos com garantia e montagem especializada",
          proximaEtapaIdOpcional: "etapa-perfil-pedal",
        },
        {
          id: "bike-seminova-eletrica",
          rotulo: "Bike seminova ou elétrica",
          descricaoCurta: "Selecionadas, revisadas e prontas para uso",
          proximaEtapaIdOpcional: "etapa-perfil-pedal",
        },
        {
          id: "bike-indicacao",
          rotulo: "Quero indicação para meu perfil",
          descricaoCurta: "Ajuda da equipe para escolher o tamanho e modelo ideais",
          proximaEtapaIdOpcional: "etapa-perfil-pedal",
        },
      ]),
      criarEtapaEscolhaUnica("etapa-perfil-pedal", "Qual é o seu momento no pedal?", [
        {
          id: "perfil-iniciante",
          rotulo: "Primeira bike / Lazer",
          descricaoCurta: "Conforto e praticidade para começar bem",
          proximaEtapaIdOpcional: "etapa-contato",
        },
        {
          id: "perfil-upgrade",
          rotulo: "Upgrade da minha bike atual",
          descricaoCurta: "Mais leveza, precisão e componentes superiores",
          proximaEtapaIdOpcional: "etapa-contato",
        },
        {
          id: "perfil-performance",
          rotulo: "Performance / Trilha ou Estrada",
          descricaoCurta: "Alto rendimento em MTB, Speed ou Elétrica",
          proximaEtapaIdOpcional: "etapa-contato",
        },
      ]),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Consultar no WhatsApp",
);

const FLUXO_PECAS_ACESSORIOS: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-pecas-acessorios",
    organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-pecas-acessorios",
    titulo: "Peças, Acessórios & Mecânica",
    rotuloBotaoHome: "Peças, Acessórios & Mecânica",
    subtituloBotaoHome: "Revenda SRAM · Capacetes · Diagnóstico técnico",
    iconeBotaoHome: "settings",
    ordemHome: 3,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Direcione sua necessidade em um toque para agilizar o atendimento com nossa oficina e balcão.",
    textoBotaoConclusao: "Enviar solicitação",
    mensagemConfirmacaoTitulo: "Solicitação recebida!",
    mensagemConfirmacaoCorpo:
      "Nossa equipe já tem seu direcionamento. Clique abaixo para falar direto no WhatsApp com o resumo pronto.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-tipo-demanda",
    etapas: [
      criarEtapaEscolhaUnica("etapa-tipo-demanda", "Como podemos ajudar no seu pedal?", [
        {
          id: "demanda-pecas-sram",
          rotulo: "Peças e transmissão (SRAM / componentes)",
          descricaoCurta: "Troca de relação, freios, suspensão e componentes",
          proximaEtapaIdOpcional: "etapa-contato",
        },
        {
          id: "demanda-acessorios",
          rotulo: "Capacetes e acessórios",
          descricaoCurta: "Segurança, conforto e equipamento para o pedal",
          proximaEtapaIdOpcional: "etapa-contato",
        },
        {
          id: "demanda-diagnostico",
          rotulo: "Diagnóstico ou ajuste mecânico",
          descricaoCurta: "Barulhos, regulagem fina ou revisão pontual",
          proximaEtapaIdOpcional: "etapa-contato",
        },
      ]),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Falar com a oficina no WhatsApp",
);

const ACAO_SECAO_PRODUTOS: DefinicaoMicrofluxo = {
  id: "acao-produtos-destaque",
  organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
  tipoAcao: "secao_produtos",
  titulo: "Ofertas & Destaques da Loja",
  rotuloBotaoHome: "Ofertas & Destaques da Loja",
  subtituloBotaoHome: "Bikes seminovas, elétricas e acessórios revisados",
  tituloSecao: "Ofertas & Destaques da Loja",
  ordemHome: 1,
  ativo: true,
  ativoNaHome: true,
  modoExibicaoColecao: "carrossel",
  configuracaoCtaAcervo: {
    tipoAcao: "whatsapp",
    rotuloBotao: "Tenho interesse no WhatsApp",
  },
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  descricaoCurta: "",
  textoBotaoConclusao: "",
  mensagemConfirmacaoTitulo: "",
  mensagemConfirmacaoCorpo: "",
  etapaInicialId: "",
  etapas: [],
};

const ACAO_SECAO_VIDEOS: DefinicaoMicrofluxo = {
  id: "acao-videos-lagos-racing",
  organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
  tipoAcao: "secao_videos",
  titulo: "Vídeos da Lagos Racing",
  rotuloBotaoHome: "Vídeos da Lagos Racing",
  tituloSecao: "Vídeos da Lagos Racing",
  ordemHome: 4,
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

export const PRODUTOS_LAGOS_RACING: readonly ProdutoCatalogo[] = [
  {
    id: PRODUTO_STUMPJUMPER_ID,
    organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
    nome: "Specialized Stumpjumper — Tam. L",
    resumo:
      "Bike full suspension em carbono, revisada pela nossa mecânica especializada e pronta para uso. Produto original com garantia de procedência e envio para todo o Brasil.",
    categoria: "Bikes Seminovas",
    precoCentavos: 799000,
    disponibilidade: "disponivel",
    especificacoesCurtas: [
      "Tamanho L · Quadro em Carbono",
      "Shock traseiro Fox Evolution",
      "Freios Guide 4 pistões",
      "Rodas Roval",
      "Revisada e pronta para uso",
      "Envio para todo o Brasil · Garantia de procedência",
    ],
    textoAlternativoImagem: "Bike Specialized Stumpjumper tamanho L em carbono na Lagos Racing.",
    pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
    ordemExibicao: 0,
    ativo: true,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
  },
  {
    id: PRODUTO_STREET_GO_S12_ID,
    organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
    nome: "Street Go S12 — 100% Elétrica",
    resumo:
      "Estilo, potência e liberdade para o seu dia a dia. Bike 100% elétrica com design moderno, conforto e economia — parcelamento em até 18x no cartão de crédito.",
    categoria: "Bikes Elétricas",
    precoCentavos: 699000,
    disponibilidade: "disponivel",
    especificacoesCurtas: [
      "100% Elétrica · Até 18x no cartão",
      "Velocidade até 45 km/h",
      "Autonomia de até 60 km",
      "Bateria de alta performance",
      "Freios a disco dianteiro e traseiro",
      "Farol de LED alta visibilidade",
    ],
    textoAlternativoImagem: "Bike elétrica Street Go S12 verde na Lagos Racing.",
    pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
    ordemExibicao: 1,
    ativo: true,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
  },
  {
    id: PRODUTO_CAPACETE_LAZER_ID,
    organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
    nome: "Capacete Lazer Lupo & Finch KinetiCore",
    resumo:
      "Segurança, estilo e tecnologia KinetiCore em cada pedalada. Disponível nos modelos Lupo (55–61 cm) e Finch (50–56 cm), leve, ventilado e pronto para todos os tipos de trilha.",
    categoria: "Capacetes & Acessórios",
    precoCentavos: 39900,
    disponibilidade: "disponivel",
    especificacoesCurtas: [
      "Tecnologia KinetiCore",
      "Lupo (55–61 cm) e Finch (50–56 cm)",
      "Proteção avançada e ventilação inteligente",
      "Leve, confortável e ajuste fácil",
      "Para todos os tipos de trilha",
    ],
    textoAlternativoImagem: "Capacetes Lazer Lupo e Finch KinetiCore na Lagos Racing.",
    pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
    ordemExibicao: 2,
    ativo: true,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
  },
];

export const VIDEOS_YOUTUBE_LAGOS_RACING = [
  {
    id: "video-lagos-01",
    url: "https://www.youtube.com/watch?v=zxg1v-nnROI",
    titulo: "Lagos Racing Bike Shop · Destaque 1",
  },
  {
    id: "video-lagos-02",
    url: "https://www.youtube.com/watch?v=-6CffZ8Lev0",
    titulo: "Lagos Racing Bike Shop · Destaque 2",
  },
  {
    id: "video-lagos-03",
    url: "https://www.youtube.com/watch?v=9bgeyllIH_o",
    titulo: "Lagos Racing Bike Shop · Destaque 3",
  },
] as const;

export const VITRINE_LAGOS_RACING: ConteudoPaginaPublicada = {
  organizacaoId: ORGANIZACAO_LAGOS_RACING_ID,
  identificadorPublico: IDENTIFICADOR_PUBLICO_LAGOS_RACING,
  publicado: true,
  paginaAtiva: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  composicaoVisual: "imersivo",
  paletaId: "titanio_onix",
  corPersonalizadaHex: "#22C55E",
  tipografiaId: "contemporaneo_minimalista",
  identidade: {
    nomeExibicao: "Lagos Racing Bike Shop",
    subtituloCurto: "Bike, Peças & Mecânica Especializada · Revenda OGGI | SRAM",
    formatoBordaLogotipo: "suave",
    cidadeEstado: "Cabo Frio · RJ",
    urlMapaEnderecoOpcional: URL_MAPS_LAGOS_RACING,
    celularOpcional: WHATSAPP_LAGOS_RACING_NUMERO,
  },
  chamadaEditorial: {
    sobretituloOpcional: "Revenda OGGI | SRAM · Cabo Frio",
    tituloPrincipal: "Sua bike do jeito certo começa aqui.",
    descricaoCurta:
      "Venda de bikes novas e seminovas, peças SRAM e mecânica especializada de alto padrão para o seu pedal.",
  },
  chamadasEditoriaisAdicionais: [],
  midiaFundo: {
    tipo: "degradado",
    degradadoOpcional: {
      corInicial: "#070B09",
      corFinal: "#0E1A13",
      direcao: "diagonal_inferior_direita",
    },
    urlPrincipal: "",
    textoAlternativo: "Fundo escuro esportivo da Lagos Racing Bike Shop.",
    pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
    pontoFocalMobile: { xPercentual: 50, yPercentual: 50 },
    intensidadeVeloEscuro: "suave",
    efeitoCantos: "dots",
    opacidadeDotsCantos: 28,
    tomDotsCantos: "destaque",
  },
  acoesPrincipais: [
    {
      id: "acao-agendar-revisao",
      rotulo: "Agendar Revisão de Bike",
      subtituloDiscreto: "Manutenção Básica, Média ou Geral · Mecânica Especializada",
      tipoDestino: "microfluxo",
      destino: "#fluxo-agendar-revisao",
      destaquePrincipal: true,
      animarBordaDestaque: true,
      corBrilhoBorda: "#22C55E",
      icone: "wrench",
    },
    {
      id: "acao-produtos-destaque",
      rotulo: "Ofertas & Destaques da Loja",
      subtituloDiscreto: "Bikes seminovas, elétricas e acessórios revisados",
      tituloSecao: "Ofertas & Destaques da Loja",
      tipoDestino: "secao_produtos",
      destino: "#produtos",
      modoExibicaoColecao: "carrossel",
      configuracaoCtaAcervo: {
        tipoAcao: "whatsapp",
        rotuloBotao: "Tenho interesse no WhatsApp",
      },
    },
    {
      id: "acao-escolher-bike",
      rotulo: "Escolher Bike Nova ou Seminova",
      subtituloDiscreto: "Revenda OGGI · Seminovas revisadas · Bikes elétricas",
      tipoDestino: "microfluxo",
      destino: "#fluxo-escolher-bike",
      icone: "bike",
    },
    {
      id: "acao-pecas-acessorios",
      rotulo: "Peças, Acessórios & Mecânica",
      subtituloDiscreto: "Revenda SRAM · Capacetes · Diagnóstico técnico",
      tipoDestino: "microfluxo",
      destino: "#fluxo-pecas-acessorios",
      icone: "settings",
    },
    {
      id: "acao-videos-lagos-racing",
      rotulo: "Vídeos da Lagos Racing",
      tituloSecao: "Vídeos da Lagos Racing",
      tipoDestino: "secao_videos",
      destino: "#videos",
    },
  ],
  redesSociais: [
    {
      id: "rede-whatsapp-lagos-racing",
      rede: "whatsapp",
      url: URL_WHATSAPP_LAGOS_RACING,
      rotuloAcessivel: "WhatsApp oficial Lagos Racing Bike Shop",
    },
    {
      id: "rede-ig-lagos-racing",
      rede: "instagram",
      url: "https://www.instagram.com/lagosracing_bikeshop/",
      rotuloAcessivel: "Instagram oficial Lagos Racing Bike Shop",
    },
    {
      id: "rede-fb-lagos-racing",
      rede: "facebook",
      url: "https://www.facebook.com/lagosracing/",
      rotuloAcessivel: "Facebook oficial Lagos Racing Bike Shop",
    },
  ],
  obrasDestaqueGaleria: [],
  seo: {
    tituloSeo: "Lagos Racing Bike Shop — Bikes, Peças e Mecânica Especializada em Cabo Frio",
    descricaoSeo:
      "Revenda OGGI e SRAM em Cabo Frio. Venda de bikes novas, seminovas e elétricas, peças, acessórios e revisão de bike com mecânica especializada.",
    indexavel: true,
  },
};

export const ACERVO_LAGOS_RACING: AcervoPublicoVitrine = {
  servicos: [],
  produtos: PRODUTOS_LAGOS_RACING,
  projetosPortfolio: [],
  profissionais: [],
  microfluxos: [
    FLUXO_AGENDAR_REVISAO,
    ACAO_SECAO_PRODUTOS,
    FLUXO_ESCOLHER_BIKE,
    FLUXO_PECAS_ACESSORIOS,
    ACAO_SECAO_VIDEOS,
  ],
  videos: VIDEOS_YOUTUBE_LAGOS_RACING,
  modoExibicaoVideos: "carrossel",
  autoplayVideos: false,
  ocultarTituloVideos: false,
};

