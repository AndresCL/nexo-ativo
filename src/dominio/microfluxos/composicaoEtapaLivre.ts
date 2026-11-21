import type { AcervoPublicoVitrine } from "../entidades/catalogoConteudo";
import type { RespostasExecucaoMicrofluxo, ValorCampoDinamico } from "./motorExecucaoMicrofluxo";
import type {
  BlocoEtapaLivre,
  EtapaMicrofluxo,
  FinalidadeCampoContato,
  OpcaoEtapaMicrofluxo,
} from "./tiposMicrofluxo";

/** Modelo inicial editável; os canais são escolhas comuns, sem regras especiais. */
export function criarEtapaDadosRetorno(id: string): EtapaMicrofluxo {
  return {
    id,
    tipoEtapa: "etapa_livre",
    modeloOrigem: "coleta_contato",
    titulo: "Como prefere receber o retorno?",
    subtituloOpcional: "Informe seu nome e número para receber o contato da equipe.",
    obrigatoria: true,
    blocos: [
      {
        id: "preferencia-contato",
        tipo: "escolha",
        rotulo: "Como prefere receber o retorno?",
        multipla: false,
        obrigatorio: true,
        opcoes: [
          { id: "whatsapp", rotulo: "WhatsApp" },
          { id: "ligacao", rotulo: "Ligação" },
        ],
      },
      {
        id: "nomeCompleto",
        tipo: "campo",
        finalidade: "nomeCompleto",
        campo: { id: "nomeCompleto", rotulo: "Seu nome", tipo: "texto_curto", obrigatorio: true },
      },
      {
        id: "telefoneOuWhatsapp",
        tipo: "campo",
        finalidade: "telefoneOuWhatsapp",
        campo: {
          id: "telefoneOuWhatsapp",
          rotulo: "Seu número",
          tipo: "telefone",
          obrigatorio: true,
        },
      },
    ],
  };
}

export function converterEtapaParaLivre(etapa: EtapaMicrofluxo): EtapaMicrofluxo {
  if (etapa.tipoEtapa === "etapa_livre") return etapa;
  const blocos: BlocoEtapaLivre[] = [];
  if (etapa.tipoEtapa === "selecao_unica" || etapa.tipoEtapa === "selecao_multipla")
    blocos.push({
      id: etapa.id,
      tipo: "escolha",
      rotulo: etapa.titulo,
      multipla: etapa.tipoEtapa === "selecao_multipla",
      obrigatorio: etapa.obrigatoria,
      opcoes: etapa.opcoes ?? [],
      referenciaResumoLegada: true,
    });
  else if (etapa.tipoEtapa === "entrada_curta")
    blocos.push({
      id: etapa.id,
      tipo: "campo",
      campo: {
        id: etapa.id,
        rotulo: etapa.titulo,
        tipo: "texto_longo",
        obrigatorio: etapa.obrigatoria,
        placeholder: etapa.placeholderEntrada,
      },
      referenciaResumoLegada: true,
    });
  else if (etapa.tipoEtapa === "coleta_contato") {
    for (const [id, rotulo, tipo, obrigatorio] of [
      ["nomeCompleto", "Seu nome", "texto_curto", true],
      ["telefoneOuWhatsapp", "WhatsApp ou telefone", "telefone", true],
      ["email", "E-mail", "email", false],
      ["mensagemAdicional", "Mensagem adicional", "texto_longo", false],
    ] as const)
      blocos.push({ id, tipo: "campo", finalidade: id, campo: { id, rotulo, tipo, obrigatorio } });
  } else if (["selecao_catalogo", "selecao_produto", "selecao_servico"].includes(etapa.tipoEtapa))
    blocos.push({
      id: etapa.id,
      tipo: "catalogo",
      rotulo: etapa.titulo,
      fonte:
        etapa.fonteCatalogo ??
        (etapa.tipoEtapa === "selecao_produto"
          ? "produtos"
          : etapa.tipoEtapa === "selecao_servico"
            ? "servicos"
            : "ambos"),
      obrigatorio: etapa.obrigatoria,
      referenciaResumoLegada: true,
    });
  else if (etapa.tipoEtapa === "selecao_profissional")
    blocos.push({
      id: etapa.id,
      tipo: "equipe",
      rotulo: etapa.titulo,
      obrigatorio: etapa.obrigatoria,
      referenciaResumoLegada: true,
    });
  else if (etapa.tipoEtapa !== "formulario_dinamico") return etapa;
  for (const campo of etapa.campos ?? []) blocos.push({ id: campo.id, tipo: "campo", campo });
  return {
    ...etapa,
    modeloOrigem: etapa.modeloOrigem ?? etapa.tipoEtapa,
    tipoEtapa: "etapa_livre",
    blocos,
  };
}

export function obterValorBloco(
  etapa: EtapaMicrofluxo,
  bloco: BlocoEtapaLivre,
  respostas: RespostasExecucaoMicrofluxo,
): ValorCampoDinamico | undefined {
  const chave = bloco.tipo === "campo" ? bloco.campo.id : bloco.id;
  const valor = respostas.camposDinamicosPorEtapa?.[etapa.id]?.[chave];
  if (valor !== undefined) return valor;
  if (bloco.tipo === "catalogo")
    return respostas.produtoSelecionadoId
      ? `produto:${respostas.produtoSelecionadoId}`
      : respostas.servicoSelecionadoId
        ? `servico:${respostas.servicoSelecionadoId}`
        : undefined;
  if (bloco.tipo === "equipe") return respostas.profissionalSelecionadoId;
  if ("referenciaResumoLegada" in bloco && bloco.referenciaResumoLegada) {
    if (bloco.tipo === "escolha")
      return bloco.multipla
        ? respostas.opcoesMultiplasPorEtapa[etapa.id]
        : respostas.opcoesUnicasPorEtapa[etapa.id];
    if (bloco.tipo === "campo") return respostas.textosCurtosPorEtapa[etapa.id];
  }
  return undefined;
}

export function atualizarRespostaBloco(
  etapa: EtapaMicrofluxo,
  bloco: BlocoEtapaLivre,
  respostas: RespostasExecucaoMicrofluxo,
  valor: ValorCampoDinamico,
): RespostasExecucaoMicrofluxo {
  const chave = bloco.tipo === "campo" ? bloco.campo.id : bloco.id;
  let atualizadas: RespostasExecucaoMicrofluxo = {
    ...respostas,
    camposDinamicosPorEtapa: {
      ...respostas.camposDinamicosPorEtapa,
      [etapa.id]: { ...respostas.camposDinamicosPorEtapa?.[etapa.id], [chave]: valor },
    },
  };
  if (bloco.tipo === "catalogo") {
    const texto = String(valor);
    atualizadas = {
      ...atualizadas,
      produtoSelecionadoId: texto.startsWith("produto:") ? texto.slice(8) : undefined,
      servicoSelecionadoId: texto.startsWith("servico:") ? texto.slice(8) : undefined,
    };
  }
  if (bloco.tipo === "equipe")
    atualizadas = { ...atualizadas, profissionalSelecionadoId: String(valor) };
  if ("referenciaResumoLegada" in bloco && bloco.referenciaResumoLegada) {
    if (bloco.tipo === "escolha" && !bloco.multipla)
      atualizadas = {
        ...atualizadas,
        opcoesUnicasPorEtapa: { ...atualizadas.opcoesUnicasPorEtapa, [etapa.id]: String(valor) },
      };
    if (bloco.tipo === "escolha" && bloco.multipla)
      atualizadas = {
        ...atualizadas,
        opcoesMultiplasPorEtapa: {
          ...atualizadas.opcoesMultiplasPorEtapa,
          [etapa.id]: Array.isArray(valor) ? valor : [],
        },
      };
    if (bloco.tipo === "campo")
      atualizadas = {
        ...atualizadas,
        textosCurtosPorEtapa: { ...atualizadas.textosCurtosPorEtapa, [etapa.id]: String(valor) },
      };
  }
  return atualizadas;
}

export function obterOpcoesDeSaida(etapa: EtapaMicrofluxo): readonly OpcaoEtapaMicrofluxo[] {
  return etapa.tipoEtapa === "etapa_livre"
    ? (etapa.blocos ?? []).flatMap((b) => (b.tipo === "escolha" && !b.multipla ? b.opcoes : []))
    : (etapa.opcoes ?? []);
}

export function obterRespostaLegivelBloco(
  etapa: EtapaMicrofluxo,
  bloco: BlocoEtapaLivre,
  respostas: RespostasExecucaoMicrofluxo,
  acervo?: AcervoPublicoVitrine,
): string | undefined {
  let valor = obterValorBloco(etapa, bloco, respostas);
  if (bloco.tipo === "catalogo") {
    const selecao = String(valor ?? "");
    return selecao.startsWith("produto:")
      ? acervo?.produtos.find((p) => p.id === selecao.slice(8))?.nome
      : selecao.startsWith("servico:")
        ? acervo?.servicos.find((p) => p.id === selecao.slice(8))?.nome
        : undefined;
  }
  if (bloco.tipo === "equipe")
    return acervo?.profissionais.find((p) => p.id === valor)?.nomeCompleto;
  if (bloco.tipo === "escolha") {
    const ids = Array.isArray(valor) ? valor : valor === undefined ? [] : [String(valor)];
    valor = ids.flatMap((id) => bloco.opcoes.find((o) => o.id === id)?.rotulo ?? []);
  }
  if (valor === undefined || valor === null) return undefined;
  const texto = (
    Array.isArray(valor)
      ? valor.join(" · ")
      : typeof valor === "boolean"
        ? valor
          ? "Sim"
          : "Não"
        : String(valor)
  ).trim();
  return texto || undefined;
}

/** Reconstitui contato a partir dos campos preenchidos nas etapas livres. */
export function resolverContatoEtapasLivres(
  etapas: readonly EtapaMicrofluxo[],
  respostas: RespostasExecucaoMicrofluxo,
) {
  const contato: Partial<Record<FinalidadeCampoContato, string>> = {};
  for (const etapa of etapas) {
    for (const bloco of etapa.blocos ?? []) {
      if (bloco.tipo === "campo") {
        const valor = obterValorBloco(etapa, bloco, respostas);
        if (valor !== undefined && String(valor).trim().length > 0) {
          const valorLimpo = String(valor).trim();
          if (bloco.finalidade) {
            contato[bloco.finalidade] = valorLimpo;
          } else if (bloco.campo.tipo === "email" || bloco.campo.rotulo.toLowerCase().includes("e-mail") || bloco.campo.rotulo.toLowerCase().includes("email")) {
            contato.email = valorLimpo;
          } else if (bloco.campo.tipo === "telefone" || bloco.campo.rotulo.toLowerCase().includes("whatsapp") || bloco.campo.rotulo.toLowerCase().includes("telefone")) {
            contato.telefoneOuWhatsapp = valorLimpo;
          } else if (bloco.campo.rotulo.toLowerCase().includes("nome")) {
            contato.nomeCompleto = valorLimpo;
          }
        }
      }
    }
  }

  const nome = contato.nomeCompleto || "Visitante";
  const telefone = contato.telefoneOuWhatsapp || (contato.email ? "Não informado" : undefined);

  return telefone
    ? {
        ...contato,
        nomeCompleto: nome,
        telefoneOuWhatsapp: telefone,
      }
    : undefined;
}

export function alterarDestinoOpcaoEtapa(
  etapa: EtapaMicrofluxo,
  opcaoId: string,
  destino: string | undefined,
  blocoId?: string,
  encerrarPercurso = false,
  desconectada = false,
): EtapaMicrofluxo {
  if (etapa.tipoEtapa === "etapa_livre")
    return {
      ...etapa,
      blocos: etapa.blocos?.map((b) =>
        b.tipo === "escolha" && (!blocoId || b.id === blocoId)
          ? {
              ...b,
              opcoes: b.opcoes.map((o) =>
                o.id === opcaoId
                  ? { ...o, proximaEtapaIdOpcional: destino, encerrarPercurso, desconectada }
                  : o,
              ),
            }
          : b,
      ),
    };
  return {
    ...etapa,
    opcoes: etapa.opcoes?.map((o) =>
      o.id === opcaoId
        ? { ...o, proximaEtapaIdOpcional: destino, encerrarPercurso, desconectada }
        : o,
    ),
  };
}

/** Uma escolha obrigatória com todas as alternativas dirigidas não utiliza a saída padrão. */
export function etapaUtilizaSaidaPadrao(etapa: EtapaMicrofluxo): boolean {
  const escolhas =
    etapa.tipoEtapa === "etapa_livre"
      ? (etapa.blocos ?? []).flatMap((b) =>
          b.tipo === "escolha" &&
          !b.multipla &&
          b.opcoes.some((o) => o.proximaEtapaIdOpcional || o.encerrarPercurso || o.desconectada)
            ? [{ obrigatorio: b.obrigatorio, opcoes: b.opcoes }]
            : [],
        )
      : etapa.tipoEtapa === "selecao_unica"
        ? [{ obrigatorio: etapa.obrigatoria, opcoes: etapa.opcoes ?? [] }]
        : [];
  return (
    !escolhas.length ||
    escolhas.some(
      (e) =>
        !e.obrigatorio ||
        e.opcoes.some((o) => !o.proximaEtapaIdOpcional && !o.encerrarPercurso && !o.desconectada),
    )
  );
}
