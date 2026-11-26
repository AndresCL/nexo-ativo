import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  briefingPossuiConteudo,
  type BriefingImplantacaoFundador,
} from "@/dominio/fundador/briefingImplantacao";
import { verificarPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { esquemaSalvarBriefingImplantacaoFundador } from "@/validacoes/esquemasPainelFundador";

const COLECAO_BRIEFINGS = "briefingsImplantacaoFundador";

function converterTimestampParaIso(valor: unknown): string {
  if (valor instanceof Timestamp) {
    return valor.toDate().toISOString();
  }
  if (typeof valor === "string" && valor.trim().length > 0) {
    return valor;
  }
  return new Date().toISOString();
}

function converterTimestampParaDataYyyyMmDd(valor: unknown): string | null {
  if (valor instanceof Timestamp) {
    return valor.toDate().toISOString().slice(0, 10);
  }
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) {
    return valor.trim();
  }
  return null;
}

function serializarDocumentoBriefing(
  organizacaoId: string,
  dados: Record<string, unknown>,
): BriefingImplantacaoFundador {
  return {
    organizacaoId,
    sobreNegocio: typeof dados.sobreNegocio === "string" ? dados.sobreNegocio : "",
    conteudoEServicos:
      typeof dados.conteudoEServicos === "string" ? dados.conteudoEServicos : "",
    experienciasEAcoes:
      typeof dados.experienciasEAcoes === "string" ? dados.experienciasEAcoes : "",
    identidadeVisualEMateriais:
      typeof dados.identidadeVisualEMateriais === "string"
        ? dados.identidadeVisualEMateriais
        : "",
    pendenciasEProximosPassos:
      typeof dados.pendenciasEProximosPassos === "string"
        ? dados.pendenciasEProximosPassos
        : "",
    previsaoEntregaData: converterTimestampParaDataYyyyMmDd(dados.previsaoEntregaEm),
    criadoEmIso: converterTimestampParaIso(dados.criadoEm),
    atualizadoEmIso: converterTimestampParaIso(dados.atualizadoEm),
    atualizadoPor: typeof dados.atualizadoPor === "string" ? dados.atualizadoPor : "",
  };
}

export async function GET(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const { searchParams } = new URL(requisicao.url);
  const organizacaoId = searchParams.get("organizacaoId")?.trim() ?? "";
  if (organizacaoId.length < 2) {
    return NextResponse.json({ erro: "Informe a organização alvo." }, { status: 400 });
  }

  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const snap = await bancoDadosAdmin.collection(COLECAO_BRIEFINGS).doc(organizacaoId).get();

  if (!snap.exists) {
    return NextResponse.json({ briefing: null });
  }

  const dados = (snap.data() ?? {}) as Record<string, unknown>;
  return NextResponse.json({
    briefing: serializarDocumentoBriefing(organizacaoId, dados),
  });
}

export async function PUT(requisicao: Request) {
  const sessao = await obterSessaoAutenticadaServidor();
  if (!sessao || !verificarPrivilegioFundador(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito ao fundador." }, { status: 403 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const validacao = esquemaSalvarBriefingImplantacaoFundador.safeParse(corpo);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Dados inválidos para o briefing.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }

  const {
    organizacaoId,
    sobreNegocio,
    conteudoEServicos,
    experienciasEAcoes,
    identidadeVisualEMateriais,
    pendenciasEProximosPassos,
    previsaoEntregaData,
  } = validacao.data;

  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const docRef = bancoDadosAdmin.collection(COLECAO_BRIEFINGS).doc(organizacaoId);
  const snapAtual = await docRef.get();

  const dadosFormulario = {
    sobreNegocio,
    conteudoEServicos,
    experienciasEAcoes,
    identidadeVisualEMateriais,
    pendenciasEProximosPassos,
    previsaoEntregaData,
  };

  if (!snapAtual.exists && !briefingPossuiConteudo(dadosFormulario)) {
    return NextResponse.json({ briefing: null, ignoradoPorVazio: true });
  }

  const previsaoEntregaEm = previsaoEntregaData
    ? Timestamp.fromDate(new Date(`${previsaoEntregaData}T12:00:00.000Z`))
    : null;

  const payloadGravacao: Record<string, unknown> = {
    organizacaoId,
    sobreNegocio,
    conteudoEServicos,
    experienciasEAcoes,
    identidadeVisualEMateriais,
    pendenciasEProximosPassos,
    previsaoEntregaEm,
    atualizadoEm: FieldValue.serverTimestamp(),
    atualizadoPor: sessao.uid,
  };

  if (!snapAtual.exists) {
    payloadGravacao.criadoEm = FieldValue.serverTimestamp();
  }

  await docRef.set(payloadGravacao, { merge: true });

  const snapAtualizado = await docRef.get();
  const dadosAtualizados = (snapAtualizado.data() ?? {}) as Record<string, unknown>;

  return NextResponse.json({
    briefing: serializarDocumentoBriefing(organizacaoId, dadosAtualizados),
  });
}

