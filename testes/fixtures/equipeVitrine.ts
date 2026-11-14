import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import type { ItemAcaoHome } from "@/dominio/entidades/paginaPublicada";

export function criarEquipeTeste(
  quantidade: number,
  organizacaoId = "org-equipe",
): ProfissionalEquipe[] {
  return Array.from({ length: quantidade }, (_, indice) => ({
    id: `prof-${indice}`,
    organizacaoId,
    identificadorCartao: `pessoa-${indice}`,
    nomeCompleto: `Pessoa ${indice} Silva`,
    cargoOuEspecialidade: "Consultoria",
    minibiografia: "Atendimento especializado.",
    pontoFocalFoto: { xPercentual: 50, yPercentual: 50 },
    aceitaSolicitacoesDiretas: true,
    ordemExibicao: indice,
    ativo: true,
    atualizadoEmIso: "2026-11-12T12:00:00.000Z",
  }));
}

export const ACAO_EQUIPE_TESTE: ItemAcaoHome = {
  id: "acao-equipe",
  rotulo: "Converse com nossa equipe",
  tipoDestino: "secao_equipe",
  destino: "#equipe",
};
