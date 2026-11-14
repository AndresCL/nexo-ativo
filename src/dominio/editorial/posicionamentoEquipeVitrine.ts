import type { ItemAcaoHome } from "../entidades/paginaPublicada";

export interface PosicionamentoEquipeVitrine {
  readonly desktop?: "lista_acoes" | "abaixo_hero";
  readonly mobile?: "lista_acoes" | "antes_acoes";
}

export type LocalEquipeVitrine = "lista_acoes" | "abaixo_hero" | "antes_acoes";

export function ehAcaoEquipe(acao: Pick<ItemAcaoHome, "tipoDestino" | "destino">): boolean {
  return (
    acao.tipoDestino === "secao_equipe" ||
    acao.destino.trim().toLowerCase().split("?")[0] === "#equipe"
  );
}

export function resolverPosicionamentoEquipe(posicao?: PosicionamentoEquipeVitrine) {
  return {
    desktop: posicao?.desktop ?? "lista_acoes",
    mobile: posicao?.mobile ?? "lista_acoes",
  } as const;
}

export function obterVisibilidadeEquipe(
  posicao: PosicionamentoEquipeVitrine | undefined,
  local: LocalEquipeVitrine,
) {
  const resolvida = resolverPosicionamentoEquipe(posicao);
  return { mobile: resolvida.mobile === local, desktop: resolvida.desktop === local };
}
