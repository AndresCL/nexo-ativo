import { redirect } from "next/navigation";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoAgendaOrganizacaoServidor } from "@/infraestrutura/painel/leitorAgendaOrganizacaoServidor";
import { GerenciadorAgendaPainel } from "@/componentes/painel/agenda/GerenciadorAgendaPainel";

export default async function PaginaAgendaPainel() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoAtiva = vinculos[0];

  if (!organizacaoAtiva) {
    redirect("/painel");
  }

  const contexto = await carregarContextoAgendaOrganizacaoServidor(
    sessao,
    organizacaoAtiva.organizacaoId,
  );

  if (!contexto) {
    redirect("/painel");
  }

  return (
    <GerenciadorAgendaPainel
      organizacaoId={contexto.organizacao.id}
      configuracaoInicial={contexto.configuracaoAgenda}
      agendamentosIniciais={contexto.agendamentos}
      possuiExperienciaAgendaAtiva={contexto.possuiExperienciaAgendaAtiva}
      podeGerenciarAgenda={contexto.podeGerenciarAgenda}
      podeEditarDisponibilidade={contexto.podeEditarDisponibilidade}
    />
  );
}

