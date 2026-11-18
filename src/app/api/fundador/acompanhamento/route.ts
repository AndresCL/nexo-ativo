import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import type { MensagemKanbanFundador } from "@/dominio/fundador/tiposPainelFundador";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import {
  esquemaAdicionarMensagemKanbanFundador,
  esquemaAlterarEtapaKanbanFundador,
} from "@/validacoes/esquemasPainelFundador";

export async function PUT(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const validacao = esquemaAlterarEtapaKanbanFundador.safeParse(corpo);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }

  const { organizacaoId, etapaKanban } = validacao.data;
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const agoraIso = new Date().toISOString();

  await bancoDadosAdmin
    .collection("acompanhamentoFundador")
    .doc(organizacaoId)
    .set(
      {
        organizacaoId,
        etapaKanban,
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );

  return NextResponse.json({ organizacaoId, etapaKanban });
}

export async function POST(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const validacao = esquemaAdicionarMensagemKanbanFundador.safeParse(corpo);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }

  const { organizacaoId, texto } = validacao.data;
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const agoraIso = new Date().toISOString();

  const novaMensagem: MensagemKanbanFundador = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    texto,
    ...(sessao.email ? { autorEmail: sessao.email } : {}),
    criadoEmIso: agoraIso,
  };

  await bancoDadosAdmin
    .collection("acompanhamentoFundador")
    .doc(organizacaoId)
    .set(
      {
        organizacaoId,
        mensagens: FieldValue.arrayUnion(novaMensagem),
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );

  return NextResponse.json({ mensagem: novaMensagem });
}

