import { redirect } from "next/navigation";
import { ProvedorEstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoEditorOrganizacaoServidor } from "@/infraestrutura/painel/leitorPainelOrganizacaoServidor";
import { EditorGuiadoAparencia } from "@/componentes/painel/editor/EditorGuiadoAparencia";
import { carregarPreviaVitrineServidor } from "@/infraestrutura/painel/leitorPreviaVitrineServidor";

export default async function PaginaEditorAparenciaPainel() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoAtiva = vinculos[0];

  if (!organizacaoAtiva) {
    redirect("/painel");
  }

  const contexto = await carregarContextoEditorOrganizacaoServidor(
    sessao,
    organizacaoAtiva.organizacaoId,
  );

  if (!contexto) {
    redirect("/painel");
  }

  const previa = await carregarPreviaVitrineServidor(contexto);

  return (
    <ProvedorEstadoEditorAparencia
      dadosIniciais={{
        rascunhoInicial: contexto.rascunho,
        versaoPublicadaInicial: contexto.versaoPublicadaAtual,
        ultimoPublicadoEmIsoInicial: contexto.ultimoPublicadoEmIso,
      }}
    >
      <EditorGuiadoAparencia
        acervo={previa.acervo}
        previaEquipe={previa.previaEquipe}
        microfluxos={previa.microfluxos}
        identificadorPublico={contexto.organizacao.identificadorPublico}
        nomeOrganizacao={contexto.organizacao.nome}
        emailVerificado={sessao.emailVerificado}
        podeEditarAparencia={contexto.podeEditarAparencia}
        podePublicarPagina={contexto.podePublicarPagina}
      />
    </ProvedorEstadoEditorAparencia>
  );
}
