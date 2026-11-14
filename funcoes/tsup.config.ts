import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs"],
  target: "node24",
  clean: true,
  sourcemap: true,
  external: ["firebase-admin", "firebase-functions"],
  noExternal: ["zod"],
});
