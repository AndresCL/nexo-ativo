import { ErroValidacaoDominio } from "../erros/errosDominio";

/**
 * Representa o enquadramento percentual da fotografia ou vídeo de fundo,
 * essencial para preservar rostos na composição Retrato Editorial em telas mobile e desktop.
 */
export class PontoFocalMidia {
  public readonly coordenadaXPercentual: number;
  public readonly coordenadaYPercentual: number;

  private constructor(coordenadaXPercentual: number, coordenadaYPercentual: number) {
    if (
      !Number.isFinite(coordenadaXPercentual) ||
      coordenadaXPercentual < 0 ||
      coordenadaXPercentual > 100
    ) {
      throw new ErroValidacaoDominio(
        "A coordenada horizontal do ponto focal deve estar entre 0 e 100.",
        "PONTO_FOCAL_X_INVALIDO",
      );
    }

    if (
      !Number.isFinite(coordenadaYPercentual) ||
      coordenadaYPercentual < 0 ||
      coordenadaYPercentual > 100
    ) {
      throw new ErroValidacaoDominio(
        "A coordenada vertical do ponto focal deve estar entre 0 e 100.",
        "PONTO_FOCAL_Y_INVALIDO",
      );
    }

    this.coordenadaXPercentual = Math.round(coordenadaXPercentual);
    this.coordenadaYPercentual = Math.round(coordenadaYPercentual);
  }

  public static criar(
    coordenadaXPercentual: number,
    coordenadaYPercentual: number,
  ): PontoFocalMidia {
    return new PontoFocalMidia(coordenadaXPercentual, coordenadaYPercentual);
  }

  public static centro(): PontoFocalMidia {
    return new PontoFocalMidia(50, 50);
  }

  public static retratoSuperior(): PontoFocalMidia {
    return new PontoFocalMidia(50, 28);
  }

  public gerarPosicaoObjetoCss(): string {
    return `${this.coordenadaXPercentual}% ${this.coordenadaYPercentual}%`;
  }
}
