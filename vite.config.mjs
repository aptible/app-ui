import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 4200,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      env: {
        NODE_OPTIONS: "--no-experimental-fetch",
      },
    },
  };
});
