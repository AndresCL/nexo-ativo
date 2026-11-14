import type { AcervoPublicoVitrine } from "../entidades/catalogoConteudo";
import { ErroOperacaoMonetaria, ErroValidacaoDominio } from "../erros/errosDominio";
import type { RespostasExecucaoMicrofluxo } from "../microfluxos/motorExecucaoMicrofluxo";
import type { DefinicaoMicrofluxo } from "../microfluxos/tiposMicrofluxo";
import { ValorMonetarioCentavos } from "../objetos-valor/valorMonetarioCentavos";
import type {
  DemonstrativoCalculoComercialImutavel,
  LinhaDemonstrativoCalculoComercial,
  RegraCalculoComercialMicrofluxo,
} from "./tiposCalculoComercial";

/**
 * Valida se uma regra de cálculo comercial respeita todas as invariantes monetárias em centavos inteiros.
 */
export function validarRegraCalculoComercial(regra: RegraCalculoComercialMicrofluxo): void {
  if (regra.modalidade === "sem_calculo") {
    return;
  }

  if (regra.valorBaseCentavos !== undefined) {
    ValorMonetarioCentavos.deCentavos(regra.valorBaseCentavos);
  }

  if (regra.modalidade === "faixa_configurada") {
    if (regra.minimoFaixaCentavos === undefined || regra.maximoFaixaCentavos === undefined) {
      throw new ErroValidacaoDominio(
        "A modalidade de faixa configurada exige valor mínimo e valor máximo.",
        "FAIXA_COMERCIAL_INCOMPLETA",
      );
    }

    const minimo = ValorMonetarioCentavos.deCentavos(regra.minimoFaixaCentavos);
    const maximo = ValorMonetarioCentavos.deCentavos(regra.maximoFaixaCentavos);

    if (maximo.obterCentavos() < minimo.obterCentavos()) {
      throw new ErroOperacaoMonetaria(
        "O valor máximo da faixa comercial não pode ser inferior ao valor mínimo.",
      );
    }
  }

  if (regra.modalidade === "quantidade_vezes_preco") {
    const minQtd = regra.quantidadeMinima ?? 1;
    const maxQtd = regra.quantidadeMaxima ?? 1000;
    if (!Number.isSafeInteger(minQtd) || minQtd < 1) {
      throw new ErroValidacaoDominio(
        "A quantidade mínima deve ser um número inteiro maior ou igual a 1.",
        "QUANTIDADE_MINIMA_INVALIDA",
      );
    }
    if (!Number.isSafeInteger(maxQtd) || maxQtd < minQtd) {
      throw new ErroValidacaoDominio(
        "A quantidade máxima deve ser um inteiro maior ou igual à quantidade mínima.",
        "QUANTIDADE_MAXIMA_INVALIDA",
      );
    }
  }
}

function resolverBaseCatalogoOuRegra(
  regra: RegraCalculoComercialMicrofluxo,
  respostas: RespostasExecucaoMicrofluxo,
  acervo: AcervoPublicoVitrine,
): { readonly rotulo: string; readonly valorUnitario: ValorMonetarioCentavos } {
  const servico = acervo.servicos.find((s) => s.id === respostas.servicoSelecionadoId);
  if (servico && servico.precoBaseCentavos !== undefined) {
    return {
      rotulo: servico.nome,
      valorUnitario: ValorMonetarioCentavos.deCentavos(servico.precoBaseCentavos),
    };
  }

  const produto = acervo.produtos.find((p) => p.id === respostas.produtoSelecionadoId);
  if (produto && produto.precoCentavos !== undefined) {
    return {
      rotulo: produto.nome,
      valorUnitario: ValorMonetarioCentavos.deCentavos(produto.precoCentavos),
    };
  }

  return {
    rotulo: regra.rotuloBase?.trim() || "Valor base de referência",
    valorUnitario: ValorMonetarioCentavos.deCentavos(regra.valorBaseCentavos ?? 0),
  };
}

function extrairLinhasAdicionaisSelecionadas(
  microfluxo: DefinicaoMicrofluxo,
  respostas: RespostasExecucaoMicrofluxo,
): readonly LinhaDemonstrativoCalculoComercial[] {
  const linhas: LinhaDemonstrativoCalculoComercial[] = [];

  for (const etapa of microfluxo.etapas) {
    if (etapa.tipoEtapa === "etapa_livre") {
      for (const bloco of etapa.blocos ?? []) {
        if (bloco.tipo !== "escolha") continue;
        const valor =
          respostas.camposDinamicosPorEtapa?.[etapa.id]?.[bloco.id] ??
          (bloco.referenciaResumoLegada
            ? bloco.multipla
              ? respostas.opcoesMultiplasPorEtapa[etapa.id]
              : respostas.opcoesUnicasPorEtapa[etapa.id]
            : undefined);
        const ids = Array.isArray(valor) ? valor : valor === undefined ? [] : [String(valor)];
        for (const opcao of bloco.opcoes)
          if (ids.includes(opcao.id) && opcao.valorAdicionalCentavos) {
            const centavos = ValorMonetarioCentavos.deCentavos(
              opcao.valorAdicionalCentavos,
            ).obterCentavos();
            linhas.push({
              id: `${etapa.id}:${bloco.id}:${opcao.id}`,
              rotulo: opcao.rotulo,
              quantidade: 1,
              valorUnitarioCentavos: centavos,
              subtotalCentavos: centavos,
            });
          }
      }
      continue;
    }
    if (!etapa.opcoes || etapa.opcoes.length === 0) {
      continue;
    }

    if (etapa.tipoEtapa === "selecao_unica") {
      const escolhidaId = respostas.opcoesUnicasPorEtapa[etapa.id];
      const opcao = etapa.opcoes.find((o) => o.id === escolhidaId);
      if (opcao && opcao.valorAdicionalCentavos && opcao.valorAdicionalCentavos > 0) {
        const valor = ValorMonetarioCentavos.deCentavos(opcao.valorAdicionalCentavos);
        linhas.push({
          id: `${etapa.id}:${opcao.id}`,
          rotulo: opcao.rotulo,
          quantidade: 1,
          valorUnitarioCentavos: valor.obterCentavos(),
          subtotalCentavos: valor.obterCentavos(),
        });
      }
    }

    if (etapa.tipoEtapa === "selecao_multipla") {
      const escolhidasIds = respostas.opcoesMultiplasPorEtapa[etapa.id] ?? [];
      for (const idOpcao of escolhidasIds) {
        const opcao = etapa.opcoes.find((o) => o.id === idOpcao);
        if (opcao && opcao.valorAdicionalCentavos && opcao.valorAdicionalCentavos > 0) {
          const valor = ValorMonetarioCentavos.deCentavos(opcao.valorAdicionalCentavos);
          linhas.push({
            id: `${etapa.id}:${opcao.id}`,
            rotulo: opcao.rotulo,
            quantidade: 1,
            valorUnitarioCentavos: valor.obterCentavos(),
            subtotalCentavos: valor.obterCentavos(),
          });
        }
      }
    }
  }

  return linhas;
}

/**
 * Calcula de forma 100% determinística e em centavos inteiros o demonstrativo comercial
 * da execução atual do microfluxo. Retorna `null` quando a modalidade é `sem_calculo`.
 */
export function calcularDemonstrativoComercialMicrofluxo(parametros: {
  readonly microfluxo: DefinicaoMicrofluxo;
  readonly respostas: RespostasExecucaoMicrofluxo;
  readonly acervo: AcervoPublicoVitrine;
  readonly calculadoEmIso?: string;
}): DemonstrativoCalculoComercialImutavel | null {
  const { microfluxo, respostas, acervo } = parametros;
  const regra = microfluxo.regraCalculoComercial;

  if (!regra || regra.modalidade === "sem_calculo") {
    return null;
  }

  validarRegraCalculoComercial(regra);
  const calculadoEmIso = parametros.calculadoEmIso ?? new Date().toISOString();
  const versaoMicrofluxo = microfluxo.versaoPublicada ?? null;

  if (regra.modalidade === "valor_fixo") {
    const base = resolverBaseCatalogoOuRegra(regra, respostas, acervo);
    const linhaUnica: LinhaDemonstrativoCalculoComercial = Object.freeze({
      id: "item-valor-fixo",
      rotulo: base.rotulo,
      quantidade: 1,
      valorUnitarioCentavos: base.valorUnitario.obterCentavos(),
      subtotalCentavos: base.valorUnitario.obterCentavos(),
    });

    return congelarDemonstrativo({
      modalidade: "valor_fixo",
      moeda: "BRL",
      linhas: [linhaUnica],
      totalCentavos: base.valorUnitario.obterCentavos(),
      resumoFormatado: base.valorUnitario.formatarMoedaBrasileira(),
      ...(regra.observacaoTransparencia
        ? { observacaoTransparencia: regra.observacaoTransparencia }
        : {}),
      versaoMicrofluxo,
      calculadoEmIso,
    });
  }

  if (regra.modalidade === "base_mais_adicionais") {
    const base = resolverBaseCatalogoOuRegra(regra, respostas, acervo);
    const linhasAdicionais = extrairLinhasAdicionaisSelecionadas(microfluxo, respostas);

    const linhas: LinhaDemonstrativoCalculoComercial[] = [];
    if (base.valorUnitario.obterCentavos() > 0 || linhasAdicionais.length === 0) {
      linhas.push(
        Object.freeze({
          id: "item-base",
          rotulo: base.rotulo,
          quantidade: 1,
          valorUnitarioCentavos: base.valorUnitario.obterCentavos(),
          subtotalCentavos: base.valorUnitario.obterCentavos(),
        }),
      );
    }

    let somaTotal = base.valorUnitario;
    for (const adicional of linhasAdicionais) {
      linhas.push(Object.freeze({ ...adicional }));
      somaTotal = somaTotal.somar(ValorMonetarioCentavos.deCentavos(adicional.subtotalCentavos));
    }

    return congelarDemonstrativo({
      modalidade: "base_mais_adicionais",
      moeda: "BRL",
      linhas,
      totalCentavos: somaTotal.obterCentavos(),
      resumoFormatado: somaTotal.formatarMoedaBrasileira(),
      ...(regra.observacaoTransparencia
        ? { observacaoTransparencia: regra.observacaoTransparencia }
        : {}),
      versaoMicrofluxo,
      calculadoEmIso,
    });
  }

  if (regra.modalidade === "quantidade_vezes_preco") {
    const base = resolverBaseCatalogoOuRegra(regra, respostas, acervo);
    const minQtd = regra.quantidadeMinima ?? 1;
    const maxQtd = regra.quantidadeMaxima ?? 1000;
    const qtdInformada = respostas.quantidadeComercial ?? minQtd;
    const quantidadeSegura = Math.min(Math.max(Math.trunc(qtdInformada), minQtd), maxQtd);

    const total = base.valorUnitario.multiplicarPorQuantidadeInteira(quantidadeSegura);
    const rotuloUnidade = regra.unidadeQuantidade?.trim()
      ? `${base.rotulo} (${quantidadeSegura} ${regra.unidadeQuantidade.trim()})`
      : base.rotulo;

    const linhaQuantidade: LinhaDemonstrativoCalculoComercial = Object.freeze({
      id: "item-quantidade-preco",
      rotulo: rotuloUnidade,
      quantidade: quantidadeSegura,
      valorUnitarioCentavos: base.valorUnitario.obterCentavos(),
      subtotalCentavos: total.obterCentavos(),
    });

    return congelarDemonstrativo({
      modalidade: "quantidade_vezes_preco",
      moeda: "BRL",
      linhas: [linhaQuantidade],
      totalCentavos: total.obterCentavos(),
      resumoFormatado: total.formatarMoedaBrasileira(),
      ...(regra.observacaoTransparencia
        ? { observacaoTransparencia: regra.observacaoTransparencia }
        : {}),
      versaoMicrofluxo,
      calculadoEmIso,
    });
  }

  // Modalidade: "faixa_configurada"
  const minimoBase = ValorMonetarioCentavos.deCentavos(regra.minimoFaixaCentavos ?? 0);
  const maximoBase = ValorMonetarioCentavos.deCentavos(regra.maximoFaixaCentavos ?? 0);
  const linhasAdicionais = extrairLinhasAdicionaisSelecionadas(microfluxo, respostas);

  let somaAdicionais = ValorMonetarioCentavos.zero();
  for (const item of linhasAdicionais) {
    somaAdicionais = somaAdicionais.somar(ValorMonetarioCentavos.deCentavos(item.subtotalCentavos));
  }

  const minimoFinal = minimoBase.somar(somaAdicionais);
  const maximoFinal = maximoBase.somar(somaAdicionais);

  const linhaFaixa: LinhaDemonstrativoCalculoComercial = Object.freeze({
    id: "item-faixa-base",
    rotulo: regra.rotuloBase?.trim() || "Faixa estimada para o escopo",
    quantidade: 1,
    valorUnitarioCentavos: minimoBase.obterCentavos(),
    subtotalCentavos: maximoBase.obterCentavos(),
  });

  const resumoFaixa = minimoFinal.igualA(maximoFinal)
    ? minimoFinal.formatarMoedaBrasileira()
    : `De ${minimoFinal.formatarMoedaBrasileira()} a ${maximoFinal.formatarMoedaBrasileira()}`;

  return congelarDemonstrativo({
    modalidade: "faixa_configurada",
    moeda: "BRL",
    linhas: [linhaFaixa, ...linhasAdicionais.map((l) => Object.freeze({ ...l }))],
    minimoCentavos: minimoFinal.obterCentavos(),
    maximoCentavos: maximoFinal.obterCentavos(),
    resumoFormatado: resumoFaixa,
    ...(regra.observacaoTransparencia
      ? { observacaoTransparencia: regra.observacaoTransparencia }
      : {}),
    versaoMicrofluxo,
    calculadoEmIso,
  });
}

function congelarDemonstrativo(
  demonstrativo: DemonstrativoCalculoComercialImutavel,
): DemonstrativoCalculoComercialImutavel {
  Object.freeze(demonstrativo.linhas);
  return Object.freeze(demonstrativo);
}
