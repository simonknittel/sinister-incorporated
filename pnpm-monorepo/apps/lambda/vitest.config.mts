import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"],
        },
      },
      {
        /**
         * Runs the jobs against a real PostgreSQL with all migrations (see
         * `@sam-monorepo/application/test/postgres`). The files share one
         * database, thus they run one after the other.
         */
        test: {
          name: "integration",
          include: ["src/**/*.integration.test.ts"],
          globalSetup: ["@sam-monorepo/application/test/postgres"],
          setupFiles: ["@sam-monorepo/application/test/databaseUrl"],
          fileParallelism: false,
          hookTimeout: 120_000,
          mockReset: true,
          env: {
            // Same as the deployed functions (see the Terraform module)
            TZ: "Europe/Berlin",
            // Keeps AWS X-Ray quiet without a trace context
            ENVIRONMENT: "local",
          },
        },
      },
    ],
  },
});
