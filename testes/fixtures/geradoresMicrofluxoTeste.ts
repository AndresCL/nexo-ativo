import type { ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";

export type ModeloMicrofluxoTeste =
  "catalogo" | "diagnostico" | "financiamento" | "profissional" | "atendimento";

/**
 * Fixture de apoio para testes automatizados de validação de grafo, DAG e motor comercial.
 * Exclusivo para suíte de testes - não utilizado em produção.
 */
export function criarMicrofluxoPadraoParaTestes(parametros: {
  readonly organizacaoId: string;
  readonly nomeOrganizacao: string;
  readonly modelo: ModeloMicrofluxoTeste;
  readonly servicos?: readonly ServicoOrganizacao[];
  readonly agoraIso?: string;
}): DefinicaoMicrofluxo {
  const agoraIso = parametros.agoraIso ?? new Date().toISOString();
  const { organizacaoId, nomeOrganizacao, modelo, servicos } = parametros;
  const ancora = `#fluxo-${modelo}`;
  const primeiroServicoId = servicos?.[0]?.id;
  const segundoServicoId = servicos?.[1]?.id ?? primeiroServicoId;

  if (modelo === "catalogo") {
    return {
      id: `fluxo-${modelo}`,
      organizacaoId,
      ancoraAcionamento: ancora,
      titulo: "Explorar opções e formatos",
      descricaoCurta: `Navegue pelas modalidades disponíveis em ${nomeOrganizacao} e selecione a opção desejada.`,
      textoBotaoConclusao: "Solicitar informações sobre este item",
      mensagemConfirmacaoTitulo: "Interesse registrado com sucesso",
      mensagemConfirmacaoCorpo:
        "Recebemos sua seleção e retornaremos em breve com disponibilidade e próximos passos.",
      etapaInicialId: "etapa-catalogo",
      etapas: [
        {
          id: "etapa-catalogo",
          tipoEtapa: "selecao_catalogo",
          titulo: "Escolha o item ou modalidade de seu interesse",
          subtituloOpcional: "Seleção direta sem necessidade de questionário prévio.",
          obrigatoria: true,
          fonteCatalogo: "ambos",
          proximaEtapaPadraoId: "etapa-contato",
        },
        {
          id: "etapa-contato",
          tipoEtapa: "coleta_contato",
          titulo: "Para onde enviamos os detalhes e disponibilidade?",
          subtituloOpcional: "Seus dados são utilizados exclusivamente para este retorno.",
          obrigatoria: true,
        },
      ],
      regraCalculoComercial: {
        modalidade: "quantidade_vezes_preco",
        rotuloBase: "Item selecionado no catálogo",
        valorBaseCentavos: 0,
        unidadeQuantidade: "unid.",
        quantidadeMinima: 1,
        quantidadeMaxima: 50,
        observacaoTransparencia:
          "Valor calculado deterministicamente conforme a quantidade selecionada.",
      },
      ativo: true,
      atualizadoEmIso: agoraIso,
    };
  }

  if (modelo === "diagnostico") {
    return {
      id: `fluxo-${modelo}`,
      organizacaoId,
      ancoraAcionamento: ancora,
      titulo: "Descobrir a modalidade ideal",
      descricaoCurta:
        "Responda duas perguntas rápidas para identificarmos o enquadramento mais adequado.",
      textoBotaoConclusao: "Receber orientação personalizada",
      mensagemConfirmacaoTitulo: "Diagnóstico inicial concluído",
      mensagemConfirmacaoCorpo:
        "Nossa equipe analisará seu perfil e entrará em contato pelo canal informado.",
      etapaInicialId: "etapa-momento",
      etapas: [
        {
          id: "etapa-momento",
          tipoEtapa: "selecao_unica",
          titulo: "Qual é o objetivo principal da sua demanda hoje?",
          obrigatoria: true,
          proximaEtapaPadraoId: "etapa-recomendacao",
          opcoes: [
            {
              id: "opc-orientacao",
              rotulo: "Diagnóstico e orientação estratégica inicial",
              descricaoCurta: "Entender possibilidades, prazos e viabilidade.",
              ...(primeiroServicoId ? { servicoRecomendadoId: primeiroServicoId } : {}),
            },
            {
              id: "opc-execucao",
              rotulo: "Execução completa de projeto ou acompanhamento",
              descricaoCurta: "Demanda definida pronta para contratação.",
              ...(segundoServicoId ? { servicoRecomendadoId: segundoServicoId } : {}),
            },
          ],
        },
        {
          id: "etapa-recomendacao",
          tipoEtapa: "recomendacao_catalogo",
          titulo: "Modalidade recomendada para o seu momento",
          obrigatoria: false,
          tituloRecomendacaoPadrao: `Atendimento Consultivo — ${nomeOrganizacao}`,
          descricaoRecomendacaoPadrao:
            "Condução personalizada estruturada de acordo com o perfil e a prioridade da sua demanda.",
          proximaEtapaPadraoId: "etapa-contato",
        },
        {
          id: "etapa-contato",
          tipoEtapa: "coleta_contato",
          titulo: "Como podemos enviar nossa proposta ou agendar sua conversa?",
          obrigatoria: true,
        },
      ],
      ativo: true,
      atualizadoEmIso: agoraIso,
    };
  }

  if (modelo === "financiamento") {
    return {
      id: `fluxo-${modelo}`,
      organizacaoId,
      ancoraAcionamento: ancora,
      titulo: "Planejar meu projeto",
      descricaoCurta: "Organize as prioridades e o horizonte de prazo antes da nossa conversa.",
      textoBotaoConclusao: "Enviar financiamento para análise",
      mensagemConfirmacaoTitulo: "Solicitação de financiamento recebida",
      mensagemConfirmacaoCorpo:
        "Seu resumo foi registrado. Prepararemos uma estimativa alinhada ao escopo selecionado.",
      etapaInicialId: "etapa-prioridades",
      etapas: [
        {
          id: "etapa-prioridades",
          tipoEtapa: "selecao_multipla",
          titulo: "Quais frentes fazem parte do que você deseja planejar?",
          subtituloOpcional: "Você pode marcar mais de uma opção.",
          obrigatoria: true,
          proximaEtapaPadraoId: "etapa-prazo",
          opcoes: [
            {
              id: "item-concepcao",
              rotulo: "Estudo inicial e concepção",
              valorAdicionalCentavos: 180000,
            },
            {
              id: "item-detalhamento",
              rotulo: "Projeto executivo / detalhamento técnico",
              valorAdicionalCentavos: 420000,
            },
            {
              id: "item-acompanhamento",
              rotulo: "Acompanhamento e curadoria presencial",
              valorAdicionalCentavos: 290000,
            },
          ],
        },
        {
          id: "etapa-prazo",
          tipoEtapa: "selecao_unica",
          titulo: "Qual é a sua expectativa de início?",
          obrigatoria: true,
          proximaEtapaPadraoId: "etapa-contato",
          opcoes: [
            { id: "prazo-imediato", rotulo: "Imediato (próximas semanas)" },
            { id: "prazo-trimestre", rotulo: "Nos próximos 2 a 3 meses" },
            { id: "prazo-financiamento", rotulo: "Apenas estruturando orçamento preliminar" },
          ],
        },
        {
          id: "etapa-contato",
          tipoEtapa: "coleta_contato",
          titulo: "Informe seu contato para receber o plano preliminar",
          obrigatoria: true,
        },
      ],
      regraCalculoComercial: {
        modalidade: "base_mais_adicionais",
        rotuloBase: "Valor base para financiamento",
        valorBaseCentavos: 240000,
        observacaoTransparencia:
          "Estimativa preliminar somando a base técnica às frentes selecionadas.",
      },
      ativo: true,
      atualizadoEmIso: agoraIso,
    };
  }

  if (modelo === "profissional") {
    return {
      id: `fluxo-${modelo}`,
      organizacaoId,
      ancoraAcionamento: ancora,
      titulo: "Conectar com especialista",
      descricaoCurta:
        "Escolha com qual integrante falar ou direcione seu atendimento para a área adequada.",
      textoBotaoConclusao: "Solicitar contato do especialista",
      mensagemConfirmacaoTitulo: "Direcionamento confirmado",
      mensagemConfirmacaoCorpo: "O especialista selecionado receberá sua mensagem diretamente.",
      etapaInicialId: "etapa-profissional",
      etapas: [
        {
          id: "etapa-profissional",
          tipoEtapa: "selecao_profissional",
          titulo: "Com qual especialista você gostaria de iniciar seu atendimento?",
          obrigatoria: true,
          proximaEtapaPadraoId: "etapa-contato",
        },
        {
          id: "etapa-contato",
          tipoEtapa: "coleta_contato",
          titulo: "Seus dados para retorno direto",
          obrigatoria: true,
        },
      ],
      ativo: true,
      atualizadoEmIso: agoraIso,
    };
  }

  return {
    id: `fluxo-${modelo}`,
    organizacaoId,
    ancoraAcionamento: ancora,
    titulo: "Solicitar atendimento",
    descricaoCurta: `Informe brevemente sua necessidade para que ${nomeOrganizacao} retorne com agilidade.`,
    textoBotaoConclusao: "Enviar solicitação",
    mensagemConfirmacaoTitulo: "Solicitação enviada com sucesso",
    mensagemConfirmacaoCorpo:
      "Recebemos seus dados e retornaremos pelo canal informado no menor prazo possível.",
    etapaInicialId: "etapa-catalogo",
    etapas: [
      {
        id: "etapa-catalogo",
        tipoEtapa: "selecao_catalogo",
        titulo: "Qual serviço ou modalidade motiva seu contato?",
        subtituloOpcional: "Selecione a frente principal para direcionarmos seu atendimento.",
        obrigatoria: true,
        fonteCatalogo: "servicos",
        proximaEtapaPadraoId: "etapa-contexto",
      },
      {
        id: "etapa-contexto",
        tipoEtapa: "entrada_curta",
        titulo: "Como podemos ajudar você neste momento?",
        subtituloOpcional: "Descreva em poucas palavras o objetivo do seu contato.",
        obrigatoria: true,
        placeholderEntrada: "Ex.: Gostaria de agendar uma reunião inicial sobre meu projeto...",
        proximaEtapaPadraoId: "etapa-contato",
      },
      {
        id: "etapa-contato",
        tipoEtapa: "coleta_contato",
        titulo: "Seus dados para retorno",
        subtituloOpcional: "Entraremos em contato por WhatsApp ou e-mail conforme sua preferência.",
        obrigatoria: true,
      },
    ],
    ativo: true,
    atualizadoEmIso: agoraIso,
  };
}

export function criarColecaoMicrofluxosPadraoParaTestes(parametros: {
  readonly organizacaoId: string;
  readonly nomeOrganizacao: string;
  readonly servicos?: readonly ServicoOrganizacao[];
  readonly agoraIso?: string;
}): readonly DefinicaoMicrofluxo[] {
  const modelos: readonly ModeloMicrofluxoTeste[] = [
    "atendimento",
    "catalogo",
    "diagnostico",
    "financiamento",
    "profissional",
  ];

  return modelos.map((modelo) =>
    criarMicrofluxoPadraoParaTestes({
      ...parametros,
      modelo,
    }),
  );
}
