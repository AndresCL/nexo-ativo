import { describe, expect, it } from "vitest";
import { criarResumoDireitosPlanoInicial } from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  construirUrlPublicaCartaoProfissional,
  converterTextoMoedaParaCentavos,
  formatarApresentacaoPrecoItem,
  validarIdentificadorCartaoProfissional,
  validarLimiteProfissionaisPlano,
  type ProfissionalEquipe,
} from "@/dominio/entidades/catalogoConteudo";
import { gerarMatrizQrCode, gerarSvgQrCode } from "@/dominio/servicos/geradorQrCodeSvg";

describe("Domínio: Catálogo Compartilhado, Cota de Equipe por Plano e QR Code ISO/IEC 18004", () => {
  it("deve converter textos monetários para centavos inteiros sem erro de ponto flutuante", () => {
    expect(converterTextoMoedaParaCentavos("19,99")).toBe(1999);
    expect(converterTextoMoedaParaCentavos("1.250,50")).toBe(125050);
    expect(converterTextoMoedaParaCentavos("850")).toBe(85000);
    expect(converterTextoMoedaParaCentavos("   ")).toBeUndefined();

    expect(
      formatarApresentacaoPrecoItem({
        centavos: 180000,
        rotuloOpcional: "A partir de",
      }),
    ).toBe("A partir de R$ 1.800,00");

    expect(formatarApresentacaoPrecoItem({})).toBe("Sob consulta");
  });

  it("deve impor o limite de profissionais ativos conforme o plano da organização", () => {
    const profissionalExistente: ProfissionalEquipe = {
      id: "prof-1",
      organizacaoId: "org-1",
      identificadorCartao: "helena-vasconcelos",
      nomeCompleto: "Dra. Helena Vasconcelos",
      cargoOuEspecialidade: "Advogada Titular",
      minibiografia: "Especialista em direito patrimonial.",
      pontoFocalFoto: { xPercentual: 50, yPercentual: 28 },
      aceitaSolicitacoesDiretas: true,
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: "2026-11-08T12:00:00.000Z",
    };

    const direitosIndividual = criarResumoDireitosPlanoInicial(); // limiteProfissionaisAtivos: 1

    // Editar o próprio profissional ativo deve ser permitido
    expect(() =>
      validarLimiteProfissionaisPlano({
        profissionaisExistentes: [profissionalExistente],
        resumoDireitosPlano: direitosIndividual,
        idProfissionalEmEdicao: "prof-1",
        seraAtivo: true,
      }),
    ).not.toThrow();

    // Adicionar um 2º profissional ativo em plano individual deve falhar
    expect(() =>
      validarLimiteProfissionaisPlano({
        profissionaisExistentes: [profissionalExistente],
        resumoDireitosPlano: direitosIndividual,
        seraAtivo: true,
      }),
    ).toThrow(/Plano Pro/i);

    // No Plano Pro (até 10 ativos), o 2º profissional deve ser aceito
    expect(() =>
      validarLimiteProfissionaisPlano({
        profissionaisExistentes: [profissionalExistente],
        resumoDireitosPlano: {
          ...direitosIndividual,
          planoCodigo: "pro",
          limiteProfissionaisAtivos: 10,
        },
        seraAtivo: true,
      }),
    ).not.toThrow();
  });

  it("deve validar unicidade de slug de cartão digital dentro da mesma organização", () => {
    const existentes: readonly ProfissionalEquipe[] = [
      {
        id: "prof-1",
        organizacaoId: "org-1",
        identificadorCartao: "caio-monteiro",
        nomeCompleto: "Caio Monteiro",
        cargoOuEspecialidade: "Arquiteto",
        minibiografia: "Sócio-diretor.",
        pontoFocalFoto: { xPercentual: 50, yPercentual: 30 },
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ];

    expect(() =>
      validarIdentificadorCartaoProfissional({
        identificadorCartao: "caio-monteiro",
        profissionaisExistentes: existentes,
      }),
    ).toThrow(/já utiliza este endereço/i);

    expect(
      validarIdentificadorCartaoProfissional({
        identificadorCartao: "luisa-alencar",
        profissionaisExistentes: existentes,
      }),
    ).toBe("luisa-alencar");

    expect(
      construirUrlPublicaCartaoProfissional({
        urlBasePublica: "https://fluxo.app/",
        identificadorOrganizacao: "estudio-alvorada",
        identificadorCartao: "luisa-alencar",
      }),
    ).toBe("https://fluxo.app/estudio-alvorada/equipe/luisa-alencar");
  });

  it("deve gerar matriz QR Code ISO/IEC 18004 e SVG vetorial escapado com padrões localizadores íntegros", () => {
    const urlCartao = "https://fluxo.app/estudio-alvorada/equipe/caio-monteiro";
    const matriz = gerarMatrizQrCode(urlCartao);

    expect(matriz.dimensao).toBe(17 + matriz.versao * 4);
    expect(matriz.modulos).toHaveLength(matriz.dimensao);

    // Canto superior esquerdo do finder pattern (0,0) e centro (3,3) devem ser escuros
    expect(matriz.modulos[0]?.[0]).toBe(true);
    expect(matriz.modulos[3]?.[3]).toBe(true);
    // Anel interno branco do finder em (1,1) deve ser claro
    expect(matriz.modulos[1]?.[1]).toBe(false);
    // Separador branco em (7,0) deve ser claro
    expect(matriz.modulos[7]?.[0]).toBe(false);
    // Dark module fixo em (n - 8, 8) deve ser escuro
    expect(matriz.modulos[matriz.dimensao - 8]?.[8]).toBe(true);

    const svg = gerarSvgQrCode(urlCartao, {
      tituloAcessivel: 'Cartão <script>"Caio"</script>',
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("&lt;script&gt;&quot;Caio&quot;&lt;/script&gt;");
    expect(svg).not.toContain("<script>");
  });
});
