import type { ItemAcaoHome } from "@/dominio/entidades/paginaPublicada";

export interface ContextoColaboradorAcao {
  readonly nomeCompleto: string;
  readonly primeiroNome: string;
  readonly cargoOuEspecialidade?: string;
  readonly whatsapp?: string;
  readonly nomeOrganizacao: string;
}

function interpolarVariaveis(texto: string, contexto: ContextoColaboradorAcao): string {
  return texto
    .replace(/\{nome\}/gi, contexto.nomeCompleto)
    .replace(/\{primeiroNome\}/gi, contexto.primeiroNome)
    .replace(/\{cargo\}/gi, contexto.cargoOuEspecialidade ?? "")
    .replace(/\{empresa\}/gi, contexto.nomeOrganizacao)
    .replace(/\{organizacao\}/gi, contexto.nomeOrganizacao);
}

/**
 * Deriva a apresentação contextualizada de uma ação comercial para exibição no Cartão Digital
 * do colaborador, respeitando os princípios SOLID (SRP e OCP):
 * 1. Prioriza configurações explícitas definidas na entidade (rotuloCartaoOpcional / subtituloCartaoOpcional).
 * 2. Quando não houver sobrescrita explícita, aplica heurísticas semânticas limpas e agnósticas de domínio.
 * 3. Mantém compatibilidade integral com qualquer empresa, mantendo intactos o id, destino e tipo de ação.
 */
export function contextualizarAcaoParaCartao(
  acao: ItemAcaoHome,
  contexto: ContextoColaboradorAcao,
): ItemAcaoHome {
  // 1. Sobrescritas explícitas configuradas pelo gestor
  if (acao.rotuloCartaoOpcional || acao.subtituloCartaoOpcional) {
    return {
      ...acao,
      rotulo: acao.rotuloCartaoOpcional
        ? interpolarVariaveis(acao.rotuloCartaoOpcional, contexto)
        : acao.rotulo,
      subtituloDiscreto: acao.subtituloCartaoOpcional
        ? interpolarVariaveis(acao.subtituloCartaoOpcional, contexto)
        : acao.subtituloDiscreto,
    };
  }

  const combinacaoTexto =
    `${acao.rotulo} ${acao.subtituloDiscreto ?? ""} ${acao.destino}`.toLowerCase();

  // 2. Falar com equipe / consultores -> Orientado ao relacionamento direto com o colaborador
  if (
    acao.tipoDestino === "secao_equipe" ||
    acao.destino === "#equipe" ||
    /falar com (consultor|equipe|nossa equipe|vendedor)/i.test(combinacaoTexto)
  ) {
    return {
      ...acao,
      rotulo: "Falar comigo no WhatsApp",
      subtituloDiscreto: `Atendimento direto com ${contexto.nomeCompleto}`,
    };
  }

  // 3. Simulação de financiamento
  if (/simular|financiamento|taxa/i.test(combinacaoTexto)) {
    return {
      ...acao,
      rotulo: acao.rotulo,
      subtituloDiscreto: "Faça uma simulação com meu atendimento",
    };
  }

  // 4. Avaliação de veículo / usado / troca
  if (/usado|carro|avalia|troco/i.test(combinacaoTexto)) {
    return {
      ...acao,
      rotulo: acao.rotulo,
      subtituloDiscreto: "Envie os dados do seu carro para avaliação",
    };
  }

  // 5. Cotação de seguro / descoberta
  if (/seguro|cotar|cotação/i.test(combinacaoTexto)) {
    return {
      ...acao,
      rotulo: acao.rotulo,
      subtituloDiscreto: "Solicite uma cotação de seguro",
    };
  }

  // 6. Catálogo / Estoque da empresa
  if (
    acao.tipoDestino === "secao_portfolio" ||
    acao.destino === "#portfolio" ||
    (acao.tipoDestino === "link_externo" && /estoque|site|portal/i.test(combinacaoTexto))
  ) {
    return {
      ...acao,
      rotulo: "Ver estoque completo",
      subtituloDiscreto: `Confira os veículos da ${contexto.nomeOrganizacao}`,
    };
  }

  // 7. Fallback seguro: preserva os textos originais sem forçar personalizações artificiais
  return acao;
}

/**
 * Mapeia todas as ações visíveis da organização adaptando-as para o contexto do cartão VIP.
 */
export function contextualizarAcoesParaCartao(
  acoes: readonly ItemAcaoHome[],
  contexto: ContextoColaboradorAcao,
): readonly ItemAcaoHome[] {
  return acoes.map((acao) => contextualizarAcaoParaCartao(acao, contexto));
}
