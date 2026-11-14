export const LIMITE_MAXIMO_CHAMADAS_EDITORIAIS = 3;

export interface ChamadaPrincipalEditorial {
  readonly sobretituloOpcional?: string;
  readonly tituloPrincipal: string;
  readonly descricaoCurta?: string;
  readonly rotuloCta?: string;
  readonly fluxoId?: string;
}

export interface ConjuntoChamadasEditoriais {
  readonly chamadaEditorial: ChamadaPrincipalEditorial;
  readonly chamadasEditoriaisAdicionais?: readonly ChamadaPrincipalEditorial[];
}

export function obterChamadasEditoriais(
  conjunto: ConjuntoChamadasEditoriais,
): readonly ChamadaPrincipalEditorial[] {
  return [conjunto.chamadaEditorial, ...(conjunto.chamadasEditoriaisAdicionais ?? [])].slice(
    0,
    LIMITE_MAXIMO_CHAMADAS_EDITORIAIS,
  );
}

/** Mantém títulos inválidos e excesso de itens para que a publicação os rejeite. */
export function hidratarChamadasEditoriaisAdicionais(
  dados: unknown,
): readonly ChamadaPrincipalEditorial[] {
  if (!Array.isArray(dados)) return [];

  return dados.map((item: unknown) => {
    const chamada = typeof item === "object" && item !== null ? item : {};
    return {
      tituloPrincipal:
        "tituloPrincipal" in chamada && typeof chamada.tituloPrincipal === "string"
          ? chamada.tituloPrincipal
          : "",
      ...("sobretituloOpcional" in chamada && typeof chamada.sobretituloOpcional === "string"
        ? { sobretituloOpcional: chamada.sobretituloOpcional }
        : {}),
      ...("descricaoCurta" in chamada && typeof chamada.descricaoCurta === "string"
        ? { descricaoCurta: chamada.descricaoCurta }
        : {}),
      ...("rotuloCta" in chamada && typeof chamada.rotuloCta === "string" && chamada.rotuloCta.trim()
        ? { rotuloCta: chamada.rotuloCta.trim() }
        : {}),
      ...("fluxoId" in chamada && typeof chamada.fluxoId === "string" && chamada.fluxoId.trim()
        ? { fluxoId: chamada.fluxoId.trim().replace(/^#/, "") }
        : "destinoFluxo" in chamada && typeof chamada.destinoFluxo === "string" && chamada.destinoFluxo.trim()
          ? { fluxoId: chamada.destinoFluxo.trim().replace(/^#/, "") }
          : {}),
    };
  });
}
