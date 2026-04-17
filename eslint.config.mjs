import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      "prefer-const": "off",
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["./*Provider*", "../*Provider*", "./*Context*", "../*Context*"],
              "message": "MİMARİ KURAL: Provider ve Context dosyaları için relative (./ veya ../) import kullanılamaz. Bellekte çift instance ('Duplicate Module Identity') oluşmasını engellemek için HER ZAMAN absolute ('@/...') import yapın."
            }
          ]
        }
      ]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
