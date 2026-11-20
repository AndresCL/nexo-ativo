import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import {
  NOME_COOKIE_SESSAO,
  obterSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { esquemaExclusaoContaRequisicao } from "@/validacoes/esquemasContaUsuario";
import { determinarEstadoCicloAssinatura } from "@/dominio/assinaturas/mapeadorCicloAssinatura";
import type { Organizacao } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { RegistroAssinaturaAsaas } from "@/dominio/assinaturas/tiposAssinaturaAsaas";

export async function POST(requisicao: Request) {
  try {
    const sessao = await obterSessaoAutenticadaServidor();
    if (!sessao) {
      return NextResponse.json(
        { erro: "Você precisa estar autenticado para realizar esta operação." },
        { status: 401 },
      );
    }

    // Regra de segurança: Fundadores não podem auto-excluir a conta por este fluxo
    if (sessao.papelPlataforma === "fundador") {
      return NextResponse.json(
        {
          erro: "Contas com privilégios de Fundador não podem ser eliminadas pelo painel de usuário.",
        },
        { status: 403 },
      );
    }

    let corpoRequisicao = {};
    try {
      corpoRequisicao = await requisicao.json();
    } catch {
      // Corpo vazio é aceito se não houver payload
    }

    const { confirmouPerdaPeriodoRestante } =
      esquemaExclusaoContaRequisicao.parse(corpoRequisicao);

    const { bancoDadosAdmin, autenticacaoAdmin } = obterServicosAdminFirebase();
    const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);

    // Valida o estado de todas as organizações das quais o usuário é proprietário
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

          // Se a assinatura for ativa regular ou possuir fatura pendente, bloqueia a exclusão
          if (
            estadoCiclo.tipo === "ativa_regular" ||
            estadoCiclo.tipo === "aguardando_primeiro_pagamento" ||
            estadoCiclo.tipo === "reativacao_pendente" ||
            estadoCiclo.tipo === "inadimplente" ||
            estadoCiclo.tipo === "suspensa"
          ) {
            return NextResponse.json(
              {
                erro: `A organização "${dadosOrg.nome}" possui uma assinatura em andamento (${estadoCiclo.rotuloBadge}). Cancele ou regularize sua assinatura na aba Assinatura antes de excluir a conta.`,
              },
              { status: 400 },
            );
          }

          // Se estiver cancelada mas ainda com acesso vigente, exige consentimento expresso
          if (estadoCiclo.tipo === "cancelada_com_acesso" && !confirmouPerdaPeriodoRestante) {
            return NextResponse.json(
              {
                erro: "Você possui período restante de assinatura vigente. É necessário confirmar expressamente que abre mão desse período para prosseguir.",
              },
              { status: 400 },
            );
          }
        }
      }
    }

    // Executa a exclusão e desassociação em cascata
    for (const vinculo of vinculos) {
      const refOrg = bancoDadosAdmin.collection("organizacoes").doc(vinculo.organizacaoId);
      const docOrg = await refOrg.get();

      if (vinculo.papel === "proprietario" && docOrg.exists) {
        const dadosOrg = docOrg.data() as Organizacao;

        // 1. Libera o identificador público (slug)
        if (dadosOrg.identificadorPublico) {
          await bancoDadosAdmin
            .collection("identificadoresPublicos")
            .doc(dadosOrg.identificadorPublico.toLowerCase())
            .delete()
            .catch(() => undefined);
        }

        // 2. Remove página publicada
        await bancoDadosAdmin
          .collection("paginasPublicadas")
          .doc(vinculo.organizacaoId)
          .delete()
          .catch(() => undefined);

        // 3. Remove registro de assinatura
        await bancoDadosAdmin
          .collection("assinaturas")
          .doc(vinculo.organizacaoId)
          .delete()
          .catch(() => undefined);

        // 4. Limpa recursivamente a árvore da organização (subcoleções)
        await bancoDadosAdmin.recursiveDelete(refOrg).catch(() => undefined);
      } else {
        // Se for apenas membro colaborador, remove seu vínculo da organização
        await refOrg
          .collection("membros")
          .doc(sessao.uid)
          .delete()
          .catch(() => undefined);
      }
    }

    // 5. Remove documento do usuário e vínculos pessoais
    const refUsuario = bancoDadosAdmin.collection("usuarios").doc(sessao.uid);
    await bancoDadosAdmin.recursiveDelete(refUsuario).catch(() => undefined);

    // 6. Exclui a conta no Firebase Authentication
    await autenticacaoAdmin.deleteUser(sessao.uid).catch(() => undefined);

    // 7. Revoga tokens ativos e limpa o cookie HTTP-only da sessão
    await autenticacaoAdmin.revokeRefreshTokens(sessao.uid).catch(() => undefined);

    const gerenciadorCookies = await cookies();
    gerenciadorCookies.set(NOME_COOKIE_SESSAO, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (erro) {
    const mensagem =
      erro instanceof Error ? erro.message : "Falha interna ao processar exclusão da conta.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}

