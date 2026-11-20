"use client";

import { useState } from "react";
import * as Dialogo from "@radix-ui/react-dialog";
import { AlertTriangle, Trash2, X, ExternalLink } from "lucide-react";
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
        className="rounded-2xl border border-red-200/80 bg-red-50/30 p-6 shadow-2xs sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="titulo-zona-perigo" className="text-base font-semibold text-red-950">
              Zona de perigo · Eliminar conta
            </h2>
            <p className="text-xs text-red-700/80">
              Exclusão definitiva da sua conta, páginas publicadas, dados e vínculos.
            </p>
          </div>
        </div>

        <div className="mt-5 text-xs text-mineral-700 space-y-2">
          <p>
            A exclusão da sua conta é <strong>permanente e irreversível</strong>. Ao confirmar, sua
            vitrine deixará de ser acessível ao público, seus QR codes perderão o redirecionamento e
            todo o seu histórico de contatos e personalizações será removido.
          </p>

          {estadoExclusao.bloqueadoPorAssinaturaAtiva ? (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Assinatura ativa detectada
              </p>
              <p className="mt-1">
                {estadoExclusao.motivoBloqueio ||
                  "Você possui uma assinatura em andamento. Cancele a assinatura antes de eliminar sua conta para evitar cobranças automáticas no cartão."}
              </p>
              <div className="mt-3">
                <Link
                  href="/painel/assinatura"
                  className="inline-flex items-center gap-1 font-medium text-amber-900 underline hover:text-amber-950"
                >
                  Ir para gerenciamento da assinatura
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : estadoExclusao.ehFundador ? (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
              <p className="font-semibold">Conta de Fundador</p>
              <p className="mt-1">
                Contas com papel de Fundador não podem ser auto-eliminadas pelo painel de cliente.
              </p>
            </div>
          ) : (
            <div className="pt-3">
              <Botao
                type="button"
                tamanho="padrao"
                onClick={() => setModalAberto(true)}
                className="bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 border-transparent"
              >
                Eliminar minha conta definitivamente
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
