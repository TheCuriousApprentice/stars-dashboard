import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jsxA11y from "eslint-plugin-jsx-a11y";
import security from "eslint-plugin-security";

const appFiles = ["**/*.{js,jsx,ts,tsx}"];
const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url))
});

export default [
  {
    ignores: [".next/**", "dist/**", "coverage/**", "playwright-report/**", "test-results/**"]
  },
  ...compat.extends("next/core-web-vitals"),
  {
    files: appFiles,
    plugins: {
      "jsx-a11y": jsxA11y,
      security
    },
    rules: {
      complexity: ["error", 8],
      "max-depth": ["error", 4],
      "max-lines-per-function": ["error", 80],
      "max-params": ["error", 4],
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "security/detect-object-injection": "off"
    }
  }
];