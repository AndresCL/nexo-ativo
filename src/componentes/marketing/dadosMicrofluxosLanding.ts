export interface OpcaoEtapaMicrofluxo {
  readonly id: string;
  readonly titulo: string;
  readonly descricao: string;
}

export interface ExemploMicrofluxoInterativo {
  readonly id: string;
  readonly rotuloAba: string;
  readonly nomeVitrineFundo: string;
  readonly subtituloVitrineFundo: string;
  readonly imagemFundoSrc: string;
  readonly tituloFluxo: string;
  readonly rotuloEtapa1: string;
  readonly perguntaPasso1: string;
  readonly opcoesPasso1: readonly OpcaoEtapaMicrofluxo[];
  readonly rotuloEtapa2: string;
  readonly perguntaPasso2: string;
  readonly opcoesPasso2: readonly OpcaoEtapaMicrofluxo[];
  readonly rotuloEtapa3: string;
  readonly perguntaPasso3: string;
  readonly opcoesPasso3: readonly string[];
  readonly tituloConfirmacao: string;
  readonly descricaoConfirmacao: string;
  readonly ctaWhatsapp: string;
  readonly clienteExemplo: string;
  readonly canalExemplo: string;
}

export type EtapaFluxoDemo = 1 | 2 | 3 | 4;

export const EXEMPLOS_MICROFLUXO: readonly ExemploMicrofluxoInterativo[] = [
  {
    id: "arquitetura",
    rotuloAba: "Arquitetura",
    nomeVitrineFundo: "HORIZONTE",
    subtituloVitrineFundo: "ARQUITETURA & INTERIORES",
    imagemFundoSrc: "/marketing/hero-profissional-fundo.jpg",
    tituloFluxo: "Solicitar orçamento",
    rotuloEtapa1: "Tipo",
    perguntaPasso1: "Qual tipo de projeto você procura?",
    opcoesPasso1: [
      {
        id: "residencial",
        titulo: "Reforma residencial",
        descricao: "Apartamento ou casa com projeto completo",
      },
      {
        id: "comercial",
        titulo: "Espaço comercial",
        descricao: "Consultório, escritório ou loja sob medida",
      },
    ],
    rotuloEtapa2: "Prazo",
    perguntaPasso2: "Quando pretende começar?",
    opcoesPasso2: [
      {
        id: "imediato",
        titulo: "Nos próximos 30 dias",
        descricao: "Já tenho o imóvel e quero iniciar logo",
      },
      {
        id: "trimestre",
        titulo: "Em 2 a 3 meses",
        descricao: "Planejando escopo e investimento",
      },
      {
        id: "pesquisa",
        titulo: "Ainda avaliando",
        descricao: "Quero entender etapas e prazos",
      },
    ],
    rotuloEtapa3: "Escopo",
    perguntaPasso3: "O que você gostaria de incluir?",
    opcoesPasso3: [
      "Projeto em 3D",
      "Acompanhamento de obra",
      "Marcenaria sob medida",
      "Iluminação",
    ],
    tituloConfirmacao: "Solicitação registrada!",
    descricaoConfirmacao:
      "Recebemos o perfil do seu projeto. Toque abaixo para falar com nossa equipe no WhatsApp.",
    ctaWhatsapp: "Continuar no WhatsApp",
    clienteExemplo: "Marina Alves",
    canalExemplo: "Vitrine principal",
  },
  {
    id: "clinica",
    rotuloAba: "Clínica & Saúde",
    nomeVitrineFundo: "CLÍNICA LUMINA",
    subtituloVitrineFundo: "ODONTOLOGIA & ESTÉTICA",
    imagemFundoSrc: "/marketing/clinica-espaco-editorial.jpg",
    tituloFluxo: "Solicitar avaliação",
    rotuloEtapa1: "Atendimento",
    perguntaPasso1: "Qual atendimento você procura?",
    opcoesPasso1: [
      {
        id: "avaliacao",
        titulo: "Primeira avaliação",
        descricao: "Consulta inicial com plano personalizado",
      },
      {
        id: "retorno",
        titulo: "Retorno ou revisão",
        descricao: "Já sou paciente e preciso de acompanhamento",
      },
    ],
    rotuloEtapa2: "Período",
    perguntaPasso2: "Qual período você prefere?",
    opcoesPasso2: [
      {
        id: "manha",
        titulo: "Manhã (08h às 12h)",
        descricao: "Atendimento presencial na clínica",
      },
      {
        id: "tarde",
        titulo: "Tarde (13h às 18h)",
        descricao: "Atendimento presencial na clínica",
      },
      {
        id: "online",
        titulo: "Teleconsulta",
        descricao: "Orientação inicial por vídeo",
      },
    ],
    rotuloEtapa3: "Interesses",
    perguntaPasso3: "Qual é o seu foco principal?",
    opcoesPasso3: ["Estética dental", "Alinhadores", "Implantes", "Check-up geral"],
    tituloConfirmacao: "Pedido de horário enviado!",
    descricaoConfirmacao:
      "Nossa recepção recebeu sua preferência e confirma o horário direto no WhatsApp.",
    ctaWhatsapp: "Confirmar no WhatsApp",
    clienteExemplo: "Rafael Mendes",
    canalExemplo: "Cartão · Dra. Camila",
  },
  {
    id: "servicos",
    rotuloAba: "Serviços & B2B",
    nomeVitrineFundo: "VÉRTICE",
    subtituloVitrineFundo: "ENGENHARIA & PROJETOS",
    imagemFundoSrc: "/marketing/vitrine-estudio-editorial.jpg",
    tituloFluxo: "Solicitar proposta",
    rotuloEtapa1: "Demanda",
    perguntaPasso1: "Qual é a necessidade da sua empresa?",
    opcoesPasso1: [
      {
        id: "novo",
        titulo: "Novo projeto ou obra",
        descricao: "Planejamento técnico e execução do zero",
      },
      {
        id: "adequacao",
        titulo: "Adequação ou expansão",
        descricao: "Melhoria em unidade já em operação",
      },
    ],
    rotuloEtapa2: "Porte",
    perguntaPasso2: "Qual é o porte do espaço?",
    opcoesPasso2: [
      {
        id: "ate150",
        titulo: "Até 150 m²",
        descricao: "Escritório compacto, sala ou loja",
      },
      {
        id: "medio",
        titulo: "150 m² a 500 m²",
        descricao: "Clínica, sede comercial ou restaurante",
      },
      {
        id: "grande",
        titulo: "Acima de 500 m²",
        descricao: "Operação corporativa ou múltiplas unidades",
      },
    ],
    rotuloEtapa3: "Prioridades",
    perguntaPasso3: "O que é mais importante nessa entrega?",
    opcoesPasso3: [
      "Prazo reduzido",
      "Laudo e aprovações",
      "Execução chave na mão",
      "Orçamento fechado",
    ],
    tituloConfirmacao: "Proposta solicitada!",
    descricaoConfirmacao:
      "Nossa equipe técnica já recebeu o escopo e segue com o atendimento no WhatsApp.",
    ctaWhatsapp: "Falar com especialista",
    clienteExemplo: "Carla Nogueira",
    canalExemplo: "QR Code do cartão",
  },
] as const;

