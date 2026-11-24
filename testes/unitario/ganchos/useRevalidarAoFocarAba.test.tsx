import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

import { useRevalidarAoFocarAba } from "@/ganchos/useRevalidarAoFocarAba";

describe("useRevalidarAoFocarAba", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-23T12:00:00.000Z"));
    refreshMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("chama router.refresh ao focar a aba respeitando o intervalo mínimo de cooldown", () => {
    const { unmount } = renderHook(() => useRevalidarAoFocarAba({ intervaloMinimoMs: 15_000 }));

    // Dentro do cooldown inicial de 15s: não dispara
    act(() => {
      vi.advanceTimersByTime(5_000);
      window.dispatchEvent(new Event("focus"));
    });
    expect(refreshMock).not.toHaveBeenCalled();

    // Após 15s: dispara uma vez
    act(() => {
      vi.advanceTimersByTime(11_000);
      window.dispatchEvent(new Event("focus"));
    });
    expect(refreshMock).toHaveBeenCalledTimes(1);

    // Novo foco imediato: bloqueado pelo cooldown
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(refreshMock).toHaveBeenCalledTimes(1);

    // Após novo cooldown e visibilitychange: dispara novamente
    act(() => {
      vi.advanceTimersByTime(16_000);
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(refreshMock).toHaveBeenCalledTimes(2);

    unmount();
  });
});

