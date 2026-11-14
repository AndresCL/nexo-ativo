import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CanvasEditorVisualFluxos } from "@/componentes/painel/microfluxos/CanvasEditorVisualFluxos";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import "@/estilos/globais.css";
const inicial: DefinicaoMicrofluxo = {
  id: "teste-canvas",
  organizacaoId: "teste-isolado",
  titulo: "Teste isolado de conexão",
  descricaoCurta: "",
  textoBotaoConclusao: "Concluir",
  mensagemConfirmacaoTitulo: "Fim",
  mensagemConfirmacaoCorpo: "",
  etapaInicialId: "pergunta",
  ativo: true,
  atualizadoEmIso: "2026-11-13T00:00:00.000Z",
  conclusao: {
    acoes: [],
    resumo: { ativo: false, campos: [], incluirDemonstrativo: false },
    camposWhatsapp: [],
  },
  etapas: [
    {
      id: "pergunta",
      tipoEtapa: "etapa_livre",
      titulo: "Como deseja comprar?",
      obrigatoria: true,
      saidaPadraoDesconectada: true,
      blocos: [
        {
          id: "escolha",
          tipo: "escolha",
          rotulo: "Como deseja comprar?",
          multipla: false,
          obrigatorio: true,
          opcoes: [
            { id: "vista", rotulo: "À vista", desconectada: true },
            { id: "financiado", rotulo: "Financiado", desconectada: true },
          ],
        },
      ],
    },
    {
      id: "destino",
      tipoEtapa: "etapa_livre",
      titulo: "Pergunta de destino",
      obrigatoria: false,
      saidaPadraoDesconectada: true,
      blocos: [],
    },
    {
      id: "outra",
      tipoEtapa: "etapa_livre",
      titulo: "Outra pergunta",
      obrigatoria: false,
      saidaPadraoDesconectada: true,
      blocos: [],
    },
  ],
};
function TesteEditor() {
  const [fluxo, setFluxo] = useState(inicial);
  return (
    <main className="mx-auto max-w-[1500px] p-4">
      <h1 className="mb-2 text-lg">Teste isolado de arrasto</h1>
      <CanvasEditorVisualFluxos
        fluxo={fluxo}
        fluxos={[fluxo]}
        profissionais={[]}
        identificadorPublico="teste"
        permiteFinanceiro
        podeEditar
        aoSalvarFluxo={setFluxo}
      />
      <output id="estado-fluxo" className="hidden">
        {JSON.stringify(fluxo)}
      </output>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<TesteEditor />);
