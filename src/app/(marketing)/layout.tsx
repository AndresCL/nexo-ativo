import type { ReactNode } from "react";

export default function LayoutMarketing({ children }: { readonly children: ReactNode }) {
  return <div className="fundo-painel min-h-dvh text-mineral-950 antialiased">{children}</div>;
}
