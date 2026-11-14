import { describe, expect, it } from "vitest";
import { ErroValidacaoDominio } from "@/dominio/erros/errosDominio";
import { PontoFocalMidia } from "@/dominio/objetos-valor/pontoFocalMidia";

describe("PontoFocalMidia", () => {
  it("deve gerar posição CSS exata para o enquadramento central e de retrato editorial", () => {
    expect(PontoFocalMidia.centro().gerarPosicaoObjetoCss()).toBe("50% 50%");
    expect(PontoFocalMidia.retratoSuperior().gerarPosicaoObjetoCss()).toBe("50% 28%");
  });

  it("deve arredondar valores fracionários válidos e bloquear coordenadas fora de 0 a 100", () => {
    const ponto = PontoFocalMidia.criar(33.4, 66.7);
    expect(ponto.gerarPosicaoObjetoCss()).toBe("33% 67%");

    expect(() => PontoFocalMidia.criar(-1, 50)).toThrowError(ErroValidacaoDominio);
    expect(() => PontoFocalMidia.criar(50, 101)).toThrowError(ErroValidacaoDominio);
  });
});
