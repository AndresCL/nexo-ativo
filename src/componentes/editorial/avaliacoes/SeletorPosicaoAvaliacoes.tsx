import type { PosicaoAvaliacoesVitrine } from "@/dominio/entidades/avaliacoesGoogle";

interface PropriedadesSeletorPosicaoAvaliacoes {
  readonly posicao: PosicaoAvaliacoesVitrine;
  readonly desativado?: boolean;
  readonly aoAlterar: (posicao: PosicaoAvaliacoesVitrine) => void;
}

const OPCOES: readonly { readonly valor: PosicaoAvaliacoesVitrine; readonly rotulo: string }[] = [
  { valor: "topo", rotulo: "Acima dos botões" },
  { valor: "rodape", rotulo: "Abaixo dos botões" },
];

export function SeletorPosicaoAvaliacoes({
  posicao,
  desativado = false,
  aoAlterar,
}: PropriedadesSeletorPosicaoAvaliacoes) {
  return (
    <fieldset disabled={desativado} className="space-y-2">
      <legend className="mb-2 text-sm font-medium">Posição na vitrine</legend>
      {OPCOES.map(({ valor, rotulo }) => (
        <label key={valor} className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="radio"
            name="posicao-avaliacoes-vitrine"
            value={valor}
            checked={posicao === valor}
            onChange={() => aoAlterar(valor)}
            className="h-4 w-4 accent-mineral-950"
          />
          {rotulo}
        </label>
      ))}
    </fieldset>
  );
}

