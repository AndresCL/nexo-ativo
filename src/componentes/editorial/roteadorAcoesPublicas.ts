import type {
  ContextoOrigemMicrofluxo,
  DefinicaoMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import type { SecaoAcervoAberta } from "./GavetaEditorialPublica";
import { obterIdentificadorPublicoExperiencia } from "@/dominio/microfluxos/conclusaoMicrofluxo";

export function identificarSecaoPorHash(hashBruto: string): SecaoAcervoAberta {
  const limpo = hashBruto.trim().toLowerCase().split("?")[0] ?? "";
  if (limpo === "#servicos") {
    return "servicos";
  }
  if (limpo === "#portfolio") {
    return "portfolio";
  }
  if (limpo === "#equipe") {
    return "equipe";
  }
  return null;
}

export function resolverMicrofluxoPorDestino(
  destinoBruto: string,
  microfluxos: readonly DefinicaoMicrofluxo[],
): {
  readonly microfluxo: DefinicaoMicrofluxo;
  readonly contextoOrigem?: ContextoOrigemMicrofluxo;
} | null {
  const limpo = destinoBruto.trim().split("?")[0] ?? "";
  if (!limpo.startsWith("#")) {
    return null;
  }

  if (limpo.startsWith("#experiencia=")) {
    const identificador = limpo.slice("#experiencia=".length);
    const microfluxo = microfluxos.find(
      (m) =>
        m.ativo &&
        (!m.tipoAcao || m.tipoAcao === "microfluxo") &&
        obterIdentificadorPublicoExperiencia(m.id) === identificador,
    );
    return microfluxo ? { microfluxo } : null;
  }

  const [ancoraBase, sufixoContexto] = limpo.split(":");
  const ancoraNormalizada = (ancoraBase ?? limpo).toLowerCase();

  const ativos = microfluxos.filter((m) => m.ativo);
  const idAlvo = ancoraNormalizada.replace(/^#/, "");
  const encontrado =
    ativos.find((m) => m.id.toLowerCase() === idAlvo) ??
    ativos.find((m) => m.ancoraAcionamento?.toLowerCase() === ancoraNormalizada);

  if (!encontrado) {
    return null;
  }

  const contextoOrigem: ContextoOrigemMicrofluxo | undefined = sufixoContexto
    ? { profissionalPreSelecionadoId: sufixoContexto }
    : undefined;

  return {
    microfluxo: encontrado,
    ...(contextoOrigem ? { contextoOrigem } : {}),
  };
}
