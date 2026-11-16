import { NextResponse } from "next/server";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";

async function obterOrganizacaoAutorizada(): Promise<string | null> {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  return vinculos[0]?.organizacaoId ?? null;
}

export async function GET() {
  try {
    const organizacaoId = await obterOrganizacaoAutorizada();
    if (!organizacaoId) {
      return NextResponse.json({ erro: "Organização não encontrada." }, { status: 403 });
    }

    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const snap = await bancoDadosAdmin
      .collection("organizacoes")
      .doc(organizacaoId)
      .collection("configuracoes")
      .doc("videos")
      .get();

    if (!snap.exists) {
      return NextResponse.json({
        videos: [],
        modoExibicaoVideos: "carrossel",
        autoplayVideos: false,
        ocultarTituloVideos: false,
      });
    }

    const dados = snap.data() ?? {};
    return NextResponse.json({
      videos: Array.isArray(dados.videos) ? dados.videos : [],
      modoExibicaoVideos: dados.modoExibicaoVideos === "fila" ? "fila" : "carrossel",
      autoplayVideos: Boolean(dados.autoplayVideos),
      ocultarTituloVideos: Boolean(dados.ocultarTituloVideos),
    });
  } catch {
    return NextResponse.json({ erro: "Não foi possível carregar os vídeos." }, { status: 500 });
  }
}

export async function PUT(requisicao: Request) {
  try {
    const organizacaoId = await obterOrganizacaoAutorizada();
    if (!organizacaoId) {
      return NextResponse.json({ erro: "Organização não encontrada." }, { status: 403 });
    }

    const corpo = (await requisicao.json()) as {
      videos?: readonly { id: string; url: string; titulo?: string }[];
      modoExibicaoVideos?: string;
      autoplayVideos?: boolean;
      ocultarTituloVideos?: boolean;
    };

    const videos = Array.isArray(corpo.videos)
      ? corpo.videos.map((v) => ({
          id: String(v.id),
          url: String(v.url),
          ...(v.titulo ? { titulo: String(v.titulo) } : {}),
        }))
      : [];

    const modoExibicaoVideos = corpo.modoExibicaoVideos === "fila" ? "fila" : "carrossel";
    const autoplayVideos = Boolean(corpo.autoplayVideos);
    const ocultarTituloVideos = Boolean(corpo.ocultarTituloVideos);

    const { obterServicosAdminFirebase } = await import("@/infraestrutura/firebase/adminFirebase");
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    await bancoDadosAdmin
      .collection("organizacoes")
      .doc(organizacaoId)
      .collection("configuracoes")
      .doc("videos")
      .set({
        videos,
        modoExibicaoVideos,
        autoplayVideos,
        ocultarTituloVideos,
        atualizadoEmIso: new Date().toISOString(),
      });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: "Não foi possível salvar os vídeos." }, { status: 500 });
  }
}

