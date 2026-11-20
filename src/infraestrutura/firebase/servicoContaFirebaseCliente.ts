"use client";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import type {
  DadosAlteracaoSenhaUsuario,
  DadosAtualizacaoPerfilUsuario,
  DadosExclusaoContaUsuario,
  PortaGestaoContaCliente,
} from "@/aplicacao/portas/portasContaUsuario";
import { obterServicosClienteFirebase } from "./clienteFirebase";
import { traduzirErroAutenticacaoFirebase } from "./tradutorErrosFirebaseAuth";
import { ErroNaoAutenticado, ErroValidacaoDominio } from "@/dominio/erros/errosDominio";

export class ServicoContaFirebaseCliente implements PortaGestaoContaCliente {
  public async atualizarPerfil(dados: DadosAtualizacaoPerfilUsuario): Promise<void> {
    const { autenticacao, bancoDados } = obterServicosClienteFirebase();
    const usuarioAtual = autenticacao.currentUser;

    if (!usuarioAtual) {
      throw new ErroNaoAutenticado("Sessão expirada. Faça login novamente.");
    }

    try {
      const nomeLimpo = dados.nomeExibicao.trim();
      await updateProfile(usuarioAtual, {
        displayName: nomeLimpo,
      });

      // Sincroniza espelho do usuário no Firestore se o documento existir
      const refUsuario = doc(bancoDados, "usuarios", usuarioAtual.uid);
      await updateDoc(refUsuario, {
        nomeExibicao: nomeLimpo,
        atualizadoEmIso: new Date().toISOString(),
      }).catch(() => undefined);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async alterarSenha(dados: DadosAlteracaoSenhaUsuario): Promise<void> {
    const { autenticacao } = obterServicosClienteFirebase();
    const usuarioAtual = autenticacao.currentUser;

    if (!usuarioAtual || !usuarioAtual.email) {
      throw new ErroNaoAutenticado("Sessão expirada. Faça login novamente.");
    }

    try {
      // Reautentica para garantir credencial recente e evitar 'auth/requires-recent-login'
      const credencial = EmailAuthProvider.credential(
        usuarioAtual.email,
        dados.senhaAtual.trim(),
      );
      await reauthenticateWithCredential(usuarioAtual, credencial);

      // Atualiza para a nova senha
      await updatePassword(usuarioAtual, dados.novaSenha.trim());
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async excluirContaDefinitivamente(dados?: DadosExclusaoContaUsuario): Promise<void> {
    const { autenticacao } = obterServicosClienteFirebase();
    const usuarioAtual = autenticacao.currentUser;

    if (!usuarioAtual) {
      throw new ErroNaoAutenticado("Sessão expirada. Faça login novamente.");
    }

    // Se o usuário tem autenticação por senha e informou a senha, reautentica no client primeiro
    const temProvedorSenha = usuarioAtual.providerData.some(
      (item) => item.providerId === "password",
    );

    if (temProvedorSenha && dados?.senhaAtual && usuarioAtual.email) {
      try {
        const credencial = EmailAuthProvider.credential(
          usuarioAtual.email,
          dados.senhaAtual.trim(),
        );
        await reauthenticateWithCredential(usuarioAtual, credencial);
      } catch (erro) {
        throw traduzirErroAutenticacaoFirebase(erro);
      }
    }

    // Chama o endpoint seguro do backend para limpeza em cascata, cancelamentos e exclusão final
    const resposta = await fetch("/api/conta/excluir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirmouPerdaPeriodoRestante: Boolean(dados?.confirmouPerdaPeriodoRestante),
      }),
    });

    if (!resposta.ok) {
      const payloadErro = await resposta.json().catch(() => ({}));
      throw new ErroValidacaoDominio(
        payloadErro.erro || "Falha ao processar exclusão da conta.",
        "FALHA_EXCLUSAO_CONTA",
      );
    }

    // Desconecta localmente no client
    await autenticacao.signOut().catch(() => undefined);
  }
}

export const servicoContaCliente = new ServicoContaFirebaseCliente();

