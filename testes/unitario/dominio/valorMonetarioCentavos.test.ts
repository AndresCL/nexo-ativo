import { describe, expect, it } from "vitest";
import { ErroOperacaoMonetaria } from "@/dominio/erros/errosDominio";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";

describe("ValorMonetarioCentavos", () => {
  it("deve representar e formatar valores em reais a partir de centavos inteiros sem perda de precisão", () => {
    const planoPro = ValorMonetarioCentavos.deCentavos(9700);
    const planoEquipe = ValorMonetarioCentavos.deReaisInteiros(197);
    const gratuito = ValorMonetarioCentavos.zero();

    expect(planoPro.obterCentavos()).toBe(9700);
    expect(planoPro.formatarMoedaBrasileira()).toBe("R$ 97,00");
    expect(planoEquipe.formatarMoedaBrasileira()).toBe("R$ 197,00");
    expect(gratuito.formatarMoedaBrasileira()).toBe("R$ 0,00");
  });

  it("deve somar, subtrair e multiplicar quantidades inteiras de forma determinística", () => {
    const valorBase = ValorMonetarioCentavos.deCentavos(29700);
    const adicional = ValorMonetarioCentavos.deCentavos(5050);

    const total = valorBase.somar(adicional);
    expect(total.obterCentavos()).toBe(34750);
    expect(total.formatarMoedaBrasileira()).toBe("R$ 347,50");

    const aposDesconto = total.subtrairNaoNegativo(adicional);
    expect(aposDesconto.igualA(valorBase)).toBe(true);

    const triplicado = adicional.multiplicarPorQuantidadeInteira(3);
    expect(triplicado.obterCentavos()).toBe(15150);
  });

  it("deve rejeitar números decimais de ponto flutuante, negativos ou subtrações inválidas", () => {
    expect(() => ValorMonetarioCentavos.deCentavos(97.5)).toThrowError(ErroOperacaoMonetaria);
    expect(() => ValorMonetarioCentavos.deCentavos(-100)).toThrowError(ErroOperacaoMonetaria);

    const menor = ValorMonetarioCentavos.deCentavos(1000);
    const maior = ValorMonetarioCentavos.deCentavos(2500);
    expect(() => menor.subtrairNaoNegativo(maior)).toThrowError(ErroOperacaoMonetaria);
  });
});
