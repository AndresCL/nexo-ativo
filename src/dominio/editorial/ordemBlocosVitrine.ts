import { resolverPosicaoCabecalhoMarca } from "./faixaInicioExperiencias";

export const IDENTIFICADORES_BLOCOS_SISTEMA_VITRINE = [
  "bloco:marca",
  "bloco:avaliacoes_google",
  "bloco:redes_sociais",
] as const;

export type IdentificadorBlocoSistemaVitrine =
  (typeof IDENTIFICADORES_BLOCOS_SISTEMA_VITRINE)[number];

export const PREFIXO_BLOCO_EXPERIENCIA = "exp:";

export function ehIdentificadorBlocoSistemaVitrine(
  valor: unknown,
): valor is IdentificadorBlocoSistemaVitrine {
  return (
    typeof valor === "string" &&
    (IDENTIFICADORES_BLOCOS_SISTEMA_VITRINE as readonly string[]).includes(valor)
  );
}

/**
 * Normaliza o ID de uma experiência (seja `microfluxo.id` ou `acao-fluxo-<id>` gerado
 * em `resolverAcoesVitrineComMicrofluxos`) para o identificador canônico `exp:<id>`.
 */
export function obterIdBlocoExperiencia(idExperienciaOuAcao: string): string {
  if (idExperienciaOuAcao.startsWith(PREFIXO_BLOCO_EXPERIENCIA)) {
    return idExperienciaOuAcao;
  }
  const semPrefixoAcao = idExperienciaOuAcao.startsWith("acao-fluxo-")
    ? idExperienciaOuAcao.slice("acao-fluxo-".length)
    : idExperienciaOuAcao;
  return `${PREFIXO_BLOCO_EXPERIENCIA}${semPrefixoAcao}`;
}

export function extrairIdExperienciaDoBloco(idBloco: string): string | null {
  if (!idBloco.startsWith(PREFIXO_BLOCO_EXPERIENCIA)) {
    return null;
  }
  return idBloco.slice(PREFIXO_BLOCO_EXPERIENCIA.length);
}

export interface ContextoBlocosSistemaVitrine {
  readonly identidade: {
    readonly nomeExibicao: string;
    readonly mostrarNomeExibicao?: boolean;
    readonly subtituloCurto?: string;
    readonly mostrarSubtituloCurto?: boolean;
    readonly urlLogotipoOpcional?: string;
    readonly posicaoCabecalho?: "topo" | "acima_experiencias";
  };
  readonly avaliacoesGoogle?: {
    readonly habilitado: boolean;
    readonly identificadorLocal?: string;
  };
  readonly redesSociais: readonly unknown[];
  readonly blocosSistemaOcultos?: readonly IdentificadorBlocoSistemaVitrine[];
}

export function blocoMarcaEstaConfigurado(
  identidade: ContextoBlocosSistemaVitrine["identidade"],
): boolean {
  const temLogo = Boolean(identidade.urlLogotipoOpcional?.trim());
  const temNome = (identidade.mostrarNomeExibicao ?? true) && Boolean(identidade.nomeExibicao.trim());
  const temSubtitulo =
    (identidade.mostrarSubtituloCurto ?? true) && Boolean(identidade.subtituloCurto?.trim());
  return temLogo || temNome || temSubtitulo;
}

export function marcaEstaFixaNoTopo(
  identidade: ContextoBlocosSistemaVitrine["identidade"],
): boolean {
  return resolverPosicaoCabecalhoMarca(identidade.posicaoCabecalho) === "topo";
}

export function blocoSistemaEstaConfigurado(
  bloco: IdentificadorBlocoSistemaVitrine,
  contexto: ContextoBlocosSistemaVitrine,
): boolean {
  switch (bloco) {
    case "bloco:marca":
      return blocoMarcaEstaConfigurado(contexto.identidade);
    case "bloco:avaliacoes_google":
      return Boolean(contexto.avaliacoesGoogle?.identificadorLocal?.trim());
    case "bloco:redes_sociais":
      return contexto.redesSociais.length > 0;
  }
}

export function blocoSistemaEstaVisivel(
  bloco: IdentificadorBlocoSistemaVitrine,
  contexto: ContextoBlocosSistemaVitrine,
): boolean {
  if (!blocoSistemaEstaConfigurado(bloco, contexto)) {
    return false;
  }
  if (bloco === "bloco:avaliacoes_google") {
    return contexto.avaliacoesGoogle?.habilitado === true;
  }
  return !(contexto.blocosSistemaOcultos ?? []).includes(bloco);
}

/**
 * Resolve de forma determinística a ordem final dos blocos da vitrine:
 * 1. Mantém os IDs de `ordemSalva` que ainda existem em `idsDisponiveis`.
 * 2. Insere novos blocos ainda não presentes em `ordemSalva` em posições padrão intuitivas:
 *    - `bloco:marca` no início (antes das experiências)
 *    - experiências novas na sequência
 *    - `bloco:avaliacoes_google` e `bloco:redes_sociais` ao final
 * 3. Remove duplicatas e IDs obsoletos.
 */
export function resolverOrdemBlocosVitrine(
  ordemSalva: readonly string[] | undefined,
  idsDisponiveis: readonly string[],
): string[] {
  const disponiveisSet = new Set(idsDisponiveis);
  const resultado: string[] = [];
  const vistos = new Set<string>();

  for (const id of ordemSalva ?? []) {
    if (disponiveisSet.has(id) && !vistos.has(id)) {
      vistos.add(id);
      resultado.push(id);
    }
  }

  const faltantes = idsDisponiveis.filter((id) => !vistos.has(id));
  if (faltantes.length === 0) {
    return resultado;
  }

  const faltanteMarca = faltantes.filter((id) => id === "bloco:marca");
  const faltantesExperiencias = faltantes.filter((id) =>
    id.startsWith(PREFIXO_BLOCO_EXPERIENCIA),
  );
  const faltantesRodape = faltantes.filter(
    (id) => id === "bloco:avaliacoes_google" || id === "bloco:redes_sociais",
  );
  const outrosFaltantes = faltantes.filter(
    (id) =>
      id !== "bloco:marca" &&
      id !== "bloco:avaliacoes_google" &&
      id !== "bloco:redes_sociais" &&
      !id.startsWith(PREFIXO_BLOCO_EXPERIENCIA),
  );

  return [
    ...faltanteMarca,
    ...resultado,
    ...faltantesExperiencias,
    ...outrosFaltantes,
    ...faltantesRodape,
  ];
}

export function reordenarBlocoVitrine(
  ordemAtual: readonly string[],
  indiceOrigem: number,
  indiceDestino: number,
): string[] {
  if (
    indiceOrigem < 0 ||
    indiceOrigem >= ordemAtual.length ||
    indiceDestino < 0 ||
    indiceDestino >= ordemAtual.length ||
    indiceOrigem === indiceDestino
  ) {
    return [...ordemAtual];
  }
  const copia = [...ordemAtual];
  const [movido] = copia.splice(indiceOrigem, 1);
  if (!movido) return [...ordemAtual];
  copia.splice(indiceDestino, 0, movido);
  return copia;
}

