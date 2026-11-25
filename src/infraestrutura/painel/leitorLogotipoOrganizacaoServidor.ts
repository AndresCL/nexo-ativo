import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

/** Lê a URL do logotipo configurado no rascunho da vitrine; qualquer falha retorna null. */
export async function carregarLogotipoOrganizacaoServidor(
  organizacaoId: string,
): Promise<string | null> {
  try {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const doc = await bancoDadosAdmin
      .collection("organizacoes")
      .doc(organizacaoId)
      .collection("configuracaoPagina")
      .doc("rascunho")
      .get();

    const dados = doc.data() as { identidade?: { urlLogotipoOpcional?: unknown } } | undefined;
    const url = dados?.identidade?.urlLogotipoOpcional;
    return typeof url === "string" && url.trim().length > 0 ? url.trim() : null;
  } catch {
    return null;
  }
}

