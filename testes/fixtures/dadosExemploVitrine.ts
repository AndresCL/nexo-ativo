import {
  criarAcervoPublicoVazio,
  type AcervoPublicoVitrine,
} from "@/dominio/entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import { criarColecaoMicrofluxosPadraoParaTestes } from "./geradoresMicrofluxoTeste";
import { CHAMADAS_EDITORIAIS_GARAGE88 } from "./chamadasEditoriaisGarage88";
import {
  ACERVO_MAPLE_BEAR_CABO_FRIO,
  VITRINE_MAPLE_BEAR_CABO_FRIO,
} from "./dadosMapleBearCaboFrio";
import {
  ACERVO_SUPPERA_SEGUROS,
  VITRINE_SUPPERA_SEGUROS,
} from "./dadosSupperaSeguros";
import {
  ACERVO_NEXOATIVO,
  VITRINE_NEXOATIVO,
} from "./dadosNexoAtivo";
import {
  ACERVO_POUSADA_VELAS_DO_FORTE,
  VITRINE_POUSADA_VELAS_DO_FORTE,
} from "./dadosPousadaVelasDoForte";
import {
  ACERVO_CARDIM_CASTRO,
  VITRINE_CARDIM_CASTRO,
} from "./dadosCardimECastroAdvocacia";

/**
 * Exemplares editoriais completos para demonstração e conferência local em desenvolvimento
 * representando dois segmentos premium: Concessionária de Veículos Especiais e Escritório
 * de Advocacia de Empresas (Corporativa e Societária).
 * Em produção, rotas de clientes reais consultam estritamente o Firestore.
 */
export const CATALOGO_DEMONSTRACOES_EDITORIAIS: Readonly<Record<string, ConteudoPaginaPublicada>> =
  {
    "garage-88": {
      organizacaoId: "org-garage88",
      identificadorPublico: "garage-88",
      publicado: true,
      paginaAtiva: true,
      versaoPublicada: 1,
      atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      composicaoVisual: "imersivo",
      paletaId: "noite_mineral",
      tipografiaId: "contemporaneo_minimalista",
      identidade: {
        nomeExibicao: "Garage 88",
        subtituloCurto: "Seminovos Selecionados & Financiamento",
        urlLogotipoOpcional: "/midias-demonstracao/logo-garage88.png",
        cidadeEstado: "Cabo Frio · RJ · Teixeira e Souza",
      },
      ...CHAMADAS_EDITORIAIS_GARAGE88,
      midiaFundo: {
        tipo: "video",
        urlPrincipal: "/midias-demonstracao/video-garage88.mp4",
        urlPosterVideo: "/midias-demonstracao/fundo-escuro-garage88.svg",
        textoAlternativo: "Veículos e atmosfera automotiva moderna na Garage 88.",
        pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
        pontoFocalMobile: { xPercentual: 50, yPercentual: 50 },
        intensidadeVeloEscuro: "intenso",
      },
      acoesPrincipais: [
        {
          id: "acao-simulacao-rapida",
          rotulo: "Simular financiamento com taxa 1,19%!",
          subtituloDiscreto: "Primeira parcela para 150 dias e aprovação rápida",
          tipoDestino: "microfluxo",
          destino: "#fluxo-financiamento",
          destaquePrincipal: true,
        },
        {
          id: "acao-estoque-completo-site",
          rotulo: "Ver estoque completo no site",
          subtituloDiscreto: "Acesse todos os veículos em Garage88",
          tipoDestino: "link_externo",
          destino: "https://garage88.com.br",
        },
        {
          id: "acao-troco-na-troca",
          rotulo: "Venda seu carro ou troco na troca",
          subtituloDiscreto: "Avaliação na hora e pagamento à vista",
          tipoDestino: "microfluxo",
          destino: "#fluxo-atendimento",
        },
        {
          id: "acao-cotacao-seguro",
          rotulo: "Cotar seguro do seu veículo",
          subtituloDiscreto: "Cotação rápida com as principais seguradoras",
          tipoDestino: "microfluxo",
          destino: "#fluxo-diagnostico",
        },
        {
          id: "acao-whatsapp-vendedores",
          rotulo: "Falar com consultor no WhatsApp",
          subtituloDiscreto: "Escolha um vendedor da equipe para atendimento direto",
          tipoDestino: "secao_equipe",
          destino: "#equipe",
        },
      ],
      redesSociais: [
        {
          id: "rede-ig-garage88",
          rede: "instagram",
          url: "https://instagram.com/garage88.com.br",
          rotuloAcessivel: "Instagram oficial da Garage 88",
        },
        {
          id: "rede-site-garage88",
          rede: "linkedin",
          url: "https://garage88.com.br",
          rotuloAcessivel: "Portal oficial garage88.com.br",
        },
      ],
      obrasDestaqueGaleria: [
        {
          id: "obra-garage-01",
          tituloObra: "Jeep Renegade Longitude 1.3 Turbo Flex",
          serieOuCategoria: "SUV · Seminovos Selecionados",
          anoOuLocal: "Cabo Frio · 2026",
          urlImagem: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
          textoAlternativo: "Jeep Renegade Longitude prata em estúdio.",
          pontoFocal: { xPercentual: 58, yPercentual: 44 },
        },
        {
          id: "obra-garage-02",
          tituloObra: "Hyundai Creta Smart Plus 1.6 Flex",
          serieOuCategoria: "SUV Compacto · Único Dono",
          anoOuLocal: "Cabo Frio · 2026",
          urlImagem: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
          textoAlternativo: "Hyundai Creta Smart Plus branco no pátio da loja.",
          pontoFocal: { xPercentual: 50, yPercentual: 50 },
        },
        {
          id: "obra-garage-03",
          tituloObra: "Toyota Corolla XEi 2.0 Dynamic Force",
          serieOuCategoria: "Sedã Médio · Câmbio Direct Shift",
          anoOuLocal: "Cabo Frio · 2026",
          urlImagem: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
          textoAlternativo: "Toyota Corolla XEi cinza sob iluminação.",
          pontoFocal: { xPercentual: 50, yPercentual: 50 },
        },
      ],
      seo: {
        tituloSeo:
          "Garage 88 — Seminovos Selecionados, Financiamento e Troco na Troca em Cabo Frio",
        descricaoSeo:
          "Feirão Acelera com taxas a partir de 1,19% e 1ª parcela para 150 dias. Compre, venda ou financie seu seminovo na Garage 88 em Cabo Frio/RJ.",
        indexavel: true,
      },
    },

    "vasconcelos-advocacia-empresarial": {
      organizacaoId: "demo-org-vasconcelos",
      identificadorPublico: "vasconcelos-advocacia-empresarial",
      publicado: true,
      paginaAtiva: true,
      versaoPublicada: 1,
      atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      composicaoVisual: "retrato_editorial",
      paletaId: "argila_quente",
      tipografiaId: "classico_editorial",
      identidade: {
        nomeExibicao: "Vasconcelos & Valença Advocacia Empresarial",
        subtituloCurto: "Direito Societário, M&A, Governança & Contratos",
        cidadeEstado: "São Paulo · Rio de Janeiro",
        registroProfissionalOpcional: "OAB/SP 42.180 (Sociedade de Advogados)",
      },
      chamadaEditorial: {
        sobretituloOpcional: "Assessoria Jurídica Estratégica",
        tituloPrincipal: "Segurança jurídica, governança societária e condução técnica de M&A.",
        descricaoCurta:
          "Assessoria consultiva e contenciosa especializada para conselhos e empresas de médio e grande porte.",
      },
      midiaFundo: {
        tipo: "imagem",
        urlPrincipal: "https://images.pexels.com/photos/7841788/pexels-photo-7841788.jpeg",
        textoAlternativo:
          "Retrato institucional da advogada Helena Vasconcelos em escritório corporativo.",
        pontoFocalDesktop: { xPercentual: 50, yPercentual: 28 },
        pontoFocalMobile: { xPercentual: 50, yPercentual: 24 },
        intensidadeVeloEscuro: "equilibrado",
      },
      acoesPrincipais: [
        {
          id: "acao-diagnostico-societario",
          rotulo: "Diagnóstico preliminar de risco societário",
          subtituloDiscreto: "Triagem confidencial para conselhos e sócios",
          tipoDestino: "microfluxo",
          destino: "#fluxo-diagnostico",
          destaquePrincipal: true,
        },
        {
          id: "acao-areas-atuacao-empresarial",
          rotulo: "Áreas de atuação corporativa",
          subtituloDiscreto: "M&A, governança, contratos e compliance",
          tipoDestino: "secao_servicos",
          destino: "#servicos",
        },
        {
          id: "acao-conectar-socios",
          rotulo: "Agendar reunião com os sócios",
          tipoDestino: "microfluxo",
          destino: "#fluxo-profissional",
        },
      ],
      redesSociais: [
        {
          id: "rede-li-vasconcelos",
          rede: "linkedin",
          url: "https://linkedin.com",
          rotuloAcessivel: "Artigos e notas técnicas da banca no LinkedIn",
        },
        {
          id: "rede-site-vasconcelos",
          rede: "site",
          url: "https://vasconcelosvalenca.adv.br",
          rotuloAcessivel: "Portal institucional e jurisprudência",
        },
      ],
      obrasDestaqueGaleria: [],
      seo: {
        tituloSeo: "Vasconcelos & Valença — Advocacia Empresarial, M&A e Direito Societário",
        descricaoSeo:
          "Assessoria jurídica societária, fusões e aquisições, governança corporativa e contratos empresariais em São Paulo e Rio de Janeiro.",
        indexavel: true,
      },
    },

    "lumina-arquitetura-luz": {
      organizacaoId: "demo-org-lumina",
      identificadorPublico: "lumina-arquitetura-luz",
      publicado: true,
      paginaAtiva: true,
      versaoPublicada: 1,
      atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      composicaoVisual: "galeria_editorial",
      paletaId: "marfim_editorial",
      tipografiaId: "galeria_arquitetonica",
      identidade: {
        nomeExibicao: "Lumina Arquitetura & Luz",
        subtituloCurto: "Projetos Luminotécnicos & Decoração de Interiores",
        cidadeEstado: "São Paulo · Jardins",
      },
      chamadaEditorial: {
        sobretituloOpcional: "Ateliê de Luz & Interiores",
        tituloPrincipal: "Iluminação cênica, automação e design autoral para ambientes vivos.",
        descricaoCurta:
          "Projetos residenciais exclusivos com conforto visual, circuitos inteligentes e peças assinadas.",
      },
      midiaFundo: {
        tipo: "imagem",
        urlPrincipal: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
        textoAlternativo:
          "Living contemporâneo com iluminação cênica indireta e design de interiores.",
        pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
        intensidadeVeloEscuro: "suave",
      },
      acoesPrincipais: [
        {
          id: "acao-explorar-estoque",
          rotulo: "Explorar peças e ambientes",
          subtituloDiscreto: "Luminárias autorais e projetos de iluminação",
          tipoDestino: "microfluxo",
          destino: "#fluxo-catalogo",
          destaquePrincipal: true,
        },
        {
          id: "acao-solicitar-proposta-veiculo",
          rotulo: "Solicitar projeto ou consultoria",
          subtituloDiscreto: "Proposta técnica para residências e espaços comerciais",
          tipoDestino: "microfluxo",
          destino: "#fluxo-atendimento",
        },
      ],
      redesSociais: [
        {
          id: "rede-ig-lumina",
          rede: "instagram",
          url: "https://instagram.com",
          rotuloAcessivel: "Instagram oficial Lumina Arquitetura & Luz",
        },
        {
          id: "rede-li-lumina",
          rede: "linkedin",
          url: "https://linkedin.com",
          rotuloAcessivel: "Página institucional Lumina Arquitetura no LinkedIn",
        },
      ],
      obrasDestaqueGaleria: [
        {
          id: "obra-01",
          tituloObra: "Living Integrado Casa Jardins",
          serieOuCategoria: "Luz Cênica & Marcenaria",
          anoOuLocal: "São Paulo · 2026",
          urlImagem: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
          textoAlternativo: "Living integrado com iluminação indireta dimerizável.",
          pontoFocal: { xPercentual: 50, yPercentual: 48 },
        },
        {
          id: "obra-02",
          tituloObra: "Cozinha Gourmet Linear 2700K",
          serieOuCategoria: "Perfis LED Embutidos",
          anoOuLocal: "São Paulo · 2026",
          urlImagem: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg",
          textoAlternativo: "Cozinha gourmet contemporânea com perfil linear de luz quente.",
          pontoFocal: { xPercentual: 50, yPercentual: 50 },
        },
        {
          id: "obra-03",
          tituloObra: "Fachada Noturna & Paisagismo",
          serieOuCategoria: "Iluminação Arquitetônica",
          anoOuLocal: "São Paulo · 2025",
          urlImagem: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
          textoAlternativo: "Fachada residencial noturna com balizadores e embutidos de piso.",
          pontoFocal: { xPercentual: 50, yPercentual: 52 },
        },
      ],
      seo: {
        tituloSeo: "Lumina Arquitetura & Luz — Projetos Luminotécnicos e Design de Interiores",
        descricaoSeo:
          "Projetos de iluminação cênica residencial, automação e decoração autoral nos Jardins, São Paulo.",
        indexavel: true,
      },
    },
    "maplebear-cabofrio": VITRINE_MAPLE_BEAR_CABO_FRIO,
    "suppera-seguros": VITRINE_SUPPERA_SEGUROS,
    nexoativo: VITRINE_NEXOATIVO,
    "pousada-velas-do-forte": VITRINE_POUSADA_VELAS_DO_FORTE,
    cardimecastroadvocacia: VITRINE_CARDIM_CASTRO,
  };

export const CATALOGO_ACERVOS_DEMONSTRACAO: Readonly<Record<string, AcervoPublicoVitrine>> = {
  "garage-88": {
    servicos: [
      {
        id: "srv-garage88-1",
        organizacaoId: "org-garage88",
        nome: "Venda na Hora & Troco na Troca",
        resumo:
          "Compramos seu veículo com pagamento à vista imediato ou você troca por um seminovo e sai com a diferença em dinheiro no bolso.",
        categoria: "Compra & Avaliação",
        rotuloPrecoOpcional: "Avaliação gratuita na hora",
        prazoOuDuracao: "Avaliação em 30 min",
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "srv-garage88-2",
        organizacaoId: "org-garage88",
        nome: "Financiamento Bancário Feirão Acelera",
        resumo:
          "Parcerias com Banco Pan, Bradesco, BV, Itaú e Santander. Taxas a partir de 1,19% a.m. e primeira parcela para até 150 dias.",
        categoria: "Financiamento",
        rotuloPrecoOpcional: "Taxas a partir de 1,19% a.m.",
        prazoOuDuracao: "Aprovação em até 2h",
        ordemExibicao: 2,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "srv-garage88-3",
        organizacaoId: "org-garage88",
        nome: "Cotação de Seguro Automotivo & Garantia",
        resumo:
          "Proteção completa para seu veículo com as principais seguradoras do mercado e garantia de motor e câmbio para seminovos.",
        categoria: "Seguros & Proteção",
        precoBaseCentavos: 150000,
        rotuloPrecoOpcional: "Cotação sob medida",
        prazoOuDuracao: "Atendimento imediato",
        ordemExibicao: 3,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
    produtos: [
      {
        id: "prd-garage88-1",
        organizacaoId: "org-garage88",
        nome: "Jeep Renegade Longitude 1.3 Turbo Flex 2023",
        resumo:
          "SUV seminovo com 32.000 km, câmbio automático de 6 marchas, bancos em couro, multimídia, laudo cautelar 100% aprovado e garantia Garage 88.",
        categoria: "SUVs",
        precoCentavos: 10890000,
        disponibilidade: "disponivel",
        especificacoesCurtas: [
          "Ano 2023 · 32.000 km",
          "Câmbio Automático 6M",
          "Laudo 100% Aprovado",
          "Garantia Garage 88",
        ],
        urlImagemPrincipal: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
        textoAlternativoImagem: "Jeep Renegade Longitude prata em estúdio",
        pontoFocalImagem: { xPercentual: 58, yPercentual: 44 },
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prd-garage88-2",
        organizacaoId: "org-garage88",
        nome: "Hyundai Creta Smart Plus 1.6 Flex 2022",
        resumo:
          "SUV com 41.000 km rodados, multimídia blueMedia de 7 polegadas com Apple CarPlay, ar digital, único dono com revisões em dia.",
        categoria: "SUVs Compactos",
        precoCentavos: 9690000,
        disponibilidade: "disponivel",
        especificacoesCurtas: [
          "Ano 2022 · 41.000 km",
          "Câmbio Automático 6M",
          "Único Dono",
          "Revisado",
        ],
        urlImagemPrincipal: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
        textoAlternativoImagem: "Hyundai Creta Smart Plus branco no pátio da loja",
        pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
        ordemExibicao: 2,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prd-garage88-3",
        organizacaoId: "org-garage88",
        nome: "Toyota Corolla XEi 2.0 Dynamic Force 2023",
        resumo:
          "Sedã executivo com 38.000 km, motor 2.0 de 177 cv, câmbio CVT com 10 marchas virtuais, 7 airbags e faróis em LED.",
        categoria: "Sedãs",
        precoCentavos: 13990000,
        disponibilidade: "disponivel",
        especificacoesCurtas: [
          "Ano 2023 · 38.000 km",
          "Câmbio Direct Shift 10M",
          "Faróis Full LED",
          "Garantia de Loja",
        ],
        urlImagemPrincipal: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
        textoAlternativoImagem: "Toyota Corolla XEi cinza sob iluminação",
        pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
        ordemExibicao: 3,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
    projetosPortfolio: [
      {
        id: "prj-garage88-1",
        organizacaoId: "org-garage88",
        titulo: "Entrega Seminovos — Jeep Renegade Longitude",
        categoriaOuSerie: "Troco na Troca · Família Mendes",
        anoOuLocal: "Cabo Frio · 2026",
        resumoEditorial:
          "Cliente realizou a troca do seu seminovo anterior com troco, retirou o Renegade revisado e saiu com dinheiro na conta.",
        urlImagemCapa: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
        textoAlternativoCapa: "Jeep Renegade entregue no showroom da Garage 88 em Cabo Frio.",
        pontoFocalCapa: { xPercentual: 58, yPercentual: 44 },
        destaqueVitrine: true,
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prj-garage88-2",
        organizacaoId: "org-garage88",
        titulo: "Feirão Acelera — Financiamento com Taxa 1,19%",
        categoriaOuSerie: "Financiamento Bancário · Cabo Frio",
        anoOuLocal: "Cabo Frio · 2026",
        resumoEditorial:
          "Aprovação de crédito em 2 horas com primeira parcela para 150 dias em parceria com os principais bancos.",
        urlImagemCapa: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
        textoAlternativoCapa: "Seminovo entregue nas condições do Feirão Acelera.",
        pontoFocalCapa: { xPercentual: 50, yPercentual: 50 },
        destaqueVitrine: true,
        ordemExibicao: 2,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prj-garage88-3",
        organizacaoId: "org-garage88",
        titulo: "Venda na Hora & Consignação Segura",
        categoriaOuSerie: "Liquidez Imediata em Cabo Frio",
        anoOuLocal: "Cabo Frio · 2026",
        resumoEditorial:
          "Avaliação transparente na hora e pagamento à vista com total segurança jurídica e transferência ágil.",
        urlImagemCapa: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
        textoAlternativoCapa: "Pátio de avaliação técnica da Garage 88.",
        pontoFocalCapa: { xPercentual: 50, yPercentual: 48 },
        destaqueVitrine: true,
        ordemExibicao: 3,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
    profissionais: [
      {
        id: "prof-bruno-silva",
        organizacaoId: "org-garage88",
        identificadorCartao: "bruno-silva",
        nomeCompleto: "Bruno Silva",
        cargoOuEspecialidade: "Consultor de Vendas & Feirão Acelera",
        registroProfissionalOpcional: "Cabo Frio · RJ",
        minibiografia: "Seminovos selecionados e aprovação bancária imediata no Feirão Acelera.",
        urlFotoPerfil: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg",
        pontoFocalFoto: { xPercentual: 50, yPercentual: 28 },
        whatsappOpcional: "5522981038549",
        emailContatoOpcional: "bruno.vendas@garage88.com.br",
        linkedinOpcional: "https://garage88.com.br",
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prof-isadora-martins",
        organizacaoId: "org-garage88",
        identificadorCartao: "isadora-martins",
        nomeCompleto: "Isadora Martins",
        cargoOuEspecialidade: "Atendimento Digital & Simulações Rápidas",
        registroProfissionalOpcional: "Cabo Frio · RJ",
        minibiografia: "Atendimento online imediato, envio de vídeos e reserva de veículos.",
        urlFotoPerfil: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
        pontoFocalFoto: { xPercentual: 60, yPercentual: 40 },
        whatsappOpcional: "5522981038549",
        emailContatoOpcional: "isadora.atendimento@garage88.com.br",
        instagramOpcional: "https://instagram.com/garage88.com.br",
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 2,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prof-fernanda-drummond",
        organizacaoId: "org-garage88",
        identificadorCartao: "fernanda-drummond",
        nomeCompleto: "Fernanda Drummond",
        cargoOuEspecialidade: "Avaliadora Técnica & Troco na Troca",
        registroProfissionalOpcional: "Cabo Frio · RJ",
        minibiografia: "Avaliação pericial em 30 minutos e pagamento à vista com troco.",
        urlFotoPerfil: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
        pontoFocalFoto: { xPercentual: 50, yPercentual: 30 },
        whatsappOpcional: "5522981038549",
        emailContatoOpcional: "fernanda.avaliacao@garage88.com.br",
        instagramOpcional: "https://instagram.com/garage88.com.br",
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 3,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prof-carlos-eduardo",
        organizacaoId: "org-garage88",
        identificadorCartao: "carlos-eduardo",
        nomeCompleto: "Carlos Eduardo",
        cargoOuEspecialidade: "Consultor de Seguros & Pós-Venda",
        registroProfissionalOpcional: "Cabo Frio · RJ",
        minibiografia: "Cotação com as maiores seguradoras e garantia estendida de loja.",
        urlFotoPerfil: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
        pontoFocalFoto: { xPercentual: 50, yPercentual: 35 },
        whatsappOpcional: "5522981038549",
        emailContatoOpcional: "carlos.seguros@garage88.com.br",
        linkedinOpcional: "https://garage88.com.br",
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 4,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
    microfluxos: [
      {
        id: "fluxo-financiamento",
        organizacaoId: "org-garage88",
        ancoraAcionamento: "#fluxo-financiamento",
        titulo: "Simular financiamento com taxa 1,19%!",
        rotuloBotaoHome: "Simular financiamento com taxa 1,19%!",
        subtituloBotaoHome: "Primeira parcela para 150 dias e aprovação rápida",
        ativoNaHome: true,
        destaquePrimarioHome: true,
        ordemHome: 1,
        descricaoCurta: "Taxas a partir de 1,19% a.m. e 1ª parcela para 150 dias.",
        textoBotaoConclusao: "Enviar simulação para aprovação",
        mensagemConfirmacaoTitulo: "Simulação recebida pela Garage 88",
        mensagemConfirmacaoCorpo:
          "Nossa equipe de crédito consultará os bancos parceiros (Pan, Bradesco, BV, Itaú e Santander) e retornará com o resultado das parcelas.",
        etapaInicialId: "etapa-opcionais-compra",
        etapas: [
          {
            id: "etapa-opcionais-compra",
            tipoEtapa: "selecao_multipla",
            titulo: "Vantagens da sua simulação",
            subtituloOpcional: "Selecione as condições desejadas:",
            obrigatoria: true,
            proximaEtapaPadraoId: "etapa-categoria-veiculo",
            opcoes: [
              {
                id: "item-taxa-reduzida",
                rotulo: "Taxa a partir de 1,19% a.m.",
              },
              {
                id: "item-carencia-150dias",
                rotulo: "1ª parcela para até 150 dias",
              },
              {
                id: "item-garantia-2anos",
                rotulo: "Garantia estendida motor e câmbio",
                valorAdicionalCentavos: 180000,
              },
              {
                id: "item-troca-troco",
                rotulo: "Carro na troca com troco na mão",
              },
            ],
          },
          {
            id: "etapa-categoria-veiculo",
            tipoEtapa: "selecao_unica",
            titulo: "Categoria do veículo",
            subtituloOpcional: "Para calibrar a estimativa bancária:",
            obrigatoria: true,
            proximaEtapaPadraoId: "etapa-contato",
            opcoes: [
              {
                id: "cat-suv-medio",
                rotulo: "SUV (Renegade, Compass, Creta, Tracker)",
              },
              {
                id: "cat-sedan-medio",
                rotulo: "Sedã (Corolla, Civic, Cronos, Onix Plus)",
              },
              {
                id: "cat-hatch-urbano",
                rotulo: "Hatch (HB20, Polo, Gol, Onix, Yaris)",
              },
              {
                id: "cat-crossover",
                rotulo: "Picape / Utilitário (Toro, Strada, Saveiro, Hilux)",
              },
            ],
          },
          {
            id: "etapa-contato",
            tipoEtapa: "coleta_contato",
            titulo: "Dados para simulação",
            subtituloOpcional: "Retornaremos com a prévia das parcelas em 30 min.",
            obrigatoria: true,
          },
        ],
        regraCalculoComercial: {
          modalidade: "sem_calculo",
        },
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "fluxo-catalogo",
        organizacaoId: "org-garage88",
        ancoraAcionamento: "#fluxo-catalogo",
        titulo: "Destaques do Showroom — Garage 88",
        descricaoCurta:
          "Confira os veículos selecionados da semana e consulte disponibilidade imediata.",
        textoBotaoConclusao: "Solicitar proposta deste seminovo",
        mensagemConfirmacaoTitulo: "Interesse registrado na Garage 88",
        mensagemConfirmacaoCorpo:
          "Recebemos sua escolha. Nosso consultor entrará em contato para agendar uma visita e test-drive.",
        etapaInicialId: "etapa-catalogo",
        etapas: [
          {
            id: "etapa-catalogo",
            tipoEtapa: "selecao_catalogo",
            titulo: "Escolha o veículo de seu interesse",
            subtituloOpcional: "Selecione uma opção do acervo para avançar.",
            obrigatoria: true,
            fonteCatalogo: "ambos",
            proximaEtapaPadraoId: "etapa-contato",
          },
          {
            id: "etapa-contato",
            tipoEtapa: "coleta_contato",
            titulo: "Para onde enviamos os detalhes e disponibilidade?",
            subtituloOpcional: "Seus dados são confidenciais e exclusivos para este contato.",
            obrigatoria: true,
          },
        ],
        regraCalculoComercial: {
          modalidade: "quantidade_vezes_preco",
          rotuloBase: "Veículo selecionado",
          valorBaseCentavos: 0,
          unidadeQuantidade: "unid.",
          quantidadeMinima: 1,
          quantidadeMaxima: 5,
          observacaoTransparencia:
            "Valor calculado deterministicamente conforme a quantidade selecionada.",
        },
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "fluxo-diagnostico",
        organizacaoId: "org-garage88",
        ancoraAcionamento: "#fluxo-diagnostico",
        titulo: "Cotar seguro do seu veículo",
        rotuloBotaoHome: "Cotar seguro do seu veículo",
        subtituloBotaoHome: "Cotação rápida com as principais seguradoras",
        ativoNaHome: true,
        destaquePrimarioHome: false,
        ordemHome: 3,
        descricaoCurta:
          "Consulte coberturas com as principais seguradoras e encontre a proteção ideal para seu veículo.",
        textoBotaoConclusao: "Receber cotação personalizada",
        mensagemConfirmacaoTitulo: "Solicitação de cotação enviada",
        mensagemConfirmacaoCorpo:
          "Nossa equipe de seguros comparará as coberturas entre Porto Seguro, Tokio Marine, Allianz e Azul e enviará as opções.",
        etapaInicialId: "etapa-perfil-uso",
        etapas: [
          {
            id: "etapa-perfil-uso",
            tipoEtapa: "selecao_unica",
            titulo: "Qual perfil de cobertura você busca para seu veículo?",
            obrigatoria: true,
            proximaEtapaPadraoId: "etapa-dados-veiculo-seguro",
            opcoes: [
              {
                id: "opc-compreensiva",
                rotulo:
                  "Proteção Total Compreensiva (Colisão, Roubo, Incêndio e Danos a Terceiros)",
                descricaoCurta:
                  "Cobertura completa com assistência 24h, guincho ilimitado e carro reserva.",
              },
              {
                id: "opc-rastreador",
                rotulo: "Seguro Econômico com Rastreador (Roubo e Furto com Assistência)",
                descricaoCurta:
                  "Excelente custo-benefício com instalação de rastreador e guincho 24h.",
              },
              {
                id: "opc-comercial-viagens",
                rotulo: "Uso Comercial / Motorista de Aplicativo / Viagens Frequentes",
                descricaoCurta:
                  "Cobertura para alta quilometragem, terceiros ampliado e proteção de passageiros.",
              },
            ],
          },
          {
            id: "etapa-dados-veiculo-seguro",
            tipoEtapa: "formulario_dinamico",
            titulo: "Detalhes do veículo para cotação",
            subtituloOpcional: "Com base no perfil selecionado, informe os dados do seu veículo:",
            obrigatoria: true,
            proximaEtapaPadraoId: "etapa-contato",
            campos: [
              {
                id: "campo-modelo-versao",
                rotulo: "Modelo e versão do veículo",
                tipo: "texto_curto",
                obrigatorio: true,
                placeholder: "Ex.: Jeep Renegade Longitude 1.3 Turbo",
              },
              {
                id: "campo-ano-fabricacao",
                rotulo: "Ano de fabricação / modelo",
                tipo: "texto_curto",
                obrigatorio: true,
                placeholder: "Ex.: 2022/2023",
              },
              {
                id: "campo-seguro-atual",
                rotulo: "Já possui seguro ativo ou classe de bônus?",
                tipo: "selecao_unica",
                obrigatorio: true,
                opcoesCustomizadas: [
                  "Sim, já tenho seguro e quero renovar/comparar",
                  "Não, é meu primeiro seguro para este carro",
                ],
              },
            ],
          },
          {
            id: "etapa-contato",
            tipoEtapa: "coleta_contato",
            titulo: "Informe seus dados para envio da cotação comparativa",
            obrigatoria: true,
          },
        ],
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "fluxo-atendimento",
        organizacaoId: "org-garage88",
        ancoraAcionamento: "#fluxo-atendimento",
        titulo: "Venda seu carro ou troco na troca",
        rotuloBotaoHome: "Venda seu carro ou troco na troca",
        subtituloBotaoHome: "Avaliação na hora e pagamento à vista",
        ativoNaHome: true,
        destaquePrimarioHome: false,
        ordemHome: 2,
        descricaoCurta: "Avaliação técnica e pagamento à vista em 30 min.",
        textoBotaoConclusao: "Solicitar avaliação do veículo",
        mensagemConfirmacaoTitulo: "Solicitação de avaliação recebida",
        mensagemConfirmacaoCorpo:
          "Nossa equipe técnica avaliará seu veículo e enviará a proposta no seu WhatsApp em até 30 minutos.",
        etapaInicialId: "etapa-servico-interesse",
        etapas: [
          {
            id: "etapa-servico-interesse",
            tipoEtapa: "selecao_catalogo",
            titulo: "Qual modalidade de negociação você prefere?",
            subtituloOpcional: "Selecione a opção desejada para seu veículo usado.",
            obrigatoria: true,
            fonteCatalogo: "servicos",
            proximaEtapaPadraoId: "etapa-observacao-visita",
          },
          {
            id: "etapa-observacao-visita",
            tipoEtapa: "entrada_curta",
            titulo: "Qual é o modelo, ano e quilometragem do seu carro?",
            subtituloOpcional: "Informe brevemente para adiantarmos a pesquisa da tabela FIPE.",
            obrigatoria: false,
            placeholderEntrada: "Ex.: Hyundai HB20 1.0 2021, 45.000 km, completo, único dono...",
            proximaEtapaPadraoId: "etapa-contato",
          },
          {
            id: "etapa-contato",
            tipoEtapa: "conectar_whatsapp",
            titulo: "Tudo pronto para sua avaliação",
            subtituloOpcional:
              "Toque abaixo para abrir a conversa no WhatsApp com os dados preenchidos.",
            obrigatoria: true,
          },
        ],
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "fluxo-profissional",
        organizacaoId: "org-garage88",
        ancoraAcionamento: "#fluxo-profissional",
        titulo: "Falar com consultor no WhatsApp",
        rotuloBotaoHome: "Falar com consultor no WhatsApp",
        subtituloBotaoHome: "Escolha um vendedor da equipe para atendimento direto",
        ativoNaHome: true,
        destaquePrimarioHome: false,
        ordemHome: 4,
        descricaoCurta:
          "Escolha o especialista ideal para o seu momento e receba atendimento direto no WhatsApp.",
        textoBotaoConclusao: "Solicitar contato do especialista",
        mensagemConfirmacaoTitulo: "Consultor notificado com sucesso",
        mensagemConfirmacaoCorpo:
          "O especialista selecionado recebeu seus dados e iniciará o contato via WhatsApp com prioridade.",
        etapaInicialId: "etapa-especialista",
        etapas: [
          {
            id: "etapa-especialista",
            tipoEtapa: "selecao_profissional",
            titulo: "Com qual consultor você prefere falar?",
            subtituloOpcional:
              "Cada especialista atende uma frente: vendas, aprovação online, avaliação técnica ou seguros.",
            obrigatoria: true,
            proximaEtapaPadraoId: "etapa-contato",
          },
          {
            id: "etapa-contato",
            tipoEtapa: "coleta_contato",
            titulo: "Informe seus dados para o consultor retornar",
            obrigatoria: true,
          },
        ],
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
  },

  "vasconcelos-advocacia-empresarial": {
    servicos: [
      {
        id: "srv-vasconcelos-1",
        organizacaoId: "demo-org-vasconcelos",
        nome: "Assessoria Jurídica em Fusões & Aquisições (M&A)",
        resumo:
          "Due diligence, acordos de sócios, compra e venda de quotas e fechamento de operações.",
        categoria: "Direito Societário",
        rotuloPrecoOpcional: "Honorários sob escopo da transação",
        prazoOuDuracao: "Etapas de 4 a 12 semanas",
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "srv-vasconcelos-2",
        organizacaoId: "demo-org-vasconcelos",
        nome: "Reestruturação Societária & Governança Corporativa",
        resumo:
          "Acordos de sócios, regimentos de conselho, cisões, incorporações e planos de opções.",
        categoria: "Governança Corporativa",
        precoBaseCentavos: 1500000,
        rotuloPrecoOpcional: "Honorários a partir de",
        prazoOuDuracao: "Diagnóstico e plano em 30 dias",
        ordemExibicao: 2,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "srv-vasconcelos-3",
        organizacaoId: "demo-org-vasconcelos",
        nome: "Contratos Empresariais Estratégicos & Compliance",
        resumo:
          "Contratos comerciais internacionais, licenciamento tecnológico e programas de integridade corporativa.",
        categoria: "Contratos Comerciais",
        rotuloPrecoOpcional: "Consultoria mensal continuada",
        ordemExibicao: 3,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
    produtos: [],
    projetosPortfolio: [],
    profissionais: [
      {
        id: "prof-helena-vasconcelos",
        organizacaoId: "demo-org-vasconcelos",
        identificadorCartao: "helena-vasconcelos",
        nomeCompleto: "Dra. Helena Vasconcelos",
        cargoOuEspecialidade: "Sócia-Fundadora · M&A, Societário e Governança",
        registroProfissionalOpcional: "OAB/SP 312.440",
        minibiografia:
          "Mestre pela USP. Especialista em operações de M&A e governança para conselhos.",
        urlFotoPerfil: "https://images.pexels.com/photos/7841788/pexels-photo-7841788.jpeg",
        pontoFocalFoto: { xPercentual: 50, yPercentual: 26 },
        emailContatoOpcional: "helena@vasconcelosvalenca.adv.br",
        linkedinOpcional: "https://linkedin.com",
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prof-rodrigo-valenca",
        organizacaoId: "demo-org-vasconcelos",
        identificadorCartao: "rodrigo-valenca",
        nomeCompleto: "Dr. Rodrigo Valença",
        cargoOuEspecialidade: "Sócio · Contratos Internacionais & Compliance",
        registroProfissionalOpcional: "OAB/SP 289.115",
        minibiografia:
          "Especialista em contratos empresariais multilaterais e programas de compliance corporativo.",
        urlFotoPerfil: "https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg",
        pontoFocalFoto: { xPercentual: 50, yPercentual: 28 },
        emailContatoOpcional: "rodrigo@vasconcelosvalenca.adv.br",
        linkedinOpcional: "https://linkedin.com",
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 2,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
  },

  "lumina-arquitetura-luz": {
    servicos: [
      {
        id: "srv-lumina-1",
        organizacaoId: "demo-org-lumina",
        nome: "Projeto Luminotécnico Residencial 2700K",
        resumo:
          "Estudo luminotécnico completo com cálculo de lux, circuitos dimerizáveis e especificação de luminárias.",
        categoria: "Projetos Luminotécnicos",
        precoBaseCentavos: 350000,
        rotuloPrecoOpcional: "A partir de",
        prazoOuDuracao: "Entrega em 15 dias",
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
    produtos: [
      {
        id: "prd-lumina-1",
        organizacaoId: "demo-org-lumina",
        nome: "Pendente Linear Slim Latão Escovado 2700K",
        resumo: "Perfil ultrafino em latão maciço com LED de alto IRC > 95 e dimerização suave.",
        categoria: "Luminárias Suspensas",
        precoCentavos: 485000,
        disponibilidade: "disponivel",
        especificacoesCurtas: ["Comprimento 180cm", "IRC > 95 Dimerizável", "Latão Maciço"],
        urlImagemPrincipal: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
        textoAlternativoImagem: "Pendente linear slim sobre mesa de jantar em latão escovado",
        pontoFocalImagem: { xPercentual: 50, yPercentual: 50 },
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prd-lumina-2",
        organizacaoId: "demo-org-lumina",
        nome: "Luminária de Piso Escultural Arco Minimalista",
        resumo: "Estrutura curva em aço carbono preto fosco com cúpula difusora de luz indireta.",
        categoria: "Luminárias de Piso",
        precoCentavos: 690000,
        disponibilidade: "sob_encomenda",
        especificacoesCurtas: ["Altura 210cm", "Luz 2700K Regulável", "Base em Mármore Nero"],
        urlImagemPrincipal: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg",
        textoAlternativoImagem: "Luminária de piso arco minimalista em sala de estar",
        pontoFocalImagem: { xPercentual: 50, yPercentual: 52 },
        ordemExibicao: 2,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
    projetosPortfolio: [
      {
        id: "prj-lumina-1",
        organizacaoId: "demo-org-lumina",
        titulo: "Living Integrado & Luz Cênica — Casa Jardins",
        categoriaOuSerie: "Projeto Residencial Completo",
        anoOuLocal: "São Paulo · 2026",
        resumoEditorial:
          "Harmonia entre luz indireta nos painéis de nogueira e circuitos cênicos dimerizáveis.",
        urlImagemCapa: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
        textoAlternativoCapa: "Living integrado com iluminação indireta dimerizável em nogueira.",
        pontoFocalCapa: { xPercentual: 50, yPercentual: 48 },
        destaqueVitrine: true,
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
    profissionais: [
      {
        id: "prof-helena-prado",
        organizacaoId: "demo-org-lumina",
        identificadorCartao: "helena-prado",
        nomeCompleto: "Helena Prado",
        cargoOuEspecialidade: "Lighting Designer Titular",
        minibiografia: "Especialista em iluminação cênica residencial e conforto visual.",
        urlFotoPerfil: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
        pontoFocalFoto: { xPercentual: 50, yPercentual: 50 },
        whatsappOpcional: "5511998765432",
        emailContatoOpcional: "helena@luminaarquitetura.com.br",
        instagramOpcional: "https://instagram.com",
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
      {
        id: "prof-lucas-becker",
        organizacaoId: "demo-org-lumina",
        identificadorCartao: "lucas-becker",
        nomeCompleto: "Lucas Becker",
        cargoOuEspecialidade: "Designer de Interiores & Ambientação",
        minibiografia: "Curadoria de mobiliário e composições espaciais autênticas.",
        urlFotoPerfil: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
        pontoFocalFoto: { xPercentual: 50, yPercentual: 50 },
        whatsappOpcional: "5511998765433",
        emailContatoOpcional: "lucas@luminaarquitetura.com.br",
        instagramOpcional: "https://instagram.com",
        aceitaSolicitacoesDiretas: true,
        ordemExibicao: 2,
        ativo: true,
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      },
    ],
  },
  "maplebear-cabofrio": ACERVO_MAPLE_BEAR_CABO_FRIO,
  "suppera-seguros": ACERVO_SUPPERA_SEGUROS,
  nexoativo: ACERVO_NEXOATIVO,
  "pousada-velas-do-forte": ACERVO_POUSADA_VELAS_DO_FORTE,
  cardimecastroadvocacia: ACERVO_CARDIM_CASTRO,
};

export function buscarDemonstracaoEditorialPorSlug(
  identificadorPublico: string,
): ConteudoPaginaPublicada | null {
  return CATALOGO_DEMONSTRACOES_EDITORIAIS[identificadorPublico] ?? null;
}

export function buscarAcervoDemonstracaoPorSlug(
  identificadorPublico: string,
): AcervoPublicoVitrine {
  const acervoBase = CATALOGO_ACERVOS_DEMONSTRACAO[identificadorPublico];
  if (!acervoBase) {
    return criarAcervoPublicoVazio();
  }

  const pagina = buscarDemonstracaoEditorialPorSlug(identificadorPublico);
  const microfluxosDemo =
    acervoBase.microfluxos && acervoBase.microfluxos.length > 0
      ? acervoBase.microfluxos
      : pagina
        ? criarColecaoMicrofluxosPadraoParaTestes({
            organizacaoId: pagina.organizacaoId,
            nomeOrganizacao: pagina.identidade.nomeExibicao,
            servicos: acervoBase.servicos,
            agoraIso: pagina.atualizadoEmIso,
          })
        : [];

  return {
    ...acervoBase,
    microfluxos: microfluxosDemo,
  };
}

export function listarDemonstracoesEditoriais(): readonly ConteudoPaginaPublicada[] {
  return Object.values(CATALOGO_DEMONSTRACOES_EDITORIAIS);
}
