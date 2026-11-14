import { describe, expect, it } from "vitest";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import type { DefinicaoMicrofluxo, EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  aplicarPoliticaPublicidadeAMicrofluxos,
  aplicarPoliticaPublicidadeAPagina,
  aplicarPoliticaPublicidadeAoAcervo,
} from "@/dominio/publicidade/aplicadorPoliticaPublicidade";
import {
  POLITICAS_PUBLICIDADE_DISPONIVEIS,
  obterPoliticaPublicidade,
} from "@/dominio/publicidade/registroPoliticasPublicidade";
import { CODIGOS_PERFIL_PUBLICIDADE } from "@/dominio/publicidade/tiposPerfilPublicidade";
import {
  exigirMicrofluxosConformesPublicidade,
  listarViolacoesPublicidadeMicrofluxo,
} from "@/dominio/publicidade/validadorPublicacaoPublicidade";
import { CATALOGO_DEMONSTRACOES_EDITORIAIS } from "../../fixtures/dadosExemploVitrine";

const servico: ServicoOrganizacao = {
  id: "s1",
  organizacaoId: "org",
  nome: "Consulta",
  resumo: "Atendimento inicial",
  categoria: "Geral",
  precoBaseCentavos: 15000,
  rotuloPrecoOpcional: "A partir de",
  ordemExibicao: 1,
  ativo: true,
  atualizadoEmIso: "2026-11-12T00:00:00.000Z",
};

const produto: ProdutoCatalogo = {
  id: "p1",
  organizacaoId: "org",
  nome: "Produto",
  resumo: "Resumo",
  categoria: "Geral",
  precoCentavos: 9900,
  disponibilidade: "disponivel",
  especificacoesCurtas: [],
  ordemExibicao: 1,
  ativo: true,
  atualizadoEmIso: "2026-11-12T00:00:00.000Z",
};

function criarFluxo(etapas: readonly EtapaMicrofluxo[], comCalculo = false): DefinicaoMicrofluxo {
  return {
    id: "f1",
    organizacaoId: "org",
    titulo: "Fluxo de teste",
    descricaoCurta: "Descrição",
    textoBotaoConclusao: "Enviar",
    mensagemConfirmacaoTitulo: "Recebido",
    mensagemConfirmacaoCorpo: "Obrigado",
    etapaInicialId: "e1",
    etapas,
    ...(comCalculo
      ? { regraCalculoComercial: { modalidade: "valor_fixo", valorBaseCentavos: 1000 } }
      : {}),
    ativo: true,
    atualizadoEmIso: "2026-11-12T00:00:00.000Z",
  } as DefinicaoMicrofluxo;
}

const etapaPix = {
  id: "e1",
  tipoEtapa: "instrucao_pix_manual",
  titulo: "Pix",
  obrigatoria: false,
} as EtapaMicrofluxo;

const etapaProduto = {
  id: "e1",
  tipoEtapa: "selecao_produto",
  titulo: "Produto",
  obrigatoria: false,
} as EtapaMicrofluxo;

const etapaRecomendacaoProdutos = {
  id: "e1",
  tipoEtapa: "recomendacao_catalogo",
  titulo: "Recomendação",
  obrigatoria: false,
  fonteCatalogo: "produtos",
} as EtapaMicrofluxo;

const etapaRecomendacaoServicos = {
  ...etapaRecomendacaoProdutos,
  fonteCatalogo: "servicos",
} as EtapaMicrofluxo;

describe("Políticas de publicidade profissional", () => {
  it("resolve perfil ausente ou desconhecido como padrão", () => {
    expect(obterPoliticaPublicidade(undefined).codigo).toBe("padrao");
    expect(obterPoliticaPublicidade("inexistente").codigo).toBe("padrao");
  });

  it("registra uma política independente para cada código de perfil", () => {
    const codigos = POLITICAS_PUBLICIDADE_DISPONIVEIS.map((politica) => politica.codigo);
    expect(codigos).toEqual([...CODIGOS_PERFIL_PUBLICIDADE]);
    expect(new Set(POLITICAS_PUBLICIDADE_DISPONIVEIS).size).toBe(codigos.length);
  });

  it("não impõe restrições no perfil padrão", () => {
    const politica = obterPoliticaPublicidade("padrao");
    const acervo = aplicarPoliticaPublicidadeAoAcervo(politica, [servico], [produto]);

    expect(acervo.servicos[0]?.precoBaseCentavos).toBe(15000);
    expect(acervo.produtos[0]?.precoCentavos).toBe(9900);
    expect(politica.avisos()).toEqual([]);
    expect(
      listarViolacoesPublicidadeMicrofluxo(politica, criarFluxo([etapaPix, etapaProduto])),
    ).toEqual([]);
  });

  describe.each(["advocacia_oab", "medicina_cfm", "odontologia_cfo"] as const)(
    "perfil %s",
    (codigo) => {
      const politica = obterPoliticaPublicidade(codigo);

      it("oculta preços de serviços e produtos sem alterar o restante", () => {
        const acervo = aplicarPoliticaPublicidadeAoAcervo(politica, [servico], [produto]);

        expect(acervo.servicos[0]).not.toHaveProperty("precoBaseCentavos");
        expect(acervo.servicos[0]).not.toHaveProperty("rotuloPrecoOpcional");
        expect(acervo.servicos[0]?.nome).toBe("Consulta");
        expect(acervo.produtos[0]).not.toHaveProperty("precoCentavos");
        expect(acervo.produtos[0]?.nome).toBe("Produto");
      });

      it("oculta as avaliações do Google na página publicada", () => {
        const base = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
        const pagina = {
          ...base,
          avaliacoesGoogle: {
            habilitado: true,
            identificadorLocal: "local",
            modoExibicao: "resumo",
          },
        } as typeof base;

        expect(aplicarPoliticaPublicidadeAPagina(politica, pagina)).not.toHaveProperty(
          "avaliacoesGoogle",
        );
      });

      it("neutraliza o cálculo comercial dos microfluxos", () => {
        const [fluxo] = aplicarPoliticaPublicidadeAMicrofluxos(politica, [
          criarFluxo([etapaRecomendacaoServicos], true),
        ]);

        expect(fluxo?.regraCalculoComercial).toEqual({ modalidade: "sem_calculo" });
      });

      it("bloqueia Pix e etapas com produtos na publicação", () => {
        expect(listarViolacoesPublicidadeMicrofluxo(politica, criarFluxo([etapaPix]))).toHaveLength(
          1,
        );
        expect(
          listarViolacoesPublicidadeMicrofluxo(politica, criarFluxo([etapaProduto])),
        ).toHaveLength(1);
        expect(
          listarViolacoesPublicidadeMicrofluxo(politica, criarFluxo([etapaRecomendacaoProdutos])),
        ).toHaveLength(1);
        expect(() =>
          exigirMicrofluxosConformesPublicidade(politica, [criarFluxo([etapaPix])]),
        ).toThrow(politica.rotulo);
      });

      it("aceita recomendação baseada apenas em serviços", () => {
        expect(
          listarViolacoesPublicidadeMicrofluxo(politica, criarFluxo([etapaRecomendacaoServicos])),
        ).toEqual([]);
      });

      it("avisa sobre texto livre", () => {
        expect(politica.avisos().some((aviso) => aviso.area === "texto_livre")).toBe(true);
      });
    },
  );

  it("avisa sobre o portfólio na saúde, sem avisar na advocacia", () => {
    const area = (codigo: string) =>
      obterPoliticaPublicidade(codigo)
        .avisos()
        .map((aviso) => aviso.area);

    expect(area("medicina_cfm")).toContain("portfolio");
    expect(area("odontologia_cfo")).toContain("portfolio");
    expect(area("advocacia_oab")).not.toContain("portfolio");
  });

  it("mantém cada profissão com seu próprio texto de aviso", () => {
    const mensagens = ["advocacia_oab", "medicina_cfm", "odontologia_cfo"].map(
      (codigo) => obterPoliticaPublicidade(codigo).avisos()[0]?.mensagem,
    );
    expect(new Set(mensagens).size).toBe(3);
  });
});
