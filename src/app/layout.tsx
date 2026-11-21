import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cormorant";
import "@fontsource-variable/plus-jakarta-sans";
import "@/estilos/globais.css";
import type { ReactNode } from "react";
import { CentralNotificacoes } from "@/componentes/interface/notificacoes/CentralNotificacoes";

export const metadata: Metadata = {
  title: {
    default: "Nexo Ativo — Presença Digital Editorial e Microfluxos Comerciais",
    template: "%s | Nexo Ativo",
  },
  description:
    "Plataforma brasileira de presença digital editorial premium com portfólio, cartões profissionais e microfluxos comerciais interativos.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f1110",
};

export default function LayoutRaiz({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <CentralNotificacoes />
      </body>
    </html>
  );
}
