import type { ReactNode } from "react";
import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Building,
  Calculator,
  Calendar,
  Camera,
  Car,
  CheckCircle,
  Clock,
  Compass,
  CreditCard,
  DollarSign,
  FileText,
  FolderKanban,
  Headphones,
  HeartHandshake,
  HelpCircle,
  Home,
  Info,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
  Send,
  Shield,
  ShoppingBag,
  Sliders,
  Sparkles,
  Star,
  Tag,
  Truck,
  User,
  Users,
  Video,
  Wrench,
} from "lucide-react";

export interface ItemCatalogoIcone {
  readonly id: string;
  readonly rotulo: string;
  readonly palavrasChave: readonly string[];
  readonly componente: (props: {
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }) => ReactNode;
}

export const CATALOGO_ICONES_ACOES: readonly ItemCatalogoIcone[] = [
  {
    id: "automatico",
    rotulo: "Automático",
    palavrasChave: ["auto", "inteligente", "destino", "padrao"],
    componente: (props) => <Sparkles {...props} />,
  },
  {
    id: "whatsapp",
    rotulo: "WhatsApp",
    palavrasChave: ["whats", "zap", "mensagem", "conversa", "chat", "contato"],
    componente: (props) => <MessageCircle {...props} />,
  },
  {
    id: "conectar",
    rotulo: "Atendimento",
    palavrasChave: ["mensagem", "chat", "falar", "consultor", "duvida"],
    componente: (props) => <MessageSquare {...props} />,
  },
  {
    id: "telefone",
    rotulo: "Telefone",
    palavrasChave: ["ligar", "fone", "chamada", "contato"],
    componente: (props) => <Phone {...props} />,
  },
  {
    id: "email",
    rotulo: "E-mail",
    palavrasChave: ["correio", "mensagem", "carta", "contato"],
    componente: (props) => <Mail {...props} />,
  },
  {
    id: "enviar",
    rotulo: "Enviar",
    palavrasChave: ["mandar", "direcionar", "submeter", "telegram"],
    componente: (props) => <Send {...props} />,
  },
  {
    id: "servicos",
    rotulo: "Serviços",
    palavrasChave: ["manutencao", "oficina", "ajuste", "ferramenta", "conserto"],
    componente: (props) => <Wrench {...props} />,
  },
  {
    id: "catalogo",
    rotulo: "Catálogo",
    palavrasChave: ["produtos", "estoque", "caixa", "itens", "veiculos"],
    componente: (props) => <Package {...props} />,
  },
  {
    id: "loja",
    rotulo: "Loja / Peças",
    palavrasChave: ["sacola", "comprar", "compras", "varejo"],
    componente: (props) => <ShoppingBag {...props} />,
  },
  {
    id: "carro",
    rotulo: "Veículos",
    palavrasChave: ["carro", "automovel", "garagem", "veiculo", "auto"],
    componente: (props) => <Car {...props} />,
  },
  {
    id: "caminhao",
    rotulo: "Entrega / Frete",
    palavrasChave: ["entrega", "transporte", "logistica", "envio"],
    componente: (props) => <Truck {...props} />,
  },
  {
    id: "portfolio",
    rotulo: "Portfólio",
    palavrasChave: ["projetos", "pasta", "trabalhos", "cases", "obras"],
    componente: (props) => <FolderKanban {...props} />,
  },
  {
    id: "equipe",
    rotulo: "Equipe",
    palavrasChave: ["profissionais", "especialistas", "pessoas", "membros", "time"],
    componente: (props) => <Users {...props} />,
  },
  {
    id: "usuario",
    rotulo: "Profissional",
    palavrasChave: ["perfil", "pessoa", "doutor", "consultor", "atendente"],
    componente: (props) => <User {...props} />,
  },
  {
    id: "agendamento",
    rotulo: "Agenda",
    palavrasChave: ["calendario", "data", "horario", "marcar", "visita"],
    componente: (props) => <Calendar {...props} />,
  },
  {
    id: "relogio",
    rotulo: "Horários",
    palavrasChave: ["hora", "tempo", "atendimento", "funcionamento"],
    componente: (props) => <Clock {...props} />,
  },
  {
    id: "mapa",
    rotulo: "Localização",
    palavrasChave: ["mapa", "endereco", "onde", "chegar", "cidade", "ponto"],
    componente: (props) => <MapPin {...props} />,
  },
  {
    id: "imovel",
    rotulo: "Espaço / Sede",
    palavrasChave: ["casa", "imovel", "estudio", "clinica", "escritorio"],
    componente: (props) => <Home {...props} />,
  },
  {
    id: "empresa",
    rotulo: "Institucional",
    palavrasChave: ["predio", "empresa", "corporativo", "edificio"],
    componente: (props) => <Building {...props} />,
  },
  {
    id: "documento",
    rotulo: "Formulário",
    palavrasChave: ["arquivo", "documento", "ficha", "inscricao", "dados"],
    componente: (props) => <FileText {...props} />,
  },
  {
    id: "cotacao",
    rotulo: "Cotação",
    palavrasChave: ["calculadora", "simulacao", "calculo", "estimativa", "preco"],
    componente: (props) => <Calculator {...props} />,
  },
  {
    id: "preco",
    rotulo: "Tabela de Preço",
    palavrasChave: ["valor", "moeda", "dinheiro", "investimento", "cifrao"],
    componente: (props) => <DollarSign {...props} />,
  },
  {
    id: "etiqueta",
    rotulo: "Ofertas / Planos",
    palavrasChave: ["tag", "etiqueta", "desconto", "promocao", "condicao"],
    componente: (props) => <Tag {...props} />,
  },
  {
    id: "cartao",
    rotulo: "Pagamento",
    palavrasChave: ["cartao", "credito", "pix", "pagar", "financiamento"],
    componente: (props) => <CreditCard {...props} />,
  },
  {
    id: "estrela",
    rotulo: "Destaque",
    palavrasChave: ["estrela", "favorito", "vip", "especial", "premium"],
    componente: (props) => <Star {...props} />,
  },
  {
    id: "premio",
    rotulo: "Garantia / Prêmio",
    palavrasChave: ["award", "trofeu", "qualidade", "certificado", "selo"],
    componente: (props) => <Award {...props} />,
  },
  {
    id: "seguranca",
    rotulo: "Segurança",
    palavrasChave: ["escudo", "protecao", "garantia", "blindagem", "seguro"],
    componente: (props) => <Shield {...props} />,
  },
  {
    id: "sucesso",
    rotulo: "Vistoria / Checklist",
    palavrasChave: ["check", "confirmado", "aprovado", "concluido", "laudo"],
    componente: (props) => <CheckCircle {...props} />,
  },
  {
    id: "consultoria",
    rotulo: "Consultoria",
    palavrasChave: ["maleta", "negocios", "empresa", "b2b", "corporativo"],
    componente: (props) => <Briefcase {...props} />,
  },
  {
    id: "parceria",
    rotulo: "Parcerias",
    palavrasChave: ["aperto", "mao", "socio", "acordo", "alianca"],
    componente: (props) => <HeartHandshake {...props} />,
  },
  {
    id: "suporte",
    rotulo: "Suporte / SAC",
    palavrasChave: ["fone", "ouvidoria", "central", "ajuda", "headset"],
    componente: (props) => <Headphones {...props} />,
  },
  {
    id: "duvidas",
    rotulo: "Dúvidas / FAQ",
    palavrasChave: ["ajuda", "pergunta", "interrogacao", "faq", "info"],
    componente: (props) => <HelpCircle {...props} />,
  },
  {
    id: "informacao",
    rotulo: "Informações",
    palavrasChave: ["sobre", "detalhes", "aviso", "nota"],
    componente: (props) => <Info {...props} />,
  },
  {
    id: "guia",
    rotulo: "Explorar / Guia",
    palavrasChave: ["bussola", "direcao", "guia", "roteiro", "norte"],
    componente: (props) => <Compass {...props} />,
  },
  {
    id: "camadas",
    rotulo: "Módulos / Etapas",
    palavrasChave: ["layers", "niveis", "pacotes", "estruturas"],
    componente: (props) => <Layers {...props} />,
  },
  {
    id: "ajustes",
    rotulo: "Configurador",
    palavrasChave: ["personalizar", "sliders", "filtros", "opcoes"],
    componente: (props) => <Sliders {...props} />,
  },
  {
    id: "fotos",
    rotulo: "Galeria / Fotos",
    palavrasChave: ["camera", "imagens", "fotografia", "ensaios", "cliques"],
    componente: (props) => <Camera {...props} />,
  },
  {
    id: "video",
    rotulo: "Vídeo / Tour",
    palavrasChave: ["filmagem", "tour", "apresentacao", "cinema"],
    componente: (props) => <Video {...props} />,
  },
  {
    id: "link",
    rotulo: "Link Externo",
    palavrasChave: ["site", "portal", "externo", "abrir", "navegador"],
    componente: (props) => <ArrowUpRight {...props} />,
  },
  {
    id: "avancar",
    rotulo: "Avançar",
    palavrasChave: ["proximo", "seguir", "seta", "iniciar"],
    componente: (props) => <ArrowRight {...props} />,
  },
];

export const MAPA_ICONES_POR_ID: Readonly<Record<string, ItemCatalogoIcone>> = Object.fromEntries(
  CATALOGO_ICONES_ACOES.map((item) => [item.id, item]),
);
