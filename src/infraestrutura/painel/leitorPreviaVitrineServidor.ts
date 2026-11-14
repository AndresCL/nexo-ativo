import { criarPreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { esquemaProfissionalEquipe } from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import type { ContextoEditorOrganizacaoServidor } from "./leitorPainelOrganizacaoServidor";

/** Recebe o contexto autorizado pela página do editor; não atende a consultas públicas. */
export async function carregarPreviaVitrineServidor(contexto: ContextoEditorOrganizacaoServidor) {
  const organizacaoId = contexto.organizacao.id;
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const organizacao = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const [equipe, experiencias] = await Promise.all([
    organizacao.collection("profissionais").get(),
    organizacao.collection("microfluxos").get(),
  ]);
  const profissionais = equipe.docs.flatMap((doc) => {
    const resultado = esquemaProfissionalEquipe.safeParse(doc.data());
    return resultado.success && resultado.data.organizacaoId === organizacaoId
      ? [resultado.data]
      : [];
  });
  const microfluxos = experiencias.docs.flatMap((doc) => {
    const resultado = esquemaDefinicaoMicrofluxo.safeParse(doc.data());
    return resultado.success &&
      resultado.data.ativo &&
      resultado.data.organizacaoId === organizacaoId
      ? [resultado.data]
      : [];
  });
  return { previaEquipe: criarPreviaEquipeVitrine(profissionais, organizacaoId), microfluxos };
}
