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

export const ORGANIZACAO_NEXOATIVO_ID = "org-nexoativo";
export const IDENTIFICADOR_PUBLICO_NEXOATIVO = "nexoativo";
export const EMAIL_ADMIN_NEXOATIVO = "aecontrerasl@gmail.com";
export const WHATSAPP_NEXOATIVO_NUMERO = "+55 22 99999-0000";
export const WHATSAPP_NEXOATIVO_DIGITOS = "5522999990000";
export const URL_WHATSAPP_NEXOATIVO = "https://wa.me/5522999990000";

const ATUALIZADO_EM_ISO = "2026-11-18T10:00:00.000Z";

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
    readonly valorAdicionalCentavos?: number;
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
      ...(opcao.valorAdicionalCentavos !== undefined
        ? { valorAdicionalCentavos: opcao.valorAdicionalCentavos }
        : {}),
      proximaEtapaIdOpcional: opcao.proximaEtapaIdOpcional,
    })),
  });
}

function criarEtapaEscolhaMultipla(
  id: string,
  titulo: string,
  opcoes: readonly {
    readonly id: string;
    readonly rotulo: string;
    readonly descricaoCurta?: string;
    readonly valorAdicionalCentavos?: number;
  }[],
  proximaEtapaPadraoId: string,
  subtituloOpcional?: string,
): EtapaMicrofluxo {
  return converterEtapaParaLivre({
    id,
    titulo,
    ...(subtituloOpcional ? { subtituloOpcional } : {}),
    tipoEtapa: "selecao_multipla",
    obrigatoria: true,
    proximaEtapaPadraoId,
    opcoes: opcoes.map((opcao) => ({
      id: opcao.id,
      rotulo: opcao.rotulo,
      ...(opcao.descricaoCurta ? { descricaoCurta: opcao.descricaoCurta } : {}),
      ...(opcao.valorAdicionalCentavos !== undefined
        ? { valorAdicionalCentavos: opcao.valorAdicionalCentavos }
        : {}),
    })),
  });
}

function anexarConclusaoWhatsappPadrao(
  fluxoSemConclusao: DefinicaoMicrofluxo,
  rotuloBotaoWhatsapp: string,
  incluirDemonstrativo = false,
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
          numeroOpcional: WHATSAPP_NEXOATIVO_NUMERO,
        },
        {
          tipo: "home",
          rotulo: "Voltar à vitrine Nexo Ativo",
        },
      ],
      resumo: {
        ativo: true,
        campos,
        incluirDemonstrativo,
      },
      camposWhatsapp: campos,
    },
  };
}

const FLUXO_SIMULAR_PROJETO_NEXOATIVO: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-simular-projeto-nexoativo",
    organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-simular-projeto-nexoativo",
    titulo: "Simular vitrine e fluxos para o meu negócio",
    rotuloBotaoHome: "Simular projeto para o meu negócio",
    subtituloBotaoHome: "Descubra como estruturar seus microfluxos e veja a estimativa na hora",
    iconeBotaoHome: "sparkles",
    destaquePrimarioHome: true,
    animarBordaDestaque: true,
    ordemHome: 0,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Configure em poucos cliques a estrutura ideal de atendimento interativo, catálogo e cartões digitais para a sua empresa.",
    textoBotaoConclusao: "Gerar diagnóstico e proposta",
    mensagemConfirmacaoTitulo: "Diagnóstico da sua vitrine concluído!",
    mensagemConfirmacaoCorpo:
      "Registramos as prioridades do seu negócio. Toque abaixo para enviar o diagnóstico no WhatsApp de Andrés Contreras e receber uma demonstração aplicada à sua marca.",
    regraCalculoComercial: {
      modalidade: "base_mais_adicionais",
      rotuloBase: "Assinatura Mensal Plano Pro (Vitrine + Microfluxos + até 10 Cartões)",
      valorBaseCentavos: 8700,
      observacaoTransparencia:
        "Assinatura mensal de R$ 87,00 sem fidelidade. O serviço de Implantação Assistida (quando selecionado) é pago uma única vez.",
    },
    etapaInicialId: "etapa-segmento-negocio",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-segmento-negocio",
        "Qual é o segmento principal da sua empresa ou atuação?",
        [
          {
            id: "seg-veiculos-seguros",
            rotulo: "Concessionárias, Seminovos ou Corretoras de Seguros",
            descricaoCurta: "Foco em cotação rápida, avaliação de troca, financiamento e estoque",
            proximaEtapaIdOpcional: "etapa-foco-comercial",
          },
          {
            id: "seg-saude-juridico",
            rotulo: "Clínicas, Médicos, Dentistas ou Escritórios de Advocacia",
            descricaoCurta: "Triagem qualificada com conformidade ética (CFM, CFO e OAB)",
            proximaEtapaIdOpcional: "etapa-foco-regulamentado",
          },
          {
            id: "seg-educacao-arquitetura-servicos",
            rotulo: "Escolas, Arquitetura, Imobiliárias ou Empresas de Serviços",
            descricaoCurta: "Agendamento de visitas, portfólio visual, vídeos e orçamento",
            proximaEtapaIdOpcional: "etapa-foco-comercial",
          },
        ],
        "O motor adapta as perguntas seguintes de acordo com a sua escolha.",
      ),
      criarEtapaEscolhaMultipla(
        "etapa-foco-comercial",
        "Quais experiências você quer ativar para os seus clientes?",
        [
          {
            id: "rec-qualificacao-whatsapp",
            rotulo: "Microfluxos de cotação/simulação antes do WhatsApp",
            descricaoCurta: "O cliente já chega com veículo, serviço ou perfil preenchido",
          },
          {
            id: "rec-catalogo-vitrine",
            rotulo: "Mostruário de Produtos, Serviços e Portfólio na vitrine",
            descricaoCurta: "Carrossel ou grade interativa com detalhes em bottom sheet",
          },
          {
            id: "rec-cartoes-equipe-qr",
            rotulo: "Cartões Digitais e QR Codes individuais para vendedores/equipe",
            descricaoCurta: "Link próprio, vCard na agenda e métricas de conversão por consultor",
          },
          {
            id: "rec-posts-avaliacoes",
            rotulo: "Comunicados nativos (Posts) + Avaliações reais do Google",
            descricaoCurta: "Prova social automática e campanhas sem tirar o cliente da página",
          },
        ],
        "etapa-modalidade-implantacao",
        "Selecione todas as funcionalidades que fazem sentido para a sua operação.",
      ),
      criarEtapaEscolhaMultipla(
        "etapa-foco-regulamentado",
        "O que é essencial para o seu consultório ou escritório?",
        [
          {
            id: "reg-triagem-previa",
            rotulo: "Triagem inicial de pacientes ou clientes pelo WhatsApp",
            descricaoCurta: "Direciona a especialidade ou área de atuação antes do atendimento",
          },
          {
            id: "reg-conformidade-conselho",
            rotulo: "Modo de conformidade ética (OAB, CFM ou CFO)",
            descricaoCurta: "Proteção automática das regras publicitárias do seu conselho",
          },
          {
            id: "reg-cartoes-socios",
            rotulo: "Cartões Digitais individuais para sócios e especialistas",
            descricaoCurta: "Com registro profissional (CRM/CRO/OAB), QR Code e salvar contato",
          },
          {
            id: "reg-areas-atuacao",
            rotulo: "Apresentação sóbria de especialidades e corpo clínico/jurídico",
            descricaoCurta: "Design autoral que transmite autoridade no celular e no computador",
          },
        ],
        "etapa-modalidade-implantacao",
        "Selecione os recursos que deseja explorar na demonstração.",
      ),
      criarEtapaEscolhaUnica(
        "etapa-modalidade-implantacao",
        "Como você prefere colocar sua vitrine Nexo Ativo no ar?",
        [
          {
            id: "imp-autonoma",
            rotulo: "Eu mesmo quero configurar pelo painel intuitivo",
            descricaoCurta: "Acesso imediato ao editor visual de aparência, catálogo e fluxos",
            valorAdicionalCentavos: 0,
            proximaEtapaIdOpcional: "etapa-contexto-marca",
          },
          {
            id: "imp-assistida",
            rotulo: "Quero a Implantação Assistida pela equipe Nexo Ativo (+ R$ 297 único)",
            descricaoCurta:
              "Entregamos sua vitrine, identidade, catálogo e microfluxos prontos para publicar",
            valorAdicionalCentavos: 29700,
            proximaEtapaIdOpcional: "etapa-contexto-marca",
          },
        ],
        "Observe que o demonstrativo comercial soma automaticamente se escolher a implantação assistida.",
      ),
      criarEtapaFormulario(
        "etapa-contexto-marca",
        "Sobre a sua marca",
        [
          criarCampo(
            "nome-empresa",
            "Nome da sua empresa ou escritório",
            "texto_curto",
            true,
            "Ex.: Clínica Vida, Construtora Horizonte, Advocacia Silva...",
          ),
          criarCampo(
            "instagram-ou-site",
            "Instagram ou site atual (opcional)",
            "texto_curto",
            false,
            "Ex.: @suaempresa ou www.suaempresa.com.br",
          ),
          {
            id: "tamanho-equipe",
            rotulo: "Quantas pessoas atendem clientes na equipe hoje?",
            tipo: "selecao_unica",
            obrigatorio: true,
            opcoesCustomizadas: [
              "Apenas eu (Profissional individual)",
              "De 2 a 5 especialistas / consultores",
              "De 6 a 10 especialistas / consultores",
              "Mais de 10 profissionais (Operação Empresarial)",
            ],
          },
        ],
        "etapa-contato",
        "Com esses dados preparamos uma prévia real para a sua apresentação.",
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Enviar diagnóstico para Andrés no WhatsApp",
  true,
);

const FLUXO_TOUR_EXPERIENCIAS: DefinicaoMicrofluxo = anexarConclusaoWhatsappPadrao(
  {
    id: "fluxo-tour-experiencias",
    organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "#fluxo-tour-experiencias",
    titulo: "Testar exemplos de fluxos por segmento",
    rotuloBotaoHome: "Testar fluxos prontos por segmento",
    subtituloBotaoHome: "Experimente na prática como o seu cliente será atendido",
    iconeBotaoHome: "camadas",
    destaquePrimarioHome: false,
    ordemHome: 1,
    ativo: true,
    ativoNaHome: true,
    versaoPublicada: 1,
    atualizadoEmIso: ATUALIZADO_EM_ISO,
    descricaoCurta:
      "Escolha um cenário real abaixo para sentir a velocidade e a clareza de um microfluxo Nexo Ativo sob a ótica do visitante.",
    textoBotaoConclusao: "Quero um fluxo assim na minha página",
    mensagemConfirmacaoTitulo: "Experiência testada com sucesso!",
    mensagemConfirmacaoCorpo:
      "Viu como é rápido? Em vez de o cliente mandar apenas um 'Oi, qual o valor?' no WhatsApp, ele já chega qualificado e com protocolo registrado no seu painel.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapaInicialId: "etapa-escolha-cenario",
    etapas: [
      criarEtapaEscolhaUnica(
        "etapa-escolha-cenario",
        "Qual cenário prático você quer simular agora?",
        [
          {
            id: "cenario-cotacao-rapida",
            rotulo: "Cotação / Financiamento / Troca (Veículos & Seguros)",
            descricaoCurta: "Coleta o interesse, modelo e perfil antes de abrir o WhatsApp",
            proximaEtapaIdOpcional: "etapa-simulacao-cotacao",
          },
          {
            id: "cenario-agendamento-triagem",
            rotulo: "Triagem de Consulta ou Reunião (Saúde, Direito & Educação)",
            descricaoCurta: "Identifica a demanda e a preferência de turno com elegância",
            proximaEtapaIdOpcional: "etapa-simulacao-triagem",
          },
          {
            id: "cenario-orcamento-catalogo",
            rotulo: "Solicitação de Orçamento / Projeto (Arquitetura & Serviços B2B)",
            descricaoCurta: "Qualifica escopo, prazo e necessidade técnica do cliente",
            proximaEtapaIdOpcional: "etapa-simulacao-orcamento",
          },
        ],
        "Toque em qualquer opção para ver o formulário dinâmico daquele nicho.",
      ),
      criarEtapaFormulario(
        "etapa-simulacao-cotacao",
        "Exemplo: Cotação Automotiva ou Seguro",
        [
          {
            id: "tipo-negociacao-demo",
            rotulo: "O que você deseja fazer?",
            tipo: "selecao_unica",
            obrigatorio: true,
            opcoesCustomizadas: [
              "Simular financiamento com entrada ou veículo na troca",
              "Cotar seguro novo ou renovar apólice com bônus",
              "Vender meu veículo atual com avaliação rápida",
            ],
          },
          criarCampo(
            "modelo-interesse-demo",
            "Qual veículo ou bem você quer cotar? (Teste livre)",
            "texto_curto",
            true,
            "Ex.: Jeep Compass 2024, Corolla XEi...",
          ),
        ],
        "etapa-contato",
        "No cliente real, essas respostas vão direto para o vendedor escolhido.",
      ),
      criarEtapaFormulario(
        "etapa-simulacao-triagem",
        "Exemplo: Triagem de Atendimento ou Visita",
        [
          {
            id: "modalidade-atendimento-demo",
            rotulo: "Qual modalidade você procura?",
            tipo: "selecao_unica",
            obrigatorio: true,
            opcoesCustomizadas: [
              "Atendimento presencial (Consulta / Visita guiada)",
              "Reunião online por videoconferência",
              "Análise preliminar de caso ou documentação",
            ],
          },
          {
            id: "turno-preferencia-demo",
            rotulo: "Melhor período para a sua agenda",
            tipo: "selecao_unica",
            obrigatorio: true,
            opcoesCustomizadas: ["Manhã (08h às 12h)", "Tarde (13h às 18h)", "Horário flexível"],
          },
        ],
        "etapa-contato",
        "Ideal para clínicas, escritórios e escolas bilíngues.",
      ),
      criarEtapaFormulario(
        "etapa-simulacao-orcamento",
        "Exemplo: Escopo de Projeto ou Consultoria",
        [
          {
            id: "momento-projeto-demo",
            rotulo: "Em que fase está a sua necessidade?",
            tipo: "selecao_unica",
            obrigatorio: true,
            opcoesCustomizadas: [
              "Quero iniciar nos próximos 15 dias",
              "Estou planejando para o próximo mês",
              "Quero comparar soluções e valores de referência",
            ],
          },
          criarCampo(
            "resumo-demanda-demo",
            "Objetivo principal do projeto (Teste livre)",
            "texto_curto",
            true,
            "Ex.: Reforma comercial, consultoria empresarial, implantação...",
          ),
        ],
        "etapa-contato",
        "Perfeito para estúdios, agências, engenheiros e consultorias.",
      ),
      criarEtapaDadosRetorno("etapa-contato"),
    ],
  },
  "Receber proposta de um fluxo como este",
  false,
);

const POST_COMPARATIVO_LINK_BIO: DefinicaoMicrofluxo = {
  id: "post-comparativo-link-bio",
  organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
  tipoAcao: "publicacao_post",
  titulo: "Por que substituir o link na bio comum pelo Nexo Ativo?",
  rotuloBotaoHome: "Por que trocar o link na bio comum?",
  subtituloBotaoHome: "Entenda como microfluxos dobram a qualificação no WhatsApp",
  iconeBotaoHome: "comunicado",
  destaquePrimarioHome: false,
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
  configuracaoPost: {
    tituloPost: "Link na bio estático vs. Presença Digital Nexo Ativo",
    dataTexto: "Guia Estratégico · Nexo Ativo",
    corpoTexto: [
      "A maioria das empresas investe em tráfego pago, Instagram e materiais impressos, mas entrega o visitante em uma árvore de botões genérica que apenas abre o WhatsApp com um 'Olá, gostaria de informações'.",
      "",
      "O resultado? Sua equipe perde tempo fazendo sempre as mesmas perguntas básicas e muitos clientes desistem no meio da espera.",
      "",
      "Com o Nexo Ativo, sua página funciona como um concierge digital da sua marca:",
      "• Microfluxos sob medida: o cliente responde de 2 a 4 passos rápidos e já chega no WhatsApp com nome, interesse, especificações e protocolo registrado.",
      "• Mostruário vivo na própria tela: apresente seus serviços, produtos, vídeos do YouTube e comunicados em gavetas elegantes sem tirar o cliente da sua página.",
      "• Cartões Digitais e QR Codes para a equipe: cada consultor, corretor ou sócio tem seu próprio link e QR Code rastreável com botão de salvar na agenda (vCard).",
      "• Métricas reais sem complicação: acompanhe no painel quantos visitantes vieram do Instagram, de cada QR Code impresso ou de cada cartão da equipe.",
    ].join("\n"),
    cta: {
      tipoAcao: "microfluxo",
      rotuloBotao: "Simular agora para o meu negócio",
      microfluxoId: "fluxo-simular-projeto-nexoativo",
    },
  },
};

export const VITRINE_NEXOATIVO: ConteudoPaginaPublicada = {
  organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
  identificadorPublico: IDENTIFICADOR_PUBLICO_NEXOATIVO,
  publicado: true,
  paginaAtiva: true,
  versaoPublicada: 1,
  atualizadoEmIso: ATUALIZADO_EM_ISO,
  composicaoVisual: "imersivo",
  espacamentoAcoes: "medio",
  paletaId: "noite_mineral",
  tipografiaId: "contemporaneo_minimalista",
  identidade: {
    nomeExibicao: "Nexo Ativo",
    mostrarNomeExibicao: true,
    subtituloCurto: "Presença Digital & Microfluxos Comerciais",
    mostrarSubtituloCurto: true,
    alinhamentoCabecalho: "centro",
    urlLogotipoOpcional: "/logo-nexo-ativo.png",
    cidadeEstado: "Plataforma SaaS Brasileira · Atendimento Nacional",
    telefonePrincipalOpcional: WHATSAPP_NEXOATIVO_NUMERO,
    celularOpcional: WHATSAPP_NEXOATIVO_NUMERO,
    horarioFuncionamentoOpcional: "Segunda a Sexta · Implantação e Suporte Dedicado",
  },
  chamadaEditorial: {
    sobretituloOpcional: "Plataforma Oficial Nexo Ativo",
    tituloPrincipal: "Presença digital autoral com microfluxos que qualificam cada cliente.",
    descricaoCurta:
      "Explore nesta vitrine todos os recursos que sua empresa pode usar para converter visitantes em solicitações reais no WhatsApp.",
  },
  midiaFundo: {
    tipo: "degradado",
    urlPrincipal: "/midias-demonstracao/imersivo-arquitetura-luz.svg",
    degradadoOpcional: {
      corInicial: "#090d16",
      corFinal: "#1e293b",
      anguloGraus: 135,
    },
    textoAlternativo: "Atmosfera mineral escura da vitrine oficial Nexo Ativo.",
    pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
    pontoFocalMobile: { xPercentual: 50, yPercentual: 50 },
    intensidadeVeloEscuro: "equilibrado",
    efeitoCantos: "dots",
    opacidadeDotsCantos: 35,
  },
  acoesPrincipais: [
    {
      id: "acao-fluxo-fluxo-simular-projeto-nexoativo",
      rotulo: "Simular projeto para o meu negócio",
      subtituloDiscreto: "Descubra como estruturar seus microfluxos e veja a estimativa na hora",
      tipoDestino: "microfluxo",
      destino: "#fluxo-simular-projeto-nexoativo",
      destaquePrincipal: true,
      animarBordaDestaque: true,
      icone: "sparkles",
    },
    {
      id: "acao-fluxo-fluxo-tour-experiencias",
      rotulo: "Testar fluxos prontos por segmento",
      subtituloDiscreto: "Experimente na prática como o seu cliente será atendido",
      tipoDestino: "microfluxo",
      destino: "#fluxo-tour-experiencias",
      icone: "camadas",
    },
    {
      id: "acao-fluxo-post-comparativo-link-bio",
      rotulo: "Por que trocar o link na bio comum?",
      subtituloDiscreto: "Entenda como microfluxos dobram a qualificação no WhatsApp",
      tipoDestino: "publicacao_post",
      destino: "#post-post-comparativo-link-bio",
      icone: "comunicado",
      configuracaoPost: POST_COMPARATIVO_LINK_BIO.configuracaoPost,
    },
    {
      id: "acao-fluxo-acao-recursos-plataforma",
      rotulo: "Recursos disponíveis para a sua vitrine",
      subtituloDiscreto: "Toque em cada módulo para ver como aplicamos na sua empresa",
      tituloSecao: "Módulos da Plataforma Nexo Ativo",
      tipoDestino: "secao_servicos",
      destino: "#servicos",
      icone: "catalogo",
      modoExibicaoColecao: "carrossel",
      configuracaoCtaAcervo: {
        tipoAcao: "microfluxo",
        rotuloBotao: "Simular com este recurso",
        microfluxoId: "fluxo-simular-projeto-nexoativo",
      },
    },
    {
      id: "acao-fluxo-acao-equipe-nexoativo",
      rotulo: "Falar com Andrés Contreras (Cartão Digital)",
      subtituloDiscreto: "Veja na prática o cartão digital com QR Code e vCard na agenda",
      tituloSecao: "Especialistas Nexo Ativo",
      tipoDestino: "secao_equipe",
      destino: "#equipe",
      icone: "equipe",
      posicionamentoEquipe: {
        desktop: "lista_acoes",
        mobile: "lista_acoes",
      },
    },
  ],
  redesSociais: [
    {
      id: "rede-whatsapp-nexoativo",
      rede: "whatsapp",
      url: URL_WHATSAPP_NEXOATIVO,
      rotuloAcessivel: "WhatsApp oficial do Nexo Ativo",
    },
    {
      id: "rede-site-nexoativo",
      rede: "site",
      url: "https://nexoativo.com.br",
      rotuloAcessivel: "Plataforma oficial nexoativo.com.br",
    },
  ],
  obrasDestaqueGaleria: [],
  seo: {
    tituloSeo: "Nexo Ativo — Presença Digital Editorial & Microfluxos Comerciais",
    descricaoSeo:
      "Transforme visitas do Instagram e QR Codes em solicitações qualificadas no WhatsApp. Conheça as soluções interativas do Nexo Ativo.",
    indexavel: true,
  },
};

export const ACERVO_NEXOATIVO: AcervoPublicoVitrine = {
  servicos: [
    {
      id: "srv-nexo-microfluxos",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      nome: "Microfluxos Comerciais com Ramificação",
      resumo:
        "Substitua formulários frios e listas de links por percursos guiados. Cada resposta do visitante direciona a próxima pergunta, calcula estimativas em tempo real e entrega o resumo pronto no seu WhatsApp e no painel.",
      categoria: "Conversão & Qualificação",
      precoBaseCentavos: 8700,
      rotuloPrecoOpcional: "Incluso no Plano Pro",
      prazoOuDuracao: "Ativação imediata",
      urlImagemOpcional: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
      pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
      ordemExibicao: 0,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-nexo-cartoes-qrcode",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      nome: "Cartões Digitais & Central de QR Codes",
      resumo:
        "Cada integrante da sua equipe ganha um cartão digital exclusivo com link próprio, QR Code em alta resolução, salvamento de contato na agenda (vCard) e atribuição automática de solicitações.",
      categoria: "Equipes & Atendimento",
      rotuloPrecoOpcional: "Até 10 cartões no Pro",
      prazoOuDuracao: "Rastreamento por QR Code",
      urlImagemOpcional: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      pontoFocalImagem: { xPercentual: 50, yPercentual: 45 },
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-nexo-catalogo-posts",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      nome: "Acervo Interativo, Vídeos & Comunicados",
      resumo:
        "Apresente produtos, serviços, vídeos do YouTube e artigos/avisos diretamente na vitrine, com exibição em carrossel, grade de 2 colunas ou gaveta editorial.",
      categoria: "Vitrine & Conteúdo",
      rotuloPrecoOpcional: "Personalização visual",
      prazoOuDuracao: "Edição em tempo real",
      urlImagemOpcional: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg",
      pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
      ordemExibicao: 2,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "srv-nexo-governanca-metricas",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      nome: "Avaliações Google, Telemetria & Conformidade Ética",
      resumo:
        "Exiba sua nota e comentários oficiais do Google, acompanhe o funil completo por canal de origem (100% LGPD sem cookies invasivos) e conte com perfis dedicados para OAB, CFM e CFO.",
      categoria: "Autoridade & Inteligência",
      rotuloPrecoOpcional: "Implantação Assistida opcional",
      prazoOuDuracao: "Painel de métricas diário",
      urlImagemOpcional: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg",
      pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
      ordemExibicao: 3,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
  ],
  produtos: [
    {
      id: "prd-nexo-plano-pro",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      nome: "Plano Pro — Nexo Ativo",
      resumo:
        "Vitrine editorial completa, microfluxos ilimitados, catálogo de serviços e produtos, avaliações do Google, até 10 profissionais com cartões digitais e 300 alertas de solicitações por e-mail/mês.",
      categoria: "Assinatura Mensal",
      precoCentavos: 8700,
      disponibilidade: "disponivel",
      especificacoesCurtas: [
        "Até 10 profissionais ativos",
        "Microfluxos e QR Codes",
        "Catálogo, Posts e Vídeos",
        "Sem fidelidade",
      ],
      urlImagemPrincipal: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
      textoAlternativoImagem: "Apresentação do Plano Pro Nexo Ativo",
      pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
      ordemExibicao: 0,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
    {
      id: "prd-nexo-implantacao-assistida",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      nome: "Implantação Assistida Completa",
      resumo:
        "Nossa equipe configura toda a identidade visual, cadastra seu catálogo inicial, desenha seus microfluxos comerciais e entrega sua página pronta para divulgar.",
      categoria: "Serviço Opcional Único",
      precoCentavos: 29700,
      disponibilidade: "disponivel",
      especificacoesCurtas: [
        "Taxa única de R$ 297",
        "Design e paleta calibrados",
        "Fluxos desenhados sob medida",
        "Treinamento rápido da equipe",
      ],
      urlImagemPrincipal: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      textoAlternativoImagem: "Implantação Assistida Nexo Ativo",
      pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
  ],
  projetosPortfolio: [],
  profissionais: [
    {
      id: "prof-andres-contreras",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      identificadorCartao: "andres-contreras",
      nomeCompleto: "Andrés Contreras",
      cargoOuEspecialidade: "Fundador & Especialista em Presença Digital e Conversão",
      minibiografia:
        "Ajudo empresas e profissionais a transformarem o link da bio e QR Codes em canais de atendimento inteligente, qualificando cada cliente antes de chegar ao WhatsApp.",
      urlFotoPerfil: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      pontoFocalFoto: { xPercentual: 50, yPercentual: 32 },
      emailContatoOpcional: EMAIL_ADMIN_NEXOATIVO,
      whatsappOpcional: WHATSAPP_NEXOATIVO_DIGITOS,
      aceitaSolicitacoesDiretas: true,
      ordemExibicao: 0,
      ativo: true,
      atualizadoEmIso: ATUALIZADO_EM_ISO,
    },
  ],
  microfluxos: [
    FLUXO_SIMULAR_PROJETO_NEXOATIVO,
    FLUXO_TOUR_EXPERIENCIAS,
    POST_COMPARATIVO_LINK_BIO,
    {
      id: "acao-recursos-plataforma",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      tipoAcao: "secao_servicos",
      titulo: "Recursos disponíveis para a sua vitrine",
      rotuloBotaoHome: "Recursos disponíveis para a sua vitrine",
      subtituloBotaoHome: "Toque em cada módulo para ver como aplicamos na sua empresa",
      tituloSecao: "Módulos da Plataforma Nexo Ativo",
      iconeBotaoHome: "catalogo",
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
      modoExibicaoColecao: "carrossel",
      configuracaoCtaAcervo: {
        tipoAcao: "microfluxo",
        rotuloBotao: "Simular com este recurso",
        microfluxoId: "fluxo-simular-projeto-nexoativo",
      },
    },
    {
      id: "acao-equipe-nexoativo",
      organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
      tipoAcao: "secao_equipe",
      titulo: "Falar com Andrés Contreras (Cartão Digital)",
      rotuloBotaoHome: "Falar com Andrés Contreras (Cartão Digital)",
      subtituloBotaoHome: "Veja na prática o cartão digital com QR Code e vCard na agenda",
      tituloSecao: "Especialistas Nexo Ativo",
      iconeBotaoHome: "equipe",
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
      posicionamentoEquipe: {
        desktop: "lista_acoes",
        mobile: "lista_acoes",
      },
    },
  ],
};

