"use client";

import * as Dialogo from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { Botao } from "@/componentes/interface/Botao";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";

export interface DadosSubmissaoContratacao {
  readonly nomeRazaoSocial: string;
  readonly cpfOuCnpj: string;
  readonly emailCobranca: string;
  readonly telefone: string;
  readonly incluirImplantacao: boolean;
}

export interface PropriedadesDialogoContratacaoAssinatura {
  readonly aberto: boolean;
  readonly aoMudarAberto: (aberto: boolean) => void;
  readonly definicaoPlano: {
    readonly nome: string;
    readonly mensalidadeCentavos: number;
    readonly valorImplantacaoAssistidaCentavos?: number;
  };
  readonly nomePadrao: string;
  readonly emailPadrao: string;
  readonly temFaturaPendente?: boolean;
  readonly processando: boolean;
  readonly aoSubmeter: (dados: DadosSubmissaoContratacao) => Promise<void>;
}

export function DialogoContratacaoAssinatura({
  aberto,
  aoMudarAberto,
  definicaoPlano,
  nomePadrao,
  emailPadrao,
  temFaturaPendente = false,
  processando,
  aoSubmeter,
}: PropriedadesDialogoContratacaoAssinatura) {
  const [cpfOuCnpj, setCpfOuCnpj] = useState("");
  const [nomeRazaoSocial, setNomeRazaoSocial] = useState(nomePadrao);
  const [emailCobranca, setEmailCobranca] = useState(emailPadrao);
  const [telefone, setTelefone] = useState("");

  async function manipularSubmissao(e: React.FormEvent) {
    e.preventDefault();
    if (processando) return;
    await aoSubmeter({
      nomeRazaoSocial,
      cpfOuCnpj,
      emailCobranca,
      telefone,
      incluirImplantacao: false,
    });
  }

  return (
    <Dialogo.Root
      open={aberto}
      onOpenChange={(proximoAberto) => {
        if (!processando) {
          aoMudarAberto(proximoAberto);
        }
      }}
    >
      <Dialogo.Portal>
        <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/40 backdrop-blur-xs" />
        <Dialogo.Content
          className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-marfim-200 bg-white p-5 shadow-xl sm:p-6"
          onEscapeKeyDown={(e) => {
            if (processando) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (processando) {
              e.preventDefault();
            }
          }}
        >
          <div className="flex items-start justify-between gap-3 border-b border-marfim-100 pb-3">
            <div>
              <Dialogo.Title className="text-base font-semibold tracking-tight text-mineral-950">
                {temFaturaPendente
                  ? "Atualizar dados e reemitir fatura"
                  : `Contratar Plano ${definicaoPlano.nome}`}
              </Dialogo.Title>
              <Dialogo.Description className="mt-1 text-xs text-mineral-500">
                A cobrança recorrente será gerada em ambiente seguro com criptografia de ponta a ponta.
              </Dialogo.Description>
            </div>
            <Dialogo.Close
              aria-label="Fechar diálogo de contratação"
              disabled={processando}
              className="rounded-lg p-1 text-mineral-400 hover:bg-marfim-50 hover:text-mineral-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialogo.Close>
          </div>

          {temFaturaPendente ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
              <p className="font-semibold">Cobrança pendente existente</p>
              <p className="mt-0.5 text-[11px] text-amber-800">
                Uma fatura do Plano Pro já se encontra emitida. Caso você envie novos dados fiscais abaixo, eles atualizarão o seu cadastro e reemitirão a cobrança atualizada.
              </p>
            </div>
          ) : null}

          <form onSubmit={manipularSubmissao} className="mt-4 space-y-4">
            <div
              aria-label="Resumo da contratação"
              className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-mineral-700"
            >
              <p className="flex items-center justify-between gap-2">
                <span>Mensalidade · Plano {definicaoPlano.nome}</span>
                <strong className="text-indigo-950">
                  {ValorMonetarioCentavos.deCentavos(
                    definicaoPlano.mensalidadeCentavos,
                  ).formatarMoedaBrasileira()}
                  /mês
                </strong>
              </p>
            </div>

            <fieldset disabled={processando} className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="cpf-cnpj" className="block text-xs font-medium text-mineral-900">
                    CPF ou CNPJ
                  </label>
                  <span className="text-[10px] font-medium text-red-500">obrigatório</span>
                </div>
                <input
                  id="cpf-cnpj"
                  type="text"
                  required
                  autoFocus
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={cpfOuCnpj}
                  onChange={(e) => setCpfOuCnpj(e.target.value)}
                  className="mt-1 w-full min-h-10 rounded-lg border border-marfim-300 bg-white px-3 py-2 text-xs font-medium text-mineral-950 focus:border-indigo-600 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-mineral-500">
                  Exigido pelo Banco Central para registro fiscal e emissão da fatura.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="nome-fiscal" className="block text-xs font-medium text-mineral-700">
                    Nome ou Razão Social
                  </label>
                  <input
                    id="nome-fiscal"
                    type="text"
                    required
                    value={nomeRazaoSocial}
                    onChange={(e) => setNomeRazaoSocial(e.target.value)}
                    className="mt-1 w-full min-h-10 rounded-lg border border-marfim-200 bg-marfim-50/50 px-3 py-2 text-xs text-mineral-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email-cobranca" className="block text-xs font-medium text-mineral-700">
                    E-mail para envio das faturas
                  </label>
                  <input
                    id="email-cobranca"
                    type="email"
                    required
                    value={emailCobranca}
                    onChange={(e) => setEmailCobranca(e.target.value)}
                    className="mt-1 w-full min-h-10 rounded-lg border border-marfim-200 bg-marfim-50/50 px-3 py-2 text-xs text-mineral-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="telefone-fiscal" className="block text-xs font-medium text-mineral-700">
                    WhatsApp com DDD
                  </label>
                  <span className="text-[10px] text-mineral-400">opcional</span>
                </div>
                <input
                  id="telefone-fiscal"
                  type="tel"
                  placeholder="(11) 90000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="mt-1 w-full min-h-10 rounded-lg border border-marfim-200 px-3 py-2 text-xs text-mineral-800 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </fieldset>

            <div className="flex flex-wrap justify-end gap-3 border-t border-marfim-100 pt-4">
              <Botao
                type="button"
                variante="operacional_secundario"
                tamanho="compacto"
                disabled={processando}
                onClick={() => aoMudarAberto(false)}
              >
                Cancelar
              </Botao>
              <Botao
                type="submit"
                tamanho="compacto"
                className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={processando}
              >
                {processando ? "Gerando Fatura..." : "Gerar assinatura e checkout"}
              </Botao>
            </div>
          </form>
        </Dialogo.Content>
      </Dialogo.Portal>
    </Dialogo.Root>
  );
}

