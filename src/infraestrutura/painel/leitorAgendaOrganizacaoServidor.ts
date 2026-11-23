import {
  criarConfiguracaoAgendaPadrao,
  type AgendamentoAgenda,
  type ConfiguracaoAgendaOrganizacao,
} from "@/dominio/agenda/tiposAgenda";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { verificarPermissaoOrganizacao } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { esquemaConfiguracaoAgendaOrganizacao } from "@/validacoes/esquemasAgenda";

export interface ContextoAgendaOrganizacaoServidor {
  readonly organizacao: Organizacao;
  readonly membro: MembroOrganizacao | null;
  readonly configuracaoAgenda: ConfiguracaoAgendaOrganizacao;
  readonly agendamentos: readonly AgendamentoAgenda[];
  readonly possuiExperienciaAgendaAtiva: boolean;
  readonly podeGerenciarAgenda: boolean;
  readonly podeEditarDisponibilidade: boolean;
}

export async function carregarContextoAgendaOrganizacaoServidor(
  usuario: UsuarioAutenticado,
  organizacaoId: string,
): Promise<ContextoAgendaOrganizacaoServidor | null> {
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const refOrg = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const refMembro = refOrg.collection("membros").doc(usuario.uid);

  const [docOrg, docMembro, docConfigAgenda, snapAgendamentos, snapMicrofluxos] =
    await Promise.all([
      refOrg.get(),
      refMembro.get(),
      refOrg.collection("configuracoes").doc("agenda").get(),
      refOrg.collection("agendamentos").get(),
      refOrg.collection("microfluxos").get(),
    ]);

  if (!docOrg.exists) {
    return null;
  }

  const organizacao = docOrg.data() as Organizacao;
  const membro = docMembro.exists ? (docMembro.data() as MembroOrganizacao) : null;

  if (!verificarPermissaoOrganizacao(usuario, organizacao, membro, "visualizar_painel")) {
    return null;
  }

  let configuracaoAgenda = criarConfiguracaoAgendaPadrao(organizacaoId);
  if (docConfigAgenda.exists) {
    const validacao = esquemaConfiguracaoAgendaOrganizacao.safeParse({
      ...configuracaoAgenda,
      ...docConfigAgenda.data(),
      organizacaoId,
    });
    if (validacao.success) {
      configuracaoAgenda = validacao.data;
    }
  }

  const agendamentos: AgendamentoAgenda[] = [];
  for (const doc of snapAgendamentos.docs) {
    const dados = doc.data() as Partial<AgendamentoAgenda>;
    if (
      typeof dados.id === "string" &&
      typeof dados.dataIso === "string" &&
      typeof dados.horarioInicio === "string" &&
      typeof dados.nomeVisitante === "string" &&
      typeof dados.emailVisitante === "string"
    ) {
      agendamentos.push(dados as AgendamentoAgenda);
    }
  }

  agendamentos.sort((a, b) => {
    const cmpData = a.dataIso.localeCompare(b.dataIso);
    if (cmpData !== 0) return cmpData;
    return a.horarioInicio.localeCompare(b.horarioInicio);
  });

  const possuiExperienciaAgendaAtiva = snapMicrofluxos.docs.some((doc) => {
    const dados = doc.data();
    return dados.tipoAcao === "agenda" && dados.ativo === true;
  });

  const podeGerenciarAgenda = verificarPermissaoOrganizacao(
    usuario,
    organizacao,
    membro,
    "gerenciar_agenda",
  );
  const podeEditarDisponibilidade = verificarPermissaoOrganizacao(
    usuario,
    organizacao,
    membro,
    "editar_aparencia_e_conteudo",
  );

  return {
    organizacao,
    membro,
    configuracaoAgenda,
    agendamentos,
    possuiExperienciaAgendaAtiva,
    podeGerenciarAgenda,
    podeEditarDisponibilidade,
  };
}

