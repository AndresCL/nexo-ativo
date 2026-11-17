"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as UsuarioFirebase,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import type {
  PapelPlataforma,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { ErroNaoAutenticado } from "@/dominio/erros/errosDominio";
import type {
  PortaAutenticacaoCliente,
  PortaProvisionamentoOrganizacaoCliente,
  ResultadoCriacaoOrganizacao,
} from "@/aplicacao/portas/portasAutenticacao";
import type { DadosCriarOrganizacaoInicial } from "@/validacoes/esquemasAutenticacao";
import { obterServicosClienteFirebase } from "./clienteFirebase";
import { traduzirErroAutenticacaoFirebase } from "./tradutorErrosFirebaseAuth";

async function sincronizarCookieSessaoServidor(idToken: string): Promise<void> {
  const resposta = await fetch("/api/autenticacao/sessao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!resposta.ok) {
    throw new Error("Falha ao registrar sessão segura no servidor.");
  }
}

async function limparCookieSessaoServidor(): Promise<void> {
  await fetch("/api/autenticacao/sessao", {
    method: "DELETE",
  });
}

async function converterUsuarioFirebaseParaDominio(
  usuarioFirebase: UsuarioFirebase,
  forcarRenovacaoToken = false,
): Promise<UsuarioAutenticado> {
  const resultadoToken = await usuarioFirebase.getIdTokenResult(forcarRenovacaoToken);
  await sincronizarCookieSessaoServidor(resultadoToken.token);

  const papelClaim = resultadoToken.claims.papelPlataforma;
  const papelPlataforma: PapelPlataforma | undefined =
    papelClaim === "fundador" ? "fundador" : undefined;

  return {
    uid: usuarioFirebase.uid,
    email: usuarioFirebase.email,
    nomeExibicao: usuarioFirebase.displayName,
    fotoUrl: usuarioFirebase.photoURL,
    emailVerificado: usuarioFirebase.emailVerified,
    ...(papelPlataforma ? { papelPlataforma } : {}),
    provedoresConectados: usuarioFirebase.providerData.map((item) => item.providerId),
  };
}

export class ServicoAutenticacaoFirebaseCliente
  implements PortaAutenticacaoCliente, PortaProvisionamentoOrganizacaoCliente
{
  public async entrarComEmailESenha(email: string, senha: string): Promise<UsuarioAutenticado> {
    try {
      const { autenticacao } = obterServicosClienteFirebase();
      const credencial = await signInWithEmailAndPassword(
        autenticacao,
        email.trim().toLowerCase(),
        senha.trim(),
      );
      return await converterUsuarioFirebaseParaDominio(credencial.user);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async cadastrarComEmailESenha(
    nomeExibicao: string,
    email: string,
    senha: string,
  ): Promise<UsuarioAutenticado> {
    try {
      const { autenticacao } = obterServicosClienteFirebase();
      const credencial = await createUserWithEmailAndPassword(
        autenticacao,
        email.trim().toLowerCase(),
        senha.trim(),
      );
      await updateProfile(credencial.user, { displayName: nomeExibicao.trim() });
      await sendEmailVerification(credencial.user);
      return await converterUsuarioFirebaseParaDominio(credencial.user, true);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async entrarComGoogle(): Promise<UsuarioAutenticado> {
    try {
      const { autenticacao } = obterServicosClienteFirebase();
      const provedorGoogle = new GoogleAuthProvider();
      provedorGoogle.setCustomParameters({ prompt: "select_account" });
      const credencial = await signInWithPopup(autenticacao, provedorGoogle);
      return await converterUsuarioFirebaseParaDominio(credencial.user);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async solicitarRecuperacaoSenha(email: string): Promise<void> {
    try {
      const { autenticacao } = obterServicosClienteFirebase();
      await sendPasswordResetEmail(autenticacao, email);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async reenviarVerificacaoEmail(): Promise<void> {
    try {
      const { autenticacao } = obterServicosClienteFirebase();
      if (!autenticacao.currentUser) {
        throw new ErroNaoAutenticado();
      }
      await sendEmailVerification(autenticacao.currentUser);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async recarregarEstadoUsuario(): Promise<UsuarioAutenticado | null> {
    try {
      const { autenticacao } = obterServicosClienteFirebase();
      if (!autenticacao.currentUser) {
        return null;
      }
      await autenticacao.currentUser.reload();
      return await converterUsuarioFirebaseParaDominio(autenticacao.currentUser, true);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async forcarAtualizacaoTokenSessao(): Promise<void> {
    const { autenticacao } = obterServicosClienteFirebase();
    if (!autenticacao.currentUser) {
      return;
    }
    const novoIdToken = await autenticacao.currentUser.getIdToken(true);
    await sincronizarCookieSessaoServidor(novoIdToken);
  }

  public async encerrarSessao(): Promise<void> {
    const { autenticacao } = obterServicosClienteFirebase();
    await limparCookieSessaoServidor();
    await signOut(autenticacao);
  }

  public async criarOrganizacaoInicial(
    dados: DadosCriarOrganizacaoInicial,
  ): Promise<ResultadoCriacaoOrganizacao> {
    try {
      const { funcoesRemotas } = obterServicosClienteFirebase();
      const chamarCriacao = httpsCallable<
        DadosCriarOrganizacaoInicial,
        ResultadoCriacaoOrganizacao
      >(funcoesRemotas, "criarOrganizacaoInicial");

      const resposta = await chamarCriacao(dados);
      return resposta.data;
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }
}

export const servicoAutenticacaoCliente = new ServicoAutenticacaoFirebaseCliente();
