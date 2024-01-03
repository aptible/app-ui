import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            chart: ["react-chartjs-2", "chart.js", "chartjs-adapter-luxon"],
            vendor: [
              "@github/webauthn-json",
              "@reduxjs/toolkit",
              "@sentry/react",
              "@stripe/react-stripe-js",
              "@stripe/stripe-js",
              "classnames",
              "debug",
              "react",
              "react-dom",
              "react-redux",
              "react-router",
              "react-router-dom",
              "redux",
              "redux-batched-actions",
              "redux-persist",
              "starfx",
              "qrcode.react",
            ],
          },
        },
      },
    },
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 4200,
    },
    preview: {
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
