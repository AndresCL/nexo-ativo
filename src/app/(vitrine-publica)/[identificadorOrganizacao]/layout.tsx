import type { ReactNode } from "react";

export default function LayoutVitrinePublica({ children }: { readonly children: ReactNode }) {
  return <div className="min-h-dvh bg-mineral-950 text-marfim-100">{children}</div>;
}
