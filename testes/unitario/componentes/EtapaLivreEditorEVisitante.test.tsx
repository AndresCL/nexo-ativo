import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { EditorComposicaoEtapa } from "@/componentes/painel/microfluxos/EditorComposicaoEtapa";
import { ExecutorMicrofluxoVisitante } from "@/componentes/editorial/ExecutorMicrofluxoVisitante";
import type { BlocoEtapaLivre, EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  converterEtapaParaLivre,
  criarEtapaDadosRetorno,
} from "@/dominio/microfluxos/composicaoEtapaLivre";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";
const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!;
const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;
function Composicao({ inicial = [] }: { readonly inicial?: readonly BlocoEtapaLivre[] }) {
  const [blocos, setBlocos] = useState(inicial);
  return <EditorComposicaoEtapa blocos={blocos} etapas={[]} podeEditar aoAlterar={setBlocos} />;
}
describe("Etapa livre editável", () => {
  it("registra o retorno com apenas nome e WhatsApp antes da conclusão", async () => {
    const etapa = criarEtapaDadosRetorno("retorno");
    const fluxo = {
      ...criarMicrofluxoPadraoParaTestes({
        organizacaoId: pagina.organizacaoId,
        nomeOrganizacao: "Lumina",
        modelo: "catalogo",
      }),
      etapaInicialId: etapa.id,
      etapas: [etapa],
      textoBotaoConclusao: "Enviar solicitação",
      regraCalculoComercial: { modalidade: "sem_calculo" as const },
      conclusao: {
        acoes: [],
        camposWhatsapp: [],
        resumo: { ativo: false, campos: [], incluirDemonstrativo: false },
      },
    };
    const enviarSolicitacaoVisitante = vi
      .fn()
      .mockResolvedValue({ solicitacaoId: "retorno-registrado", duplicadaIdempotente: false });
    render(
      <ExecutorMicrofluxoVisitante
        aberto
        microfluxo={fluxo}
        pagina={pagina}
        acervo={acervo}
        aoAlterarAbertura={vi.fn()}
        servicoSubmissao={{ enviarSolicitacaoVisitante }}
      />,
    );
    expect(screen.queryByLabelText(/E-mail|Mensagem adicional/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Enviar solicitação" }));
    expect(enviarSolicitacaoVisitante).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Seu nome/), { target: { value: "Ana Souza" } });
    fireEvent.change(screen.getByLabelText(/Seu WhatsApp/), { target: { value: "11999999999" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar solicitação" }));
    expect(await screen.findByTestId("confirmacao-microfluxo-concluido")).toHaveTextContent(
      "retorno-registrado",
    );
    expect(enviarSolicitacaoVisitante).toHaveBeenCalledTimes(1);
    expect(enviarSolicitacaoVisitante).toHaveBeenCalledWith(
      expect.objectContaining({
        nomeVisitante: "Ana Souza",
        telefoneOuWhatsapp: "11999999999",
      }),
    );
  });
  it("combina e ordena texto, imagem, campo, escolha, catálogo e equipe", () => {
    render(<Composicao />);
    for (const tipo of ["texto", "imagem", "campo", "escolha", "catálogo", "equipe"])
      fireEvent.click(screen.getByRole("button", { name: `Adicionar ${tipo}` }));
    expect(screen.getByLabelText("Texto")).toBeInTheDocument();
    expect(screen.getByLabelText("URL da imagem")).toBeInTheDocument();
    expect(screen.getByLabelText("Rótulo do campo")).toBeInTheDocument();
    expect(screen.getByLabelText("Pergunta")).toBeInTheDocument();
    expect(screen.getByLabelText("Fonte do catálogo")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Rótulo da seleção")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Mover elemento 3 para cima" }));
    const caixas = screen.getAllByRole("button", { name: /Remover elemento/ });
    expect(caixas[1]!.parentElement!.parentElement).toContainElement(
      screen.getByLabelText("Rótulo do campo"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover elemento 1" }));
    expect(screen.queryByLabelText("Texto")).not.toBeInTheDocument();
  });
  it("abre contato antigo como campos editáveis, permite mudar finalidade, rótulo, ordem e remover", () => {
    const antiga: EtapaMicrofluxo = {
      id: "contato",
      tipoEtapa: "coleta_contato",
      titulo: "Contato",
      obrigatoria: true,
    };
    render(<Composicao inicial={converterEtapaParaLivre(antiga).blocos} />);
    const nomes = screen.getAllByLabelText("Rótulo do campo");
    fireEvent.change(nomes[0]!, { target: { value: "Como você prefere ser chamado?" } });
    expect(nomes[0]).toHaveValue("Como você prefere ser chamado?");
    expect(screen.getAllByLabelText("Finalidade do campo")[1]).toHaveValue("telefoneOuWhatsapp");
    fireEvent.click(screen.getByRole("button", { name: "Remover elemento 3" }));
    expect(screen.getAllByLabelText("Rótulo do campo")).toHaveLength(3);
  });
  it("mantém catálogo, equipe e contato na mesma tela e só registra após finalizar", async () => {
    const contato = converterEtapaParaLivre({
      id: "dados",
      tipoEtapa: "coleta_contato",
      titulo: "Dados",
      obrigatoria: true,
    });
    const etapa: EtapaMicrofluxo = {
      id: "livre",
      tipoEtapa: "etapa_livre",
      titulo: "Escolha e solicite",
      obrigatoria: true,
      blocos: [
        {
          id: "explicacao",
          tipo: "texto",
          texto: "Escolha uma peça e deixe seu telefone nesta mesma tela.",
        },
        {
          id: "foto",
          tipo: "imagem",
          url: "https://example.com/showroom.jpg",
          textoAlternativo: "Nosso showroom",
        },
        {
          id: "catalogo",
          tipo: "catalogo",
          fonte: "produtos",
          rotulo: "Sua peça",
          obrigatorio: true,
        },
        ...contato.blocos!,
        { id: "equipe", tipo: "equipe", rotulo: "Seu consultor", obrigatorio: false },
      ],
    };
    const fluxo = {
      ...criarMicrofluxoPadraoParaTestes({
        organizacaoId: pagina.organizacaoId,
        nomeOrganizacao: "Lumina",
        modelo: "catalogo",
      }),
      etapaInicialId: etapa.id,
      etapas: [etapa],
      textoBotaoConclusao: "Finalizar pedido",
      regraCalculoComercial: { modalidade: "sem_calculo" as const },
      conclusao: {
        acoes: [],
        camposWhatsapp: [],
        resumo: { ativo: false, campos: [], incluirDemonstrativo: false },
      },
    };
    const enviarSolicitacaoVisitante = vi
      .fn()
      .mockResolvedValue({ solicitacaoId: "pedido-livre", duplicadaIdempotente: false });
    render(
      <ExecutorMicrofluxoVisitante
        aberto
        microfluxo={fluxo}
        pagina={pagina}
        acervo={acervo}
        contextoOrigem={{ profissionalPreSelecionadoId: acervo.profissionais[0]!.id }}
        aoAlterarAbertura={vi.fn()}
        servicoSubmissao={{ enviarSolicitacaoVisitante }}
      />,
    );
    expect(screen.getByText(/nesta mesma tela/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Nosso showroom" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(acervo.produtos[0]!.nome) }));
    expect(screen.getByLabelText(/Seu nome/)).toBeInTheDocument();
    expect(enviarSolicitacaoVisitante).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Seu nome/), { target: { value: "Ana Souza" } });
    fireEvent.change(screen.getByLabelText(/WhatsApp ou telefone/), {
      target: { value: "11999999999" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Finalizar pedido" }));
    const final = await screen.findByTestId("confirmacao-microfluxo-concluido");
    expect(final).toHaveTextContent("pedido-livre");
    expect(within(final).queryAllByRole("link")).toHaveLength(1);
    await waitFor(() =>
      expect(enviarSolicitacaoVisitante).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeVisitante: "Ana Souza",
          telefoneOuWhatsapp: "11999999999",
          produtoId: acervo.produtos[0]!.id,
          profissionalId: acervo.profissionais[0]!.id,
        }),
      ),
    );
  });
});
