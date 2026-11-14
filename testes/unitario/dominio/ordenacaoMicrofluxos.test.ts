import { describe, expect, it } from "vitest";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  definirDestaqueExclusivoMicrofluxo,
  ordenarMicrofluxosPorPrioridadeEOrdem,
  reordenarPosicaoMicrofluxo,
} from "@/dominio/microfluxos/ordenacaoMicrofluxos";

function criarMicrofluxoMock(
  id: string,
  titulo: string,
  ordemHome: number,
  destaquePrimarioHome = false,
): DefinicaoMicrofluxo {
  return {
    id,
    organizacaoId: "org-1",
    titulo,
    descricaoCurta: "Descricao mock",
    textoBotaoConclusao: "Enviar",
    mensagemConfirmacaoTitulo: "Sucesso",
    mensagemConfirmacaoCorpo: "Corpo",
    etapaInicialId: "etapa-1",
    etapas: [
      {
        id: "etapa-1",
        tipoEtapa: "coleta_contato",
        titulo: "Contato",
        obrigatoria: true,
      },
    ],
    ativo: true,
    ativoNaHome: true,
    rotuloBotaoHome: titulo,
    destaquePrimarioHome,
    ordemHome,
    atualizadoEmIso: new Date().toISOString(),
  };
}

describe("Ordenação e Destaque Prioritário de Microfluxos", () => {
  it("deve posicionar o microfluxo com destaque prioritário sempre em primeiro lugar", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "WhatsApp", 0, false),
      criarMicrofluxoMock("f2", "Seguro", 1, false),
      criarMicrofluxoMock("f3", "Financiamento", 2, true),
      criarMicrofluxoMock("f4", "Troca", 3, false),
    ];

    const ordenada = ordenarMicrofluxosPorPrioridadeEOrdem(lista);

    expect(ordenada[0]?.id).toBe("f3");
    expect(ordenada[0]?.destaquePrimarioHome).toBe(true);
    expect(ordenada[0]?.ordemHome).toBe(0);

    expect(ordenada[1]?.id).toBe("f1");
    expect(ordenada[1]?.ordemHome).toBe(1);

    expect(ordenada[2]?.id).toBe("f2");
    expect(ordenada[2]?.ordemHome).toBe(2);

    expect(ordenada[3]?.id).toBe("f4");
    expect(ordenada[3]?.ordemHome).toBe(3);
  });

  it("deve garantir unicidade do destaque prioritário removendo destaque duplicado", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "WhatsApp", 0, true),
      criarMicrofluxoMock("f2", "Financiamento", 1, true),
      criarMicrofluxoMock("f3", "Seguro", 2, false),
    ];

    const ordenada = ordenarMicrofluxosPorPrioridadeEOrdem(lista);

    expect(ordenada[0]?.id).toBe("f1");
    expect(ordenada[0]?.destaquePrimarioHome).toBe(true);
    expect(ordenada[1]?.id).toBe("f2");
    expect(ordenada[1]?.destaquePrimarioHome).toBe(false);
  });

  it("não deve permitir mover o item destacado na posição 0 para outra posição", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "Destaque", 0, true),
      criarMicrofluxoMock("f2", "Item 2", 1, false),
      criarMicrofluxoMock("f3", "Item 3", 2, false),
    ];

    const tentouMoverDestaqueParaDireita = reordenarPosicaoMicrofluxo(lista, 0, 1);
    expect(tentouMoverDestaqueParaDireita[0]?.id).toBe("f1");
    expect(tentouMoverDestaqueParaDireita[1]?.id).toBe("f2");

    const tentouMoverDestaqueParaEsquerda = reordenarPosicaoMicrofluxo(lista, 0, -1);
    expect(tentouMoverDestaqueParaEsquerda[0]?.id).toBe("f1");
  });

  it("não deve permitir que outro item ultrapasse o item destacado na posição 0", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "Destaque", 0, true),
      criarMicrofluxoMock("f2", "Item 2", 1, false),
      criarMicrofluxoMock("f3", "Item 3", 2, false),
    ];

    const tentouMoverItem2ParaEsquerda = reordenarPosicaoMicrofluxo(lista, 1, -1);
    expect(tentouMoverItem2ParaEsquerda[0]?.id).toBe("f1");
    expect(tentouMoverItem2ParaEsquerda[1]?.id).toBe("f2");
  });

  it("deve reordenar perfeitamente entre itens não destacados", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "Destaque", 0, true),
      criarMicrofluxoMock("f2", "Item 2", 1, false),
      criarMicrofluxoMock("f3", "Item 3", 2, false),
      criarMicrofluxoMock("f4", "Item 4", 3, false),
    ];

    // Mover Item 3 (índice 2) para a esquerda (índice 1)
    const movidoParaEsquerda = reordenarPosicaoMicrofluxo(lista, 2, -1);
    expect(movidoParaEsquerda[0]?.id).toBe("f1");
    expect(movidoParaEsquerda[1]?.id).toBe("f3");
    expect(movidoParaEsquerda[2]?.id).toBe("f2");
    expect(movidoParaEsquerda[3]?.id).toBe("f4");

    expect(movidoParaEsquerda.map((m) => m.ordemHome)).toEqual([0, 1, 2, 3]);

    // Mover Item 2 (agora no índice 2) para a direita (índice 3)
    const movidoParaDireita = reordenarPosicaoMicrofluxo(movidoParaEsquerda, 2, 1);
    expect(movidoParaDireita[0]?.id).toBe("f1");
    expect(movidoParaDireita[1]?.id).toBe("f3");
    expect(movidoParaDireita[2]?.id).toBe("f4");
    expect(movidoParaDireita[3]?.id).toBe("f2");
  });

  it("deve permitir mover para a posição 0 se não houver nenhum item destacado", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "Item 1", 0, false),
      criarMicrofluxoMock("f2", "Item 2", 1, false),
    ];

    const movido = reordenarPosicaoMicrofluxo(lista, 1, -1);
    expect(movido[0]?.id).toBe("f2");
    expect(movido[1]?.id).toBe("f1");
  });

  it("ao definir novo destaque exclusivo, deve promovê-lo a 1º e desmarcar outros", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "Item 1", 0, true),
      criarMicrofluxoMock("f2", "Item 2", 1, false),
      criarMicrofluxoMock("f3", "Item 3", 2, false),
    ];

    const comNovoDestaque = definirDestaqueExclusivoMicrofluxo(lista, "f3", true);

    expect(comNovoDestaque[0]?.id).toBe("f3");
    expect(comNovoDestaque[0]?.destaquePrimarioHome).toBe(true);
    expect(comNovoDestaque[0]?.ordemHome).toBe(0);

    expect(comNovoDestaque[1]?.id).toBe("f1");
    expect(comNovoDestaque[1]?.destaquePrimarioHome).toBe(false);

    expect(comNovoDestaque[2]?.id).toBe("f2");
    expect(comNovoDestaque[2]?.destaquePrimarioHome).toBe(false);
  });
});
