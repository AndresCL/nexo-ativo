import { httpsCallable } from "firebase/functions";
import type { DadosRegistroEventoAnonimo } from "@/validacoes/esquemasTelemetriaAnonima";
import { obterFuncoesClienteFirebase } from "@/infraestrutura/firebase/clienteFuncoesFirebase";
import {
  rastreadorSessaoTelemetriaPadrao,
  type RastreadorSessaoTelemetria,
} from "./rastreadorSessaoTelemetria";

export interface PortaTelemetriaAnonima {
  registrarEvento(dados: DadosRegistroEventoAnonimo): Promise<void>;
}

export class ServicoTelemetriaAnonimaFirebase implements PortaTelemetriaAnonima {
  private readonly rastreadorSessao: RastreadorSessaoTelemetria;

  public constructor(rastreadorSessao: RastreadorSessaoTelemetria = rastreadorSessaoTelemetriaPadrao) {
    this.rastreadorSessao = rastreadorSessao;
  }

  public async registrarEvento(dados: DadosRegistroEventoAnonimo): Promise<void> {
    try {
      const dadosComSessao = this.rastreadorSessao.enriquecerComSinaisSessao(dados);
      const funcoesRemotas = obterFuncoesClienteFirebase();
      const chamarRegistro = httpsCallable<DadosRegistroEventoAnonimo, { registrado: boolean }>(
        funcoesRemotas,
        "registrarEventoAnonimo",
      );
      await chamarRegistro(dadosComSessao);
    } catch {
      // Falha silenciosa de telemetria para não impactar a experiência do visitante
    }
  }
}

export const servicoTelemetriaAnonimaPadrao: PortaTelemetriaAnonima =
  new ServicoTelemetriaAnonimaFirebase();
