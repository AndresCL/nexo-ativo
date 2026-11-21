"use client";

import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  type User as UsuarioFirebase,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { ehIdentificadorPublicoValido } from "@/dominio/objetos-valor/identificadorPublico";
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
      const { funcoesRemotas } = obterServicosClienteFirebase();
      const chamarSolicitacao = httpsCallable<{ email: string }, { sucesso: boolean }>(
        funcoesRemotas,
        "solicitarRecuperacaoSenha",
      );
      await chamarSolicitacao({ email });
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async validarCodigoRedefinicaoSenha(codigoAcao: string): Promise<string> {
    try {
      const { autenticacao } = obterServicosClienteFirebase();
      return await verifyPasswordResetCode(autenticacao, codigoAcao);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async confirmarRedefinicaoSenha(codigoAcao: string, novaSenha: string): Promise<void> {
    try {
      const { autenticacao } = obterServicosClienteFirebase();
      await confirmPasswordReset(autenticacao, codigoAcao, novaSenha);
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

  public async verificarDisponibilidadeIdentificador(
    identificadorPublico: string,
  ): Promise<boolean> {
    const slugNormalizado = identificadorPublico.trim().toLowerCase();
    if (!ehIdentificadorPublicoValido(slugNormalizado)) {
      return false;
    }

    try {
      const { bancoDados } = obterServicosClienteFirebase();
      const refIdentificador = doc(bancoDados, "identificadoresPublicos", slugNormalizado);
      const instantaneo = await getDoc(refIdentificador);
      return !instantaneo.exists();
    } catch {
      return true;
    }
  }
}

export const servicoAutenticacaoCliente = new ServicoAutenticacaoFirebaseCliente();
