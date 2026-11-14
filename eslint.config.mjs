import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const arquivoAtual = fileURLToPath(import.meta.url);
const diretorioAtual = dirname(arquivoAtual);

const compatibilidade = new FlatCompat({
  baseDirectory: diretorioAtual,
});

const configuracaoEslint = [
  ...compatibilidade.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-dev/**",
      "funcoes/node_modules/**",
      "funcoes/dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default configuracaoEslint;
