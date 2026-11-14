import { describe, expect, it } from "vitest";
import {
  criarRascunhoConfiguracaoPaginaPadrao,
  hidratarRascunhoConfiguracaoPagina,
  converterRascunhoParaConteudoPublicado,
  avaliarProntidaoPublicacaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { esquemaRascunhoConfiguracaoPagina } from "@/validacoes/esquemaRascunhoPagina";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import {
  esquemaConsultaAvaliacoesGoogleVitrine,
  esquemaConfiguracaoAvaliacoesGoogle,
} from "@/validacoes/esquemasAvaliacoesGoogle";

describe("Configuração e publicação das avaliações do Google", () => {
  const padrao = criarRascunhoConfiguracaoPaginaPadrao({
    organizacaoId: "org-serena",
    nomeOrganizacao: "Clínica Serena",
  });

  it("mantém documentos antigos válidos e sem avaliações habilitadas", () => {
    const hidratado = hidratarRascunhoConfiguracaoPagina(
      { ...padrao },
      { organizacaoId: "org-serena", nomeOrganizacao: "Clínica Serena" },
    );
    expect(hidratado.avaliacoesGoogle).toBeUndefined();
    expect(esquemaRascunhoConfiguracaoPagina.safeParse(hidratado).success).toBe(true);
  });

  it("preserva a configuração no salvamento, hidratação, prévia e publicação", () => {
    const configuracao = {
      habilitado: true,
      identificadorLocal: "ChIJ_serena",
      modoExibicao: "carrossel" as const,
    };
    const salvo = esquemaRascunhoConfiguracaoPagina.parse({
      ...padrao,
      avaliacoesGoogle: configuracao,
    });
    const hidratado = hidratarRascunhoConfiguracaoPagina(
      { ...salvo },
      { organizacaoId: "org-serena", nomeOrganizacao: "Clínica Serena" },
    );
    const publicada = esquemaConteudoPaginaPublicada.parse(
      converterRascunhoParaConteudoPublicado(hidratado, {
        identificadorPublico: "clinica-serena",
        versaoPublicada: 2,
      }),
    );
    expect(publicada.avaliacoesGoogle).toEqual(configuracao);
    expect(publicada).not.toHaveProperty("avaliacoes");
  });

  it("exige um estabelecimento ao habilitar, inclusive na prontidão de publicação", () => {
    const rascunho = {
      ...padrao,
      avaliacoesGoogle: { habilitado: true, modoExibicao: "resumo" as const },
    };
    expect(esquemaRascunhoConfiguracaoPagina.safeParse(rascunho).success).toBe(false);
    expect(avaliarProntidaoPublicacaoPagina(rascunho, { emailVerificado: true })).toContainEqual(
      expect.objectContaining({ codigo: "ESTABELECIMENTO_GOOGLE_AUSENTE" }),
    );
    expect(
      esquemaConfiguracaoAvaliacoesGoogle.safeParse({ habilitado: false, modoExibicao: "resumo" })
        .success,
    ).toBe(true);
  });

  it("rejeita caminhos externos e consultas públicas com um estabelecimento arbitrário", () => {
    expect(
      esquemaConfiguracaoAvaliacoesGoogle.safeParse({
        habilitado: true,
        modoExibicao: "resumo",
        identificadorLocal: "../outro-local",
      }).success,
    ).toBe(false);
    expect(
      esquemaConsultaAvaliacoesGoogleVitrine.safeParse({
        identificadorPublico: "clinica-serena",
        identificadorLocal: "ChIJ_outro",
      }).success,
    ).toBe(false);
  });
});
