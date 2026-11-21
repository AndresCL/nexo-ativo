"use client";

import { useState } from "react";
import * as Dialogo from "@radix-ui/react-dialog";
import { AlertTriangle, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Botao } from "@/componentes/interface/Botao";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import {
  TEXTO_CONFIRMACAO_EXCLUSAO_CONTA,
} from "@/validacoes/esquemasContaUsuario";
import {
  servicoContaCliente,
  type ServicoContaFirebaseCliente,
} from "@/infraestrutura/firebase/servicoContaFirebaseCliente";
import type { ResumoEstadoExclusaoConta } from "@/aplicacao/portas/portasContaUsuario";

export interface PropriedadesZonaPerigoExcluirConta {
  readonly estadoExclusao: ResumoEstadoExclusaoConta;
  readonly provedores: readonly string[];
  readonly servicoConta?: ServicoContaFirebaseCliente;
}

export function ZonaPerigoExcluirConta({
  estadoExclusao,
  provedores,
  servicoConta = servicoContaCliente,
}: PropriedadesZonaPerigoExcluirConta) {
  const [modalAberto, setModalAberto] = useState(false);
  const [termoDigitado, setTermoDigitado] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [consentimentoPeriodo, setConsentimentoPeriodo] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const temProvedorSenha = provedores.includes("password");

  const podeConfirmar =
    termoDigitado.trim() === TEXTO_CONFIRMACAO_EXCLUSAO_CONTA &&
    (!temProvedorSenha || senhaConfirmacao.length >= 1) &&
    (!estadoExclusao.canceladaComAcessoRestante || consentimentoPeriodo);

  async function executarExclusao() {
    setExcluindo(true);
    try {
      await servicoConta.excluirContaDefinitivamente({
        senhaAtual: temProvedorSenha ? senhaConfirmacao : undefined,
        confirmouPerdaPeriodoRestante: consentimentoPeriodo,
      });

      notificar.sucesso("Sua conta e dados foram eliminados com sucesso.");
      window.location.href = "/entrar";
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : "Não foi possível excluir sua conta.";
      notificar.erro(mensagem);
      setExcluindo(false);
    }
  }

  function formatarData(dataIso?: string): string {
    if (!dataIso) return "";
    return dataIso.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, "$3/$2/$1");
  }

  return (
    <>
      <section
        aria-labelledby="titulo-zona-perigo"
        className="rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs sm:p-6"
      >
        <div className="border-b border-marfim-100 pb-3">
          <h2 id="titulo-zona-perigo" className="text-sm font-semibold text-mineral-950">
            Eliminar conta
          </h2>
          <p className="mt-0.5 text-xs text-mineral-500">
            Exclusão definitiva da sua conta, vitrine publicada e histórico de dados.
          </p>
        </div>

        <div className="mt-4 text-xs text-mineral-600 space-y-3">
          <p className="leading-relaxed">
            A exclusão é permanente e irreversível. Ao confirmar, sua vitrine pública será desativada, seus QR codes perderão o redirecionamento e todo o histórico será removido.
          </p>

          {estadoExclusao.bloqueadoPorAssinaturaAtiva ? (
            <div className="rounded-xl border border-marfim-200 bg-marfim-50/60 p-3.5 text-xs text-mineral-800">
              <p className="font-semibold flex items-center gap-1.5 text-mineral-900">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Assinatura ativa detectada
              </p>
              <p className="mt-1 text-mineral-600 leading-relaxed">
                {estadoExclusao.motivoBloqueio ||
                  "Você possui uma assinatura em andamento. Cancele a assinatura antes de eliminar sua conta."}
              </p>
              <div className="mt-2.5">
                <Link
                  href="/painel/assinatura"
                  className="inline-flex items-center gap-1 font-medium text-mineral-900 underline hover:text-mineral-950"
                >
                  Ir para gerenciamento da assinatura
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : estadoExclusao.ehFundador ? (
            <div className="rounded-xl border border-marfim-200 bg-marfim-50/60 p-3.5 text-xs text-mineral-700">
              <p className="font-semibold text-mineral-900">Conta de Fundador</p>
              <p className="mt-0.5 text-mineral-600">
                Contas com papel de Fundador não podem ser auto-eliminadas pelo painel de cliente.
              </p>
            </div>
          ) : (
            <div className="pt-2">
              <Botao
                type="button"
                tamanho="compacto"
                onClick={() => setModalAberto(true)}
                className="rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                Eliminar conta definitivamente
              </Botao>
            </div>
          )}
        </div>
      </section>

      {/* Modal de confirmação com alto atrito */}
      <Dialogo.Root open={modalAberto} onOpenChange={setModalAberto}>
        <Dialogo.Portal>
          <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialogo.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-200 bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <Dialogo.Title className="text-base font-bold text-mineral-950">
                  Tem certeza absoluta?
                </Dialogo.Title>
              </div>
              <Dialogo.Close asChild>
                <button
                  type="button"
                  className="rounded-lg p-1 text-mineral-400 hover:bg-marfim-100 hover:text-mineral-600"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialogo.Close>
            </div>

            <Dialogo.Description className="mt-3 text-xs leading-relaxed text-mineral-600">
              Esta ação <strong>não poderá ser desfeita</strong>. Sua conta, vitrine e todos os
              registros serão apagados imediatamente.
            </Dialogo.Description>

            {estadoExclusao.canceladaComAcessoRestante ? (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 text-xs text-amber-900 space-y-2">
                <p className="font-semibold">⚠️ Você ainda possui dias pagos de assinatura</p>
                <p>
                  Sua assinatura está cancelada, mas você tem acesso garantido até{" "}
                  <strong>{formatarData(estadoExclusao.vigenciaAteIso)}</strong>. Ao apagar sua conta
                  agora, você <strong>abrirá mão desse período restante imediatamente</strong> e sem
                  reembolso.
                </p>
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentimentoPeriodo}
                    onChange={(e) => setConsentimentoPeriodo(e.target.checked)}
                    className="mt-0.5 rounded border-amber-400 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="font-medium text-amber-950">
                    Estou ciente de que perderei o período restante da minha assinatura.
                  </span>
                </label>
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              {temProvedorSenha ? (
                <div>
                  <label
                    htmlFor="senha-exclusao"
                    className="block text-xs font-medium text-mineral-700"
                  >
                    Digite sua senha atual para confirmar
                  </label>
                  <input
                    id="senha-exclusao"
                    type="password"
                    value={senhaConfirmacao}
                    onChange={(e) => setSenhaConfirmacao(e.target.value)}
                    placeholder="Sua senha atual"
                    className="mt-1 block w-full rounded-xl border border-marfim-300 px-3 py-2 text-sm text-mineral-900 shadow-2xs focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="confirmacao-exclusao"
                  className="block text-xs font-medium text-mineral-700"
                >
                  Digite{" "}
                  <span className="font-mono font-bold text-red-600">
                    {TEXTO_CONFIRMACAO_EXCLUSAO_CONTA}
                  </span>{" "}
                  para habilitar:
                </label>
                <input
                  id="confirmacao-exclusao"
                  type="text"
                  value={termoDigitado}
                  onChange={(e) => setTermoDigitado(e.target.value)}
                  placeholder={TEXTO_CONFIRMACAO_EXCLUSAO_CONTA}
                  className="mt-1 block w-full rounded-xl border border-marfim-300 px-3 py-2 text-sm text-mineral-900 shadow-2xs focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Botao
                type="button"
                variante="fantasma"
                tamanho="padrao"
                onClick={() => setModalAberto(false)}
                disabled={excluindo}
              >
                Cancelar
              </Botao>
              <Botao
                type="button"
                tamanho="padrao"
                disabled={!podeConfirmar || excluindo}
                carregando={excluindo}
                textoCarregando="Eliminando..."
                onClick={executarExclusao}
                className="bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 border-transparent disabled:opacity-50"
              >
                Eliminar definitivamente
              </Botao>
            </div>
          </Dialogo.Content>
        </Dialogo.Portal>
      </Dialogo.Root>
    </>
  );
}
