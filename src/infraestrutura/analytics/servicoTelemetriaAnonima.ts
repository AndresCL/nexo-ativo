import { httpsCallable } from "firebase/functions";
import type { DadosRegistroEventoAnonimo } from "@/validacoes/esquemasTelemetriaAnonima";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";

export interface PortaTelemetriaAnonima {
  registrarEvento(dados: DadosRegistroEventoAnonimo): Promise<void>;
}

export class ServicoTelemetriaAnonimaFirebase implements PortaTelemetriaAnonima {
  public async registrarEvento(dados: DadosRegistroEventoAnonimo): Promise<void> {
    try {
      const { funcoesRemotas } = obterServicosClienteFirebase();
      const chamarRegistro = httpsCallable<DadosRegistroEventoAnonimo, { registrado: boolean }>(
        funcoesRemotas,
        "registrarEventoAnonimo",
      );
      await chamarRegistro(dados);
    } catch {
      // Falha silenciosa de telemetria para não impactar a experiência do visitante
    }
  }
}

export const servicoTelemetriaAnonimaPadrao: PortaTelemetriaAnonima =
  new ServicoTelemetriaAnonimaFirebase();
