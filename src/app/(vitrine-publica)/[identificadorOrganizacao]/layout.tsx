import type { ReactNode } from "react";
import { MolduraSmartphone } from "@/componentes/editorial/MolduraSmartphone";

export default function LayoutVitrinePublica({ children }: { readonly children: ReactNode }) {
  return (
    <MolduraSmartphone
      classNameFundo="min-h-dvh items-start py-0 sm:py-6"
      classNameMoldura="min-h-dvh sm:min-h-[calc(100dvh-3rem)] bg-mineral-950 text-marfim-100"
    >
      {children}
    </MolduraSmartphone>
  );
}
