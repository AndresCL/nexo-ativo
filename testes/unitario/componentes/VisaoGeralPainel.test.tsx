import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisaoGeralPainel } from "@/componentes/painel/VisaoGeralPainel";
import { criarResumoDireitosPlanoInicial } from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  criarRascunhoConfiguracaoPaginaPadrao,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";

const rascunho = criarRascunhoConfiguracaoPaginaPadrao({
  organizacaoId: "garage-88",
  nomeOrganizacao: "Garage 88",
  agoraIso: "2026-11-13T12:00:00Z",
});
function montar(
  opcoes: {
    publicado?: boolean;
    emailVerificado?: boolean;
    podeEditar?: boolean;
    permitePublicar?: boolean;
    rascunho?: RascunhoConfiguracaoPagina;
  } = {},
) {
  render(
    <VisaoGeralPainel
      nomeOrganizacao="Garage 88"
      identificadorPublico="garage-88"
      papel="proprietario"
      emailVerificado={opcoes.emailVerificado ?? true}
      rascunho={opcoes.rascunho ?? rascunho}
      resumoPlano={{
        ...criarResumoDireitosPlanoInicial(),
        planoCodigo: "equipe",
        limiteProfissionaisAtivos: 5,
        permitePublicacaoPublica: opcoes.permitePublicar ?? true,
      }}
      versaoPublicada={opcoes.publicado ? 3 : null}
      podeEditarAparencia={opcoes.podeEditar ?? true}
    />,
  );
}

describe("Visão geral do painel", () => {
  it("apresenta a publicação e os limites reais com os atalhos para cada área", () => {
    montar({ publicado: true });
    const resumo = screen.getByRole("region", { name: "Resumo da sua presença digital" });
    expect(within(resumo).getByText("Versão v3")).toBeInTheDocument();
    expect(within(resumo).getByText("Até 5")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir página pública" })).toHaveAttribute(
      "href",
      "/garage-88",
    );
    const atalhos = screen.getByRole("region", { name: "Organize sua vitrine" });
    for (const rota of [
      "aparencia",
      "catalogo",
      "servicos",
      "portfolio",
      "equipe",
      "experiencias",
    ]) {
      expect(
        within(atalhos)
          .getAllByRole("link")
          .some((link) => link.getAttribute("href") === `/painel/${rota}`),
      ).toBe(true);
    }
    expect(screen.getByRole("link", { name: /Ver solicitações/ })).toHaveAttribute(
      "href",
      "/painel/solicitacoes",
    );
    expect(screen.getByRole("link", { name: /Ver desempenho/ })).toHaveAttribute(
      "href",
      "/painel/desempenho",
    );
  });

  it("mostra pendências reais do conteúdo sem oferecer uma página pública ainda não publicada", () => {
    montar({
      emailVerificado: false,
      rascunho: { ...rascunho, midiaFundo: { ...rascunho.midiaFundo, urlPrincipal: "" } },
    });
    expect(screen.queryByRole("link", { name: "Abrir página pública" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Confirmar e-mail" })).toHaveAttribute(
      "href",
      "/verificar-email",
    );
    const revisao = screen.getByRole("region", { name: "Revisão do rascunho" });
    expect(
      within(revisao).getByText("Selecione ou envie uma fotografia ou vídeo principal de fundo."),
    ).toBeInTheDocument();
    expect(
      within(revisao).getByText("Falta confirmar seu e-mail para publicar."),
    ).toBeInTheDocument();
    expect(
      within(revisao).queryByText("Os campos obrigatórios de conteúdo estão preenchidos."),
    ).not.toBeInTheDocument();
  });

  it("diferencia conteúdo preenchido de permissão para publicar e mantém consulta sem edição", () => {
    montar({
      podeEditar: false,
      permitePublicar: false,
      rascunho: {
        ...rascunho,
        identidade: { ...rascunho.identidade, nomeExibicao: "Garage 88" },
        chamadaEditorial: {
          ...rascunho.chamadaEditorial,
          tituloPrincipal: "Conheça nossos veículos",
        },
        midiaFundo: {
          ...rascunho.midiaFundo,
          tipo: "imagem",
          urlPrincipal: "/foto.png",
          textoAlternativo: "Foto da loja",
        },
      },
    });
    expect(screen.getByRole("link", { name: "Consultar aparência" })).toHaveAttribute(
      "href",
      "/painel/aparencia",
    );
    const revisao = screen.getByRole("region", { name: "Conteúdo revisado" });
    expect(
      within(revisao).getByText("Os campos obrigatórios de conteúdo estão preenchidos."),
    ).toBeInTheDocument();
    expect(
      within(revisao).getByText(/Seu plano atual ainda não permite publicação pública/),
    ).toBeInTheDocument();
  });
});
