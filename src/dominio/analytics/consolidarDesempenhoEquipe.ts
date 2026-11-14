import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import type {
  MetricaCartaoProfissional,
  MetricaGranularProfissional,
} from "./tiposMetricasAgregadas";

export interface DesempenhoMembroEquipe {
  readonly id: string;
  readonly nome: string;
  readonly cargo: string;
  readonly identificadorCartao: string;
  readonly avatarUrl?: string;
  readonly visualizacoes: number;
  readonly cliquesAcoes: number;
  readonly fluxos: number;
  readonly contatos: number;
  readonly acoesPorVisita: number | null;
}

export function consolidarDesempenhoEquipe(
  profissionais: readonly ProfissionalEquipe[],
  metricasPorCartao: readonly MetricaCartaoProfissional[],
  metricasPorProfissional: readonly MetricaGranularProfissional[],
): readonly DesempenhoMembroEquipe[] {
  const porIdentificadorCartao = new Map(
    profissionais.map((profissional) => [profissional.identificadorCartao, profissional.id]),
  );
  const membros = new Map<string, Omit<DesempenhoMembroEquipe, "acoesPorVisita">>(
    profissionais.map((profissional) => [
      profissional.id,
      {
        id: profissional.id,
        nome: profissional.nomeCompleto,
        cargo: profissional.cargoOuEspecialidade || "Consultor Comercial",
        identificadorCartao: profissional.identificadorCartao || profissional.id,
        avatarUrl: profissional.urlFotoPerfil,
        visualizacoes: 0,
        cliquesAcoes: 0,
        fluxos: 0,
        contatos: 0,
      },
    ]),
  );

  function encontrarMembro(id: string) {
    return membros.get(id) ?? membros.get(porIdentificadorCartao.get(id) ?? "");
  }

  for (const cartao of metricasPorCartao) {
    const membro = encontrarMembro(cartao.id);
    if (!membro) continue;
    membros.set(membro.id, {
      ...membro,
      visualizacoes: membro.visualizacoes + cartao.visualizacoes,
      cliquesAcoes: membro.cliquesAcoes + cartao.cliquesAcoesHome,
      fluxos: membro.fluxos + cartao.fluxosIniciados,
      contatos: membro.contatos + cartao.contatosWhatsapp,
    });
  }

  for (const profissional of metricasPorProfissional) {
    const membro = encontrarMembro(profissional.id);
    if (!membro) continue;
    // O contador genérico de contatos inclui o mesmo WhatsApp atribuído ao cartão
    // e também ligações. Ele não compõe a coluna de WhatsApp dos cartões.
    membros.set(membro.id, {
      ...membro,
      fluxos: membro.fluxos + profissional.solicitacoes,
    });
  }

  return Array.from(membros.values())
    .map((membro) => ({
      ...membro,
      // Cliques são eventos, não visitantes únicos; a média pode ser maior que 1.
      acoesPorVisita:
        membro.visualizacoes > 0
          ? (membro.contatos + membro.cliquesAcoes) / membro.visualizacoes
          : null,
    }))
    .sort((a, b) => b.contatos - a.contatos || b.visualizacoes - a.visualizacoes);
}
