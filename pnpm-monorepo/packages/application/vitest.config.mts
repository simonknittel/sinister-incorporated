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
         * Runs the use cases against a real PostgreSQL with all migrations
         * (see `test/postgres.ts`). The files share one database, thus they
         * run one after the other. The set of files is empty until the first
         * use case has an integration test.
         */
        test: {
          name: "integration",
          include: ["src/**/*.integration.test.ts"],
          globalSetup: ["./test/postgres.ts"],
          setupFiles: ["./test/databaseUrl.ts"],
          fileParallelism: false,
          hookTimeout: 120_000,
          mockReset: true,
        },
      },
    ],
  },
});
