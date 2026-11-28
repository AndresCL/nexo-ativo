"use client";

import type { LarguraCardVitrine } from "@/dominio/editorial/agrupamentoGridVitrine";
import {
  resolverAnimacaoDestaque,
  type AnimacaoDestaque,
} from "@/dominio/microfluxos/animacaoDestaque";
import {
  resolverValorExibicaoDestaque,
  type ValorExibicaoDestaqueExperiencia,
} from "@/dominio/microfluxos/nivelDestaqueVitrine";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { SeletorAnimacaoDestaqueExperiencia } from "./SeletorAnimacaoDestaqueExperiencia";
import { SeletorExibicaoDestaqueExperiencia } from "./SeletorExibicaoDestaqueExperiencia";
import { SeletorLarguraCardVitrine } from "./SeletorLarguraCardVitrine";

export interface PropriedadesControlesRapidosExperienciaLista {
  readonly fluxo: DefinicaoMicrofluxo;
  readonly podeAlterar: boolean;
  readonly aoAlterarExibicaoDestaque: (valor: ValorExibicaoDestaqueExperiencia) => void;
  readonly aoAlterarLargura: (largura: LarguraCardVitrine) => void;
  readonly aoAlterarAnimacao: (animacao: AnimacaoDestaque) => void;
}

/**
 * Faixa de controles rápidos exibida diretamente em cada card de experiência na lista.
 * - Mobile: grade 2 colunas (`grid-cols-2`) com alvos de toque confortáveis.
 * - Web (`sm:`+): linha horizontal compacta e alinhada.
 */
export function ControlesRapidosExperienciaLista({
  fluxo,
  podeAlterar,
  aoAlterarExibicaoDestaque,
  aoAlterarLargura,
  aoAlterarAnimacao,
}: PropriedadesControlesRapidosExperienciaLista) {
  const valorExibicao = resolverValorExibicaoDestaque(
    fluxo.ativo,
    fluxo.nivelDestaqueHome,
    fluxo.destaquePrimarioHome,
  );
  const ehPrimario = valorExibicao === "primario";
  const ehDestaque = valorExibicao === "primario" || valorExibicao === "secundario";
  const animacaoAtual = resolverAnimacaoDestaque(
    fluxo.animacaoDestaque,
    fluxo.animarBordaDestaque,
  );

  return (
    <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-marfim-100 pt-2.5 sm:flex sm:flex-wrap sm:items-end sm:gap-2.5">
      <div className="min-w-0 sm:w-44">
        <SeletorExibicaoDestaqueExperiencia
          valor={valorExibicao}
          disabled={!podeAlterar}
          aoAlterar={aoAlterarExibicaoDestaque}
        />
      </div>

      <div className="min-w-0 sm:w-36">
        <SeletorLarguraCardVitrine
          compacto
          ehDestaque={ehDestaque}
          tipoAcao={fluxo.tipoAcao}
          modoExibicaoColecao={fluxo.modoExibicaoColecao}
          valor={fluxo.larguraCardHome}
          disabled={!podeAlterar}
          aoAlterar={aoAlterarLargura}
        />
      </div>

      {ehPrimario ? (
        <div className="col-span-2 min-w-0 sm:col-span-1 sm:w-36">
          <SeletorAnimacaoDestaqueExperiencia
            valor={animacaoAtual}
            disabled={!podeAlterar}
            aoAlterar={aoAlterarAnimacao}
          />
        </div>
      ) : null}
    </div>
  );
}

