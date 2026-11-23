import { describe, expect, it } from "vitest";
import {
  TAMANHO_CABECALHO_MARCA_PADRAO,
  TAMANHOS_CABECALHO_MARCA,
  ehTamanhoCabecalhoMarcaValido,
  resolverTamanhoCabecalhoMarca,
} from "@/dominio/editorial/tamanhoCabecalhoMarca";
import { obterEscalaVisualCabecalhoMarca } from "@/componentes/editorial/escalaCabecalhoMarca";
import {
  converterRascunhoParaConteudoPublicado,
  criarRascunhoConfiguracaoPaginaPadrao,
  hidratarRascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { esquemaRascunhoConfiguracaoPagina } from "@/validacoes/esquemaRascunhoPagina";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";

describe("tamanhoCabecalhoMarca", () => {
  it("usa o menor tamanho como padrão e valida todos os tamanhos suportados", () => {
    expect(TAMANHO_CABECALHO_MARCA_PADRAO).toBe("pequeno");
    expect(TAMANHOS_CABECALHO_MARCA[0]).toBe("pequeno");

    expect(ehTamanhoCabecalhoMarcaValido("pequeno")).toBe(true);
    expect(ehTamanhoCabecalhoMarcaValido("medio")).toBe(true);
    expect(ehTamanhoCabecalhoMarcaValido("grande")).toBe(true);
    expect(ehTamanhoCabecalhoMarcaValido("extra_grande")).toBe(true);
    expect(ehTamanhoCabecalhoMarcaValido("gigante")).toBe(false);
    expect(ehTamanhoCabecalhoMarcaValido(undefined)).toBe(false);

    expect(resolverTamanhoCabecalhoMarca(undefined)).toBe("pequeno");
    expect(resolverTamanhoCabecalhoMarca("grande")).toBe("grande");
  });

  it("retorna escalas visuais progressivas com container queries e sem regressão no padrão", () => {
    const pequeno = obterEscalaVisualCabecalhoMarca(undefined);
    const medio = obterEscalaVisualCabecalhoMarca("medio");
    const grande = obterEscalaVisualCabecalhoMarca("grande");
    const extraGrande = obterEscalaVisualCabecalhoMarca("extra_grande");

    expect(pequeno.codigo).toBe("pequeno");
    expect(pequeno.classeLogoCirculo).toContain("h-12");
    expect(pequeno.classeTitulo).toContain("text-base");
    expect(pequeno.classeSubtitulo).toContain("text-[10px]");

    expect(medio.alturaImagemLivre).toBeGreaterThan(pequeno.alturaImagemLivre);
    expect(grande.alturaImagemLivre).toBeGreaterThan(medio.alturaImagemLivre);
    expect(extraGrande.alturaImagemLivre).toBeGreaterThan(grande.alturaImagemLivre);

    expect(extraGrande.classeLogoCirculo).toContain("@xl:");
    expect(extraGrande.classeLogoCirculo).not.toContain("sm:");
  });

  it("hidrata, valida e publica tamanhoCabecalho no rascunho e na página publicada", () => {
    const base = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-1",
      nomeOrganizacao: "Clínica Exemplo",
    });

    const hidratado = hidratarRascunhoConfiguracaoPagina(
      {
        ...base,
        identidade: { ...base.identidade, tamanhoCabecalho: "grande" },
      },
      { organizacaoId: "org-1", nomeOrganizacao: "Clínica Exemplo" },
    );

    expect(hidratado.identidade.tamanhoCabecalho).toBe("grande");
    expect(esquemaRascunhoConfiguracaoPagina.safeParse(hidratado).success).toBe(true);

    const publicada = converterRascunhoParaConteudoPublicado(hidratado, {
      identificadorPublico: "clinica-exemplo",
      versaoPublicada: 1,
    });

    expect(publicada.identidade.tamanhoCabecalho).toBe("grande");
    expect(esquemaConteudoPaginaPublicada.safeParse(publicada).success).toBe(true);
  });

  it("ignora valor inválido de tamanhoCabecalho durante a hidratação", () => {
    const base = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-1",
      nomeOrganizacao: "Clínica Exemplo",
    });

    const hidratado = hidratarRascunhoConfiguracaoPagina(
      {
        ...base,
        identidade: {
          ...base.identidade,
          tamanhoCabecalho: "invalido" as never,
        },
      },
      { organizacaoId: "org-1", nomeOrganizacao: "Clínica Exemplo" },
    );

    expect(hidratado.identidade.tamanhoCabecalho).toBeUndefined();
    expect(resolverTamanhoCabecalhoMarca(hidratado.identidade.tamanhoCabecalho)).toBe("pequeno");
  });
});

