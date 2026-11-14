"use client";

import { useState } from "react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import type { ItemVisaoGeralOrganizacaoFundador } from "@/dominio/fundador/tiposPainelFundador";
import { POLITICAS_PUBLICIDADE_DISPONIVEIS } from "@/dominio/publicidade/registroPoliticasPublicidade";
import type { CodigoPerfilPublicidade } from "@/dominio/publicidade/tiposPerfilPublicidade";
import type { PortaOperacoesFundadorCliente } from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";

export interface PropriedadesModalPerfilPublicidadeFundador {
  readonly organizacao: ItemVisaoGeralOrganizacaoFundador;
  readonly servicoFundador: PortaOperacoesFundadorCliente;
  readonly aoFechar: () => void;
  readonly aoConcluir: (organizacaoId: string, novoPerfil: CodigoPerfilPublicidade) => void;
}

export function ModalPerfilPublicidadeFundador({
  organizacao,
  servicoFundador,
  aoFechar,
  aoConcluir,
}: PropriedadesModalPerfilPublicidadeFundador) {
  const [perfil, setPerfil] = useState<CodigoPerfilPublicidade>(organizacao.perfilPublicidade);
  const [justificativa, setJustificativa] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function confirmar() {
    setSalvando(true);
    try {
      await servicoFundador.definirPerfilPublicidadeOrganizacao({
        organizacaoId: organizacao.id,
        novoPerfil: perfil,
        justificativa,
      });
      notificar.sucesso(`Perfil de publicidade de "${organizacao.nome}" atualizado.`);
      aoConcluir(organizacao.id, perfil);
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível alterar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-950/60 p-4">
      <CartaoSuperficie className="w-full max-w-md space-y-5 bg-white p-6 shadow-xl">
        <div className="border-b border-marfim-200 pb-3">
          <h3 className="text-xl font-bold tracking-tight text-mineral-950">
            Perfil de publicidade: {organizacao.nome}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="select-perfil-publicidade"
              className="block text-xs font-medium text-mineral-800"
            >
              Perfil profissional
            </label>
            <select
              id="select-perfil-publicidade"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as CodigoPerfilPublicidade)}
              className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
            >
              {POLITICAS_PUBLICIDADE_DISPONIVEIS.map((politica) => (
                <option key={politica.codigo} value={politica.codigo}>
                  {politica.rotulo}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] leading-relaxed text-mineral-600">
              Perfis restritos ocultam avaliações do Google e preços, desativam cálculos e bloqueiam
              a publicação de Pix e produtos nas experiências. O dado salvo é preservado, e a
              restrição é revertida ao voltar para o perfil padrão.
            </p>
          </div>

          <div>
            <label
              htmlFor="justificativa-perfil-publicidade"
              className="block text-xs font-medium text-mineral-800"
            >
              Justificativa para Auditoria
            </label>
            <textarea
              id="justificativa-perfil-publicidade"
              rows={3}
              required
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Explique o motivo da alteração..."
              className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-marfim-200 pt-4">
            <Botao variante="operacional_secundario" tamanho="compacto" onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao
              tamanho="compacto"
              disabled={salvando || justificativa.trim().length < 5}
              onClick={() => void confirmar()}
            >
              {salvando ? "Salvando..." : "Confirmar Perfil"}
            </Botao>
          </div>
        </div>
      </CartaoSuperficie>
    </div>
  );
}
