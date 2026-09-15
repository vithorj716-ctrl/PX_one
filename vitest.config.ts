import { defineConfig } from "vitest/config";
import path from "node:path";

// Config isolada: os testes de autorização são puros e não usam os plugins do app.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
