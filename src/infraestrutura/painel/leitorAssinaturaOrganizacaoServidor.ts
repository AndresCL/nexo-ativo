import type {
  CobrancaHistoricoAsaas,
  RegistroAssinaturaAsaas,
} from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { verificarPermissaoOrganizacao } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

export interface ContextoAssinaturaOrganizacaoServidor {
  readonly organizacao: Organizacao;
  readonly membro: MembroOrganizacao | null;
  readonly assinatura: RegistroAssinaturaAsaas | null;
  readonly cobrancas: readonly CobrancaHistoricoAsaas[];
  readonly podeGerenciarAssinatura: boolean;
}

export async function carregarContextoAssinaturaOrganizacaoServidor(
  usuario: UsuarioAutenticado,
  organizacaoId: string,
): Promise<ContextoAssinaturaOrganizacaoServidor | null> {
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const refOrg = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const refMembro = refOrg.collection("membros").doc(usuario.uid);
  const refAssinatura = bancoDadosAdmin.collection("assinaturas").doc(organizacaoId);
  const refCobrancas = refOrg.collection("cobrancasAsaas");

  const [docOrg, docMembro, docAssinatura, snapCobrancas] = await Promise.all([
    refOrg.get(),
    refMembro.get(),
    refAssinatura.get(),
    refCobrancas.get(),
  ]);

  if (!docOrg.exists) {
    return null;
  }

  const organizacao = docOrg.data() as Organizacao;
  const membro = docMembro.exists ? (docMembro.data() as MembroOrganizacao) : null;

  if (!verificarPermissaoOrganizacao(usuario, organizacao, membro, "visualizar_painel")) {
    return null;
  }

  const assinatura = docAssinatura.exists
    ? (docAssinatura.data() as RegistroAssinaturaAsaas)
    : null;

  const cobrancas: CobrancaHistoricoAsaas[] = [];
  for (const doc of snapCobrancas.docs) {
    cobrancas.push(doc.data() as CobrancaHistoricoAsaas);
  }
  cobrancas.sort((a, b) => b.dataVencimentoIso.localeCompare(a.dataVencimentoIso));

  const podeGerenciarAssinatura = verificarPermissaoOrganizacao(
    usuario,
    organizacao,
    membro,
    "gerenciar_assinatura",
  );

  return {
    organizacao,
    membro,
    assinatura,
    cobrancas,
    podeGerenciarAssinatura,
  };
}
