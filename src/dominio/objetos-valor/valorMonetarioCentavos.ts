import { ErroOperacaoMonetaria } from "../erros/errosDominio";

const FORMATADOR_REAL_BRASILEIRO = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Objeto de valor imutável para representação monetária segura em centavos inteiros.
 * Elimina imprecisões de ponto flutuante (IEEE 754) em planos, cálculos e orçamentos.
 */
export class ValorMonetarioCentavos {
  private readonly centavos: number;

  private constructor(centavos: number) {
    if (!Number.isSafeInteger(centavos)) {
      throw new ErroOperacaoMonetaria(
        "O valor monetário interno deve ser representado como um número inteiro seguro de centavos.",
      );
    }

    if (centavos < 0) {
      throw new ErroOperacaoMonetaria(
        "Não é permitido criar um valor monetário comercial negativo.",
      );
    }

    this.centavos = centavos;
  }

  public static zero(): ValorMonetarioCentavos {
    return new ValorMonetarioCentavos(0);
  }

  public static deCentavos(centavos: number): ValorMonetarioCentavos {
    return new ValorMonetarioCentavos(centavos);
  }

  public static deReaisInteiros(reaisInteiros: number): ValorMonetarioCentavos {
    if (!Number.isSafeInteger(reaisInteiros) || reaisInteiros < 0) {
      throw new ErroOperacaoMonetaria(
        "O valor em reais inteiros deve ser um número inteiro não negativo.",
      );
    }

    return new ValorMonetarioCentavos(reaisInteiros * 100);
  }

  public obterCentavos(): number {
    return this.centavos;
  }

  public somar(outroValor: ValorMonetarioCentavos): ValorMonetarioCentavos {
    return new ValorMonetarioCentavos(this.centavos + outroValor.centavos);
  }

  public subtrairNaoNegativo(outroValor: ValorMonetarioCentavos): ValorMonetarioCentavos {
    if (outroValor.centavos > this.centavos) {
      throw new ErroOperacaoMonetaria(
        "O desconto ou abatimento não pode superar o valor monetário base.",
      );
    }

    return new ValorMonetarioCentavos(this.centavos - outroValor.centavos);
  }

  public multiplicarPorQuantidadeInteira(quantidade: number): ValorMonetarioCentavos {
    if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
      throw new ErroOperacaoMonetaria(
        "A quantidade multiplicadora deve ser um número inteiro não negativo.",
      );
    }

    return new ValorMonetarioCentavos(this.centavos * quantidade);
  }

  public igualA(outroValor: ValorMonetarioCentavos): boolean {
    return this.centavos === outroValor.centavos;
  }

  public formatarMoedaBrasileira(): string {
    return FORMATADOR_REAL_BRASILEIRO.format(this.centavos / 100).replace(/\u00a0/g, " ");
  }
}
