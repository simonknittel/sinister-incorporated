import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@tanstack/query/recommended",
  ),

  {
    ignores: [
      ".next/**",
      "scripts/**",
      "build/**",
      "node_modules/**",
      "out/**",
      "tailwind.config.ts",
      "vitest.config.ts",
      "next-env.d.ts",
      "postcss.config.cjs",
      "prettier.config.mjs",
    ],
  },

  ...compat.config({
    plugins: ["@typescript-eslint", "react-compiler"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: true,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "react-compiler/react-compiler": "error",

      "@typescript-eslint/prefer-nullish-coalescing": "off",

      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-expect-error": true,
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-check": false,
        },
      ],

      // https://github.com/orgs/react-hook-form/discussions/8622
      "@typescript-eslint/no-misused-promises": [
        2,
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
    },
  }),
];

export default eslintConfig;
