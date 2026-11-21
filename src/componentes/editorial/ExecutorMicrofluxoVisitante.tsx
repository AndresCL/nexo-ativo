"use client";

import Image from "next/image";
import { ItemCampoFormularioDinamico } from "./ItemCampoFormularioDinamico";
import {
  ConteudoEtapaLivreVisitante,
  BlocosConteudoEditorial,
} from "./ConteudoEtapaLivreVisitante";
import { atualizarRespostaBloco } from "@/dominio/microfluxos/composicaoEtapaLivre";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import {
  obterEtapasPercorridas,
  projetarRespostasConclusao,
  resolverDestinoAcaoConclusao,
} from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { useEffect, useRef, useState } from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Sparkles,
} from "lucide-react";
import type { PortaSubmissaoSolicitacaoVisitante } from "@/aplicacao/portas/portasSolicitacoesComerciais";
import {
  formatarApresentacaoPrecoItem,
  type AcervoPublicoVitrine,
} from "@/dominio/entidades/catalogoConteudo";
import {
  extrairRespostasLegiveisMicrofluxo,
  gerarChaveIdempotenciaSolicitacao,
} from "@/dominio/entidades/solicitacaoComercial";
import { montarLinkWhatsapp } from "@/dominio/servicos/numeroWhatsappInternacional";
import { calcularDemonstrativoComercialMicrofluxo } from "@/dominio/comercial/calculadoraComercialCentavos";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { servicoSubmissaoSolicitacaoVisitantePadrao } from "@/infraestrutura/vitrine/servicoSubmissaoSolicitacaoVisitante";
import { obterOuDetectarOrigemSessao } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import {
  deveIgnorarOtimizadorImagem,
  obterDescritorTipografiaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import {
  atualizarRespostasExecucaoMicrofluxo,
  avancarEtapaExecucaoMicrofluxo,
  calcularRecomendacaoMicrofluxo,
  criarEstadoExecucaoMicrofluxo,
  obterEtapaAtualExecucao,
  resolverProximaEtapaId,
  retrocederEtapaExecucaoMicrofluxo,
  type EstadoExecucaoMicrofluxo,
} from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import {
  type ContextoOrigemMicrofluxo,
  type DefinicaoMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import { TransicaoAlternancia } from "@/componentes/interface/TransicaoAlternancia";
import { AvatarProfissional } from "./AvatarProfissional";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { BottomSheetEditorialBase } from "./BottomSheetEditorialBase";
import { useAmbienteVitrine } from "./contextoAmbienteVitrine";

export interface PropriedadesExecutorMicrofluxoVisitante {
  readonly aberto: boolean;
  readonly aoAlterarAbertura: (aberto: boolean) => void;
  readonly microfluxo: DefinicaoMicrofluxo | null;
  readonly contextoOrigem?: ContextoOrigemMicrofluxo;
  readonly pagina: ConteudoPaginaPublicada;
  readonly acervo: AcervoPublicoVitrine;
  readonly servicoSubmissao?: PortaSubmissaoSolicitacaoVisitante;
}

export function ExecutorMicrofluxoVisitante({
  aberto,
  aoAlterarAbertura,
  microfluxo,
  contextoOrigem,
  pagina,
  acervo,
  servicoSubmissao,
}: PropriedadesExecutorMicrofluxoVisitante) {
  const { registrarEventoTelemetria, servicoSubmissao: servicoSubmissaoAmbiente } =
    useAmbienteVitrine();
  const servicoSubmissaoEfetivo =
    servicoSubmissao ?? servicoSubmissaoAmbiente ?? servicoSubmissaoSolicitacaoVisitantePadrao;
  const [estado, setEstado] = useState<EstadoExecucaoMicrofluxo | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [campoArmadilhaBot, setCampoArmadilhaBot] = useState("");
  const [enviandoSolicitacao, setEnviandoSolicitacao] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null);
  const avancoEmAndamento = useRef(false);
  const conclusaoRegistrada = useRef(false);
  const painelConteudoRef = useRef<HTMLDivElement | null>(null);
  const timerAutoTransicaoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function limparAutoTransicaoPendente() {
    if (timerAutoTransicaoRef.current !== null) {
      clearTimeout(timerAutoTransicaoRef.current);
      timerAutoTransicaoRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      limparAutoTransicaoPendente();
    };
  }, []);

  useEffect(() => {
    if (aberto && microfluxo) {
      limparAutoTransicaoPendente();
      setEstado(criarEstadoExecucaoMicrofluxo(microfluxo, contextoOrigem));
      setMensagemErro(null);
      setCampoArmadilhaBot("");
      setProtocoloGerado(null);
      conclusaoRegistrada.current = false;
    } else if (!aberto) {
      limparAutoTransicaoPendente();
    }
  }, [aberto, microfluxo, contextoOrigem]);

  // Garante que o scroll retorne ao topo ao avançar ou retroceder de etapa
  useEffect(() => {
    if (painelConteudoRef.current) {
      if (typeof painelConteudoRef.current.scrollTo === "function") {
        painelConteudoRef.current.scrollTo({ top: 0, behavior: "instant" });
      } else {
        painelConteudoRef.current.scrollTop = 0;
      }
    }
  }, [estado?.etapaAtualId, estado?.concluido]);

  if (!microfluxo || !estado) {
    return null;
  }

  const tipografia = obterDescritorTipografiaEditorial(pagina.tipografiaId);

  const etapaAtual = obterEtapaAtualExecucao(estado);
  const ehUltimaEtapa = resolverProximaEtapaId(microfluxo, etapaAtual, estado.respostas) === null;

  const servicoSelecionado = acervo.servicos.find(
    (s) => s.id === estado.respostas.servicoSelecionadoId,
  );
  const produtoSelecionado = acervo.produtos.find(
    (p) => p.id === estado.respostas.produtoSelecionadoId,
  );
  const profissionalSelecionado = acervo.profissionais.find(
    (p) => p.id === estado.respostas.profissionalSelecionadoId,
  );

  const demonstrativoComercialAtivo = estado.concluido
    ? (estado.demonstrativoComercialCongelado ?? null)
    : calcularDemonstrativoComercialMicrofluxo({
        microfluxo,
        respostas: estado.respostas,
        acervo,
      });

  const profissionalResponsavelWhatsApp =
    profissionalSelecionado ?? acervo.profissionais.find((p) => Boolean(p.whatsappOpcional));

  const linkDiretoWhatsAppEtapa = montarLinkWhatsapp(
    profissionalResponsavelWhatsApp?.whatsappOpcional,
  );

  const politicaConclusao = obterPoliticaPublicidade(pagina.perfilPublicidade);
  const resumoConfigurado = microfluxo.conclusao?.resumo;
  const respostasResumo = resumoConfigurado?.ativo
    ? projetarRespostasConclusao(estado, resumoConfigurado.campos, acervo, politicaConclusao)
    : [];
  const acoesConclusao =
    microfluxo.conclusao?.acoes ??
    (profissionalSelecionado?.whatsappOpcional ||
    (microfluxo.etapas.some((e) => e.tipoEtapa === "conectar_whatsapp") &&
      profissionalResponsavelWhatsApp?.whatsappOpcional)
      ? [
          { tipo: "whatsapp" as const, rotulo: "Chamar no WhatsApp agora" },
          { tipo: "home" as const, rotulo: "Concluir e voltar à página" },
        ]
      : [{ tipo: "home" as const, rotulo: "Concluir e voltar à página" }]);
  function linkWhatsappConclusao(numeroOpcional?: string) {
    const numero = numeroOpcional ?? profissionalResponsavelWhatsApp?.whatsappOpcional;
    if (!microfluxo || !estado) return null;
    const respostasAutorizadas = microfluxo.conclusao
      ? projetarRespostasConclusao(
          estado,
          microfluxo.conclusao.camposWhatsapp,
          acervo,
          politicaConclusao,
        )
      : [];
    return montarLinkWhatsapp(
      numero,
      [
        `Olá! Gostaria de continuar ${microfluxo.titulo} na ${pagina.identidade.nomeExibicao}.`,
        ...(protocoloGerado ? [`Protocolo: ${protocoloGerado}`] : []),
        ...respostasAutorizadas.map((r) => `${r.rotulo}: ${r.valor}`),
      ].join("\n"),
    );
  }
  function registrarCliqueWhatsappConclusao() {
    const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
    void registrarEventoTelemetria({
      organizacaoId: pagina.organizacaoId,
      tipoEvento: "clique_whatsapp",
      canalOrigem: origem.canalOrigem,
      ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
      ...(origem.cartaoProfissionalId ? { cartaoProfissionalId: origem.cartaoProfissionalId } : {}),
      ...(profissionalResponsavelWhatsApp
        ? { profissionalId: profissionalResponsavelWhatsApp.id }
        : {}),
    });
  }

  async function tentarAvancar(estadoBase: EstadoExecucaoMicrofluxo = estado!) {
    if (!estadoBase || !microfluxo || avancoEmAndamento.current || estadoBase.concluido) {
      return;
    }
    limparAutoTransicaoPendente();
    avancoEmAndamento.current = true;
    try {
      setMensagemErro(null);
      const proximo = avancarEtapaExecucaoMicrofluxo(estadoBase, acervo);

      if (proximo.concluido && proximo.respostas.contatoVisitante) {
        setEnviandoSolicitacao(true);
        const contato = proximo.respostas.contatoVisitante;
        const chaveIdempotencia = gerarChaveIdempotenciaSolicitacao({
          organizacaoId: pagina.organizacaoId,
          microfluxoId: microfluxo.id,
          telefoneOuWhatsapp: contato.telefoneOuWhatsapp,
          ...(proximo.respostas.servicoSelecionadoId
            ? { servicoId: proximo.respostas.servicoSelecionadoId }
            : {}),
          ...(proximo.respostas.produtoSelecionadoId
            ? { produtoId: proximo.respostas.produtoSelecionadoId }
            : {}),
        });

        const resultadoSubmissao = await servicoSubmissaoEfetivo
          .enviarSolicitacaoVisitante({
            organizacaoId: pagina.organizacaoId,
            identificadorPublicoOrganizacao: pagina.identificadorPublico,
            microfluxoId: microfluxo.id,
            tituloExperiencia: microfluxo.titulo,
            versaoMicrofluxo: microfluxo.versaoPublicada ?? null,
            nomeVisitante: contato.nomeCompleto,
            telefoneOuWhatsapp: contato.telefoneOuWhatsapp,
            ...(contato.email ? { emailVisitante: contato.email } : {}),
            ...(contato.mensagemAdicional ? { mensagemAdicional: contato.mensagemAdicional } : {}),
            ...(servicoSelecionado
              ? { servicoId: servicoSelecionado.id, servicoNome: servicoSelecionado.nome }
              : {}),
            ...(produtoSelecionado
              ? { produtoId: produtoSelecionado.id, produtoNome: produtoSelecionado.nome }
              : {}),
            ...(profissionalSelecionado
              ? {
                  profissionalId: profissionalSelecionado.id,
                  profissionalNome: profissionalSelecionado.nomeCompleto,
                }
              : {}),
            ...(proximo.respostas.quantidadeComercial
              ? { quantidadeComercial: proximo.respostas.quantidadeComercial }
              : {}),
            respostasRegistradas: [
              ...extrairRespostasLegiveisMicrofluxo(
                {
                  ...microfluxo,
                  etapas: microfluxo.etapas.filter((e) =>
                    obterEtapasPercorridas(proximo).has(e.id),
                  ),
                },
                proximo.respostas,
              ),
            ],
            demonstrativoComercialCongelado: proximo.demonstrativoComercialCongelado ?? null,
            chaveIdempotencia,
            ...(campoArmadilhaBot ? { campoArmadilhaBot } : {}),
          })
          .catch((erro: unknown) => {
            notificar.erro(
              erro instanceof Error
                ? erro.message
                : "Não foi possível enviar a solicitação. Tente novamente.",
            );
            return null;
          });
        if (!resultadoSubmissao) return;

        setProtocoloGerado(resultadoSubmissao.solicitacaoId);
      }
      if (proximo.concluido && !conclusaoRegistrada.current) {
        conclusaoRegistrada.current = true;
        const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
        void registrarEventoTelemetria({
          organizacaoId: pagina.organizacaoId,
          tipoEvento: "conclusao_microfluxo",
          canalOrigem: origem.canalOrigem,
          ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
          ...(origem.cartaoProfissionalId
            ? { cartaoProfissionalId: origem.cartaoProfissionalId }
            : {}),
          microfluxoId: microfluxo.id,
          microfluxoTitulo: microfluxo.titulo,
          ...(profissionalSelecionado
            ? {
                profissionalId: profissionalSelecionado.id,
                profissionalNome: profissionalSelecionado.nomeCompleto,
              }
            : {}),
          ...(produtoSelecionado
            ? { itemCatalogoId: produtoSelecionado.id, itemCatalogoNome: produtoSelecionado.nome }
            : {}),
          ...(servicoSelecionado
            ? { itemCatalogoId: servicoSelecionado.id, itemCatalogoNome: servicoSelecionado.nome }
            : {}),
        });
      }

      if (estado && !proximo.concluido && proximo.etapaAtualId !== estado.etapaAtualId) {
        // Registra o avanço real para a próxima etapa no funil de abandono
        void registrarEventoTelemetria({
          organizacaoId: pagina.organizacaoId,
          tipoEvento: "avanco_etapa_microfluxo",
          microfluxoId: microfluxo.id,
          microfluxoTitulo: microfluxo.titulo,
          etapaId: proximo.etapaAtualId,
        });
      }

      setEstado(proximo);
    } catch (erro) {
      setMensagemErro(
        erro instanceof Error ? erro.message : "Verifique os dados informados para prosseguir.",
      );
    } finally {
      avancoEmAndamento.current = false;
      setEnviandoSolicitacao(false);
    }
  }

  function voltarEtapa() {
    if (!estado) {
      return;
    }
    limparAutoTransicaoPendente();
    setMensagemErro(null);
    setEstado(retrocederEtapaExecucaoMicrofluxo(estado));
  }

  function selecionarOpcaoUnica(opcaoId: string) {
    if (!estado) {
      return;
    }
    setMensagemErro(null);
    const novoEstado = atualizarRespostasExecucaoMicrofluxo(estado, {
      opcoesUnicasPorEtapa: {
        ...estado.respostas.opcoesUnicasPorEtapa,
        [etapaAtual.id]: opcaoId,
      },
    });
    setEstado(novoEstado);
  }

  function alternarOpcaoMultipla(opcaoId: string) {
    if (!estado) {
      return;
    }
    setMensagemErro(null);
    const atuais = estado.respostas.opcoesMultiplasPorEtapa[etapaAtual.id] ?? [];
    const novas = atuais.includes(opcaoId)
      ? atuais.filter((id) => id !== opcaoId)
      : [...atuais, opcaoId];

    setEstado(
      atualizarRespostasExecucaoMicrofluxo(estado, {
        opcoesMultiplasPorEtapa: {
          ...estado.respostas.opcoesMultiplasPorEtapa,
          [etapaAtual.id]: novas,
        },
      }),
    );
  }

  const incluirServicosNoCatalogo =
    etapaAtual.fonteCatalogo === "servicos" ||
    etapaAtual.fonteCatalogo === "ambos" ||
    !etapaAtual.fonteCatalogo;
  const incluirProdutosNoCatalogo =
    etapaAtual.fonteCatalogo === "produtos" ||
    etapaAtual.fonteCatalogo === "ambos" ||
    !etapaAtual.fonteCatalogo;

  const servicosDisponiveisEtapa = incluirServicosNoCatalogo ? acervo.servicos : [];
  const produtosDisponiveisEtapa = incluirProdutosNoCatalogo ? acervo.produtos : [];

  return (
    <BottomSheetEditorialBase
      aberto={aberto}
      aoFechar={() => aoAlterarAbertura(false)}
      pagina={pagina}
      dataTestId="executor-microfluxo-visitante"
      rotuloBotaoFechar="Fechar experiência"
      conteudoScrollRef={painelConteudoRef}
      cabecalhoFixo={
        !estado.concluido ? (
          <header className="relative border-b border-current/12 pr-10 pb-4">
            <p className="flex min-h-7 items-center text-xs leading-relaxed text-[var(--editorial-texto-secundario)]">
              {microfluxo.titulo}
            </p>
            <div aria-live="polite">
              <DialogoPrimitivo.Title
                className={combinarClasses("mt-1 text-xl sm:text-2xl", tipografia.classeTitulo)}
              >
                {etapaAtual.titulo}
              </DialogoPrimitivo.Title>
              <DialogoPrimitivo.Description className="mt-1.5 text-xs leading-relaxed text-[var(--editorial-texto-secundario)]">
                Passo {estado.historicoEtapasIds.length + 1}
                {etapaAtual.subtituloOpcional?.trim()
                  ? `: ${etapaAtual.subtituloOpcional.trim()}`
                  : ""}
              </DialogoPrimitivo.Description>
            </div>
          </header>
        ) : undefined
      }
      rodapeFixo={
        !estado.concluido ? (
          <div className="flex items-center justify-between gap-3">
            {estado.historicoEtapasIds.length > 0 ? (
              <button
                type="button"
                onClick={voltarEtapa}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-current/25 px-4 py-2.5 text-xs font-medium transition-opacity hover:opacity-80"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Voltar</span>
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              disabled={enviandoSolicitacao}
              onClick={() => tentarAvancar()}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[var(--editorial-texto)] px-5 py-2.5 text-sm font-medium text-[var(--editorial-fundo)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <span>
                {enviandoSolicitacao
                  ? "Registrando solicitação…"
                  : ehUltimaEtapa
                    ? microfluxo.textoBotaoConclusao || "Concluir experiência"
                    : "Continuar"}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : undefined
      }
      classNameConteudoInterno="pt-2"
    >
      <TransicaoAlternancia
        chaveId={estado.concluido ? "concluido" : etapaAtual.id}
        variante="horizontal"
      >
              {estado.concluido ? (
                <section data-testid="confirmacao-microfluxo-concluido" className="mt-2 space-y-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-xs">
                      <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                    </div>

                    <div className="space-y-1.5">
                      <DialogoPrimitivo.Title asChild>
                        <h3
                          className={combinarClasses(
                            "text-2xl sm:text-3xl font-medium",
                            tipografia.classeTitulo,
                          )}
                        >
                          {microfluxo.conclusao || protocoloGerado
                            ? microfluxo.mensagemConfirmacaoTitulo ||
                              (protocoloGerado ? "Solicitação recebida" : "Experiência concluída")
                            : "Experiência concluída"}
                        </h3>
                      </DialogoPrimitivo.Title>
                      <DialogoPrimitivo.Description asChild>
                        <p className="text-sm leading-relaxed text-[var(--editorial-texto-secundario)] max-w-md mx-auto">
                          {protocoloGerado || microfluxo.conclusao
                            ? microfluxo.mensagemConfirmacaoCorpo
                            : "Você concluiu este percurso."}
                        </p>
                      </DialogoPrimitivo.Description>
                    </div>
                  </div>

                  <BlocosConteudoEditorial blocos={microfluxo.conclusao?.blocos ?? []} />
                  {!microfluxo.conclusao ? (
                    <div className="space-y-2 rounded-md border border-current/12 bg-[var(--editorial-superficie)]/50 p-4 text-xs text-[var(--editorial-texto-secundario)]">
                      {estado.respostas.contatoVisitante ? (
                        <p>
                          <strong className="text-[var(--editorial-texto)]">Solicitante:</strong>{" "}
                          {estado.respostas.contatoVisitante.nomeCompleto} (
                          {estado.respostas.contatoVisitante.telefoneOuWhatsapp})
                        </p>
                      ) : null}
                      {servicoSelecionado ? (
                        <p>
                          <strong className="text-[var(--editorial-texto)]">Serviço:</strong>{" "}
                          {servicoSelecionado.nome}
                        </p>
                      ) : null}
                      {produtoSelecionado ? (
                        <p>
                          <strong className="text-[var(--editorial-texto)]">
                            Item selecionado:
                          </strong>{" "}
                          {produtoSelecionado.nome}
                        </p>
                      ) : null}
                      {profissionalSelecionado ? (
                        <p>
                          <strong className="text-[var(--editorial-texto)]">Especialista:</strong>{" "}
                          {profissionalSelecionado.nomeCompleto}
                        </p>
                      ) : null}
                      {protocoloGerado ? (
                        <p>
                          <strong className="text-[var(--editorial-texto)]">Protocolo:</strong>{" "}
                          <code className="rounded bg-current/10 px-1 py-0.5 font-mono text-[11px]">
                            {protocoloGerado}
                          </code>
                        </p>
                      ) : null}
                    </div>
                  ) : resumoConfigurado?.ativo && respostasResumo.length > 0 ? (
                    <dl
                      data-testid="resumo-conclusao-configurado"
                      className="space-y-3 rounded-md border border-current/15 p-4 text-sm"
                    >
                      {respostasResumo.map((item, indice) => (
                        <div key={indice}>
                          <dt className="text-[var(--editorial-texto-secundario)]">
                            {item.rotulo}
                          </dt>
                          <dd className="mt-1 break-words whitespace-pre-wrap">{item.valor}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {microfluxo.conclusao && protocoloGerado ? (
                    <p role="status" className="text-xs">
                      Solicitação recebida. Protocolo: <code>{protocoloGerado}</code>
                    </p>
                  ) : null}

                  {demonstrativoComercialAtivo &&
                  politicaConclusao.permiteCalculoComercial() &&
                  (!resumoConfigurado ||
                    (resumoConfigurado.ativo && resumoConfigurado.incluirDemonstrativo)) ? (
                    <div
                      data-testid="demonstrativo-comercial-congelado"
                      className="space-y-2 rounded-sm border border-current/15 bg-[var(--editorial-fundo)] p-4 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="tracking-[0.14em] text-[var(--editorial-texto-secundario)] uppercase">
                          Demonstrativo comercial registrado
                        </span>
                        <span className="text-sm font-semibold text-[var(--editorial-destaque)]">
                          {demonstrativoComercialAtivo.resumoFormatado}
                        </span>
                      </div>

                      {demonstrativoComercialAtivo.linhas.length > 0 ? (
                        <ul className="space-y-1 border-t border-current/10 pt-2 text-[11px] text-[var(--editorial-texto-secundario)]">
                          {demonstrativoComercialAtivo.linhas.map((linha) => (
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
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3">
                    {acoesConclusao.map((acao, indice) => {
                      let href = resolverDestinoAcaoConclusao(
                        acao,
                        pagina.identificadorPublico,
                        acervo,
                        acao.tipo === "whatsapp"
                          ? linkWhatsappConclusao(acao.numeroOpcional)
                          : null,
                      );
                      // Preserva apenas o identificador profissional validado, sem respostas na URL.
                      if (href && acao.tipo === "microfluxo" && profissionalSelecionado)
                        href += `?consultor=${encodeURIComponent(profissionalSelecionado.id)}`;
                      return href ? (
                        <a
                          key={indice}
                          href={href}
                          target={
                            acao.tipo === "whatsapp" || acao.tipo === "url_externa"
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            acao.tipo === "whatsapp" || acao.tipo === "url_externa"
                              ? "noopener noreferrer"
                              : undefined
                          }
                          onClick={(evento) => {
                            if (acao.tipo === "whatsapp") registrarCliqueWhatsappConclusao();
                            if (acao.tipo === "home" && window.location.pathname === href) {
                              evento.preventDefault();
                              aoAlterarAbertura(false);
                            }
                          }}
                          className={combinarClasses(
                            "inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-3 text-sm",
                            indice === 0
                              ? "bg-[var(--editorial-texto)] text-[var(--editorial-fundo)] font-semibold"
                              : "border border-current/20 font-medium",
                          )}
                        >
                          {acao.rotulo}
                        </a>
                      ) : null;
                    })}
                    {!(microfluxo.conclusao?.acoes?.length) ? (
                      <>
                        <a
                          href="#contato"
                          onClick={() => aoAlterarAbertura(false)}
                          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[var(--editorial-texto)] px-5 py-3 text-sm font-semibold text-[var(--editorial-fundo)] transition-opacity hover:opacity-90"
                        >
                          Entrar em contato
                        </a>
                        <button
                          type="button"
                          onClick={() => aoAlterarAbertura(false)}
                          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-current/20 px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80"
                        >
                          Fechar
                        </button>
                      </>
                    ) : null}
                  </div>
                </section>
              ) : (
                <section className="mt-4 space-y-5" aria-live="polite">
                  {etapaAtual.tipoEtapa === "etapa_livre" &&
                  etapaAtual.blocos?.some((b) => b.tipo === "campo" && b.finalidade) ? (
                    <div
                      aria-hidden="true"
                      className="absolute h-px w-px overflow-hidden opacity-0"
                    >
                      <label htmlFor="verificacao-etapa-livre">Não preencha este campo</label>
                      <input
                        id="verificacao-etapa-livre"
                        tabIndex={-1}
                        autoComplete="off"
                        value={campoArmadilhaBot}
                        onChange={(e) => setCampoArmadilhaBot(e.target.value)}
                      />
                    </div>
                  ) : null}
                  {etapaAtual.tipoEtapa === "etapa_livre" ? (
                    <ConteudoEtapaLivreVisitante
                      etapa={etapaAtual}
                      respostas={estado.respostas}
                      acervo={acervo}
                      aoResponder={(bloco, valor) => {
                        setMensagemErro(null);
                        setEstado(
                          atualizarRespostasExecucaoMicrofluxo(
                            estado,
                            atualizarRespostaBloco(etapaAtual, bloco, estado.respostas, valor),
                          ),
                        );
                      }}
                      aoSelecionarCatalogo={(bloco, tipo, id) => {
                        setMensagemErro(null);
                        setEstado(
                          atualizarRespostasExecucaoMicrofluxo(
                            estado,
                            atualizarRespostaBloco(
                              etapaAtual,
                              bloco,
                              estado.respostas,
                              `${tipo}:${id}`,
                            ),
                          ),
                        );
                      }}
                      aoSelecionarProfissional={(bloco, id) => {
                        setMensagemErro(null);
                        setEstado(
                          atualizarRespostasExecucaoMicrofluxo(
                            estado,
                            atualizarRespostaBloco(etapaAtual, bloco, estado.respostas, id),
                          ),
                        );
                      }}
                    />
                  ) : null}
                  {etapaAtual.tipoEtapa === "selecao_unica" && etapaAtual.opcoes ? (
                    <div className="space-y-3" role="radiogroup" aria-label={etapaAtual.titulo}>
                      {etapaAtual.opcoes.map((opcao) => {
                        const selecionada =
                          estado.respostas.opcoesUnicasPorEtapa[etapaAtual.id] === opcao.id;
                        return (
                          <button
                            key={opcao.id}
                            type="button"
                            role="radio"
                            aria-checked={selecionada}
                            onClick={() => selecionarOpcaoUnica(opcao.id)}
                            className={combinarClasses(
                              "group flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
                              selecionada
                                ? "border-[var(--editorial-destaque)] bg-[var(--editorial-superficie)] ring-2 ring-[var(--editorial-destaque)] shadow-md shadow-[var(--editorial-destaque)]/10"
                                : "border-current/15 bg-[var(--editorial-superficie)]/70 backdrop-blur-xs hover:border-current/35 hover:bg-[var(--editorial-superficie)]",
                            )}
                          >
                            <div>
                              <p className="text-sm font-semibold tracking-wide">{opcao.rotulo}</p>
                              {opcao.descricaoCurta ? (
                                <p className="mt-1 text-xs text-[var(--editorial-texto-secundario)]">
                                  {opcao.descricaoCurta}
                                </p>
                              ) : null}
                              {opcao.valorAdicionalCentavos && opcao.valorAdicionalCentavos > 0 ? (
                                <p className="mt-1 text-xs font-semibold text-[var(--editorial-destaque)]">
                                  +{" "}
                                  {ValorMonetarioCentavos.deCentavos(
                                    opcao.valorAdicionalCentavos,
                                  ).formatarMoedaBrasileira()}
                                </p>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {etapaAtual.tipoEtapa === "selecao_multipla" && etapaAtual.opcoes ? (
                    <div className="space-y-3" role="group" aria-label={etapaAtual.titulo}>
                      {etapaAtual.opcoes.map((opcao) => {
                        const selecionadas =
                          estado.respostas.opcoesMultiplasPorEtapa[etapaAtual.id] ?? [];
                        const marcada = selecionadas.includes(opcao.id);

                        return (
                          <button
                            key={opcao.id}
                            type="button"
                            aria-pressed={marcada}
                            onClick={() => alternarOpcaoMultipla(opcao.id)}
                            className={combinarClasses(
                              "flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
                              marcada
                                ? "border-[var(--editorial-destaque)] bg-[var(--editorial-superficie)] ring-2 ring-[var(--editorial-destaque)] shadow-md shadow-[var(--editorial-destaque)]/10"
                                : "border-current/15 bg-[var(--editorial-superficie)]/70 backdrop-blur-xs hover:border-current/35 hover:bg-[var(--editorial-superficie)]",
                            )}
                          >
                            <div>
                              <p className="text-sm font-semibold tracking-wide">{opcao.rotulo}</p>
                              {opcao.descricaoCurta ? (
                                <p className="mt-1 text-xs text-[var(--editorial-texto-secundario)]">
                                  {opcao.descricaoCurta}
                                </p>
                              ) : null}
                              {opcao.valorAdicionalCentavos && opcao.valorAdicionalCentavos > 0 ? (
                                <p className="mt-1 text-xs font-semibold text-[var(--editorial-destaque)]">
                                  +{" "}
                                  {ValorMonetarioCentavos.deCentavos(
                                    opcao.valorAdicionalCentavos,
                                  ).formatarMoedaBrasileira()}
                                </p>
                              ) : null}
                            </div>
                            <span
                              className={combinarClasses(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                                marcada
                                  ? "border-[var(--editorial-destaque)] bg-[var(--editorial-destaque)] text-[var(--editorial-fundo)]"
                                  : "border-current/30",
                              )}
                            >
                              {marcada ? <Check className="h-3 w-3" /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {etapaAtual.tipoEtapa === "selecao_catalogo" ? (
                    <div className="space-y-3">
                      {servicosDisponiveisEtapa.map((servico) => {
                        const selecionado = estado.respostas.servicoSelecionadoId === servico.id;
                        const pontoFocal = servico.pontoFocalImagem
                          ? `${servico.pontoFocalImagem.xPercentual}% ${servico.pontoFocalImagem.yPercentual}%`
                          : "50% 50%";
                        return (
                          <button
                            key={servico.id}
                            type="button"
                            onClick={() => {
                              setMensagemErro(null);
                              const novoEstado = atualizarRespostasExecucaoMicrofluxo(estado, {
                                servicoSelecionadoId: servico.id,
                              });
                              setEstado(novoEstado);
                              if (
                                microfluxo.regraCalculoComercial?.modalidade !==
                                "quantidade_vezes_preco"
                              ) {
                              }
                            }}
                            className={combinarClasses(
                              "group flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300",
                              selecionado
                                ? "border-[var(--editorial-destaque)] bg-[var(--editorial-superficie)] ring-2 ring-[var(--editorial-destaque)] shadow-lg shadow-[var(--editorial-destaque)]/10"
                                : "border-current/15 bg-[var(--editorial-superficie)]/70 backdrop-blur-xs hover:border-current/35 hover:bg-[var(--editorial-superficie)]",
                            )}
                          >
                            {servico.urlImagemOpcional ? (
                              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/10">
                                <Image
                                  src={servico.urlImagemOpcional}
                                  alt={servico.nome}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 520px"
                                  unoptimized={deveIgnorarOtimizadorImagem(
                                    servico.urlImagemOpcional,
                                  )}
                                  style={{ objectPosition: pontoFocal }}
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                            ) : null}

                            <div className="flex w-full flex-col gap-2 p-5">
                              <div className="flex w-full items-center justify-between gap-2">
                                <span className="rounded-full bg-current/8 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.12em] text-[var(--editorial-texto-secundario)] uppercase">
                                  {servico.categoria}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-[var(--editorial-destaque)]">
                                    {formatarApresentacaoPrecoItem({
                                      centavos: servico.precoBaseCentavos,
                                      rotuloOpcional: servico.rotuloPrecoOpcional,
                                    })}
                                  </span>
                                </div>
                              </div>
                              <p className="text-base font-semibold tracking-tight">
                                {servico.nome}
                              </p>
                              <p className="text-xs leading-relaxed text-[var(--editorial-texto-secundario)]">
                                {servico.resumo}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      {produtosDisponiveisEtapa.map((produto) => {
                        const selecionado = estado.respostas.produtoSelecionadoId === produto.id;
                        const pontoFocal = produto.pontoFocalImagem
                          ? `${produto.pontoFocalImagem.xPercentual}% ${produto.pontoFocalImagem.yPercentual}%`
                          : "50% 50%";
                        return (
                          <button
                            key={produto.id}
                            type="button"
                            onClick={() => {
                              setMensagemErro(null);
                              const novoEstado = atualizarRespostasExecucaoMicrofluxo(estado, {
                                produtoSelecionadoId: produto.id,
                              });
                              setEstado(novoEstado);
                              if (
                                microfluxo.regraCalculoComercial?.modalidade !==
                                "quantidade_vezes_preco"
                              ) {
                              }
                            }}
                            className={combinarClasses(
                              "group flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300",
                              selecionado
                                ? "border-[var(--editorial-destaque)] bg-[var(--editorial-superficie)] ring-2 ring-[var(--editorial-destaque)] shadow-lg shadow-[var(--editorial-destaque)]/10"
                                : "border-current/15 bg-[var(--editorial-superficie)]/70 backdrop-blur-xs hover:border-current/35 hover:bg-[var(--editorial-superficie)]",
                            )}
                          >
                            {produto.urlImagemPrincipal ? (
                              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/10">
                                <Image
                                  src={produto.urlImagemPrincipal}
                                  alt={produto.textoAlternativoImagem ?? produto.nome}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 520px"
                                  unoptimized={deveIgnorarOtimizadorImagem(
                                    produto.urlImagemPrincipal,
                                  )}
                                  style={{ objectPosition: pontoFocal }}
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                            ) : null}

                            <div className="flex w-full flex-col gap-2 p-5">
                              <div className="flex w-full items-center justify-between gap-2">
                                <span className="rounded-full bg-current/8 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.12em] text-[var(--editorial-texto-secundario)] uppercase">
                                  {produto.categoria}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-[var(--editorial-destaque)]">
                                    {formatarApresentacaoPrecoItem({
                                      centavos: produto.precoCentavos,
                                    })}
                                  </span>
                                </div>
                              </div>
                              <p className="text-base font-semibold tracking-tight">
                                {produto.nome}
                              </p>
                              {produto.especificacoesCurtas &&
                              produto.especificacoesCurtas.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {produto.especificacoesCurtas.map((esp, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded-full border border-current/15 px-2.5 py-0.5 text-[11px] text-[var(--editorial-texto-secundario)]"
                                    >
                                      {esp}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <p className="text-xs leading-relaxed text-[var(--editorial-texto-secundario)]">
                                {produto.resumo}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      {servicosDisponiveisEtapa.length === 0 &&
                      produtosDisponiveisEtapa.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMensagemErro(null);
                            const novoEstado = atualizarRespostasExecucaoMicrofluxo(estado, {
                              servicoSelecionadoId: "atendimento-personalizado",
                            });
                            setEstado(novoEstado);
                            if (
                              microfluxo.regraCalculoComercial?.modalidade !==
                              "quantidade_vezes_preco"
                            ) {
                            }
                          }}
                          className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] p-4 text-left text-sm"
                        >
                          Atendimento consultivo personalizado com {pagina.identidade.nomeExibicao}
                        </button>
                      ) : null}

                      {microfluxo.regraCalculoComercial?.modalidade === "quantidade_vezes_preco" &&
                      (estado.respostas.servicoSelecionadoId ||
                        estado.respostas.produtoSelecionadoId) ? (
                        <div className="flex items-center justify-between gap-4 rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-4 py-3">
                          <label
                            htmlFor="quantidade-comercial-microfluxo"
                            className="text-xs font-medium text-[var(--editorial-texto)]"
                          >
                            Quantidade desejada
                            {microfluxo.regraCalculoComercial.unidadeQuantidade
                              ? ` (${microfluxo.regraCalculoComercial.unidadeQuantidade})`
                              : ""}
                          </label>
                          <input
                            id="quantidade-comercial-microfluxo"
                            type="number"
                            min={microfluxo.regraCalculoComercial.quantidadeMinima ?? 1}
                            max={microfluxo.regraCalculoComercial.quantidadeMaxima ?? 1000}
                            value={
                              estado.respostas.quantidadeComercial ??
                              microfluxo.regraCalculoComercial.quantidadeMinima ??
                              1
                            }
                            onChange={(e) => {
                              const valorInteiro = Number.parseInt(e.target.value, 10);
                              setEstado(
                                atualizarRespostasExecucaoMicrofluxo(estado, {
                                  quantidadeComercial: Number.isNaN(valorInteiro)
                                    ? 1
                                    : Math.max(1, valorInteiro),
                                }),
                              );
                            }}
                            className="w-24 rounded-sm border border-current/25 bg-[var(--editorial-fundo)] px-3 py-1.5 text-right text-sm font-medium"
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {etapaAtual.tipoEtapa === "selecao_profissional" ? (
                    <div className="space-y-3">
                      {acervo.profissionais.map((profissional) => {
                        const selecionado =
                          estado.respostas.profissionalSelecionadoId === profissional.id;
                        return (
                          <button
                            key={profissional.id}
                            type="button"
                            onClick={() => {
                              setMensagemErro(null);
                              const novoEstado = atualizarRespostasExecucaoMicrofluxo(estado, {
                                profissionalSelecionadoId: profissional.id,
                              });
                              setEstado(novoEstado);

                            }}
                            className={combinarClasses(
                              "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300",
                              selecionado
                                ? "border-[var(--editorial-destaque)] bg-[var(--editorial-superficie)] ring-2 ring-[var(--editorial-destaque)] shadow-lg shadow-[var(--editorial-destaque)]/10"
                                : "border-current/15 bg-[var(--editorial-superficie)]/70 backdrop-blur-xs hover:border-current/35 hover:bg-[var(--editorial-superficie)]",
                            )}
                          >
                            <AvatarProfissional
                              urlFoto={profissional.urlFotoPerfil}
                              nome={profissional.nomeCompleto}
                              pontoFocal={profissional.pontoFocalFoto}
                              tamanho="medio"
                              formato="circular"
                            />
                            <div className="flex-1">
                              <p className="text-base font-medium">{profissional.nomeCompleto}</p>
                              <p className="text-xs text-[var(--editorial-destaque)]">
                                {profissional.cargoOuEspecialidade}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-[var(--editorial-texto-secundario)]">
                                {profissional.minibiografia}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      {acervo.profissionais.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMensagemErro(null);
                            setEstado(
                              atualizarRespostasExecucaoMicrofluxo(estado, {
                                profissionalSelecionadoId: "equipe-principal",
                              }),
                            );
                          }}
                          className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] p-4 text-left text-sm"
                        >
                          Equipe principal de {pagina.identidade.nomeExibicao}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {etapaAtual.tipoEtapa === "entrada_curta" &&
                  (!etapaAtual.campos || etapaAtual.campos.length === 0) ? (
                    <div>
                      <label htmlFor={`campo-${etapaAtual.id}`} className="sr-only">
                        {etapaAtual.titulo}
                      </label>
                      <textarea
                        id={`campo-${etapaAtual.id}`}
                        rows={4}
                        placeholder={
                          etapaAtual.placeholderEntrada ?? "Compartilhe os detalhes principais..."
                        }
                        value={estado.respostas.textosCurtosPorEtapa[etapaAtual.id] ?? ""}
                        onChange={(e) => {
                          setMensagemErro(null);
                          setEstado(
                            atualizarRespostasExecucaoMicrofluxo(estado, {
                              textosCurtosPorEtapa: {
                                ...estado.respostas.textosCurtosPorEtapa,
                                [etapaAtual.id]: e.target.value,
                              },
                            }),
                          );
                        }}
                        className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-4 py-3 text-sm text-[var(--editorial-texto)] placeholder:text-[var(--editorial-texto-secundario)]/60 focus:border-[var(--editorial-destaque)] focus:outline-none"
                      />
                    </div>
                  ) : null}

                  {etapaAtual.tipoEtapa !== "etapa_livre" &&
                  (etapaAtual.tipoEtapa === "formulario_dinamico" ||
                    (etapaAtual.campos && etapaAtual.campos.length > 0)) ? (
                    <div className="space-y-4">
                      {etapaAtual.campos?.map((campo) => {
                        const valorAtual =
                          estado.respostas.camposDinamicosPorEtapa?.[etapaAtual.id]?.[campo.id];
                        return (
                          <ItemCampoFormularioDinamico
                            key={campo.id}
                            campo={campo}
                            valor={valorAtual}
                            aoMudar={(novoValor) => {
                              setMensagemErro(null);
                              const respostasDaEtapa =
                                estado.respostas.camposDinamicosPorEtapa?.[etapaAtual.id] ?? {};
                              setEstado(
                                atualizarRespostasExecucaoMicrofluxo(estado, {
                                  camposDinamicosPorEtapa: {
                                    ...estado.respostas.camposDinamicosPorEtapa,
                                    [etapaAtual.id]: {
                                      ...respostasDaEtapa,
                                      [campo.id]: novoValor,
                                    },
                                  },
                                }),
                              );
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : null}

                  {etapaAtual.tipoEtapa === "recomendacao_catalogo"
                    ? (() => {
                        const recomendacao = calcularRecomendacaoMicrofluxo(
                          estado,
                          etapaAtual,
                          acervo,
                        );
                        return (
                          <div
                            data-testid="bloco-recomendacao-microfluxo"
                            className="space-y-4 rounded-md border border-[var(--editorial-destaque)]/50 bg-[var(--editorial-superficie)] p-5"
                          >
                            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-[var(--editorial-destaque)] uppercase">
                              <Sparkles className="h-4 w-4" aria-hidden="true" />
                              <span>Recomendação Editorial</span>
                            </div>

                            <h4 className={combinarClasses("text-xl", tipografia.classeTitulo)}>
                              {recomendacao.titulo}
                            </h4>
                            <p className="text-sm leading-relaxed text-[var(--editorial-texto-secundario)]">
                              {recomendacao.descricao}
                            </p>

                            {recomendacao.servicoRecomendado ? (
                              <p className="text-xs font-medium text-[var(--editorial-destaque)]">
                                {formatarApresentacaoPrecoItem({
                                  centavos: recomendacao.servicoRecomendado.precoBaseCentavos,
                                  rotuloOpcional:
                                    recomendacao.servicoRecomendado.rotuloPrecoOpcional,
                                })}
                              </p>
                            ) : null}
                          </div>
                        );
                      })()
                    : null}

                  {etapaAtual.tipoEtapa === "instrucao_pix_manual" &&
                  etapaAtual.configuracaoPixManual ? (
                    <div className="space-y-4 rounded-md border border-current/20 bg-[var(--editorial-superficie)] p-5">
                      <div className="space-y-1">
                        <p className="text-[11px] tracking-[0.16em] text-[var(--editorial-destaque)] uppercase">
                          Pix Manual Direto ao Estabelecimento
                        </p>
                        <p className="text-sm font-medium">
                          Recebedor: {etapaAtual.configuracaoPixManual.nomeRecebedor}
                        </p>
                        {etapaAtual.configuracaoPixManual.valorReferenciaTexto ? (
                          <p className="text-xs text-[var(--editorial-texto-secundario)]">
                            Valor de referência:{" "}
                            {etapaAtual.configuracaoPixManual.valorReferenciaTexto}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between gap-2 rounded-sm border border-current/15 bg-[var(--editorial-fundo)] px-3.5 py-2.5">
                        <code className="truncate text-xs">
                          {etapaAtual.configuracaoPixManual.chavePix}
                        </code>
                        <button
                          type="button"
                          onClick={() =>
                            void copiarTextoComAviso(
                              etapaAtual.configuracaoPixManual!.chavePix,
                              "Chave Pix copiada.",
                            )
                          }
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xs border border-current/25 px-2.5 py-1 text-xs font-medium"
                        >
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copiar chave</span>
                        </button>
                      </div>

                      <p className="text-xs leading-relaxed text-[var(--editorial-texto-secundario)]">
                        {etapaAtual.configuracaoPixManual.instrucaoComprovante}
                      </p>
                    </div>
                  ) : null}

                  {etapaAtual.tipoEtapa === "conectar_whatsapp" ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-current/15 bg-[var(--editorial-superficie)]/80 p-5 text-xs backdrop-blur-md shadow-md">
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--editorial-destaque)] uppercase">
                          Resumo da sua solicitação
                        </p>
                        <div className="mt-3.5 space-y-2.5 border-t border-current/10 pt-3">
                          {servicoSelecionado ? (
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[var(--editorial-texto-secundario)]">
                                Modalidade:
                              </span>
                              <span className="font-medium text-right">
                                {servicoSelecionado.nome}
                              </span>
                            </div>
                          ) : null}

                          {produtoSelecionado ? (
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[var(--editorial-texto-secundario)]">
                                Item:
                              </span>
                              <span className="font-medium text-right">
                                {produtoSelecionado.nome}
                              </span>
                            </div>
                          ) : null}

                          {Object.entries(estado.respostas.textosCurtosPorEtapa).map(
                            ([etapaId, texto]) => {
                              const etapaRespondida = microfluxo.etapas.find(
                                (e) => e.id === etapaId,
                              );
                              if (!texto.trim()) return null;
                              return (
                                <div
                                  key={etapaId}
                                  className="flex items-start justify-between gap-3"
                                >
                                  <span className="text-[var(--editorial-texto-secundario)]">
                                    {etapaRespondida?.titulo ?? "Veículo/Detalhes"}:
                                  </span>
                                  <span className="font-medium text-right">{texto}</span>
                                </div>
                              );
                            },
                          )}

                          {profissionalResponsavelWhatsApp && linkDiretoWhatsAppEtapa ? (
                            <div className="flex items-center justify-between gap-3 border-t border-current/10 pt-2 text-[11px]">
                              <span className="text-[var(--editorial-texto-secundario)]">
                                Atendimento:
                              </span>
                              <span className="font-medium">
                                {profissionalResponsavelWhatsApp.nomeCompleto} (
                                {profissionalResponsavelWhatsApp.cargoOuEspecialidade})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 border-t border-current/10 pt-2 text-center text-xs text-amber-700">
                              <span>WhatsApp indisponível para esta equipe no momento.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {linkDiretoWhatsAppEtapa ? (
                        <p className="text-center text-[11px] text-[var(--editorial-texto-secundario)]">
                          Conclua a experiência para ver as opções de continuação disponíveis.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {etapaAtual.tipoEtapa === "coleta_contato" ? (
                    <div className="space-y-4">
                      {/* Armadilha anti-bot (honeypot) oculta de forma estrita para visitantes humanos */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          width: "1px",
                          height: "1px",
                          padding: 0,
                          margin: "-1px",
                          overflow: "hidden",
                          clip: "rect(0, 0, 0, 0)",
                          whiteSpace: "nowrap",
                          border: 0,
                          pointerEvents: "none",
                          opacity: 0,
                        }}
                      >
                        <label htmlFor="campo-verificacao-institucional">
                          Não preencha este campo
                        </label>
                        <input
                          id="campo-verificacao-institucional"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={campoArmadilhaBot}
                          onChange={(e) => setCampoArmadilhaBot(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contato-nome-visitante"
                          className="block text-xs font-medium text-[var(--editorial-texto-secundario)]"
                        >
                          Seu nome *
                        </label>
                        <input
                          id="contato-nome-visitante"
                          type="text"
                          required
                          placeholder="Como podemos chamar você?"
                          value={estado.respostas.contatoVisitante?.nomeCompleto ?? ""}
                          onChange={(e) => {
                            setMensagemErro(null);
                            const atual = estado.respostas.contatoVisitante ?? {
                              nomeCompleto: "",
                              telefoneOuWhatsapp: "",
                            };
                            setEstado(
                              atualizarRespostasExecucaoMicrofluxo(estado, {
                                contatoVisitante: {
                                  ...atual,
                                  nomeCompleto: e.target.value,
                                },
                              }),
                            );
                          }}
                          className="mt-1.5 w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] focus:border-[var(--editorial-destaque)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contato-whatsapp-visitante"
                          className="block text-xs font-medium text-[var(--editorial-texto-secundario)]"
                        >
                          WhatsApp ou telefone *
                        </label>
                        <input
                          id="contato-whatsapp-visitante"
                          type="tel"
                          required
                          placeholder="(11) 99999-9999"
                          value={estado.respostas.contatoVisitante?.telefoneOuWhatsapp ?? ""}
                          onChange={(e) => {
                            setMensagemErro(null);
                            const atual = estado.respostas.contatoVisitante ?? {
                              nomeCompleto: "",
                              telefoneOuWhatsapp: "",
                            };
                            setEstado(
                              atualizarRespostasExecucaoMicrofluxo(estado, {
                                contatoVisitante: {
                                  ...atual,
                                  telefoneOuWhatsapp: e.target.value,
                                },
                              }),
                            );
                          }}
                          className="mt-1.5 w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] focus:border-[var(--editorial-destaque)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contato-email-visitante"
                          className="block text-xs font-medium text-[var(--editorial-texto-secundario)]"
                        >
                          E-mail (opcional)
                        </label>
                        <input
                          id="contato-email-visitante"
                          type="email"
                          placeholder="voce@exemplo.com.br"
                          value={estado.respostas.contatoVisitante?.email ?? ""}
                          onChange={(e) => {
                            const atual = estado.respostas.contatoVisitante ?? {
                              nomeCompleto: "",
                              telefoneOuWhatsapp: "",
                            };
                            setEstado(
                              atualizarRespostasExecucaoMicrofluxo(estado, {
                                contatoVisitante: {
                                  ...atual,
                                  email: e.target.value,
                                },
                              }),
                            );
                          }}
                          className="mt-1.5 w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] focus:border-[var(--editorial-destaque)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contato-observacao-visitante"
                          className="block text-xs font-medium text-[var(--editorial-texto-secundario)]"
                        >
                          Observação complementar (opcional)
                        </label>
                        <textarea
                          id="contato-observacao-visitante"
                          rows={2}
                          placeholder="Horário preferencial ou detalhe adicional..."
                          value={estado.respostas.contatoVisitante?.mensagemAdicional ?? ""}
                          onChange={(e) => {
                            const atual = estado.respostas.contatoVisitante ?? {
                              nomeCompleto: "",
                              telefoneOuWhatsapp: "",
                            };
                            setEstado(
                              atualizarRespostasExecucaoMicrofluxo(estado, {
                                contatoVisitante: {
                                  ...atual,
                                  mensagemAdicional: e.target.value,
                                },
                              }),
                            );
                          }}
                          className="mt-1.5 w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] focus:border-[var(--editorial-destaque)] focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : null}

                  {mensagemErro ? (
                    <p
                      role="alert"
                      className="rounded-sm border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300"
                    >
                      {mensagemErro}
                    </p>
                  ) : null}
                </section>
              )}
            </TransicaoAlternancia>

            {/* Demonstrativo comercial em tempo real durante as etapas (quando a modalidade for diferente de sem_calculo) */}
            {!estado.concluido && demonstrativoComercialAtivo ? (
              <div
                data-testid="demonstrativo-comercial-microfluxo"
                className="mt-6 space-y-2 rounded-2xl border border-current/15 bg-[var(--editorial-superficie)]/90 p-4 text-xs backdrop-blur-xs shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="tracking-[0.14em] text-[var(--editorial-texto-secundario)] uppercase font-medium">
                    Estimativa comercial
                  </span>
                  <span className="text-sm font-semibold text-[var(--editorial-destaque)]">
                    {demonstrativoComercialAtivo.resumoFormatado}
                  </span>
                </div>

                {demonstrativoComercialAtivo.linhas.length > 1 ? (
                  <ul className="space-y-1 border-t border-current/10 pt-2 text-[11px] text-[var(--editorial-texto-secundario)]">
                    {demonstrativoComercialAtivo.linhas.map((linha) => (
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
                ) : null}

                {demonstrativoComercialAtivo.observacaoTransparencia ? (
                  <p className="text-[11px] text-[var(--editorial-texto-secundario)]">
                    {demonstrativoComercialAtivo.observacaoTransparencia}
                  </p>
                ) : null}
              </div>
            ) : null}
    </BottomSheetEditorialBase>
  );
}
