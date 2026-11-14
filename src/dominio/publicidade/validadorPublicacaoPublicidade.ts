import { ErroValidacaoDominio } from "../erros/errosDominio";
import type { DefinicaoMicrofluxo } from "../microfluxos/tiposMicrofluxo";
import type { PoliticaPublicidade } from "./tiposPerfilPublicidade";

export function listarViolacoesPublicidadeMicrofluxo(
  politica: PoliticaPublicidade,
  fluxo: DefinicaoMicrofluxo,
): readonly string[] {
  const violacoes: string[] = [];

  for (const etapa of fluxo.etapas) {
    if (etapa.tipoEtapa === "instrucao_pix_manual" && !politica.permiteEtapaPixManual()) {
      violacoes.push(
        `A experiência “${fluxo.titulo}” usa instruções de Pix, não permitidas no perfil ${politica.rotulo}.`,
      );
    }

    const usaProdutos =
      (etapa.blocos ?? []).some((b) => b.tipo === "catalogo" && b.fonte !== "servicos") ||
      etapa.tipoEtapa === "selecao_produto" ||
      (etapa.tipoEtapa === "recomendacao_catalogo" &&
        (etapa.fonteCatalogo === "produtos" || etapa.fonteCatalogo === "ambos"));

    if (usaProdutos && !politica.permiteEtapasComProdutos()) {
      violacoes.push(
        `A experiência “${fluxo.titulo}” oferece produtos, o que não é permitido no perfil ${politica.rotulo}.`,
      );
    }
  }

  return [...new Set(violacoes)];
}

/** Impede a publicação de experiências que contrariem a política do perfil. */
export function exigirMicrofluxosConformesPublicidade(
  politica: PoliticaPublicidade,
  microfluxos: readonly DefinicaoMicrofluxo[],
): void {
  const violacoes = microfluxos.flatMap((fluxo) =>
    listarViolacoesPublicidadeMicrofluxo(politica, fluxo),
  );

  if (violacoes.length > 0) {
    throw new ErroValidacaoDominio(violacoes.join(" "), "PUBLICIDADE_NAO_CONFORME");
  }
}
