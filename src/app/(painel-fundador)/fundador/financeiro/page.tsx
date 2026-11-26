import { obterAnoMesAtualSaoPaulo } from "@/dominio/fundador/tiposDespesasFundador";
import { exigirSessaoFundadorServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoPainelFundadorServidor } from "@/infraestrutura/fundador/leitorPainelFundadorServidor";
import { repositorioDespesasFundadorServidor } from "@/infraestrutura/fundador/repositorioDespesasFundadorServidor";
import { PainelFinanceiroFundador } from "@/componentes/fundador/financeiro/PainelFinanceiroFundador";

function calcularAnoMesInicioJanela(anoMesAtual: string): string {
  const [anoStr, mesStr] = anoMesAtual.split("-");
  const data = new Date(Date.UTC(Number(anoStr), Number(mesStr) - 1 - 11, 1));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function PaginaFinanceiroFundador() {
  const fundador = await exigirSessaoFundadorServidor();
  const anoMesAtual = obterAnoMesAtualSaoPaulo();
  const anoMesInicio = calcularAnoMesInicioJanela(anoMesAtual);

  const [contexto, despesasIniciais] = await Promise.all([
    carregarContextoPainelFundadorServidor(fundador),
    repositorioDespesasFundadorServidor.listarPorFaixaAnoMes(anoMesInicio),
  ]);

  return (
    <PainelFinanceiroFundador
      historicoMrrInicial={contexto.metricas.historicoMrrMensal ?? []}
      despesasIniciais={despesasIniciais}
      anoMesInicial={anoMesAtual}
      assinaturasAtivas={contexto.metricas.assinaturasAtivas}
    />
  );
}

