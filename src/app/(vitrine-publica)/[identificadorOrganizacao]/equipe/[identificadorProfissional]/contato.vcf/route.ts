import { NextResponse } from "next/server";
import { construirUrlPublicaCartaoProfissional } from "@/dominio/entidades/catalogoConteudo";
import { ehIdentificadorPublicoValido } from "@/dominio/objetos-valor/identificadorPublico";
import {
  gerarConteudoVCard,
  gerarNomeArquivoVCard,
} from "@/dominio/servicos/geradorVCardProfissional";
import { leitorPaginaPublicadaPadrao } from "@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

interface ParametrosRotaVCard {
  readonly params: Promise<{
    identificadorOrganizacao: string;
    identificadorProfissional: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function GET(_requisicao: Request, { params }: ParametrosRotaVCard) {
  const { identificadorOrganizacao, identificadorProfissional } = await params;

  if (
    !ehIdentificadorPublicoValido(identificadorOrganizacao) ||
    !ehIdentificadorPublicoValido(identificadorProfissional)
  ) {
    return new NextResponse("Identificador inválido", { status: 400 });
  }

  const dados = await leitorPaginaPublicadaPadrao.buscarCartaoProfissionalPublico(
    identificadorOrganizacao,
    identificadorProfissional,
  );

  if (!dados) {
    return new NextResponse("Profissional não encontrado", { status: 404 });
  }

  const { urlBasePublica } = lerConfiguracaoAmbientePublico();
  const urlPublicaCartao = construirUrlPublicaCartaoProfissional({
    urlBasePublica,
    identificadorOrganizacao,
    identificadorCartao: dados.profissional.identificadorCartao,
  });

  const conteudoVCard = gerarConteudoVCard({
    nomeCompleto: dados.profissional.nomeCompleto,
    cargoOuEspecialidade: dados.profissional.cargoOuEspecialidade,
    nomeOrganizacao: dados.paginaOrganizacao.identidade.nomeExibicao,
    registroProfissionalOpcional: dados.profissional.registroProfissionalOpcional,
    minibiografia: dados.profissional.minibiografia,
    telefoneWhatsappOpcional: dados.profissional.whatsappOpcional,
    emailContatoOpcional: dados.profissional.emailContatoOpcional,
    urlPublicaCartao,
    urlFotoPerfil: dados.profissional.urlFotoPerfil,
    instagramOpcional: dados.profissional.instagramOpcional,
    linkedinOpcional: dados.profissional.linkedinOpcional,
  });

  const nomeArquivo = gerarNomeArquivoVCard(dados.profissional.nomeCompleto);

  return new Response(conteudoVCard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}

