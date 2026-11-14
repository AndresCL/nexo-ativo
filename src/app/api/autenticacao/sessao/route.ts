import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  DURACAO_COOKIE_SESSAO_SEGUNDOS,
  emitirCookieSessaoHttpOnly,
  NOME_COOKIE_SESSAO,
} from "@/infraestrutura/firebase/sessaoServidor";

const esquemaCriarSessao = z.object({
  idToken: z.string().min(10, "Token de autenticação inválido."),
});

export async function POST(requisicao: Request) {
  try {
    const corpo = await requisicao.json();
    const { idToken } = esquemaCriarSessao.parse(corpo);
    const cookieSessao = await emitirCookieSessaoHttpOnly(idToken);

    const gerenciadorCookies = await cookies();
    gerenciadorCookies.set(NOME_COOKIE_SESSAO, cookieSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DURACAO_COOKIE_SESSAO_SEGUNDOS,
    });

    return NextResponse.json({ sessaoAtiva: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível validar o token de autenticação informado." },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const gerenciadorCookies = await cookies();
  gerenciadorCookies.set(NOME_COOKIE_SESSAO, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ sessaoAtiva: false }, { status: 200 });
}
