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
  VITE_PORTAL_URL: string;
  VITE_DEBUG: string;
  VITE_SENTRY_DSN: string;
  VITE_ORIGIN: string;
  VITE_TUNA_ENABLED: string;
  VITE_MINTLIFY_CHAT_KEY: string;
  VITE_STRIPE_PUBLISHABLE_KEY: string;
  VITE_FEATURE_BETA_ORG_IDS: string;
  VITE_TOKEN_HEADER_ORG_IDS: string;
}
