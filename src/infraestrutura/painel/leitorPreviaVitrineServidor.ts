import { criarPreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { montarAcervoVitrineDeDocumentos } from "@/infraestrutura/vitrine/montadorAcervoVitrineFirestore";
import type { ContextoEditorOrganizacaoServidor } from "./leitorPainelOrganizacaoServidor";

/** Recebe o contexto autorizado pela página do editor; não atende a consultas públicas. */
export async function carregarPreviaVitrineServidor(contexto: ContextoEditorOrganizacaoServidor) {
  const organizacaoId = contexto.organizacao.id;
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const organizacao = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const [servicos, produtos, projetosPortfolio, equipe, experiencias, docVideos] = await Promise.all([
    organizacao.collection("servicos").get(),
    organizacao.collection("produtos").get(),
    organizacao.collection("projetosPortfolio").get(),
    organizacao.collection("profissionais").get(),
    organizacao.collection("microfluxos").get(),
    organizacao.collection("configuracoes").doc("videos").get(),
  ]);

  const acervo = montarAcervoVitrineDeDocumentos({
    organizacaoId,
    servicos: servicos.docs,
    produtos: produtos.docs,
    projetosPortfolio: projetosPortfolio.docs,
    profissionais: equipe.docs,
    microfluxos: experiencias.docs,
    dadosVideos: docVideos.data(),
  });

  return {
    acervo,
    previaEquipe: criarPreviaEquipeVitrine(acervo.profissionais, organizacaoId),
    microfluxos: acervo.microfluxos,
  };
}
