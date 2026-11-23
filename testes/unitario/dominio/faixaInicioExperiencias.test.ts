import { describe, expect, it } from "vitest";
import {
  FAIXA_INICIO_EXPERIENCIAS_PADRAO,
  POSICAO_CABECALHO_MARCA_PADRAO,
  ehFaixaInicioExperienciasValida,
  ehPosicaoCabecalhoMarcaValida,
  obterClasseRespiroAberturaExperiencias,
  obterDescritorFaixaInicioExperiencias,
  resolverFaixaInicioExperiencias,
  resolverPosicaoCabecalhoMarca,
} from "@/dominio/editorial/faixaInicioExperiencias";
import {
  converterRascunhoParaConteudoPublicado,
  criarRascunhoConfiguracaoPaginaPadrao,
  hidratarRascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { esquemaRascunhoConfiguracaoPagina } from "@/validacoes/esquemaRascunhoPagina";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";

describe("faixaInicioExperiencias", () => {
  it("valida e resolve as faixas suportadas com fallback seguro para o padrão", () => {
    expect(ehFaixaInicioExperienciasValida("alto")).toBe(true);
    expect(ehFaixaInicioExperienciasValida("centro")).toBe(true);
    expect(ehFaixaInicioExperienciasValida("baixo")).toBe(true);
    expect(ehFaixaInicioExperienciasValida("extra_baixo")).toBe(true);
    expect(ehFaixaInicioExperienciasValida("invalida")).toBe(false);

    expect(resolverFaixaInicioExperiencias(undefined)).toBe(FAIXA_INICIO_EXPERIENCIAS_PADRAO);
    expect(resolverFaixaInicioExperiencias("alto")).toBe("alto");
    expect(resolverFaixaInicioExperiencias("centro")).toBe("centro");
    expect(resolverFaixaInicioExperiencias("extra_baixo")).toBe("extra_baixo");
  });

  it("retorna classes com svh/clamp na viewport real e rem fixo na prévia contida", () => {
    expect(obterClasseRespiroAberturaExperiencias("alto")).toBe("pt-0");
    expect(obterClasseRespiroAberturaExperiencias("centro")).toContain("svh");
    expect(obterClasseRespiroAberturaExperiencias("baixo")).toContain("svh");
    expect(obterClasseRespiroAberturaExperiencias("extra_baixo")).toContain("svh");

    expect(
      obterClasseRespiroAberturaExperiencias("centro", { alturaContidaPrevia: true }),
    ).not.toContain("svh");
    expect(
      obterClasseRespiroAberturaExperiencias("baixo", { alturaContidaPrevia: true }),
    ).not.toContain("svh");
    expect(
      obterClasseRespiroAberturaExperiencias("extra_baixo", { alturaContidaPrevia: true }),
    ).toContain("pt-80");

    expect(obterDescritorFaixaInicioExperiencias("alto").classeAlinhamentoDesktop).toBe(
      "@5xl:content-start",
    );
    expect(obterDescritorFaixaInicioExperiencias("centro").classeAlinhamentoDesktop).toBe(
      "@5xl:content-center",
    );
    expect(obterDescritorFaixaInicioExperiencias("baixo").classeAlinhamentoDesktop).toBe(
      "@5xl:content-end",
    );
    expect(obterDescritorFaixaInicioExperiencias("extra_baixo").classeAlinhamentoDesktop).toBe(
      "@5xl:content-end",
    );
  });

  it("hidrata, valida e publica faixaInicioExperiencias no rascunho e na página publicada", () => {
    const base = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-1",
      nomeOrganizacao: "Clínica Exemplo",
    });

    const hidratado = hidratarRascunhoConfiguracaoPagina(
      {
        ...base,
        faixaInicioExperiencias: "centro",
        identidade: { ...base.identidade, posicaoCabecalho: "acima_experiencias" },
      },
      { organizacaoId: "org-1", nomeOrganizacao: "Clínica Exemplo" },
    );
    expect(hidratado.faixaInicioExperiencias).toBe("centro");
    expect(hidratado.identidade.posicaoCabecalho).toBe("acima_experiencias");
    expect(esquemaRascunhoConfiguracaoPagina.safeParse(hidratado).success).toBe(true);

    const publicada = converterRascunhoParaConteudoPublicado(hidratado, {
      identificadorPublico: "clinica-exemplo",
      versaoPublicada: 1,
    });
    expect(publicada.faixaInicioExperiencias).toBe("centro");
    expect(publicada.identidade.posicaoCabecalho).toBe("acima_experiencias");
    expect(esquemaConteudoPaginaPublicada.safeParse(publicada).success).toBe(true);
  });

  it("valida posição do cabeçalho da marca e preserva respiro mínimo em Alto sem marca no topo", () => {
    expect(ehPosicaoCabecalhoMarcaValida("topo")).toBe(true);
    expect(ehPosicaoCabecalhoMarcaValida("acima_experiencias")).toBe(true);
    expect(ehPosicaoCabecalhoMarcaValida("rodape")).toBe(false);
    expect(resolverPosicaoCabecalhoMarca(undefined)).toBe(POSICAO_CABECALHO_MARCA_PADRAO);

    expect(
      obterClasseRespiroAberturaExperiencias("alto", { marcaNoTopo: false }),
    ).toContain("pt-10");
    expect(
      obterClasseRespiroAberturaExperiencias("baixo", {
        marcaNoTopo: false,
        alturaContidaPrevia: true,
      }),
    ).toContain("pt-72");
    expect(
      obterClasseRespiroAberturaExperiencias("extra_baixo", {
        marcaNoTopo: false,
        alturaContidaPrevia: true,
      }),
    ).toContain("pt-96");
  });
});
