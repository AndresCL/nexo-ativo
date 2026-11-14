import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { obterTagCachePaginaPublicada } from "@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore";

const esquemaRevalidarVitrine = z.object({
  organizacaoId: z.string().min(1),
  identificadorPublico: z.string().min(3).max(48),
});

export async function POST(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao) {
    return NextResponse.json({ erro: "Sessão não autenticada." }, { status: 401 });
  }

  let corpoBruto: unknown;
  try {
    corpoBruto = await requisicao.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const validacao = esquemaRevalidarVitrine.safeParse(corpoBruto);
  if (!validacao.success) {
    return NextResponse.json({ erro: "Parâmetros de revalidação inválidos." }, { status: 400 });
  }

  const { organizacaoId, identificadorPublico } = validacao.data;
  const { bancoDadosAdmin } = obterServicosAdminFirebase();

  const documentoMembro = await bancoDadosAdmin
    .collection("organizacoes")
    .doc(organizacaoId)
    .collection("membros")
    .doc(sessao.uid)
    .get();

  const ehFundador = sessao.papelPlataforma === "fundador";
  const possuiVinculoEditor =
    documentoMembro.exists &&
    documentoMembro.data()?.situacao === "ativo" &&
    (documentoMembro.data()?.papel === "proprietario" ||
      documentoMembro.data()?.papel === "administrador");

  if (!ehFundador && !possuiVinculoEditor) {
    return NextResponse.json(
      { erro: "Sem permissão para revalidar esta vitrine." },
      { status: 403 },
    );
  }

  revalidateTag(obterTagCachePaginaPublicada(identificadorPublico));
  revalidatePath(`/${identificadorPublico}`);

  return NextResponse.json({ revalidado: true });
}
