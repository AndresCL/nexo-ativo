import type {
  AcervoPublicoVitrine,
  ServicoCatalogoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import type {
  DefinicaoMicrofluxo,
  EtapaMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import { converterEtapaParaLivre, criarEtapaDadosRetorno } from "@/dominio/microfluxos/composicaoEtapaLivre";
import { listarCamposResumoConclusao } from "@/dominio/microfluxos/conclusaoMicrofluxo";

export const ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID = "org-pousada-velas-do-forte";
export const IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE = "pousada-velas-do-forte";
const ATUALIZADO_EM_ISO = "2026-11-18T12:00:00.000Z";

export const WHATSAPP_POUSADA_NUMERO = "5522992262312";
export const URL_WHATSAPP_DIRETO =
  "https://api.whatsapp.com/send/?phone=5522992262312&text=Ol%C3%A1%21+Gostaria+de+informa%C3%A7%C3%B5es+sobre+reservas+na+Pousada+Velas+do+Forte.&type=phone_number&app_absent=0";
export const URL_INSTAGRAM_OFICIAL =
  "https://www.instagram.com/pousadavelasdofortecf/?hl=es";
export const URL_GOOGLE_MAPS =
  "https://maps.google.com/?q=Avenida+Vereador+Ant%C3%B4nio+Ferreira+dos+Santos,+375+-+Braga,+Cabo+Frio+-+RJ,+28900-200";

function criarEtapaEscolhaUnica(
  id: string,
  titulo: string,
  opcoes: readonly {
    readonly id: string;
    readonly rotulo: string;
    readonly descricaoCurta?: string;
    readonly proximaEtapaIdOpcional?: string;
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

function anexarConclusaoWhatsapp(
  fluxoSemConclusao: DefinicaoMicrofluxo,
  rotuloBotaoWhatsapp: string,
): DefinicaoMicrofluxo {
  const campos = listarCamposResumoConclusao(fluxoSemConclusao);

  return {
    ...fluxoSemConclusao,
    conclusao: {
      acoes: [
        {
          tipo: "whatsapp",
          rotulo: rotuloBotaoWhatsapp,
          numeroOpcional: WHATSAPP_POUSADA_NUMERO,
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

const FLUXO_CONSULTAR_DISPONIBILIDADE: DefinicaoMicrofluxo = anexarConclusaoWhatsapp(
  {
    id: "fluxo-consultar-disponibilidade",
    organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-consultar-disponibilidade",
    titulo: "Consultar Disponibilidade & Tarifas",
    rotuloBotaoHome: "Consultar Disponibilidade & Tarifas",
    subtituloBotaoHome: "Selecione o perfil da sua viagem e receba valores atualizados no WhatsApp",
    iconeBotaoHome: "sparkles",
    destaquePrimarioHome: true,
    animarBordaDestaque: true,
    ordemHome: 0,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Em 2 toques rápidos, descubra as opções ideais para sua hospedagem em Cabo Frio com atendimento direto.",
    textoBotaoConclusao: "Finalizar e Ver Disponibilidade",
    mensagemConfirmacaoTitulo: "Opções selecionadas com sucesso!",
    mensagemConfirmacaoCorpo:
      "Toque no botão abaixo para conversar diretamente com a recepção da Pousada Velas do Forte pelo WhatsApp com seus detalhes pré-preenchidos.",
    etapaInicialId: "etapa-perfil-estadia",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-perfil-estadia",
        "Com quem você planeja vir a Cabo Frio?",
        [
          {
            id: "perfil-casal",
            rotulo: "Viagem a dois / Casal",
            descricaoCurta: "Avaliada com nota 9.0 para casais no Booking",
            proximaEtapaIdOpcional: "etapa-preferencia-quarto",
          },
          {
            id: "perfil-familia",
            rotulo: "Família com crianças ou amigos",
            descricaoCurta: "Quartos familiares amplos, ambiente tranquilo e piscina",
            proximaEtapaIdOpcional: "etapa-preferencia-quarto",
          },
          {
            id: "perfil-individual",
            rotulo: "Individual ou Trabalho",
            descricaoCurta: "Wi-Fi rápido, ar-condicionado e localização prática",
            proximaEtapaIdOpcional: "etapa-preferencia-quarto",
          },
        ],
        "Personalizamos a sugestão de suíte conforme a sua companhia.",
      ),
      criarEtapaEscolhaUnica(
        "etapa-preferencia-quarto",
        "O que é mais importante na sua acomodação?",
        [
          {
            id: "pref-hidro-varanda",
            rotulo: "Varanda privativa ou Banheira de Hidromassagem",
            descricaoCurta: "Mais conforto e relaxamento após o dia de praia",
            proximaEtapaIdOpcional: "etapa-contato-hospede",
          },
          {
            id: "pref-lazer-piscina",
            rotulo: "Piscina ao ar livre & Café da manhã caprichado",
            descricaoCurta: "Aproveite a área externa ensolarada com café da manhã incluso",
            proximaEtapaIdOpcional: "etapa-contato-hospede",
          },
          {
            id: "pref-acessibilidade",
            rotulo: "Acessibilidade total / Mobilidade reduzida",
            descricaoCurta: "Quartos e banheiros adaptados com barras de apoio",
            proximaEtapaIdOpcional: "etapa-contato-hospede",
          },
        ],
        "Nossa recepção já receberá sua prioridade para verificar a melhor suíte disponível.",
      ),
      criarEtapaDadosRetorno("etapa-contato-hospede"),
    ],
  },
  "Enviar preferências no WhatsApp",
);

export const VITRINE_POUSADA_VELAS_DO_FORTE: ConteudoPaginaPublicada = {
  organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
  identificadorPublico: IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
  publicado: true,
  paginaAtiva: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  composicaoVisual: "imersivo",
  paletaId: "safira_corporativo",
  tipografiaId: "classico_editorial",
  identidade: {
    nomeExibicao: "Pousada Velas do Forte",
    subtituloCurto: "A 5 min da Praia do Forte · Piscina, Jacuzzi e Conforto",
    urlLogotipoOpcional: "/midias-demonstracao/logo-pousada-velas-do-forte.jpg",
    formatoBordaLogotipo: "circulo",
    cidadeEstado: "Cabo Frio · RJ · Braga",
    urlMapaEnderecoOpcional: URL_GOOGLE_MAPS,
  },
  chamadaEditorial: {
    sobretituloOpcional: "Hospedagem em Cabo Frio · Nota 9.2 Booking",
    tituloPrincipal: "Conforto, lazer e tranquilidade a passos da Praia do Forte",
    descricaoCurta:
      "Desfrute de piscina ao ar livre, banheira de hidromassagem, café da manhã especial e quartos climatizados com Wi-Fi de alta performance.",
  },
  chamadasEditoriaisAdicionais: [
    {
      sobretituloOpcional: "Avaliada com 9.0 para viagens a dois",
      tituloPrincipal: "O refúgio perfeito para o seu momento em Cabo Frio",
      descricaoCurta:
        "Localização estratégica no bairro Braga: a apenas 6 minutos a pé da praia e 5 km do Aeroporto Internacional.",
    },
  ],
  midiaFundo: {
    tipo: "imagem",
    urlPrincipal: "/midias-demonstracao/imersivo-arquitetura-luz.svg",
    textoAlternativo: "Atmosfera relaxante da Pousada Velas do Forte em Cabo Frio.",
    pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
    pontoFocalMobile: { xPercentual: 50, yPercentual: 50 },
    intensidadeVeloEscuro: "equilibrado",
  },
  acoesPrincipais: [
    {
      id: "acao-whatsapp-equipe",
      rotulo: "Conversar com a Equipe",
      subtituloDiscreto: "Atendimento imediato via WhatsApp: (22) 99226-2312",
      tipoDestino: "link_externo",
      destino: URL_WHATSAPP_DIRETO,
      destaquePrincipal: true,
      animarBordaDestaque: true,
    },
  ],
  redesSociais: [
    {
      id: "rede-instagram",
      rede: "instagram",
      url: URL_INSTAGRAM_OFICIAL,
      rotuloAcessivel: "Instagram Oficial Pousada Velas do Forte",
    },
    {
      id: "rede-whatsapp",
      rede: "whatsapp",
      url: URL_WHATSAPP_DIRETO,
      rotuloAcessivel: "WhatsApp Pousada Velas do Forte",
    },
  ],
  obrasDestaqueGaleria: [],
  seo: {
    tituloSeo: "Pousada Velas do Forte · Hospedagem em Cabo Frio RJ",
    descricaoSeo:
      "A 5 min da Praia do Forte em Cabo Frio. Piscina, hidromassagem, café da manhã incluso e suítes climatizadas.",
    indexavel: true,
  },
};

const SERVICOS_POUSADA: readonly ServicoCatalogoOrganizacao[] = [
  {
    id: "srv-pousada-suite-casal",
    organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
    nome: "Suíte Casal Conforto",
    resumo:
      "Equipada com cama queen, ar-condicionado split, Smart TV, Wi-Fi de alta velocidade, banheiro privativo e opções com varanda.",
    categoria: "Acomodações",
    rotuloPrecoOpcional: "Consulte tarifas",
    prazoOuDuracao: "Check-in flexível sob consulta",
    ordemExibicao: 0,
    ativo: true,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
  },
  {
    id: "srv-pousada-suite-familia",
    organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
    nome: "Suíte Familiar Climatizada",
    resumo:
      "Espaço planejado para acomodar famílias com crianças ou pequenos grupos com total comodidade, roupa de cama e toalhas inclusas.",
    categoria: "Acomodações",
    rotuloPrecoOpcional: "Consulte tarifas",
    prazoOuDuracao: "Configuração sob medida",
    ordemExibicao: 1,
    ativo: true,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
  },
  {
    id: "srv-pousada-lazer-bem-estar",
    organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
    nome: "Lazer, Piscina & Hidromassagem",
    resumo:
      "Área ao ar livre arborizada com piscina (com parte rasa), banheira de hidromassagem e espreguiçadeiras para relaxar após a praia.",
    categoria: "Comodidades & Lazer",
    rotuloPrecoOpcional: "Incluso na estadia",
    prazoOuDuracao: "Uso livre dos hóspedes",
    ordemExibicao: 2,
    ativo: true,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
  },
  {
    id: "srv-pousada-cafe-manha",
    organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
    nome: "Café da Manhã Completo",
    resumo:
      "Muito elogiado pelos hóspedes (destaque nas avaliações do Booking), com frutas frescas, pães, bolos artesanais, sucos e café quentinho.",
    categoria: "Gastronomia",
    rotuloPrecoOpcional: "Incluso na diária",
    prazoOuDuracao: "Servido diariamente",
    ordemExibicao: 3,
    ativo: true,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
  },
];

export const ACERVO_POUSADA_VELAS_DO_FORTE: AcervoPublicoVitrine = {
  servicos: SERVICOS_POUSADA,
  produtos: [],
  projetosPortfolio: [],
  profissionais: [],
  microfluxos: [FLUXO_CONSULTAR_DISPONIBILIDADE],
  videos: [],
  modoExibicaoVideos: "carrossel",
  modoExibicaoServicos: "grade",
};
