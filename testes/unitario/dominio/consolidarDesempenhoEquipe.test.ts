import { describe, expect, it } from "vitest";
import { consolidarDesempenhoEquipe } from "@/dominio/analytics/consolidarDesempenhoEquipe";
import { consolidarResumoMetricas } from "@/dominio/analytics/tiposMetricasAgregadas";
import { criarEquipeTeste } from "../../fixtures/equipeVitrine";

const equipe = criarEquipeTeste(4);
const carlos = { ...equipe[0]!, nomeCompleto: "Carlos Eduardo" };

function criarResumo(contatosWhatsapp: number, visualizacoes = 2, cliquesAcoesHome = 0) {
  return consolidarResumoMetricas([
    {
      dataIso: "2026-11-12",
      visualizacoesVitrine: 0,
      visualizacoesCartao: visualizacoes,
      aberturasMicrofluxo: 0,
      conclusoesMicrofluxo: 0,
      cliquesWhatsapp: contatosWhatsapp,
      porCartao: {
        [carlos.id]: {
          nome: carlos.nomeCompleto,
          visualizacoes,
          cliquesAcoesHome,
          contatosWhatsapp,
        },
      },
      porProfissional: {
        [carlos.id]: { nome: carlos.nomeCompleto, contatos: contatosWhatsapp, solicitacoes: 0 },
      },
      atualizadoEmIso: "2026-11-12T12:00:00.000Z",
    },
  ]);
}

describe("Desempenho dos cartões da equipe", () => {
  it.each([0, 1, 6, 7])(
    "conta %i cliques uma vez mesmo atribuídos ao cartão e ao profissional",
    (cliques) => {
      const resumo = criarResumo(cliques);
      const [resultado] = consolidarDesempenhoEquipe(
        [carlos],
        resumo.metricasPorCartao,
        resumo.metricasPorProfissional,
      );
      expect(resultado?.contatos).toBe(cliques);
    },
  );

  it("um novo clique aumenta o ranking em uma unidade", () => {
    const contar = (cliques: number) => {
      const resumo = criarResumo(cliques);
      return consolidarDesempenhoEquipe(
        [carlos],
        resumo.metricasPorCartao,
        resumo.metricasPorProfissional,
      )[0]!.contatos;
    };
    expect(contar(7) - contar(6)).toBe(1);
  });

  it("expressa cliques repetidos como ações por visita, sem um percentual de visitantes", () => {
    const resumo = criarResumo(6);
    const [resultado] = consolidarDesempenhoEquipe(
      [carlos],
      resumo.metricasPorCartao,
      resumo.metricasPorProfissional,
    );
    expect(resultado?.visualizacoes).toBe(2);
    expect(resultado?.contatos).toBe(6);
    expect(resultado?.acoesPorVisita).toBe(3);
  });

  it("inclui outras ações do cartão na média", () => {
    const resumo = criarResumo(1, 5, 1);
    const [resultado] = consolidarDesempenhoEquipe(
      [carlos],
      resumo.metricasPorCartao,
      resumo.metricasPorProfissional,
    );
    expect(resultado?.acoesPorVisita).toBe(0.4);
  });

  it("não inclui ligações nem contatos de outras origens nas métricas do cartão", () => {
    const resumo = criarResumo(6);
    const [resultado] = consolidarDesempenhoEquipe([carlos], resumo.metricasPorCartao, [
      { id: carlos.id, nome: carlos.nomeCompleto, contatos: 9, solicitacoes: 0 },
    ]);
    expect(resultado?.contatos).toBe(6);
    expect(resultado?.acoesPorVisita).toBe(3);
  });

  it("associa o identificador público do cartão ao cadastro sem criar uma segunda pessoa", () => {
    const resumo = criarResumo(1);
    const resultado = consolidarDesempenhoEquipe(
      [carlos],
      [{ ...resumo.metricasPorCartao[0]!, id: carlos.identificadorCartao }],
      resumo.metricasPorProfissional,
    );
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toMatchObject({ id: carlos.id, nome: carlos.nomeCompleto, contatos: 1 });
  });

  it("mantém os membros sem atividade e exclui identificadores sem cadastro do ranking", () => {
    const resumo = criarResumo(6);
    const resultado = consolidarDesempenhoEquipe(
      equipe,
      [
        ...resumo.metricasPorCartao,
        {
          ...resumo.metricasPorCartao[0]!,
          id: "prof-central-garage88",
          nome: "prof-central-garage88",
        },
      ],
      [
        ...resumo.metricasPorProfissional,
        {
          id: "prof-central-garage88",
          nome: "prof-central-garage88",
          contatos: 2,
          solicitacoes: 0,
        },
      ],
    );
    expect(resultado).toHaveLength(4);
    expect(resultado.map((membro) => membro.id)).toEqual(equipe.map((membro) => membro.id));
    expect(resultado[1]).toMatchObject({ visualizacoes: 0, contatos: 0, acoesPorVisita: null });
  });

  it("não calcula uma média sem visitas nem substitui visitas por fluxos", () => {
    const resumo = criarResumo(1, 0);
    const [resultado] = consolidarDesempenhoEquipe(
      [carlos],
      [{ ...resumo.metricasPorCartao[0]!, fluxosIniciados: 2 }],
      resumo.metricasPorProfissional,
    );
    expect(resultado?.acoesPorVisita).toBeNull();
  });
});
