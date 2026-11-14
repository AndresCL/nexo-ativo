import { describe, expect, it } from "vitest";
import { reservarConsultaAvaliacoesGoogle } from "../../../funcoes/src/avaliacoes/limitadorConsultasAvaliacoesGoogle";
import { criarBancoAvaliacoesGoogleTeste } from "../../fixtures/bancoAvaliacoesGoogleTeste";

describe("Limites de consumo das avaliações do Google", () => {
  const agora = new Date("2026-11-12T12:00:00Z");
  const limites = { porMinuto: 2, porMes: 3, globalPorMes: 4 };

  it("reserva consultas simultâneas sem ultrapassar o limite da janela", async () => {
    const { bancoDados, documentos } = criarBancoAvaliacoesGoogleTeste();
    const tentativas = await Promise.allSettled(
      Array.from({ length: 3 }, () =>
        reservarConsultaAvaliacoesGoogle(bancoDados, "org-serena", agora, limites),
      ),
    );
    expect(tentativas.filter((resultado) => resultado.status === "fulfilled")).toHaveLength(2);
    expect(documentos.get("consumoAvaliacoesGoogle/org-serena")).toMatchObject({
      consultasMinuto: 2,
      consultasMes: 2,
    });
    expect(Object.keys(documentos.get("consumoAvaliacoesGoogle/org-serena")!)).toEqual([
      "mes",
      "minuto",
      "consultasMinuto",
      "consultasMes",
    ]);
  });

  it("renova a janela de minuto sem renovar o limite mensal e renova o mês", async () => {
    const { bancoDados } = criarBancoAvaliacoesGoogleTeste();
    await reservarConsultaAvaliacoesGoogle(bancoDados, "org-serena", agora, limites);
    await reservarConsultaAvaliacoesGoogle(bancoDados, "org-serena", agora, limites);
    await reservarConsultaAvaliacoesGoogle(
      bancoDados,
      "org-serena",
      new Date("2026-11-12T12:01:00Z"),
      limites,
    );
    await expect(
      reservarConsultaAvaliacoesGoogle(
        bancoDados,
        "org-serena",
        new Date("2026-11-12T12:02:00Z"),
        limites,
      ),
    ).rejects.toMatchObject({ code: "resource-exhausted" });
    await expect(
      reservarConsultaAvaliacoesGoogle(
        bancoDados,
        "org-serena",
        new Date("2026-12-01T00:00:00Z"),
        limites,
      ),
    ).resolves.toBeUndefined();
  });

  it("aplica também um teto compartilhado entre organizações", async () => {
    const { bancoDados } = criarBancoAvaliacoesGoogleTeste();
    const limiteGlobal = { ...limites, globalPorMes: 1 };
    await reservarConsultaAvaliacoesGoogle(bancoDados, "org-serena", agora, limiteGlobal);
    await expect(
      reservarConsultaAvaliacoesGoogle(bancoDados, "outra-org", agora, limiteGlobal),
    ).rejects.toMatchObject({ code: "resource-exhausted" });
  });
});
