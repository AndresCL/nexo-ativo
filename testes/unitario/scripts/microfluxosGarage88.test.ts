import { atualizarRespostaBloco } from "@/dominio/microfluxos/composicaoEtapaLivre";
import { describe, expect, it } from "vitest";
import { atualizarDefinicaoMicrofluxoGarage88 } from "../../../scripts/modelos/microfluxosGarage88";
import { CATALOGO_ACERVOS_DEMONSTRACAO } from "../../fixtures/dadosExemploVitrine";
import { avaliarIntegridadeGrafoMicrofluxo } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import {
  avancarEtapaExecucaoMicrofluxo,
  atualizarRespostasExecucaoMicrofluxo,
  criarEstadoExecucaoMicrofluxo,
  obterEtapaAtualExecucao,
} from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { projetarRespostasConclusao } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!;
const fluxos = acervo
  .microfluxos!.filter((m) => m.id !== "fluxo-profissional")
  .map(atualizarDefinicaoMicrofluxoGarage88);
function executar(fluxo: DefinicaoMicrofluxo, escolhas: Readonly<Record<string, string>>) {
  let estado = criarEstadoExecucaoMicrofluxo(fluxo);
  const percorridas: string[] = [];
  for (let limite = 0; limite < 12 && !estado.concluido; limite++) {
    const etapa = obterEtapaAtualExecucao(estado);
    percorridas.push(etapa.id);
    estado = atualizarRespostasExecucaoMicrofluxo(estado, {
      opcoesUnicasPorEtapa: {
        ...estado.respostas.opcoesUnicasPorEtapa,
        [etapa.id]: escolhas[etapa.id] ?? etapa.opcoes?.[0]?.id ?? "",
      },
      camposDinamicosPorEtapa: {
        ...estado.respostas.camposDinamicosPorEtapa,
        [etapa.id]: Object.fromEntries(
          (etapa.campos ?? []).map((c) => [
            c.id,
            c.tipo === "numero" ? 12 : c.tipo === "moeda" ? "10.000,00" : "Resposta de teste",
          ]),
        ),
      },
      ...(etapa.tipoEtapa === "selecao_catalogo"
        ? { produtoSelecionadoId: acervo.produtos[0]!.id }
        : {}),
      ...(etapa.tipoEtapa === "coleta_contato"
        ? { contatoVisitante: { nomeCompleto: "Pessoa Teste", telefoneOuWhatsapp: "22999999999" } }
        : {}),
    });
    for (const bloco of etapa.blocos ?? []) {
      if (bloco.tipo === "campo") {
        const valor =
          bloco.finalidade === "nomeCompleto"
            ? "Pessoa Teste"
            : bloco.finalidade === "telefoneOuWhatsapp"
              ? "22999999999"
              : bloco.campo.tipo === "email"
                ? "teste@example.com"
                : bloco.campo.tipo === "numero"
                  ? 12
                  : bloco.campo.tipo === "moeda"
                    ? "10.000,00"
                    : bloco.campo.tipo === "selecao_multipla"
                      ? [bloco.campo.opcoesCustomizadas![0]!]
                      : "Resposta de teste";
        estado = atualizarRespostasExecucaoMicrofluxo(
          estado,
          atualizarRespostaBloco(etapa, bloco, estado.respostas, valor),
        );
      }
      if (bloco.tipo === "escolha")
        estado = atualizarRespostasExecucaoMicrofluxo(
          estado,
          atualizarRespostaBloco(
            etapa,
            bloco,
            estado.respostas,
            escolhas[etapa.id] ?? bloco.opcoes[0]!.id,
          ),
        );
      if (bloco.tipo === "catalogo")
        estado = atualizarRespostasExecucaoMicrofluxo(estado, {
          produtoSelecionadoId: acervo.produtos[0]!.id,
        });
    }
    estado = avancarEtapaExecucaoMicrofluxo(estado, acervo);
  }
  expect(estado.concluido).toBe(true);
  expect(estado.respostas.contatoVisitante).toBeDefined();
  return { estado, percorridas };
}
describe("Percursos atualizados da Garage 88", () => {
  it.each(fluxos)("valida grafo, esquema, identidade e conclusão de $id", (fluxo) => {
    expect(esquemaDefinicaoMicrofluxo.safeParse(fluxo).success).toBe(true);
    expect(avaliarIntegridadeGrafoMicrofluxo(fluxo)).toEqual([]);
    expect(fluxo.id).toBe(acervo.microfluxos!.find((m) => m.id === fluxo.id)!.id);
    expect(fluxo.conclusao?.acoes).toHaveLength(2);
    expect(fluxo.conclusao?.resumo.campos.some((c) => c.etapaId === "etapa-contato")).toBe(false);
    expect(fluxo.regraCalculoComercial?.modalidade).toBe("sem_calculo");
  });
  it.each(
    ["estoque", "preferencias"].flatMap((veiculo) =>
      ["dinheiro", "troca", "sem-entrada"].map((entrada) => ({ veiculo, entrada })),
    ),
  )(
    "financiamento: $veiculo e $entrada pedem somente os dados aplicáveis",
    ({ veiculo, entrada }) => {
      const fluxo = fluxos.find((m) => m.id === "fluxo-financiamento")!;
      const { percorridas, estado } = executar(fluxo, {
        "etapa-escolha-veiculo": veiculo,
        "etapa-tipo-entrada": entrada,
      });
      expect(percorridas.includes("etapa-catalogo-financiamento")).toBe(veiculo === "estoque");
      expect(percorridas.includes("etapa-preferencias-financiamento")).toBe(
        veiculo === "preferencias",
      );
      expect(percorridas.includes("etapa-veiculo-troca")).toBe(entrada === "troca");
      expect(percorridas.includes("etapa-valor-entrada")).toBe(entrada === "dinheiro");
      const resumo = projetarRespostasConclusao(
        estado,
        fluxo.conclusao!.resumo.campos,
        acervo,
        obterPoliticaPublicidade("padrao"),
      );
      expect(resumo.some((r) => r.rotulo === "Valor da entrada")).toBe(entrada === "dinheiro");
    },
  );
  it.each(
    ["novo", "renovar"].flatMap((situacao) =>
      ["particular", "comercial"].map((uso) => ({ situacao, uso })),
    ),
  )("seguro: $situacao e $uso seguem seus ramos", ({ situacao, uso }) => {
    const { percorridas } = executar(
      fluxos.find((m) => m.id === "fluxo-diagnostico")!,
      { "etapa-situacao-seguro": situacao, "etapa-uso-veiculo": uso },
    );
    expect(percorridas.includes("etapa-renovacao-seguro")).toBe(situacao === "renovar");
    expect(percorridas.includes("etapa-uso-profissional")).toBe(uso === "comercial");
  });
  it.each(["venda", "troca", "troco"])(
    "avaliação: %s coleta interesse de troca somente quando necessário",
    (modalidade) => {
      const { percorridas } = executar(
        fluxos.find((m) => m.id === "fluxo-atendimento")!,
        { "etapa-modalidade-negociacao": modalidade },
      );
      expect(percorridas.includes("etapa-interesse-troca")).toBe(modalidade !== "venda");
    },
  );
  it.each(["proposta", "visita"])("catálogo: %s coleta agenda apenas para visita", (objetivo) => {
    const { percorridas } = executar(
      fluxos.find((m) => m.id === "fluxo-catalogo")!,
      { "etapa-proximo-passo": objetivo },
    );
    expect(percorridas.includes("etapa-preferencia-visita")).toBe(objetivo === "visita");
  });
  it("preserva ações diretas e personalizações da entrada", () => {
    const direto = { ...acervo.microfluxos![0]!, tipoAcao: "link_externo" as const };
    expect(atualizarDefinicaoMicrofluxoGarage88(direto)).toBe(direto);
    const atual = {
      ...acervo.microfluxos![0]!,
      titulo: "Minha simulação",
      ordemHome: 8,
      iconeBotaoHome: "carro",
      ativoNaHome: false,
    };
    expect(atualizarDefinicaoMicrofluxoGarage88(atual)).toMatchObject({
      titulo: atual.titulo,
      ordemHome: 8,
      iconeBotaoHome: "carro",
      ativoNaHome: false,
    });
  });
});
