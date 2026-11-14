import { describe, expect, it } from "vitest";
import { criarPreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import {
  obterVisibilidadeEquipe,
  resolverPosicionamentoEquipe,
} from "@/dominio/editorial/posicionamentoEquipeVitrine";
import { criarEquipeTeste } from "../../fixtures/equipeVitrine";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import { esquemaLimiteAvataresEquipe } from "@/validacoes/esquemaLimiteAvataresEquipe";
import {
  criarRascunhoConfiguracaoPaginaPadrao,
  hidratarRascunhoConfiguracaoPagina,
  converterRascunhoParaConteudoPublicado,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";

describe("Amostra e posicionamento da equipe", () => {
  it("valida posições e as preserva na hidratação e publicação das ações diretas", () => {
    const posicionamentoEquipe = { desktop: "abaixo_hero", mobile: "antes_acoes" } as const;
    const rascunho = {
      ...criarRascunhoConfiguracaoPaginaPadrao({
        organizacaoId: "org-equipe",
        nomeOrganizacao: "Equipe",
      }),
      acoesPrincipais: [
        {
          id: "equipe",
          rotulo: "Equipe disponível",
          tipoDestino: "secao_equipe",
          destino: "#equipe",
          posicionamentoEquipe,
          limiteAvataresEquipe: 4,
        },
      ],
    };
    const hidratado = hidratarRascunhoConfiguracaoPagina(rascunho, {
      organizacaoId: "org-equipe",
      nomeOrganizacao: "Equipe",
    });
    const publicado = esquemaConteudoPaginaPublicada.parse(
      converterRascunhoParaConteudoPublicado(hidratado, {
        identificadorPublico: "equipe",
        versaoPublicada: 1,
      }),
    );
    expect(publicado.acoesPrincipais[0]?.posicionamentoEquipe).toEqual(posicionamentoEquipe);
    expect(publicado.acoesPrincipais[0]?.limiteAvataresEquipe).toBe(4);
    expect(
      esquemaDefinicaoMicrofluxo.safeParse({
        id: "acao",
        organizacaoId: "org-equipe",
        titulo: "Equipe",
        ativo: true,
        atualizadoEmIso: "2026-11-12",
        posicionamentoEquipe: { mobile: "abaixo_hero" },
      }).success,
    ).toBe(false);
  });

  it.each([0, 1, 2, 3, 4, 20])(
    "disponibiliza todos os %i integrantes para o limite de cada ação",
    (total) => {
      const previa = criarPreviaEquipeVitrine(criarEquipeTeste(total), "org-equipe");
      expect(previa.total).toBe(total);
      expect(previa.avatares).toHaveLength(total);
    },
  );

  it.each([undefined, null, 1, 4, 100])("aceita limite opcional %s", (limite) => {
    expect(esquemaLimiteAvataresEquipe.parse(limite)).toBe(limite);
  });

  it.each([0, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejeita limite inválido %s",
    (limite) => {
      expect(esquemaLimiteAvataresEquipe.safeParse(limite).success).toBe(false);
    },
  );

  it("é estável para entradas reordenadas, não altera a entrada e limita os dados visuais", () => {
    const equipe = criarEquipeTeste(10);
    const original = structuredClone(equipe);
    const previa = criarPreviaEquipeVitrine(equipe, "org-equipe");
    expect(criarPreviaEquipeVitrine([...equipe].reverse(), "org-equipe")).toEqual(previa);
    expect(equipe).toEqual(original);
    expect(previa.avatares[0]).not.toHaveProperty("aceitaSolicitacoesDiretas");
  });

  it("descarta inativos, duplicatas e dados de outra organização", () => {
    const [pessoa] = criarEquipeTeste(1);
    const previa = criarPreviaEquipeVitrine(
      [
        pessoa!,
        pessoa!,
        { ...pessoa!, id: "inativo", ativo: false },
        { ...pessoa!, id: "outra", organizacaoId: "outra-org" },
      ],
      "org-equipe",
    );
    expect(previa.total).toBe(1);
  });

  it("mantém ações antigas na lista e aplica o padrão de cada dispositivo ausente", () => {
    expect(resolverPosicionamentoEquipe()).toEqual({
      desktop: "lista_acoes",
      mobile: "lista_acoes",
    });
    expect(resolverPosicionamentoEquipe({ desktop: "abaixo_hero" }).mobile).toBe("lista_acoes");
  });

  it.each(["lista_acoes", "abaixo_hero"] as const)(
    "distribui desktop %s sem duplicar locais",
    (desktop) => {
      for (const mobile of ["lista_acoes", "antes_acoes"] as const) {
        const visibilidades = (["lista_acoes", "abaixo_hero", "antes_acoes"] as const).map(
          (local) => obterVisibilidadeEquipe({ desktop, mobile }, local),
        );
        expect(visibilidades.filter((v) => v.desktop)).toHaveLength(1);
        expect(visibilidades.filter((v) => v.mobile)).toHaveLength(1);
      }
    },
  );
});
