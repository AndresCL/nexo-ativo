import { ImageResponse } from "next/og";
import { obterDescritorPaletaEditorial } from "@/dominio/entidades/paginaPublicada";
import { leitorPaginaPublicadaPadrao } from "@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface PropriedadesImagemOg {
  readonly params: Promise<{
    identificadorOrganizacao: string;
  }>;
}

export default async function ImagemCompartilhamentoEditorial({ params }: PropriedadesImagemOg) {
  const { identificadorOrganizacao } = await params;
  const pagina =
    await leitorPaginaPublicadaPadrao.buscarPorIdentificadorPublico(identificadorOrganizacao);

  const paleta = obterDescritorPaletaEditorial(pagina?.paletaId ?? "noite_mineral");
  const nomeMarca = pagina?.identidade.nomeExibicao ?? "Fluxo";
  const subtituloMarca = pagina?.identidade.subtituloCurto ?? "Presença Digital Editorial";
  const manchete =
    pagina?.chamadaEditorial.tituloPrincipal ??
    "Apresentação editorial autoral com microfluxos comerciais.";
  const localidade = pagina?.identidade.cidadeEstado ?? "Brasil";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundColor: paleta.corFundoPrincipal,
        color: paleta.corTextoPrincipal,
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 28, fontWeight: 500 }}>{nomeMarca}</span>
          <span
            style={{
              marginTop: 6,
              fontSize: 15,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: paleta.corTextoSecundario,
              fontFamily: "sans-serif",
            }}
          >
            {subtituloMarca}
          </span>
        </div>
        <span
          style={{
            fontSize: 14,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: paleta.corDestaque,
            fontFamily: "sans-serif",
          }}
        >
          {localidade}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderTop: `1px solid ${paleta.corTextoSecundario}44`,
          paddingTop: 36,
          maxWidth: 960,
        }}
      >
        <span
          style={{
            fontSize: 52,
            lineHeight: 1.14,
            fontWeight: 400,
          }}
        >
          {manchete}
        </span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
