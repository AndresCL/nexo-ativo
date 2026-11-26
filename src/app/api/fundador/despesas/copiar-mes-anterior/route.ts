import { NextResponse } from "next/server";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { repositorioDespesasFundadorServidor } from "@/infraestrutura/fundador/repositorioDespesasFundadorServidor";
import { esquemaCopiarDespesasMesAnterior } from "@/validacoes/esquemasDespesasFundador";

export async function POST(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const validacao = esquemaCopiarDespesasMesAnterior.safeParse(corpo);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Mês de destino inválido.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }

  const resultado = await repositorioDespesasFundadorServidor.copiarDoMesAnterior(
    validacao.data.anoMesDestino,
    {
      uid: sessao.uid,
      email: sessao.email,
    },
  );

  return NextResponse.json(resultado, { status: 201 });
}

