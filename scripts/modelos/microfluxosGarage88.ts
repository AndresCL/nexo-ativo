import {
  converterEtapaParaLivre,
  criarEtapaDadosRetorno,
} from "../../src/dominio/microfluxos/composicaoEtapaLivre";
import type {
  CampoUniversalFormulario,
  DefinicaoMicrofluxo,
  EtapaMicrofluxo,
} from "../../src/dominio/microfluxos/tiposMicrofluxo";
import { listarCamposResumoConclusao } from "../../src/dominio/microfluxos/conclusaoMicrofluxo";

type Modelo = Pick<
  DefinicaoMicrofluxo,
  | "etapaInicialId"
  | "etapas"
  | "textoBotaoConclusao"
  | "mensagemConfirmacaoTitulo"
  | "mensagemConfirmacaoCorpo"
  | "regraCalculoComercial"
>;
const campo = (
  id: string,
  rotulo: string,
  tipo: CampoUniversalFormulario["tipo"] = "texto_curto",
  obrigatorio = true,
): CampoUniversalFormulario => ({ id, rotulo, tipo, obrigatorio });
const formulario = (
  id: string,
  titulo: string,
  campos: readonly CampoUniversalFormulario[],
  proximaEtapaPadraoId: string,
): EtapaMicrofluxo => ({
  id,
  titulo,
  campos,
  proximaEtapaPadraoId,
  tipoEtapa: "formulario_dinamico",
  obrigatoria: true,
});
const escolha = (
  id: string,
  titulo: string,
  opcoes: readonly [string, string, string][],
): EtapaMicrofluxo => ({
  id,
  titulo,
  tipoEtapa: "selecao_unica",
  obrigatoria: true,
  opcoes: opcoes.map(([id, rotulo, proximaEtapaIdOpcional]) => ({
    id,
    rotulo,
    proximaEtapaIdOpcional,
  })),
});
const contato = (): EtapaMicrofluxo => criarEtapaDadosRetorno("etapa-contato");
const veiculoUsado = [
  campo("modelo", "Marca, modelo e versão"),
  campo("ano", "Ano / modelo"),
  { ...campo("quilometragem", "Quilometragem", "numero"), valorMinimo: 0, sufixoVisual: "km" },
  campo("observacoes", "Conservação e observações", "texto_longo", false),
];
const parcelas = {
  ...campo("parcelas", "Quantidade de parcelas desejada", "numero", false),
  valorMinimo: 1,
  valorMaximo: 120,
};

const MODELOS: Readonly<Record<string, Modelo>> = {
  "fluxo-financiamento": {
    etapaInicialId: "etapa-escolha-veiculo",
    textoBotaoConclusao: "Solicitar simulação de financiamento",
    mensagemConfirmacaoTitulo: "Solicitação de simulação recebida",
    mensagemConfirmacaoCorpo:
      "Recebemos suas preferências. A equipe retornará com as condições disponíveis. Taxa, prazo e aprovação dependem da análise da instituição financeira.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapas: [
      escolha("etapa-escolha-veiculo", "Você já escolheu um veículo?", [
        ["estoque", "Quero escolher no estoque", "etapa-catalogo-financiamento"],
        [
          "preferencias",
          "Quero informar o veículo que procuro",
          "etapa-preferencias-financiamento",
        ],
      ]),
      {
        id: "etapa-catalogo-financiamento",
        tipoEtapa: "selecao_catalogo",
        titulo: "Escolha o veículo para simular",
        fonteCatalogo: "produtos",
        obrigatoria: true,
        proximaEtapaPadraoId: "etapa-tipo-entrada",
      },
      formulario(
        "etapa-preferencias-financiamento",
        "Qual veículo você procura?",
        [
          campo("preferencia", "Modelo, categoria ou características desejadas"),
          campo("orcamento", "Faixa de valor pretendida", "moeda", false),
        ],
        "etapa-tipo-entrada",
      ),
      escolha("etapa-tipo-entrada", "Como pretende compor a entrada?", [
        ["dinheiro", "Tenho um valor para dar de entrada", "etapa-valor-entrada"],
        ["troca", "Quero usar meu veículo na troca", "etapa-veiculo-troca"],
        ["sem-entrada", "Quero consultar possibilidades sem entrada", "etapa-prazo-financiamento"],
      ]),
      formulario(
        "etapa-valor-entrada",
        "Qual entrada você pretende oferecer?",
        [campo("entrada", "Valor da entrada", "moeda")],
        "etapa-prazo-financiamento",
      ),
      formulario(
        "etapa-veiculo-troca",
        "Conte sobre o veículo que pretende usar na troca",
        [...veiculoUsado, campo("complemento", "Valor adicional em dinheiro", "moeda", false)],
        "etapa-prazo-financiamento",
      ),
      formulario(
        "etapa-prazo-financiamento",
        "Suas preferências de pagamento",
        [parcelas, campo("parcela-desejada", "Parcela mensal desejada", "moeda", false)],
        "etapa-contato",
      ),
      contato(),
    ],
  },
  "fluxo-diagnostico": {
    etapaInicialId: "etapa-situacao-seguro",
    textoBotaoConclusao: "Solicitar cotação de seguro",
    mensagemConfirmacaoTitulo: "Solicitação de cotação recebida",
    mensagemConfirmacaoCorpo:
      "Recebemos os dados para cotação. A equipe retornará com as opções disponíveis, sujeitas às condições e à análise das seguradoras.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapas: [
      escolha("etapa-situacao-seguro", "Você quer contratar ou renovar um seguro?", [
        ["novo", "Contratar um novo seguro", "etapa-uso-veiculo"],
        ["renovar", "Renovar ou comparar meu seguro atual", "etapa-renovacao-seguro"],
      ]),
      formulario(
        "etapa-renovacao-seguro",
        "Conte sobre o seguro atual",
        [
          campo("seguradora", "Seguradora atual", "texto_curto", false),
          campo("vencimento", "Vencimento da apólice", "data", false),
          campo("bonus", "Classe de bônus, se souber", "texto_curto", false),
        ],
        "etapa-uso-veiculo",
      ),
      escolha("etapa-uso-veiculo", "Como o veículo é utilizado?", [
        ["particular", "Uso particular", "etapa-dados-veiculo-seguro"],
        ["comercial", "Aplicativo, entregas ou outro uso profissional", "etapa-uso-profissional"],
      ]),
      formulario(
        "etapa-uso-profissional",
        "Qual atividade você exerce com o veículo?",
        [
          campo("atividade", "Atividade ou tipo de serviço"),
          campo("frequencia", "Frequência de uso profissional", "texto_curto", false),
        ],
        "etapa-dados-veiculo-seguro",
      ),
      formulario(
        "etapa-dados-veiculo-seguro",
        "Detalhes do veículo para cotação",
        [
          campo("modelo", "Marca, modelo e versão"),
          campo("ano", "Ano de fabricação / modelo"),
          {
            ...campo("cobertura", "Coberturas que deseja consultar", "selecao_multipla", false),
            opcoesCustomizadas: [
              "Colisão",
              "Roubo e furto",
              "Danos a terceiros",
              "Assistência",
              "Quero orientação",
            ],
          },
        ],
        "etapa-contato",
      ),
      contato(),
    ],
  },
  "fluxo-atendimento": {
    etapaInicialId: "etapa-modalidade-negociacao",
    textoBotaoConclusao: "Solicitar avaliação do veículo",
    mensagemConfirmacaoTitulo: "Solicitação de avaliação recebida",
    mensagemConfirmacaoCorpo:
      "Recebemos as informações do seu veículo. A equipe retornará para dar continuidade à avaliação e à negociação.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapas: [
      escolha("etapa-modalidade-negociacao", "O que você deseja fazer com seu veículo?", [
        ["venda", "Quero vender meu veículo", "etapa-dados-veiculo-avaliacao"],
        ["troca", "Quero trocar por outro veículo", "etapa-interesse-troca"],
        [
          "troco",
          "Quero trocar e consultar a possibilidade de receber a diferença",
          "etapa-interesse-troca",
        ],
      ]),
      formulario(
        "etapa-interesse-troca",
        "Qual veículo você deseja na troca?",
        [
          campo("veiculo-desejado", "Veículo ou categoria que procura"),
          campo("faixa-valor", "Faixa de valor pretendida", "moeda", false),
        ],
        "etapa-dados-veiculo-avaliacao",
      ),
      formulario(
        "etapa-dados-veiculo-avaliacao",
        "Dados do veículo para avaliação",
        veiculoUsado,
        "etapa-contato",
      ),
      contato(),
    ],
  },
  "fluxo-catalogo": {
    etapaInicialId: "etapa-catalogo",
    textoBotaoConclusao: "Enviar solicitação sobre o veículo",
    mensagemConfirmacaoTitulo: "Interesse registrado na Garage 88",
    mensagemConfirmacaoCorpo:
      "Recebemos seu interesse. A equipe retornará para confirmar a disponibilidade e dar continuidade ao atendimento solicitado.",
    regraCalculoComercial: { modalidade: "sem_calculo" },
    etapas: [
      {
        id: "etapa-catalogo",
        tipoEtapa: "selecao_catalogo",
        titulo: "Escolha o veículo de seu interesse",
        fonteCatalogo: "produtos",
        obrigatoria: true,
        proximaEtapaPadraoId: "etapa-proximo-passo",
      },
      escolha("etapa-proximo-passo", "Como você quer continuar?", [
        ["proposta", "Quero consultar disponibilidade e proposta", "etapa-contato"],
        ["visita", "Quero combinar uma visita ou test-drive", "etapa-preferencia-visita"],
      ]),
      formulario(
        "etapa-preferencia-visita",
        "Quando você gostaria de visitar a loja?",
        [
          campo("dia", "Dia de preferência", "data", false),
          campo("periodo", "Horário ou período de preferência", "texto_curto", false),
        ],
        "etapa-contato",
      ),
      contato(),
    ],
  },
};

export function atualizarDefinicaoMicrofluxoGarage88(
  atual: DefinicaoMicrofluxo,
): DefinicaoMicrofluxo {
  const modelo = MODELOS[atual.id];
  if (!modelo || (atual.tipoAcao && atual.tipoAcao !== "microfluxo")) return atual;
  const atualizado: DefinicaoMicrofluxo = { ...atual, ...modelo };
  const campos = listarCamposResumoConclusao(atualizado).filter(
    (item) => item.etapaId !== "etapa-contato",
  );
  return {
    ...atualizado,
    etapas: atualizado.etapas.map(converterEtapaParaLivre),
    conclusao: {
      acoes: [
        { tipo: "whatsapp", rotulo: "Continuar no WhatsApp" },
        { tipo: "url_externa", rotulo: "Ver estoque completo", url: "https://garage88.com.br" },
      ],
      resumo: { ativo: true, campos, incluirDemonstrativo: false },
      camposWhatsapp: campos,
    },
  };
}
