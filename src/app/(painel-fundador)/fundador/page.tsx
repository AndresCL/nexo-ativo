import { exigirSessaoFundadorServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoPainelFundadorServidor } from "@/infraestrutura/fundador/leitorPainelFundadorServidor";
import { PainelFundadorPrincipal } from "@/componentes/fundador/PainelFundadorPrincipal";

export default async function PaginaInicialFundador() {
  const fundador = await exigirSessaoFundadorServidor();
  const contexto = await carregarContextoPainelFundadorServidor(fundador);

  return (
    <PainelFundadorPrincipal
      metricasIniciais={contexto.metricas}
      organizacoesIniciais={contexto.organizacoes}
      auditoriaInicial={contexto.auditoriaRecente}
    />
  );
}
