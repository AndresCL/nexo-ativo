import {
  DESCRITORES_SITUACAO_SOLICITACAO,
  type SolicitacaoComercial,
} from "@/dominio/entidades/solicitacaoComercial";
import type {
  LinhaExportacaoSolicitacoes,
  MatrizExportacaoSolicitacoes,
  OpcoesGeracaoMatrizExportacao,
  ValorCelulaExportacao,
} from "./tiposExportacaoSolicitacoes";

function formatarDataHoraIso(iso: string): string {
  try {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return iso;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  } catch {
    return iso;
  }
}

/**
 * Transforma uma lista de solicitações comerciais em uma matriz tabular enxuta.
 * Aplica projeção dinâmica de colunas (elimina colunas 100% vazias) e suporta
 * tanto visão consolidada de respostas quanto colunas abertas por microfluxo.
 */
export function gerarMatrizExportacaoSolicitacoes(
  solicitacoes: readonly SolicitacaoComercial[],
  opcoes: OpcoesGeracaoMatrizExportacao = {},
): MatrizExportacaoSolicitacoes {
  const escopo = opcoes.escopo ?? "ativas";

  const solicitacoesFiltradas = solicitacoes.filter((item) => {
    if (escopo === "ativas" && item.situacao === "arquivada") {
      return false;
    }
    if (escopo === "arquivadas" && item.situacao !== "arquivada") {
      return false;
    }
    if (
      opcoes.filtroMicrofluxoId &&
      item.microfluxoId !== opcoes.filtroMicrofluxoId
    ) {
      return false;
    }
    return true;
  });

  if (solicitacoesFiltradas.length === 0) {
    return {
      cabecalhos: ["Protocolo", "Data de envio", "Situação"],
      linhas: [],
    };
  }

  // 1. Projeção Dinâmica: detectar quais campos possuem pelo menos 1 valor preenchido no lote
  const temMultiplasExperiencias =
    new Set(solicitacoesFiltradas.map((s) => s.microfluxoId)).size > 1;
  const temNome = solicitacoesFiltradas.some(
    (s) => s.nomeVisitante && s.nomeVisitante.trim().length > 0,
  );
  const temTelefone = solicitacoesFiltradas.some(
    (s) => s.telefoneOuWhatsapp && s.telefoneOuWhatsapp.trim().length > 0,
  );
  const temEmail = solicitacoesFiltradas.some(
    (s) => s.emailVisitante && s.emailVisitante.trim().length > 0,
  );
  const temItemInteresse = solicitacoesFiltradas.some(
    (s) => Boolean(s.servicoNome || s.produtoNome),
  );
  const temEspecialista = solicitacoesFiltradas.some(
    (s) => s.profissionalNome && s.profissionalNome.trim().length > 0,
  );
  const temValorHistorico = solicitacoesFiltradas.some(
    (s) => Boolean(s.demonstrativoComercialCongelado?.resumoFormatado),
  );
  const temMensagemAdicional = solicitacoesFiltradas.some(
    (s) => s.mensagemAdicional && s.mensagemAdicional.trim().length > 0,
  );

  // 2. Montar cabeçalhos universais com base apenas nos campos existentes
  const cabecalhosFixos: string[] = ["Protocolo", "Data de envio", "Situação"];

  if (temMultiplasExperiencias) {
    cabecalhosFixos.push("Experiência");
  }
  if (temNome) {
    cabecalhosFixos.push("Nome do visitante");
  }
  if (temTelefone) {
    cabecalhosFixos.push("Telefone / WhatsApp");
  }
  if (temEmail) {
    cabecalhosFixos.push("E-mail");
  }
  if (temItemInteresse) {
    cabecalhosFixos.push("Item de interesse");
  }
  if (temEspecialista) {
    cabecalhosFixos.push("Especialista");
  }
  if (temValorHistorico) {
    cabecalhosFixos.push("Valor histórico");
  }
  if (temMensagemAdicional) {
    cabecalhosFixos.push("Mensagem adicional");
  }

  // 3. Estruturação das respostas (consolidada ou colunas abertas)
  const consolidar = opcoes.consolidarRespostasEmColunaUnica ?? false;

  let cabecalhos: readonly string[];
  let perguntasDinamicas: string[] = [];

  if (consolidar) {
    cabecalhos = [...cabecalhosFixos, "Respostas do Microfluxo"];
  } else {
    const mapaPerguntasOrdem = new Map<string, string>();
    for (const sol of solicitacoesFiltradas) {
      for (const resp of sol.respostasRegistradas) {
        const perguntaLimpa = resp.pergunta.trim();
        if (perguntaLimpa && !mapaPerguntasOrdem.has(perguntaLimpa)) {
          mapaPerguntasOrdem.set(perguntaLimpa, perguntaLimpa);
        }
      }
    }
    perguntasDinamicas = Array.from(mapaPerguntasOrdem.values());
    cabecalhos = [...cabecalhosFixos, ...perguntasDinamicas];
  }

  // 4. Montar linhas com projeção dinâmica estrita
  const linhas: LinhaExportacaoSolicitacoes[] = solicitacoesFiltradas.map((sol) => {
    const rotuloSituacao =
      DESCRITORES_SITUACAO_SOLICITACAO[sol.situacao]?.rotulo ?? sol.situacao;

    const celulasFixas: ValorCelulaExportacao[] = [
      sol.id,
      formatarDataHoraIso(sol.criadoEmIso),
      rotuloSituacao,
    ];

    if (temMultiplasExperiencias) {
      celulasFixas.push(sol.tituloExperiencia);
    }
    if (temNome) {
      celulasFixas.push(sol.nomeVisitante);
    }
    if (temTelefone) {
      celulasFixas.push(sol.telefoneOuWhatsapp);
    }
    if (temEmail) {
      celulasFixas.push(sol.emailVisitante ?? "");
    }
    if (temItemInteresse) {
      celulasFixas.push(sol.servicoNome ?? sol.produtoNome ?? "");
    }
    if (temEspecialista) {
      celulasFixas.push(sol.profissionalNome ?? "");
    }
    if (temValorHistorico) {
      celulasFixas.push(
        sol.demonstrativoComercialCongelado?.resumoFormatado ?? "",
      );
    }
    if (temMensagemAdicional) {
      celulasFixas.push(sol.mensagemAdicional ?? "");
    }

    if (consolidar) {
      const resumoRespostas = sol.respostasRegistradas
        .map((r) => `${r.pergunta}: ${r.respostaTexto}`)
        .join(" | ");
      return [...celulasFixas, resumoRespostas];
    }

    const respostasPorPergunta = new Map<string, string>();
    for (const resp of sol.respostasRegistradas) {
      respostasPorPergunta.set(resp.pergunta.trim(), resp.respostaTexto);
    }

    const celulasPerguntas = perguntasDinamicas.map(
      (pergunta) => respostasPorPergunta.get(pergunta) ?? "",
    );

    return [...celulasFixas, ...celulasPerguntas];
  });

  return {
    cabecalhos,
    linhas,
  };
}
