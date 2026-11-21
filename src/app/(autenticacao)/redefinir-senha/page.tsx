import { Suspense } from "react";
import { FormularioRedefinirSenha } from "@/componentes/autenticacao/FormularioRedefinirSenha";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

interface PropriedadesPaginaRedefinirSenha {
  readonly searchParams: Promise<{ oobCode?: string }>;
}

async function ConteudoRedefinirSenha({
  searchParams,
}: {
  searchParams: Promise<{ oobCode?: string }>;
}) {
  const parametros = await searchParams;
  const codigoAcao = parametros.oobCode ?? "";

  return <FormularioRedefinirSenha codigoAcao={codigoAcao} />;
}

export default function PaginaRedefinirSenha({ searchParams }: PropriedadesPaginaRedefinirSenha) {
  return (
    <CartaoSuperficie preenchimento="amplo">
      <p className="text-xs tracking-[0.18em] text-mineral-500 uppercase">Segurança da conta</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-mineral-950">Criar nova senha</h1>
      <p className="mt-1.5 mb-6 text-xs leading-relaxed text-mineral-700">
        Digite e confirme a nova senha de acesso para sua conta no Nexo Ativo.
      </p>

      <Suspense fallback={<div className="py-6 text-center text-sm text-mineral-600 animate-pulse">Carregando...</div>}>
        <ConteudoRedefinirSenha searchParams={searchParams} />
      </Suspense>
    </CartaoSuperficie>
  );
}

