import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableSentrySourcemaps = env.SENTRY_AUTH_TOKEN && env.SENTRY_PROJECT;

  return {
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            chart: ["react-chartjs-2", "chart.js", "chartjs-adapter-luxon"],
            vendor: [
              "@github/webauthn-json",
              "@sentry/react",
              "@stripe/react-stripe-js",
              "@stripe/stripe-js",
              "classnames",
              "debug",
              "react",
              "react-dom",
              "react-router",
              "react-router-dom",
              "starfx",
              "qrcode.react",
            ],
          },
        },
      },
    },
    plugins: [
      react(),
      tsconfigPaths(),
      ...(
        enableSentrySourcemaps
        ? [
            sentryVitePlugin({
              authToken: env.SENTRY_AUTH_TOKEN,
              org: env.SENTRY_ORG || "aptible",
              project: env.SENTRY_PROJECT,
            }),
          ]
        : []
      ),
    ],
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
      reporters: ["basic"],
      env: {
        NODE_OPTIONS: "--no-experimental-fetch",
      },
    },
  };
});
