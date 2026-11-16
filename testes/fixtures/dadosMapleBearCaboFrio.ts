import type { AcervoPublicoVitrine } from "@/dominio/entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";

const ORGANIZACAO_ID = "org-maplebear-cabofrio";
const IDENTIFICADOR_PUBLICO = "maplebear-cabofrio";
const ATUALIZADO_EM_ISO = "2026-11-14T22:00:00.000Z";

const URL_EXPERIENCE_DAY =
  "https://www.maplebear.com.br/pt/experience-day/?utm_source=experience_day&utm_campaign=outubro&utm_medium=social&utm_content=link_in_bio";
const URL_LOCALIZACAO = "https://maps.app.goo.gl/yxLNtzAXmw1ugBnD9";
const URL_WHATSAPP = "http://wa.me/5522992931322";
const URL_THE_BEAR_MAGAZINE =
  "https://drive.google.com/drive/folders/1lPkNsZgbmAhAhUlaHzWz8Oot1EFoGYd_";
const URL_MAPLE_BEAR_DROPS =
  "https://youtube.com/playlist?list=PLeoVRIk5KWfgCETcURXTk93LCoe2JVWUy&si=OUVZz28C6kvfbOzT";
const URL_PODCAST_TALKS =
  "https://open.spotify.com/show/6zZyxGsTYtHtWQxHHjWhsV";

export const VITRINE_MAPLE_BEAR_CABO_FRIO: ConteudoPaginaPublicada = {
  organizacaoId: ORGANIZACAO_ID,
  identificadorPublico: IDENTIFICADOR_PUBLICO,
  publicado: true,
  paginaAtiva: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  composicaoVisual: "imersivo",
  paletaId: "noite_mineral",
  tipografiaId: "contemporaneo_minimalista",
  identidade: {
    nomeExibicao: "Maple Bear Cabo Frio",
    subtituloCurto: "Ensino Bilíngue Canadense · Educação Infantil e Fundamental",
    urlLogotipoOpcional:
      "https://scontent.fsdu8-1.fna.fbcdn.net/v/t39.30808-1/446908041_122094768650357265_3846476526013331243_n.jpg?stp=dst-jpg_tt6&cstp=mx600x600&ctp=s480x480&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=aj2Fk0oxreQQ7kNvwHHIUBs&_nc_oc=Adrlk1kSDf0T_Egpoje4ZfEl_-AISTCj0ydMD-nstXCMYTnwntNT1-BOOmTVZOrdlp9d35HK6WD2Xf-_fGzdU7mq&_nc_zt=24&_nc_ht=scontent.fsdu8-1.fna&_nc_gid=5l4VOVpLzwPx4k2J-NsFnw&_nc_ss=7b2a8&oh=00_AQQcX48SSEBSSs8aNd7-EdLrhsmM5OkTPMxbuvzO6mIIlQ&oe=6AFEE923",
    cidadeEstado: "Cabo Frio · RJ · Palmeiras",
  },
  chamadaEditorial: {
    sobretituloOpcional: "Ensino Bilíngue Canadense em Cabo Frio",
    tituloPrincipal: "Experience Day Maple Bear",
    descricaoCurta:
      "Agende uma visita e conheça a metodologia canadense de ensino bilíngue em Cabo Frio.",
  },
  chamadasEditoriaisAdicionais: [
    {
      sobretituloOpcional: "Comunidade & Projetos Pedagógicos",
      tituloPrincipal: "The Bear Magazine 2026",
      descricaoCurta:
        "Confira as novidades, projetos pedagógicos e vivências da nossa comunidade escolar.",
    },
  ],
  midiaFundo: {
    tipo: "imagem",
    urlPrincipal:
      "https://cdn.beacons.ai/user_content/lCl1YCo3JkhJX6E6jfWk9r5Ftxn1/backgrounds/home/background_maplebear.cabofrio.png?t=1722532796454",
    textoAlternativo: "Ambiente escolar bilíngue Maple Bear Cabo Frio.",
    pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
    pontoFocalMobile: { xPercentual: 50, yPercentual: 50 },
    intensidadeVeloEscuro: "intenso",
  },
  acoesPrincipais: [
    {
      id: "acao-experience-day",
      rotulo: "Experience Day - Maple Bear",
      subtituloDiscreto:
        "Agende uma visita e conheça a escola Maple Bear - Ensino Canadense no Brasil.",
      tipoDestino: "link_externo",
      destino: URL_EXPERIENCE_DAY,
      destaquePrincipal: true,
    },
    {
      id: "acao-nossa-localizacao",
      rotulo: "NOSSA LOCALIZAÇÃO",
      subtituloDiscreto: "Rua Paulo Burle, 170 - Palmeiras, Cabo Frio - RJ",
      tipoDestino: "link_externo",
      destino: URL_LOCALIZACAO,
    },
    {
      id: "acao-agende-sua-visita",
      rotulo: "AGENDE SUA VISITA",
      subtituloDiscreto: "Atendimento direto pelo WhatsApp (22) 99293-1322",
      tipoDestino: "link_externo",
      destino: URL_WHATSAPP,
    },
    {
      id: "acao-the-bear-magazine",
      rotulo: "THE BEAR MAGAZINE 2026",
      subtituloDiscreto: "Revista oficial da unidade no Google Drive",
      tipoDestino: "link_externo",
      destino: URL_THE_BEAR_MAGAZINE,
    },
    {
      id: "acao-maple-bear-drops",
      rotulo: "Maple Bear Drops",
      subtituloDiscreto: "Playlist oficial de conteúdos no YouTube",
      tipoDestino: "link_externo",
      destino: URL_MAPLE_BEAR_DROPS,
    },
    {
      id: "acao-podcast-talks",
      rotulo: "PodCast Maple Bear Talks",
      subtituloDiscreto: "Episódios sobre educação bilíngue no Spotify",
      tipoDestino: "link_externo",
      destino: URL_PODCAST_TALKS,
    },
    {
      id: "acao-agende-visita-experience",
      rotulo: "Agende uma visita - Maple Bear",
      subtituloDiscreto:
        "Agende uma visita e conheça a escola Maple Bear - Ensino Canadense no Brasil.",
      tipoDestino: "link_externo",
      destino: URL_EXPERIENCE_DAY,
    },
  ],
  canaisContato: {
    whatsapp: "5522992931322",
    instagram: "maplebear.cabofrio",
    enderecoTexto: "Rua Paulo Burle, 170 - Palmeiras, Cabo Frio - RJ",
    urlMapa: URL_LOCALIZACAO,
    horarioAtendimento: "Segunda a Sexta · 07h30 às 18h00",
  },
  redesSociais: [
    {
      id: "rede-instagram-maplebear",
      rede: "instagram",
      url: "https://instagram.com/maplebear.cabofrio",
      rotulo: "@maplebear.cabofrio",
    },
  ],
  obrasDestaqueGaleria: [],
  seo: {
    tituloSeo: "Maple Bear Cabo Frio — Ensino Bilíngue Canadense",
    descricaoSeo:
      "Agende sua visita, acesse a localização, The Bear Magazine 2026, Maple Bear Drops e Podcast Maple Bear Talks.",
    indexavel: true,
  },
};

export const ACERVO_MAPLE_BEAR_CABO_FRIO: AcervoPublicoVitrine = {
  servicos: [
    {
      id: "srv-maplebear-infantil",
      organizacaoId: ORGANIZACAO_ID,
      nome: "Educação Infantil Bilíngue",
      resumo:
        "Imersão natural no inglês desde os primeiros anos com metodologia canadense centrada no aluno.",
      categoria: "Educação Infantil",
      ativo: true,
      ordemExibicao: 0,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-maplebear-fundamental",
      organizacaoId: ORGANIZACAO_ID,
      nome: "Ensino Fundamental",
      resumo:
        "Desenvolvimento acadêmico bilíngue com pensamento crítico, investigação científica e fluência.",
      categoria: "Ensino Fundamental",
      ativo: true,
      ordemExibicao: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
  ],
  produtos: [],
  projetosPortfolio: [],
  profissionais: [],
  microfluxos: [
    {
      id: "acao-experience-day",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "link_externo",
      urlDestinoOpcional: URL_EXPERIENCE_DAY,
      titulo: "Experience Day - Maple Bear",
      rotuloBotaoHome: "Experience Day - Maple Bear",
      subtituloBotaoHome:
        "Agende uma visita e conheça a escola Maple Bear - Ensino Canadense no Brasil.",
      iconeBotaoHome: "sparkles",
      ordemHome: 0,
      ativo: true,
      ativoNaHome: true,
      versaoPublicada: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
      etapas: [],
      etapaInicialId: "",
      mensagemConfirmacaoTitulo: "",
      mensagemConfirmacaoCorpo: "",
    },
    {
      id: "acao-nossa-localizacao",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "link_externo",
      urlDestinoOpcional: URL_LOCALIZACAO,
      titulo: "NOSSA LOCALIZAÇÃO",
      rotuloBotaoHome: "NOSSA LOCALIZAÇÃO",
      subtituloBotaoHome: "Rua Paulo Burle, 170 - Palmeiras, Cabo Frio - RJ",
      iconeBotaoHome: "map-pin",
      ordemHome: 1,
      ativo: true,
      ativoNaHome: true,
      versaoPublicada: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
      etapas: [],
      etapaInicialId: "",
      mensagemConfirmacaoTitulo: "",
      mensagemConfirmacaoCorpo: "",
    },
    {
      id: "acao-agende-sua-visita",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "link_externo",
      urlDestinoOpcional: URL_WHATSAPP,
      titulo: "AGENDE SUA VISITA",
      rotuloBotaoHome: "AGENDE SUA VISITA",
      subtituloBotaoHome: "Atendimento direto pelo WhatsApp (22) 99293-1322",
      iconeBotaoHome: "message-circle",
      ordemHome: 2,
      ativo: true,
      ativoNaHome: true,
      versaoPublicada: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
      etapas: [],
      etapaInicialId: "",
      mensagemConfirmacaoTitulo: "",
      mensagemConfirmacaoCorpo: "",
    },
    {
      id: "acao-the-bear-magazine",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "link_externo",
      urlDestinoOpcional: URL_THE_BEAR_MAGAZINE,
      titulo: "THE BEAR MAGAZINE 2026",
      rotuloBotaoHome: "THE BEAR MAGAZINE 2026",
      subtituloBotaoHome: "Revista oficial da unidade no Google Drive",
      iconeBotaoHome: "book",
      ordemHome: 3,
      ativo: true,
      ativoNaHome: true,
      versaoPublicada: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
      etapas: [],
      etapaInicialId: "",
      mensagemConfirmacaoTitulo: "",
      mensagemConfirmacaoCorpo: "",
    },
    {
      id: "acao-maple-bear-drops",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "link_externo",
      urlDestinoOpcional: URL_MAPLE_BEAR_DROPS,
      titulo: "Maple Bear Drops",
      rotuloBotaoHome: "Maple Bear Drops",
      subtituloBotaoHome: "Playlist oficial de conteúdos no YouTube",
      iconeBotaoHome: "video",
      ordemHome: 4,
      ativo: true,
      ativoNaHome: true,
      versaoPublicada: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
      etapas: [],
      etapaInicialId: "",
      mensagemConfirmacaoTitulo: "",
      mensagemConfirmacaoCorpo: "",
    },
    {
      id: "acao-podcast-talks",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "link_externo",
      urlDestinoOpcional: URL_PODCAST_TALKS,
      titulo: "PodCast Maple Bear Talks",
      rotuloBotaoHome: "PodCast Maple Bear Talks",
      subtituloBotaoHome: "Episódios sobre educação bilíngue no Spotify",
      iconeBotaoHome: "headphones",
      ordemHome: 5,
      ativo: true,
      ativoNaHome: true,
      versaoPublicada: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
      etapas: [],
      etapaInicialId: "",
      mensagemConfirmacaoTitulo: "",
      mensagemConfirmacaoCorpo: "",
    },
    {
      id: "acao-agende-visita-experience",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "link_externo",
      urlDestinoOpcional: URL_EXPERIENCE_DAY,
      titulo: "Agende uma visita - Maple Bear",
      rotuloBotaoHome: "Agende uma visita - Maple Bear",
      subtituloBotaoHome:
        "Agende uma visita e conheça a escola Maple Bear - Ensino Canadense no Brasil.",
      iconeBotaoHome: "calendar",
      ordemHome: 6,
      ativo: true,
      ativoNaHome: true,
      versaoPublicada: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
      etapas: [],
      etapaInicialId: "",
      mensagemConfirmacaoTitulo: "",
      mensagemConfirmacaoCorpo: "",
    },
    {
      id: "fluxo-agendar-visita",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "microfluxo",
      titulo: "Agendar Visita / Experience Day",
      rotuloBotaoHome: "Agendar Visita / Experience Day",
      subtituloBotaoHome:
        "Escolha o segmento e deixe seu contato para agendar uma visita à unidade.",
      iconeBotaoHome: "calendar",
      ordemHome: 7,
      ativo: true,
      ativoNaHome: false,
      versaoPublicada: 1,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
      etapaInicialId: "etapa-segmento",
      etapas: [
        {
          id: "etapa-segmento",
          tipoEtapa: "selecao_unica",
          titulo: "Qual segmento você procura?",
          obrigatoria: true,
          opcoes: [
            {
              id: "infantil",
              rotulo: "Educação Infantil (1 a 5 anos)",
              valor: "Educação Infantil",
              proximaEtapaIdOpcional: "etapa-contato",
            },
            {
              id: "fundamental",
              rotulo: "Ensino Fundamental",
              valor: "Ensino Fundamental",
              proximaEtapaIdOpcional: "etapa-contato",
            },
          ],
          proximaEtapaId: "etapa-contato",
        },
        {
          id: "etapa-contato",
          tipoEtapa: "coleta_contato",
          titulo: "Seus dados para agendamento",
          obrigatoria: true,
          camposContato: ["nome", "whatsapp", "email"],
        },
      ],
      mensagemConfirmacaoTitulo: "Visita solicitada!",
      mensagemConfirmacaoCorpo:
        "Nossa equipe da Maple Bear Cabo Frio entrará em contato pelo WhatsApp para confirmar o melhor horário.",
    },
  ],
};

