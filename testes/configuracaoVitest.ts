import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { CentralNotificacoes } from "@/componentes/interface/notificacoes/CentralNotificacoes";
import { notificar } from "@/componentes/interface/notificacoes/notificar";

// Mock de ResizeObserver para ambientes de teste (JSDOM) usado por canvas de diagramas (@xyflow/react)
if (typeof globalThis.ResizeObserver === "undefined") {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}

// O JSDOM não fornece DOMMatrixReadOnly. O React Flow consulta m22 para medir o zoom do canvas.
if (typeof window.DOMMatrixReadOnly === "undefined") {
  class MatrizTransformacaoCanvasTeste {
    readonly m22: number;
    constructor(transformacao = "none") {
      const matriz = transformacao
        .match(/^matrix\(([^)]+)\)$/)?.[1]
        ?.split(",")
        .map(Number);
      const escala = transformacao.match(/scale\(([-\d.]+)\)/)?.[1];
      this.m22 = matriz?.[3] ?? (escala ? Number(escala) : 1);
    }
  }
  Object.defineProperty(window, "DOMMatrixReadOnly", {
    configurable: true,
    value: MatrizTransformacaoCanvasTeste,
  });
}

// Reproduz a central montada no layout raiz para os testes de qualquer tela.
beforeEach(() => {
  render(createElement(CentralNotificacoes));
});

afterEach(() => {
  cleanup();
  notificar.limpar();
});
