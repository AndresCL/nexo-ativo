import { describe, expect, it } from "vitest";
import {
  adicionarDiasDataIso,
  converterHorarioParaMinutos,
  ehDataIsoValida,
  gerarMatrizMensalCalendario,
  obterDataHoraAtualNoFuso,
} from "@/dominio/agenda/calendarioDatas";
import { gerarConteudoArquivoIcs } from "@/dominio/agenda/geradorArquivoIcs";
import {
  encontrarProximoDiaDisponivel,
  gerarSlotsDisponiveisParaDia,
} from "@/dominio/agenda/geradorHorariosDisponiveis";
import {
  criarConfiguracaoAgendaPadrao,
  type AgendamentoAgenda,
  type ConfiguracaoAgendaOrganizacao,
} from "@/dominio/agenda/tiposAgenda";
import {
  podarDatasAbertasPassadas,
  validarSlotParaReserva,
} from "@/dominio/agenda/validadorReservaAgenda";
import {
  construirEmailConfirmacaoAgendamentoVisitante,
  construirEmailNovoAgendamentoEquipe,
} from "@/dominio/email/templatesEmailAgenda";

describe("Domínio de Agenda: Datas, Slots, Sobreposição, ICS e E-mails", () => {
  const agoraFixo = new Date("2026-11-23T13:00:00.000Z"); // 10:00 em America/Sao_Paulo

  const configBase: ConfiguracaoAgendaOrganizacao = {
    ...criarConfiguracaoAgendaPadrao("org-1", "2026-11-23T10:00:00.000Z"),
    duracaoSlotMinutos: 60,
    intervaloEntreSlotsMinutos: 0,
    antecedenciaMinimaHoras: 2,
    janelaMaximaDias: 30,
    datasAbertas: {
      "2026-11-23": [
        { inicio: "09:00", fim: "14:00" },
        { inicio: "15:00", fim: "17:00" },
      ],
      "2026-11-25": [{ inicio: "09:00", fim: "12:00" }],
    },
  };

  it("valida datas civis e converte fuso America/Sao_Paulo corretamente", () => {
    expect(ehDataIsoValida("2026-11-23")).toBe(true);
    expect(ehDataIsoValida("2026-02-30")).toBe(false);
    expect(adicionarDiasDataIso("2026-11-30", 1)).toBe("2026-12-01");

    const local = obterDataHoraAtualNoFuso(agoraFixo, "America/Sao_Paulo");
    expect(local.dataIso).toBe("2026-11-23");
    expect(local.minutosDoDia).toBe(10 * 60);

    const matriz = gerarMatrizMensalCalendario("2026-11");
    expect(matriz.length % 7).toBe(0);
    expect(matriz.filter((c) => c.pertenceAoMes)).toHaveLength(30);
  });

  it("respeita antecedência mínima e bloqueia sobreposição mesmo com durações diferentes", () => {
    // Às 10:00 com 2h de antecedência -> só horários >= 12:00 são elegíveis hoje
    const slotsHoje = gerarSlotsDisponiveisParaDia({
      configuracao: configBase,
      dataIso: "2026-11-23",
      intervalosOcupados: [],
      agora: agoraFixo,
    });
    expect(slotsHoje.map((s) => s.horarioInicio)).toEqual(["12:00", "13:00", "15:00", "16:00"]);

    // Se já existe reserva 09:00-10:00 (60min) e a duração muda para 30min,
    // tanto 09:00 quanto 09:30 devem ficar bloqueados!
    const config30Min: ConfiguracaoAgendaOrganizacao = {
      ...configBase,
      duracaoSlotMinutos: 30,
    };
    const slotsDia25 = gerarSlotsDisponiveisParaDia({
      configuracao: config30Min,
      dataIso: "2026-11-25",
      intervalosOcupados: [
        {
          agendamentoId: "agd-existente",
          inicioMin: converterHorarioParaMinutos("09:00"),
          fimMin: converterHorarioParaMinutos("10:00"),
        },
      ],
      agora: agoraFixo,
    });

    expect(slotsDia25.map((s) => s.horarioInicio)).toEqual(["10:00", "10:30", "11:00", "11:30"]);
    expect(() =>
      validarSlotParaReserva({
        configuracao: config30Min,
        dataIso: "2026-11-25",
        horarioInicio: "09:30",
        intervalosOcupados: [
          {
            agendamentoId: "agd-existente",
            inicioMin: 540,
            fimMin: 600,
          },
        ],
        agora: agoraFixo,
      }),
    ).toThrow(/reservado/i);
  });

  it("encontra próximo dia disponível e poda datas antigas corretamente", () => {
    const proximo = encontrarProximoDiaDisponivel({
      configuracao: configBase,
      ocupacaoPorData: {
        "2026-11-23": [{ agendamentoId: "a", inicioMin: 0, fimMin: 1440 }],
      },
      agora: agoraFixo,
    });
    expect(proximo).toBe("2026-11-25");

    const podadas = podarDatasAbertasPassadas(
      {
        "2026-11-01": [{ inicio: "09:00", fim: "12:00" }],
        "2026-11-20": [{ inicio: "09:00", fim: "12:00" }],
        "2026-11-25": [{ inicio: "09:00", fim: "12:00" }],
      },
      "America/Sao_Paulo",
      7,
      agoraFixo,
    );
    expect(Object.keys(podadas)).toEqual(["2026-11-20", "2026-11-25"]);
  });

  it("gera arquivo .ics válido e templates de e-mail com escape HTML seguro", () => {
    const ics = gerarConteudoArquivoIcs({
      uid: "agd-1",
      titulo: "Consulta · Clínica Aurora",
      descricao: "Código: AGD-7K2M",
      dataIso: "2026-11-25",
      horarioInicio: "10:00",
      horarioFim: "11:00",
      fusoHorario: "America/Sao_Paulo",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;TZID=America/Sao_Paulo:20261125T100000");
    expect(ics).toContain("DTEND;TZID=America/Sao_Paulo:20261125T110000");

    const agendamento: AgendamentoAgenda = {
      id: "agd-1",
      organizacaoId: "org-1",
      identificadorPublicoOrganizacao: "clinica-aurora",
      microfluxoId: "exp-agenda",
      tituloExperiencia: "Agendar avaliação",
      dataIso: "2026-11-25",
      horarioInicio: "10:00",
      horarioFim: "11:00",
      duracaoMinutos: 60,
      fusoHorario: "America/Sao_Paulo",
      nomeVisitante: "Ana <script>alert(1)</script>",
      emailVisitante: "ana@exemplo.com",
      telefoneOuWhatsapp: "(11) 99999-8888",
      observacoesVisitante: "Primeira visita",
      situacao: "confirmado",
      codigoConfirmacao: "AGD-7K2M",
      chaveIdempotencia: "agd-1",
      criadoEmIso: "2026-11-23T13:00:00.000Z",
      atualizadoEmIso: "2026-11-23T13:00:00.000Z",
    };

    const emailVisitante = construirEmailConfirmacaoAgendamentoVisitante({
      agendamento,
      nomeOrganizacao: "Clínica Aurora",
    });
    expect(emailVisitante.para).toEqual(["ana@exemplo.com"]);
    expect(emailVisitante.html).not.toContain("<script>");
    expect(emailVisitante.html).toContain("&lt;script&gt;");
    expect(emailVisitante.html).toContain("AGD-7K2M");

    const emailEquipe = construirEmailNovoAgendamentoEquipe({
      agendamento,
      nomeOrganizacao: "Clínica Aurora",
      destinatarios: ["contato@aurora.com"],
    });
    expect(emailEquipe.para).toEqual(["contato@aurora.com"]);
    expect(emailEquipe.html).toContain("https://wa.me/5511999998888");
    expect(emailEquipe.html).toContain("/painel/agenda");
  });
});

