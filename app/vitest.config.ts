import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: [
        "text", // For the terminal
        "lcov", // For the VSCode extension and browser
      ],
    },
  },
});
