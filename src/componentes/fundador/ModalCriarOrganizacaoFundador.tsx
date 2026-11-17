"use client";

import { useState } from "react";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import type { CodigoPlanoAssinatura } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ItemVisaoGeralOrganizacaoFundador } from "@/dominio/fundador/tiposPainelFundador";
import { normalizarSugestaoIdentificador } from "@/dominio/objetos-valor/identificadorPublico";
import { POLITICAS_PUBLICIDADE_DISPONIVEIS } from "@/dominio/publicidade/registroPoliticasPublicidade";
import type { CodigoPerfilPublicidade } from "@/dominio/publicidade/tiposPerfilPublicidade";
import type { PortaOperacoesFundadorCliente } from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";

export interface PropriedadesModalCriarOrganizacaoFundador {
  readonly servicoFundador: PortaOperacoesFundadorCliente;
  readonly aoFechar: () => void;
  readonly aoConcluir: (novaOrganizacao: ItemVisaoGeralOrganizacaoFundador) => void;
}

export function ModalCriarOrganizacaoFundador({
  servicoFundador,
  aoFechar,
  aoConcluir,
}: PropriedadesModalCriarOrganizacaoFundador) {
  const [nome, setNome] = useState("");
  const [identificadorPublico, setIdentificadorPublico] = useState("");
  const [segmentoAtividade, setSegmentoAtividade] = useState("");
  const [nomeProprietario, setNomeProprietario] = useState("");
  const [emailProprietario, setEmailProprietario] = useState("");
  const [senhaInicial, setSenhaInicial] = useState("");
  const [planoCodigo, setPlanoCodigo] = useState<CodigoPlanoAssinatura>("pro");
  const [perfilPublicidade, setPerfilPublicidade] = useState<CodigoPerfilPublicidade>("padrao");
  const [salvando, setSalvando] = useState(false);

  function sugerirSlugAutomatico(valorNome: string) {
    if (!identificadorPublico.trim()) {
      const sugestao = normalizarSugestaoIdentificador(valorNome);
      if (sugestao) {
        setIdentificadorPublico(sugestao);
      }
    }
  }

  async function submeterCriacao(evento: React.FormEvent) {
    evento.preventDefault();
    if (!servicoFundador.criarOrganizacaoManual) {
      notificar.erro("Serviço de criação manual indisponível.");
      return;
    }

    setSalvando(true);
    try {
      const resultado = await servicoFundador.criarOrganizacaoManual({
        nome: nome.trim(),
        identificadorPublico: identificadorPublico.trim(),
        segmentoAtividade: segmentoAtividade.trim(),
        nomeProprietario: nomeProprietario.trim(),
        emailProprietario: emailProprietario.trim().toLowerCase(),
        ...(senhaInicial.trim() ? { senhaInicialOpcional: senhaInicial.trim() } : {}),
        planoCodigo,
        perfilPublicidade,
      });

      notificar.sucesso(
        `Organização "${resultado.organizacao.nome}" (/${resultado.organizacao.identificadorPublico}) criada com sucesso.`,
      );
      aoConcluir(resultado.organizacao);
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível criar a organização.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const formularioValido =
    nome.trim().length >= 2 &&
    identificadorPublico.trim().length >= 3 &&
    segmentoAtividade.trim().length >= 2 &&
    nomeProprietario.trim().length >= 2 &&
    emailProprietario.includes("@") &&
    (senhaInicial.trim().length === 0 || senhaInicial.trim().length >= 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-950/60 p-4">
      <CartaoSuperficie className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="border-b border-marfim-200 pb-3">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Onboarding Concierge
          </p>
          <h3 className="mt-0.5 text-xl font-bold tracking-tight text-mineral-950">
            Criar Cliente / Organização
          </h3>
        </div>

        <form onSubmit={(e) => void submeterCriacao(e)} className="mt-4 space-y-4">
          <CampoFormulario
            rotulo="Nome da organização ou cliente"
            placeholder="Ex.: Garage 88"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={(e) => sugerirSlugAutomatico(e.target.value)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <CampoFormulario
              rotulo="Endereço público"
              prefixoFixo="nexoativo.com.br/"
              placeholder="garage-88"
              required
              value={identificadorPublico}
              onChange={(e) => setIdentificadorPublico(e.target.value)}
            />

            <CampoFormulario
              rotulo="Segmento de atuação"
              placeholder="Ex.: Concessionária de veículos"
              required
              value={segmentoAtividade}
              onChange={(e) => setSegmentoAtividade(e.target.value)}
            />
          </div>

          <div className="grid gap-3 border-t border-marfim-200 pt-4 sm:grid-cols-2">
            <CampoFormulario
              rotulo="Nome do proprietário"
              placeholder="Ex.: Admin Garage 88"
              required
              value={nomeProprietario}
              onChange={(e) => setNomeProprietario(e.target.value)}
            />

            <CampoFormulario
              rotulo="E-mail do proprietário"
              type="email"
              placeholder="admin@cliente.com.br"
              required
              value={emailProprietario}
              onChange={(e) => setEmailProprietario(e.target.value)}
            />
          </div>

          <CampoFormulario
            rotulo="Senha inicial (opcional)"
            type="password"
            placeholder="Mínimo 8 caracteres (vazio para login Google)"
            textoAuxiliar="Se o e-mail já existir no Firebase Auth, a conta existente será reutilizada."
            value={senhaInicial}
            onChange={(e) => setSenhaInicial(e.target.value)}
          />

          <div className="grid gap-3 border-t border-marfim-200 pt-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="novo-cliente-plano"
                className="block text-xs font-medium text-mineral-800"
              >
                Plano liberado
              </label>
              <select
                id="novo-cliente-plano"
                value={planoCodigo}
                onChange={(e) => setPlanoCodigo(e.target.value as CodigoPlanoAssinatura)}
                className="mt-1 w-full rounded-lg border border-marfim-300 bg-white p-2 text-xs text-mineral-900"
              >
                <option value="pro">Pro (R$ 87/mês · 10 profissionais)</option>
                <option value="personalizado">Empresarial (Sob medida)</option>
                <option value="avaliacao_inicial">Avaliação Inicial</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="novo-cliente-perfil"
                className="block text-xs font-medium text-mineral-800"
              >
                Perfil de publicidade
              </label>
              <select
                id="novo-cliente-perfil"
                value={perfilPublicidade}
                onChange={(e) => setPerfilPublicidade(e.target.value as CodigoPerfilPublicidade)}
                className="mt-1 w-full rounded-lg border border-marfim-300 bg-white p-2 text-xs text-mineral-900"
              >
                {POLITICAS_PUBLICIDADE_DISPONIVEIS.map((politica) => (
                  <option key={politica.codigo} value={politica.codigo}>
                    {politica.rotulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            <Botao
              type="submit"
              tamanho="compacto"
              disabled={salvando || !formularioValido}
              className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {salvando ? "Criando..." : "Criar Organização"}
            </Botao>
          </div>
        </form>
      </CartaoSuperficie>
    </div>
  );
}

