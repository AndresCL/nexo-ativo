import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import type { CodigoPerfilPublicidade } from "@/dominio/publicidade/tiposPerfilPublicidade";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

/** Lê o perfil de publicidade da organização; qualquer falha equivale ao perfil padrão. */
export async function carregarPerfilPublicidadeOrganizacaoServidor(
  organizacaoId: string,
): Promise<CodigoPerfilPublicidade> {
  try {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const doc = await bancoDadosAdmin.collection("organizacoes").doc(organizacaoId).get();
    return obterPoliticaPublicidade(doc.data()?.perfilPublicidade).codigo;
  } catch {
    return "padrao";
  }
}
