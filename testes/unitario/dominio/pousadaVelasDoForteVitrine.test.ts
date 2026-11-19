import { describe, expect, it } from "vitest";
import { exigirDestinosConclusaoValidos } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { exigirGrafoMicrofluxoValidoParaPublicacao } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import { esquemaServicoOrganizacao } from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import {
  buscarAcervoDemonstracaoPorSlug,
  buscarDemonstracaoEditorialPorSlug,
} from "../../fixtures/dadosExemploVitrine";
import {
  ACERVO_POUSADA_VELAS_DO_FORTE,
  IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
  ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
  VITRINE_POUSADA_VELAS_DO_FORTE,
} from "../../fixtures/dadosPousadaVelasDoForte";

describe("Vitrine e Acervo — Pousada Velas do Forte (/pousada-velas-do-forte)", () => {
  it("deve validar a vitrine publicada e esquemas do acervo", () => {
    const vitrineValida = esquemaConteudoPaginaPublicada.parse(
      VITRINE_POUSADA_VELAS_DO_FORTE,
    );
    expect(vitrineValida.identificadorPublico).toBe("pousada-velas-do-forte");
    expect(vitrineValida.organizacaoId).toBe(ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID);
    expect(vitrineValida.identidade.cidadeEstado).toContain("Cabo Frio");

    for (const servico of ACERVO_POUSADA_VELAS_DO_FORTE.servicos) {
      expect(() => esquemaServicoOrganizacao.parse(servico)).not.toThrow();
    }
  });

  it("deve validar o microfluxo interativo e desfecho WhatsApp sem ciclos", () => {
    const fluxos = ACERVO_POUSADA_VELAS_DO_FORTE.microfluxos ?? [];
    expect(fluxos.length).toBeGreaterThan(0);

    for (const fluxo of fluxos) {
      expect(() => esquemaDefinicaoMicrofluxo.parse(fluxo)).not.toThrow();
      expect(() => exigirGrafoMicrofluxoValidoParaPublicacao(fluxo)).not.toThrow();
    }

    expect(() =>
      exigirDestinosConclusaoValidos(
        ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
        ACERVO_POUSADA_VELAS_DO_FORTE,
      ),
    ).not.toThrow();
  });

  it("deve resolver corretamente pelo catálogo de demonstração", () => {
    const vitrine = buscarDemonstracaoEditorialPorSlug(
      IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
    );
    expect(vitrine).toBeDefined();
    expect(vitrine?.identidade.nomeExibicao).toBe("Pousada Velas do Forte");

    const acervo = buscarAcervoDemonstracaoPorSlug(
      IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
    );
    expect(acervo.servicos.length).toBe(4);
    expect(acervo.microfluxos?.length).toBe(1);
  });
});
