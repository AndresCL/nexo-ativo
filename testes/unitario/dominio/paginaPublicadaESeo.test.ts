import { describe, expect, it } from "vitest";
import {
  deveIgnorarOtimizadorImagem,
  obterAcoesPrincipaisVisiveis,
  resolverAcoesVitrineComMicrofluxos,
  resolverMidiaEfetivaHome,
  type ItemAcaoHome,
  type MidiaFundoEditorial,
} from "@/dominio/entidades/paginaPublicada";
import {
  construirResumoMetadadosSeo,
  serializarJsonLdSeguro,
} from "@/dominio/servicos/construtorDadosEstruturadosSeo";
import { CATALOGO_DEMONSTRACOES_EDITORIAIS } from "../../fixtures/dadosExemploVitrine";

describe("Domínio da Página Publicada e SEO", () => {
  const midiaVideoComPoster: MidiaFundoEditorial = {
    tipo: "video",
    urlPrincipal: "https://storage.googleapis.com/demo/filme-atrio.mp4",
    urlPosterVideo: "https://storage.googleapis.com/demo/poster-atrio.webp",
    urlMobileOpcional: "https://storage.googleapis.com/demo/poster-mobile.webp",
    textoAlternativo: "Filme silencioso do átrio iluminado.",
    pontoFocalDesktop: { xPercentual: 60, yPercentual: 40 },
    pontoFocalMobile: { xPercentual: 50, yPercentual: 28 },
    intensidadeVeloEscuro: "equilibrado",
  };

  it("deve reproduzir vídeo silencioso quando há poster e movimento reduzido está desativado", () => {
    const resolvida = resolverMidiaEfetivaHome(midiaVideoComPoster, {
      modoMobile: false,
      movimentoReduzido: false,
    });

    expect(resolvida.renderizarVideo).toBe(true);
    expect(resolvida.urlVideo).toBe("https://storage.googleapis.com/demo/filme-atrio.mp4");
    expect(resolvida.urlImagemEstatica).toBe(
      "https://storage.googleapis.com/demo/poster-atrio.webp",
    );
    expect(resolvida.posicaoObjetoCss).toBe("60% 40%");
  });

  it("deve cair para imagem estática e ponto focal mobile quando movimento reduzido estiver ativo", () => {
    const resolvida = resolverMidiaEfetivaHome(midiaVideoComPoster, {
      modoMobile: true,
      movimentoReduzido: true,
    });

    expect(resolvida.renderizarVideo).toBe(false);
    expect(resolvida.urlVideo).toBeUndefined();
    expect(resolvida.urlImagemEstatica).toBe(
      "https://storage.googleapis.com/demo/poster-mobile.webp",
    );
    expect(resolvida.posicaoObjetoCss).toBe("50% 28%");
  });

  it("deve preservar todas as ações válidas sem impor teto artificial e descartar itens vazios", () => {
    const listaExcedente: ItemAcaoHome[] = Array.from({ length: 8 }, (_, indice) => ({
      id: `acao-${indice}`,
      rotulo: indice === 0 ? "   " : `Opção ${indice}`,
      tipoDestino: "microfluxo",
      destino: `#fluxo-${indice}`,
    }));

    const visiveis = obterAcoesPrincipaisVisiveis(listaExcedente);
    expect(visiveis).toHaveLength(7);
    expect(visiveis[0]?.rotulo).toBe("Opção 1");
  });

  it("deve construir metadados canônicos, priorizar imagem real do usuário e escapar JSON-LD", () => {
    const exemplarBase = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const paginaComCapaUsuario = {
      ...exemplarBase,
      identidade: {
        ...exemplarBase.identidade,
        nomeExibicao: "Garage 88 </script><script>alert(1)</script>",
      },
      midiaFundo: {
        ...exemplarBase.midiaFundo,
        tipo: "imagem" as const,
        urlPrincipal: "https://firebasestorage.googleapis.com/v0/b/nexo/o/capa.jpg?alt=media",
      },
      seo: {
        ...exemplarBase.seo,
        urlImagemCompartilhamento: undefined,
      },
    };

    const seoComCapa = construirResumoMetadadosSeo(paginaComCapaUsuario, "https://fluxo.com.br/");
    expect(seoComCapa.urlCanonica).toBe("https://fluxo.com.br/garage-88");
    expect(seoComCapa.urlImagemCompartilhamento).toBe(
      "https://firebasestorage.googleapis.com/v0/b/nexo/o/capa.jpg?alt=media",
    );

    const seoComImagemExplicita = construirResumoMetadadosSeo(
      {
        ...paginaComCapaUsuario,
        seo: {
          ...paginaComCapaUsuario.seo,
          urlImagemCompartilhamento: "https://cdn.exemplo.com/og-custom.png",
        },
      },
      "https://fluxo.com.br/",
    );
    expect(seoComImagemExplicita.urlImagemCompartilhamento).toBe(
      "https://cdn.exemplo.com/og-custom.png",
    );

    const seoComDegradadoELogoRaster = construirResumoMetadadosSeo(
      {
        ...paginaComCapaUsuario,
        midiaFundo: {
          ...paginaComCapaUsuario.midiaFundo,
          tipo: "degradado" as const,
        },
        identidade: {
          ...paginaComCapaUsuario.identidade,
          urlLogotipoOpcional: "/midias-demonstracao/logo-garage88.png",
        },
      },
      "https://fluxo.com.br/",
    );
    expect(seoComDegradadoELogoRaster.urlImagemCompartilhamento).toBe(
      "https://fluxo.com.br/midias-demonstracao/logo-garage88.png",
    );

    const seoSemImagemRaster = construirResumoMetadadosSeo(
      {
        ...paginaComCapaUsuario,
        midiaFundo: {
          ...paginaComCapaUsuario.midiaFundo,
          tipo: "degradado" as const,
        },
        identidade: {
          ...paginaComCapaUsuario.identidade,
          urlLogotipoOpcional: "/midias-demonstracao/logo.svg",
        },
      },
      "https://fluxo.com.br/",
    );
    expect(seoSemImagemRaster.urlImagemCompartilhamento).toBeUndefined();

    const jsonLd = serializarJsonLdSeguro(paginaComCapaUsuario, "https://fluxo.com.br");
    expect(jsonLd).not.toContain("</script>");
    expect(jsonLd).toContain("\\u003c/script>");
  });

  it("deve resolver ações da vitrine sincronizando automaticamente os microfluxos ativos na Home", () => {
    const acoesBase: ItemAcaoHome[] = [
      {
        id: "acao-site",
        rotulo: "Ver site oficial",
        tipoDestino: "link_externo",
        destino: "https://garage88.com.br",
      },
    ];

    const microfluxos = [
      {
        id: "fluxo-feirao",
        organizacaoId: "org-garage88",
        ancoraAcionamento: "#fluxo-atendimento",
        titulo: "Simulação Feirão",
        descricaoCurta: "Taxas reduzidas",
        textoBotaoConclusao: "Enviar",
        mensagemConfirmacaoTitulo: "Recebido",
        mensagemConfirmacaoCorpo: "Em breve retorno",
        etapaInicialId: "e1",
        etapas: [
          {
            id: "e1",
            tipoEtapa: "coleta_contato" as const,
            titulo: "Contato",
            obrigatoria: true,
          },
        ],
        ativo: true,
        ativoNaHome: true,
        rotuloBotaoHome: "Simular Condições do Feirão",
        subtituloBotaoHome: "Taxas a partir de 1,19% a.m.",
        iconeBotaoHome: "cotacao",
        destaquePrimarioHome: true,
        ordemHome: 1,
        atualizadoEmIso: "2026-11-10T00:00:00.000Z",
      },
      {
        id: "fluxo-oculto",
        organizacaoId: "org-garage88",
        ancoraAcionamento: "#fluxo-catalogo",
        titulo: "Catálogo",
        descricaoCurta: "Ver carros",
        textoBotaoConclusao: "Concluir",
        mensagemConfirmacaoTitulo: "Ok",
        mensagemConfirmacaoCorpo: "Ok",
        etapaInicialId: "e1",
        etapas: [
          {
            id: "e1",
            tipoEtapa: "coleta_contato" as const,
            titulo: "Contato",
            obrigatoria: true,
          },
        ],
        ativo: false,
        atualizadoEmIso: "2026-11-10T00:00:00.000Z",
      },
    ];

    const resolvidas = resolverAcoesVitrineComMicrofluxos(acoesBase, microfluxos);

    expect(resolvidas).toHaveLength(1);
    expect(resolvidas[0]?.rotulo).toBe("Simular Condições do Feirão");
    expect(resolvidas[0]?.subtituloDiscreto).toBe("Taxas a partir de 1,19% a.m.");
    expect(resolvidas[0]?.tipoDestino).toBe("microfluxo");
    expect(resolvidas[0]?.destino).toBe("#fluxo-atendimento");
    expect(resolvidas[0]?.destaquePrincipal).toBe(true);

    // Se não houver nenhum microfluxo ativo, preserva o fallback
    const fallback = resolverAcoesVitrineComMicrofluxos(acoesBase, []);
    expect(fallback).toHaveLength(1);
    expect(fallback[0]?.rotulo).toBe("Ver site oficial");
  });

  it.each([
    ["https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg", true],
    ["https://images.pexels.com/photos/2182970/foto.jpeg?w=96", true],
    ["https://firebasestorage.googleapis.com/v0/b/loja/o/foto.jpg", false],
    ["https://storage.googleapis.com/loja/foto.webp", false],
    ["https://images.pexels.com.exemplo.com/foto.jpg", false],
    ["/midias-demonstracao/logo.svg", true],
    ["/foto.jpg", false],
    ["http://127.0.0.1:9199/foto.jpg", true],
  ])("define corretamente o carregamento direto de %s", (url, direto) => {
    expect(deveIgnorarOtimizadorImagem(url)).toBe(direto);
  });
});
