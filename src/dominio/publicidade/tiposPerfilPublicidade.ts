export const CODIGOS_PERFIL_PUBLICIDADE = [
  "padrao",
  "advocacia_oab",
  "medicina_cfm",
  "odontologia_cfo",
] as const;

export type CodigoPerfilPublicidade = (typeof CODIGOS_PERFIL_PUBLICIDADE)[number];

export const CODIGO_PERFIL_PUBLICIDADE_PADRAO: CodigoPerfilPublicidade = "padrao";

export function ehCodigoPerfilPublicidade(valor: unknown): valor is CodigoPerfilPublicidade {
  return (
    typeof valor === "string" && (CODIGOS_PERFIL_PUBLICIDADE as readonly string[]).includes(valor)
  );
}

/** Aviso exibido ao assinante no painel e no momento da publicação. */
export interface AvisoPublicidade {
  readonly area: "portfolio" | "texto_livre";
  readonly mensagem: string;
}

/**
 * Contrato de uma política de publicidade profissional (LSP/ISP): perguntas pequenas e
 * independentes, sem expor a estrutura interna de nenhuma política concreta.
 */
export interface PoliticaPublicidade {
  readonly codigo: CodigoPerfilPublicidade;
  readonly rotulo: string;
  exibeAvaliacoesGoogle(): boolean;
  exibePrecoServico(): boolean;
  exibePrecoProduto(): boolean;
  permiteCalculoComercial(): boolean;
  permiteEtapaPixManual(): boolean;
  permiteEtapasComProdutos(): boolean;
  avisos(): readonly AvisoPublicidade[];
}
