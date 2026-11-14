import { describe, expect, it } from "vitest";
import {
  conectarNoEditor,
  desconectarArestaEditor,
  descreverTipoCardEtapa,
  listarSaidasOpcoesEditor,
  projetarArestasEditor,
} from "@/componentes/painel/microfluxos/estruturaEditorFluxo";
import { converterEtapaParaLivre } from "@/dominio/microfluxos/composicaoEtapaLivre";
import {
  avancarEtapaExecucaoMicrofluxo,
  criarEstadoExecucaoMicrofluxo,
  resolverProximaEtapaId,
  atualizarRespostasExecucaoMicrofluxo,
} from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import { avaliarIntegridadeGrafoMicrofluxo } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import type { EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
const base = criarMicrofluxoPadraoParaTestes({
  organizacaoId: "org-teste",
  nomeOrganizacao: "Teste",
  modelo: "catalogo",
});
const escolha = converterEtapaParaLivre({
  id: "escolha",
  titulo: "Como deseja continuar?",
  tipoEtapa: "selecao_unica",
  obrigatoria: true,
  opcoes: [
    { id: "a", rotulo: "À vista", proximaEtapaIdOpcional: "vista" },
    { id: "b", rotulo: "Financiado", proximaEtapaIdOpcional: "financiamento" },
  ],
});
const etapa = (id: string): EtapaMicrofluxo => ({
  id,
  tipoEtapa: "etapa_livre",
  titulo: id,
  obrigatoria: false,
  blocos: [],
});
const fluxo = {
  ...base,
  etapaInicialId: escolha.id,
  etapas: [escolha, etapa("vista"), etapa("financiamento")],
};
describe("Estrutura visual do editor", () => {
  it.each([
    ["selecao_unica", "Pergunta de escolha"],
    ["selecao_multipla", "Múltipla escolha"],
    ["coleta_contato", "Dados para retorno"],
    ["selecao_catalogo", "Catálogo"],
    ["selecao_profissional", "Equipe"],
  ] as const)(
    "identifica %s depois da conversão e preserva a origem do modelo",
    (tipoEtapa, rotulo) => {
      const livre = converterEtapaParaLivre({
        ...escolha,
        modeloOrigem: undefined,
        tipoEtapa,
        campos: undefined,
      });
      expect(descreverTipoCardEtapa(livre)).toMatchObject({ tipo: rotulo, modelo: rotulo });
      expect(
        esquemaDefinicaoMicrofluxo.parse({ ...base, etapas: [livre] }).etapas[0]!.modeloOrigem,
      ).toBe(tipoEtapa);
    },
  );
  it("identifica composição mista mesmo quando começou de um modelo de catálogo", () => {
    const catalogo = converterEtapaParaLivre({
      id: "misto",
      titulo: "Misto",
      tipoEtapa: "selecao_catalogo",
      obrigatoria: true,
    });
    expect(
      descreverTipoCardEtapa({
        ...catalogo,
        blocos: [
          ...catalogo.blocos!,
          {
            id: "telefone",
            tipo: "campo",
            campo: { id: "telefone", rotulo: "Telefone", tipo: "telefone", obrigatorio: false },
          },
        ],
      }),
    ).toEqual({ tipo: "Composição mista", modelo: "Catálogo" });
  });
  it("não desenha conexões para etapas soltas nem escolhe a etapa inicial automaticamente", () => {
    const solto = { ...base, etapaInicialId: "", etapas: [etapa("solta")] };
    expect(projetarArestasEditor(solto, "@inicio", "@fim", true)).toEqual([]);
    expect(solto.etapaInicialId).toBe("");
  });
  it("o Início altera só a referência da primeira etapa e sua desconexão deixa o rascunho sem entrada", () => {
    const novo = conectarNoEditor(
      { ...fluxo, etapaInicialId: "" },
      { source: "@inicio", target: escolha.id, sourceHandle: "inicio" },
      "@inicio",
      "@fim",
    )!;
    expect(novo.etapaInicialId).toBe(escolha.id);
    expect(novo.etapas).toBe(fluxo.etapas);
    expect(JSON.stringify(novo)).not.toContain("@inicio");
    expect(
      desconectarArestaEditor(novo, { source: "@inicio", target: escolha.id }, "@inicio")
        .etapaInicialId,
    ).toBe("");
    expect(
      conectarNoEditor(novo, { source: "@inicio", target: "@fim" }, "@inicio", "@fim"),
    ).toBeNull();
  });
  it("cada alternativa possui um conector diferente e segue o destino configurado no motor", () => {
    const saidas = listarSaidasOpcoesEditor(escolha);
    expect(saidas).toHaveLength(2);
    expect(saidas[0]!.id).not.toBe(saidas[1]!.id);
    const atualizado = conectarNoEditor(
      fluxo,
      { source: escolha.id, target: "financiamento", sourceHandle: saidas[0]!.id },
      "@inicio",
      "@fim",
    )!;
    const estado = atualizarRespostasExecucaoMicrofluxo(criarEstadoExecucaoMicrofluxo(atualizado), {
      camposDinamicosPorEtapa: { escolha: { escolha: "a" } },
    });
    expect(resolverProximaEtapaId(atualizado, atualizado.etapas[0]!, estado.respostas)).toBe(
      "financiamento",
    );
    expect(listarSaidasOpcoesEditor(atualizado.etapas[0]!)[1]!.destino).toBe("financiamento");
    const arestas = projetarArestasEditor(atualizado, "@inicio", "@fim", true).filter(
      (a) => a.source === escolha.id,
    );
    expect(arestas.map((a) => a.sourceHandle)).toEqual(saidas.map((s) => s.id));
    expect(arestas.map((a) => a.label)).toEqual(["À vista", "Financiado"]);
  });
  it("permite uma resposta terminar e outra seguir o percurso, sem alterar o caminho padrão", () => {
    const saida = listarSaidasOpcoesEditor(escolha)[0]!;
    const atualizado = conectarNoEditor(
      fluxo,
      { source: escolha.id, target: "@fim", sourceHandle: saida.id },
      "@inicio",
      "@fim",
    )!;
    expect(listarSaidasOpcoesEditor(atualizado.etapas[0]!)[0]).toMatchObject({
      encerrar: true,
      destino: undefined,
    });
    const estado = atualizarRespostasExecucaoMicrofluxo(criarEstadoExecucaoMicrofluxo(atualizado), {
      camposDinamicosPorEtapa: { escolha: { escolha: "a" } },
    });
    expect(resolverProximaEtapaId(atualizado, atualizado.etapas[0]!, estado.respostas)).toBeNull();
    const removida = desconectarArestaEditor(
      atualizado,
      { source: escolha.id, target: "@fim", sourceHandle: saida.id },
      "@inicio",
    );
    expect(listarSaidasOpcoesEditor(removida.etapas[0]!)[0]!.encerrar).toBe(false);
    expect(listarSaidasOpcoesEditor(removida.etapas[0]!)[1]!.destino).toBe("financiamento");
  });
  it("preserva a validação de publicação para passos desconectados", () => {
    const comSolto = { ...fluxo, etapas: [...fluxo.etapas, etapa("desconectada")] };
    expect(
      avaliarIntegridadeGrafoMicrofluxo(comSolto).some(
        (i) => i.codigo === "ETAPA_ORFA_INALCANCAVEL",
      ),
    ).toBe(true);
  });
  it("permite conectar uma caixa solta à finalização antes de definir a entrada", () => {
    const solto = { ...base, etapaInicialId: "", etapas: [etapa("solta")] };
    const ligado = conectarNoEditor(
      solto,
      { source: "solta", target: "@fim", sourceHandle: "padrao" },
      "@inicio",
      "@fim",
    )!;
    expect(ligado.etapaInicialId).toBe("");
    expect(projetarArestasEditor(ligado, "@inicio", "@fim", true)).toEqual([
      expect.objectContaining({ source: "solta", target: "@fim", sourceHandle: "padrao" }),
    ]);
    expect(
      projetarArestasEditor(
        desconectarArestaEditor(
          ligado,
          { source: "solta", target: "@fim", sourceHandle: "padrao" },
          "@inicio",
        ),
        "@inicio",
        "@fim",
        true,
      ),
    ).toEqual([]);
  });
  it("apagar uma resposta deixa a saída livre após salvar e reabrir, sem criar outro link", () => {
    const comPadrao = {
      ...fluxo,
      etapas: [{ ...escolha, proximaEtapaPadraoId: "vista" }, ...fluxo.etapas.slice(1)],
    };
    const aresta = projetarArestasEditor(comPadrao, "@inicio", "@fim", true).find(
      (a) => a.opcaoId === "a",
    )!;
    const removido = desconectarArestaEditor(comPadrao, aresta, "@inicio");
    const reaberto = esquemaDefinicaoMicrofluxo.parse(JSON.parse(JSON.stringify(removido)));
    const arestas = projetarArestasEditor(reaberto, "@inicio", "@fim", true);
    expect(arestas.some((a) => a.sourceHandle === aresta.sourceHandle)).toBe(false);
    expect(listarSaidasOpcoesEditor(reaberto.etapas[0]!)).toHaveLength(2);
    expect(arestas.some((a) => a.opcaoId === "b" && a.target === "financiamento")).toBe(true);
    expect(
      avaliarIntegridadeGrafoMicrofluxo(reaberto).some((p) => p.codigo === "SAIDA_DESCONECTADA"),
    ).toBe(true);
    const estado = atualizarRespostasExecucaoMicrofluxo(criarEstadoExecucaoMicrofluxo(reaberto), {
      camposDinamicosPorEtapa: { escolha: { escolha: "a" } },
    });
    expect(() => avancarEtapaExecucaoMicrofluxo(estado)).toThrow(/saída ainda não possui/);
    const religado = conectarNoEditor(
      reaberto,
      { source: escolha.id, sourceHandle: aresta.sourceHandle, target: "financiamento" },
      "@inicio",
      "@fim",
    )!;
    expect(listarSaidasOpcoesEditor(religado.etapas[0]!)[0]!.desconectada).toBe(false);
    expect(
      projetarArestasEditor(religado, "@inicio", "@fim", true).find(
        (a) => a.sourceHandle === aresta.sourceHandle,
      )?.target,
    ).toBe("financiamento");
  });
  it("permite apagar um link herdado do caminho padrão sem apagar os outros caminhos", () => {
    const apenasPadrao = {
      ...fluxo,
      etapas: [
        {
          ...escolha,
          blocos: escolha.blocos!.map((b) =>
            b.tipo === "escolha"
              ? { ...b, opcoes: b.opcoes.map((o) => ({ ...o, proximaEtapaIdOpcional: undefined })) }
              : b,
          ),
          proximaEtapaPadraoId: "vista",
        },
        ...fluxo.etapas.slice(1),
      ],
    };
    const aresta = projetarArestasEditor(apenasPadrao, "@inicio", "@fim", true).find(
      (a) => a.opcaoId === "a",
    )!;
    expect(aresta.inferida).toBe(true);
    const novas = projetarArestasEditor(
      desconectarArestaEditor(apenasPadrao, aresta, "@inicio"),
      "@inicio",
      "@fim",
      true,
    );
    expect(novas.some((a) => a.opcaoId === "a")).toBe(false);
    expect(novas.some((a) => a.opcaoId === "b" && a.target === "vista")).toBe(true);
  });
  it("apagar o caminho padrão não cria finalização automática, e pode ser religado", () => {
    const modelo = { ...base, etapaInicialId: "livre", etapas: [etapa("livre"), etapa("outro")] };
    const aresta = projetarArestasEditor(modelo, "@inicio", "@fim", true).find(
      (a) => a.source === "livre",
    )!;
    const removido = desconectarArestaEditor(modelo, aresta, "@inicio");
    expect(
      projetarArestasEditor(removido, "@inicio", "@fim", true).some((a) => a.source === "livre"),
    ).toBe(false);
    const ligado = conectarNoEditor(
      removido,
      { source: "livre", target: "outro", sourceHandle: "padrao" },
      "@inicio",
      "@fim",
    )!;
    expect(ligado.etapas[0]!.saidaPadraoDesconectada).toBe(false);
    expect(projetarArestasEditor(ligado, "@inicio", "@fim", true)).toContainEqual(
      expect.objectContaining({ source: "livre", target: "outro" }),
    );
  });
  it("uma escolha com todas as alternativas ligadas não depende da saída padrão", () => {
    expect(
      avaliarIntegridadeGrafoMicrofluxo({
        ...fluxo,
        etapas: [{ ...escolha, saidaPadraoDesconectada: true }, ...fluxo.etapas.slice(1)],
      }),
    ).toEqual([]);
  });
});
