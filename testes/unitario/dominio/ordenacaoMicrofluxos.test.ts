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

describe("Ordenação e Destaque Visual de Microfluxos", () => {
  it("preserva a ordem por ordemHome mesmo quando um item intermediário tem destaque visual", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "WhatsApp", 0, false),
      criarMicrofluxoMock("f2", "Seguro", 1, false),
      criarMicrofluxoMock("f3", "Financiamento", 2, true),
      criarMicrofluxoMock("f4", "Troca", 3, false),
    ];

    const ordenada = ordenarMicrofluxosPorPrioridadeEOrdem(lista);

    expect(ordenada.map((m) => m.id)).toEqual(["f1", "f2", "f3", "f4"]);
    expect(ordenada[2]?.destaquePrimarioHome).toBe(true);
    expect(ordenada.map((m) => m.ordemHome)).toEqual([0, 1, 2, 3]);
  });

  it("garante unicidade do destaque visual removendo destaque duplicado", () => {
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

  it("permite mover livremente o item destacado e qualquer outro item para qualquer posição", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "Destaque", 0, true),
      criarMicrofluxoMock("f2", "Item 2", 1, false),
      criarMicrofluxoMock("f3", "Item 3", 2, false),
    ];

    const movidoParaBaixo = reordenarPosicaoMicrofluxo(lista, 0, 1);
    expect(movidoParaBaixo.map((m) => m.id)).toEqual(["f2", "f1", "f3"]);
    expect(movidoParaBaixo[1]?.destaquePrimarioHome).toBe(true);
    expect(movidoParaBaixo.map((m) => m.ordemHome)).toEqual([0, 1, 2]);
  });

  it("ao definir novo destaque exclusivo, mantém a posição atual e desmarca outros", () => {
    const lista: DefinicaoMicrofluxo[] = [
      criarMicrofluxoMock("f1", "Item 1", 0, true),
      criarMicrofluxoMock("f2", "Item 2", 1, false),
      criarMicrofluxoMock("f3", "Item 3", 2, false),
    ];

    const comNovoDestaque = definirDestaqueExclusivoMicrofluxo(lista, "f3", true);

    expect(comNovoDestaque.map((m) => m.id)).toEqual(["f1", "f2", "f3"]);
    expect(comNovoDestaque[0]?.destaquePrimarioHome).toBe(false);
    expect(comNovoDestaque[2]?.destaquePrimarioHome).toBe(true);
  });
});
