import { describe, expect, it } from "vitest";
import {
  TAMANHO_MAXIMO_IMAGEM_BYTES,
  TAMANHO_MAXIMO_VIDEO_BYTES,
  avaliarProntidaoPublicacaoPagina,
  converterRascunhoParaConteudoPublicado,
  criarRascunhoConfiguracaoPaginaPadrao,
  hidratarRascunhoConfiguracaoPagina,
  removerCamposIndefinidosParaFirestore,
  validarArquivoMidiaEditorial,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import { esquemaRascunhoConfiguracaoPagina } from "@/validacoes/esquemaRascunhoPagina";

describe("Domínio: Rascunho de Configuração da Página e Prontidão de Publicação", () => {
  it("preserva telefone e celular ao salvar, reabrir e publicar a identidade", () => {
    const base = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-teste",
      nomeOrganizacao: "Teste",
    });
    const rascunho = esquemaRascunhoConfiguracaoPagina.parse({
      ...base,
      identidade: {
        ...base.identidade,
        telefonePrincipalOpcional: "(11) 3333-4444",
        celularOpcional: "(11) 99999-8888",
      },
    });
    const hidratado = hidratarRascunhoConfiguracaoPagina(
      { ...rascunho },
      {
        organizacaoId: "org-teste",
        nomeOrganizacao: "Teste",
      },
    );
    const publicado = esquemaConteudoPaginaPublicada.parse(
      converterRascunhoParaConteudoPublicado(hidratado, {
        identificadorPublico: "teste",
        versaoPublicada: 1,
      }),
    );
    expect(publicado.identidade).toMatchObject({
      telefonePrincipalOpcional: "(11) 3333-4444",
      celularOpcional: "(11) 99999-8888",
    });
  });
  it("deve criar um rascunho padrão válido que projeta uma página publicada íntegra", () => {
    const rascunho = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-alvorada",
      nomeOrganizacao: "Estúdio Alvorada",
      agoraIso: "2026-11-08T15:00:00.000Z",
    });

    const pendencias = avaliarProntidaoPublicacaoPagina(rascunho, { emailVerificado: true });
    expect(pendencias).toHaveLength(0);

    const conteudoPublicado = converterRascunhoParaConteudoPublicado(rascunho, {
      identificadorPublico: "estudio-alvorada",
      versaoPublicada: 1,
    });

    const validacao = esquemaConteudoPaginaPublicada.safeParse(conteudoPublicado);
    expect(validacao.success).toBe(true);
  });

  it("deve hidratar rascunhos legados criados na Fase 2 preservando título e descrição", () => {
    const rascunhoLegado = {
      organizacaoId: "org-legada",
      composicaoVisual: "retrato_editorial",
      tituloEditorial: "Consultoria Jurídica Patrimonial",
      descricaoEditorial: "Atuação estratégica com atendimento direto.",
      paletaId: "marfim_editorial",
      tipografiaId: "classico_editorial",
      atualizadoEmIso: "2026-11-08T12:00:00.000Z",
    };

    const hidratado = hidratarRascunhoConfiguracaoPagina(rascunhoLegado, {
      organizacaoId: "org-legada",
      nomeOrganizacao: "Dra. Helena Vasconcelos",
    });

    expect(hidratado.composicaoVisual).toBe("retrato_editorial");
    expect(hidratado.paletaId).toBe("marfim_editorial");
    expect(hidratado.identidade.nomeExibicao).toBe("Dra. Helena Vasconcelos");
    expect(hidratado.chamadaEditorial.tituloPrincipal).toBe("Consultoria Jurídica Patrimonial");
    expect(hidratado.chamadaEditorial.descricaoCurta).toBe(
      "Atuação estratégica com atendimento direto.",
    );
  });

  it("deve apontar pendências quando faltar confirmação de e-mail ou poster de vídeo", () => {
    const rascunhoBase = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-video",
      nomeOrganizacao: "Casa Horizonte",
    });

    const rascunhoComVideoSemPoster = {
      ...rascunhoBase,
      midiaFundo: {
        ...rascunhoBase.midiaFundo,
        tipo: "video" as const,
        urlPrincipal: "https://storage.googleapis.com/demo/ambiente.mp4",
      },
    };

    const pendencias = avaliarProntidaoPublicacaoPagina(rascunhoComVideoSemPoster, {
      emailVerificado: false,
    });

    const codigos = pendencias.map((item) => item.codigo);
    expect(codigos).toContain("POSTER_VIDEO_OBRIGATORIO");
    expect(codigos).toContain("EMAIL_NAO_VERIFICADO");
  });

  it("deve validar formatos MIME e limites de bytes alinhados com storage.rules", () => {
    expect(() =>
      validarArquivoMidiaEditorial(
        { nome: "retrato.webp", tamanhoBytes: 500_000, tipoMime: "image/webp" },
        "imagem",
      ),
    ).not.toThrow();

    expect(() =>
      validarArquivoMidiaEditorial(
        {
          nome: "pesada.png",
          tamanhoBytes: TAMANHO_MAXIMO_IMAGEM_BYTES + 1,
          tipoMime: "image/png",
        },
        "imagem",
      ),
    ).toThrow(/8 MB/i);

    expect(() =>
      validarArquivoMidiaEditorial(
        { nome: "executavel.svg", tamanhoBytes: 1024, tipoMime: "image/svg+xml" },
        "imagem",
      ),
    ).toThrow(/Formato de imagem inválido/i);

    expect(() =>
      validarArquivoMidiaEditorial(
        {
          nome: "abertura.mp4",
          tamanhoBytes: TAMANHO_MAXIMO_VIDEO_BYTES + 100,
          tipoMime: "video/mp4",
        },
        "video",
      ),
    ).toThrow(/25 MB/i);
  });

  it("deve remover recursivamente campos undefined antes de persistir no Firestore", () => {
    const objetoComIndefinidos = {
      titulo: "Válido",
      opcionalAusente: undefined,
      aninhado: {
        ativo: true,
        vazio: undefined,
      },
      lista: [{ id: "1", subtitulo: undefined }],
    };

    const limpo = removerCamposIndefinidosParaFirestore(objetoComIndefinidos);
    expect("opcionalAusente" in limpo).toBe(false);
    expect("vazio" in limpo.aninhado).toBe(false);
    expect("subtitulo" in limpo.lista[0]!).toBe(false);
    expect(limpo.titulo).toBe("Válido");
  });
});
