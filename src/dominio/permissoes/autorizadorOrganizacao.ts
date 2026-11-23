import type {
  MembroOrganizacao,
  Organizacao,
  PapelOrganizacao,
  UsuarioAutenticado,
} from "../entidades/autenticacaoEOrganizacao";
import { ErroAcessoNegado, ErroNaoAutenticado } from "../erros/errosDominio";

export type OperacaoOrganizacao =
  | "visualizar_painel"
  | "editar_aparencia_e_conteudo"
  | "publicar_pagina"
  | "gerenciar_solicitacoes"
  | "gerenciar_agenda"
  | "gerenciar_equipe"
  | "gerenciar_membros_administrativos"
  | "gerenciar_assinatura";

const PAPEIS_PERMITIDOS_POR_OPERACAO: Readonly<
  Record<OperacaoOrganizacao, readonly PapelOrganizacao[]>
> = {
  visualizar_painel: ["proprietario", "administrador", "membro"],
  editar_aparencia_e_conteudo: ["proprietario", "administrador"],
  publicar_pagina: ["proprietario", "administrador"],
  gerenciar_solicitacoes: ["proprietario", "administrador", "membro"],
  gerenciar_agenda: ["proprietario", "administrador", "membro"],
  gerenciar_equipe: ["proprietario", "administrador"],
  gerenciar_membros_administrativos: ["proprietario"],
  gerenciar_assinatura: ["proprietario"],
};

const OPERACOES_QUE_EXIGEM_EMAIL_VERIFICADO: ReadonlySet<OperacaoOrganizacao> = new Set([
  "publicar_pagina",
  "gerenciar_assinatura",
]);

const OPERACOES_BLOQUEADAS_EM_INADIMPLENCIA: ReadonlySet<OperacaoOrganizacao> = new Set([
  "publicar_pagina",
]);

/**
 * Verifica se o usuário possui privilégio global administrativo de fundador da plataforma.
 */
export function verificarPrivilegioFundador(usuario: UsuarioAutenticado | null): boolean {
  return Boolean(usuario && usuario.papelPlataforma === "fundador");
}

export function exigirPrivilegioFundador(usuario: UsuarioAutenticado | null): UsuarioAutenticado {
  if (!usuario) {
    throw new ErroNaoAutenticado();
  }

  if (!verificarPrivilegioFundador(usuario)) {
    throw new ErroAcessoNegado(
      "Esta área é exclusiva da administração da plataforma.",
      "PRIVILEGIO_FUNDADOR_OBRIGATORIO",
    );
  }

  return usuario;
}

/**
 * Avalia de forma pura e determinística se um usuário autenticado pode executar
 * determinada operação sobre uma organização específica.
 */
export function verificarPermissaoOrganizacao(
  usuario: UsuarioAutenticado | null,
  organizacao: Organizacao,
  membro: MembroOrganizacao | null,
  operacao: OperacaoOrganizacao,
): boolean {
  try {
    exigirPermissaoOrganizacao(usuario, organizacao, membro, operacao);
    return true;
  } catch {
    return false;
  }
}

export function exigirPermissaoOrganizacao(
  usuario: UsuarioAutenticado | null,
  organizacao: Organizacao,
  membro: MembroOrganizacao | null,
  operacao: OperacaoOrganizacao,
): void {
  if (!usuario) {
    throw new ErroNaoAutenticado();
  }

  if (organizacao.situacao !== "ativa" && !verificarPrivilegioFundador(usuario)) {
    throw new ErroAcessoNegado(
      "Esta organização encontra-se temporariamente suspensa ou encerrada.",
      "ORGANIZACAO_INATIVA",
    );
  }

  if (verificarPrivilegioFundador(usuario)) {
    return;
  }

  if (
    !membro ||
    membro.usuarioId !== usuario.uid ||
    membro.organizacaoId !== organizacao.id ||
    membro.situacao !== "ativo"
  ) {
    throw new ErroAcessoNegado(
      "Você não possui vínculo ativo com esta organização.",
      "VINCULO_ORGANIZACAO_INEXISTENTE",
    );
  }

  const papeisPermitidos = PAPEIS_PERMITIDOS_POR_OPERACAO[operacao];
  if (!papeisPermitidos.includes(membro.papel)) {
    throw new ErroAcessoNegado(
      "Seu perfil de acesso nesta organização não permite executar esta ação.",
      "PAPEL_INSUFICIENTE",
    );
  }

  if (OPERACOES_QUE_EXIGEM_EMAIL_VERIFICADO.has(operacao) && !usuario.emailVerificado) {
    throw new ErroAcessoNegado(
      "Confirme seu endereço de e-mail antes de publicar alterações ou contratar um plano.",
      "EMAIL_NAO_VERIFICADO",
    );
  }

  const situacaoAssinatura = organizacao.resumoDireitosPlano.situacaoAssinatura;
  if (
    OPERACOES_BLOQUEADAS_EM_INADIMPLENCIA.has(operacao) &&
    (situacaoAssinatura === "inadimplente" || situacaoAssinatura === "cancelada")
  ) {
    throw new ErroAcessoNegado(
      "Regularize a assinatura da organização para publicar novas alterações.",
      "ASSINATURA_PENDENTE_REGULARIZACAO",
    );
  }
}
