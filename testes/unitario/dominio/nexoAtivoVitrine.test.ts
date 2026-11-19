import { describe, expect, it } from "vitest";
import {
  exigirProntidaoConteudoParaPublicacao,
  hidratarRascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { resolverAcoesVitrineComMicrofluxos } from "@/dominio/entidades/paginaPublicada";
import { exigirDestinosConclusaoValidos } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { exigirGrafoMicrofluxoValidoParaPublicacao } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
  esquemaServicoOrganizacao,
} from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import {
  buscarAcervoDemonstracaoPorSlug,
  buscarDemonstracaoEditorialPorSlug,
} from "../../fixtures/dadosExemploVitrine";
import {
  IDENTIFICADOR_PUBLICO_NEXOATIVO,
  ORGANIZACAO_NEXOATIVO_ID,
} from "../../fixtures/dadosNexoAtivo";

describe("Vitrine e Acervo — Nexo Ativo (/nexoativo)", () => {
  it("deve validar a vitrine publicada, o rascunho hidratado e todos os esquemas Zod do acervo", () => {
    const vitrine = buscarDemonstracaoEditorialPorSlug(IDENTIFICADOR_PUBLICO_NEXOATIVO);
    expect(vitrine).not.toBeNull();

    const paginaValidada = esquemaConteudoPaginaPublicada.parse(vitrine);
    expect(paginaValidada.organizacaoId).toBe(ORGANIZACAO_NEXOATIVO_ID);
    expect(paginaValidada.identidade.nomeExibicao).toBe("Nexo Ativo");
    expect(paginaValidada.paletaId).toBe("noite_mineral");

    const rascunho = hidratarRascunhoConfiguracaoPagina(
      paginaValidada as unknown as Record<string, unknown>,
      {
        organizacaoId: ORGANIZACAO_NEXOATIVO_ID,
        nomeOrganizacao: "Nexo Ativo",
      },
    );
    expect(() => exigirProntidaoConteudoParaPublicacao(rascunho)).not.toThrow();
  });

  it("deve validar todos os microfluxos (DAG sem ciclos), conclusões, equipe (Andrés Contreras) e acervo do Nexo Ativo", () => {
    const vitrine = buscarDemonstracaoEditorialPorSlug(IDENTIFICADOR_PUBLICO_NEXOATIVO)!;
    const acervo = buscarAcervoDemonstracaoPorSlug(IDENTIFICADOR_PUBLICO_NEXOATIVO);

    expect(acervo.servicos).toHaveLength(4);
    for (const servico of acervo.servicos) {
      expect(() => esquemaServicoOrganizacao.parse(servico)).not.toThrow();
    }

    expect(acervo.produtos).toHaveLength(2);
    for (const produto of acervo.produtos) {
      expect(() => esquemaProdutoCatalogo.parse(produto)).not.toThrow();
    }

    expect(acervo.profissionais).toHaveLength(1);
    expect(acervo.profissionais[0]?.nomeCompleto).toBe("Andrés Contreras");
    expect(acervo.profissionais[0]?.identificadorCartao).toBe("andres-contreras");
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
        ORGANIZACAO_NEXOATIVO_ID,
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
    expect(acoesResolvidas[0]?.rotulo).toBe("Simular projeto para o meu negócio");
  });
});

