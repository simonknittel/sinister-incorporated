import tanstackQuery from "@tanstack/eslint-plugin-query";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// A later configuration object that sets `no-restricted-imports` replaces the
// whole option array of the rule for its files. Thus it spreads this list.
const sharedRestrictedImports = [
  {
    name: "next/link",
    message: "Please use @/modules/common/components/Link instead.",
  },
  {
    name: "@radix-ui/react-popover",
    message: "Please use @/modules/common/components/Popover instead.",
  },
  {
    name: "@base-ui/react/popover",
    message: "Please use @/modules/common/components/PopoverBaseUI instead.",
  },
  {
    name: "@radix-ui/react-tooltip",
    message: "Please use @/modules/common/components/Tooltip instead.",
  },
  {
    name: "@headlessui/react",
    importNames: ["Popover"],
    message: "Please use @/modules/common/components/Popover instead.",
  },
  {
    name: "@headlessui/react",
    importNames: ["Tab", "TabList"],
    message: "Please use @/modules/common/components/tabs instead.",
  },
];

const useCasesOnlyMessage =
  "Use a use case of @sam-monorepo/application. Only src/modules/application and src/modules/auth/server use Prisma.";

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tanstackQuery.configs["flat/recommended"],
  reactYouMightNotNeedAnEffect.configs.recommended,
  prettier,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/",
    "eslint.config.mjs",
    "postcss.config.cjs",
    "prettier.config.mjs",
    "tailwind.config.ts",
    "vitest.config.mts",
    "**/service-worker.js",
  ]),

  {
    name: "custom-rules",
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "@typescript-eslint/prefer-nullish-coalescing": "off",

      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          // Suppressions must carry a justification; bare ones are flagged.
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": "allow-with-description",
          "ts-check": false,
        },
      ],

      // Some JSX attributes get handlers that return a promise: the URL state
      // setters of nuqs, the `refetch()` of tRPC, the notification mutations
      // and the async items of the command menu. React ignores the promise.
      // In October 2026, 9 attributes in 7 files need this option.
      "@typescript-eslint/no-misused-promises": [
        2,
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],

      "no-restricted-imports": ["error", ...sharedRestrictedImports],

      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration:matches([source.value='zod'], [source.value='zod/mini']) > :matches(ImportSpecifier[imported.name='z'], ImportDefaultSpecifier)",
          message:
            'Use `import * as z from "zod"` (or "zod/mini"). With the named or default import, the client bundle keeps all Zod locales.',
        },
        {
          selector:
            "Program:has(> ExpressionStatement[directive='use client']) ImportDeclaration[source.value='zod'][importKind!='type']",
          message:
            'Use `import * as z from "zod/mini"` in a client module. Full Zod adds about 100 KB to each page that loads the module.',
        },
      ],

      // The React Compiler does not compile a component or a hook with syntax
      // that it does not support yet ("todo") or that stops one of its
      // internal checks ("invariant"). The build of Next.js does not show
      // these components, thus lint must show them.
      // The rules also report server components, but Next.js does not compile
      // server components. There, a rewrite or an `eslint-disable-next-line`
      // with a reason is correct.
      // Lint uses the Babel compiler, but the build uses its Rust port (see
      // `reactCompiler` in next.config.ts). Thus the two can skip different
      // components. After an upgrade of Next.js, examine the client chunks of
      // the build: each compiled component calls the cache of the compiler.
      "react-hooks/todo": "error",
      "react-hooks/invariant": "error",

      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          // This needs to be set to true to make use of the `satisfies never` type guard for `switch` statements exhaustive checks.
          allowNever: true,
        },
      ],
    },
  },

  {
    name: "use-cases-only",
    // The list grows as the modules move to use cases. After the last
    // module it is `src/**` with the ignores
    // `src/modules/application/**` and `src/modules/auth/server/**`.
    files: [
      "src/modules/audit/**",
      "src/modules/mcp-settings/**",
      "src/modules/oauth/**",
      "src/modules/mcp/**",
      "src/app/app/oauth/**",
      "src/app/app/system-log/**",
      "src/app/api/oauth/**",
      "src/app/api/mcp/**",
      "src/app/.well-known/oauth-authorization-server/**",
      "src/app/.well-known/oauth-protected-resource/**",
      "src/modules/roles/**",
      "src/modules/citizen/**",
      "src/modules/iam/**",
      "src/modules/users/**",
      "src/modules/auth/**",
      "src/server/api/routers/citizens/**",
      "src/server/api/routers/citizenLog/**",
      "src/server/api/routers/roles/**",
      "src/server/api/routers/users/**",
      "src/server/api/routers/ai/**",
      "src/app/api/confirm-email/**",
      "src/app/app/roles/**",
      "src/app/app/iam/**",
      "src/app/app/spynet/citizen/**",
      "src/app/app/spynet/notes/page.tsx",
      "src/app/app/spynet/other/page.tsx",
      "src/app/app/spynet/birthdays/page.tsx",
      "src/app/clearance/page.tsx",
      "src/app/email-confirmation/page.tsx",
      "src/modules/silc/**",
      "src/modules/profit-distribution/**",
      "src/modules/tasks/**",
      "src/modules/penalty-points/**",
      "src/modules/leaderboards/**",
      "src/server/api/routers/silc/**",
      "src/app/app/silc/**",
      "src/app/app/sincome/**",
      "src/app/app/tasks/**",
      "src/app/app/penalty-points/**",
      "src/app/app/leaderboards/**",
      "src/modules/events/**",
      "src/modules/event-templates/**",
      "src/modules/discord/**",
      "src/server/api/routers/events/**",
      "src/app/app/events/**",
      "src/modules/wiki/**",
      "src/app/app/wiki/**",
      "src/app/api/wiki/**",
      "src/server/api/routers/wiki/**",
      "src/modules/notifications/**",
      "src/modules/onboarding/**",
      "src/modules/changelog/**",
      "src/modules/read-markers/**",
      "src/modules/dashboard/**",
      "src/modules/apps/**",
      "src/modules/seasonal-events/**",
      "src/modules/uploads/**",
      "src/modules/log-analyzer/**",
      "src/modules/statistics/**",
      "src/modules/documents/**",
      "src/modules/pusher/**",
      "src/modules/eventbridge/**",
      "src/app/api/pusher/**",
      "src/app/api/upload/**",
      "src/server/api/routers/onSiteNotifications/**",
      "src/server/api/routers/logAnalyzer/**",
      "src/app/app/dashboard/**",
      "src/app/app/changelog/**",
      "src/app/app/apps/**",
      "src/app/app/external/**",
      "src/app/app/statistics/**",
      "src/app/app/uploads/**",
      "src/app/app/documents/**",
      "src/app/app/tools/**",
      "src/app/app/account/**",
    ],
    ignores: ["src/modules/auth/server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        ...sharedRestrictedImports,
        { name: "@/db", message: useCasesOnlyMessage },
        {
          name: "@sam-monorepo/database",
          importNames: ["prisma"],
          message: useCasesOnlyMessage,
        },
      ],
    },
  },
]);

export default eslintConfig;
