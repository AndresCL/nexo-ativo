"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import {
  BarChart3,
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
import type { ReactNode } from "react";
import { useEstadoInterfacePainel } from "@/estados/estadoInterfacePainel";
import { BotaoEncerrarSessao } from "@/componentes/autenticacao/BotaoEncerrarSessao";
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
  readonly emailUsuario?: string | null;
  readonly totalSolicitacoesNovas?: number;
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
}: {
  readonly aoSelecionar?: () => void;
  readonly totalSolicitacoesNovas?: number;
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

        return (
          <Link
            key={item.rotulo}
            href={item.caminho}
            onClick={aoSelecionar}
            aria-current={ativo ? "page" : undefined}
            className={`flex min-h-10 items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-indigo-500 ${ativo
                ? "bg-indigo-50 font-semibold text-indigo-700"
                : "text-mineral-600 hover:bg-indigo-50/50 hover:text-indigo-700"
              }`}
          >
            <div className="flex items-center gap-3">
              {item.icone}
              <span>{item.rotulo}</span>
            </div>

            {ehItemSolicitacoes && totalSolicitacoesNovas > 0 ? (
              <span
                data-testid="badge-solicitacoes-novas"
                aria-label={`${totalSolicitacoesNovas} novas solicitações`}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white shadow-xs"
              >
                {totalSolicitacoesNovas > 99 ? "99+" : totalSolicitacoesNovas}
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
  emailUsuario,
  totalSolicitacoesNovas = 0,
  ehFundador = false,
}: PropriedadesEstruturaNavegacaoPainel) {
  const menuAberto = useEstadoInterfacePainel((estado) => estado.menuLateralAbertoMobile);
  const alternarMenu = useEstadoInterfacePainel((estado) => estado.alternarMenuLateralMobile);
  const fecharMenu = useEstadoInterfacePainel((estado) => estado.fecharMenuLateralMobile);

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
              {totalSolicitacoesNovas > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {totalSolicitacoesNovas > 99 ? "99+" : totalSolicitacoesNovas}
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
                />
              </div>

              <div className="border-t border-slate-200/60 pt-4">
                {emailUsuario ? (
                  <p className="mb-2 truncate px-3 text-xs text-mineral-500">{emailUsuario}</p>
                ) : null}
                <BotaoEncerrarSessao />
              </div>
            </DialogoPrimitivo.Content>
          </DialogoPrimitivo.Portal>
        </DialogoPrimitivo.Root>
      </header>

      <aside className="fundo-menu-painel hidden w-64 shrink-0 flex-col gap-4 border-r border-slate-200/60 p-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:overflow-y-auto lg:overscroll-contain">
        <div className="flex flex-col gap-8">
          <div>
            <Link href="/painel" className="inline-block text-mineral-950">
              <LogoNexoAtivo tamanho="padrao" />
            </Link>
            <p className="mt-0.5 truncate text-xs font-medium text-mineral-700">
              {nomeOrganizacaoAtiva ?? "Configuração inicial"}
            </p>
            {ehFundador ? (
              <Link
                href="/fundador"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Painel Fundador</span>
              </Link>
            ) : null}
          </div>

          <ListaLinksNavegacao totalSolicitacoesNovas={totalSolicitacoesNovas} />
        </div>

        <div className="border-t border-slate-200/60 pt-4">
          {emailUsuario ? (
            <p className="mb-2 truncate px-3 text-xs text-mineral-500">{emailUsuario}</p>
          ) : null}
          <BotaoEncerrarSessao />
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <TransicaoPaginaPainel>{children}</TransicaoPaginaPainel>
      </main>
    </div>
  );
}
