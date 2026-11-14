import { describe, expect, it } from "vitest";
import { obterChamadasEditoriais } from "@/dominio/entidades/chamadasEditoriais";
import {
  avaliarProntidaoPublicacaoPagina,
  converterRascunhoParaConteudoPublicado,
  criarRascunhoConfiguracaoPaginaPadrao,
  hidratarRascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { esquemaRascunhoConfiguracaoPagina } from "@/validacoes/esquemaRascunhoPagina";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import { CHAMADAS_EDITORIAIS_GARAGE88 } from "../../fixtures/chamadasEditoriaisGarage88";

const contexto = { organizacaoId: "org-garage88", nomeOrganizacao: "Garage 88" };
const base = criarRascunhoConfiguracaoPaginaPadrao(contexto);
const opcoesPublicacao = { identificadorPublico: "garage-88", versaoPublicada: 2 };

describe("Chamadas editoriais: compatibilidade, persistência e limites", () => {
  it("mantém uma única chamada nos documentos antigos", () => {
    const hidratado = hidratarRascunhoConfiguracaoPagina({ ...base }, contexto);
    expect(obterChamadasEditoriais(hidratado)).toEqual([base.chamadaEditorial]);
    expect(esquemaRascunhoConfiguracaoPagina.safeParse(base).success).toBe(true);
    expect(
      esquemaConteudoPaginaPublicada.safeParse(
        converterRascunhoParaConteudoPublicado(base, opcoesPublicacao),
      ).success,
    ).toBe(true);
  });

  it("preserva os três textos ao salvar, reabrir e publicar", () => {
    const salvo = esquemaRascunhoConfiguracaoPagina.parse({
      ...base,
      ...CHAMADAS_EDITORIAIS_GARAGE88,
    });
    const reaberto = hidratarRascunhoConfiguracaoPagina({ ...salvo }, contexto);
    const publicado = esquemaConteudoPaginaPublicada.parse(
      converterRascunhoParaConteudoPublicado(reaberto, opcoesPublicacao),
    );
    expect(obterChamadasEditoriais(publicado)).toEqual(
      obterChamadasEditoriais(CHAMADAS_EDITORIAIS_GARAGE88),
    );
    expect(avaliarProntidaoPublicacaoPagina(reaberto, { emailVerificado: true })).toEqual([]);
  });

  it("rejeita uma quarta chamada antes de salvar ou publicar, inclusive após hidratação", () => {
    const rascunho = {
      ...base,
      chamadasEditoriaisAdicionais: Array.from({ length: 3 }, () => ({
        tituloPrincipal: "Mensagem adicional",
      })),
    };
    const hidratado = hidratarRascunhoConfiguracaoPagina(rascunho, contexto);
    expect(esquemaRascunhoConfiguracaoPagina.safeParse(hidratado).success).toBe(false);
    expect(
      esquemaConteudoPaginaPublicada.safeParse(
        converterRascunhoParaConteudoPublicado(hidratado, opcoesPublicacao),
      ).success,
    ).toBe(false);
    expect(avaliarProntidaoPublicacaoPagina(hidratado, { emailVerificado: true })).toContainEqual(
      expect.objectContaining({ codigo: "LIMITE_CHAMADAS_EDITORIAIS_EXCEDIDO" }),
    );
  });

  it.each(["", "   ", "abc"])(
    "impede publicar chamada adicional com título inválido %j",
    (tituloPrincipal) => {
      const rascunho = { ...base, chamadasEditoriaisAdicionais: [{ tituloPrincipal }] };
      expect(esquemaRascunhoConfiguracaoPagina.safeParse(rascunho).success).toBe(false);
      expect(avaliarProntidaoPublicacaoPagina(rascunho, { emailVerificado: true })).toContainEqual(
        expect.objectContaining({ mensagem: expect.stringContaining("chamada 2") }),
      );
    },
  );

  it("mantém itens malformados como pendências, sem descartá-los na publicação", () => {
    const hidratado = hidratarRascunhoConfiguracaoPagina(
      { ...base, chamadasEditoriaisAdicionais: [null, { tituloPrincipal: 42 }] },
      contexto,
    );
    expect(esquemaRascunhoConfiguracaoPagina.safeParse(hidratado).success).toBe(false);
    expect(avaliarProntidaoPublicacaoPagina(hidratado, { emailVerificado: true })).toHaveLength(2);
  });

  it("preserva e valida rotuloCta e fluxoId opcionais na chamada", () => {
    const comCta = {
      ...base,
      chamadaEditorial: {
        ...base.chamadaEditorial,
        rotuloCta: "Agendar Test Drive",
        fluxoId: "fluxo-test-drive",
      },
    };
    const hidratado = hidratarRascunhoConfiguracaoPagina(comCta, contexto);
    expect(hidratado.chamadaEditorial.rotuloCta).toBe("Agendar Test Drive");
    expect(hidratado.chamadaEditorial.fluxoId).toBe("fluxo-test-drive");

    const publicado = converterRascunhoParaConteudoPublicado(hidratado, opcoesPublicacao);
    expect(publicado.chamadaEditorial.rotuloCta).toBe("Agendar Test Drive");
    expect(publicado.chamadaEditorial.fluxoId).toBe("fluxo-test-drive");
  });
});
