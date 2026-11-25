import type { ProdutoCatalogo, ProfissionalEquipe } from "./catalogoConteudo";
import type { DefinicaoMicrofluxo } from "../microfluxos/tiposMicrofluxo";
import { obterPoliticaPublicidade } from "../publicidade/registroPoliticasPublicidade";
import {
  CODIGO_PERFIL_PUBLICIDADE_PADRAO,
  type CodigoPerfilPublicidade,
} from "../publicidade/tiposPerfilPublicidade";

export interface ParametrosConteudoInicialOrganizacao {
  readonly organizacaoId: string;
  readonly nomeOrganizacao: string;
  readonly nomeProprietarioOpcional?: string;
  readonly perfilPublicidade?: CodigoPerfilPublicidade;
  readonly limiteProfissionaisAtivos: number;
  readonly agoraIso: string;
}

export interface ConteudoInicialOrganizacao {
  readonly microfluxos: readonly DefinicaoMicrofluxo[];
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly produtos: readonly ProdutoCatalogo[];
}

export const IDS_CONTEUDO_INICIAL_ORGANIZACAO = {
  fluxoAtendimento: "fluxo-inicial-atendimento",
  acaoEquipe: "acao-inicial-equipe",
  acaoProdutos: "acao-inicial-produtos",
  profissionalPrincipal: "profissional-inicial-1",
  profissionalSecundario: "profissional-inicial-2",
  produtoExemplo1: "produto-inicial-1",
  produtoExemplo2: "produto-inicial-2",
} as const;

function criarFluxoAtendimentoInicial(
  organizacaoId: string,
  nomeOrganizacao: string,
  agoraIso: string,
): DefinicaoMicrofluxo {
  const nomeLimpo = nomeOrganizacao.trim() || "nossa equipe";

  return {
    id: IDS_CONTEUDO_INICIAL_ORGANIZACAO.fluxoAtendimento,
    organizacaoId,
    tipoAcao: "microfluxo",
    ancoraAcionamento: "atendimento-inicial",
    titulo: "Solicitar atendimento",
    descricaoCurta: `Conte o que você precisa para a equipe da ${nomeLimpo} retornar com agilidade.`,
    textoBotaoConclusao: "Enviar solicitação",
    mensagemConfirmacaoTitulo: "Solicitação recebida",
    mensagemConfirmacaoCorpo: `Obrigado! A equipe da ${nomeLimpo} recebeu suas informações e retornará em breve.`,
    etapaInicialId: "etapa-motivo",
    etapas: [
      {
        id: "etapa-motivo",
        tipoEtapa: "etapa_livre",
        titulo: "Como podemos ajudar?",
        obrigatoria: true,
        blocos: [
          {
            id: "bloco-escolha-motivo",
            tipo: "escolha",
            rotulo: "Selecione o assunto principal",
            multipla: false,
            obrigatorio: true,
            opcoes: [
              {
                id: "opcao-informacoes",
                rotulo: "Quero mais informações",
                descricaoCurta: "Tirar dúvidas sobre atendimento, prazos ou disponibilidade.",
                proximaEtapaIdOpcional: "etapa-contato",
              },
              {
                id: "opcao-orcamento",
                rotulo: "Solicitar proposta ou agendamento",
                descricaoCurta: "Falar com um responsável para avançar.",
                proximaEtapaIdOpcional: "etapa-contato",
              },
            ],
          },
        ],
        proximaEtapaPadraoId: "etapa-contato",
        posicaoCanvas: { x: 120, y: 120 },
      },
      {
        id: "etapa-contato",
        tipoEtapa: "etapa_livre",
        titulo: "Seus dados para retorno",
        obrigatoria: true,
        blocos: [
          {
            id: "bloco-campo-nome",
            tipo: "campo",
            finalidade: "nomeCompleto",
            campo: {
              id: "campo-nome",
              rotulo: "Seu nome",
              tipo: "texto_curto",
              obrigatorio: true,
              placeholder: "Como podemos chamar você?",
            },
          },
          {
            id: "bloco-campo-whatsapp",
            tipo: "campo",
            finalidade: "telefoneOuWhatsapp",
            campo: {
              id: "campo-whatsapp",
              rotulo: "WhatsApp ou telefone",
              tipo: "telefone",
              obrigatorio: true,
              placeholder: "(11) 99999-9999",
            },
          },
          {
            id: "bloco-campo-mensagem",
            tipo: "campo",
            finalidade: "mensagemAdicional",
            campo: {
              id: "campo-mensagem",
              rotulo: "Detalhes adicionais (opcional)",
              tipo: "texto_longo",
              obrigatorio: false,
              placeholder: "Compartilhe qualquer detalhe importante...",
            },
          },
        ],
        posicaoCanvas: { x: 480, y: 120 },
      },
    ],
    ativo: true,
    ativoNaHome: true,
    rotuloBotaoHome: "Solicitar atendimento",
    subtituloBotaoHome: "Responda em menos de 1 minuto",
    destaquePrimarioHome: true,
    ordemHome: 0,
    atualizadoEmIso: agoraIso,
  };
}

function criarAcaoEquipeInicial(organizacaoId: string, agoraIso: string): DefinicaoMicrofluxo {
  return {
    id: IDS_CONTEUDO_INICIAL_ORGANIZACAO.acaoEquipe,
    organizacaoId,
    tipoAcao: "secao_equipe",
    titulo: "Nossa equipe",
    descricaoCurta: "Conheça quem conduz o atendimento.",
    textoBotaoConclusao: "",
    mensagemConfirmacaoTitulo: "",
    mensagemConfirmacaoCorpo: "",
    etapaInicialId: "",
    etapas: [],
    ativo: true,
    ativoNaHome: true,
    rotuloBotaoHome: "Nossa equipe",
    subtituloBotaoHome: "Perfis e contatos diretos",
    ordemHome: 1,
    atualizadoEmIso: agoraIso,
  };
}

function criarAcaoProdutosInicial(organizacaoId: string, agoraIso: string): DefinicaoMicrofluxo {
  return {
    id: IDS_CONTEUDO_INICIAL_ORGANIZACAO.acaoProdutos,
    organizacaoId,
    tipoAcao: "secao_produtos",
    titulo: "Catálogo de produtos",
    descricaoCurta: "Itens selecionados disponíveis para consulta.",
    textoBotaoConclusao: "",
    mensagemConfirmacaoTitulo: "",
    mensagemConfirmacaoCorpo: "",
    etapaInicialId: "",
    etapas: [],
    ativo: true,
    ativoNaHome: true,
    rotuloBotaoHome: "Catálogo de produtos",
    subtituloBotaoHome: "Veja os destaques (edite ou remova)",
    ordemHome: 2,
    atualizadoEmIso: agoraIso,
  };
}

function criarProfissionaisIniciais(
  organizacaoId: string,
  nomeOrganizacao: string,
  nomeProprietarioOpcional: string | undefined,
  limiteProfissionaisAtivos: number,
  agoraIso: string,
): readonly ProfissionalEquipe[] {
  if (limiteProfissionaisAtivos <= 0) {
    return [];
  }

  const nomePrincipal = nomeProprietarioOpcional?.trim() || "Responsável — Edite aqui";
  const nomeOrg = nomeOrganizacao.trim() || "sua empresa";

  const lista: ProfissionalEquipe[] = [
    {
      id: IDS_CONTEUDO_INICIAL_ORGANIZACAO.profissionalPrincipal,
      organizacaoId,
      identificadorCartao: "responsavel-principal",
      nomeCompleto: nomePrincipal,
      cargoOuEspecialidade: "Responsável pelo atendimento",
      minibiografia: `Perfil inicial de exemplo na ${nomeOrg}. Edite cargo, foto e canais de contato no painel.`,
      pontoFocalFoto: { xPercentual: 50, yPercentual: 50 },
      aceitaSolicitacoesDiretas: true,
      ordemExibicao: 0,
      ativo: true,
      atualizadoEmIso: agoraIso,
    },
  ];

  if (limiteProfissionaisAtivos > 1) {
    lista.push({
      id: IDS_CONTEUDO_INICIAL_ORGANIZACAO.profissionalSecundario,
      organizacaoId,
      identificadorCartao: "atendimento-equipe",
      nomeCompleto: "Especialista — Edite aqui",
      cargoOuEspecialidade: "Atendimento e relacionamento",
      minibiografia: `Segundo perfil de exemplo na ${nomeOrg}. Personalize ou remova quando quiser.`,
      pontoFocalFoto: { xPercentual: 50, yPercentual: 50 },
      aceitaSolicitacoesDiretas: true,
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: agoraIso,
    });
  }

  return lista;
}

function criarProdutosIniciais(
  organizacaoId: string,
  agoraIso: string,
): readonly ProdutoCatalogo[] {
  return [
    {
      id: IDS_CONTEUDO_INICIAL_ORGANIZACAO.produtoExemplo1,
      organizacaoId,
      nome: "Produto exemplo 1 — Edite aqui",
      resumo:
        "Descrição de exemplo para você visualizar o catálogo pronto. Substitua pelo seu item real ou remova no painel.",
      categoria: "Destaques",
      precoCentavos: 19900,
      disponibilidade: "disponivel",
      especificacoesCurtas: ["Item de demonstração", "Personalizável no painel"],
      ordemExibicao: 0,
      ativo: true,
      atualizadoEmIso: agoraIso,
    },
    {
      id: IDS_CONTEUDO_INICIAL_ORGANIZACAO.produtoExemplo2,
      organizacaoId,
      nome: "Produto exemplo 2 — Edite aqui",
      resumo:
        "Segundo item de demonstração com valor e especificações editáveis para acelerar a montagem da sua vitrine.",
      categoria: "Destaques",
      precoCentavos: 34900,
      disponibilidade: "sob_encomenda",
      especificacoesCurtas: ["Sob encomenda", "Edite ou exclua quando quiser"],
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: agoraIso,
    },
  ];
}

/**
 * Gera o acervo inicial (microfluxos/ações, equipe e produtos de exemplo) para que
 * uma nova organização já comece editando em vez de encarar telas vazias.
 * Respeita o limite de profissionais do plano e a política de publicidade (OAB/CFM/CFO).
 */
export function criarConteudoInicialOrganizacao(
  parametros: ParametrosConteudoInicialOrganizacao,
): ConteudoInicialOrganizacao {
  const {
    organizacaoId,
    nomeOrganizacao,
    nomeProprietarioOpcional,
    perfilPublicidade = CODIGO_PERFIL_PUBLICIDADE_PADRAO,
    limiteProfissionaisAtivos,
    agoraIso,
  } = parametros;

  const politica = obterPoliticaPublicidade(perfilPublicidade);
  const permiteProdutos = politica.permiteEtapasComProdutos();

  const microfluxos: DefinicaoMicrofluxo[] = [
    criarFluxoAtendimentoInicial(organizacaoId, nomeOrganizacao, agoraIso),
    criarAcaoEquipeInicial(organizacaoId, agoraIso),
  ];

  if (permiteProdutos) {
    microfluxos.push(criarAcaoProdutosInicial(organizacaoId, agoraIso));
  }

  const profissionais = criarProfissionaisIniciais(
    organizacaoId,
    nomeOrganizacao,
    nomeProprietarioOpcional,
    limiteProfissionaisAtivos,
    agoraIso,
  );

  const produtos = permiteProdutos ? criarProdutosIniciais(organizacaoId, agoraIso) : [];

  return {
    microfluxos,
    profissionais,
    produtos,
  };
}

