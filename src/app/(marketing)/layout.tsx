import type { ReactNode } from "react";
import { ScriptGoogleAnalytics } from "@/componentes/analytics/ScriptGoogleAnalytics";
import { ChatCrisp } from "@/componentes/interface/ChatCrisp";

export default function LayoutMarketing({ children }: { readonly children: ReactNode }) {
  return (
    <div className="fundo-painel min-h-dvh text-mineral-950 antialiased">
      {children}
      <ChatCrisp />
      <ScriptGoogleAnalytics />
    </div>
  );
}
