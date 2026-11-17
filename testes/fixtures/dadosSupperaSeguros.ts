import type { AcervoPublicoVitrine } from "@/dominio/entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import {
  converterEtapaParaLivre,
  criarEtapaDadosRetorno,
} from "@/dominio/microfluxos/composicaoEtapaLivre";
import { listarCamposResumoConclusao } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import type {
  CampoUniversalFormulario,
  DefinicaoMicrofluxo,
  EtapaMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";

export const ORGANIZACAO_SUPPERA_ID = "org-suppera-seguros";
export const IDENTIFICADOR_PUBLICO_SUPPERA = "suppera-seguros";
export const EMAIL_ADMIN_SUPPERA = "suppera.corretora@gmail.com";
export const WHATSAPP_SUPPERA_NUMERO = "+55 34 98419-3134";
export const WHATSAPP_SUPPERA_DIGITOS = "5534984193134";
export const URL_WHATSAPP_SUPPERA = "https://wa.me/5534984193134";

const ATUALIZADO_EM_ISO = "2026-11-17T13:30:00.000Z";

function criarCampo(
  id: string,
  rotulo: string,
  tipo: CampoUniversalFormulario["tipo"] = "texto_curto",
  obrigatorio = true,
  placeholder?: string,
): CampoUniversalFormulario {
  return {
    id,
    rotulo,
    tipo,
    obrigatorio,
    ...(placeholder ? { placeholder } : {}),
  };
}

function criarEtapaFormulario(
  id: string,
  titulo: string,
  campos: readonly CampoUniversalFormulario[],
  proximaEtapaPadraoId: string,
  subtituloOpcional?: string,
): EtapaMicrofluxo {
  return converterEtapaParaLivre({
    id,
    titulo,
    ...(subtituloOpcional ? { subtituloOpcional } : {}),
    campos,
    proximaEtapaPadraoId,
    tipoEtapa: "formulario_dinamico",
    obrigatoria: true,
  });
}

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
          numeroOpcional: WHATSAPP_SUPPERA_NUMERO,
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

const FLUXO_COTACAO_SEGURO_AUTO: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-cotacao-seguro-auto",
    organizacaoId: ORGANIZACAO_SUPPERA_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-cotacao-seguro-auto",
    titulo: "Fazer cotação de Seguro Auto",
    rotuloBotaoHome: "Fazer cotação de Seguro Auto",
    subtituloBotaoHome: "Seguro novo ou renovação com proposta sob medida no WhatsApp",
    iconeBotaoHome: "shield",
    destaquePrimarioHome: true,
    animarBordaDestaque: true,
    ordemHome: 0,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Atendimento humano, sem letra miúda. Cotamos nas melhores seguradoras do mercado para o seu perfil.",
    textoBotaoConclusao: "Receber meu orçamento personalizado",
    mensagemConfirmacaoTitulo: "Solicitação de cotação registrada!",
    mensagemConfirmacaoCorpo:
      "Recebemos os dados do seu veículo. Toque abaixo para abrir o WhatsApp com um especialista da Suppera Seguros e receber sua proposta sob medida.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-modalidade-seguro",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-modalidade-seguro",
        "Você quer contratar um seguro novo ou renovar?",
        [
          {
            id: "seguro-novo",
            rotulo: "Seguro novo",
            descricaoCurta: "Já tenho o veículo ou estou negociando a compra",
            proximaEtapaIdOpcional: "etapa-uso-veiculo",
          },
          {
            id: "renovar-seguro",
            rotulo: "Quero renovar meu seguro",
            descricaoCurta: "Aproveitar meu bônus atual e comparar condições melhores",
            proximaEtapaIdOpcional: "etapa-dados-renovacao",
          },
        ],
        "Escolha a opção para direcionarmos a melhor cotação entre as seguradoras.",
      ),
      criarEtapaFormulario(
        "etapa-dados-renovacao",
        "Conte sobre sua apólice atual",
        [
          criarCampo(
            "seguradora-atual",
            "Seguradora atual (se lembrar)",
            "texto_curto",
            false,
            "Ex.: Porto Seguro, Tokio Marine, Allianz...",
          ),
          criarCampo("vencimento-apolice", "Data aproximada de vencimento", "data", false),
          criarCampo(
            "classe-bonus",
            "Classe de bônus (opcional)",
            "texto_curto",
            false,
            "Ex.: Bônus 4, não sei informar...",
          ),
        ],
        "etapa-uso-veiculo",
        "Esses dados ajudam a garantir seu desconto de renovação.",
      ),
      criarEtapaEscolhaUnica(
        "etapa-uso-veiculo",
        "Como o veículo é utilizado no dia a dia?",
        [
          {
            id: "uso-particular",
            rotulo: "Passeio e locomoção diária (Particular)",
            descricaoCurta: "Uso pessoal, família, faculdade ou ida e volta ao trabalho",
            proximaEtapaIdOpcional: "etapa-dados-veiculo",
          },
          {
            id: "uso-comercial",
            rotulo: "Uso comercial ou visitas a clientes",
            descricaoCurta: "Representação comercial, prestação de serviços ou empresa",
            proximaEtapaIdOpcional: "etapa-dados-veiculo",
          },
          {
            id: "uso-aplicativo",
            rotulo: "Motorista de aplicativo ou entregas",
            descricaoCurta: "Uber, 99, transporte remunerado de passageiros ou cargas",
            proximaEtapaIdOpcional: "etapa-dados-veiculo",
          },
        ],
      ),
      criarEtapaFormulario(
        "etapa-dados-veiculo",
        "Qual é o veículo e o que você busca na cobertura?",
        [
          criarCampo(
            "modelo-veiculo",
            "Marca, modelo e versão do carro",
            "texto_curto",
            true,
            "Ex.: Toyota Corolla XEi 2.0, Jeep Compass, Onix...",
          ),
          criarCampo(
            "ano-veiculo",
            "Ano de fabricação / modelo",
            "texto_curto",
            true,
            "Ex.: 2023/2024",
          ),
          {
            id: "coberturas-desejadas",
            rotulo: "Quais proteções são mais importantes para você?",
            tipo: "selecao_multipla",
            obrigatorio: false,
            opcoesCustomizadas: [
              "Cobertura Completa (Colisão, Roubo, Furto e Incêndio)",
              "Danos a Terceiros ampliado",
              "Assistência 24h e Guincho sem limite de km",
              "Carro Reserva",
              "Proteção completa de Vidros, Faróis e Retrovisores",
              "Quero orientação do especialista sobre o melhor custo-benefício",
            ],
          },
        ],
        "etapa-contato",
        "Explicamos cada cobertura sem letra miúda para você contratar apenas o que faz sentido.",
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Receber orçamento no WhatsApp",
);

const FLUXO_RENOVACAO_INTELIGENTE: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-renovacao-seguro",
    organizacaoId: ORGANIZACAO_SUPPERA_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-renovacao-seguro",
    titulo: "Renovar seguro com melhor custo-benefício",
    rotuloBotaoHome: "Renovar meu seguro atual",
    subtituloBotaoHome: "Compare seguradoras, mantenha seu bônus e reduza o valor da apólice",
    iconeBotaoHome: "sparkles",
    destaquePrimarioHome: false,
    ordemHome: 1,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Chega de pagar caro na renovação automática. Comparamos as melhores seguradoras preservando sua classe de bônus.",
    textoBotaoConclusao: "Solicitar comparativo de renovação",
    mensagemConfirmacaoTitulo: "Pedido de renovação recebido!",
    mensagemConfirmacaoCorpo:
      "Nossa equipe vai comparar as condições nas principais seguradoras para você renovar com economia e cobertura superior.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-situacao-apolice",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-situacao-apolice",
        "Quando vence o seu seguro atual?",
        [
          {
            id: "vence-em-breve",
            rotulo: "Vence nos próximos 30 dias",
            descricaoCurta: "Momento ideal para comparar propostas com calma e garantir bônus",
            proximaEtapaIdOpcional: "etapa-veiculo-renovacao",
          },
          {
            id: "vence-esta-semana",
            rotulo: "Vence nos próximos dias (Urgente)",
            descricaoCurta: "Prioridade máxima para você não ficar descoberto",
            proximaEtapaIdOpcional: "etapa-veiculo-renovacao",
          },
          {
            id: "ja-venceu",
            rotulo: "Meu seguro já venceu",
            descricaoCurta: "Vamos verificar o aproveitamento de bônus e emitir nova proposta rápida",
            proximaEtapaIdOpcional: "etapa-veiculo-renovacao",
          },
        ],
      ),
      criarEtapaFormulario(
        "etapa-veiculo-renovacao",
        "Dados do veículo e seguro atual",
        [
          criarCampo(
            "veiculo-modelo-ano",
            "Veículo e ano modelo",
            "texto_curto",
            true,
            "Ex.: Honda HR-V EXL 2022",
          ),
          criarCampo(
            "seguradora-anterior",
            "Qual é a seguradora atual?",
            "texto_curto",
            false,
            "Ex.: Azul, Bradesco, Tokio Marine, Porto...",
          ),
          criarCampo(
            "objetivo-renovacao",
            "O que você gostaria de melhorar nesta renovação?",
            "selecao_unica",
            true,
          ),
        ].map((item) =>
          item.id === "objetivo-renovacao"
            ? {
                ...item,
                opcoesCustomizadas: [
                  "Reduzir o preço mantendo boa cobertura",
                  "Ampliar coberturas (guincho ilimitado, carro reserva, terceiros)",
                  "Ter atendimento humano que resolva de verdade",
                ],
              }
            : item,
        ),
        "etapa-contato",
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Comparar renovação no WhatsApp",
);

const FLUXO_SUPORTE_SINISTRO: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-suporte-sinistro",
    organizacaoId: ORGANIZACAO_SUPPERA_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-suporte-sinistro",
    titulo: "Acionar suporte ou assistência em sinistro",
    rotuloBotaoHome: "Suporte em sinistro ou assistência",
    subtituloBotaoHome: "Deu problema? Atendimento ágil sem dor de cabeça com 0800",
    iconeBotaoHome: "wrench",
    destaquePrimarioHome: false,
    ordemHome: 2,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Acompanhamento humano da Suppera Seguros para orientar cada passo em caso de colisão, assistência 24h ou alterações na apólice.",
    textoBotaoConclusao: "Solicitar suporte imediato",
    mensagemConfirmacaoTitulo: "Solicitação de suporte registrada",
    mensagemConfirmacaoCorpo:
      "Nossa equipe foi notificada. Toque no botão abaixo para falar imediatamente no WhatsApp com nosso suporte.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-tipo-suporte",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-tipo-suporte",
        "Como podemos ajudar você agora?",
        [
          {
            id: "abertura-sinistro",
            rotulo: "Colisão, avaria ou acidente (Sinistro)",
            descricaoCurta: "Orientação para abertura de sinistro, franquia, oficina ou terceiros",
            proximaEtapaIdOpcional: "etapa-detalhes-ocorrencia",
          },
          {
            id: "assistencia-24h",
            rotulo: "Guincho, pane elétrica/mecânica ou vidros",
            descricaoCurta: "Apoio rápido para acionar assistência 24h da sua seguradora",
            proximaEtapaIdOpcional: "etapa-detalhes-ocorrencia",
          },
          {
            id: "endosso-apolice",
            rotulo: "Troca de veículo, 2ª via de boleto ou apólice",
            descricaoCurta: "Alteração cadastral, endosso ou dúvidas sobre parcelas",
            proximaEtapaIdOpcional: "etapa-detalhes-ocorrencia",
          },
        ],
      ),
      criarEtapaFormulario(
        "etapa-detalhes-ocorrencia",
        "Conte brevemente o que aconteceu",
        [
          criarCampo(
            "veiculo-placa-modelo",
            "Veículo ou placa (se tiver em mãos)",
            "texto_curto",
            true,
            "Ex.: Volkswagen Nivus / Placa ABC-1D23",
          ),
          criarCampo(
            "relato-necessidade",
            "Como podemos ajudar?",
            "texto_longo",
            false,
            "Descreva rapidamente a situação para adiantarmos seu atendimento...",
          ),
        ],
        "etapa-contato",
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Falar com suporte no WhatsApp",
);

export const VITRINE_SUPPERA_SEGUROS: ConteudoPaginaPublicada = {
  organizacaoId: ORGANIZACAO_SUPPERA_ID,
  identificadorPublico: IDENTIFICADOR_PUBLICO_SUPPERA,
  publicado: true,
  paginaAtiva: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  composicaoVisual: "imersivo",
  paletaId: "safira_corporativo",
  tipografiaId: "contemporaneo_minimalista",
  identidade: {
    nomeExibicao: "Suppera Seguros",
    subtituloCurto: "Seguro Auto Sob Medida · Atendimento Humano e Sem Enrolação",
    urlLogotipoOpcional: "/midias-demonstracao/logo-suppera-seguros.png",
    cidadeEstado: "Atendimento Nacional · MG · SP · RJ",
    telefonePrincipalOpcional: WHATSAPP_SUPPERA_NUMERO,
    celularOpcional: WHATSAPP_SUPPERA_NUMERO,
    horarioFuncionamentoOpcional: "Segunda a Sexta · Atendimento ágil pelo WhatsApp",
  },
  chamadaEditorial: {
    sobretituloOpcional: "Corretora de Seguros Automotivos",
    tituloPrincipal: "Seu carro protegido de verdade. Sem enrolação.",
    descricaoCurta:
      "Atendimento humano, direto no WhatsApp, com explicação clara e proposta sob medida nas melhores seguradoras do mercado.",
  },
  chamadasEditoriaisAdicionais: [
    {
      sobretituloOpcional: "Proposta Clara e Transparente",
      tituloPrincipal: "Chega de pagar caro por um seguro que não resolve.",
      descricaoCurta:
        "Explicamos tudo sem letra miúda ou pegadinhas. Você entende o que está contratando e paga apenas pelo que faz sentido para você e para o seu carro.",
    },
    {
      sobretituloOpcional: "Suporte Rápido em Caso de Sinistro",
      tituloPrincipal: "Deu problema? A gente resolve junto com você.",
      descricaoCurta:
        "Nada de fila em call center ou dor de cabeça com o 0800. Fale no WhatsApp com quem resolve de verdade sempre que precisar.",
    },
  ],
  midiaFundo: {
    tipo: "imagem",
    urlPrincipal: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
    textoAlternativo:
      "Automóvel moderno protegido com consultoria especializada da Suppera Seguros.",
    pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
    pontoFocalMobile: { xPercentual: 50, yPercentual: 50 },
    intensidadeVeloEscuro: "intenso",
  },
  acoesPrincipais: [
    {
      id: "acao-fluxo-fluxo-cotacao-seguro-auto",
      rotulo: "Fazer cotação de Seguro Auto",
      subtituloDiscreto: "Seguro novo ou renovação com proposta sob medida no WhatsApp",
      tipoDestino: "microfluxo",
      destino: "#fluxo-cotacao-seguro-auto",
      destaquePrincipal: true,
      animarBordaDestaque: true,
      icone: "shield",
    },
    {
      id: "acao-fluxo-fluxo-renovacao-seguro",
      rotulo: "Renovar meu seguro atual",
      subtituloDiscreto: "Compare seguradoras, mantenha seu bônus e reduza o valor da apólice",
      tipoDestino: "microfluxo",
      destino: "#fluxo-renovacao-seguro",
      icone: "sparkles",
    },
    {
      id: "acao-fluxo-fluxo-suporte-sinistro",
      rotulo: "Suporte em sinistro ou assistência",
      subtituloDiscreto: "Deu problema? Atendimento ágil sem dor de cabeça com 0800",
      tipoDestino: "microfluxo",
      destino: "#fluxo-suporte-sinistro",
      icone: "wrench",
    },
    {
      id: "acao-fluxo-acao-coberturas-servicos",
      rotulo: "Coberturas e diferenciais Suppera",
      subtituloDiscreto: "Conheça nossos planos personalizados e seguradoras parceiras",
      tipoDestino: "secao_servicos",
      destino: "#servicos",
      icone: "briefcase",
    },
    {
      id: "acao-fluxo-acao-whatsapp-direto",
      rotulo: "Falar agora no WhatsApp",
      subtituloDiscreto: "Atendimento humano direto pelo (34) 98419-3134",
      tipoDestino: "whatsapp",
      destino: URL_WHATSAPP_SUPPERA,
      icone: "whatsapp",
    },
  ],
  redesSociais: [
    {
      id: "rede-whatsapp-suppera",
      rede: "whatsapp",
      url: URL_WHATSAPP_SUPPERA,
      rotuloAcessivel: "WhatsApp oficial da Suppera Seguros",
    },
    {
      id: "rede-site-suppera",
      rede: "site",
      url: "https://supperaseguros.com.br",
      rotuloAcessivel: "Site institucional supperaseguros.com.br",
    },
  ],
  obrasDestaqueGaleria: [],
  seo: {
    tituloSeo: "Suppera Seguros — Seu carro protegido de verdade. Sem enrolação.",
    descricaoSeo:
      "Seguro auto com atendimento humano, proposta transparente e preço justo direto no WhatsApp. Cotação rápida nas melhores seguradoras do mercado.",
    indexavel: true,
  },
};

export const ACERVO_SUPPERA_SEGUROS: AcervoPublicoVitrine = {
  servicos: [
    {
      id: "srv-suppera-cobertura-personalizada",
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      nome: "Seguro Auto com Cobertura Personalizada",
      resumo:
        "Planos feitos sob medida para o seu perfil. Você contrata apenas o que faz sentido para você e para o seu carro: colisão, roubo, furto, incêndio e fenômenos da natureza.",
      categoria: "Seguro Automotivo",
      rotuloPrecoOpcional: "Orçamento sob medida",
      prazoOuDuracao: "Cotação rápida via WhatsApp",
      ordemExibicao: 0,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-suppera-renovacao-inteligente",
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      nome: "Renovação de Seguro sem Perder Bônus",
      resumo:
        "Comparamos as melhores seguradoras do mercado antes do vencimento da sua apólice para garantir cobertura superior, transparência e preço justo.",
      categoria: "Renovação & Economia",
      rotuloPrecoOpcional: "Comparativo multi-seguradoras",
      prazoOuDuracao: "Análise no mesmo dia",
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-suppera-terceiros-assistencia",
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      nome: "Proteção a Terceiros, Vidros e Assistência 24h",
      resumo:
        "Coberturas claras e sem letra miúda para danos materiais e corporais a terceiros, carro reserva, guincho e reparo ou troca de vidros, faróis e retrovisores.",
      categoria: "Coberturas Adicionais",
      rotuloPrecoOpcional: "Proposta transparente",
      prazoOuDuracao: "Explicação ponto a ponto",
      ordemExibicao: 2,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-suppera-suporte-sinistro",
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      nome: "Suporte Rápido em Caso de Sinistro",
      resumo:
        "Deu problema? A gente resolve! Atendimento ágil e suporte completo direto pelo WhatsApp, sem fila de call center ou dor de cabeça com o 0800.",
      categoria: "Pós-Venda & Sinistro",
      rotuloPrecoOpcional: "Exclusivo para segurados Suppera",
      prazoOuDuracao: "Atendimento prioritário",
      ordemExibicao: 3,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
  ],
  produtos: [],
  projetosPortfolio: [],
  profissionais: [
    {
      id: "prof-especialista-suppera",
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      identificadorCartao: "atendimento-suppera",
      nomeCompleto: "Especialista Suppera Seguros",
      cargoOuEspecialidade: "Consultoria em Seguro Auto & Suporte ao Segurado",
      minibiografia:
        "Atendimento humano, claro e ágil. Explicamos cada detalhe da sua proposta sem letra miúda e acompanhamos você na contratação, renovação e sinistro.",
      urlFotoPerfil: "https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg",
      pontoFocalFoto: { xPercentual: 50, yPercentual: 28 },
      emailContatoOpcional: EMAIL_ADMIN_SUPPERA,
      whatsappOpcional: WHATSAPP_SUPPERA_DIGITOS,
      aceitaSolicitacoesDiretas: true,
      ordemExibicao: 0,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
  ],
  microfluxos: [
    FLUXO_COTACAO_SEGURO_AUTO,
    FLUXO_RENOVACAO_INTELIGENTE,
    FLUXO_SUPORTE_SINISTRO,
    {
      id: "acao-coberturas-servicos",
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      tipoAcao: "secao_servicos",
      titulo: "Coberturas e diferenciais Suppera",
      rotuloBotaoHome: "Coberturas e diferenciais Suppera",
      subtituloBotaoHome: "Conheça nossos planos personalizados e seguradoras parceiras",
      tituloSecao: "Como a Suppera protege o seu veículo",
      iconeBotaoHome: "briefcase",
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
      modoExibicaoColecao: "modal_gaveta",
      configuracaoCtaAcervo: {
        tipoAcao: "microfluxo",
        rotuloBotao: "Fazer cotação agora",
        microfluxoId: "fluxo-cotacao-seguro-auto",
      },
    },
    {
      id: "acao-whatsapp-direto",
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      tipoAcao: "whatsapp",
      urlDestinoOpcional: URL_WHATSAPP_SUPPERA,
      titulo: "Falar agora no WhatsApp",
      rotuloBotaoHome: "Falar agora no WhatsApp",
      subtituloBotaoHome: "Atendimento humano direto pelo (34) 98419-3134",
      iconeBotaoHome: "whatsapp",
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
    },
  ],
};

