import { notFound, redirect } from "next/navigation";
import {
  construirCaminhoExperiencia,
  obterIdentificadorPublicoExperiencia,
} from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { ehIdentificadorPublicoValido } from "@/dominio/objetos-valor/identificadorPublico";
import { leitorPaginaPublicadaPadrao } from "@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore";

export const dynamic = "force-dynamic";
export const metadata = { title: "Experiência", robots: { index: false, follow: false } };

export default async function PaginaExperienciaPublica({
  params,
  searchParams,
}: {
  readonly params: Promise<{ identificadorOrganizacao: string; identificadorExperiencia: string }>;
  readonly searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { identificadorOrganizacao, identificadorExperiencia } = await params;
  if (
    !ehIdentificadorPublicoValido(identificadorOrganizacao) ||
    !/^[a-zA-Z0-9_-]{1,200}$/.test(identificadorExperiencia)
  )
    notFound();
  const pacote =
    await leitorPaginaPublicadaPadrao.buscarVitrineCompletaPorIdentificador(
      identificadorOrganizacao,
    );
  const fluxo = pacote?.acervo.microfluxos?.find(
    (m) =>
      obterIdentificadorPublicoExperiencia(m.id) === identificadorExperiencia &&
      m.ativo &&
      (!m.tipoAcao || m.tipoAcao === "microfluxo" || m.tipoAcao === "agenda") &&
      m.organizacaoId === pacote.pagina.organizacaoId,
  );
  if (!pacote || !fluxo) notFound();
  const consulta = new URLSearchParams();
  for (const [chave, valor] of Object.entries((await searchParams) ?? {})) {
    for (const item of Array.isArray(valor) ? valor : valor === undefined ? [] : [valor]) {
      consulta.append(chave, item);
    }
  }
  if (fluxo.tipoAcao === "agenda") {
    redirect(`/${identificadorOrganizacao}${consulta.size ? `?${consulta}` : ""}#agenda-${fluxo.id}`);
  }
  const [caminho, hash] = construirCaminhoExperiencia(identificadorOrganizacao, fluxo.id).split(
    "#",
  );
  redirect(`${caminho}${consulta.size ? `?${consulta}` : ""}#${hash}`);
}
