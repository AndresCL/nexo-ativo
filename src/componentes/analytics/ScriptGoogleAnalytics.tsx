import Script from "next/script";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

export interface PropriedadesScriptGoogleAnalytics {
  readonly measurementId?: string;
  readonly ambienteNode?: string;
}

export function deveCarregarGoogleAnalytics(
  measurementId: string | undefined,
  ambienteNode: string | undefined,
): measurementId is string {
  return ambienteNode === "production" && Boolean(measurementId);
}

/**
 * Carrega o Google Analytics 4 (`gtag.js`) via `next/script` exclusivamente
 * em produção e quando um Measurement ID válido estiver configurado.
 *
 * Deve ser montado apenas nos layouts institucionais/de aquisição (`(marketing)`
 * e `(autenticacao)`), mantendo as vitrines públicas dos assinantes isoladas.
 */
export function ScriptGoogleAnalytics({
  measurementId,
  ambienteNode = process.env.NODE_ENV,
}: PropriedadesScriptGoogleAnalytics = {}) {
  const idMedicao = measurementId ?? lerConfiguracaoAmbientePublico().measurementId;

  if (!deveCarregarGoogleAnalytics(idMedicao, ambienteNode)) {
    return null;
  }

  return (
    <>
      <Script
        id="nexo-ga4-gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(idMedicao)}`}
        strategy="afterInteractive"
      />
      <Script id="nexo-ga4-gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
if (!window.__nexoGa4Inicializado) {
  window.__nexoGa4Inicializado = true;
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  window.gtag('js', new Date());
  window.gtag('config', ${JSON.stringify(idMedicao)});
}`}
      </Script>
    </>
  );
}

