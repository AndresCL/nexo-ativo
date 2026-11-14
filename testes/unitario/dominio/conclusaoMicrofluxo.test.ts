import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import { describe, expect, it } from "vitest";
import {
  esquemaConclusaoMicrofluxo,
  esquemaDefinicaoMicrofluxo,
} from "@/validacoes/esquemasMicrofluxo";
import {
  construirCaminhoExperiencia,
  obterIdentificadorPublicoExperiencia,
  exigirDestinosConclusaoValidos,
  projetarRespostasConclusao,
  resolverDestinoAcaoConclusao,
} from "@/dominio/microfluxos/conclusaoMicrofluxo";
import {
  criarEstadoExecucaoMicrofluxo,
  type EstadoExecucaoMicrofluxo,
} from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import type {
  ConfiguracaoConclusaoMicrofluxo,
  DefinicaoMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { CATALOGO_ACERVOS_DEMONSTRACAO } from "../../fixtures/dadosExemploVitrine";

const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!;
const base = criarMicrofluxoPadraoParaTestes({
  organizacaoId: acervo.servicos[0]!.organizacaoId,
  nomeOrganizacao: "Lumina",
  modelo: "catalogo",
});
const conclusao: ConfiguracaoConclusaoMicrofluxo = {
  acoes: [],
  resumo: { ativo: true, campos: [], incluirDemonstrativo: false },
  camposWhatsapp: [],
};

describe("Contrato e destinos da conclusão", () => {
  it.each([0, 1, 2])(
    "aceita %i ações e preserva a ausência de configuração legada",
    (quantidade) => {
      expect(
        esquemaConclusaoMicrofluxo.parse({
          ...conclusao,
          acoes: Array.from({ length: quantidade }, () => ({ tipo: "home", rotulo: "Voltar" })),
        }).acoes,
      ).toHaveLength(quantidade);
      expect(esquemaDefinicaoMicrofluxo.parse(base).conclusao).toBeUndefined();
    },
  );
  it("recusa terceira ação, esquemas executáveis e URLs com credenciais", () => {
    expect(
      esquemaConclusaoMicrofluxo.safeParse({
        ...conclusao,
        acoes: Array.from({ length: 3 }, () => ({ tipo: "home", rotulo: "Voltar" })),
      }).success,
    ).toBe(false);
    for (const url of ["javascript:alert(1)", "data:text/html,x", "https://nome:senha@exemplo.com"])
      expect(
        esquemaConclusaoMicrofluxo.safeParse({
          ...conclusao,
          acoes: [{ tipo: "url_externa", rotulo: "Site", url }],
        }).success,
      ).toBe(false);
  });
  it("valida destinos no acervo publicado e impede ciclos entre experiências", () => {
    const fluxo = (id: string, alvo: string): DefinicaoMicrofluxo => ({
      ...base,
      id,
      conclusao: {
        ...conclusao,
        acoes: [{ tipo: "microfluxo", rotulo: "Continuar", microfluxoId: alvo }],
      },
    });
    expect(() =>
      exigirDestinosConclusaoValidos(base.organizacaoId, {
        ...acervo,
        microfluxos: [fluxo("a", "b"), { ...base, id: "b" }],
      }),
    ).not.toThrow();
    expect(() =>
      exigirDestinosConclusaoValidos(base.organizacaoId, {
        ...acervo,
        microfluxos: [fluxo("a", "b"), fluxo("b", "a")],
      }),
    ).toThrow(/ciclo/);
    expect(() =>
      exigirDestinosConclusaoValidos(base.organizacaoId, {
        ...acervo,
        microfluxos: [fluxo("a", "privado")],
      }),
    ).toThrow(/destino/);
    expect(() =>
      exigirDestinosConclusaoValidos("outra-organizacao", { ...acervo, microfluxos: [base] }),
    ).toThrow(/outra organização/);
    expect(() =>
      exigirDestinosConclusaoValidos(base.organizacaoId, {
        ...acervo,
        microfluxos: [
          {
            ...base,
            conclusao: {
              ...conclusao,
              acoes: [{ tipo: "perfil_profissional", rotulo: "Perfil", profissionalId: "privado" }],
            },
          },
        ],
      }),
    ).toThrow(/perfil/);
  });
  it("impede usar URL da própria aplicação para contornar destinos e ciclos", () => {
    expect(() =>
      exigirDestinosConclusaoValidos(
        base.organizacaoId,
        {
          ...acervo,
          microfluxos: [
            {
              ...base,
              conclusao: {
                ...conclusao,
                acoes: [
                  {
                    tipo: "url_externa",
                    rotulo: "Voltar",
                    url: "https://exemplo.com/lumina/experiencias/origem",
                  },
                ],
              },
            },
          ],
        },
        "https://exemplo.com",
      ),
    ).toThrow(/URL externa/);
  });
  it("não gera navegação para destinos indisponíveis", () => {
    expect(
      resolverDestinoAcaoConclusao(
        { tipo: "microfluxo", rotulo: "Ir", microfluxoId: "privado" },
        "lumina",
        acervo,
        null,
      ),
    ).toBeNull();
    expect(
      resolverDestinoAcaoConclusao(
        { tipo: "whatsapp", rotulo: "Conversar" },
        "lumina",
        acervo,
        null,
      ),
    ).toBeNull();
  });
});

describe("Projeção de respostas sem armazenamento adicional", () => {
  const fluxo: DefinicaoMicrofluxo = {
    ...base,
    etapaInicialId: "escolha",
    etapas: [
      {
        id: "escolha",
        titulo: "Opção",
        tipoEtapa: "selecao_unica",
        obrigatoria: true,
        opcoes: [
          { id: "a", rotulo: "Atendimento", proximaEtapaIdOpcional: "formulario" },
          { id: "b", rotulo: "Outro", proximaEtapaIdOpcional: "omitida" },
        ],
      },
      { id: "omitida", titulo: "Ramo anterior", tipoEtapa: "entrada_curta", obrigatoria: false },
      {
        id: "formulario",
        titulo: "Preferências",
        tipoEtapa: "formulario_dinamico",
        obrigatoria: false,
        campos: [
          { id: "quantidade", rotulo: "Quantidade", tipo: "numero", obrigatorio: false },
          { id: "valor", rotulo: "Valor", tipo: "moeda", obrigatorio: false },
          { id: "opcoes", rotulo: "Opções", tipo: "selecao_multipla", obrigatorio: false },
          { id: "vazio", rotulo: "Não respondido", tipo: "texto_curto", obrigatorio: false },
        ],
      },
    ],
  };
  const estado: EstadoExecucaoMicrofluxo = {
    ...criarEstadoExecucaoMicrofluxo(fluxo),
    etapaAtualId: "formulario",
    concluido: true,
    respostas: {
      opcoesUnicasPorEtapa: { escolha: "a" },
      opcoesMultiplasPorEtapa: {},
      textosCurtosPorEtapa: { omitida: "Não deve aparecer" },
      camposDinamicosPorEtapa: {
        formulario: { quantidade: 0, valor: "1.234,56", opcoes: ["A", "B"] },
      },
    },
  };
  const campos = [
    { etapaId: "formulario", campoId: "opcoes", rotulo: "Preferências escolhidas" },
    { etapaId: "omitida" },
    { etapaId: "formulario", campoId: "vazio" },
    { etapaId: "formulario", campoId: "valor" },
    { etapaId: "formulario", campoId: "quantidade" },
    { etapaId: "escolha" },
  ];
  it("mantém ordem e rótulos, suporta múltipla escolha, moeda e zero, omitindo ramos abandonados e vazios", () => {
    expect(
      projetarRespostasConclusao(estado, campos, acervo, obterPoliticaPublicidade("padrao")),
    ).toEqual([
      { rotulo: "Preferências escolhidas", valor: "A · B" },
      { rotulo: "Valor", valor: "R$ 1.234,56" },
      { rotulo: "Quantidade", valor: "0" },
      { rotulo: "Opção", valor: "Atendimento" },
    ]);
  });
  it("oculta valores restritos pela política profissional e não inclui dados não selecionados", () => {
    expect(
      projetarRespostasConclusao(
        estado,
        campos,
        acervo,
        obterPoliticaPublicidade("advocacia_oab"),
      ).some((c) => c.rotulo === "Valor"),
    ).toBe(false);
    expect(
      projetarRespostasConclusao(estado, [], acervo, obterPoliticaPublicidade("padrao")),
    ).toEqual([]);
  });
});

describe("Permalinks independentes", () => {
  it("mantém links estáveis, distintos e sem nomes internos ou títulos", () => {
    expect(construirCaminhoExperiencia("cliente", "alfa")).toBe("/cliente#experiencia=e-YWxmYQ");
    expect(construirCaminhoExperiencia("cliente", "beta")).toBe("/cliente#experiencia=e-YmV0YQ");
    expect(obterIdentificadorPublicoExperiencia("experiência ç")).toMatch(/^e-[a-zA-Z0-9_-]+$/);
  });
});
