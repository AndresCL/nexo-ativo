import type {
  EstabelecimentoGoogle,
  ResumoAvaliacoesGoogle,
} from "../../dominio/entidades/avaliacoesGoogle";

export interface PortaProvedorAvaliacoesGoogle {
  pesquisarEstabelecimentos(consulta: string): Promise<readonly EstabelecimentoGoogle[]>;
  consultarAvaliacoes(identificadorLocal: string): Promise<ResumoAvaliacoesGoogle>;
}

export type OrigemConsultaAvaliacoesGoogle =
  | { readonly tipo: "publicada"; readonly identificadorPublico: string }
  | {
      readonly tipo: "previa";
      readonly organizacaoId: string;
      readonly identificadorLocal: string;
    };

export interface PortaAvaliacoesGoogleCliente {
  pesquisar(organizacaoId: string, consulta: string): Promise<readonly EstabelecimentoGoogle[]>;
  consultar(origem: OrigemConsultaAvaliacoesGoogle): Promise<ResumoAvaliacoesGoogle>;
}
