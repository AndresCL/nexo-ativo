import { NextResponse } from "next/server";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import {
  ErroOperacaoEmailProprietario,
  executarAtualizacaoEmailProprietarioFundador,
} from "@/infraestrutura/fundador/atualizarEmailProprietarioServidor";
import { esquemaAtualizarEmailProprietarioFundador } from "@/validacoes/esquemasPainelFundador";

export async function PUT(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const validacao = esquemaAtualizarEmailProprietarioFundador.safeParse(corpo);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }

  try {
    const { autenticacaoAdmin, bancoDadosAdmin } = obterServicosAdminFirebase();
    const resultado = await executarAtualizacaoEmailProprietarioFundador({
      autenticacaoAdmin,
      bancoDadosAdmin,
      fundadorUid: sessao.uid,
      organizacaoId: validacao.data.organizacaoId,
      novoEmail: validacao.data.novoEmail,
    });

    return NextResponse.json(resultado);
  } catch (erro) {
    if (erro instanceof ErroOperacaoEmailProprietario) {
      return NextResponse.json({ erro: erro.message }, { status: erro.statusHttp });
    }
    const mensagem =
      erro instanceof Error
        ? erro.message
        : "Não foi possível atualizar o e-mail do proprietário.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}

