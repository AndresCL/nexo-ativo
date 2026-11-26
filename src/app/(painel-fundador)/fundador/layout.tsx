import type { Metadata } from "next";
import type { ReactNode } from "react";
import { exigirSessaoFundadorServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { EstruturaNavegacaoFundador } from "@/componentes/fundador/EstruturaNavegacaoFundador";

export const metadata: Metadata = {
  title: "Painel Fundador",
  robots: { index: false, follow: false },
};

export default async function LayoutPainelFundador({ children }: { readonly children: ReactNode }) {
  const fundador = await exigirSessaoFundadorServidor();

  return (
    <EstruturaNavegacaoFundador emailUsuario={fundador.email}>
      {children}
    </EstruturaNavegacaoFundador>
  );
}
