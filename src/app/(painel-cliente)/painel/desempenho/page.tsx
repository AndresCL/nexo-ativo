import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoDesempenhoOrganizacaoServidor } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";
import { PainelDesempenhoPrincipal } from "@/componentes/painel/desempenho/PainelDesempenhoPrincipal";

export default async function PaginaDesempenhoPainel() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoAtiva = vinculos[0];

  if (!organizacaoAtiva) {
    redirect("/painel");
  }

  const contexto = await carregarContextoDesempenhoOrganizacaoServidor(
    sessao,
    organizacaoAtiva.organizacaoId,
  );

  if (!contexto) {
    redirect("/painel");
  }

  return (
    <PainelDesempenhoPrincipal
      organizacao={contexto.organizacao}
      resumoMetricas={contexto.resumoMetricas}
      profissionais={contexto.profissionais}
      experiencias={contexto.experiencias}
    />
  );
}
