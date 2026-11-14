import {
  atualizarRespostaBloco,
  obterValorBloco,
  resolverContatoEtapasLivres,
} from "./composicaoEtapaLivre";
import { calcularDemonstrativoComercialMicrofluxo } from "../comercial/calculadoraComercialCentavos";
import type { DemonstrativoCalculoComercialImutavel } from "../comercial/tiposCalculoComercial";
import type {
  AcervoPublicoVitrine,
  ProdutoCatalogo,
  ProfissionalEquipe,
  ServicoOrganizacao,
} from "../entidades/catalogoConteudo";
import { ErroValidacaoDominio } from "../erros/errosDominio";
import type {
  ContextoOrigemMicrofluxo,
  DefinicaoMicrofluxo,
  EtapaMicrofluxo,
} from "./tiposMicrofluxo";

export interface DadosContatoVisitanteMicrofluxo {
  readonly nomeCompleto: string;
  readonly telefoneOuWhatsapp: string;
  readonly email?: string;
  readonly mensagemAdicional?: string;
}

export type ValorCampoDinamico = string | number | boolean | readonly string[];

export interface RespostasExecucaoMicrofluxo {
  readonly opcoesUnicasPorEtapa: Readonly<Record<string, string>>;
  readonly opcoesMultiplasPorEtapa: Readonly<Record<string, readonly string[]>>;
  readonly textosCurtosPorEtapa: Readonly<Record<string, string>>;
  readonly camposDinamicosPorEtapa?: Readonly<
    Record<string, Readonly<Record<string, ValorCampoDinamico>>>
  >;
  readonly servicoSelecionadoId?: string;
  readonly produtoSelecionadoId?: string;
  readonly profissionalSelecionadoId?: string;
  readonly quantidadeComercial?: number;
  readonly contatoVisitante?: DadosContatoVisitanteMicrofluxo;
}

export interface EstadoExecucaoMicrofluxo {
  readonly microfluxo: DefinicaoMicrofluxo;
  readonly etapaAtualId: string;
  readonly historicoEtapasIds: readonly string[];
  readonly respostas: RespostasExecucaoMicrofluxo;
  readonly concluido: boolean;
  readonly demonstrativoComercialCongelado?: DemonstrativoCalculoComercialImutavel | null;
}

export interface RecomendacaoCalculadaMicrofluxo {
  readonly titulo: string;
  readonly descricao: string;
  readonly servicoRecomendado?: ServicoOrganizacao;
  readonly produtoRecomendado?: ProdutoCatalogo;
  readonly profissionalRecomendado?: ProfissionalEquipe;
}

function buscarEtapaPorId(
  microfluxo: DefinicaoMicrofluxo,
  etapaId: string,
): EtapaMicrofluxo | undefined {
  return microfluxo.etapas.find((e) => e.id === etapaId);
}

/**
 * Calcula a próxima etapa a partir da etapa atual e das respostas acumuladas.
 */
export function resolverProximaEtapaId(
  microfluxo: DefinicaoMicrofluxo,
  etapaAtual: EtapaMicrofluxo,
  respostas: RespostasExecucaoMicrofluxo,
): string | null {
  if (etapaAtual.tipoEtapa === "etapa_livre") {
    for (const bloco of etapaAtual.blocos ?? []) {
      if (bloco.tipo !== "escolha" || bloco.multipla) continue;
      const valor = obterValorBloco(etapaAtual, bloco, respostas);
      const opcao = bloco.opcoes.find((opcao) => opcao.id === valor);
      if (opcao?.desconectada || opcao?.encerrarPercurso) return null;
      const destino = opcao?.proximaEtapaIdOpcional;
      if (destino && buscarEtapaPorId(microfluxo, destino)) return destino;
    }
  }
  if (etapaAtual.tipoEtapa === "selecao_unica" && etapaAtual.opcoes) {
    const opcaoEscolhidaId = respostas.opcoesUnicasPorEtapa[etapaAtual.id];
    const opcao = etapaAtual.opcoes.find((o) => o.id === opcaoEscolhidaId);
    if (opcao?.desconectada || opcao?.encerrarPercurso) return null;
    if (
      opcao?.proximaEtapaIdOpcional &&
      buscarEtapaPorId(microfluxo, opcao.proximaEtapaIdOpcional)
    ) {
      return opcao.proximaEtapaIdOpcional;
    }
  }

  if (etapaAtual.saidaPadraoDesconectada) return null;
  if (
    etapaAtual.proximaEtapaPadraoId &&
    buscarEtapaPorId(microfluxo, etapaAtual.proximaEtapaPadraoId)
  ) {
    return etapaAtual.proximaEtapaPadraoId;
  }

  return null;
}

function etapaJaEstaRespondidaPeloContextoInicial(
  etapa: EtapaMicrofluxo,
  respostas: RespostasExecucaoMicrofluxo,
): boolean {
  if (etapa.saidaPadraoDesconectada) return false;
  if (etapa.tipoEtapa === "etapa_livre") {
    const blocos = etapa.blocos ?? [];
    return (
      blocos.length > 0 &&
      blocos.every((bloco) =>
        bloco.tipo === "catalogo"
          ? Boolean(respostas.servicoSelecionadoId || respostas.produtoSelecionadoId)
          : bloco.tipo === "equipe"
            ? Boolean(respostas.profissionalSelecionadoId)
            : false,
      )
    );
  }
  if (etapa.tipoEtapa === "selecao_catalogo") {
    return Boolean(respostas.servicoSelecionadoId || respostas.produtoSelecionadoId);
  }

  if (etapa.tipoEtapa === "selecao_profissional") {
    return Boolean(respostas.profissionalSelecionadoId);
  }

  return false;
}

/**
 * Inicializa a sessão de execução de um microfluxo aplicando continuidade de contexto:
 * se o visitante partiu de um serviço, produto ou cartão digital de especialista,
 * pré-preenche a seleção correspondente e avança automaticamente por etapas redundantes.
 */
export function criarEstadoExecucaoMicrofluxo(
  microfluxo: DefinicaoMicrofluxo,
  contextoOrigem?: ContextoOrigemMicrofluxo,
): EstadoExecucaoMicrofluxo {
  let respostasIniciais: RespostasExecucaoMicrofluxo = {
    opcoesUnicasPorEtapa: {},
    opcoesMultiplasPorEtapa: {},
    textosCurtosPorEtapa: {},
    ...(contextoOrigem?.servicoPreSelecionadoId
      ? { servicoSelecionadoId: contextoOrigem.servicoPreSelecionadoId }
      : {}),
    ...(contextoOrigem?.produtoPreSelecionadoId
      ? { produtoSelecionadoId: contextoOrigem.produtoPreSelecionadoId }
      : {}),
    ...(contextoOrigem?.profissionalPreSelecionadoId
      ? { profissionalSelecionadoId: contextoOrigem.profissionalPreSelecionadoId }
      : {}),
  };

  let etapaCorrenteId = microfluxo.etapaInicialId;
  const visitadasNoSalto = new Set<string>();

  while (!visitadasNoSalto.has(etapaCorrenteId)) {
    visitadasNoSalto.add(etapaCorrenteId);
    const etapa = buscarEtapaPorId(microfluxo, etapaCorrenteId);
    if (!etapa || !etapaJaEstaRespondidaPeloContextoInicial(etapa, respostasIniciais)) {
      break;
    }

    if (etapa.tipoEtapa === "etapa_livre")
      for (const bloco of etapa.blocos ?? []) {
        const valor = obterValorBloco(etapa, bloco, respostasIniciais);
        if (valor !== undefined)
          respostasIniciais = atualizarRespostaBloco(etapa, bloco, respostasIniciais, valor);
      }
    const proximaId = resolverProximaEtapaId(microfluxo, etapa, respostasIniciais);
    if (!proximaId) {
      break;
    }
    etapaCorrenteId = proximaId;
  }

  return {
    microfluxo,
    etapaAtualId: etapaCorrenteId,
    historicoEtapasIds: [],
    respostas: respostasIniciais,
    concluido: false,
  };
}

export function obterEtapaAtualExecucao(estado: EstadoExecucaoMicrofluxo): EtapaMicrofluxo {
  const encontrada = buscarEtapaPorId(estado.microfluxo, estado.etapaAtualId);
  return encontrada ?? estado.microfluxo.etapas[0]!;
}

export function atualizarRespostasExecucaoMicrofluxo(
  estado: EstadoExecucaoMicrofluxo,
  parcial: Partial<RespostasExecucaoMicrofluxo>,
): EstadoExecucaoMicrofluxo {
  return {
    ...estado,
    respostas: {
      ...estado.respostas,
      ...parcial,
    },
  };
}

/**
 * Valida se a etapa atual possui os dados necessários e avança para o próximo nó do DAG
 * (ou marca a execução como concluída quando atinge a etapa terminal).
 */
export function avancarEtapaExecucaoMicrofluxo(
  estado: EstadoExecucaoMicrofluxo,
  acervoParaCongelamentoComercial?: AcervoPublicoVitrine,
): EstadoExecucaoMicrofluxo {
  const etapaAtual = obterEtapaAtualExecucao(estado);
  let respostas = estado.respostas;

  if (etapaAtual.tipoEtapa === "etapa_livre") {
    for (const bloco of etapaAtual.blocos ?? []) {
      if (bloco.tipo === "texto" || bloco.tipo === "imagem") continue;
      const valor = obterValorBloco(etapaAtual, bloco, respostas);
      if ((bloco.tipo === "catalogo" || bloco.tipo === "equipe") && valor !== undefined)
        respostas = atualizarRespostaBloco(etapaAtual, bloco, respostas, valor);
      const preenchido =
        valor !== undefined &&
        valor !== null &&
        (Array.isArray(valor) ? valor.length > 0 : String(valor).trim().length > 0);
      const obrigatorio = bloco.tipo === "campo" ? bloco.campo.obrigatorio : bloco.obrigatorio;
      if (bloco.tipo === "catalogo") {
        if (
          obrigatorio &&
          !(bloco.fonte !== "produtos" && respostas.servicoSelecionadoId) &&
          !(bloco.fonte !== "servicos" && respostas.produtoSelecionadoId)
        )
          throw new ErroValidacaoDominio(`Escolha um item em “${bloco.rotulo}”.`);
      } else if (bloco.tipo === "equipe") {
        if (obrigatorio && !respostas.profissionalSelecionadoId)
          throw new ErroValidacaoDominio("Selecione um profissional para continuar.");
      } else {
        const rotulo = bloco.tipo === "campo" ? bloco.campo.rotulo : bloco.rotulo;
        if (obrigatorio && !preenchido)
          throw new ErroValidacaoDominio(`Preencha “${rotulo}” para continuar.`);
        if (bloco.tipo === "escolha" && preenchido) {
          const ids = Array.isArray(valor) ? valor : [String(valor)];
          if (ids.some((id) => !bloco.opcoes.some((o) => o.id === id)))
            throw new ErroValidacaoDominio("Selecione uma opção válida.");
        }
        if (bloco.tipo === "campo" && preenchido) {
          if (bloco.finalidade === "nomeCompleto" && String(valor).trim().length < 2)
            throw new ErroValidacaoDominio("Informe seu nome completo.");
          if (
            (bloco.finalidade === "telefoneOuWhatsapp" || bloco.campo.tipo === "telefone") &&
            String(valor).replace(/\D/g, "").length < 8
          )
            throw new ErroValidacaoDominio("Informe um telefone válido para retorno.");
          if (bloco.campo.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor)))
            throw new ErroValidacaoDominio("Informe um e-mail válido.");
          if (
            bloco.campo.tipo === "numero" &&
            (!Number.isFinite(Number(valor)) ||
              (bloco.campo.valorMinimo !== undefined && Number(valor) < bloco.campo.valorMinimo) ||
              (bloco.campo.valorMaximo !== undefined && Number(valor) > bloco.campo.valorMaximo))
          )
            throw new ErroValidacaoDominio(`Verifique o valor de “${rotulo}”.`);
        }
      }
    }
  }

  if (etapaAtual.obrigatoria) {
    if (
      etapaAtual.tipoEtapa === "selecao_unica" &&
      !respostas.opcoesUnicasPorEtapa[etapaAtual.id]
    ) {
      throw new ErroValidacaoDominio(
        "Selecione uma opção para continuar.",
        "OPCAO_UNICA_OBRIGATORIA",
      );
    }

    if (
      etapaAtual.tipoEtapa === "selecao_multipla" &&
      (respostas.opcoesMultiplasPorEtapa[etapaAtual.id]?.length ?? 0) === 0
    ) {
      throw new ErroValidacaoDominio(
        "Selecione pelo menos um item para continuar.",
        "OPCAO_MULTIPLA_OBRIGATORIA",
      );
    }

    if (
      etapaAtual.tipoEtapa === "selecao_catalogo" &&
      !respostas.servicoSelecionadoId &&
      !respostas.produtoSelecionadoId
    ) {
      throw new ErroValidacaoDominio(
        "Escolha um item ou serviço para prosseguir.",
        "ITEM_CATALOGO_OBRIGATORIO",
      );
    }

    if (etapaAtual.tipoEtapa === "selecao_profissional" && !respostas.profissionalSelecionadoId) {
      throw new ErroValidacaoDominio(
        "Selecione o especialista com quem deseja falar.",
        "PROFISSIONAL_OBRIGATORIO",
      );
    }

    if (
      etapaAtual.tipoEtapa === "entrada_curta" &&
      !respostas.textosCurtosPorEtapa[etapaAtual.id]?.trim()
    ) {
      throw new ErroValidacaoDominio(
        "Preencha este campo antes de continuar.",
        "ENTRADA_CURTA_OBRIGATORIA",
      );
    }

    if (
      etapaAtual.tipoEtapa !== "etapa_livre" &&
      etapaAtual.campos &&
      etapaAtual.campos.length > 0
    ) {
      const respostasEtapa = respostas.camposDinamicosPorEtapa?.[etapaAtual.id] ?? {};
      for (const campo of etapaAtual.campos) {
        if (campo.obrigatorio) {
          const valor = respostasEtapa[campo.id];
          const preenchido =
            valor !== undefined &&
            valor !== null &&
            (typeof valor === "string" ? valor.trim().length > 0 : true);
          if (!preenchido) {
            throw new ErroValidacaoDominio(
              `Por favor, preencha o campo "${campo.rotulo}".`,
              "CAMPO_OBRIGATORIO_NAO_PREENCHIDO",
            );
          }
        }
      }
    }

    if (etapaAtual.tipoEtapa === "coleta_contato") {
      const contato = respostas.contatoVisitante;
      if (!contato || contato.nomeCompleto.trim().length < 2) {
        throw new ErroValidacaoDominio("Informe seu nome para concluir.", "NOME_OBRIGATORIO");
      }
      if (contato.telefoneOuWhatsapp.replace(/\D/g, "").length < 8) {
        throw new ErroValidacaoDominio(
          "Informe um WhatsApp ou telefone válido para retorno.",
          "TELEFONE_OBRIGATORIO",
        );
      }
    }
  }

  const opcoesSelecionadas =
    etapaAtual.tipoEtapa === "etapa_livre"
      ? (etapaAtual.blocos ?? []).flatMap((b) =>
          b.tipo === "escolha" && !b.multipla
            ? b.opcoes.filter((o) => o.id === obterValorBloco(etapaAtual, b, respostas))
            : [],
        )
      : etapaAtual.tipoEtapa === "selecao_unica"
        ? (etapaAtual.opcoes ?? []).filter(
            (o) => o.id === respostas.opcoesUnicasPorEtapa[etapaAtual.id],
          )
        : [];
  if (
    opcoesSelecionadas.some((o) => o.desconectada) ||
    (etapaAtual.saidaPadraoDesconectada &&
      !opcoesSelecionadas.some((o) => o.encerrarPercurso || o.proximaEtapaIdOpcional))
  )
    throw new ErroValidacaoDominio(
      "Esta saída ainda não possui um caminho configurado.",
      "SAIDA_DESCONECTADA",
    );

  let proximaId = resolverProximaEtapaId(estado.microfluxo, etapaAtual, respostas);
  const visitadas = new Set<string>([etapaAtual.id]);

  while (proximaId && !visitadas.has(proximaId)) {
    visitadas.add(proximaId);
    const candidata = buscarEtapaPorId(estado.microfluxo, proximaId);
    if (!candidata || !etapaJaEstaRespondidaPeloContextoInicial(candidata, respostas)) {
      break;
    }
    if (candidata.tipoEtapa === "etapa_livre")
      for (const bloco of candidata.blocos ?? []) {
        const valor = obterValorBloco(candidata, bloco, respostas);
        if (valor !== undefined)
          respostas = atualizarRespostaBloco(candidata, bloco, respostas, valor);
      }
    proximaId = resolverProximaEtapaId(estado.microfluxo, candidata, respostas);
  }

  if (!proximaId) {
    const percorridas = new Set([...estado.historicoEtapasIds, etapaAtual.id]);
    const etapasPercorridas = estado.microfluxo.etapas.filter((e) => percorridas.has(e.id));
    const temContatoLegado = etapasPercorridas.some((e) => e.tipoEtapa === "coleta_contato");
    const respostasConclusao = {
      ...respostas,
      contatoVisitante: temContatoLegado
        ? respostas.contatoVisitante
        : resolverContatoEtapasLivres(etapasPercorridas, respostas),
    };
    const demonstrativoCongelado = acervoParaCongelamentoComercial
      ? calcularDemonstrativoComercialMicrofluxo({
          microfluxo: estado.microfluxo,
          respostas,
          acervo: acervoParaCongelamentoComercial,
        })
      : undefined;

    return {
      ...estado,
      concluido: true,
      respostas: respostasConclusao,
      ...(demonstrativoCongelado !== undefined
        ? { demonstrativoComercialCongelado: demonstrativoCongelado }
        : {}),
    };
  }

  return {
    ...estado,
    etapaAtualId: proximaId,
    respostas,
    historicoEtapasIds: [...estado.historicoEtapasIds, etapaAtual.id],
  };
}

export function retrocederEtapaExecucaoMicrofluxo(
  estado: EstadoExecucaoMicrofluxo,
): EstadoExecucaoMicrofluxo {
  if (estado.concluido) {
    return {
      ...estado,
      concluido: false,
    };
  }

  if (estado.historicoEtapasIds.length === 0) {
    return estado;
  }

  const novoHistorico = estado.historicoEtapasIds.slice(0, -1);
  const etapaAnteriorId = estado.historicoEtapasIds[estado.historicoEtapasIds.length - 1]!;

  return {
    ...estado,
    etapaAtualId: etapaAnteriorId,
    historicoEtapasIds: novoHistorico,
  };
}

/**
 * Resolve de forma determinística a recomendação comercial para etapas `recomendacao_catalogo`,
 * cruzando as opções escolhidas com o acervo ativo e aplicando o fallback obrigatório.
 */
export function calcularRecomendacaoMicrofluxo(
  estado: EstadoExecucaoMicrofluxo,
  etapaRecomendacao: EtapaMicrofluxo,
  acervo: AcervoPublicoVitrine,
): RecomendacaoCalculadaMicrofluxo {
  let servicoIdRecomendado = estado.respostas.servicoSelecionadoId;
  let produtoIdRecomendado = estado.respostas.produtoSelecionadoId;
  let profissionalIdRecomendado = estado.respostas.profissionalSelecionadoId;

  for (const etapa of estado.microfluxo.etapas) {
    const selecionadas =
      etapa.tipoEtapa === "etapa_livre"
        ? (etapa.blocos ?? []).flatMap((b) =>
            b.tipo === "escolha"
              ? b.opcoes.filter((opcao) => {
                  const valor = obterValorBloco(etapa, b, estado.respostas);
                  return Array.isArray(valor) ? valor.includes(opcao.id) : valor === opcao.id;
                })
              : [],
          )
        : (etapa.opcoes ?? []).filter(
            (o) => o.id === estado.respostas.opcoesUnicasPorEtapa[etapa.id],
          );
    for (const opcao of selecionadas) {
      servicoIdRecomendado = opcao.servicoRecomendadoId ?? servicoIdRecomendado;
      produtoIdRecomendado = opcao.produtoRecomendadoId ?? produtoIdRecomendado;
      profissionalIdRecomendado = opcao.profissionalRecomendadoId ?? profissionalIdRecomendado;
    }
  }

  const servicoRecomendado =
    acervo.servicos.find((s) => s.id === servicoIdRecomendado) ?? acervo.servicos[0];
  const produtoRecomendado = acervo.produtos.find((p) => p.id === produtoIdRecomendado);
  const profissionalRecomendado =
    acervo.profissionais.find((p) => p.id === profissionalIdRecomendado) ?? acervo.profissionais[0];

  const titulo =
    servicoRecomendado?.nome ??
    produtoRecomendado?.nome ??
    etapaRecomendacao.tituloRecomendacaoPadrao ??
    "Recomendação personalizada";

  const descricao =
    servicoRecomendado?.resumo ??
    produtoRecomendado?.resumo ??
    etapaRecomendacao.descricaoRecomendacaoPadrao ??
    "Com base nas suas respostas, preparamos o direcionamento mais adequado para o seu atendimento.";

  return {
    titulo,
    descricao,
    ...(servicoRecomendado ? { servicoRecomendado } : {}),
    ...(produtoRecomendado ? { produtoRecomendado } : {}),
    ...(profissionalRecomendado ? { profissionalRecomendado } : {}),
  };
}
