import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./testes/configuracaoVitest.ts"],
    include: ["testes/unitario/**/*.test.{ts,tsx}", "testes/integracao/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
  },
});
