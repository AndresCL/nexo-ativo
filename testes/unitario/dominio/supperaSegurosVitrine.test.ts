import { describe, expect, it } from "vitest";
import {
  hidratarRascunhoConfiguracaoPagina,
  exigirProntidaoConteudoParaPublicacao,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { resolverAcoesVitrineComMicrofluxos } from "@/dominio/entidades/paginaPublicada";
import { exigirDestinosConclusaoValidos } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { exigirGrafoMicrofluxoValidoParaPublicacao } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import {
  esquemaProfissionalEquipe,
  esquemaServicoOrganizacao,
} from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import {
  buscarAcervoDemonstracaoPorSlug,
  buscarDemonstracaoEditorialPorSlug,
} from "../../fixtures/dadosExemploVitrine";
import {
  IDENTIFICADOR_PUBLICO_SUPPERA,
  ORGANIZACAO_SUPPERA_ID,
} from "../../fixtures/dadosSupperaSeguros";

describe("Vitrine e Acervo — Suppera Seguros", () => {
  it("deve validar a vitrine publicada, o rascunho hidratado e todos os esquemas Zod do acervo", () => {
    const vitrine = buscarDemonstracaoEditorialPorSlug(IDENTIFICADOR_PUBLICO_SUPPERA);
    expect(vitrine).not.toBeNull();

    const paginaValidada = esquemaConteudoPaginaPublicada.parse(vitrine);
    expect(paginaValidada.organizacaoId).toBe(ORGANIZACAO_SUPPERA_ID);
    expect(paginaValidada.identidade.nomeExibicao).toBe("Suppera Seguros");
    expect(paginaValidada.paletaId).toBe("safira_corporativo");
    expect(paginaValidada.chamadasEditoriaisAdicionais).toHaveLength(2);

    const rascunho = hidratarRascunhoConfiguracaoPagina(
      paginaValidada as unknown as Record<string, unknown>,
      {
        organizacaoId: ORGANIZACAO_SUPPERA_ID,
        nomeOrganizacao: "Suppera Seguros",
      },
    );
    expect(() => exigirProntidaoConteudoParaPublicacao(rascunho)).not.toThrow();
  });

  it("deve validar todos os microfluxos (DAG sem ciclos), conclusões e serviços da Suppera Seguros", () => {
    const vitrine = buscarDemonstracaoEditorialPorSlug(IDENTIFICADOR_PUBLICO_SUPPERA)!;
    const acervo = buscarAcervoDemonstracaoPorSlug(IDENTIFICADOR_PUBLICO_SUPPERA);

    expect(acervo.servicos.length).toBeGreaterThanOrEqual(4);
    for (const servico of acervo.servicos) {
      expect(() => esquemaServicoOrganizacao.parse(servico)).not.toThrow();
    }

    expect(acervo.profissionais).toHaveLength(1);
    for (const profissional of acervo.profissionais) {
      expect(() => esquemaProfissionalEquipe.parse(profissional)).not.toThrow();
    }

    const microfluxos = acervo.microfluxos ?? [];
    expect(microfluxos).toHaveLength(5);

    for (const fluxo of microfluxos) {
      const validado = esquemaDefinicaoMicrofluxo.parse(fluxo);
      expect(() => exigirGrafoMicrofluxoValidoParaPublicacao(validado)).not.toThrow();
    }

    expect(() =>
      exigirDestinosConclusaoValidos(
        ORGANIZACAO_SUPPERA_ID,
        acervo,
        "https://nexoativo.com.br",
      ),
    ).not.toThrow();

    const acoesResolvidas = resolverAcoesVitrineComMicrofluxos(
      vitrine.acoesPrincipais,
      microfluxos,
    );
    expect(acoesResolvidas).toHaveLength(5);
    expect(acoesResolvidas[0]?.destaquePrincipal).toBe(true);
    expect(acoesResolvidas[0]?.rotulo).toBe("Fazer cotação de Seguro Auto");
  });
});

