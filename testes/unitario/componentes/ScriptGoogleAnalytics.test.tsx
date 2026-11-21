import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deveCarregarGoogleAnalytics,
  ScriptGoogleAnalytics,
} from "@/componentes/analytics/ScriptGoogleAnalytics";
import {
  lerConfiguracaoAmbientePublico,
  normalizarMeasurementIdGoogleAnalytics,
} from "@/validacoes/ambiente";

vi.mock("next/script", () => ({
  default: ({
    id,
    src,
    strategy,
    children,
  }: {
    id?: string;
    src?: string;
    strategy?: string;
    children?: string;
  }) => (
    <div
      data-testid={id}
      data-src={src ?? ""}
      data-strategy={strategy ?? ""}
      data-conteudo={typeof children === "string" ? children : ""}
    />
  ),
}));

describe("normalizarMeasurementIdGoogleAnalytics e ambiente público", () => {
  const measurementIdOriginal = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  afterEach(() => {
    if (measurementIdOriginal === undefined) {
      delete process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
    } else {
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = measurementIdOriginal;
    }
  });

  it("aceita Measurement ID válido e remove espaços laterais", () => {
    expect(normalizarMeasurementIdGoogleAnalytics("G-ENHD6E997Z")).toBe("G-ENHD6E997Z");
    expect(normalizarMeasurementIdGoogleAnalytics("  G-ABC123XYZ  ")).toBe("G-ABC123XYZ");
  });

  it("retorna undefined de forma fail-safe para valores ausentes, vazios ou malformados", () => {
    expect(normalizarMeasurementIdGoogleAnalytics(undefined)).toBeUndefined();
    expect(normalizarMeasurementIdGoogleAnalytics("")).toBeUndefined();
    expect(normalizarMeasurementIdGoogleAnalytics("   ")).toBeUndefined();
    expect(normalizarMeasurementIdGoogleAnalytics("UA-12345-1")).toBeUndefined();
    expect(normalizarMeasurementIdGoogleAnalytics("G-123';alert(1)//")).toBeUndefined();
  });

  it("não quebra lerConfiguracaoAmbientePublico quando a variável está malformada", () => {
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = "valor-invalido";
    const configuracao = lerConfiguracaoAmbientePublico();
    expect(configuracao.measurementId).toBeUndefined();
  });

  it("expõe measurementId válido em lerConfiguracaoAmbientePublico", () => {
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = "G-ENHD6E997Z";
    const configuracao = lerConfiguracaoAmbientePublico();
    expect(configuracao.measurementId).toBe("G-ENHD6E997Z");
  });
});

describe("ScriptGoogleAnalytics", () => {
  it("só ativa quando em produção com measurementId definido", () => {
    expect(deveCarregarGoogleAnalytics("G-ENHD6E997Z", "production")).toBe(true);
    expect(deveCarregarGoogleAnalytics("G-ENHD6E997Z", "development")).toBe(false);
    expect(deveCarregarGoogleAnalytics("G-ENHD6E997Z", "test")).toBe(false);
    expect(deveCarregarGoogleAnalytics(undefined, "production")).toBe(false);
  });

  it("não renderiza scripts fora de produção", () => {
    const { container } = render(
      <ScriptGoogleAnalytics measurementId="G-ENHD6E997Z" ambienteNode="development" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("não renderiza scripts em produção quando measurementId está ausente", () => {
    const { container } = render(
      <ScriptGoogleAnalytics measurementId={undefined} ambienteNode="production" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza os dois scripts do GA4 com strategy afterInteractive em produção", () => {
    const { getByTestId } = render(
      <ScriptGoogleAnalytics measurementId="G-ENHD6E997Z" ambienteNode="production" />,
    );

    const scriptExterno = getByTestId("nexo-ga4-gtag-src");
    expect(scriptExterno).toHaveAttribute(
      "data-src",
      "https://www.googletagmanager.com/gtag/js?id=G-ENHD6E997Z",
    );
    expect(scriptExterno).toHaveAttribute("data-strategy", "afterInteractive");

    const scriptInicializacao = getByTestId("nexo-ga4-gtag-init");
    expect(scriptInicializacao).toHaveAttribute("data-strategy", "afterInteractive");
    expect(scriptInicializacao.getAttribute("data-conteudo")).toContain(
      `window.gtag('config', "G-ENHD6E997Z")`,
    );
    expect(scriptInicializacao.getAttribute("data-conteudo")).toContain(
      "window.__nexoGa4Inicializado",
    );
  });
});

