import type { PoliticaPublicidade } from "./tiposPerfilPublicidade";

/**
 * Perfil para odontologia (CFO). As regras devem ser validadas por profissional da área
 * antes do lançamento e podem evoluir sem afetar os demais perfis.
 */
export const politicaOdontologiaCfo: PoliticaPublicidade = {
  codigo: "odontologia_cfo",
  rotulo: "Odontologia (CFO)",
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
        "Odontologia (CFO): imagens de “antes e depois” e garantias de resultado podem ser vedadas. Confira as regras do CFO antes de publicar o portfólio.",
    },
    {
      area: "texto_livre",
      mensagem:
        "Odontologia (CFO): evite promessas de resultado, promoções e depoimentos de pacientes nos textos. Confira as regras do CFO.",
    },
  ],
};
