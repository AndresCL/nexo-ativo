import type { ReactNode } from "react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesMolduraSmartphone {
  readonly children: ReactNode;
  readonly classNameFundo?: string;
  readonly classNameMoldura?: string;
  readonly dataTestId?: string;
  readonly dataDispositivo?: string;
}

/**
 * Wrapper reutilizável com fundo cinza e moldura centralizada em largura mobile (390px)
 * simulando a tela de um smartphone.
 */
export function MolduraSmartphone({
  children,
  classNameFundo,
  classNameMoldura,
  dataTestId,
  dataDispositivo,
}: PropriedadesMolduraSmartphone) {
  return (
    <div
      className={combinarClasses(
        "flex min-w-0 justify-center bg-mineral-950 sm:bg-white sm:p-4",
        classNameFundo,
      )}
    >
      <div
        data-testid={dataTestId}
        data-dispositivo={dataDispositivo}
        className={combinarClasses(
          "w-full overflow-x-clip sm:bg-mineral-800 sm:overflow-x-hidden sm:overflow-y-auto sm:overscroll-contain sm:max-h-[min(840px,calc(100dvh-3rem))] sm:max-w-[398px] sm:rounded-[2rem] sm:border-4 sm:border-mineral-800 sm:shadow-2xl sm:[scrollbar-width:thin]",
          classNameMoldura,
        )}
      >
        {children}
      </div>
    </div>
  );
}

