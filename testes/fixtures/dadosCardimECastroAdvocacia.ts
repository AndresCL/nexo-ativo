import type { AcervoPublicoVitrine } from "@/dominio/entidades/catalogoConteudo";
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

export const ORGANIZACAO_CARDIM_CASTRO_ID = "org-cardim-castro-advocacia";
export const IDENTIFICADOR_PUBLICO_CARDIM_CASTRO = "cardimecastroadvocacia";
export const EMAIL_ADMIN_CARDIM_CASTRO = "contato@cardimecastroadvocacia.com.br";
export const WHATSAPP_CARDIM_CASTRO_NUMERO = "+55 22 99778-7260";
export const WHATSAPP_CARDIM_CASTRO_DIGITOS = "5522997787260";
export const URL_WHATSAPP_CARDIM_CASTRO = "https://wa.me/5522997787260";

const ATUALIZADO_EM_ISO = "2026-11-24T20:55:00.000Z";

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
          numeroOpcional: WHATSAPP_CARDIM_CASTRO_NUMERO,
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

const FLUXO_AGENDAR_ATENDIMENTO: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-agendar-atendimento",
    organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-agendar-atendimento",
    titulo: "Agendar atendimento jurídico",
    rotuloBotaoHome: "Agendar atendimento jurídico",
    subtituloBotaoHome: "Empresarial, Trabalhista, Cível e Família · Cabo Frio e Região",
    iconeBotaoHome: "briefcase",
    destaquePrimarioHome: true,
    animarBordaDestaque: true,
    ordemHome: 0,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Direcione sua demanda em dois toques para agilizar o atendimento com a equipe Cardim & Castro.",
    textoBotaoConclusao: "Enviar solicitação",
    mensagemConfirmacaoTitulo: "Solicitação enviada!",
    mensagemConfirmacaoCorpo:
      "Recebemos suas informações e a equipe Cardim & Castro entrará em contato. Se preferir agilizar, você também pode abrir o WhatsApp com o resumo pronto.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-perfil-cliente",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-perfil-cliente",
        "Para quem é o atendimento?",
        [
          {
            id: "perfil-empresa",
            rotulo: "Para minha empresa",
            descricaoCurta: "Assessoria preventiva, trabalhista, tributário ou contratos",
            proximaEtapaIdOpcional: "etapa-area-empresa",
          },
          {
            id: "perfil-pessoa-familia",
            rotulo: "Para mim ou minha família",
            descricaoCurta: "Inventário, família, cível ou trabalhista",
            proximaEtapaIdOpcional: "etapa-area-pf",
          },
        ],
        "Escolha a opção para direcionarmos o especialista adequado.",
      ),
      criarEtapaEscolhaUnica(
        "etapa-area-empresa",
        "Qual área empresarial precisa de apoio?",
        [
          {
            id: "area-emp-trabalhista",
            rotulo: "Trabalhista & Compliance",
            descricaoCurta: "PJ, justa causa, escala 5×2, banco de horas e prevenção",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "area-emp-tributario",
            rotulo: "Tributário & Holding",
            descricaoCurta: "Reforma tributária, imóveis e planejamento patrimonial",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "area-emp-contratos",
            rotulo: "Empresarial & Contratos",
            descricaoCurta: "Estruturação societária, contratos e cobranças",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "area-emp-outro",
            rotulo: "Outro assunto empresarial",
            proximaEtapaIdOpcional: "etapa-contato",
          },
        ],
      ),
      criarEtapaEscolhaUnica(
        "etapa-area-pf",
        "Qual é o assunto principal?",
        [
          {
            id: "area-pf-inventario",
            rotulo: "Inventário & Herança",
            descricaoCurta: "Via extrajudicial em cartório ou judicial",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "area-pf-familia",
            rotulo: "Direito de Família",
            descricaoCurta: "Divórcio, guarda, pensão ou planejamento familiar",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "area-pf-civel",
            rotulo: "Direito Cível",
            descricaoCurta: "Imóveis, contratos, indenizações e responsabilidade civil",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "area-pf-trabalhista",
            rotulo: "Direito Trabalhista",
            descricaoCurta: "Análise de direitos, rescisão ou vínculo",
            proximaEtapaIdOpcional: "etapa-contato",
          },
        ],
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Agilizar no WhatsApp",
);

const FLUXO_ASSESSORIA_EMPRESARIAL: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-assessoria-empresarial",
    organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-assessoria-empresarial",
    titulo: "Assessoria Empresarial",
    rotuloBotaoHome: "Assessoria Empresarial (Trabalhista & Holding)",
    subtituloBotaoHome: "PJ, justa causa, escala 5×2 e reforma tributária 2026",
    iconeBotaoHome: "shield",
    ordemHome: 1,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Segurança jurídica preventiva para proteger o caixa, a liderança e o patrimônio da sua empresa.",
    textoBotaoConclusao: "Enviar solicitação",
    mensagemConfirmacaoTitulo: "Solicitação enviada!",
    mensagemConfirmacaoCorpo:
      "Recebemos suas informações e nossa equipe empresarial entrará em contato. Se preferir agilizar, abra o WhatsApp com o resumo pronto.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-foco-empresa",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-foco-empresa",
        "Qual ponto sua empresa deseja revisar agora?",
        [
          {
            id: "foco-pj-vinculo",
            rotulo: "Contratação de PJ / Risco de vínculo",
            descricaoCurta: "Segurança jurídica na contratação de prestadores",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "foco-justa-causa-lideranca",
            rotulo: "Justa causa, banco de horas e gestão",
            descricaoCurta: "Evitar reversões judiciais e passivos trabalhistas",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "foco-escala-5x2",
            rotulo: "Impacto da escala 5×2 na folha",
            descricaoCurta: "Análise de turnos, encargos e regime tributário",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "foco-holding-reforma",
            rotulo: "Holding & Reforma Tributária (Imóveis)",
            descricaoCurta: "Integralização de imóveis e janela de 2026 (IBS/CBS)",
            proximaEtapaIdOpcional: "etapa-contato",
          },
        ],
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Agilizar no WhatsApp",
);

const FLUXO_INVENTARIO_EXTRAJUDICIAL: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-inventario-extrajudicial",
    organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-inventario-extrajudicial",
    titulo: "Inventário Extrajudicial",
    rotuloBotaoHome: "Inventário Extrajudicial (Cartório)",
    subtituloBotaoHome: "Mais rápido e econômico — inclusive com herdeiros à distância",
    iconeBotaoHome: "file-text",
    ordemHome: 2,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Resolva o inventário diretamente em cartório, sem espera do fórum e com a mesma segurança jurídica.",
    textoBotaoConclusao: "Enviar solicitação",
    mensagemConfirmacaoTitulo: "Solicitação enviada!",
    mensagemConfirmacaoCorpo:
      "Recebemos suas informações e nossa equipe entrará em contato com a orientação inicial. Se preferir agilizar, abra o WhatsApp com o resumo pronto.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-situacao-inventario",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-situacao-inventario",
        "Como está a situação do inventário hoje?",
        [
          {
            id: "inv-acordo-cartorio",
            rotulo: "Herdeiros de acordo (via cartório)",
            descricaoCurta: "Buscamos agilidade e economia na via extrajudicial",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "inv-exterior-distancia",
            rotulo: "Há herdeiros em outra cidade ou exterior",
            descricaoCurta: "Precisamos conduzir assinaturas e trâmites à distância",
            proximaEtapaIdOpcional: "etapa-contato",
          },
          {
            id: "inv-entender-caminho",
            rotulo: "Quero entender o melhor caminho",
            descricaoCurta: "Preciso de orientação inicial sobre documentos e prazos",
            proximaEtapaIdOpcional: "etapa-contato",
          },
        ],
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Agilizar no WhatsApp",
);

export const VITRINE_CARDIM_CASTRO: ConteudoPaginaPublicada = {
  organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
  identificadorPublico: IDENTIFICADOR_PUBLICO_CARDIM_CASTRO,
  publicado: true,
  paginaAtiva: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  composicaoVisual: "imersivo",
  paletaId: "noite_mineral",
  corPersonalizadaHex: "#6B0F12",
  customizacaoTokens: {
    corFundoPrincipal: "#141212",
    corSuperficie: "#1E1A1A",
    corTextoPrincipal: "#F6F1EA",
    corTextoSecundario: "#C9BFB3",
    corDestaque: "#C8A24A",
    corBorda: "#3A2D26",
    corLogoTitulo: "#F6F1EA",
    corLogoSubtitulo: "#D8CFC4",
    corCtaFundo: "#6B0F12",
    corCtaTexto: "#F6F1EA",
    corSecundarioFundo: "#1C1717",
    corSecundarioTexto: "#F6F1EA",
    corBrilhoBorda: "#C8A24A",
    corBottomSheetFundo: "#161313",
    corBottomSheetSuperficie: "#221D1D",
    corBottomSheetBorda: "#3D2E28",
    corBottomSheetTextoPrincipal: "#F6F1EA",
    corBottomSheetTextoSecundario: "#BFB5A9",
    corBottomSheetDestaque: "#C8A24A",
    corBottomSheetCtaFundo: "#6B0F12",
    corBottomSheetCtaTexto: "#F6F1EA",
  },
  tipografiaId: "classico_editorial",
  identidade: {
    nomeExibicao: "Cardim & Castro",
    subtituloCurto: "Advocacia para pessoas e empresas",
    urlLogotipoOpcional: "/midias-demonstracao/logo-cardim-castro.png",
    formatoBordaLogotipo: "suave",
    cidadeEstado: "Cabo Frio · RJ · Região dos Lagos",
    celularOpcional: WHATSAPP_CARDIM_CASTRO_NUMERO,
  },
  chamadaEditorial: {
    sobretituloOpcional: "Cabo Frio · Região dos Lagos",
    tituloPrincipal: "Segurança jurídica estratégica para pessoas e empresas.",
    descricaoCurta:
      "Atuação técnica e preventiva em Direito Empresarial, Trabalhista, Cível e Família.",
  },
  chamadasEditoriaisAdicionais: [],
  midiaFundo: {
    tipo: "imagem",
    urlPrincipal: "/midias-demonstracao/fundo-cardim-castro.jpg",
    textoAlternativo: "Advogado da Cardim & Castro Advocacia em escritório.",
    pontoFocalDesktop: { xPercentual: 50, yPercentual: 20 },
    pontoFocalMobile: { xPercentual: 50, yPercentual: 18 },
    intensidadeVeloEscuro: "intenso",
  },
  acoesPrincipais: [
    {
      id: "acao-agendar-atendimento",
      rotulo: "Agendar atendimento jurídico",
      subtituloDiscreto: "Empresarial, Trabalhista, Cível e Família · Cabo Frio e Região",
      tipoDestino: "microfluxo",
      destino: "#fluxo-agendar-atendimento",
      destaquePrincipal: true,
      animarBordaDestaque: true,
      corBrilhoBorda: "#C8A24A",
      icone: "briefcase",
    },
    {
      id: "acao-assessoria-empresarial",
      rotulo: "Assessoria Empresarial (Trabalhista & Holding)",
      subtituloDiscreto: "PJ, justa causa, escala 5×2 e reforma tributária 2026",
      tipoDestino: "microfluxo",
      destino: "#fluxo-assessoria-empresarial",
      icone: "shield",
    },
    {
      id: "acao-inventario-extrajudicial",
      rotulo: "Inventário Extrajudicial (Cartório)",
      subtituloDiscreto: "Mais rápido e econômico — inclusive com herdeiros à distância",
      tipoDestino: "microfluxo",
      destino: "#fluxo-inventario-extrajudicial",
      icone: "file-text",
    },
    {
      id: "acao-whatsapp-direto",
      rotulo: "Falar direto no WhatsApp",
      subtituloDiscreto: "Atendimento pelo (22) 99778-7260",
      tipoDestino: "whatsapp",
      destino: URL_WHATSAPP_CARDIM_CASTRO,
      icone: "whatsapp",
    },
  ],
  redesSociais: [
    {
      id: "rede-ig-cardim-castro",
      rede: "instagram",
      url: "https://www.instagram.com/cardimecastroadvocacia/",
      rotuloAcessivel: "Instagram oficial Cardim & Castro Advocacia",
    },
    {
      id: "rede-whatsapp-cardim-castro",
      rede: "whatsapp",
      url: URL_WHATSAPP_CARDIM_CASTRO,
      rotuloAcessivel: "WhatsApp oficial Cardim & Castro Advocacia",
    },
  ],
  obrasDestaqueGaleria: [],
  seo: {
    tituloSeo: "Cardim & Castro Advocacia — Cabo Frio e Região dos Lagos",
    descricaoSeo:
      "Advocacia para pessoas e empresas em Cabo Frio e Região dos Lagos. Atuação em Direito Empresarial, Trabalhista, Cível e Família.",
    indexavel: true,
  },
};

export const ACERVO_CARDIM_CASTRO: AcervoPublicoVitrine = {
  servicos: [
    {
      id: "srv-cardim-empresarial",
      organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
      nome: "Direito Empresarial & Planejamento Patrimonial",
      resumo:
        "Assessoria preventiva para empresas, contratos, estruturação societária, holding e planejamento patrimonial diante da reforma tributária (IBS/CBS).",
      categoria: "Empresas",
      rotuloPrecoOpcional: "Consultoria sob medida",
      prazoOuDuracao: "Atendimento presencial e online",
      ordemExibicao: 0,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-cardim-trabalhista",
      organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
      nome: "Direito Trabalhista & Compliance",
      resumo:
        "Prevenção de passivos trabalhistas, contratação segura de PJs, gestão de justa causa, banco de horas e análise de impacto da escala 5×2 na folha.",
      categoria: "Trabalhista",
      rotuloPrecoOpcional: "Preventivo e contencioso",
      prazoOuDuracao: "Atendimento ágil",
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-cardim-civel",
      organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
      nome: "Direito Cível",
      resumo:
        "Atuação técnica em contratos, questões imobiliárias, responsabilidade civil e proteção de interesses patrimoniais de pessoas e empresas.",
      categoria: "Cível",
      rotuloPrecoOpcional: "Análise individualizada",
      prazoOuDuracao: "Cabo Frio e Região dos Lagos",
      ordemExibicao: 2,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-cardim-familia",
      organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
      nome: "Direito de Família & Inventário Extrajudicial",
      resumo:
        "Inventários em cartório com mais agilidade e economia — inclusive com herdeiros em outras cidades ou no exterior — além de divórcios e planejamento sucessório.",
      categoria: "Família e Sucessões",
      rotuloPrecoOpcional: "Via extrajudicial e judicial",
      prazoOuDuracao: "Atendimento à distância disponível",
      ordemExibicao: 3,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
  ],
  produtos: [],
  projetosPortfolio: [],
  profissionais: [],
  microfluxos: [
    FLUXO_AGENDAR_ATENDIMENTO,
    FLUXO_ASSESSORIA_EMPRESARIAL,
    FLUXO_INVENTARIO_EXTRAJUDICIAL,
    {
      id: "acao-whatsapp-direto",
      organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
      tipoAcao: "whatsapp",
      urlDestinoOpcional: URL_WHATSAPP_CARDIM_CASTRO,
      titulo: "Falar direto no WhatsApp",
      rotuloBotaoHome: "Falar direto no WhatsApp",
      subtituloBotaoHome: "Atendimento pelo (22) 99778-7260",
      iconeBotaoHome: "whatsapp",
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
    },
  ],
};
