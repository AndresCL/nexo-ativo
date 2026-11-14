import { describe, expect, it } from "vitest";
import {
  criarResumoDireitosPlanoInicial,
  type MembroOrganizacao,
  type Organizacao,
  type UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { ErroAcessoNegado, ErroNaoAutenticado } from "@/dominio/erros/errosDominio";
import {
  exigirPermissaoOrganizacao,
  exigirPrivilegioFundador,
  verificarPermissaoOrganizacao,
} from "@/dominio/permissoes/autorizadorOrganizacao";

function criarOrganizacaoExemplo(parcial?: Partial<Organizacao>): Organizacao {
  return {
    id: "org-1",
    nome: "Atelier Exemplo",
    identificadorPublico: "atelier-exemplo",
    segmentoAtividade: "Arquitetura",
    situacao: "ativa",
    resumoDireitosPlano: criarResumoDireitosPlanoInicial(),
    criadoEmIso: "2026-11-08T10:00:00.000Z",
    atualizadoEmIso: "2026-11-08T10:00:00.000Z",
    ...parcial,
  };
}

function criarUsuarioExemplo(parcial?: Partial<UsuarioAutenticado>): UsuarioAutenticado {
  return {
    uid: "user-1",
    email: "ana@atelier.com.br",
    nomeExibicao: "Ana",
    fotoUrl: null,
    emailVerificado: true,
    provedoresConectados: ["password"],
    ...parcial,
  };
}

describe("Autorizador Multi-Tenant de Organização", () => {
  it("deve bloquear usuários não autenticados, de outra organização ou com vínculo revogado", () => {
    const org = criarOrganizacaoExemplo();
    const usuario = criarUsuarioExemplo();

    expect(() => exigirPermissaoOrganizacao(null, org, null, "visualizar_painel")).toThrowError(
      ErroNaoAutenticado,
    );

    const membroOutraOrg: MembroOrganizacao = {
      usuarioId: usuario.uid,
      organizacaoId: "org-2",
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: "2026-11-08T10:00:00.000Z",
    };

    expect(verificarPermissaoOrganizacao(usuario, org, membroOutraOrg, "visualizar_painel")).toBe(
      false,
    );

    const membroRevogado: MembroOrganizacao = {
      usuarioId: usuario.uid,
      organizacaoId: org.id,
      papel: "administrador",
      situacao: "revogado",
      adicionadoEmIso: "2026-11-08T10:00:00.000Z",
    };

    expect(verificarPermissaoOrganizacao(usuario, org, membroRevogado, "visualizar_painel")).toBe(
      false,
    );
  });

  it("deve respeitar hierarquia de papéis e exigir e-mail verificado para publicar ou gerenciar assinatura", () => {
    const org = criarOrganizacaoExemplo();
    const usuarioNaoVerificado = criarUsuarioExemplo({ emailVerificado: false });
    const membroProprietario: MembroOrganizacao = {
      usuarioId: usuarioNaoVerificado.uid,
      organizacaoId: org.id,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: "2026-11-08T10:00:00.000Z",
    };

    // Pode editar rascunho mesmo antes de verificar e-mail
    expect(
      verificarPermissaoOrganizacao(
        usuarioNaoVerificado,
        org,
        membroProprietario,
        "editar_aparencia_e_conteudo",
      ),
    ).toBe(true);

    // Não pode publicar nem gerenciar assinatura sem verificar e-mail
    expect(() =>
      exigirPermissaoOrganizacao(usuarioNaoVerificado, org, membroProprietario, "publicar_pagina"),
    ).toThrowError(ErroAcessoNegado);

    // Membro comum gerencia solicitações, mas não gerencia assinatura nem edita aparência
    const usuarioVerificado = criarUsuarioExemplo({ uid: "membro-1", emailVerificado: true });
    const membroComum: MembroOrganizacao = {
      usuarioId: "membro-1",
      organizacaoId: org.id,
      papel: "membro",
      situacao: "ativo",
      adicionadoEmIso: "2026-11-08T10:00:00.000Z",
    };

    expect(
      verificarPermissaoOrganizacao(usuarioVerificado, org, membroComum, "gerenciar_solicitacoes"),
    ).toBe(true);
    expect(
      verificarPermissaoOrganizacao(
        usuarioVerificado,
        org,
        membroComum,
        "editar_aparencia_e_conteudo",
      ),
    ).toBe(false);
  });

  it("deve permitir publicação durante carência e bloquear novas publicações em inadimplência", () => {
    const usuario = criarUsuarioExemplo();
    const membro: MembroOrganizacao = {
      usuarioId: usuario.uid,
      organizacaoId: "org-1",
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: "2026-11-08T10:00:00.000Z",
    };

    const orgEmCarencia = criarOrganizacaoExemplo({
      resumoDireitosPlano: {
        ...criarResumoDireitosPlanoInicial(),
        planoCodigo: "pro",
        situacaoAssinatura: "em_carencia",
      },
    });

    const orgInadimplente = criarOrganizacaoExemplo({
      resumoDireitosPlano: {
        ...criarResumoDireitosPlanoInicial(),
        planoCodigo: "pro",
        situacaoAssinatura: "inadimplente",
      },
    });

    expect(verificarPermissaoOrganizacao(usuario, orgEmCarencia, membro, "publicar_pagina")).toBe(
      true,
    );
    expect(verificarPermissaoOrganizacao(usuario, orgInadimplente, membro, "publicar_pagina")).toBe(
      false,
    );
  });

  it("deve validar rigorosamente a Custom Claim papelPlataforma === fundador", () => {
    const comum = criarUsuarioExemplo();
    const fundador = criarUsuarioExemplo({ papelPlataforma: "fundador" });

    expect(() => exigirPrivilegioFundador(comum)).toThrowError(ErroAcessoNegado);
    expect(exigirPrivilegioFundador(fundador).uid).toBe(fundador.uid);
  });
});
