interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  VITE_API_URL: string;
  VITE_AUTH_URL: string;
  VITE_BILLING_URL: string;
}
