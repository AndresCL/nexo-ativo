import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  DURACAO_COOKIE_SESSAO_SEGUNDOS,
  NOME_COOKIE_ORGANIZACAO_FUNDADOR,
  obterSessaoAutenticadaServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";

export async function POST(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const corpo = (await requisicao.json().catch(() => null)) as {
    organizacaoId?: unknown;
  } | null;

  const organizacaoId =
    typeof corpo?.organizacaoId === "string" ? corpo.organizacaoId.trim() : "";

  if (!organizacaoId || organizacaoId.includes("/")) {
    return NextResponse.json({ erro: "Organização inválida." }, { status: 400 });
  }

  const gerenciadorCookies = await cookies();
  gerenciadorCookies.set(NOME_COOKIE_ORGANIZACAO_FUNDADOR, organizacaoId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_COOKIE_SESSAO_SEGUNDOS,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ selecionada: true, organizacaoId });
}

export async function DELETE() {
  const gerenciadorCookies = await cookies();
  gerenciadorCookies.delete(NOME_COOKIE_ORGANIZACAO_FUNDADOR);
  return NextResponse.json({ limpa: true });
}

