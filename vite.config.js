import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    // dev specific config
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 4200,
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
});
