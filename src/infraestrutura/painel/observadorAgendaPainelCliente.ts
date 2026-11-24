import type { PortaObservacaoDeltaColecao } from "@/aplicacao/portas/portasReatividade";
import type { AgendamentoAgenda } from "@/dominio/agenda/tiposAgenda";
import { ObservadorDeltaColecaoFirestore } from "@/infraestrutura/firebase/observadorDeltaColecaoFirestore";

function converterDocumentoAgendamento(dadosBrutos: unknown): AgendamentoAgenda | null {
  if (!dadosBrutos || typeof dadosBrutos !== "object") {
    return null;
  }

  const dados = dadosBrutos as Partial<AgendamentoAgenda>;
  if (
    typeof dados.id === "string" &&
    typeof dados.dataIso === "string" &&
    typeof dados.horarioInicio === "string" &&
    typeof dados.nomeVisitante === "string" &&
    typeof dados.emailVisitante === "string" &&
    typeof dados.situacao === "string" &&
    typeof dados.atualizadoEmIso === "string"
  ) {
    return dados as AgendamentoAgenda;
  }

  return null;
}

export const observadorAgendaPainelCliente: PortaObservacaoDeltaColecao<AgendamentoAgenda> =
  new ObservadorDeltaColecaoFirestore<AgendamentoAgenda>({
    nomeSubcolecao: "agendamentos",
    converterDocumento: converterDocumentoAgendamento,
  });

