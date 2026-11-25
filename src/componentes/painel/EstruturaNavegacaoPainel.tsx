"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import {
  BarChart3,
  CalendarDays,
  Compass,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Menu,
  Package,
  Palette,
  QrCode,
  Settings,
  ShieldCheck,
  Users,
  Video,
  Wrench,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useEstadoInterfacePainel } from "@/estados/estadoInterfacePainel";
import { MenuRodapeUsuario } from "@/componentes/painel/MenuRodapeUsuario";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";
import { Botao } from "@/componentes/interface/Botao";
import { TransicaoPaginaPainel } from "@/componentes/interface/TransicaoPaginaPainel";

interface ItemNavegacaoPainel {
  readonly rotulo: string;
  readonly caminho: string;
  readonly icone: ReactNode;
}

export interface PropriedadesEstruturaNavegacaoPainel {
  readonly children: ReactNode;
  readonly nomeOrganizacaoAtiva?: string;
  readonly nomeUsuario?: string | null;
  readonly emailUsuario?: string | null;
  readonly urlLogotipoOrganizacao?: string | null;
  readonly totalSolicitacoesNovas?: number;
  readonly totalAgendamentosConfirmados?: number;
  readonly ehFundador?: boolean;
}

const ITENS_MENU_PAINEL: readonly ItemNavegacaoPainel[] = [
  {
    rotulo: "Visão geral",
    caminho: "/painel",
    icone: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Aparência e página",
    caminho: "/painel/aparencia",
    icone: <Palette className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Produtos",
    caminho: "/painel/produtos",
    icone: <Package className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Serviços",
    caminho: "/painel/servicos",
    icone: <Wrench className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Portfólio",
    caminho: "/painel/portfolio",
    icone: <FolderKanban className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Vídeos",
    caminho: "/painel/videos",
    icone: <Video className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Equipe e cartões",
    caminho: "/painel/equipe",
    icone: <Users className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Experiências interativas",
    caminho: "/painel/experiencias",
    icone: <Compass className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Agenda",
    caminho: "/painel/agenda",
    icone: <CalendarDays className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Solicitações",
    caminho: "/painel/solicitacoes",
    icone: <Inbox className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Desempenho",
    caminho: "/painel/desempenho",
    icone: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "QR Codes",
    caminho: "/painel/qr-codes",
    icone: <QrCode className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Plano e faturamento",
    caminho: "/painel/assinatura",
    icone: <Settings className="h-4 w-4" aria-hidden="true" />,
  },
];

function ListaLinksNavegacao({
  aoSelecionar,
  totalSolicitacoesNovas = 0,
  totalAgendamentosConfirmados = 0,
  contraido = false,
}: {
  readonly aoSelecionar?: () => void;
  readonly totalSolicitacoesNovas?: number;
  readonly totalAgendamentosConfirmados?: number;
  readonly contraido?: boolean;
}) {
  const caminhoAtual = usePathname();

  return (
    <nav aria-label="Navegação principal do painel" className="flex flex-col gap-1">
      {ITENS_MENU_PAINEL.map((item) => {
        const ativo =
          item.rotulo === "Visão geral"
            ? caminhoAtual === "/painel"
            : item.caminho !== "/painel" && caminhoAtual.startsWith(item.caminho);
        const ehItemSolicitacoes = item.caminho === "/painel/solicitacoes";
        const ehItemAgenda = item.caminho === "/painel/agenda";
        const temBadge =
          (ehItemSolicitacoes && totalSolicitacoesNovas > 0) ||
          (ehItemAgenda && totalAgendamentosConfirmados > 0);

        return (
          <Link
            key={item.rotulo}
            href={item.caminho}
            onClick={aoSelecionar}
            title={contraido ? item.rotulo : undefined}
            aria-label={contraido ? item.rotulo : undefined}
            aria-current={ativo ? "page" : undefined}
            className={`relative flex min-h-10 items-center justify-between overflow-hidden rounded-lg px-3 py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-mineral-950 ${
              ativo
                ? "bg-mineral-950 font-medium text-white shadow-2xs"
                : "text-mineral-600 hover:bg-mineral-100/80 hover:text-mineral-950"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex w-5 shrink-0 items-center justify-center">{item.icone}</span>
              <span
                className={`whitespace-nowrap transition-opacity duration-150 ${
                  contraido ? "opacity-0" : "opacity-100"
                }`}
              >
                {item.rotulo}
              </span>
            </div>

            {contraido ? (
              temBadge ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600"
                />
              ) : null
            ) : ehItemSolicitacoes && totalSolicitacoesNovas > 0 ? (
              <span
                data-testid="badge-solicitacoes-novas"
                aria-label={`${totalSolicitacoesNovas} novas solicitações`}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-semibold text-white shadow-xs"
              >
                {totalSolicitacoesNovas > 99 ? "99+" : totalSolicitacoesNovas}
              </span>
            ) : ehItemAgenda && totalAgendamentosConfirmados > 0 ? (
              <span
                data-testid="badge-agenda-reservas"
                aria-label={`${totalAgendamentosConfirmados} reservas confirmadas`}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-semibold text-white shadow-xs"
              >
                {totalAgendamentosConfirmados > 99 ? "99+" : totalAgendamentosConfirmados}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function EstruturaNavegacaoPainel({
  children,
  nomeOrganizacaoAtiva,
  nomeUsuario,
  emailUsuario,
  urlLogotipoOrganizacao,
  totalSolicitacoesNovas = 0,
  totalAgendamentosConfirmados = 0,
  ehFundador = false,
}: PropriedadesEstruturaNavegacaoPainel) {
  const menuAberto = useEstadoInterfacePainel((estado) => estado.menuLateralAbertoMobile);
  const alternarMenu = useEstadoInterfacePainel((estado) => estado.alternarMenuLateralMobile);
  const fecharMenu = useEstadoInterfacePainel((estado) => estado.fecharMenuLateralMobile);
  const [menuDesktopExpandido, setMenuDesktopExpandido] = useState(false);
  const menuContraido = !menuDesktopExpandido;
  const totalPendenciasMenu = totalSolicitacoesNovas + totalAgendamentosConfirmados;

  return (
    <div className="fundo-painel flex min-h-dvh flex-col lg:flex-row">
      <header className="fundo-menu-painel flex items-center justify-between border-b border-slate-200/60 px-4 py-3 lg:hidden">
        <div>
          <Link href="/painel" className="text-mineral-950">
            <LogoNexoAtivo tamanho="compacto" />
          </Link>
          {nomeOrganizacaoAtiva ? (
            <p className="text-xs text-mineral-500">{nomeOrganizacaoAtiva}</p>
          ) : null}
        </div>

        <DialogoPrimitivo.Root open={menuAberto} onOpenChange={alternarMenu}>
          <DialogoPrimitivo.Trigger asChild>
            <Botao
              variante="fantasma"
              tamanho="compacto"
              aria-label="Abrir menu do painel"
              className="relative"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              {totalPendenciasMenu > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {totalPendenciasMenu > 99 ? "99+" : totalPendenciasMenu}
                </span>
              ) : null}
            </Botao>
          </DialogoPrimitivo.Trigger>

          <DialogoPrimitivo.Portal>
            <DialogoPrimitivo.Overlay className="animacao-overlay-dialogo fixed inset-0 z-40 bg-mineral-950/45" />
            <DialogoPrimitivo.Content className="fundo-menu-painel animacao-gaveta-esquerda fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto overscroll-contain p-5 shadow-lg">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <DialogoPrimitivo.Title className="text-xl font-bold tracking-tight text-mineral-950">
                    {nomeOrganizacaoAtiva ?? "Painel do Assinante"}
                  </DialogoPrimitivo.Title>
                  <DialogoPrimitivo.Close asChild>
                    <Botao variante="fantasma" tamanho="compacto" aria-label="Fechar menu">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Botao>
                  </DialogoPrimitivo.Close>
                </div>

                <DialogoPrimitivo.Description className="sr-only">
                  Acesse as seções de configuração da sua presença digital e solicitações recebidas.
                </DialogoPrimitivo.Description>

                <ListaLinksNavegacao
                  aoSelecionar={fecharMenu}
                  totalSolicitacoesNovas={totalSolicitacoesNovas}
                  totalAgendamentosConfirmados={totalAgendamentosConfirmados}
                />
              </div>

              <div className="border-t border-slate-200/60 pt-4">
                <MenuRodapeUsuario
                  nomeUsuario={nomeUsuario}
                  emailUsuario={emailUsuario}
                  urlLogotipoOrganizacao={urlLogotipoOrganizacao}
                  aoClicarLink={fecharMenu}
                />
              </div>
            </DialogoPrimitivo.Content>
          </DialogoPrimitivo.Portal>
        </DialogoPrimitivo.Root>
      </header>

      {/* Espaçador fixo no fluxo para o conteúdo principal nunca pular no hover */}
      <div className="hidden w-[72px] shrink-0 lg:block" aria-hidden="true" />

      <aside
        onMouseEnter={() => setMenuDesktopExpandido(true)}
        onMouseLeave={() => setMenuDesktopExpandido(false)}
        onFocus={() => setMenuDesktopExpandido(true)}
        onBlur={(evento) => {
          if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) {
            setMenuDesktopExpandido(false);
          }
        }}
        className={`fundo-menu-painel fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200/60 transition-[width,box-shadow] duration-200 ease-out lg:flex ${
          menuContraido ? "w-[72px] shadow-none" : "w-64 shadow-xl"
        }`}
      >
        <div className="flex h-full w-full flex-col justify-between gap-4 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-5">
          <div className="flex flex-col gap-5">
            <div className="min-h-12 overflow-hidden px-2">
              <Link
                href="/painel"
                title="Nexo Ativo"
                className="inline-flex items-center whitespace-nowrap text-mineral-950"
              >
                <LogoNexoAtivo tamanho="padrao" exibirTexto={!menuContraido} />
              </Link>
              <div
                className={`transition-opacity duration-150 ${
                  menuContraido ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
                aria-hidden={menuContraido}
              >
                <p className="mt-0.5 truncate text-xs font-medium text-mineral-700">
                  {nomeOrganizacaoAtiva ?? "Configuração inicial"}
                </p>
                {ehFundador ? (
                  <Link
                    href="/fundador"
                    className="mt-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-mineral-300 bg-mineral-100/90 px-2.5 py-1 text-[11px] font-semibold text-mineral-900 transition-colors hover:bg-mineral-200"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Painel Fundador</span>
                  </Link>
                ) : null}
              </div>
            </div>

            <ListaLinksNavegacao
              totalSolicitacoesNovas={totalSolicitacoesNovas}
              totalAgendamentosConfirmados={totalAgendamentosConfirmados}
              contraido={menuContraido}
            />
          </div>

          <div className="border-t border-slate-200/60 pt-4">
            <MenuRodapeUsuario
              nomeUsuario={nomeUsuario}
              emailUsuario={emailUsuario}
              urlLogotipoOrganizacao={urlLogotipoOrganizacao}
              contraido={menuContraido}
            />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <TransicaoPaginaPainel>{children}</TransicaoPaginaPainel>
      </main>
    </div>
  );
}
