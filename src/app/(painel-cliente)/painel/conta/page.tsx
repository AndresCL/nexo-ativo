import type { Metadata } from "next";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { FormularioPerfilUsuario } from "@/componentes/painel/conta/FormularioPerfilUsuario";
import { FormularioAlterarSenha } from "@/componentes/painel/conta/FormularioAlterarSenha";
import { SecaoSessaoLogout } from "@/componentes/painel/conta/SecaoSessaoLogout";
import { ZonaPerigoExcluirConta } from "@/componentes/painel/conta/ZonaPerigoExcluirConta";
import { determinarEstadoCicloAssinatura } from "@/dominio/assinaturas/mapeadorCicloAssinatura";
import type { ResumoEstadoExclusaoConta } from "@/aplicacao/portas/portasContaUsuario";
import type { Organizacao } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { RegistroAssinaturaAsaas } from "@/dominio/assinaturas/tiposAssinaturaAsaas";

export const metadata: Metadata = {
  title: "Minha Conta · Nexo Ativo",
};

export default async function PaginaMinhaConta() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);

  const { bancoDadosAdmin } = obterServicosAdminFirebase();

  let bloqueadoPorAssinaturaAtiva = false;
  let canceladaComAcessoRestante = false;
  let vigenciaAteIso: string | undefined = undefined;
  let motivoBloqueio: string | undefined = undefined;

  for (const vinculo of vinculos) {
    if (vinculo.papel === "proprietario") {
      const docOrg = await bancoDadosAdmin
        .collection("organizacoes")
        .doc(vinculo.organizacaoId)
        .get();

      if (docOrg.exists) {
        const dadosOrg = docOrg.data() as Organizacao;
        const docAssinatura = await bancoDadosAdmin
          .collection("assinaturas")
          .doc(vinculo.organizacaoId)
          .get();

        const dadosAssinatura = docAssinatura.exists
          ? (docAssinatura.data() as RegistroAssinaturaAsaas)
          : null;

        const estadoCiclo = determinarEstadoCicloAssinatura(dadosOrg, dadosAssinatura);

        if (
          estadoCiclo.tipo === "ativa_regular" ||
          estadoCiclo.tipo === "aguardando_primeiro_pagamento" ||
          estadoCiclo.tipo === "reativacao_pendente" ||
          estadoCiclo.tipo === "inadimplente" ||
          estadoCiclo.tipo === "suspensa"
        ) {
          bloqueadoPorAssinaturaAtiva = true;
          motivoBloqueio = `A organização "${dadosOrg.nome}" possui uma assinatura em andamento (${estadoCiclo.rotuloBadge}). Cancele a assinatura antes de excluir a conta.`;
          break;
        }

        if (estadoCiclo.tipo === "cancelada_com_acesso") {
          canceladaComAcessoRestante = true;
          vigenciaAteIso = estadoCiclo.vigenciaAteIso;
        }
      }
    }
  }

  const ehFundador = sessao.papelPlataforma === "fundador";

  const estadoExclusao: ResumoEstadoExclusaoConta = {
    podeExcluir: !bloqueadoPorAssinaturaAtiva && !ehFundador,
    bloqueadoPorAssinaturaAtiva,
    canceladaComAcessoRestante,
    vigenciaAteIso,
    motivoBloqueio,
    ehFundador,
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-marfim-200/80 pb-3 sm:pb-4">
        <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
          Minha conta
        </h1>
        <p className="mt-1 text-xs text-mineral-600">
          Gerencie suas informações de perfil, credenciais e sessão.
        </p>
      </header>

      <div className="max-w-3xl space-y-6">
        <FormularioPerfilUsuario
          nomeInicial={sessao.nomeExibicao || ""}
          email={sessao.email || ""}
          emailVerificado={sessao.emailVerificado}
          provedores={sessao.provedoresConectados}
        />

        <FormularioAlterarSenha provedores={sessao.provedoresConectados} />

        <SecaoSessaoLogout />

        <ZonaPerigoExcluirConta
          estadoExclusao={estadoExclusao}
          provedores={sessao.provedoresConectados}
        />
      </div>
    </div>
  );
}

