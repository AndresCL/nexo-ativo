import { NextResponse, type NextRequest } from "next/server";
import {
  COMPRIMENTO_MINIMO_IDENTIFICADOR,
  COMPRIMENTO_MAXIMO_IDENTIFICADOR,
  ehIdentificadorPublicoValido,
  IDENTIFICADORES_RESERVADOS,
  normalizarSugestaoIdentificador,
} from "@/dominio/objetos-valor/identificadorPublico";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

export const dynamic = "force-dynamic";

export interface RespostaVerificacaoIdentificador {
  readonly slug: string;
  readonly valido: boolean;
  readonly disponivel: boolean;
  readonly motivo?: "invalido" | "reservado" | "em_uso";
  readonly mensagem: string;
}

/**
 * Endpoint estritamente público e isolado para verificar a disponibilidade de um identificador (slug)
 * na Home e em fluxos públicos de conversão.
 *
 * Não consome cookies de sessão, não exige token de autenticação e não expõe dados internos.
 */
export async function GET(requisicao: NextRequest): Promise<NextResponse<RespostaVerificacaoIdentificador>> {
  const { searchParams } = new URL(requisicao.url);
  const slugBruto = searchParams.get("slug") ?? "";
  const slug = normalizarSugestaoIdentificador(slugBruto);

  if (!slug || slug.length < COMPRIMENTO_MINIMO_IDENTIFICADOR) {
    return NextResponse.json({
      slug,
      valido: false,
      disponivel: false,
      motivo: "invalido",
      mensagem: `O endereço deve ter no mínimo ${COMPRIMENTO_MINIMO_IDENTIFICADOR} caracteres.`,
    });
  }

  if (slug.length > COMPRIMENTO_MAXIMO_IDENTIFICADOR || !ehIdentificadorPublicoValido(slug)) {
    return NextResponse.json({
      slug,
      valido: false,
      disponivel: false,
      motivo: "invalido",
      mensagem: "Use apenas letras minúsculas sem acento, números e hífens.",
    });
  }

  if (IDENTIFICADORES_RESERVADOS.has(slug)) {
    return NextResponse.json({
      slug,
      valido: true,
      disponivel: false,
      motivo: "reservado",
      mensagem: "Este endereço é reservado pelo sistema.",
    });
  }

  try {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const docRef = bancoDadosAdmin.collection("identificadoresPublicos").doc(slug);
    const snapshot = await docRef.get();

    if (snapshot.exists) {
      return NextResponse.json({
        slug,
        valido: true,
        disponivel: false,
        motivo: "em_uso",
        mensagem: "Este endereço já está sendo utilizado.",
      });
    }

    return NextResponse.json({
      slug,
      valido: true,
      disponivel: true,
      mensagem: `nexoativo.com.br/${slug} está disponível!`,
    });
  } catch (erro) {
    console.error("Erro ao verificar disponibilidade de identificador público:", erro);
    // Em caso de falha transitória de infraestrutura, mantemos comportamento gracioso sem travar a navegação
    return NextResponse.json(
      {
        slug,
        valido: true,
        disponivel: true,
        mensagem: "Endereço pronto para reserva.",
      },
      { status: 200 }
    );
  }
}

