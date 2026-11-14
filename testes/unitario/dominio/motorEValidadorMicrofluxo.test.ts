import { describe, expect, it } from "vitest";
import {
  criarColecaoMicrofluxosPadraoParaTestes,
  criarMicrofluxoPadraoParaTestes,
} from "../../fixtures/geradoresMicrofluxoTeste";
import {
  atualizarRespostasExecucaoMicrofluxo,
  avancarEtapaExecucaoMicrofluxo,
  calcularRecomendacaoMicrofluxo,
  criarEstadoExecucaoMicrofluxo,
  obterEtapaAtualExecucao,
  retrocederEtapaExecucaoMicrofluxo,
} from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  avaliarIntegridadeGrafoMicrofluxo,
  exigirGrafoMicrofluxoValidoParaPublicacao,
} from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { CATALOGO_ACERVOS_DEMONSTRACAO } from "../../fixtures/dadosExemploVitrine";

describe("Validador de Grafo Acíclico (DAG) e Motor de Execução de Microfluxos", () => {
  it("deve validar com sucesso os 5 modelos oficiais de experiências interativas", () => {
    const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!;
    const colecao = criarColecaoMicrofluxosPadraoParaTestes({
      organizacaoId: "org-1",
      nomeOrganizacao: "Lumina Arquitetura & Luz",
      servicos: acervo.servicos,
    });

    expect(colecao).toHaveLength(5);
    for (const microfluxo of colecao) {
      const inconsistencias = avaliarIntegridadeGrafoMicrofluxo(microfluxo);
      expect(inconsistencias).toHaveLength(0);
    }
  });

  it("deve detectar ciclos, etapas órfãs e transições quebradas no grafo", () => {
    const base = criarMicrofluxoPadraoParaTestes({
      organizacaoId: "org-1",
      nomeOrganizacao: "Vasconcelos Advocacia Empresarial",
      modelo: "diagnostico",
    });

    const comCicloEOrfa: DefinicaoMicrofluxo = {
      ...base,
      etapas: [
        {
          id: "etapa-a",
          tipoEtapa: "selecao_unica",
          titulo: "Pergunta A",
          obrigatoria: true,
          proximaEtapaPadraoId: "etapa-b",
          opcoes: [{ id: "op-1", rotulo: "Opção 1", proximaEtapaIdOpcional: "inexistente" }],
        },
        {
          id: "etapa-b",
          tipoEtapa: "entrada_curta",
          titulo: "Pergunta B",
          obrigatoria: true,
          proximaEtapaPadraoId: "etapa-a",
        },
        {
          id: "etapa-isolada",
          tipoEtapa: "coleta_contato",
          titulo: "Contato isolado",
          obrigatoria: true,
        },
      ],
      etapaInicialId: "etapa-a",
    };

    const inconsistencias = avaliarIntegridadeGrafoMicrofluxo(comCicloEOrfa);
    expect(inconsistencias.length).toBeGreaterThan(0);

    const codigos = inconsistencias.map((p) => p.codigo);
    expect(codigos).toContain("CICLO_DETECTADO_NO_GRAFO");
    expect(codigos).toContain("ETAPA_ORFA_INALCANCAVEL");
    expect(codigos).toContain("TRANSICAO_DESTINO_INEXISTENTE");

    expect(() => exigirGrafoMicrofluxoValidoParaPublicacao(comCicloEOrfa)).toThrow();
  });

  it("deve executar continuidade de contexto pulando etapas já respondidas pela origem", () => {
    const fluxoSolicitar = criarMicrofluxoPadraoParaTestes({
      organizacaoId: "org-1",
      nomeOrganizacao: "AutoVeloce Showroom",
      modelo: "atendimento",
    });

    // Sem contexto, inicia na seleção de catálogo
    const estadoSemContexto = criarEstadoExecucaoMicrofluxo(fluxoSolicitar);
    expect(obterEtapaAtualExecucao(estadoSemContexto).id).toBe("etapa-catalogo");

    // Com serviço pré-selecionado, pula automaticamente a etapa de catálogo e vai para contexto
    const estadoComContexto = criarEstadoExecucaoMicrofluxo(fluxoSolicitar, {
      servicoPreSelecionadoId: "srv-lumina-1",
    });
    expect(obterEtapaAtualExecucao(estadoComContexto).id).toBe("etapa-contexto");
    expect(estadoComContexto.respostas.servicoSelecionadoId).toBe("srv-lumina-1");
  });

  it("deve percorrer o fluxo Descobrir, calcular recomendação determinística e permitir retroceder", () => {
    const acervoHelena = CATALOGO_ACERVOS_DEMONSTRACAO["vasconcelos-advocacia-empresarial"]!;
    const fluxoDescobrir = criarMicrofluxoPadraoParaTestes({
      organizacaoId: "org-vasconcelos",
      nomeOrganizacao: "Vasconcelos & Valença Advocacia Empresarial",
      modelo: "diagnostico",
      servicos: acervoHelena.servicos,
    });

    let estado = criarEstadoExecucaoMicrofluxo(fluxoDescobrir);
    expect(obterEtapaAtualExecucao(estado).id).toBe("etapa-momento");

    // Tentar avançar sem responder etapa obrigatória deve lançar erro
    expect(() => avancarEtapaExecucaoMicrofluxo(estado)).toThrow(/Selecione uma opção/i);

    estado = atualizarRespostasExecucaoMicrofluxo(estado, {
      opcoesUnicasPorEtapa: { "etapa-momento": "opc-execucao" },
    });
    estado = avancarEtapaExecucaoMicrofluxo(estado);
    expect(obterEtapaAtualExecucao(estado).id).toBe("etapa-recomendacao");

    const recomendacao = calcularRecomendacaoMicrofluxo(
      estado,
      obterEtapaAtualExecucao(estado),
      acervoHelena,
    );
    expect(recomendacao.servicoRecomendado?.id).toBe("srv-vasconcelos-2");
    expect(recomendacao.titulo).toContain("Reestruturação Societária");

    // Retroceder volta para etapa-momento
    const estadoAnterior = retrocederEtapaExecucaoMicrofluxo(estado);
    expect(obterEtapaAtualExecucao(estadoAnterior).id).toBe("etapa-momento");
  });

  it("deve normalizar etapas legadas com selecao_produto e selecao_servico para selecao_catalogo sem erro de validação", async () => {
    const { esquemaDefinicaoMicrofluxo } = await import("@/validacoes/esquemasMicrofluxo");

    const fluxoLegado = {
      id: "fluxo-legado-teste",
      organizacaoId: "org-teste",
      titulo: "Fluxo com tipos legados",
      descricaoCurta: "Descrição curta",
      textoBotaoConclusao: "Enviar",
      mensagemConfirmacaoTitulo: "Sucesso",
      mensagemConfirmacaoCorpo: "Mensagem",
      etapaInicialId: "etapa-prod",
      ativo: true,
      atualizadoEmIso: new Date().toISOString(),
      etapas: [
        {
          id: "etapa-prod",
          tipoEtapa: "selecao_produto",
          titulo: "Selecione o veículo",
          obrigatoria: true,
          proximaEtapaPadraoId: "etapa-serv",
        },
        {
          id: "etapa-serv",
          tipoEtapa: "selecao_servico",
          titulo: "Selecione o serviço",
          obrigatoria: true,
        },
      ],
    };

    const resultado = esquemaDefinicaoMicrofluxo.safeParse(fluxoLegado);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.etapas[0]?.tipoEtapa).toBe("selecao_catalogo");
      expect(resultado.data.etapas[0]?.fonteCatalogo).toBe("produtos");
      expect(resultado.data.etapas[1]?.tipoEtapa).toBe("selecao_catalogo");
      expect(resultado.data.etapas[1]?.fonteCatalogo).toBe("servicos");
    }
  });
});
