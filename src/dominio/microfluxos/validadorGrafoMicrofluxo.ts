import { etapaUtilizaSaidaPadrao, obterOpcoesDeSaida } from "./composicaoEtapaLivre";
import { validarRegraCalculoComercial } from "../comercial/calculadoraComercialCentavos";
import { ErroValidacaoDominio } from "../erros/errosDominio";
import type { DefinicaoMicrofluxo, EtapaMicrofluxo } from "./tiposMicrofluxo";

export interface InconsistenciaGrafoMicrofluxo {
  readonly codigo:
    | "SAIDA_DESCONECTADA"
    | "SEM_ETAPAS"
    | "ETAPA_INICIAL_INEXISTENTE"
    | "ID_ETAPA_DUPLICADO"
    | "TRANSICAO_DESTINO_INEXISTENTE"
    | "CICLO_DETECTADO_NO_GRAFO"
    | "ETAPA_ORFA_INALCANCAVEL"
    | "SELECAO_SEM_OPCOES"
    | "PIX_MANUAL_INCOMPLETO"
    | "REGRA_CALCULO_COMERCIAL_INVALIDA"
    | "SEM_ETAPA_CONTATO";
  readonly mensagem: string;
}

function obterDestinosSaidaEtapa(etapa: EtapaMicrofluxo): readonly string[] {
  const destinos = new Set<string>();
  if (!etapa.saidaPadraoDesconectada && etapa.proximaEtapaPadraoId?.trim()) {
    destinos.add(etapa.proximaEtapaPadraoId.trim());
  }

  {
    for (const opcao of obterOpcoesDeSaida(etapa)) {
      if (!opcao.desconectada && !opcao.encerrarPercurso && opcao.proximaEtapaIdOpcional?.trim()) {
        destinos.add(opcao.proximaEtapaIdOpcional.trim());
      }
    }
  }

  return [...destinos];
}

/**
 * Avalia estruturalmente se um microfluxo forma um Grafo Acíclico Dirigido (DAG) íntegro,
 * sem ciclos, sem transições quebradas, sem etapas órfãs e com resultado alternativo
 * obrigatório para fluxos do tipo 'descobrir'.
 */
export function avaliarIntegridadeGrafoMicrofluxo(
  microfluxo: DefinicaoMicrofluxo,
): readonly InconsistenciaGrafoMicrofluxo[] {
  const inconsistencias: InconsistenciaGrafoMicrofluxo[] = [];

  if (microfluxo.tipoAcao && microfluxo.tipoAcao !== "microfluxo") {
    if (microfluxo.tipoAcao === "link_externo") {
      const url = microfluxo.urlDestinoOpcional?.trim() || "";
      if (!url) {
        inconsistencias.push({
          codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
          mensagem: `A ação de link externo "${microfluxo.titulo}" precisa ter uma URL de destino preenchida.`,
        });
      } else if (!/^https?:\/\//i.test(url)) {
        inconsistencias.push({
          codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
          mensagem: `A URL da ação "${microfluxo.titulo}" deve iniciar com http:// ou https://.`,
        });
      }
    } else if (microfluxo.tipoAcao === "whatsapp") {
      const destino = microfluxo.urlDestinoOpcional?.trim() || "";
      if (!destino) {
        inconsistencias.push({
          codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
          mensagem: `A ação de WhatsApp "${microfluxo.titulo}" precisa ter um número ou link preenchido.`,
        });
      }
    } else if (microfluxo.tipoAcao === "telefone") {
      const destino = microfluxo.urlDestinoOpcional?.trim() || "";
      if (!destino) {
        inconsistencias.push({
          codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
          mensagem: `A ação de telefone "${microfluxo.titulo}" precisa ter um número de contato preenchido.`,
        });
      }
    } else if (microfluxo.tipoAcao === "publicacao_post") {
      const post = microfluxo.configuracaoPost;
      if (!post?.corpoTexto?.trim()) {
        inconsistencias.push({
          codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
          mensagem: `A publicação "${microfluxo.titulo}" precisa ter o texto do post preenchido.`,
        });
      }
      if (post?.cta.tipoAcao === "link_externo") {
        const url = post.cta.destinoOpcional?.trim() || "";
        if (!url || !/^https?:\/\//i.test(url)) {
          inconsistencias.push({
            codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
            mensagem: `O botão de link externo da publicação "${microfluxo.titulo}" precisa de uma URL iniciando com http:// ou https://.`,
          });
        }
      } else if (post?.cta.tipoAcao === "microfluxo" && !post.cta.microfluxoId?.trim()) {
        inconsistencias.push({
          codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
          mensagem: `Selecione qual experiência o botão da publicação "${microfluxo.titulo}" deve iniciar.`,
        });
      }
    }

    return inconsistencias;
  }

  if (microfluxo.etapas.length === 0) {
    inconsistencias.push({
      codigo: "SEM_ETAPAS",
      mensagem: `A experiência "${microfluxo.titulo}" precisa ter pelo menos uma etapa configurada.`,
    });
    return inconsistencias;
  }

  const mapaEtapas = new Map<string, EtapaMicrofluxo>();
  for (const etapa of microfluxo.etapas) {
    if (mapaEtapas.has(etapa.id)) {
      inconsistencias.push({
        codigo: "ID_ETAPA_DUPLICADO",
        mensagem: `A etapa "${etapa.titulo}" possui identificador duplicado (${etapa.id}).`,
      });
    }
    mapaEtapas.set(etapa.id, etapa);

    const opcoesDesconectadas = obterOpcoesDeSaida(etapa).filter((o) => o.desconectada);
    if (opcoesDesconectadas.length > 0) {
      if (opcoesDesconectadas.length === 1) {
        inconsistencias.push({
          codigo: "SAIDA_DESCONECTADA",
          mensagem: `Conecte a resposta “${opcoesDesconectadas[0]!.rotulo}” da etapa “${etapa.titulo}” antes de publicar.`,
        });
      } else {
        inconsistencias.push({
          codigo: "SAIDA_DESCONECTADA",
          mensagem: `Conecte as ${opcoesDesconectadas.length} respostas pendentes da etapa “${etapa.titulo}” antes de publicar.`,
        });
      }
    }
    if (etapa.saidaPadraoDesconectada && etapaUtilizaSaidaPadrao(etapa))
      inconsistencias.push({
        codigo: "SAIDA_DESCONECTADA",
        mensagem: `Defina o caminho padrão ou a finalização da etapa “${etapa.titulo}” antes de publicar.`,
      });
    if (etapa.tipoEtapa === "etapa_livre") {
      const blocos = etapa.blocos ?? [];
      const ids = blocos.map((b) => b.id);
      const campos = blocos.flatMap((b) =>
        b.tipo === "campo" ? [b.campo.id] : b.tipo !== "texto" && b.tipo !== "imagem" ? [b.id] : [],
      );
      const finalidades = blocos.flatMap((b) =>
        b.tipo === "campo" && b.finalidade ? [b.finalidade] : [],
      );
      const comDesvio = blocos.filter(
        (b) =>
          b.tipo === "escolha" &&
          b.opcoes.some((o) => o.proximaEtapaIdOpcional || o.encerrarPercurso || o.desconectada),
      );
      if (
        new Set(ids).size !== ids.length ||
        new Set(campos).size !== campos.length ||
        new Set(finalidades).size !== finalidades.length ||
        blocos.filter((b) => b.tipo === "catalogo").length > 1 ||
        blocos.filter((b) => b.tipo === "equipe").length > 1 ||
        comDesvio.length > 1 ||
        comDesvio.some((b) => b.tipo === "escolha" && b.multipla)
      ) {
        inconsistencias.push({
          codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
          mensagem: `Revise os elementos de “${etapa.titulo}”: identificadores e finalidades devem ser únicos; use uma escolha única para definir o caminho de saída.`,
        });
      }
      for (const bloco of blocos)
        if (bloco.tipo === "campo" && bloco.finalidade) {
          const compativel =
            bloco.finalidade === "telefoneOuWhatsapp"
              ? bloco.campo.tipo === "telefone"
              : bloco.finalidade === "email"
                ? bloco.campo.tipo === "email"
                : ["texto_curto", "texto_longo"].includes(bloco.campo.tipo);
          if (!compativel)
            inconsistencias.push({
              codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
              mensagem: `O tipo de resposta de “${bloco.campo.rotulo}” não corresponde à finalidade de contato escolhida.`,
            });
        }
      if (
        blocos.some(
          (b) =>
            b.tipo === "escolha" &&
            (!b.opcoes.length || new Set(b.opcoes.map((o) => o.id)).size !== b.opcoes.length),
        )
      )
        inconsistencias.push({
          codigo: "SELECAO_SEM_OPCOES",
          mensagem: "Toda escolha precisa de opções com identificadores únicos.",
        });
    }
    if (
      (etapa.tipoEtapa === "selecao_unica" || etapa.tipoEtapa === "selecao_multipla") &&
      (!etapa.opcoes || etapa.opcoes.length === 0)
    ) {
      inconsistencias.push({
        codigo: "SELECAO_SEM_OPCOES",
        mensagem: `A etapa "${etapa.titulo}" exige pelo menos uma opção de escolha.`,
      });
    }

    if (etapa.tipoEtapa === "instrucao_pix_manual") {
      if (
        !etapa.configuracaoPixManual?.chavePix.trim() ||
        !etapa.configuracaoPixManual.nomeRecebedor.trim()
      ) {
        inconsistencias.push({
          codigo: "PIX_MANUAL_INCOMPLETO",
          mensagem: `A etapa de Pix manual "${etapa.titulo}" exige chave Pix e nome do recebedor.`,
        });
      }
    }
  }

  if (!mapaEtapas.has(microfluxo.etapaInicialId)) {
    inconsistencias.push({
      codigo: "ETAPA_INICIAL_INEXISTENTE",
      mensagem: `A etapa inicial configurada em "${microfluxo.titulo}" não existe na lista de etapas.`,
    });
    return inconsistencias;
  }

  for (const etapa of microfluxo.etapas) {
    const destinos = obterDestinosSaidaEtapa(etapa);
    for (const destinoId of destinos) {
      if (!mapaEtapas.has(destinoId)) {
        inconsistencias.push({
          codigo: "TRANSICAO_DESTINO_INEXISTENTE",
          mensagem: `A etapa "${etapa.titulo}" aponta para uma etapa inexistente (${destinoId}).`,
        });
      }
    }
  }

  // Busca em profundidade (DFS) com 3 cores para detecção exata de ciclos e alcançabilidade
  const estadoVisita = new Map<string, "visitando" | "concluido">();
  let cicloDetectado = false;

  function visitarNo(etapaId: string) {
    const estadoAtual = estadoVisita.get(etapaId);
    if (estadoAtual === "visitando") {
      cicloDetectado = true;
      return;
    }
    if (estadoAtual === "concluido") {
      return;
    }

    estadoVisita.set(etapaId, "visitando");
    const etapa = mapaEtapas.get(etapaId);
    if (etapa) {
      for (const destinoId of obterDestinosSaidaEtapa(etapa)) {
        if (mapaEtapas.has(destinoId)) {
          visitarNo(destinoId);
        }
      }
    }
    estadoVisita.set(etapaId, "concluido");
  }

  visitarNo(microfluxo.etapaInicialId);

  if (cicloDetectado) {
    inconsistencias.push({
      codigo: "CICLO_DETECTADO_NO_GRAFO",
      mensagem: `A experiência "${microfluxo.titulo}" possui um ciclo entre etapas que impediria a conclusão pelo visitante.`,
    });
  }

  for (const etapa of microfluxo.etapas) {
    if (!estadoVisita.has(etapa.id)) {
      inconsistencias.push({
        codigo: "ETAPA_ORFA_INALCANCAVEL",
        mensagem: `A etapa "${etapa.titulo}" nunca é alcançada a partir da etapa inicial.`,
      });
    }
  }

  if (microfluxo.regraCalculoComercial) {
    try {
      validarRegraCalculoComercial(microfluxo.regraCalculoComercial);
    } catch (erro) {
      inconsistencias.push({
        codigo: "REGRA_CALCULO_COMERCIAL_INVALIDA",
        mensagem:
          erro instanceof Error
            ? erro.message
            : "A regra de cálculo comercial configurada é inválida.",
      });
    }
  }

  // Verifica se o microfluxo possui etapa de captura de contato para gerar lead
  const possuiEtapaContato = microfluxo.etapas.some((etapa) => {
    if (etapa.tipoEtapa === "coleta_contato" || etapa.modeloOrigem === "coleta_contato") {
      return true;
    }
    if (etapa.tipoEtapa === "etapa_livre" && etapa.blocos) {
      return etapa.blocos.some(
        (bloco) =>
          bloco.tipo === "campo" &&
          (bloco.finalidade ||
            bloco.campo.tipo === "telefone" ||
            bloco.campo.tipo === "email" ||
            bloco.campo.rotulo.toLowerCase().includes("whatsapp") ||
            bloco.campo.rotulo.toLowerCase().includes("telefone") ||
            bloco.campo.rotulo.toLowerCase().includes("email")),
      );
    }
    return false;
  });

  if (!possuiEtapaContato) {
    inconsistencias.push({
      codigo: "SEM_ETAPA_CONTATO",
      mensagem: `A experiência "${microfluxo.titulo}" precisa conter uma etapa de contato ("Dados para retorno" ou campos de WhatsApp/E-mail) para que você receba os leads e os alertas por e-mail.`,
    });
  }

  return inconsistencias;
}

export function exigirGrafoMicrofluxoValidoParaPublicacao(microfluxo: DefinicaoMicrofluxo): void {
  const inconsistencias = avaliarIntegridadeGrafoMicrofluxo(microfluxo);
  const primeira = inconsistencias[0];
  if (primeira) {
    throw new ErroValidacaoDominio(primeira.mensagem, primeira.codigo);
  }
}
