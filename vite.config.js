import { defineConfig } from "vitest/config";
import reactRefresh from "@vitejs/plugin-react-refresh";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), tsconfigPaths()],
  server: {
    port: 4200,
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
