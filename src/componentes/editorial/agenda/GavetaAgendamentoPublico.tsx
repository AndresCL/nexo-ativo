"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type {
  PortaAgendamentoVisitante,
  ResultadoSubmissaoAgendamentoVisitante,
} from "@/aplicacao/portas/portasAgenda";
import {
  formatarDataCurtaPtBr,
  obterDataHoraAtualNoFuso,
} from "@/dominio/agenda/calendarioDatas";
import {
  FUSO_HORARIO_PADRAO_AGENDA,
  type DisponibilidadeDiaPublico,
  type RespostaDisponibilidadeAgendaPublica,
  type SlotHorarioDisponivel,
} from "@/dominio/agenda/tiposAgenda";
import {
  obterDescritorTipografiaEditorial,
  resolverTemaEscuroBottomSheetEditorial,
  type ConteudoPaginaPublicada,
  type ItemAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import { TransicaoAlternancia } from "@/componentes/interface/TransicaoAlternancia";
import { obterOuDetectarOrigemSessao } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { servicoAgendamentoVisitantePadrao } from "@/infraestrutura/vitrine/servicoAgendamentoVisitante";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { BottomSheetEditorialBase } from "../BottomSheetEditorialBase";
import { useAmbienteVitrine } from "../contextoAmbienteVitrine";
import { PassoConfirmacaoAgenda } from "./PassoConfirmacaoAgenda";
import {
  PassoDadosVisitanteAgenda,
  type DadosFormularioVisitanteAgenda,
} from "./PassoDadosVisitanteAgenda";
import { PassoSelecaoDataHorario } from "./PassoSelecaoDataHorario";

export interface PropriedadesGavetaAgendamentoPublico {
  readonly aberto: boolean;
  readonly aoFechar: () => void;
  readonly aoRetornarFoco?: () => void;
  readonly pagina: ConteudoPaginaPublicada;
  readonly acaoAgenda: ItemAcaoHome | null;
  readonly servicoAgendamento?: PortaAgendamentoVisitante;
}

type EtapaAgendamento = "selecao" | "dados" | "confirmacao";

const TTL_CACHE_DISPONIBILIDADE_MS = 30_000;

interface EntradaCacheDisponibilidade {
  readonly resposta: RespostaDisponibilidadeAgendaPublica;
  readonly expiraEmMs: number;
}

const FORMULARIO_INICIAL: DadosFormularioVisitanteAgenda = {
  nomeVisitante: "",
  emailVisitante: "",
  telefoneOuWhatsapp: "",
  observacoesVisitante: "",
  campoArmadilhaBot: "",
};

export function GavetaAgendamentoPublico({
  aberto,
  aoFechar,
  aoRetornarFoco,
  pagina,
  acaoAgenda,
  servicoAgendamento,
}: PropriedadesGavetaAgendamentoPublico) {
  const { registrarEventoTelemetria, servicoAgendamento: servicoAmbiente } = useAmbienteVitrine();
  const adaptador = servicoAgendamento ?? servicoAmbiente ?? servicoAgendamentoVisitantePadrao;

  const hojePadrao = obterDataHoraAtualNoFuso(new Date(), FUSO_HORARIO_PADRAO_AGENDA);
  const anoMesAtualMinimo = hojePadrao.dataIso.slice(0, 7);

  const [etapa, setEtapa] = useState<EtapaAgendamento>("selecao");
  const [anoMes, setAnoMes] = useState<string>(anoMesAtualMinimo);
  const [carregando, setCarregando] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [agendaAtiva, setAgendaAtiva] = useState(true);
  const [fusoHorario, setFusoHorario] = useState(FUSO_HORARIO_PADRAO_AGENDA);
  const [duracaoSlotMinutos, setDuracaoSlotMinutos] = useState(60);
  const [diasDisponiveis, setDiasDisponiveis] = useState<readonly DisponibilidadeDiaPublico[]>([]);
  const [proximoDiaDisponivel, setProximoDiaDisponivel] = useState<string | undefined>(undefined);
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<SlotHorarioDisponivel | null>(null);
  const [dadosForm, setDadosForm] = useState<DadosFormularioVisitanteAgenda>(FORMULARIO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [resultadoConfirmacao, setResultadoConfirmacao] =
    useState<ResultadoSubmissaoAgendamentoVisitante | null>(null);

  const jaAutoAvancouMesRef = useRef(false);
  const cacheMesRef = useRef<Map<string, EntradaCacheDisponibilidade>>(new Map());
  const promessasEmVooRef = useRef<Map<string, Promise<RespostaDisponibilidadeAgendaPublica>>>(
    new Map(),
  );

  const possuiAcaoAgendaNaPagina = pagina.acoesPrincipais.some(
    (acao) => acao.tipoDestino === "agenda" || acao.destino.startsWith("#agenda-"),
  );

  const buscarDisponibilidadeComCache = useCallback(
    async (
      mesAlvo: string,
      avancarParaProximoMesDisponivel: boolean,
      ignorarCache = false,
    ): Promise<RespostaDisponibilidadeAgendaPublica> => {
      const chaveCache = `${mesAlvo}:${avancarParaProximoMesDisponivel ? "auto" : "fixo"}`;
      const agoraMs = Date.now();

      if (!ignorarCache) {
        const entrada = cacheMesRef.current.get(chaveCache);
        if (entrada && entrada.expiraEmMs > agoraMs) {
          return entrada.resposta;
        }
        const emVoo = promessasEmVooRef.current.get(chaveCache);
        if (emVoo) {
          return emVoo;
        }
      }

      const promessa = adaptador
        .consultarDisponibilidade({
          organizacaoId: pagina.organizacaoId,
          anoMes: mesAlvo,
          ...(avancarParaProximoMesDisponivel ? { avancarParaProximoMesDisponivel: true } : {}),
        })
        .then((resposta) => {
          const expiraEmMs = Date.now() + TTL_CACHE_DISPONIBILIDADE_MS;
          cacheMesRef.current.set(chaveCache, { resposta, expiraEmMs });
          cacheMesRef.current.set(`${resposta.anoMes}:fixo`, { resposta, expiraEmMs });
          return resposta;
        })
        .finally(() => {
          promessasEmVooRef.current.delete(chaveCache);
        });

      promessasEmVooRef.current.set(chaveCache, promessa);
      return promessa;
    },
    [adaptador, pagina.organizacaoId],
  );

  const aplicarRespostaDisponibilidade = useCallback(
    (resposta: RespostaDisponibilidadeAgendaPublica, mesSolicitado: string) => {
      setAgendaAtiva(resposta.agendaAtiva);
      setFusoHorario(resposta.fusoHorario);
      setDuracaoSlotMinutos(resposta.duracaoSlotMinutos);
      setDiasDisponiveis(resposta.diasDisponiveis);
      setProximoDiaDisponivel(resposta.proximoDiaDisponivelOpcional);

      if (resposta.anoMes !== mesSolicitado) {
        jaAutoAvancouMesRef.current = true;
        setAnoMes(resposta.anoMes);
      }

      if (resposta.diasDisponiveis.length > 0) {
        setDataSelecionada((atual) => {
          if (atual && resposta.diasDisponiveis.some((d) => d.dataIso === atual)) {
            return atual;
          }
          return resposta.diasDisponiveis[0]?.dataIso ?? null;
        });
        setHorarioSelecionado(null);
      } else if (
        !jaAutoAvancouMesRef.current &&
        resposta.proximoDiaDisponivelOpcional &&
        !resposta.proximoDiaDisponivelOpcional.startsWith(`${resposta.anoMes}-`)
      ) {
        jaAutoAvancouMesRef.current = true;
        const mesDestino = resposta.proximoDiaDisponivelOpcional.slice(0, 7);
        setAnoMes(mesDestino);
      } else {
        setDataSelecionada(null);
        setHorarioSelecionado(null);
      }
    },
    [],
  );

  const carregarMes = useCallback(
    async (mesAlvo: string, ignorarCache = false) => {
      const deveAutoAvancar = !jaAutoAvancouMesRef.current && mesAlvo === anoMesAtualMinimo;
      const chaveCache = `${mesAlvo}:${deveAutoAvancar ? "auto" : "fixo"}`;
      const entradaCache = !ignorarCache ? cacheMesRef.current.get(chaveCache) : undefined;

      if (entradaCache && entradaCache.expiraEmMs > Date.now()) {
        setErroCarregamento(null);
        setCarregando(false);
        aplicarRespostaDisponibilidade(entradaCache.resposta, mesAlvo);
        return;
      }

      setCarregando(true);
      setErroCarregamento(null);
      try {
        const resposta = await buscarDisponibilidadeComCache(
          mesAlvo,
          deveAutoAvancar,
          ignorarCache,
        );
        aplicarRespostaDisponibilidade(resposta, mesAlvo);
      } catch (erro) {
        setErroCarregamento(
          erro instanceof Error
            ? erro.message
            : "Não foi possível carregar os horários disponíveis agora.",
        );
      } finally {
        setCarregando(false);
      }
    },
    [anoMesAtualMinimo, aplicarRespostaDisponibilidade, buscarDisponibilidadeComCache],
  );

  // Prefetch silencioso assim que uma vitrine com agenda é carregada, evitando espera na 1ª abertura
  useEffect(() => {
    if (!possuiAcaoAgendaNaPagina) return;
    void buscarDisponibilidadeComCache(anoMesAtualMinimo, true).catch(() => {
      // Falha silenciosa: ao abrir a gaveta o usuário verá o tratamento de erro normal se persistir
    });
  }, [anoMesAtualMinimo, buscarDisponibilidadeComCache, possuiAcaoAgendaNaPagina]);

  useEffect(() => {
    if (!aberto) return;
    setEtapa("selecao");
    setErroEnvio(null);
    setResultadoConfirmacao(null);
    setHorarioSelecionado(null);
    jaAutoAvancouMesRef.current = false;
    setAnoMes(anoMesAtualMinimo);
  }, [aberto, anoMesAtualMinimo]);

  useEffect(() => {
    if (!aberto) return;
    void carregarMes(anoMes);
  }, [aberto, anoMes, carregarMes]);

  if (!acaoAgenda) return null;

  const temaEscuro = resolverTemaEscuroBottomSheetEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  );
  const tipografia = obterDescritorTipografiaEditorial(pagina.tipografiaId);

  const config = acaoAgenda.configuracaoAgenda;
  const tituloExibicao = config?.tituloModal?.trim() || acaoAgenda.rotulo;
  const descricaoExibicao = config?.descricaoCurtaModal?.trim() || acaoAgenda.subtituloDiscreto;
  const exigirTelefone = config?.exigirTelefone ?? true;
  const exibirCampoObservacoes = config?.exibirCampoObservacoes ?? true;
  const idExperiencia = acaoAgenda.destino.startsWith("#agenda-")
    ? acaoAgenda.destino.slice("#agenda-".length)
    : acaoAgenda.id.replace(/^acao-fluxo-/, "");

  const hojeLocal = obterDataHoraAtualNoFuso(new Date(), fusoHorario).dataIso;

  async function confirmarReserva() {
    if (!dataSelecionada || !horarioSelecionado || !acaoAgenda) return;

    const nomeLimpo = dadosForm.nomeVisitante.trim();
    const emailLimpo = dadosForm.emailVisitante.trim().toLowerCase();
    const telefoneLimpo = dadosForm.telefoneOuWhatsapp.trim();

    if (nomeLimpo.length < 2) {
      setErroEnvio("Informe seu nome completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setErroEnvio("Informe um e-mail válido para receber a confirmação.");
      return;
    }
    if (exigirTelefone && telefoneLimpo.replace(/\D/g, "").length < 8) {
      setErroEnvio("Informe um WhatsApp ou telefone válido com DDD.");
      return;
    }

    setEnviando(true);
    setErroEnvio(null);

    try {
      const resultado = await adaptador.registrarAgendamento({
        organizacaoId: pagina.organizacaoId,
        identificadorPublicoOrganizacao: pagina.identificadorPublico,
        microfluxoId: idExperiencia,
        tituloExperiencia: tituloExibicao,
        dataIso: dataSelecionada,
        horarioInicio: horarioSelecionado.horarioInicio,
        nomeVisitante: nomeLimpo,
        emailVisitante: emailLimpo,
        ...(telefoneLimpo ? { telefoneOuWhatsapp: telefoneLimpo } : {}),
        ...(dadosForm.observacoesVisitante.trim()
          ? { observacoesVisitante: dadosForm.observacoesVisitante.trim() }
          : {}),
        ...(dadosForm.campoArmadilhaBot ? { campoArmadilhaBot: dadosForm.campoArmadilhaBot } : {}),
      });

      cacheMesRef.current.clear();
      setResultadoConfirmacao(resultado);
      setEtapa("confirmacao");

      const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
      void registrarEventoTelemetria({
        organizacaoId: pagina.organizacaoId,
        tipoEvento: "conclusao_microfluxo",
        canalOrigem: origem.canalOrigem,
        ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
        ...(origem.cartaoProfissionalId
          ? { cartaoProfissionalId: origem.cartaoProfissionalId }
          : {}),
        microfluxoId: idExperiencia,
        microfluxoTitulo: tituloExibicao,
      });
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : "Não foi possível concluir seu agendamento. Tente novamente.";

      // Se houve conflito de último segundo, volta à escolha de horário preservando os dados digitados
      if (/reservado|indisponível|disponível/i.test(mensagem)) {
        cacheMesRef.current.clear();
        setErroEnvio(null);
        setHorarioSelecionado(null);
        setEtapa("selecao");
        void carregarMes(anoMes, true);
        setErroCarregamento(mensagem);
        return;
      }

      setErroEnvio(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  const classeBotaoPrimario =
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--editorial-cta-fundo)] px-4 text-sm font-semibold text-[var(--editorial-cta-texto)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

  const rodapeFixo =
    etapa === "selecao" ? (
      <div className="border-t border-current/10 pt-3">
        <button
          type="button"
          disabled={!dataSelecionada || !horarioSelecionado || carregando}
          onClick={() => setEtapa("dados")}
          className={classeBotaoPrimario}
        >
          <span>
            {dataSelecionada && horarioSelecionado
              ? `Continuar · ${formatarDataCurtaPtBr(dataSelecionada)} às ${horarioSelecionado.horarioInicio}`
              : "Escolha um dia e horário"}
          </span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    ) : etapa === "dados" ? (
      <div className="flex items-center gap-2 border-t border-current/10 pt-3">
        <button
          type="button"
          disabled={enviando}
          onClick={() => setEtapa("selecao")}
          aria-label="Voltar para escolha de data e horário"
          className={combinarClasses(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors",
            temaEscuro
              ? "border-white/18 text-white hover:bg-white/10"
              : "border-black/15 text-current hover:bg-black/5",
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={enviando}
          onClick={() => void confirmarReserva()}
          className={classeBotaoPrimario}
        >
          {enviando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Confirmando reserva…</span>
            </>
          ) : (
            <span>{config?.textoBotaoConfirmar?.trim() || "Confirmar agendamento"}</span>
          )}
        </button>
      </div>
    ) : (
      <div className="border-t border-current/10 pt-3">
        <button type="button" onClick={aoFechar} className={classeBotaoPrimario}>
          Concluir
        </button>
      </div>
    );

  return (
    <BottomSheetEditorialBase
      aberto={aberto}
      aoFechar={aoFechar}
      aoRetornarFoco={aoRetornarFoco}
      pagina={pagina}
      rotuloBotaoFechar="Fechar agenda"
      cabecalhoFixo={
        etapa === "confirmacao" ? (
          <>
            <DialogoPrimitivo.Title className="sr-only">
              {config?.mensagemConfirmacaoTitulo?.trim() || "Agendamento confirmado!"}
            </DialogoPrimitivo.Title>
            <DialogoPrimitivo.Description className="sr-only">
              {config?.mensagemConfirmacaoCorpo?.trim() || "Seu horário foi reservado com sucesso."}
            </DialogoPrimitivo.Description>
          </>
        ) : (
          <div className="border-b border-current/12 pr-10 pb-3.5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--editorial-texto-secundario)]">
              {pagina.identidade.nomeExibicao}
            </p>
            <DialogoPrimitivo.Title
              className={combinarClasses("mt-1 text-2xl sm:text-xl", tipografia.classeTitulo)}
            >
              {tituloExibicao}
            </DialogoPrimitivo.Title>
            {descricaoExibicao ? (
              <DialogoPrimitivo.Description className="mt-1 text-xs leading-relaxed text-[var(--editorial-texto-secundario)]">
                {descricaoExibicao}
              </DialogoPrimitivo.Description>
            ) : (
              <DialogoPrimitivo.Description className="sr-only">
                Reserve um horário disponível na agenda de {pagina.identidade.nomeExibicao}.
              </DialogoPrimitivo.Description>
            )}
          </div>
        )
      }
      rodapeFixo={rodapeFixo}
      classNameConteudoInterno="pt-4 pb-2"
    >
      <TransicaoAlternancia chaveId={etapa} variante="fade">
        {etapa === "selecao" ? (
          <PassoSelecaoDataHorario
            anoMes={anoMes}
            hojeIso={hojeLocal}
            carregando={carregando}
            erroCarregamento={erroCarregamento}
            agendaAtiva={agendaAtiva}
            fusoHorario={fusoHorario}
            duracaoSlotMinutos={duracaoSlotMinutos}
            diasDisponiveis={diasDisponiveis}
            proximoDiaDisponivelOpcional={proximoDiaDisponivel}
            dataSelecionada={dataSelecionada}
            horarioSelecionado={horarioSelecionado}
            temaEscuro={temaEscuro}
            podeVoltarMes={anoMes > anoMesAtualMinimo}
            aoAlterarMes={setAnoMes}
            aoSelecionarData={(data) => {
              setDataSelecionada(data);
              setHorarioSelecionado(null);
            }}
            aoSelecionarHorario={setHorarioSelecionado}
            aoTentarNovamente={() => void carregarMes(anoMes, true)}
          />
        ) : etapa === "dados" && dataSelecionada && horarioSelecionado ? (
          <PassoDadosVisitanteAgenda
            dataIso={dataSelecionada}
            slot={horarioSelecionado}
            duracaoSlotMinutos={duracaoSlotMinutos}
            exigirTelefone={exigirTelefone}
            exibirCampoObservacoes={exibirCampoObservacoes}
            dados={dadosForm}
            erroEnvio={erroEnvio}
            enviando={enviando}
            temaEscuro={temaEscuro}
            aoAlterarCampo={(campo, valor) =>
              setDadosForm((atual) => ({ ...atual, [campo]: valor }))
            }
            aoVoltarParaDataHorario={() => setEtapa("selecao")}
          />
        ) : resultadoConfirmacao ? (
          <PassoConfirmacaoAgenda
            resultado={resultadoConfirmacao}
            nomeOrganizacao={pagina.identidade.nomeExibicao}
            emailVisitante={dadosForm.emailVisitante.trim().toLowerCase()}
            tituloConfirmacao={
              config?.mensagemConfirmacaoTitulo?.trim() || "Agendamento confirmado!"
            }
            corpoConfirmacao={
              config?.mensagemConfirmacaoCorpo?.trim() ||
              "Seu horário foi reservado com sucesso."
            }
            temaEscuro={temaEscuro}
          />
        ) : null}
      </TransicaoAlternancia>
    </BottomSheetEditorialBase>
  );
}

