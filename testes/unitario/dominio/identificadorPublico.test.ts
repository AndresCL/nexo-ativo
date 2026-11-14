import { describe, expect, it } from "vitest";
import { ErroIdentificadorReservado, ErroValidacaoDominio } from "@/dominio/erros/errosDominio";
import {
  ehIdentificadorPublicoValido,
  IdentificadorPublico,
  normalizarSugestaoIdentificador,
} from "@/dominio/objetos-valor/identificadorPublico";

describe("IdentificadorPublico", () => {
  it("deve aceitar endereços editoriais válidos e normalizar sugestões com acentuação", () => {
    const sugestao = normalizarSugestaoIdentificador("  Clínica São Lucas & Associados! ");
    expect(sugestao).toBe("clinica-sao-lucas-associados");

    const identificador = IdentificadorPublico.criar(sugestao);
    expect(identificador.obterValor()).toBe("clinica-sao-lucas-associados");
    expect(ehIdentificadorPublicoValido("atelier-lumina-2026")).toBe(true);
  });

  it("deve bloquear rotas reservadas do sistema como painel, fundador, entrar e api", () => {
    for (const reservado of ["painel", "fundador", "entrar", "api", "criar-conta", "planos"]) {
      expect(() => IdentificadorPublico.criar(reservado)).toThrowError(ErroIdentificadorReservado);
      expect(ehIdentificadorPublicoValido(reservado)).toBe(false);
    }
  });

  it("deve rejeitar caracteres maiúsculos, acentos, hífens duplos ou comprimento inválido", () => {
    expect(() => IdentificadorPublico.criar("ab")).toThrowError(ErroValidacaoDominio);
    expect(() => IdentificadorPublico.criar("Estudio-Aurora")).toThrowError(ErroValidacaoDominio);
    expect(() => IdentificadorPublico.criar("estudio--aurora")).toThrowError(ErroValidacaoDominio);
    expect(() => IdentificadorPublico.criar("-estudio")).toThrowError(ErroValidacaoDominio);
  });
});
