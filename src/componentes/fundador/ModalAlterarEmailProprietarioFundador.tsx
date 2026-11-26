"use client";

import { useState } from "react";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import type { ItemVisaoGeralOrganizacaoFundador } from "@/dominio/fundador/tiposPainelFundador";
import type { PortaOperacoesFundadorCliente } from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";

export interface PropriedadesModalAlterarEmailProprietarioFundador {
  readonly organizacao: ItemVisaoGeralOrganizacaoFundador;
  readonly servicoFundador: PortaOperacoesFundadorCliente;
  readonly aoFechar: () => void;
  readonly aoConcluir: () => void;
}

export function ModalAlterarEmailProprietarioFundador({
  organizacao,
  servicoFundador,
  aoFechar,
  aoConcluir,
}: PropriedadesModalAlterarEmailProprietarioFundador) {
  const [novoEmail, setNovoEmail] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function confirmar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!servicoFundador.atualizarEmailProprietarioOrganizacao) {
      notificar.erro("Serviço de atualização de e-mail indisponível.");
      return;
    }

    setSalvando(true);
    try {
      const resultado = await servicoFundador.atualizarEmailProprietarioOrganizacao({
        organizacaoId: organizacao.id,
        novoEmail: novoEmail.trim().toLowerCase(),
      });

      if (resultado.modo === "sem_alteracao") {
        notificar.sucesso("O proprietário já está vinculado a este e-mail.");
      } else if (resultado.modo === "titularidade_transferida") {
        notificar.sucesso(
          `Titularidade de "${organizacao.nome}" transferida para ${resultado.novoEmail}.`,
        );
      } else {
        notificar.sucesso(
          `E-mail do proprietário de "${organizacao.nome}" atualizado para ${resultado.novoEmail}.`,
        );
      }
      aoConcluir();
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar o e-mail do proprietário.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const emailValido = novoEmail.trim().includes("@") && novoEmail.trim().includes(".");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-950/60 p-4">
      <CartaoSuperficie className="w-full max-w-md space-y-5 bg-white p-6 shadow-xl">
        <div className="border-b border-marfim-200 pb-3">
          <h3 className="text-xl font-bold tracking-tight text-mineral-950">
            Trocar e-mail: {organizacao.nome}
          </h3>
          <p className="mt-1 text-xs text-mineral-600">
            Atualiza o e-mail de acesso do proprietário para fechar a venda e cobrar no Asaas.
          </p>
        </div>

        <form onSubmit={(e) => void confirmar(e)} className="space-y-4">
          <CampoFormulario
            rotulo="Novo e-mail do proprietário"
            type="email"
            placeholder="cliente@empresa.com.br"
            required
            autoFocus
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
            textoAuxiliar="Se o usuário atual for o fundador ou tiver outras organizações, a titularidade será transferida sem alterar outras contas."
          />

          <div className="flex justify-end gap-2 border-t border-marfim-200 pt-4">
            <Botao
              type="button"
              variante="operacional_secundario"
              tamanho="compacto"
              disabled={salvando}
              onClick={aoFechar}
            >
              Cancelar
            </Botao>
            <Botao type="submit" tamanho="compacto" disabled={salvando || !emailValido}>
              {salvando ? "Salvando..." : "Salvar E-mail"}
            </Botao>
          </div>
        </form>
      </CartaoSuperficie>
    </div>
  );
}

