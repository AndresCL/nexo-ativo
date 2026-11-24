export type DesinscreverAssinatura = () => void;

export type EstadoConexaoTempoReal = "conectando" | "ao_vivo" | "degradado";

export interface MetadadosAtualizacaoTempoReal {
  readonly temEscritasPendentes: boolean;
}

export interface ObservadorDeltaColecao<TItem> {
  readonly aoReceberDelta: (
    itensAlterados: readonly TItem[],
    metadados: MetadadosAtualizacaoTempoReal,
  ) => void;
  readonly aoErro?: (erro: Error) => void;
}

export interface ParametrosObservacaoDeltaOrganizacao {
  readonly organizacaoId: string;
  /**
   * Cursor ISO da última atualização conhecida no SSR.
   * Quando informado, o listener escuta apenas documentos com `atualizadoEmIso >= cursor`,
   * evitando releitura completa da coleção na abertura da tela.
   */
  readonly atualizadoAPartirDeIso: string | null;
}

export interface PortaObservacaoDeltaColecao<TItem> {
  assinarDelta(
    parametros: ParametrosObservacaoDeltaOrganizacao,
    observador: ObservadorDeltaColecao<TItem>,
  ): DesinscreverAssinatura;
}

