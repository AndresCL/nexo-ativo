import type { RascunhoConfiguracaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";

export interface OpcoesUploadMidiaEditorial {
  readonly organizacaoId: string;
  readonly arquivo: File;
  readonly categoria: "imagem" | "video";
  readonly aoAtualizarProgresso?: (percentual: number) => void;
}

export interface ResultadoUploadMidiaEditorial {
  readonly urlPublica: string;
  readonly caminhoArmazenamento: string;
}

export interface ResultadoPublicacaoPagina {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly versaoPublicada: number;
  readonly publicadoEmIso: string;
}

export interface PortaPersistenciaRascunhoCliente {
  salvarRascunho(rascunho: RascunhoConfiguracaoPagina): Promise<void>;
}

export interface PortaUploadMidiaEditorial {
  enviarMidia(opcoes: OpcoesUploadMidiaEditorial): Promise<ResultadoUploadMidiaEditorial>;
}

export interface PortaPublicacaoPaginaCliente {
  publicarPagina(organizacaoId: string): Promise<ResultadoPublicacaoPagina>;
}

export interface ServicoEditorAparenciaPorta
  extends
    PortaPersistenciaRascunhoCliente,
    PortaUploadMidiaEditorial,
    PortaPublicacaoPaginaCliente {}
