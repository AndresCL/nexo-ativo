"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useMemo, useRef, useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import type { PortaGerenciamentoSolicitacoesPainel } from "@/aplicacao/portas/portasSolicitacoesComerciais";
import type {
  ConfiguracaoEmailOrganizacao,
  ConsumoMensalEmailOrganizacao,
} from "@/dominio/email/tiposEmailTransacional";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import {
  construirUrlAvaliacaoGoogle,
} from "@/dominio/entidades/avaliacoesGoogle";
import {
  DESCRITORES_SITUACAO_SOLICITACAO,
  gerarLinkAvaliacaoGoogleWhatsappSolicitacao,
  gerarLinkRetornoWhatsappSolicitacao,
  type SituacaoSolicitacaoComercial,
  type SolicitacaoComercial,
} from "@/dominio/entidades/solicitacaoComercial";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { servicoSolicitacoesPainelCliente } from "@/infraestrutura/painel/servicoSolicitacoesPainelCliente";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import * as Dialogo from "@radix-ui/react-dialog";
import { QuadroSolicitacoes } from "./QuadroSolicitacoes";
import { DialogoExportacaoSolicitacoes } from "./DialogoExportacaoSolicitacoes";
import { TransicaoColapsavel } from "@/componentes/interface/TransicaoColapsavel";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesGerenciadorSolicitacoesPainel {
  readonly organizacaoId: string;
  readonly nomeOrganizacao: string;
  readonly solicitacoesIniciais: readonly SolicitacaoComercial[];
  readonly profissionaisAtivos: readonly ProfissionalEquipe[];
  readonly configuracaoEmailInicial?: ConfiguracaoEmailOrganizacao;
  readonly consumoMensalEmailInicial?: ConsumoMensalEmailOrganizacao;
  readonly identificadorLocalGoogle?: string;
  readonly podeGerenciarSolicitacoes: boolean;
  readonly podeConfigurarEmail?: boolean;
  readonly servicoSolicitacoes?: PortaGerenciamentoSolicitacoesPainel;
}

export function GerenciadorSolicitacoesPainel({
  organizacaoId,
  nomeOrganizacao,
  solicitacoesIniciais,
  profissionaisAtivos,
  configuracaoEmailInicial,
  consumoMensalEmailInicial: _consumoMensalEmailInicial,
  identificadorLocalGoogle,
  podeGerenciarSolicitacoes,
  podeConfigurarEmail = false,
  servicoSolicitacoes = servicoSolicitacoesPainelCliente,
}: PropriedadesGerenciadorSolicitacoesPainel) {
  const [solicitacoes, setSolicitacoes] =
    useState<readonly SolicitacaoComercial[]>(solicitacoesIniciais);
  const [termoBusca, setTermoBusca] = useState("");
  const [solicitacaoSelecionadaId, setSolicitacaoSelecionadaId] = useState<string | null>(null);
  const [exibirConfiguracaoEmail, setExibirConfiguracaoEmail] = useState(false);
  const [exibirDialogoExportacao, setExibirDialogoExportacao] = useState(false);
  const [solicitacaoParaAvaliacaoGoogle, setSolicitacaoParaAvaliacaoGoogle] =
    useState<SolicitacaoComercial | null>(null);

  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const salvamentoEmCurso = useRef(false);
  const abrirDetalhesRef = useRef<HTMLInputElement>(null);

  const [_configuracaoEmail, setConfiguracaoEmail] = useState<
    ConfiguracaoEmailOrganizacao | undefined
  >(configuracaoEmailInicial);
  const [destinatariosTexto, setDestinatariosTexto] = useState(
    configuracaoEmailInicial?.emailsDestinatariosEquipe.join(", ") ?? "",
  );
  const [notificarEquipe, setNotificarEquipe] = useState(
    configuracaoEmailInicial?.notificarEquipeNovasSolicitacoes ?? true,
  );
  const [confirmarVisitante, setConfirmarVisitante] = useState(
    configuracaoEmailInicial?.enviarConfirmacaoVisitante ?? false,
  );
  const [emailResposta, setEmailResposta] = useState(
    configuracaoEmailInicial?.emailRespostaOpcional ?? "",
  );
  const [salvandoConfigEmail, setSalvandoConfigEmail] = useState(false);

  const solicitacoesFiltradas = useMemo(() => {
    const buscaNormalizada = termoBusca.trim().toLowerCase();
    if (!buscaNormalizada) {
      return solicitacoes;
    }
    return solicitacoes.filter((item) => {
      const alvo = [
        item.nomeVisitante,
        item.telefoneOuWhatsapp,
        item.emailVisitante ?? "",
        item.servicoNome ?? "",
        item.produtoNome ?? "",
        item.tituloExperiencia,
      ]
        .join(" ")
        .toLowerCase();

      return alvo.includes(buscaNormalizada);
    });
  }, [solicitacoes, termoBusca]);

  const solicitacaoAtiva = solicitacoes.find((s) => s.id === solicitacaoSelecionadaId) ?? null;

  // Métricas de Saúde Comercial e Velocidade Operacional para o topo do Kanban
  const metricasSaude = useMemo(() => {
    const agora = Date.now();
    const limite12HorasMs = 12 * 60 * 60 * 1000;

    let novasPendentesUrgentes = 0;
    let emNegociacaoContagem = 0;
    let valorNegociacaoCentavos = 0;
    const frequenciaExperiencias: Record<string, number> = {};

    for (const item of solicitacoes) {
      if (item.situacao === "desqualificada") continue;

      if (item.situacao === "nova") {
        const criadoEm = new Date(item.criadoEmIso).getTime();
        if (agora - criadoEm > limite12HorasMs) {
          novasPendentesUrgentes++;
        }
      }

      if (item.situacao === "em_atendimento" || item.situacao === "proposta_enviada") {
        emNegociacaoContagem++;
        if (item.demonstrativoComercialCongelado?.totalCentavos) {
          valorNegociacaoCentavos += item.demonstrativoComercialCongelado.totalCentavos;
        }
      }

      const nomeExp = item.tituloExperiencia;
      frequenciaExperiencias[nomeExp] = (frequenciaExperiencias[nomeExp] ?? 0) + 1;
    }

    let topExperienciaNome = "Nenhum fluxo";
    let topExperienciaTotal = 0;
    for (const [nome, total] of Object.entries(frequenciaExperiencias)) {
      if (total > topExperienciaTotal) {
        topExperienciaNome = nome;
        topExperienciaTotal = total;
      }
    }

    return {
      novasPendentesUrgentes,
      emNegociacaoContagem,
      valorNegociacaoCentavos,
      topExperienciaNome,
      topExperienciaTotal,
    };
  }, [solicitacoes]);

  async function salvarAtualizacaoSolicitacao(
    alvo: SolicitacaoComercial,
    novaSituacao: SituacaoSolicitacaoComercial,
    novasObservacoes?: string,
    novoProfissionalId?: string,
  ) {
    if (!podeGerenciarSolicitacoes || salvamentoEmCurso.current) {
      return;
    }

    salvamentoEmCurso.current = true;
    setSalvandoId(alvo.id);
    setSolicitacoes((atuais) =>
      atuais.map((item) => (item.id === alvo.id ? { ...item, situacao: novaSituacao } : item)),
    );

    try {
      await servicoSolicitacoes.atualizarAndamentoSolicitacao({
        organizacaoId,
        solicitacaoId: alvo.id,
        situacao: novaSituacao,
        ...(novasObservacoes !== undefined ? { observacoesInternas: novasObservacoes } : {}),
        ...(novoProfissionalId !== undefined ? { profissionalId: novoProfissionalId } : {}),
      });

      const profEscolhido = profissionaisAtivos.find((p) => p.id === novoProfissionalId);
      const atualizadoEmIso = new Date().toISOString();

      setSolicitacoes((atuais) =>
        atuais.map((item) =>
          item.id === alvo.id
            ? {
                ...item,
                situacao: novaSituacao,
                ...(novasObservacoes !== undefined
                  ? { observacoesInternas: novasObservacoes }
                  : {}),
                ...(novoProfissionalId
                  ? {
                      profissionalId: novoProfissionalId,
                      profissionalNome: profEscolhido?.nomeCompleto ?? item.profissionalNome,
                    }
                  : {}),
                atualizadoEmIso,
              }
            : item,
        ),
      );

      notificar.sucesso(
        `Andamento de "${alvo.nomeVisitante}" atualizado para "${DESCRITORES_SITUACAO_SOLICITACAO[novaSituacao].rotulo}".`,
      );

      // Gatilho de Pós-Venda: Se concluída e tiver Google Reviews configurado, sugere o convite
      if (novaSituacao === "concluida" && identificadorLocalGoogle) {
        setSolicitacaoParaAvaliacaoGoogle({ ...alvo, situacao: "concluida" });
      }
    } catch (erro) {
      setSolicitacoes((atuais) => atuais.map((item) => (item.id === alvo.id ? alvo : item)));
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar o andamento da solicitação.",
      );
    } finally {
      salvamentoEmCurso.current = false;
      setSalvandoId(null);
    }
  }

  async function salvarConfiguracoesEmail() {
    if (!podeConfigurarEmail || !servicoSolicitacoes.salvarConfiguracaoEmailOrganizacao) {
      return;
    }

    setSalvandoConfigEmail(true);

    try {
      const listaDestinatarios = destinatariosTexto
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0);

      const novaConfig: ConfiguracaoEmailOrganizacao = {
        organizacaoId,
        notificarEquipeNovasSolicitacoes: notificarEquipe,
        emailsDestinatariosEquipe: listaDestinatarios,
        enviarConfirmacaoVisitante: confirmarVisitante,
        ...(emailResposta.trim()
          ? { emailRespostaOpcional: emailResposta.trim().toLowerCase() }
          : {}),
        atualizadoEmIso: new Date().toISOString(),
      };

      await servicoSolicitacoes.salvarConfiguracaoEmailOrganizacao(novaConfig);
      setConfiguracaoEmail(novaConfig);
      notificar.sucesso("Configurações de e-mail e notificações atualizadas com sucesso.");
      setExibirConfiguracaoEmail(false);
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar as configurações de e-mail.",
      );
    } finally {
      setSalvandoConfigEmail(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Solicitações Recebidas
          </h1>
          <p className="mt-1 text-xs text-mineral-600">
            Acompanhe os contatos gerados pelos seus microfluxos interativos com contexto e valores
            preservados historicamente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExibirDialogoExportacao(true)}
            aria-label="Exportar solicitações em CSV ou Excel"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-marfim-300 bg-white px-3.5 text-xs font-semibold text-mineral-700 shadow-2xs transition hover:border-mineral-400 hover:bg-marfim-50 hover:text-mineral-950 focus-visible:outline-2 focus-visible:outline-indigo-500"
          >
            <Download className="h-3.5 w-3.5 text-mineral-500" aria-hidden="true" />
            <span>Exportar</span>
          </button>

          {podeConfigurarEmail ? (
            <button
              type="button"
              onClick={() => setExibirConfiguracaoEmail((aberto) => !aberto)}
              className={combinarClasses(
                "inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-xs font-semibold shadow-2xs transition focus-visible:outline-2 focus-visible:outline-indigo-500",
                exibirConfiguracaoEmail
                  ? "border-amber-300 bg-amber-50 text-amber-900 ring-1 ring-amber-300"
                  : "border-marfim-300 bg-white text-mineral-700 hover:border-mineral-400 hover:bg-marfim-50 hover:text-mineral-950",
              )}
            >
              <Settings
                className={combinarClasses(
                  "h-3.5 w-3.5",
                  exibirConfiguracaoEmail ? "text-amber-700" : "text-mineral-500",
                )}
                aria-hidden="true"
              />
              <span>
                {exibirConfiguracaoEmail ? "Fechar Notificações" : "Notificações por E-mail"}
              </span>
            </button>
          ) : null}
        </div>
      </header>

      <TransicaoColapsavel aberto={exibirConfiguracaoEmail}>
        <CartaoSuperficie
          className="space-y-5 border-amber-200 bg-amber-50/40 p-6"
          data-testid="secao-configuracao-email"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-200/80 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-mineral-950">
                Notificações por E-mail
              </h2>
              <p className="mt-0.5 text-xs text-mineral-600">
                Configure alertas imediatos para sua equipe e confirmações de recebimento para o
                visitante.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void salvarConfiguracoesEmail();
            }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <label className="flex items-start gap-3 text-xs text-mineral-800">
                <input
                  type="checkbox"
                  checked={notificarEquipe}
                  onChange={(e) => setNotificarEquipe(e.target.checked)}
                  className="mt-0.5 rounded border-marfim-300 text-mineral-900"
                />
                <span>
                  <strong>Notificar equipe imediatamente:</strong> Envia um e-mail com todos os
                  dados e link para WhatsApp assim que um visitante envia a solicitação.
                </span>
              </label>

              {notificarEquipe ? (
                <div>
                  <label
                    htmlFor="emails-destinatarios-equipe"
                    className="block text-xs font-medium text-mineral-800"
                  >
                    E-mails dos destinatários da equipe (separados por vírgula)
                  </label>
                  <input
                    id="emails-destinatarios-equipe"
                    type="text"
                    required
                    placeholder="contato@estudio.com.br, comercial@estudio.com.br"
                    value={destinatariosTexto}
                    onChange={(e) => setDestinatariosTexto(e.target.value)}
                    className="mt-1 w-full rounded-md border border-marfim-300 bg-white px-3 py-2 text-xs text-mineral-900 focus:border-mineral-700 focus:outline-none"
                  />
                </div>
              ) : null}

              <label className="flex items-start gap-3 text-xs text-mineral-800">
                <input
                  type="checkbox"
                  checked={confirmarVisitante}
                  onChange={(e) => setConfirmarVisitante(e.target.checked)}
                  className="mt-0.5 rounded border-marfim-300 text-mineral-900"
                />
                <span>
                  <strong>Enviar confirmação editorial ao visitante:</strong> Envia um e-mail de
                  boas-vindas confirmando o protocolo quando o visitante informa seu e-mail no
                  microfluxo.
                </span>
              </label>

              <div>
                <label
                  htmlFor="email-resposta-opcional"
                  className="block text-xs font-medium text-mineral-800"
                >
                  E-mail de resposta (Reply-To) opcional
                </label>
                <input
                  id="email-resposta-opcional"
                  type="email"
                  placeholder="atendimento@estudio.com.br"
                  value={emailResposta}
                  onChange={(e) => setEmailResposta(e.target.value)}
                  className="mt-1 w-full rounded-md border border-marfim-300 bg-white px-3 py-2 text-xs text-mineral-900 focus:border-mineral-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-amber-200/80 pt-4">
              <Botao
                type="button"
                variante="operacional_secundario"
                tamanho="compacto"
                onClick={() => setExibirConfiguracaoEmail(false)}
              >
                Cancelar
              </Botao>
              <Botao type="submit" tamanho="compacto" disabled={salvandoConfigEmail}>
                {salvandoConfigEmail ? "Salvando..." : "Salvar Configurações de E-mail"}
              </Botao>
            </div>
          </form>
        </CartaoSuperficie>
      </TransicaoColapsavel>

      {solicitacoes.length > 0 ? (
        <div
          data-testid="barra-saude-comercial-painel"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-2xs">
            <div
              className={combinarClasses(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                metricasSaude.novasPendentesUrgentes > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-mineral-100 text-mineral-700",
              )}
            >
              {metricasSaude.novasPendentesUrgentes > 0 ? (
                <Clock className="h-5 w-5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-mineral-500">Agilidade de Retorno</p>
              <p className="truncate text-xs font-bold text-mineral-900">
                {metricasSaude.novasPendentesUrgentes > 0
                  ? `${metricasSaude.novasPendentesUrgentes} aguardando > 12h`
                  : "Todas em dia (< 12h)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mineral-100 text-mineral-700">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-mineral-500">Em Negociação Ativa</p>
              <p className="truncate text-xs font-bold text-mineral-900">
                {metricasSaude.emNegociacaoContagem}{" "}
                {metricasSaude.emNegociacaoContagem === 1 ? "oportunidade" : "oportunidades"}
                {metricasSaude.valorNegociacaoCentavos > 0
                  ? ` · ${ValorMonetarioCentavos.deCentavos(metricasSaude.valorNegociacaoCentavos).formatarMoedaBrasileira()}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mineral-100 text-mineral-700">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-mineral-500">Top Conversão da Vitrine</p>
              <p
                className="truncate text-xs font-bold text-mineral-900"
                title={metricasSaude.topExperienciaNome}
              >
                {metricasSaude.topExperienciaNome}{" "}
                <span className="font-normal text-mineral-500">
                  ({metricasSaude.topExperienciaTotal})
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-mineral-700">
            Total no fluxo:{" "}
            <strong className="font-bold text-mineral-950">{solicitacoes.length}</strong>
          </span>
          <span className="text-mineral-300">·</span>
          <span className="text-xs text-mineral-500">
            5 etapas comerciais
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mineral-400"
            aria-hidden="true"
          />
          <input
            ref={abrirDetalhesRef}
            type="search"
            aria-label="Buscar por nome, telefone ou serviço"
            placeholder="Buscar visitante ou item..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full rounded-md border border-marfim-300 bg-white py-2 pr-3 pl-9 text-xs text-mineral-900 focus:border-mineral-700 focus:outline-none"
          />
        </div>
      </div>

      <QuadroSolicitacoes
        solicitacoes={solicitacoesFiltradas}
        nomeOrganizacao={nomeOrganizacao}
        buscando={termoBusca.trim().length > 0}
        podeGerenciar={podeGerenciarSolicitacoes}
        salvandoId={salvandoId}
        aoAbrir={setSolicitacaoSelecionadaId}
        aoMover={(item, situacao) => salvarAtualizacaoSolicitacao(item, situacao)}
      />

      <DialogoExportacaoSolicitacoes
        aberto={exibirDialogoExportacao}
        aoMudarAberto={setExibirDialogoExportacao}
        solicitacoes={solicitacoesFiltradas}
        nomeOrganizacao={nomeOrganizacao}
      />

      {/* Diálogo de Pós-Venda: Convite para Avaliação Google ao concluir */}
      <Dialogo.Root
        open={solicitacaoParaAvaliacaoGoogle !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setSolicitacaoParaAvaliacaoGoogle(null);
        }}
      >
        <Dialogo.Portal>
          <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/40 backdrop-blur-xs" />
          <Dialogo.Content
            aria-describedby="descricao-pos-venda-google"
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl focus:outline-none"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Award className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <Dialogo.Title className="text-base font-bold text-mineral-950">
                  Atendimento Concluído!
                </Dialogo.Title>
                <p id="descricao-pos-venda-google" className="mt-1 text-xs text-mineral-600">
                  Que tal aproveitar a satisfação de{" "}
                  <strong>{solicitacaoParaAvaliacaoGoogle?.nomeVisitante}</strong> e pedir uma
                  avaliação 5 estrelas no seu Google Meu Negócio?
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-marfim-200 bg-marfim-50/70 p-3 text-[11px] text-mineral-700">
              <p className="font-semibold text-mineral-900">Mensagem pronta para WhatsApp:</p>
              <p className="mt-1 italic">
                “Olá, {solicitacaoParaAvaliacaoGoogle?.nomeVisitante}! Agradecemos a confiança no
                atendimento da {nomeOrganizacao}. Se puder dedicar 30 segundos para avaliar sua
                experiência no Google, sua opinião é fundamental para nossa equipe...”
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSolicitacaoParaAvaliacaoGoogle(null)}
                className="rounded-lg border border-marfim-300 px-3.5 py-2 text-xs font-semibold text-mineral-700 hover:bg-marfim-100"
              >
                Agora não
              </button>
              {solicitacaoParaAvaliacaoGoogle && identificadorLocalGoogle ? (
                <a
                  href={gerarLinkAvaliacaoGoogleWhatsappSolicitacao(
                    solicitacaoParaAvaliacaoGoogle,
                    nomeOrganizacao,
                    construirUrlAvaliacaoGoogle(identificadorLocalGoogle),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSolicitacaoParaAvaliacaoGoogle(null)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Enviar Convite no WhatsApp</span>
                </a>
              ) : null}
            </div>
          </Dialogo.Content>
        </Dialogo.Portal>
      </Dialogo.Root>

      <Dialogo.Root
        open={solicitacaoAtiva !== null}
        onOpenChange={(aberto) => {
          if (!aberto && !salvamentoEmCurso.current) setSolicitacaoSelecionadaId(null);
        }}
      >
        <Dialogo.Portal>
          <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/30 backdrop-blur-sm" />
          <Dialogo.Content
            aria-describedby={undefined}
            onCloseAutoFocus={(evento) => {
              evento.preventDefault();
              abrirDetalhesRef.current?.focus();
            }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto bg-white p-4 shadow-xl sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <Dialogo.Title className="text-sm font-semibold text-mineral-900">
                Detalhes da solicitação
              </Dialogo.Title>
              <Dialogo.Close
                disabled={salvandoId !== null}
                aria-label="Fechar detalhes"
                className="rounded-lg p-2 text-mineral-600 hover:bg-marfim-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Dialogo.Close>
            </div>
            {solicitacaoAtiva ? (
              <DetalheSolicitacaoSelecionada
                key={solicitacaoAtiva.id}
                solicitacao={solicitacaoAtiva}
                nomeOrganizacao={nomeOrganizacao}
                profissionaisAtivos={profissionaisAtivos}
                podeGerenciarSolicitacoes={podeGerenciarSolicitacoes}
                salvando={salvandoId === solicitacaoAtiva.id}
                aoSalvar={(situacao, observacoes, profissionalId) =>
                  salvarAtualizacaoSolicitacao(
                    solicitacaoAtiva,
                    situacao,
                    observacoes,
                    profissionalId,
                  )
                }
              />
            ) : null}
          </Dialogo.Content>
        </Dialogo.Portal>
      </Dialogo.Root>
    </div>
  );
}

function DetalheSolicitacaoSelecionada({
  solicitacao,
  nomeOrganizacao,
  profissionaisAtivos,
  podeGerenciarSolicitacoes,
  salvando,
  aoSalvar,
}: {
  readonly solicitacao: SolicitacaoComercial;
  readonly nomeOrganizacao: string;
  readonly profissionaisAtivos: readonly ProfissionalEquipe[];
  readonly podeGerenciarSolicitacoes: boolean;
  readonly salvando: boolean;
  readonly aoSalvar: (
    situacao: SituacaoSolicitacaoComercial,
    observacoes: string,
    profissionalId?: string,
  ) => Promise<void>;
}) {
  const [situacaoEdicao, setSituacaoEdicao] = useState<SituacaoSolicitacaoComercial>(
    solicitacao.situacao,
  );
  const [observacoesEdicao, setObservacoesEdicao] = useState(solicitacao.observacoesInternas ?? "");
  const [profissionalIdEdicao, setProfissionalIdEdicao] = useState(
    solicitacao.profissionalId ?? "",
  );

  const linkWhatsapp = gerarLinkRetornoWhatsappSolicitacao(solicitacao, nomeOrganizacao);

  return (
    <CartaoSuperficie className="space-y-6 p-6" data-testid="detalhe-solicitacao-painel">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-marfim-200 pb-5">
        <div>
          <p className="text-xs tracking-[0.16em] text-mineral-500 uppercase">
            Protocolo: <code>{solicitacao.id}</code>
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-mineral-950 sm:text-3xl">
            {solicitacao.nomeVisitante}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-mineral-700">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-mineral-500" aria-hidden="true" />
              <span>{solicitacao.telefoneOuWhatsapp}</span>
            </span>
            {solicitacao.emailVisitante ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-mineral-500" aria-hidden="true" />
                <span>{solicitacao.emailVisitante}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${solicitacao.telefoneOuWhatsapp.replace(/[^\d+]/g, "")}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-mineral-800 bg-white px-3.5 py-2 text-xs font-semibold text-mineral-900 transition-colors hover:bg-marfim-100"
            title="Ligar para o cliente agora"
          >
            <PhoneCall className="h-4 w-4 text-mineral-700" aria-hidden="true" />
            <span>Ligar para o cliente</span>
          </a>

          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-800 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>Responder no WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-marfim-200 bg-marfim-50 p-4 text-xs">
          <p className="font-semibold text-mineral-900">Contexto de Origem</p>
          <p className="mt-1 text-mineral-700">
            <strong>Experiência:</strong> {solicitacao.tituloExperiencia}
            {solicitacao.versaoMicrofluxo ? ` · v${solicitacao.versaoMicrofluxo}` : ""}
          </p>
          {solicitacao.servicoNome ? (
            <p className="mt-1 text-mineral-700">
              <strong>Serviço selecionado:</strong> {solicitacao.servicoNome}
            </p>
          ) : null}
          {solicitacao.produtoNome ? (
            <p className="mt-1 text-mineral-700">
              <strong>Item do catálogo:</strong> {solicitacao.produtoNome}
              {solicitacao.quantidadeComercial ? ` (${solicitacao.quantidadeComercial} unid.)` : ""}
            </p>
          ) : null}
          {solicitacao.profissionalNome ? (
            <p className="mt-1 text-mineral-700">
              <strong>Especialista:</strong> {solicitacao.profissionalNome}
            </p>
          ) : null}
        </div>

        {solicitacao.demonstrativoComercialCongelado ? (
          <div
            data-testid="demonstrativo-historico-painel"
            className="rounded-md border border-marfim-300 bg-white p-4 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 font-semibold text-mineral-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                <span>Valor Histórico Preservado</span>
              </span>
              <span className="text-sm font-bold text-mineral-950">
                {solicitacao.demonstrativoComercialCongelado.resumoFormatado}
              </span>
            </div>

            <ul className="mt-2 space-y-1 border-t border-marfim-200 pt-2 text-[11px] text-mineral-600">
              {solicitacao.demonstrativoComercialCongelado.linhas.map((linha) => (
                <li key={linha.id} className="flex items-center justify-between gap-2">
                  <span>{linha.rotulo}</span>
                  <span>
                    {ValorMonetarioCentavos.deCentavos(
                      linha.subtotalCentavos,
                    ).formatarMoedaBrasileira()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {solicitacao.respostasRegistradas.length > 0 || solicitacao.mensagemAdicional ? (
        <div className="space-y-3 rounded-md border border-marfim-200 bg-marfim-50/70 p-4">
          <h3 className="text-xs font-semibold tracking-wider text-mineral-700 uppercase">
            Respostas do Visitante no Microfluxo
          </h3>

          <dl className="space-y-2.5 text-xs">
            {solicitacao.respostasRegistradas.map((resp) => (
              <div key={resp.etapaId}>
                <dt className="font-medium text-mineral-600">{resp.pergunta}</dt>
                <dd className="mt-0.5 text-mineral-950">{resp.respostaTexto}</dd>
              </div>
            ))}

            {solicitacao.mensagemAdicional ? (
              <div>
                <dt className="font-medium text-mineral-600">Observação complementar</dt>
                <dd className="mt-0.5 text-mineral-950">{solicitacao.mensagemAdicional}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void aoSalvar(
            situacaoEdicao,
            observacoesEdicao,
            profissionalIdEdicao ? profissionalIdEdicao : undefined,
          );
        }}
        className="space-y-4 border-t border-marfim-200 pt-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="situacao-solicitacao-select"
              className="block text-xs font-medium text-mineral-800"
            >
              Situação do atendimento
            </label>
            <select
              id="situacao-solicitacao-select"
              value={situacaoEdicao}
              disabled={!podeGerenciarSolicitacoes || salvando}
              onChange={(e) => setSituacaoEdicao(e.target.value as SituacaoSolicitacaoComercial)}
              className="mt-1.5 w-full rounded-md border border-marfim-300 bg-white px-3 py-2 text-xs text-mineral-900"
            >
              {(
                Object.keys(DESCRITORES_SITUACAO_SOLICITACAO) as SituacaoSolicitacaoComercial[]
              ).map((sit) => (
                <option key={sit} value={sit}>
                  {DESCRITORES_SITUACAO_SOLICITACAO[sit].rotulo}
                </option>
              ))}
            </select>
          </div>

          {profissionaisAtivos.length > 0 ? (
            <div>
              <label
                htmlFor="profissional-responsavel-select"
                className="block text-xs font-medium text-mineral-800"
              >
                Especialista responsável
              </label>
              <select
                id="profissional-responsavel-select"
                value={profissionalIdEdicao}
                disabled={!podeGerenciarSolicitacoes || salvando}
                onChange={(e) => setProfissionalIdEdicao(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-marfim-300 bg-white px-3 py-2 text-xs text-mineral-900"
              >
                <option value="">Equipe geral</option>
                {profissionaisAtivos.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="observacoes-internas-solicitacao"
            className="block text-xs font-medium text-mineral-800"
          >
            Anotações internas da equipe (visíveis apenas no painel)
          </label>
          <textarea
            id="observacoes-internas-solicitacao"
            rows={3}
            disabled={!podeGerenciarSolicitacoes || salvando}
            placeholder="Registre histórico de retorno, condições combinadas ou próximos passos..."
            value={observacoesEdicao}
            onChange={(e) => setObservacoesEdicao(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-marfim-300 bg-white px-3.5 py-2.5 text-xs text-mineral-900 focus:border-mineral-700 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <Botao type="submit" disabled={!podeGerenciarSolicitacoes || salvando}>
            {salvando ? "Salvando andamento..." : "Salvar andamento"}
          </Botao>
        </div>
      </form>
    </CartaoSuperficie>
  );
}
