import { defineConfig } from "vitest/config";
import path from "node:path";

const TEST_DATABASE_URL =
  "postgresql://tt_app:tt_app_dev@localhost:5432/tt_compare_test?schema=public";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    // Inyecta la BD de test ANTES de que los módulos importen el singleton de Prisma
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      TEST_DATABASE_URL,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
