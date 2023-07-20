// no typedefs exist for this module, common issue apparently: https://stackoverflow.com/a/72375107
declare module "chartjs-adapter-date-fns";

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  VITE_APP_URL: string;
  VITE_API_URL: string;
  VITE_AUTH_URL: string;
  VITE_BILLING_URL: string;
  VITE_LEGACY_DASHBOARD_URL: string;
  VITE_METRIC_TUNNEL_URL: string;
  VITE_DEBUG: string;
  VITE_SENTRY_DSN: string;
  VITE_ORIGIN: string;
  VITE_TUNA_ENABLED: string;
}
