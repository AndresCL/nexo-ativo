import { obterRespostaLegivelBloco } from "../microfluxos/composicaoEtapaLivre";
import type { DemonstrativoCalculoComercialImutavel } from "../comercial/tiposCalculoComercial";
import type { RespostasExecucaoMicrofluxo } from "../microfluxos/motorExecucaoMicrofluxo";
import type { DefinicaoMicrofluxo } from "../microfluxos/tiposMicrofluxo";
import { normalizarNumeroWhatsappInternacional } from "../servicos/numeroWhatsappInternacional";

export type SituacaoSolicitacaoComercial =
  "nova" | "em_atendimento" | "proposta_enviada" | "concluida" | "arquivada";

export const DESCRITORES_SITUACAO_SOLICITACAO: Readonly<
  Record<
    SituacaoSolicitacaoComercial,
    {
      readonly rotulo: string;
      readonly descricao: string;
    }
  >
> = {
  nova: {
    rotulo: "Nova",
    descricao: "Acabou de chegar pela vitrine e aguarda primeiro retorno.",
  },
  em_atendimento: {
    rotulo: "Em atendimento",
    descricao: "Conversa iniciada com o visitante.",
  },
  proposta_enviada: {
    rotulo: "Proposta enviada",
    descricao: "Orçamento, agendamento ou proposta em análise pelo cliente.",
  },
  concluida: {
    rotulo: "Concluída",
    descricao: "Atendimento ou contratação efetivada com sucesso.",
  },
  arquivada: {
    rotulo: "Arquivada",
    descricao: "Solicitação encerrada ou fora de escopo.",
  },
};

export interface ItemRespostaRegistradaSolicitacao {
  readonly etapaId: string;
  readonly pergunta: string;
  readonly respostaTexto: string;
}

export interface SolicitacaoComercial {
  readonly id: string;
  readonly organizacaoId: string;
  readonly identificadorPublicoOrganizacao: string;
  readonly microfluxoId: string;
  readonly tituloExperiencia: string;
  readonly versaoMicrofluxo: number | null;
  readonly nomeVisitante: string;
  readonly telefoneOuWhatsapp: string;
  readonly emailVisitante?: string;
  readonly mensagemAdicional?: string;
  readonly servicoId?: string;
  readonly servicoNome?: string;
  readonly produtoId?: string;
  readonly produtoNome?: string;
  readonly profissionalId?: string;
  readonly profissionalNome?: string;
  readonly quantidadeComercial?: number;
  readonly respostasRegistradas: readonly ItemRespostaRegistradaSolicitacao[];
  readonly demonstrativoComercialCongelado?: DemonstrativoCalculoComercialImutavel | null;
  readonly situacao: SituacaoSolicitacaoComercial;
  readonly observacoesInternas?: string;
  readonly chaveIdempotencia: string;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

/**
 * Gera um identificador determinístico de idempotência em janelas de 10 minutos
 * para evitar solicitações duplicadas por clique duplo ou reenvio acidental.
 */
export function gerarChaveIdempotenciaSolicitacao(parametros: {
  readonly organizacaoId: string;
  readonly microfluxoId: string;
  readonly telefoneOuWhatsapp: string;
  readonly servicoId?: string;
  readonly produtoId?: string;
  readonly timestampReferenciaMs?: number;
}): string {
  const apenasDigitosTelefone = parametros.telefoneOuWhatsapp.replace(/\D/g, "");
  const janelaDezMinutos = Math.floor(
    (parametros.timestampReferenciaMs ?? Date.now()) / (10 * 60 * 1000),
  );
  const itemAlvo = parametros.servicoId ?? parametros.produtoId ?? "geral";

  const baseBruta = [
    parametros.organizacaoId,
    parametros.microfluxoId,
    apenasDigitosTelefone,
    itemAlvo,
    String(janelaDezMinutos),
  ]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  return `sol-${baseBruta.slice(0, 96)}`;
}

/**
 * Converte as respostas brutas da execução do microfluxo em pares pergunta/resposta
 * legíveis e preservados historicamente mesmo que as etapas sejam editadas depois.
 */
export function extrairRespostasLegiveisMicrofluxo(
  microfluxo: DefinicaoMicrofluxo,
  respostas: RespostasExecucaoMicrofluxo,
): readonly ItemRespostaRegistradaSolicitacao[] {
  const resultado: ItemRespostaRegistradaSolicitacao[] = [];

  for (const etapa of microfluxo.etapas) {
    if (etapa.tipoEtapa === "etapa_livre") {
      for (const bloco of etapa.blocos ?? []) {
        if (bloco.tipo !== "campo" && bloco.tipo !== "escolha") continue;
        if (bloco.tipo === "campo" && bloco.finalidade) continue;
        const texto = obterRespostaLegivelBloco(etapa, bloco, respostas);
        if (texto)
          resultado.push({
            etapaId: etapa.id,
            pergunta: bloco.tipo === "campo" ? bloco.campo.rotulo : bloco.rotulo,
            respostaTexto: texto,
          });
      }
      continue;
    }
    if (etapa.tipoEtapa === "selecao_unica" && etapa.opcoes) {
      const escolhidaId = respostas.opcoesUnicasPorEtapa[etapa.id];
      if (escolhidaId) {
        const opcao = etapa.opcoes.find((o) => o.id === escolhidaId);
        resultado.push({
          etapaId: etapa.id,
          pergunta: etapa.titulo,
          respostaTexto: opcao?.rotulo ?? escolhidaId,
        });
      }
    }

    if (etapa.tipoEtapa === "selecao_multipla" && etapa.opcoes) {
      const escolhidasIds = respostas.opcoesMultiplasPorEtapa[etapa.id] ?? [];
      if (escolhidasIds.length > 0) {
        const rotulos = escolhidasIds.map((id) => {
          const op = etapa.opcoes?.find((o) => o.id === id);
          return op?.rotulo ?? id;
        });
        resultado.push({
          etapaId: etapa.id,
          pergunta: etapa.titulo,
          respostaTexto: rotulos.join(" · "),
        });
      }
    }

    if (etapa.tipoEtapa === "entrada_curta") {
      const texto = respostas.textosCurtosPorEtapa[etapa.id]?.trim();
      if (texto) {
        resultado.push({
          etapaId: etapa.id,
          pergunta: etapa.titulo,
          respostaTexto: texto,
        });
      }
    }

    if (etapa.campos && etapa.campos.length > 0) {
      const respostasEtapa = respostas.camposDinamicosPorEtapa?.[etapa.id] ?? {};
      const partes: string[] = [];
      for (const campo of etapa.campos) {
        const valor = respostasEtapa[campo.id];
        if (valor !== undefined && valor !== null && String(valor).trim().length > 0) {
          const sufixo = campo.sufixoVisual ? ` ${campo.sufixoVisual}` : "";
          const formatado =
            campo.tipo === "booleano" ? (valor ? "Sim" : "Não") : `${valor}${sufixo}`;
          partes.push(`${campo.rotulo}: ${formatado}`);
        }
      }
      if (partes.length > 0) {
        resultado.push({
          etapaId: etapa.id,
          pergunta: etapa.titulo,
          respostaTexto: partes.join(" | "),
        });
      }
    }
  }

  return resultado;
}

/**
 * Gera link direto para iniciar retorno ao visitante via WhatsApp com mensagem contextual.
 */
export function gerarLinkRetornoWhatsappSolicitacao(
  solicitacao: Pick<
    SolicitacaoComercial,
    | "nomeVisitante"
    | "telefoneOuWhatsapp"
    | "tituloExperiencia"
    | "servicoNome"
    | "produtoNome"
    | "demonstrativoComercialCongelado"
  >,
  nomeOrganizacao: string,
): string {
  const ddiTelefone = normalizarNumeroWhatsappInternacional(solicitacao.telefoneOuWhatsapp) ?? "";

  const itemContextual =
    solicitacao.servicoNome ?? solicitacao.produtoNome ?? solicitacao.tituloExperiencia;
  const trechoValor = solicitacao.demonstrativoComercialCongelado
    ? ` (${solicitacao.demonstrativoComercialCongelado.resumoFormatado})`
    : "";

  const textoMensagem = `Olá, ${solicitacao.nomeVisitante}! Aqui é de ${nomeOrganizacao}. Recebemos sua solicitação sobre "${itemContextual}"${trechoValor} e gostaríamos de dar andamento ao seu atendimento.`;

  return `https://wa.me/${ddiTelefone}?text=${encodeURIComponent(textoMensagem)}`;
}

/**
 * Gera mensagem de agradecimento e solicitação de avaliação Google para WhatsApp.
 */
export function gerarLinkAvaliacaoGoogleWhatsappSolicitacao(
  solicitacao: Pick<SolicitacaoComercial, "nomeVisitante" | "telefoneOuWhatsapp">,
  nomeOrganizacao: string,
  urlAvaliacaoGoogle: string,
): string {
  const ddiTelefone = normalizarNumeroWhatsappInternacional(solicitacao.telefoneOuWhatsapp) ?? "";
  const textoMensagem = `Olá, ${solicitacao.nomeVisitante}! Agradecemos a confiança no atendimento da ${nomeOrganizacao}. Se puder dedicar 30 segundos para avaliar sua experiência no Google, sua opinião é fundamental para nossa equipe: ${urlAvaliacaoGoogle}`;
  return `https://wa.me/${ddiTelefone}?text=${encodeURIComponent(textoMensagem)}`;
}

/**
 * Gera texto limpo de resumo da solicitação para cópia na área de transferência.
 */
export function gerarTextoResumoParaCopia(
  solicitacao: SolicitacaoComercial,
  nomeOrganizacao: string,
): string {
  const linhas: string[] = [
    `*Solicitação Comercial — ${nomeOrganizacao}*`,
    `Cliente: ${solicitacao.nomeVisitante}`,
    `Contato: ${solicitacao.telefoneOuWhatsapp}`,
  ];

  if (solicitacao.emailVisitante) {
    linhas.push(`E-mail: ${solicitacao.emailVisitante}`);
  }

  const interesse =
    solicitacao.servicoNome ?? solicitacao.produtoNome ?? solicitacao.tituloExperiencia;
  linhas.push(`Interesse: ${interesse}`);

  if (solicitacao.demonstrativoComercialCongelado) {
    linhas.push(`Estimativa: ${solicitacao.demonstrativoComercialCongelado.resumoFormatado}`);
  }

  if (solicitacao.respostasRegistradas && solicitacao.respostasRegistradas.length > 0) {
    linhas.push("");
    linhas.push("*Respostas do cliente:*");
    for (const item of solicitacao.respostasRegistradas) {
      linhas.push(`• ${item.pergunta}: ${item.respostaTexto}`);
    }
  }

  if (solicitacao.mensagemAdicional) {
    linhas.push("");
    linhas.push(`*Mensagem:* ${solicitacao.mensagemAdicional}`);
  }

  return linhas.join("\n");
}
