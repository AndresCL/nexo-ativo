import { describe, expect, it } from "vitest";
import {
  criarConteudoInicialOrganizacao,
  IDS_CONTEUDO_INICIAL_ORGANIZACAO,
} from "@/dominio/entidades/conteudoInicialOrganizacao";
import { avaliarIntegridadeGrafoMicrofluxo } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { CODIGOS_PERFIL_PUBLICIDADE } from "@/dominio/publicidade/tiposPerfilPublicidade";
import { exigirMicrofluxosConformesPublicidade } from "@/dominio/publicidade/validadorPublicacaoPublicidade";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
} from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";

describe("criarConteudoInicialOrganizacao", () => {
  const agoraIso = "2026-11-25T10:00:00.000Z";

  it("gera fluxos, equipe e produtos válidos nos esquemas Zod e DAG íntegro para perfil padrão", () => {
    const conteudo = criarConteudoInicialOrganizacao({
      organizacaoId: "org-123",
      nomeOrganizacao: "Studio Aurora",
      nomeProprietarioOpcional: "Ana Silva",
      perfilPublicidade: "padrao",
      limiteProfissionaisAtivos: 1,
      agoraIso,
    });

    expect(conteudo.microfluxos.map((m) => m.id)).toEqual([
      IDS_CONTEUDO_INICIAL_ORGANIZACAO.fluxoAtendimento,
      IDS_CONTEUDO_INICIAL_ORGANIZACAO.acaoEquipe,
      IDS_CONTEUDO_INICIAL_ORGANIZACAO.acaoProdutos,
    ]);
    expect(conteudo.profissionais).toHaveLength(1);
    expect(conteudo.profissionais[0]?.nomeCompleto).toBe("Ana Silva");
    expect(conteudo.produtos).toHaveLength(2);

    for (const fluxo of conteudo.microfluxos) {
      expect(esquemaDefinicaoMicrofluxo.safeParse(fluxo).success).toBe(true);
      expect(avaliarIntegridadeGrafoMicrofluxo(fluxo)).toEqual([]);
    }

    for (const profissional of conteudo.profissionais) {
      expect(esquemaProfissionalEquipe.safeParse(profissional).success).toBe(true);
    }

    for (const produto of conteudo.produtos) {
      expect(esquemaProdutoCatalogo.safeParse(produto).success).toBe(true);
    }

    expect(conteudo.microfluxos[0]?.descricaoCurta).toContain("Studio Aurora");
    expect(conteudo.microfluxos[0]?.mensagemConfirmacaoCorpo).toContain("Studio Aurora");
  });

  it("cria até 2 profissionais quando o plano permite equipe e 0 quando o limite é 0", () => {
    const equipe = criarConteudoInicialOrganizacao({
      organizacaoId: "org-equipe",
      nomeOrganizacao: "Clínica Horizonte",
      limiteProfissionaisAtivos: 5,
      agoraIso,
    });
    expect(equipe.profissionais).toHaveLength(2);
    expect(equipe.profissionais[0]?.identificadorCartao).toBe("responsavel-principal");
    expect(equipe.profissionais[1]?.identificadorCartao).toBe("atendimento-equipe");

    const semEquipe = criarConteudoInicialOrganizacao({
      organizacaoId: "org-zero",
      nomeOrganizacao: "Zero",
      limiteProfissionaisAtivos: 0,
      agoraIso,
    });
    expect(semEquipe.profissionais).toHaveLength(0);
  });

  it("respeita as políticas de publicidade (OAB, CFM, CFO e padrão) sem gerar violações", () => {
    for (const perfil of CODIGOS_PERFIL_PUBLICIDADE) {
      const conteudo = criarConteudoInicialOrganizacao({
        organizacaoId: `org-${perfil}`,
        nomeOrganizacao: "Organização Teste",
        perfilPublicidade: perfil,
        limiteProfissionaisAtivos: 1,
        agoraIso,
      });

      const politica = obterPoliticaPublicidade(perfil);
      expect(() =>
        exigirMicrofluxosConformesPublicidade(politica, conteudo.microfluxos),
      ).not.toThrow();

      if (!politica.permiteEtapasComProdutos()) {
        expect(conteudo.produtos).toHaveLength(0);
        expect(conteudo.microfluxos.some((m) => m.tipoAcao === "secao_produtos")).toBe(false);
      } else {
        expect(conteudo.produtos.length).toBeGreaterThan(0);
      }
    }
  });
});

