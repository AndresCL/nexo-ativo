import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoCatalogoOrganizacaoServidor } from "@/infraestrutura/painel/leitorCatalogoOrganizacaoServidor";
import { CentralQrCodesPainel } from "@/componentes/painel/catalogo/CentralQrCodesPainel";

export default async function PaginaQrCodesPainel() {
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

  return (
    <CentralQrCodesPainel
      identificadorPublico={contexto.organizacao.identificadorPublico}
      profissionais={contexto.profissionais}
      microfluxos={contexto.microfluxos}
    />
  );
}

