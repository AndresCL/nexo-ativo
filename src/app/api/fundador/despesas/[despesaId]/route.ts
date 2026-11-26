import { NextResponse } from "next/server";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { repositorioDespesasFundadorServidor } from "@/infraestrutura/fundador/repositorioDespesasFundadorServidor";
import { esquemaAtualizarDespesaFundador } from "@/validacoes/esquemasDespesasFundador";

interface ContextoRotaDespesa {
  readonly params: Promise<{ readonly despesaId: string }>;
}

function validarIdDespesa(despesaId: string): boolean {
  return Boolean(despesaId && despesaId.length <= 120 && !despesaId.includes("/"));
}

export async function PATCH(requisicao: Request, contexto: ContextoRotaDespesa) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const { despesaId } = await contexto.params;
  if (!validarIdDespesa(despesaId)) {
    return NextResponse.json({ erro: "Identificador de despesa inválido." }, { status: 400 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const validacao = esquemaAtualizarDespesaFundador.safeParse(corpo);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Dados da despesa inválidos.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }

  const despesa = await repositorioDespesasFundadorServidor.atualizar(despesaId, validacao.data, {
    uid: sessao.uid,
    email: sessao.email,
  });

  if (!despesa) {
    return NextResponse.json({ erro: "Despesa não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ despesa });
}

export async function DELETE(_requisicao: Request, contexto: ContextoRotaDespesa) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const { despesaId } = await contexto.params;
  if (!validarIdDespesa(despesaId)) {
    return NextResponse.json({ erro: "Identificador de despesa inválido." }, { status: 400 });
  }

  const removida = await repositorioDespesasFundadorServidor.excluir(despesaId);
  if (!removida) {
    return NextResponse.json({ erro: "Despesa não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ removida: true, despesaId });
}

