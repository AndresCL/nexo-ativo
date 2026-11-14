import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import type {
  ClaimsPlataforma,
  RegistroAuditoria,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";

export interface ParametrosProvisionarFundador {
  readonly uidAlvo: string;
  readonly atorUsuarioId: string;
  readonly origemOperacao: "cli_administrativo" | "painel_fundador";
}

/**
 * Define a Custom Claim exclusiva { papelPlataforma: "fundador" } de forma segura e auditada.
 * Jamais armazena listas de organizações ou dados volumosos no token JWT.
 */
export async function atribuirPrivilegioFundadorAuditado(
  autenticacaoAdmin: Auth,
  bancoDadosAdmin: Firestore,
  parametros: ParametrosProvisionarFundador,
): Promise<void> {
  const uidLimpo = parametros.uidAlvo.trim();
  if (!uidLimpo) {
    throw new ErroValidacaoDominio("Informe o UID válido do usuário a ser provisionado.");
  }

  const usuarioAlvo = await autenticacaoAdmin.getUser(uidLimpo);
  const novasClaims: ClaimsPlataforma = {
    papelPlataforma: "fundador",
  };

  await autenticacaoAdmin.setCustomUserClaims(usuarioAlvo.uid, novasClaims);

  const referenciaAuditoria = bancoDadosAdmin.collection("registrosAuditoria").doc();
  const registro: RegistroAuditoria = {
    id: referenciaAuditoria.id,
    acao: "ATRIBUIR_PRIVILEGIO_FUNDADOR",
    atorUsuarioId: parametros.atorUsuarioId,
    usuarioAlvoId: usuarioAlvo.uid,
    detalhes: {
      origemOperacao: parametros.origemOperacao,
      emailUsuarioAlvo: usuarioAlvo.email ?? "sem-email",
    },
    criadoEmIso: new Date().toISOString(),
  };

  await referenciaAuditoria.set(registro);
}
