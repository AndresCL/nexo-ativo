import { NextResponse } from "next/server";
import { obterAnoMesAtualSaoPaulo } from "@/dominio/fundador/tiposDespesasFundador";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { repositorioDespesasFundadorServidor } from "@/infraestrutura/fundador/repositorioDespesasFundadorServidor";
import {
  esquemaAnoMesReferencia,
  esquemaCriarDespesaFundador,
} from "@/validacoes/esquemasDespesasFundador";

function calcularAnoMesInicioPadrao(): string {
  const atual = obterAnoMesAtualSaoPaulo();
  const [anoStr, mesStr] = atual.split("-");
  const ano = Number(anoStr);
  const mes = Number(mesStr);
  const data = new Date(Date.UTC(ano, mes - 1 - 11, 1));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const url = new URL(requisicao.url);
  const anoMesInicioParam = url.searchParams.get("anoMesInicio");
  let anoMesInicio = calcularAnoMesInicioPadrao();

  if (anoMesInicioParam) {
    const validacao = esquemaAnoMesReferencia.safeParse(anoMesInicioParam);
    if (!validacao.success) {
      return NextResponse.json({ erro: "Parâmetro anoMesInicio inválido." }, { status: 400 });
    }
    anoMesInicio = validacao.data;
  }

  const despesas = await repositorioDespesasFundadorServidor.listarPorFaixaAnoMes(anoMesInicio);
  return NextResponse.json({ despesas });
}

export async function POST(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const validacao = esquemaCriarDespesaFundador.safeParse(corpo);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Dados da despesa inválidos.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }

  const despesa = await repositorioDespesasFundadorServidor.criar(validacao.data, {
    uid: sessao.uid,
    email: sessao.email,
  });

  return NextResponse.json({ despesa }, { status: 201 });
}

