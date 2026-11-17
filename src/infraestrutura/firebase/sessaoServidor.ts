import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  PapelOrganizacao,
  PapelPlataforma,
  SituacaoMembroOrganizacao,
  UsuarioAutenticado,
  VinculoOrganizacaoUsuario,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "./adminFirebase";

export const NOME_COOKIE_SESSAO = "fluxo_sessao";
export const NOME_COOKIE_ORGANIZACAO_FUNDADOR = "nexo_org_fundador";
export const DURACAO_COOKIE_SESSAO_SEGUNDOS = 60 * 60 * 24 * 5; // 5 dias
export const DURACAO_COOKIE_SESSAO_MS = DURACAO_COOKIE_SESSAO_SEGUNDOS * 1000;

export async function emitirCookieSessaoHttpOnly(idToken: string): Promise<string> {
  const { autenticacaoAdmin } = obterServicosAdminFirebase();
  await autenticacaoAdmin.verifyIdToken(idToken);
  return autenticacaoAdmin.createSessionCookie(idToken, {
    expiresIn: DURACAO_COOKIE_SESSAO_MS,
  });
}

export async function obterSessaoAutenticadaServidor(): Promise<UsuarioAutenticado | null> {
  const gerenciadorCookies = await cookies();
  const valorCookie = gerenciadorCookies.get(NOME_COOKIE_SESSAO)?.value;

  if (!valorCookie) {
    return null;
  }

  try {
    const { autenticacaoAdmin } = obterServicosAdminFirebase();
    const tokenDecodificado = await autenticacaoAdmin.verifySessionCookie(valorCookie, true);
    const papelBruto = tokenDecodificado.papelPlataforma;
    const papelPlataforma: PapelPlataforma | undefined =
      papelBruto === "fundador" ? "fundador" : undefined;

    const provedorPrincipal = tokenDecodificado.firebase?.sign_in_provider;

    return {
      uid: tokenDecodificado.uid,
      email: tokenDecodificado.email ?? null,
      nomeExibicao: (tokenDecodificado.name as string | undefined) ?? null,
      fotoUrl: tokenDecodificado.picture ?? null,
      emailVerificado: Boolean(tokenDecodificado.email_verified),
      ...(papelPlataforma ? { papelPlataforma } : {}),
      provedoresConectados: provedorPrincipal ? [provedorPrincipal] : [],
    };
  } catch {
    return null;
  }
}

export async function exigirSessaoAutenticadaServidor(): Promise<UsuarioAutenticado> {
  const sessao = await obterSessaoAutenticadaServidor();

  if (!sessao) {
    redirect("/entrar");
  }

  return sessao;
}

export async function exigirSessaoFundadorServidor(): Promise<UsuarioAutenticado> {
  const sessao = await obterSessaoAutenticadaServidor();

  if (!sessao) {
    redirect("/entrar");
  }

  if (!verificarPrivilegioFundador(sessao)) {
    redirect("/painel");
  }

  return sessao;
}

export async function listarVinculosOrganizacaoServidor(
  uid: string,
): Promise<VinculoOrganizacaoUsuario[]> {
  try {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const gerenciadorCookies = await cookies();
    const orgIdSelecionadaFundador = gerenciadorCookies
      .get(NOME_COOKIE_ORGANIZACAO_FUNDADOR)
      ?.value?.trim();

    if (orgIdSelecionadaFundador && !orgIdSelecionadaFundador.includes("/")) {
      const sessaoAtual = await obterSessaoAutenticadaServidor();
      if (sessaoAtual && sessaoAtual.uid === uid && verificarPrivilegioFundador(sessaoAtual)) {
        const docOrgAlvo = await bancoDadosAdmin
          .collection("organizacoes")
          .doc(orgIdSelecionadaFundador)
          .get();

        if (docOrgAlvo.exists) {
          const dadosOrg = docOrgAlvo.data();
          const vinculoFundadorSuperadmin: VinculoOrganizacaoUsuario = {
            organizacaoId: docOrgAlvo.id,
            nomeOrganizacao: String(dadosOrg?.nome ?? ""),
            identificadorPublico: String(dadosOrg?.identificadorPublico ?? ""),
            papel: "proprietario",
            situacao: "ativo",
          };
          return [vinculoFundadorSuperadmin];
        }
      }
    }

    const consulta = await bancoDadosAdmin
      .collection("usuarios")
      .doc(uid)
      .collection("vinculosOrganizacao")
      .where("situacao", "==", "ativo")
      .get();

    return consulta.docs.map((documento) => {
      const dados = documento.data();
      return {
        organizacaoId: documento.id,
        nomeOrganizacao: String(dados.nomeOrganizacao ?? ""),
        identificadorPublico: String(dados.identificadorPublico ?? ""),
        papel: (dados.papel as PapelOrganizacao | undefined) ?? "membro",
        situacao: (dados.situacao as SituacaoMembroOrganizacao | undefined) ?? "ativo",
      };
    });
  } catch {
    return [];
  }
}
