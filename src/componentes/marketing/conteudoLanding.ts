import type { DadosVitrineRealFicticia } from "./MockupVitrineReal";

export type IdCanalDistribuicao =
  | "instagram"
  | "whatsapp"
  | "google"
  | "linkedin"
  | "email"
  | "qrcode";

export interface CanalDistribuicao {
  readonly id: IdCanalDistribuicao;
  readonly rotulo: string;
}

export interface BeneficioSegmento {
  readonly titulo: string;
  readonly descricao: string;
}

export interface DefinicaoSegmentoPme {
  readonly id: "profissionais" | "clinicas" | "imobiliarias" | "empresas";
  readonly rotuloAba: string;
  readonly titulo: string;
  readonly vitrine: DadosVitrineRealFicticia;
  readonly beneficios: readonly BeneficioSegmento[];
}

export interface RecursoPlataforma {
  readonly id: string;
  readonly titulo: string;
  readonly descricao: string;
}

export interface PerguntaFrequente {
  readonly id: string;
  readonly pergunta: string;
  readonly resposta: string;
}

const AVATARES_EQUIPE_EXEMPLO = [
  "/marketing/retrato-profissional-editorial.jpg",
  "/marketing/servico-clinica-atendimento.jpg",
  "/marketing/hero-profissional-fundo.jpg",
] as const;

export const CANAIS_DISTRIBUICAO: readonly CanalDistribuicao[] = [
  { id: "instagram", rotulo: "Instagram" },
  { id: "whatsapp", rotulo: "WhatsApp" },
  { id: "google", rotulo: "Google" },
  { id: "linkedin", rotulo: "LinkedIn" },
  { id: "email", rotulo: "Assinatura de e-mail" },
  { id: "qrcode", rotulo: "QR Code físico" },
] as const;

export const VITRINE_HERO_FICTICIA: DadosVitrineRealFicticia = {
  tema: "escuro",
  estiloCabecalho: "somente_logo",
  logo: "horizonte",
  imagemFundoSrc: "/marketing/hero-profissional-fundo.jpg",
  imagemFundoAlt: "Profissional em estúdio contemporâneo com luz natural e amostras de materiais",
  classeFundoGradiente: "bg-mineral-950",
  classeBotaoPrincipal: "bg-white text-mineral-950",
  classeCorLogo: "text-white",
  blocoEquipe: {
    titulo: "Fale com a nossa equipe",
    subtitulo: "Pessoas reais prontas para atender",
    avatares: AVATARES_EQUIPE_EXEMPLO,
  },
  iconeBotaoPrincipal: "compasso",
  tituloBotaoPrincipal: "Solicitar orçamento",
  subtituloBotaoPrincipal: "Responda 2 etapas rápidas e receba o retorno no WhatsApp",
  acoes: [
    {
      titulo: "Reforma residencial e comercial",
      subtitulo: "Projetos sob medida com acompanhamento completo",
      icone: "casa",
    },
    {
      titulo: "Falar agora no WhatsApp",
      subtitulo: "Atendimento direto pelo (11) 98400-1200",
      icone: "whatsapp",
    },
  ],
  localizacao: "SÃO PAULO · CAMPINAS",
  telefoneMovel: "+55 11 98400-1200",
  horarioAtendimento: "SEGUNDA A SEXTA · 08H ÀS 18H",
};

export const SEGMENTOS_PME: readonly DefinicaoSegmentoPme[] = [
  {
    id: "profissionais",
    rotuloAba: "Profissionais liberais",
    titulo: "Autoridade imediata para médicos, advogados, arquitetos e consultores.",
    vitrine: {
      tema: "escuro",
      estiloCabecalho: "somente_texto",
      destaqueFotoTopo: true,
      logo: "helena",
      nomeMarcaTopo: "Dra. Camila Duarte",
      subtituloTopo: "DERMATOLOGIA CLÍNICA · CRM-RJ",
      imagemFundoSrc: "/marketing/retrato-profissional-editorial.jpg",
      imagemFundoAlt: "Retrato natural da Dra. Camila Duarte em consultório com luz natural",
      classeFundoGradiente: "bg-mineral-950",
      classeBotaoPrincipal: "bg-white text-mineral-950",
      classeCorLogo: "text-white",
      iconeBotaoPrincipal: "agenda",
      tituloBotaoPrincipal: "Solicitar primeira consulta",
      subtituloBotaoPrincipal: "Envie sua preferência de horário e confirme no WhatsApp",
      acoes: [
        {
          titulo: "Protocolos e procedimentos",
          subtitulo: "Tratamentos clínicos e dermatologia preventiva",
          icone: "saude",
        },
        {
          titulo: "Falar com a secretária",
          subtitulo: "WhatsApp direto pelo (21) 99120-4400",
          icone: "whatsapp",
        },
      ],
      localizacao: "RIO DE JANEIRO · IPANEMA",
      telefoneMovel: "+55 21 99120-4400",
      horarioAtendimento: "SEGUNDA A SEXTA · HORA MARCADA",
    },
    beneficios: [
      {
        titulo: "Retrato em destaque",
        descricao: "Visual sóbrio pensado para gerar confiança no primeiro clique.",
      },
      {
        titulo: "Triagem antes do WhatsApp",
        descricao: "O cliente responde 2 perguntas rápidas e chega pronto.",
      },
      {
        titulo: "Conformidade ética",
        descricao: "Perfis dedicados para normas de OAB, CFM e CFO.",
      },
    ],
  },
  {
    id: "clinicas",
    rotuloAba: "Clínicas e estúdios",
    titulo: "Seu espaço, serviços e fotos em um microsite vivo.",
    vitrine: {
      tema: "claro",
      estiloCabecalho: "logo_sem_barra",
      logo: "lumina",
      nomeMarcaTopo: "Clínica Lumina",
      subtituloTopo: "ODONTOLOGIA & ESTÉTICA",
      efeitoCantos: "dots",
      classeFundoGradiente: "bg-gradient-to-br from-[#f0f7fc] via-[#fcfdfe] to-[#eaf2f8]",
      classeBotaoPrincipal: "bg-gradient-to-r from-[#d9effc] to-[#e5f5fe] text-mineral-950 border border-sky-200/60 shadow-xs",
      classeCorLogo: "text-[#0284c7]",
      iconeBotaoPrincipal: "relogio",
      tituloBotaoPrincipal: "Consultar Horários & Avaliação",
      subtituloBotaoPrincipal: "Escolha o tratamento e receba disponibilidade no WhatsApp",
      acoes: [
        {
          titulo: "Localização · Batel, Curitiba",
          subtitulo: "Estacionamento conveniado no local",
          icone: "localizacao",
        },
      ],
      servicosFoto: [
        {
          categoria: "Avaliação",
          titulo: "Atendimento Clínico",
          subtitulo: "Planejamento individual",
          rodape: "Agendar consulta",
          imagemSrc: "/marketing/servico-clinica-atendimento.jpg",
          imagemAlt: "Profissional de saúde conversando com paciente em consultório claro",
        },
        {
          categoria: "Estrutura",
          titulo: "Sala Equipada",
          subtitulo: "Conforto e tecnologia",
          rodape: "Conhecer espaço",
          imagemSrc: "/marketing/servico-clinica-sala.jpg",
          imagemAlt: "Sala de atendimento odontológico iluminada naturalmente",
        },
        {
          categoria: "Ambiente",
          titulo: "Recepção Acolhedora",
          subtitulo: "Atendimento sem espera",
          rodape: "Ver estrutura",
          imagemSrc: "/marketing/clinica-espaco-editorial.jpg",
          imagemAlt: "Recepção minimalista de clínica com poltrona e luz natural",
        },
        {
          categoria: "Acesso",
          titulo: "Check-in Digital",
          subtitulo: "QR Code na recepção",
          rodape: "Saiba mais",
          imagemSrc: "/marketing/recepcao-offline-online.jpg",
          imagemAlt: "Cliente escaneando QR Code no balcão da clínica",
        },
      ],
    },
    beneficios: [
      {
        titulo: "Catálogo visual com fotos",
        descricao: "Serviços, procedimentos e estrutura no mesmo endereço.",
      },
      {
        titulo: "Avaliações do Google na vitrine",
        descricao: "Reputação real visível na hora da decisão.",
      },
      {
        titulo: "Cartão para cada especialista",
        descricao: "Links e QR Codes individuais ligados ao catálogo central.",
      },
    ],
  },
  {
    id: "imobiliarias",
    rotuloAba: "Imobiliárias e corretores",
    titulo: "Tours em vídeo, corretores visíveis e pedidos de visita em um único link.",
    vitrine: {
      tema: "escuro",
      estiloCabecalho: "somente_logo",
      logo: "casanobre",
      efeitoCantos: "dots",
      classeFundoGradiente: "bg-gradient-to-b from-[#0a1524] via-[#0f1f33] to-[#070d16]",
      classeBotaoPrincipal: "bg-gradient-to-r from-[#205177] to-[#2c6e9e] text-white shadow-sm border border-sky-400/25",
      classeCorLogo: "text-white",
      blocoEquipe: {
        titulo: "Fale com nossos corretores",
        subtitulo: "Especialistas por bairro no WhatsApp",
        avatares: AVATARES_EQUIPE_EXEMPLO,
      },
      iconeBotaoPrincipal: "agenda",
      tituloBotaoPrincipal: "Solicitar visita guiada",
      subtituloBotaoPrincipal: "Informe seu perfil e receba opções de horário no WhatsApp",
      blocoVideo: {
        capaPrincipalSrc: "/marketing/video-tour-imovel.jpg",
        capaPrincipalAlt: "Corretor apresentando sala de apartamento iluminada em vídeo tour",
        capaSecundariaSrc: "/marketing/vitrine-estudio-editorial.jpg",
      },
      acoes: [
        {
          titulo: "Imóveis em destaque",
          subtitulo: "Apartamentos e casas selecionados para morar ou investir",
          icone: "casa",
        },
        {
          titulo: "Pré-análise de financiamento",
          subtitulo: "Envie seu perfil e receba opções com nossa equipe",
          icone: "calculadora",
        },
        {
          titulo: "Anunciar meu imóvel",
          subtitulo: "Avaliação de mercado e divulgação qualificada",
          icone: "chave",
        },
      ],
    },
    beneficios: [
      {
        titulo: "Tours em vídeo na vitrine",
        descricao: "Mostre cada imóvel em movimento sem tirar o cliente da página.",
      },
      {
        titulo: "Corretores com cartão próprio",
        descricao: "Avatares reais e QR Codes individuais para placas e plantões.",
      },
      {
        titulo: "Triagem antes da visita",
        descricao: "Receba bairro, perfil e faixa de investimento prontos no painel.",
      },
    ],
  },
  {
    id: "empresas",
    rotuloAba: "Empresas e equipes",
    titulo: "Padronize a marca e prove autoridade com avaliações reais.",
    vitrine: {
      tema: "escuro",
      estiloCabecalho: "logo_com_barra",
      logo: "vertice",
      nomeMarcaTopo: "Vértice Engenharia",
      subtituloTopo: "OBRAS & PROJETOS B2B",
      imagemFundoSrc: "/marketing/vitrine-estudio-editorial.jpg",
      imagemFundoAlt: "Escritório de engenharia e projetos com mesa de maquetes e luz natural",
      classeFundoGradiente: "bg-mineral-950",
      classeBotaoPrincipal: "bg-[#3f8f7b] text-white",
      classeCorLogo: "text-[#5fb8a1]",
      iconeBotaoPrincipal: "proposta",
      tituloBotaoPrincipal: "Solicitar proposta técnica",
      subtituloBotaoPrincipal: "Escopo sob medida para obras comerciais e corporativas",
      acoes: [
        {
          titulo: "Portfólio de obras entregues",
          subtitulo: "Projetos corporativos, clínicas e varejo",
          icone: "obras",
        },
        {
          titulo: "Falar com consultor da equipe",
          subtitulo: "Direcionamento rápido para a unidade responsável",
          icone: "equipe",
        },
      ],
      avaliacoesGoogle: [
        {
          autor: "Patrícia Nogueira",
          tempo: "há 1 mês",
          comentario: "Ótima experiência! Entrega no prazo e atendimento impecável.",
          avatarSrc: "/marketing/retrato-profissional-editorial.jpg",
        },
        {
          autor: "Lucas Ferreira",
          tempo: "há 2 meses",
          comentario: "Equipe muito profissional do orçamento até a entrega.",
          avatarSrc: "/marketing/servico-clinica-atendimento.jpg",
        },
      ],
    },
    beneficios: [
      {
        titulo: "Avaliações reais do Google",
        descricao: "Prova social verificada exibida direto na vitrine da empresa.",
      },
      {
        titulo: "Cartões e QR Codes para o time",
        descricao: "Até 10 profissionais com vCard e link próprio no plano Pro.",
      },
      {
        titulo: "Métricas por profissional",
        descricao: "Veja quem gera mais conversões direto no painel.",
      },
    ],
  },
] as const;

export const RECURSOS_PLATAFORMA: readonly RecursoPlataforma[] = [
  {
    id: "composicoes",
    titulo: "Visual sob medida",
    descricao: "Fundo com foto, vídeo ou cor, tema claro ou escuro e paletas prontas.",
  },
  {
    id: "microfluxos",
    titulo: "Microfluxos de qualificação",
    descricao: "Perguntas guiadas — com opção de faixa de valor — que entregam o pedido pronto.",
  },
  {
    id: "catalogo",
    titulo: "Catálogo e portfólio",
    descricao: "Serviços, produtos, projetos e vídeos no mesmo link.",
  },
  {
    id: "google",
    titulo: "Avaliações do Google",
    descricao: "Prova social real integrada direto na sua vitrine.",
  },
  {
    id: "conformidade",
    titulo: "Regras OAB, CFM e CFO",
    descricao: "Conformidade publicitária pronta para profissões reguladas.",
  },
  {
    id: "desempenho",
    titulo: "Painel + retorno no WhatsApp",
    descricao: "Funil de conversão, alerta por e-mail e resposta em 1 clique.",
  },
] as const;

export const PERGUNTAS_FREQUENTES: readonly PerguntaFrequente[] = [
  {
    id: "precisa-de-site",
    pergunta: "Preciso ter um site para usar o Nexo Ativo?",
    resposta:
      "Não. Ele funciona como seu próprio microsite comercial — rápido de editar e focado em conversão. Se já tem site, pode vinculá-lo.",
  },
  {
    id: "diferenca-link-bio",
    pergunta: "Qual a diferença para um link na bio comum?",
    resposta:
      "Em vez de uma lista de botões soltos, você apresenta sua marca com catálogo, avaliações do Google e microfluxos que qualificam o cliente.",
  },
  {
    id: "cartao-para-testar",
    pergunta: "Preciso cadastrar cartão para testar?",
    resposta:
      "Não. Você monta tudo grátis no modo rascunho com prévia privada e só assina quando decidir publicar.",
  },
  {
    id: "equipe-e-qrcodes",
    pergunta: "Minha equipe pode ter cartões e QR Codes individuais?",
    resposta:
      "Sim. O plano Pro (R$ 87/mês) já inclui até 10 profissionais com cartão digital, vCard e QR Code próprio.",
  },
] as const;
