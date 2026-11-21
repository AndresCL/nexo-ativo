import type { ReactNode } from "react";
import { MolduraSmartphone } from "@/componentes/editorial/MolduraSmartphone";

export default function LayoutVitrinePublica({ children }: { readonly children: ReactNode }) {
  return (
    <MolduraSmartphone
      classNameFundo="min-h-dvh items-start sm:items-center py-0 sm:py-6"
      classNameMoldura="min-h-dvh sm:min-h-0 sm:h-[min(840px,calc(100dvh-3rem))] bg-mineral-950 text-marfim-100"
    >
      {children}
    </MolduraSmartphone>
  );
}
