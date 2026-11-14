import {
  criarConfiguracaoEmailPadraoOrganizacao,
  extrairAnoMesReferenciaIso,
  type ConfiguracaoEmailOrganizacao,
  type ConsumoMensalEmailOrganizacao,
} from "@/dominio/email/tiposEmailTransacional";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import { verificarPermissaoOrganizacao } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { esquemaProfissionalEquipe } from "@/validacoes/esquemasCatalogoConteudo";
import {
  esquemaConfiguracaoEmailOrganizacao,
  esquemaConsumoMensalEmailOrganizacao,
} from "@/validacoes/esquemaConfiguracaoEmail";
import { esquemaSolicitacaoComercial } from "@/validacoes/esquemaSolicitacaoComercial";
import { esquemaIdentificadorLocalGoogle } from "@/validacoes/esquemasAvaliacoesGoogle";

export interface ContextoSolicitacoesOrganizacaoServidor {
  readonly organizacao: Organizacao;
  readonly membro: MembroOrganizacao | null;
  readonly solicitacoes: readonly SolicitacaoComercial[];
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly configuracaoEmail: ConfiguracaoEmailOrganizacao;
  readonly consumoMensalEmail: ConsumoMensalEmailOrganizacao;
  readonly identificadorLocalGoogle?: string;
  readonly podeGerenciarSolicitacoes: boolean;
  readonly podeConfigurarEmail: boolean;
}

export async function carregarContextoSolicitacoesOrganizacaoServidor(
  usuario: UsuarioAutenticado,
  organizacaoId: string,
): Promise<ContextoSolicitacoesOrganizacaoServidor | null> {
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const refOrg = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const refMembro = refOrg.collection("membros").doc(usuario.uid);
  const refRascunho = refOrg.collection("configuracaoPagina").doc("rascunho");
  const anoMesIso = extrairAnoMesReferenciaIso();

  const [
    docOrg,
    docMembro,
    snapSolicitacoes,
    snapProfissionais,
    docConfigEmail,
    docConsumoEmail,
    docRascunho,
  ] = await Promise.all([
    refOrg.get(),
    refMembro.get(),
    refOrg.collection("solicitacoes").get(),
    refOrg.collection("profissionais").get(),
    refOrg.collection("configuracoes").doc("email").get(),
    refOrg.collection("metricasDiarias").doc(`email-${anoMesIso}`).get(),
    refRascunho.get(),
  ]);

  if (!docOrg.exists) {
    return null;
  }

  const organizacao = docOrg.data() as Organizacao;
  const membro = docMembro.exists ? (docMembro.data() as MembroOrganizacao) : null;

  if (!verificarPermissaoOrganizacao(usuario, organizacao, membro, "visualizar_painel")) {
    return null;
  }

  const solicitacoes: SolicitacaoComercial[] = [];
  for (const doc of snapSolicitacoes.docs) {
    const validacao = esquemaSolicitacaoComercial.safeParse(doc.data());
    if (validacao.success) {
      solicitacoes.push(validacao.data);
    }
  }
  solicitacoes.sort((a, b) => b.criadoEmIso.localeCompare(a.criadoEmIso));

  const profissionais: ProfissionalEquipe[] = [];
  for (const doc of snapProfissionais.docs) {
    const validacao = esquemaProfissionalEquipe.safeParse(doc.data());
    if (validacao.success && validacao.data.ativo) {
      profissionais.push(validacao.data);
    }
  }
  profissionais.sort((a, b) => a.ordemExibicao - b.ordemExibicao);

  const podeGerenciarSolicitacoes = verificarPermissaoOrganizacao(
    usuario,
    organizacao,
    membro,
    "gerenciar_solicitacoes",
  );

  const podeConfigurarEmail =
    membro?.papel === "proprietario" ||
    membro?.papel === "administrador" ||
    usuario.papelPlataforma === "fundador";

  let configuracaoEmail: ConfiguracaoEmailOrganizacao;
  const validacaoConfig = esquemaConfiguracaoEmailOrganizacao.safeParse(docConfigEmail.data());
  if (validacaoConfig.success) {
    configuracaoEmail = validacaoConfig.data;
  } else {
    configuracaoEmail = criarConfiguracaoEmailPadraoOrganizacao(
      organizacao.id,
      usuario.email ?? undefined,
    );
  }

  let consumoMensalEmail: ConsumoMensalEmailOrganizacao;
  const validacaoConsumo = esquemaConsumoMensalEmailOrganizacao.safeParse(docConsumoEmail.data());
  if (validacaoConsumo.success) {
    consumoMensalEmail = validacaoConsumo.data;
  } else {
    consumoMensalEmail = {
      anoMesIso,
      enviosNoMesAtual: 0,
      limiteMensalPlano: organizacao.resumoDireitosPlano.limiteEnviosEmailMensal,
      atualizadoEmIso: new Date().toISOString(),
    };
  }

  let identificadorLocalGoogle: string | undefined;
  if (docRascunho.exists) {
    const dadosRascunho = docRascunho.data();
    const avaliacoes = dadosRascunho?.avaliacoesGoogle;
    if (avaliacoes && avaliacoes.habilitado && typeof avaliacoes.identificadorLocal === "string") {
      const validado = esquemaIdentificadorLocalGoogle.safeParse(avaliacoes.identificadorLocal);
      if (validado.success) {
        identificadorLocalGoogle = validado.data;
      }
    }
  }

  return {
    organizacao,
    membro,
    solicitacoes,
    profissionais,
    configuracaoEmail,
    consumoMensalEmail,
    ...(identificadorLocalGoogle ? { identificadorLocalGoogle } : {}),
    podeGerenciarSolicitacoes,
    podeConfigurarEmail,
  };
}

export async function contarSolicitacoesNovasOrganizacaoServidor(
  organizacaoId: string,
): Promise<number> {
  try {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const snap = await bancoDadosAdmin
      .collection("organizacoes")
      .doc(organizacaoId)
      .collection("solicitacoes")
      .where("situacao", "==", "nova")
      .count()
      .get();

    return snap.data().count;
  } catch {
    return 0;
  }
}
