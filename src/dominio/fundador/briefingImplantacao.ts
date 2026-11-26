export interface DadosFormularioBriefingImplantacao {
  readonly sobreNegocio: string;
  readonly conteudoEServicos: string;
  readonly experienciasEAcoes: string;
  readonly identidadeVisualEMateriais: string;
  readonly pendenciasEProximosPassos: string;
  /** Data no formato YYYY-MM-DD ou null quando não informada. */
  readonly previsaoEntregaData: string | null;
}

export interface BriefingImplantacaoFundador extends DadosFormularioBriefingImplantacao {
  readonly organizacaoId: string;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
  readonly atualizadoPor: string;
}

export interface ParametrosSalvarBriefingImplantacaoFundador
  extends DadosFormularioBriefingImplantacao {
  readonly organizacaoId: string;
}

export type EstadoSalvamentoBriefing =
  | "ocioso"
  | "pendente"
  | "salvando"
  | "salvo"
  | "erro";

export const DADOS_BRIEFING_VAZIO: DadosFormularioBriefingImplantacao = {
  sobreNegocio: "",
  conteudoEServicos: "",
  experienciasEAcoes: "",
  identidadeVisualEMateriais: "",
  pendenciasEProximosPassos: "",
  previsaoEntregaData: null,
};

export interface SecaoBriefingImplantacao {
  readonly chave: Exclude<keyof DadosFormularioBriefingImplantacao, "previsaoEntregaData">;
  readonly titulo: string;
  readonly placeholder: string;
}

export const SECOES_BRIEFING_IMPLANTACAO: readonly SecaoBriefingImplantacao[] = [
  {
    chave: "sobreNegocio",
    titulo: "Sobre o negócio",
    placeholder:
      "Empresa, público-alvo, objetivos, diferenciais, necessidades e contexto comercial...",
  },
  {
    chave: "conteudoEServicos",
    titulo: "Conteúdo e serviços",
    placeholder:
      "Produtos e serviços a apresentar, prioridades, títulos, descrições, wording e tom de comunicação...",
  },
  {
    chave: "experienciasEAcoes",
    titulo: "Experiências e ações",
    placeholder:
      "Microfluxos, formulários, perguntas, opções de respostas, botões, ações de conclusão e objetivos de conversão...",
  },
  {
    chave: "identidadeVisualEMateriais",
    titulo: "Identidade visual e materiais",
    placeholder:
      "Preferências estéticas, template, cores, logotipo, fotografias, vídeos, referências visuais e links externos...",
  },
  {
    chave: "pendenciasEProximosPassos",
    titulo: "Pendências e próximos passos",
    placeholder:
      "Materiais aguardados, informações faltantes, decisões pendentes, solicitações do cliente e próximas ações...",
  },
] as const;

export function normalizarDadosBriefing(
  dados: Partial<DadosFormularioBriefingImplantacao> | null | undefined,
): DadosFormularioBriefingImplantacao {
  const dataLimpa =
    typeof dados?.previsaoEntregaData === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dados.previsaoEntregaData.trim())
      ? dados.previsaoEntregaData.trim()
      : null;

  return {
    sobreNegocio: typeof dados?.sobreNegocio === "string" ? dados.sobreNegocio : "",
    conteudoEServicos:
      typeof dados?.conteudoEServicos === "string" ? dados.conteudoEServicos : "",
    experienciasEAcoes:
      typeof dados?.experienciasEAcoes === "string" ? dados.experienciasEAcoes : "",
    identidadeVisualEMateriais:
      typeof dados?.identidadeVisualEMateriais === "string"
        ? dados.identidadeVisualEMateriais
        : "",
    pendenciasEProximosPassos:
      typeof dados?.pendenciasEProximosPassos === "string"
        ? dados.pendenciasEProximosPassos
        : "",
    previsaoEntregaData: dataLimpa,
  };
}

export function briefingPossuiConteudo(dados: DadosFormularioBriefingImplantacao): boolean {
  return (
    dados.sobreNegocio.trim().length > 0 ||
    dados.conteudoEServicos.trim().length > 0 ||
    dados.experienciasEAcoes.trim().length > 0 ||
    dados.identidadeVisualEMateriais.trim().length > 0 ||
    dados.pendenciasEProximosPassos.trim().length > 0 ||
    dados.previsaoEntregaData !== null
  );
}

export function briefingsSaoIguais(
  a: DadosFormularioBriefingImplantacao,
  b: DadosFormularioBriefingImplantacao,
): boolean {
  return (
    a.sobreNegocio === b.sobreNegocio &&
    a.conteudoEServicos === b.conteudoEServicos &&
    a.experienciasEAcoes === b.experienciasEAcoes &&
    a.identidadeVisualEMateriais === b.identidadeVisualEMateriais &&
    a.pendenciasEProximosPassos === b.pendenciasEProximosPassos &&
    a.previsaoEntregaData === b.previsaoEntregaData
  );
}

export function formatarDataCalendarioBr(dataYyyyMmDd: string | null): string | null {
  if (!dataYyyyMmDd || !/^\d{4}-\d{2}-\d{2}$/.test(dataYyyyMmDd)) {
    return null;
  }
  const [ano, mes, dia] = dataYyyyMmDd.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarBriefingComoMarkdown(
  nomeOrganizacao: string,
  dados: DadosFormularioBriefingImplantacao,
  atualizadoEmIso?: string | null,
): string {
  const linhas: string[] = [`# Briefing de Implantação — ${nomeOrganizacao}`];

  const dataEntregaFormatada = formatarDataCalendarioBr(dados.previsaoEntregaData);
  if (dataEntregaFormatada) {
    linhas.push("", `**Previsão de entrega:** ${dataEntregaFormatada}`);
  }

  if (atualizadoEmIso) {
    const dataAtualizacao = new Date(atualizadoEmIso);
    if (!Number.isNaN(dataAtualizacao.getTime())) {
      const formatador = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });
      linhas.push(`**Última atualização:** ${formatador.format(dataAtualizacao)}`);
    }
  }

  for (const secao of SECOES_BRIEFING_IMPLANTACAO) {
    const conteudo = dados[secao.chave].trim();
    linhas.push("", `## ${secao.titulo}`, "", conteudo.length > 0 ? conteudo : "_Não informado._");
  }

  return linhas.join("\n").trim();
}

