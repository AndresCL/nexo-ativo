import type {
  DadosRegistroEventoAnonimo,
} from "@/validacoes/esquemasTelemetriaAnonima";

export interface ArmazenamentoSessaoTelemetria {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
}

const EVENTOS_VISUALIZACAO_SESSAO = new Set<DadosRegistroEventoAnonimo["tipoEvento"]>([
  "visualizacao_vitrine",
  "visualizacao_cartao",
]);

const EVENTOS_CLIQUE_ACAO_SESSAO = new Set<DadosRegistroEventoAnonimo["tipoEvento"]>([
  "clique_acao_home",
  "abertura_microfluxo",
  "clique_whatsapp",
  "clique_ligacao",
]);

export function ehEventoVisualizacaoSessao(
  tipoEvento: DadosRegistroEventoAnonimo["tipoEvento"],
): boolean {
  return EVENTOS_VISUALIZACAO_SESSAO.has(tipoEvento);
}

export function ehEventoCliqueAcaoSessao(
  tipoEvento: DadosRegistroEventoAnonimo["tipoEvento"],
): boolean {
  return EVENTOS_CLIQUE_ACAO_SESSAO.has(tipoEvento);
}

/**
 * Rastreador anônimo de sessão por aba e data UTC (sem cookies, sem PII).
 * Garante deduplicação de 1ª visualização e 1º clique de ação por sessão/dia,
 * com fallback automático em memória caso sessionStorage esteja indisponível.
 */
export class RastreadorSessaoTelemetria {
  private readonly fallbackMemoria = new Set<string>();
  private readonly obterArmazenamento: () => ArmazenamentoSessaoTelemetria | null;
  private readonly obterDataIso: () => string;

  public constructor(opcoes?: {
    obterArmazenamento?: () => ArmazenamentoSessaoTelemetria | null;
    obterDataIso?: () => string;
  }) {
    this.obterArmazenamento =
      opcoes?.obterArmazenamento ??
      (() => (typeof window !== "undefined" ? window.sessionStorage : null));
    this.obterDataIso =
      opcoes?.obterDataIso ?? (() => new Date().toISOString().split("T")[0]!);
  }

  private registrarSePrimeiraVez(chave: string): boolean {
    try {
      const armazenamento = this.obterArmazenamento();
      if (armazenamento) {
        if (armazenamento.getItem(chave) === "1") {
          return false;
        }
        armazenamento.setItem(chave, "1");
        return true;
      }
    } catch {
      // Fallback silencioso para ambientes restritos (ex.: in-app webviews / modo privado)
    }

    if (this.fallbackMemoria.has(chave)) {
      return false;
    }
    this.fallbackMemoria.add(chave);
    return true;
  }

  public enriquecerComSinaisSessao(
    dados: DadosRegistroEventoAnonimo,
  ): DadosRegistroEventoAnonimo {
    const dataIso = this.obterDataIso();
    let primeiraVisualizacaoSessao = dados.primeiraVisualizacaoSessao;
    let primeiroCliqueSessao = dados.primeiroCliqueSessao;

    if (
      primeiraVisualizacaoSessao === undefined &&
      ehEventoVisualizacaoSessao(dados.tipoEvento)
    ) {
      const chaveVis = `nexo_tel_vis:${dados.organizacaoId}:${dataIso}`;
      primeiraVisualizacaoSessao = this.registrarSePrimeiraVez(chaveVis);
    }

    if (
      primeiroCliqueSessao === undefined &&
      ehEventoCliqueAcaoSessao(dados.tipoEvento)
    ) {
      const chaveClique = `nexo_tel_clk:${dados.organizacaoId}:${dataIso}`;
      primeiroCliqueSessao = this.registrarSePrimeiraVez(chaveClique);
    }

    return {
      ...dados,
      ...(primeiraVisualizacaoSessao ? { primeiraVisualizacaoSessao: true } : {}),
      ...(primeiroCliqueSessao ? { primeiroCliqueSessao: true } : {}),
    };
  }
}

export const rastreadorSessaoTelemetriaPadrao = new RastreadorSessaoTelemetria();

