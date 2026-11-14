import type { PoliticaPublicidade } from "./tiposPerfilPublicidade";

/**
 * Perfil para medicina (CFM). As regras devem ser validadas por profissional da área
 * antes do lançamento e podem evoluir sem afetar os demais perfis.
 */
export const politicaMedicinaCfm: PoliticaPublicidade = {
  codigo: "medicina_cfm",
  rotulo: "Medicina (CFM)",
  exibeAvaliacoesGoogle: () => false,
  exibePrecoServico: () => false,
  exibePrecoProduto: () => false,
  permiteCalculoComercial: () => false,
  permiteEtapaPixManual: () => false,
  permiteEtapasComProdutos: () => false,
  avisos: () => [
    {
      area: "portfolio",
      mensagem:
        "Medicina (CFM): imagens de “antes e depois” e garantias de resultado podem ser vedadas. Confira as regras do CFM antes de publicar o portfólio.",
    },
    {
      area: "texto_livre",
      mensagem:
        "Medicina (CFM): evite promessas de resultado, promoções e depoimentos de pacientes nos textos. Confira as regras do CFM.",
    },
  ],
};
