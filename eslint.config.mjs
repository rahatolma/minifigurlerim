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
              "group": [
                "./*Provider*", "../*Provider*", 
                "./*Context*", "../*Context*",
                "../services/*", "../../services/*",
                "../utils/supabase/*", "../../utils/supabase/*"
              ],
              "message": "MİMARİ KURAL: Provider, Context, Supabase Client ve Core Service dosyaları için relative (./ veya ../) import KULLANILAMAZ. Bellekte çift instance ('Duplicate Module Identity') hata risklerine karşı HER ZAMAN absolute ('@/...') import yapın."
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
