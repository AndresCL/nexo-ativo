import { redirect } from "next/navigation";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoCatalogoOrganizacaoServidor } from "@/infraestrutura/painel/leitorCatalogoOrganizacaoServidor";
import { GerenciadorVideosPainel } from "@/componentes/painel/videos/GerenciadorVideosPainel";

export default async function PaginaVideosPainel() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoAtiva = vinculos[0];

  if (!organizacaoAtiva) {
    redirect("/painel");
  }

  const contexto = await carregarContextoCatalogoOrganizacaoServidor(
    sessao,
    organizacaoAtiva.organizacaoId,
  );

  if (!contexto) {
    redirect("/painel");
  }

  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const snapVideos = await bancoDadosAdmin
    .collection("organizacoes")
    .doc(contexto.organizacao.id)
    .collection("configuracoes")
    .doc("videos")
    .get();

  const dadosVideos = snapVideos.data() ?? {};

  return (
    <GerenciadorVideosPainel
      organizacaoId={contexto.organizacao.id}
      identificadorPublico={contexto.organizacao.identificadorPublico}
      versaoPublicadaInicial={contexto.versaoPublicadaAtual}
      podePublicarPagina={contexto.podePublicarPagina}
      videosIniciais={Array.isArray(dadosVideos.videos) ? dadosVideos.videos : []}
      modoExibicaoInicial={dadosVideos.modoExibicaoVideos === "fila" ? "fila" : "carrossel"}
      autoplayInicial={Boolean(dadosVideos.autoplayVideos)}
      ocultarTituloInicial={Boolean(dadosVideos.ocultarTituloVideos)}
    />
  );
}

