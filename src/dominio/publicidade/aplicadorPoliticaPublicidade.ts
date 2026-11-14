import type { AcervoPublicoVitrine } from "../entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "../entidades/paginaPublicada";
import type { DefinicaoMicrofluxo } from "../microfluxos/tiposMicrofluxo";
import type { PoliticaPublicidade } from "./tiposPerfilPublicidade";

export interface VitrineParaPoliticaPublicidade {
  readonly pagina: ConteudoPaginaPublicada;
  readonly acervo: AcervoPublicoVitrine;
}

/** Remove a regra de cálculo comercial, mantendo o restante do microfluxo intacto. */
export function neutralizarCalculoMicrofluxo(fluxo: DefinicaoMicrofluxo): DefinicaoMicrofluxo {
  if (!fluxo.regraCalculoComercial || fluxo.regraCalculoComercial.modalidade === "sem_calculo") {
    return fluxo;
  }
  return { ...fluxo, regraCalculoComercial: { modalidade: "sem_calculo" } };
}

function removerPrecoServicos(
  servicos: AcervoPublicoVitrine["servicos"],
): AcervoPublicoVitrine["servicos"] {
  return servicos.map((servico) => {
    const { precoBaseCentavos, rotuloPrecoOpcional, ...semPreco } = servico;
    void precoBaseCentavos;
    void rotuloPrecoOpcional;
    return semPreco;
  });
}

function removerPrecoProdutos(
  produtos: AcervoPublicoVitrine["produtos"],
): AcervoPublicoVitrine["produtos"] {
  return produtos.map((produto) => {
    const { precoCentavos, ...semPreco } = produto;
    void precoCentavos;
    return semPreco;
  });
}

/**
 * Oculta da projeção pública tudo o que a política não permite exibir, mesmo que o dado
 * esteja salvo. Não altera o dado persistido: a restrição é reversível ao trocar o perfil.
 */
export function aplicarPoliticaPublicidadeAoAcervo(
  politica: PoliticaPublicidade,
  servicos: AcervoPublicoVitrine["servicos"],
  produtos: AcervoPublicoVitrine["produtos"],
): Pick<AcervoPublicoVitrine, "servicos" | "produtos"> {
  return {
    servicos: politica.exibePrecoServico() ? servicos : removerPrecoServicos(servicos),
    produtos: politica.exibePrecoProduto() ? produtos : removerPrecoProdutos(produtos),
  };
}

export function aplicarPoliticaPublicidadeAMicrofluxos(
  politica: PoliticaPublicidade,
  microfluxos: readonly DefinicaoMicrofluxo[],
): readonly DefinicaoMicrofluxo[] {
  return microfluxos.map((original) => {
    const fluxo = politica.permiteCalculoComercial()
      ? original
      : neutralizarCalculoMicrofluxo(original);
    if (politica.permiteCalculoComercial() && politica.permiteEtapasComProdutos()) return fluxo;
    return {
      ...fluxo,
      etapas: fluxo.etapas.map((etapa) =>
        etapa.tipoEtapa !== "etapa_livre"
          ? etapa
          : {
              ...etapa,
              blocos: etapa.blocos?.flatMap((bloco) => {
                if (
                  bloco.tipo === "campo" &&
                  bloco.campo.tipo === "moeda" &&
                  !politica.permiteCalculoComercial()
                )
                  return [];
                if (bloco.tipo === "catalogo" && !politica.permiteEtapasComProdutos())
                  return bloco.fonte === "produtos"
                    ? []
                    : [{ ...bloco, fonte: "servicos" as const }];
                return [bloco];
              }),
            },
      ),
    };
  });
}

export function aplicarPoliticaPublicidadeAPagina(
  politica: PoliticaPublicidade,
  pagina: ConteudoPaginaPublicada,
): ConteudoPaginaPublicada {
  if (politica.exibeAvaliacoesGoogle() || !pagina.avaliacoesGoogle) {
    return pagina;
  }
  const { avaliacoesGoogle, ...semAvaliacoes } = pagina;
  void avaliacoesGoogle;
  return semAvaliacoes;
}

export function aplicarPoliticaPublicidadeAVitrine(
  politica: PoliticaPublicidade,
  vitrine: VitrineParaPoliticaPublicidade,
): VitrineParaPoliticaPublicidade {
  const { servicos, produtos } = aplicarPoliticaPublicidadeAoAcervo(
    politica,
    vitrine.acervo.servicos,
    vitrine.acervo.produtos,
  );
  return {
    pagina: aplicarPoliticaPublicidadeAPagina(politica, vitrine.pagina),
    acervo: {
      ...vitrine.acervo,
      servicos,
      produtos,
      ...(vitrine.acervo.microfluxos
        ? {
            microfluxos: aplicarPoliticaPublicidadeAMicrofluxos(
              politica,
              vitrine.acervo.microfluxos,
            ),
          }
        : {}),
    },
  };
}
