import type { PoliticaPublicidade } from "./tiposPerfilPublicidade";

export const politicaPadrao: PoliticaPublicidade = {
  codigo: "padrao",
  rotulo: "Padrão (sem restrições)",
  exibeAvaliacoesGoogle: () => true,
  exibePrecoServico: () => true,
  exibePrecoProduto: () => true,
  permiteCalculoComercial: () => true,
  permiteEtapaPixManual: () => true,
  permiteEtapasComProdutos: () => true,
  avisos: () => [],
};
