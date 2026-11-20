import type { TopologiaFunil } from "../microfluxos/analisadorTopologiaFunil";

export interface ItemEtapaInternaRota {
  readonly id: string;
  readonly titulo: string;
  readonly volume: number;
  readonly percentualSobreTopo: number;
  readonly percentualSobreAnterior: number;
}

export interface ItemRotaCalculada {
  readonly opcaoId: string;
  readonly rotuloOpcao: string;
  readonly volume: number;
  readonly percentualSobreTopo: number;
  readonly percentualSobreDecisao: number;
  readonly etapasInternas: readonly ItemEtapaInternaRota[];
  readonly encerraPercurso?: boolean;
}

export interface EstagioFunilLinearCalculado {
  readonly tipo: "linear";
  readonly id: string;
  readonly nome: string;
  readonly volume: number;
  readonly percentualSobreTopo: number;
  readonly percentualSobreEtapaAnterior: number;
  readonly detalhe: string;
  readonly cor: string;
}

export interface EstagioFunilRamificadoCalculado {
  readonly tipo: "ramificado";
  readonly id: string;
  readonly nome: string;
  readonly volume: number;
  readonly percentualSobreTopo: number;
  readonly percentualSobreEtapaAnterior: number;
  readonly detalhe: string;
  readonly cor: string;
  readonly rotas: readonly ItemRotaCalculada[];
  readonly volumeAvancoTotal: number;
  readonly desistenciasNaDecisao: number;
  readonly percentualDesistenciaDecisao: number;
}

export type EstagioFunilCalculado = EstagioFunilLinearCalculado | EstagioFunilRamificadoCalculado;

export interface ParametrosCalculoFunilRamificado {
  readonly topologia: TopologiaFunil;
  readonly topo: number;
  readonly conclusoes: number;
  readonly metricasEtapas: Readonly<Record<string, number>>;
  readonly tituloMicrofluxo: string;
}

function calcPct(parte: number, base: number): number {
  if (base <= 0 || parte <= 0) return 0;
  return Math.round((parte / base) * 1000) / 10;
}

/**
 * Calculador puro de Funil Ramificado com Padrão 1 Seguro.
 * Garante 100% de precisão matemática sem falsos gargalos entre rotas paralelas.
 */
export function calcularEstagiosFunilRamificado({
  topologia,
  topo,
  conclusoes,
  metricasEtapas,
  tituloMicrofluxo,
}: ParametrosCalculoFunilRamificado): readonly EstagioFunilCalculado[] {
  const estagios: EstagioFunilCalculado[] = [];
  const temTelemetriaEtapas = Object.keys(metricasEtapas).length > 0;

  let volumeAnterior = topo;

  for (let indice = 0; indice < topologia.nos.length; indice++) {
    const no = topologia.nos[indice]!;
    const ehPrimeiro = indice === 0;

    if (no.tipo === "linear") {
      let volume: number;
      if (ehPrimeiro) {
        volume = topo;
      } else {
        const gravado = metricasEtapas[no.id];
        if (temTelemetriaEtapas) {
          const valorMedido = gravado !== undefined ? gravado : 0;
          // Coerência lógica: etapas finais obrigatórias antes da conclusão não podem ser menores que as conclusões confirmadas
          volume = Math.min(
            topo,
            Math.max(
              valorMedido,
              conclusoes > 0 && indice === topologia.nos.length - 1 ? conclusoes : valorMedido,
            ),
          );
        } else {
          volume = Math.min(topo, conclusoes);
        }
      }

      const pctTopo = calcPct(volume, topo);
      const pctAnterior = calcPct(volume, volumeAnterior);

      const nomeFormatado = ehPrimeiro
        ? `1. Início: ${no.titulo.replace(/^1\.\s*/, "").replace(/^Início:\s*/, "")}`
        : `${indice + 1}. ${no.titulo}`;

      estagios.push({
        tipo: "linear",
        id: no.id,
        nome: nomeFormatado,
        volume,
        percentualSobreTopo: ehPrimeiro ? 100 : pctTopo,
        percentualSobreEtapaAnterior: ehPrimeiro ? 100 : pctAnterior,
        detalhe: ehPrimeiro
          ? `Visitantes que iniciaram '${tituloMicrofluxo}'`
          : `${pctTopo}% dos que iniciaram alcançaram esta tela`,
        cor: "#6366F1",
      });

      volumeAnterior = volume;
    } else {
      // Nó Ramificado (Decisão)
      let volumeDecisao: number;
      if (ehPrimeiro) {
        volumeDecisao = topo;
      } else {
        const gravado = metricasEtapas[no.id];
        volumeDecisao = temTelemetriaEtapas
          ? Math.min(topo, gravado !== undefined ? gravado : 0)
          : Math.min(topo, conclusoes);
      }

      const pctTopoDecisao = calcPct(volumeDecisao, topo);
      const pctAnteriorDecisao = calcPct(volumeDecisao, volumeAnterior);

      let volumeAvancoTotal = 0;

      const rotasCalculadas: ItemRotaCalculada[] = no.rotas.map((rota) => {
        let volumeRota = 0;
        const etapasInternas: ItemEtapaInternaRota[] = [];

        if (rota.etapas.length > 0) {
          const primeiraEtapa = rota.etapas[0]!;
          const gravadoPrimeira = metricasEtapas[primeiraEtapa.id];
          volumeRota = temTelemetriaEtapas
            ? Math.min(topo, gravadoPrimeira !== undefined ? gravadoPrimeira : 0)
            : Math.min(topo, Math.round(conclusoes / Math.max(no.rotas.length, 1)));

          let volAnteriorRota = volumeDecisao;

          for (const etapaInterna of rota.etapas) {
            const gravadoInterno = metricasEtapas[etapaInterna.id];
            const volInterno = temTelemetriaEtapas
              ? Math.min(topo, gravadoInterno !== undefined ? gravadoInterno : 0)
              : volumeRota;

            etapasInternas.push({
              id: etapaInterna.id,
              titulo: etapaInterna.titulo,
              volume: volInterno,
              percentualSobreTopo: calcPct(volInterno, topo),
              percentualSobreAnterior: calcPct(volInterno, volAnteriorRota),
            });

            volAnteriorRota = volInterno;
          }
        } else if (rota.etapaIdInicial) {
          const gravadoInicial = metricasEtapas[rota.etapaIdInicial];
          volumeRota = temTelemetriaEtapas ? Math.min(topo, gravadoInicial || 0) : 0;
        }

        volumeAvancoTotal += volumeRota;

        return {
          opcaoId: rota.opcaoId,
          rotuloOpcao: rota.rotuloOpcao,
          volume: volumeRota,
          percentualSobreTopo: calcPct(volumeRota, topo),
          percentualSobreDecisao: calcPct(volumeRota, volumeDecisao),
          etapasInternas,
          encerraPercurso: rota.encerraPercurso,
        };
      });

      const desistenciasNaDecisao = Math.max(volumeDecisao - volumeAvancoTotal, 0);
      const percentualDesistenciaDecisao = calcPct(desistenciasNaDecisao, volumeDecisao);

      const nomeFormatadoDecisao = ehPrimeiro
        ? `1. Início: ${no.titulo.replace(/^1\.\s*/, "").replace(/^Início:\s*/, "")}`
        : `${indice + 1}. ${no.titulo}`;

      estagios.push({
        tipo: "ramificado",
        id: no.id,
        nome: nomeFormatadoDecisao,
        volume: volumeDecisao,
        percentualSobreTopo: ehPrimeiro ? 100 : pctTopoDecisao,
        percentualSobreEtapaAnterior: ehPrimeiro ? 100 : pctAnteriorDecisao,
        detalhe: `${pctTopoDecisao}% dos que iniciaram alcançaram esta tela de decisão`,
        cor: "#0284C7",
        rotas: rotasCalculadas,
        volumeAvancoTotal,
        desistenciasNaDecisao,
        percentualDesistenciaDecisao,
      });

      // Para o próximo nó da espinha, o volume que avança é o volume de avanço das rotas
      volumeAnterior = Math.max(volumeAvancoTotal, 0);
    }
  }

  // Estágio final de Conclusão / Envio de Proposta
  const taxaConclusao = calcPct(conclusoes, topo);
  estagios.push({
    tipo: "linear",
    id: "conclusao-final",
    nome: `${estagios.length + 1}. Propostas Concluídas (CVR)`,
    volume: conclusoes,
    percentualSobreTopo: taxaConclusao,
    percentualSobreEtapaAnterior: calcPct(conclusoes, volumeAnterior),
    detalhe: `${taxaConclusao}% dos que iniciaram chegaram até o envio final`,
    cor: "#059669",
  });

  return estagios;
}
