import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // The first renderMarkdown call in each test file initializes shiki and
    // the rest of the unified pipeline — ~4s locally, 6-8s on CI runners.
    // Subsequent tests in the same file reuse it and finish in ms.
    testTimeout: 30000,
  },
});
