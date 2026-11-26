"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { LayoutDashboard, LogOut, Menu, ShieldCheck, Wallet, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { servicoAutenticacaoCliente } from "@/infraestrutura/firebase/servicoAutenticacaoCliente";
import { Botao } from "@/componentes/interface/Botao";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";
import { TransicaoPaginaPainel } from "@/componentes/interface/TransicaoPaginaPainel";

interface ItemNavegacaoFundador {
  readonly rotulo: string;
  readonly caminho: string;
  readonly icone: ReactNode;
  readonly correspondenciaExata?: boolean;
}

export interface PropriedadesEstruturaNavegacaoFundador {
  readonly children: ReactNode;
  readonly emailUsuario?: string | null;
}

const ITENS_MENU_FUNDADOR: readonly ItemNavegacaoFundador[] = [
  {
    rotulo: "Painel Fundador",
    caminho: "/fundador",
    icone: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
    correspondenciaExata: true,
  },
  {
    rotulo: "Financeiro e Gastos",
    caminho: "/fundador/financeiro",
    icone: <Wallet className="h-4 w-4" aria-hidden="true" />,
  },
  {
    rotulo: "Painel do Assinante",
    caminho: "/painel",
    icone: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
  },
];

function ListaLinksFundador({
  aoSelecionar,
  contraido = false,
}: {
  readonly aoSelecionar?: () => void;
  readonly contraido?: boolean;
}) {
  const caminhoAtual = usePathname();

  return (
    <nav aria-label="Navegação do painel fundador" className="flex flex-col gap-1">
      {ITENS_MENU_FUNDADOR.map((item) => {
        const ativo = item.correspondenciaExata
          ? caminhoAtual === item.caminho
          : caminhoAtual === item.caminho || caminhoAtual.startsWith(`${item.caminho}/`);

        return (
          <Link
            key={item.caminho}
            href={item.caminho}
            onClick={aoSelecionar}
            title={contraido ? item.rotulo : undefined}
            aria-label={contraido ? item.rotulo : undefined}
            aria-current={ativo ? "page" : undefined}
            className={`relative flex min-h-10 items-center overflow-hidden rounded-lg px-3 py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-mineral-950 ${
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
          </Link>
        );
      })}
    </nav>
  );
}

function RodapeSessaoFundador({
  emailUsuario,
  contraido = false,
}: {
  readonly emailUsuario?: string | null;
  readonly contraido?: boolean;
}) {
  const navegador = useRouter();
  const [encerrando, setEncerrando] = useState(false);

  async function executarLogout() {
    setEncerrando(true);
    try {
      await servicoAutenticacaoCliente.encerrarSessao();
      navegador.push("/entrar");
      navegador.refresh();
    } finally {
      setEncerrando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {emailUsuario ? (
        <p
          className={`truncate px-2 text-xs text-mineral-500 transition-opacity duration-150 ${
            contraido ? "pointer-events-none h-0 overflow-hidden opacity-0" : "opacity-100"
          }`}
          aria-hidden={contraido}
          title={emailUsuario}
        >
          {emailUsuario}
        </p>
      ) : null}

      <button
        type="button"
        onClick={executarLogout}
        disabled={encerrando}
        title={contraido ? "Sair da conta" : undefined}
        aria-label={contraido ? "Sair da conta" : undefined}
        className="flex min-h-10 w-full items-center overflow-hidden rounded-lg border border-marfim-300 bg-white px-3 py-2 text-sm font-medium text-mineral-700 transition-colors duration-200 hover:bg-marfim-100 hover:text-mineral-950 disabled:opacity-60"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex w-5 shrink-0 items-center justify-center">
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </span>
          <span
            className={`whitespace-nowrap transition-opacity duration-150 ${
              contraido ? "opacity-0" : "opacity-100"
            }`}
          >
            {encerrando ? "Saindo..." : "Sair da conta"}
          </span>
        </div>
      </button>
    </div>
  );
}

export function EstruturaNavegacaoFundador({
  children,
  emailUsuario,
}: PropriedadesEstruturaNavegacaoFundador) {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [menuDesktopExpandido, setMenuDesktopExpandido] = useState(false);
  const menuContraido = !menuDesktopExpandido;

  return (
    <div className="fundo-painel flex min-h-dvh flex-col lg:flex-row">
      <header className="fundo-menu-painel flex items-center justify-between border-b border-slate-200/60 px-4 py-3 lg:hidden">
        <div>
          <Link href="/fundador" className="text-mineral-950">
            <LogoNexoAtivo tamanho="compacto" />
          </Link>
          <p className="text-xs text-mineral-500">Painel Fundador</p>
        </div>

        <DialogoPrimitivo.Root open={menuMobileAberto} onOpenChange={setMenuMobileAberto}>
          <DialogoPrimitivo.Trigger asChild>
            <Botao variante="fantasma" tamanho="compacto" aria-label="Abrir menu do fundador">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Botao>
          </DialogoPrimitivo.Trigger>

          <DialogoPrimitivo.Portal>
            <DialogoPrimitivo.Overlay className="animacao-overlay-dialogo fixed inset-0 z-40 bg-mineral-950/45" />
            <DialogoPrimitivo.Content className="fundo-menu-painel animacao-gaveta-esquerda fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col justify-between gap-4 overflow-y-auto overscroll-contain p-5 shadow-lg">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <DialogoPrimitivo.Title className="text-xl font-bold tracking-tight text-mineral-950">
                    Painel Fundador
                  </DialogoPrimitivo.Title>
                  <DialogoPrimitivo.Close asChild>
                    <Botao variante="fantasma" tamanho="compacto" aria-label="Fechar menu">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Botao>
                  </DialogoPrimitivo.Close>
                </div>

                <DialogoPrimitivo.Description className="sr-only">
                  Navegue entre governança da plataforma, controle financeiro e painel do assinante.
                </DialogoPrimitivo.Description>

                <ListaLinksFundador aoSelecionar={() => setMenuMobileAberto(false)} />
              </div>

              <div className="border-t border-slate-200/60 pt-4">
                <RodapeSessaoFundador emailUsuario={emailUsuario} />
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
                href="/fundador"
                title="Nexo Ativo · Painel Fundador"
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
                  Governança da Plataforma
                </p>
              </div>
            </div>

            <ListaLinksFundador contraido={menuContraido} />
          </div>

          <div className="border-t border-slate-200/60 pt-4">
            <RodapeSessaoFundador emailUsuario={emailUsuario} contraido={menuContraido} />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <TransicaoPaginaPainel>{children}</TransicaoPaginaPainel>
      </main>
    </div>
  );
}

