import { describe, expect, it } from "vitest";
import {
  converterEtapaParaLivre,
  atualizarRespostaBloco,
  alterarDestinoOpcaoEtapa,
} from "@/dominio/microfluxos/composicaoEtapaLivre";
import {
  avancarEtapaExecucaoMicrofluxo,
  atualizarRespostasExecucaoMicrofluxo,
  criarEstadoExecucaoMicrofluxo,
  resolverProximaEtapaId,
} from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import { avaliarIntegridadeGrafoMicrofluxo } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import {
  listarCamposResumoConclusao,
  projetarRespostasConclusao,
} from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { extrairRespostasLegiveisMicrofluxo } from "@/dominio/entidades/solicitacaoComercial";
import { calcularDemonstrativoComercialMicrofluxo } from "@/dominio/comercial/calculadoraComercialCentavos";
import { aplicarPoliticaPublicidadeAMicrofluxos } from "@/dominio/publicidade/aplicadorPoliticaPublicidade";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import type { BlocoEtapaLivre, EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import { CATALOGO_ACERVOS_DEMONSTRACAO } from "../../fixtures/dadosExemploVitrine";
const base = criarMicrofluxoPadraoParaTestes({
  organizacaoId: "org-teste",
  nomeOrganizacao: "Teste",
  modelo: "catalogo",
});
const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!;
const blocos: readonly BlocoEtapaLivre[] = [
  { id: "texto", tipo: "texto", texto: "Escolha seu veículo e informe como podemos retornar." },
  {
    id: "imagem",
    tipo: "imagem",
    url: "https://example.com/foto.jpg",
    textoAlternativo: "Showroom",
  },
  { id: "catalogo", tipo: "catalogo", fonte: "produtos", rotulo: "Veículo", obrigatorio: true },
  {
    id: "nome",
    tipo: "campo",
    finalidade: "nomeCompleto",
    campo: {
      id: "nome",
      tipo: "texto_curto",
      rotulo: "Como podemos chamar você?",
      obrigatorio: true,
    },
  },
  {
    id: "telefone",
    tipo: "campo",
    finalidade: "telefoneOuWhatsapp",
    campo: { id: "telefone", tipo: "telefone", rotulo: "Seu telefone", obrigatorio: true },
  },
  { id: "equipe", tipo: "equipe", rotulo: "Consultor", obrigatorio: false },
];
const etapa: EtapaMicrofluxo = {
  id: "livre",
  tipoEtapa: "etapa_livre",
  titulo: "Sua proposta",
  obrigatoria: true,
  blocos,
};
const fluxo = {
  ...base,
  etapas: [etapa],
  etapaInicialId: etapa.id,
  regraCalculoComercial: { modalidade: "sem_calculo" as const },
};
function responder(estado = criarEstadoExecucaoMicrofluxo(fluxo)) {
  for (const [bloco, valor] of [
    [blocos[3]!, "Ana Souza"],
    [blocos[4]!, "11999999999"],
  ] as const)
    estado = atualizarRespostasExecucaoMicrofluxo(
      estado,
      atualizarRespostaBloco(etapa, bloco, estado.respostas, valor),
    );
  return atualizarRespostasExecucaoMicrofluxo(estado, {
    produtoSelecionadoId: acervo.produtos[0]!.id,
  });
}
describe("Composição livre sobre o DAG existente", () => {
  it("valida composição mista e registra contato somente após terminar a etapa", () => {
    expect(esquemaDefinicaoMicrofluxo.safeParse(fluxo).success).toBe(true);
    expect(avaliarIntegridadeGrafoMicrofluxo(fluxo)).toEqual([]);
    const preenchido = responder();
    expect(preenchido.respostas.contatoVisitante).toBeUndefined();
    const final = avancarEtapaExecucaoMicrofluxo(preenchido, acervo);
    expect(final.respostas.contatoVisitante).toEqual({
      nomeCompleto: "Ana Souza",
      telefoneOuWhatsapp: "11999999999",
    });
    expect(extrairRespostasLegiveisMicrofluxo(fluxo, final.respostas)).not.toContainEqual(
      expect.objectContaining({ pergunta: "Seu telefone", respostaTexto: "11999999999" }),
    );
    expect(
      projetarRespostasConclusao(
        final,
        listarCamposResumoConclusao(fluxo),
        acervo,
        obterPoliticaPublicidade("padrao"),
      ),
    ).toContainEqual({ rotulo: "Veículo", valor: acervo.produtos[0]!.nome });
  });
  it("valida os campos mesmo com catálogo e equipe na mesma tela", () => {
    expect(() =>
      avancarEtapaExecucaoMicrofluxo(criarEstadoExecucaoMicrofluxo(fluxo), acervo),
    ).toThrow(/Escolha um item/);
    const incompleto = atualizarRespostasExecucaoMicrofluxo(criarEstadoExecucaoMicrofluxo(fluxo), {
      produtoSelecionadoId: acervo.produtos[0]!.id,
    });
    expect(() => avancarEtapaExecucaoMicrofluxo(incompleto, acervo)).toThrow(/Como podemos/);
    const errado = atualizarRespostasExecucaoMicrofluxo(
      responder(),
      atualizarRespostaBloco(etapa, blocos[4]!, responder().respostas, "12"),
    );
    expect(() => avancarEtapaExecucaoMicrofluxo(errado, acervo)).toThrow(/telefone válido/);
  });
  it("campos sem finalidade não geram uma solicitação, mesmo contendo um telefone", () => {
    const informativo = {
      ...fluxo,
      etapas: [
        {
          ...etapa,
          blocos: [
            {
              id: "telefone",
              tipo: "campo" as const,
              campo: {
                id: "telefone",
                tipo: "telefone" as const,
                rotulo: "Telefone de referência",
                obrigatorio: false,
              },
            },
          ],
        },
      ],
    };
    expect(
      avancarEtapaExecucaoMicrofluxo(criarEstadoExecucaoMicrofluxo(informativo)).respostas
        .contatoVisitante,
    ).toBeUndefined();
  });
  it("campos de contato em ramo abandonado não são utilizados para registrar solicitação", () => {
    const semContato = { ...fluxo, etapas: [{ ...etapa, blocos: [] }] };
    const estado = atualizarRespostasExecucaoMicrofluxo(criarEstadoExecucaoMicrofluxo(semContato), {
      contatoVisitante: { nomeCompleto: "Nome antigo", telefoneOuWhatsapp: "11999999999" },
      camposDinamicosPorEtapa: { abandonada: { nome: "Nome antigo", telefone: "11999999999" } },
    });
    expect(avancarEtapaExecucaoMicrofluxo(estado).respostas.contatoVisitante).toBeUndefined();
  });
  it("escolhas definem bifurcação ou finalização sem limitar os outros elementos", () => {
    const escolha: BlocoEtapaLivre = {
      id: "decisao",
      tipo: "escolha",
      rotulo: "Continuar?",
      obrigatorio: true,
      multipla: false,
      opcoes: [
        { id: "sim", rotulo: "Sim", proximaEtapaIdOpcional: "outro" },
        { id: "nao", rotulo: "Encerrar", encerrarPercurso: true },
      ],
    };
    const atual = { ...etapa, blocos: [blocos[0]!, escolha], proximaEtapaPadraoId: "outro" };
    const modelo = { ...fluxo, etapas: [atual, { ...etapa, id: "outro", blocos: [] }] };
    const inicio = criarEstadoExecucaoMicrofluxo(modelo);
    expect(
      resolverProximaEtapaId(
        modelo,
        atual,
        atualizarRespostaBloco(atual, escolha, inicio.respostas, "sim"),
      ),
    ).toBe("outro");
    expect(
      resolverProximaEtapaId(
        modelo,
        atual,
        atualizarRespostaBloco(atual, escolha, inicio.respostas, "nao"),
      ),
    ).toBeNull();
    expect(alterarDestinoOpcaoEtapa(atual, "sim", "novo", "decisao").blocos).toContainEqual(
      expect.objectContaining({
        tipo: "escolha",
        opcoes: expect.arrayContaining([
          expect.objectContaining({ id: "sim", proximaEtapaIdOpcional: "novo" }),
        ]),
      }),
    );
  });
  it("mantém campos, destinos, resumo e cálculo de opções ao abrir passos antigos", () => {
    const antiga: EtapaMicrofluxo = {
      id: "adicionais",
      tipoEtapa: "selecao_multipla",
      titulo: "Adicionais",
      obrigatoria: true,
      opcoes: [{ id: "a", rotulo: "Adicional", valorAdicionalCentavos: 1234 }],
      proximaEtapaPadraoId: "fim",
    };
    const livre = converterEtapaParaLivre(antiga);
    expect(livre.proximaEtapaPadraoId).toBe("fim");
    const modelo = {
      ...base,
      etapaInicialId: antiga.id,
      etapas: [livre],
      regraCalculoComercial: {
        modalidade: "base_mais_adicionais" as const,
        valorBaseCentavos: 1000,
      },
    };
    const respostas = atualizarRespostaBloco(
      livre,
      livre.blocos![0]!,
      criarEstadoExecucaoMicrofluxo(modelo).respostas,
      ["a"],
    );
    expect(respostas.opcoesMultiplasPorEtapa.adicionais).toEqual(["a"]);
    expect(
      calcularDemonstrativoComercialMicrofluxo({ microfluxo: modelo, respostas, acervo })
        ?.totalCentavos,
    ).toBe(2234);
    expect(listarCamposResumoConclusao(modelo)).toEqual([
      { etapaId: "adicionais", campoId: undefined, rotulo: "Adicionais" },
    ]);
  });
  it("bloqueia ciclos e mantém a política financeira nos elementos compostos", () => {
    const escolha: BlocoEtapaLivre = {
      id: "c",
      tipo: "escolha",
      rotulo: "Circular",
      multipla: false,
      obrigatorio: true,
      opcoes: [{ id: "a", rotulo: "Voltar", proximaEtapaIdOpcional: "livre" }],
    };
    expect(
      avaliarIntegridadeGrafoMicrofluxo({
        ...fluxo,
        etapas: [{ ...etapa, blocos: [escolha] }],
      }).some((p) => p.codigo === "CICLO_DETECTADO_NO_GRAFO"),
    ).toBe(true);
    const financeiro = {
      ...fluxo,
      etapas: [
        {
          ...etapa,
          blocos: [
            {
              id: "valor",
              tipo: "campo" as const,
              campo: { id: "valor", tipo: "moeda" as const, rotulo: "Valor", obrigatorio: true },
            },
          ],
        },
      ],
    };
    expect(
      aplicarPoliticaPublicidadeAMicrofluxos(obterPoliticaPublicidade("advocacia_oab"), [
        financeiro,
      ])[0]!.etapas[0]!.blocos,
    ).toEqual([]);
    expect(
      esquemaDefinicaoMicrofluxo.safeParse({
        ...fluxo,
        etapas: [
          {
            ...etapa,
            blocos: [
              {
                id: "imagem",
                tipo: "imagem",
                url: "javascript:alert(1)",
                textoAlternativo: "Imagem",
              },
            ],
          },
        ],
      }).success,
    ).toBe(false);
  });
  it("preserva a seleção de cada catálogo mesmo ao avançar por contexto e escolher outro item depois", () => {
    const primeiro: EtapaMicrofluxo = {
      ...etapa,
      id: "primeiro",
      proximaEtapaPadraoId: "segundo",
      blocos: [
        {
          id: "catalogo-a",
          tipo: "catalogo",
          fonte: "produtos",
          rotulo: "Primeira escolha",
          obrigatorio: true,
        },
      ],
    };
    const segundo: EtapaMicrofluxo = {
      ...etapa,
      id: "segundo",
      blocos: [
        {
          id: "catalogo-b",
          tipo: "catalogo",
          fonte: "produtos",
          rotulo: "Segunda escolha",
          obrigatorio: true,
        },
        { id: "texto", tipo: "texto", texto: "Confira sua segunda escolha" },
      ],
    };
    const modelo = { ...fluxo, etapaInicialId: primeiro.id, etapas: [primeiro, segundo] };
    let estado = criarEstadoExecucaoMicrofluxo(modelo, {
      produtoPreSelecionadoId: acervo.produtos[0]!.id,
    });
    expect(estado.etapaAtualId).toBe(segundo.id);
    estado = atualizarRespostasExecucaoMicrofluxo(
      estado,
      atualizarRespostaBloco(
        segundo,
        segundo.blocos![0]!,
        estado.respostas,
        `produto:${acervo.produtos[1]!.id}`,
      ),
    );
    const final = avancarEtapaExecucaoMicrofluxo(estado, acervo);
    const resumo = projetarRespostasConclusao(
      final,
      listarCamposResumoConclusao(modelo),
      acervo,
      obterPoliticaPublicidade("padrao"),
    );
    expect(resumo).toEqual([
      { rotulo: "Primeira escolha", valor: acervo.produtos[0]!.nome },
      { rotulo: "Segunda escolha", valor: acervo.produtos[1]!.nome },
    ]);
  });
});
