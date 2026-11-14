import { obterAdminFuncoes } from "../seguranca/adminInicializado";
import { atribuirPrivilegioFundadorAuditado } from "../casos-de-uso/provisionarFundadorPlataforma";

/**
 * Utilitário administrativo executado exclusivamente fora do navegador (via CLI autenticada
 * com credenciais administrativas do projeto Firebase ou emulador local) para provisionar
 * a primeira conta com privilégio global de fundador.
 *
 * Uso: node --import tsx src/scripts/provisionarFundadorCli.ts <email-ou-uid>
 */
async function executarProvisionamentoCli(): Promise<void> {
  const argumentoAlvo = process.argv[2]?.trim();

  if (!argumentoAlvo) {
    console.error("Uso obrigatório: informe o e-mail ou UID do usuário fundador.");
    process.exit(1);
  }

  const { autenticacao, bancoDados } = obterAdminFuncoes();

  const registroUsuario = argumentoAlvo.includes("@")
    ? await autenticacao.getUserByEmail(argumentoAlvo)
    : await autenticacao.getUser(argumentoAlvo);

  await atribuirPrivilegioFundadorAuditado(autenticacao, bancoDados, {
    uidAlvo: registroUsuario.uid,
    atorUsuarioId: `bootstrap-cli:${registroUsuario.uid}`,
    origemOperacao: "cli_administrativo",
  });

  console.info(
    `Privilégio "fundador" atribuído com sucesso ao usuário ${registroUsuario.uid} (${registroUsuario.email ?? "sem-email"}). Peça ao usuário que renove a sessão no navegador.`,
  );
}

void executarProvisionamentoCli();
