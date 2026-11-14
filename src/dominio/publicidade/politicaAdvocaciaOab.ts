import type { PoliticaPublicidade } from "./tiposPerfilPublicidade";

/**
 * Perfil para advocacia (OAB). As regras devem ser validadas por profissional da área
 * antes do lançamento e podem evoluir sem afetar os demais perfis.
 */
export const politicaAdvocaciaOab: PoliticaPublicidade = {
  codigo: "advocacia_oab",
  rotulo: "Advocacia (OAB)",
  exibeAvaliacoesGoogle: () => false,
  exibePrecoServico: () => false,
  exibePrecoProduto: () => false,
  permiteCalculoComercial: () => false,
  permiteEtapaPixManual: () => false,
  permiteEtapasComProdutos: () => false,
  avisos: () => [
    {
      area: "texto_livre",
      mensagem:
        "Advocacia (OAB): evite promessas de resultado, captação de clientela e linguagem promocional nos textos. Confira as regras de publicidade da OAB.",
    },
  ],
};
