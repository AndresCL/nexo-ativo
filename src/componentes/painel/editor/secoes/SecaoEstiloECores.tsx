"use client";

import type { RascunhoConfiguracaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import type { EstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import { SeletorEspacamentoVitrine } from "./SeletorEspacamentoVitrine";
import { SeletorFaixaInicioVitrine } from "./SeletorFaixaInicioVitrine";
import { SeletorPaletaCromatica } from "./SeletorPaletaCromatica";

export interface PropriedadesSecaoEstiloECores {
  readonly rascunho: RascunhoConfiguracaoPagina;
  readonly alterarEstiloVisual: EstadoEditorAparencia["alterarEstiloVisual"];
  readonly somenteLeitura?: boolean;
}

export function SecaoEstiloECores({
  rascunho,
  alterarEstiloVisual,
  somenteLeitura = false,
}: PropriedadesSecaoEstiloECores) {
  return (
    <div
      id="painel-aba-estilo"
      role="tabpanel"
      aria-labelledby="aba-estilo"
      className="space-y-6"
    >
      <SeletorFaixaInicioVitrine
        valorAtual={rascunho.faixaInicioExperiencias}
        aoAlterar={(faixaInicioExperiencias) => alterarEstiloVisual({ faixaInicioExperiencias })}
        posicaoCabecalhoAtual={rascunho.identidade.posicaoCabecalho}
        somenteLeitura={somenteLeitura}
      />

      <SeletorEspacamentoVitrine
        valorAtual={rascunho.espacamentoAcoes}
        aoAlterar={(espacamentoAcoes) => alterarEstiloVisual({ espacamentoAcoes })}
        somenteLeitura={somenteLeitura}
      />

      <SeletorPaletaCromatica
        rascunho={rascunho}
        alterarEstiloVisual={alterarEstiloVisual}
        somenteLeitura={somenteLeitura}
      />
    </div>
  );
}

