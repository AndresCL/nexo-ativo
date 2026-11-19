export type FormatoExportacaoSolicitacoes = "csv" | "excel";

export type EscopoExportacaoSolicitacoes = "ativas" | "todas" | "desqualificadas";

export type ValorCelulaExportacao = string | number;

export type LinhaExportacaoSolicitacoes = readonly ValorCelulaExportacao[];

export interface MatrizExportacaoSolicitacoes {
  readonly cabecalhos: readonly string[];
  readonly linhas: readonly LinhaExportacaoSolicitacoes[];
}

export interface OpcoesGeracaoMatrizExportacao {
  readonly escopo?: EscopoExportacaoSolicitacoes;
  readonly filtroMicrofluxoId?: string;
  readonly consolidarRespostasEmColunaUnica?: boolean;
}

export interface PlanilhaXmlExcel {
  readonly nome: string;
  readonly matriz: MatrizExportacaoSolicitacoes;
}

export interface OpcoesDownloadArquivo {
  readonly nomeArquivo: string;
  readonly conteudo: BlobPart;
  readonly tipoMime: string;
}
